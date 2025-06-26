import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface RedditComment {
  id: string;
  body: string;
  created_utc: number;
  subreddit: string;
  score: number;
  permalink: string;
  author: string;
  link_title?: string;
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  created_utc: number;
  subreddit: string;
  score: number;
  permalink: string;
  author: string;
  num_comments: number;
}

export interface RedditUser {
  name: string;
  created_utc: number;
  comment_karma: number;
  link_karma: number;
  total_karma: number;
  verified: boolean;
  is_gold: boolean;
  is_mod: boolean;
}

class RedditApiService {
  private baseUrl = '/api/reddit';
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 20000, // Increased timeout for pagination
      // Removed User-Agent header - browsers forbid setting this header from client-side code
    });

    // Configure retry mechanism
    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               error.code === 'ECONNRESET' ||
               error.code === 'ENOTFOUND' ||
               error.code === 'ECONNABORTED' ||
               error.message.includes('socket hang up');
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.log(`Retrying Reddit API request (attempt ${retryCount}):`, requestConfig.url);
        console.log('Retry error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      },
    });
  }

  private async makeRequest(url: string): Promise<any> {
    try {
      console.log('Making Reddit API request to:', url);
      const response = await this.axiosInstance.get(url);
      console.log('Reddit API request successful:', {
        url,
        status: response.status,
        dataKeys: Object.keys(response.data || {})
      });
      return response.data;
    } catch (error) {
      console.error('Reddit API request failed after retries:', {
        url,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('User not found');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 500) {
          throw new Error('Server error occurred. The Reddit API proxy may be experiencing issues.');
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Request timeout. Please try again.');
        } else if (error.message.includes('socket hang up')) {
          throw new Error('Connection was interrupted. Please try again.');
        }
      }
      throw new Error(`Failed to fetch data from Reddit: ${error.message}`);
    }
  }

  async getUserInfo(username: string): Promise<RedditUser> {
    const url = `${this.baseUrl}/user/${username}/about.json`;
    console.log('Fetching user info for:', username);
    const data = await this.makeRequest(url);
    
    if (!data.data) {
      console.error('No user data found in response:', data);
      throw new Error('User not found');
    }

    console.log('User info fetched successfully:', {
      username,
      karma: data.data.total_karma,
      created: new Date(data.data.created_utc * 1000).toISOString()
    });

    return {
      name: data.data.name,
      created_utc: data.data.created_utc,
      comment_karma: data.data.comment_karma,
      link_karma: data.data.link_karma,
      total_karma: data.data.total_karma,
      verified: data.data.verified,
      is_gold: data.data.is_gold,
      is_mod: data.data.is_mod,
    };
  }

  async getUserComments(username: string, maxComments: number = 1000): Promise<RedditComment[]> {
    console.log(`Starting paginated comment fetch for ${username}, max: ${maxComments}`);
    
    const allComments: RedditComment[] = [];
    let after: string | null = null;
    let requestCount = 0;
    const maxRequests = 10; // Safety limit to prevent infinite loops
    const batchSize = 100; // Reddit's max limit per request

    while (allComments.length < maxComments && requestCount < maxRequests) {
      try {
        // Build URL with pagination
        let url = `${this.baseUrl}/user/${username}/comments.json?limit=${batchSize}&sort=new`;
        if (after) {
          url += `&after=${after}`;
        }

        console.log(`Fetching comment batch ${requestCount + 1} for ${username}:`, {
          currentTotal: allComments.length,
          after: after || 'none',
          url: url.replace(this.baseUrl, '')
        });

        const data = await this.makeRequest(url);
        
        if (!data.data || !data.data.children || data.data.children.length === 0) {
          console.log(`No more comments found for ${username} after ${requestCount + 1} requests`);
          break;
        }

        // Process this batch
        const batchComments = data.data.children
          .map((child: any) => child.data)
          .filter((comment: any) => comment.body && comment.body !== '[deleted]' && comment.body !== '[removed]')
          .map((comment: any) => ({
            id: comment.id,
            body: comment.body,
            created_utc: comment.created_utc,
            subreddit: comment.subreddit,
            score: comment.score,
            permalink: comment.permalink,
            author: comment.author,
            link_title: comment.link_title,
          }));

        allComments.push(...batchComments);

        console.log(`Batch ${requestCount + 1} processed:`, {
          batchSize: batchComments.length,
          totalComments: allComments.length,
          filteredFrom: data.data.children.length
        });

        // Get pagination token for next request
        after = data.data.after;
        
        // If no more pages, break
        if (!after) {
          console.log(`Reached end of comments for ${username} - no more pages`);
          break;
        }

        requestCount++;

        // Rate limiting: 1 second delay between requests
        if (requestCount < maxRequests && allComments.length < maxComments) {
          console.log('Waiting 1 second before next request...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error fetching comment batch ${requestCount + 1} for ${username}:`, error);
        
        // If it's a rate limit error, wait longer and retry once
        if (error.message.includes('rate limit')) {
          console.log('Rate limited, waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // For other errors, break the loop to return what we have
        console.warn(`Breaking pagination due to error: ${error.message}`);
        break;
      }
    }

    console.log(`Comment pagination complete for ${username}:`, {
      totalComments: allComments.length,
      requestsMade: requestCount,
      reachedLimit: allComments.length >= maxComments,
      reachedMaxRequests: requestCount >= maxRequests
    });

    return allComments.slice(0, maxComments); // Ensure we don't exceed the limit
  }

  async getUserPosts(username: string, maxPosts: number = 500): Promise<RedditPost[]> {
    console.log(`Starting paginated post fetch for ${username}, max: ${maxPosts}`);
    
    const allPosts: RedditPost[] = [];
    let after: string | null = null;
    let requestCount = 0;
    const maxRequests = 5; // Fewer requests for posts since they're typically less numerous
    const batchSize = 100; // Reddit's max limit per request

    while (allPosts.length < maxPosts && requestCount < maxRequests) {
      try {
        // Build URL with pagination
        let url = `${this.baseUrl}/user/${username}/submitted.json?limit=${batchSize}&sort=new`;
        if (after) {
          url += `&after=${after}`;
        }

        console.log(`Fetching post batch ${requestCount + 1} for ${username}:`, {
          currentTotal: allPosts.length,
          after: after || 'none',
          url: url.replace(this.baseUrl, '')
        });

        const data = await this.makeRequest(url);
        
        if (!data.data || !data.data.children || data.data.children.length === 0) {
          console.log(`No more posts found for ${username} after ${requestCount + 1} requests`);
          break;
        }

        // Process this batch
        const batchPosts = data.data.children
          .map((child: any) => child.data)
          .filter((post: any) => post.selftext && post.selftext !== '[deleted]' && post.selftext !== '[removed]')
          .map((post: any) => ({
            id: post.id,
            title: post.title,
            selftext: post.selftext,
            created_utc: post.created_utc,
            subreddit: post.subreddit,
            score: post.score,
            permalink: post.permalink,
            author: post.author,
            num_comments: post.num_comments,
          }));

        allPosts.push(...batchPosts);

        console.log(`Post batch ${requestCount + 1} processed:`, {
          batchSize: batchPosts.length,
          totalPosts: allPosts.length,
          filteredFrom: data.data.children.length
        });

        // Get pagination token for next request
        after = data.data.after;
        
        // If no more pages, break
        if (!after) {
          console.log(`Reached end of posts for ${username} - no more pages`);
          break;
        }

        requestCount++;

        // Rate limiting: 1 second delay between requests
        if (requestCount < maxRequests && allPosts.length < maxPosts) {
          console.log('Waiting 1 second before next request...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error fetching post batch ${requestCount + 1} for ${username}:`, error);
        
        // If it's a rate limit error, wait longer and retry once
        if (error.message.includes('rate limit')) {
          console.log('Rate limited, waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // For other errors, break the loop to return what we have
        console.warn(`Breaking pagination due to error: ${error.message}`);
        break;
      }
    }

    console.log(`Post pagination complete for ${username}:`, {
      totalPosts: allPosts.length,
      requestsMade: requestCount,
      reachedLimit: allPosts.length >= maxPosts,
      reachedMaxRequests: requestCount >= maxRequests
    });

    return allPosts.slice(0, maxPosts); // Ensure we don't exceed the limit
  }

  async getFullUserData(username: string): Promise<{
    user: RedditUser;
    comments: RedditComment[];
    posts: RedditPost[];
  }> {
    try {
      console.log('Fetching comprehensive user data for:', username);
      
      // Fetch user info first to validate the user exists
      const user = await this.getUserInfo(username);
      
      // Then fetch all comments and posts in parallel with increased limits
      const [comments, posts] = await Promise.all([
        this.getUserComments(username, 1000), // Increased from 200 to 1000
        this.getUserPosts(username, 500),     // Increased from 100 to 500
      ]);

      console.log('Comprehensive user data fetched successfully:', {
        username,
        commentsCount: comments.length,
        postsCount: posts.length,
        totalKarma: user.total_karma,
        totalContent: comments.length + posts.length
      });

      return { user, comments, posts };
    } catch (error) {
      console.error('Failed to fetch comprehensive user data:', {
        username,
        error: error.message
      });
      throw error;
    }
  }

  // Helper method to get a preview of user activity (for validation)
  async getUserPreview(username: string): Promise<{
    exists: boolean;
    karma: number;
    accountAge: string;
    recentActivity: boolean;
    estimatedComments: number;
  }> {
    try {
      const user = await this.getUserInfo(username);
      
      // Get a small sample to check for recent activity
      const sampleComments = await this.getUserComments(username, 10);
      
      const accountAge = Math.floor((Date.now() / 1000 - user.created_utc) / (24 * 60 * 60));
      const ageString = accountAge < 30 ? `${accountAge} days` : 
                       accountAge < 365 ? `${Math.floor(accountAge / 30)} months` : 
                       `${Math.floor(accountAge / 365)} years`;

      // Estimate total comments based on karma (rough approximation)
      const estimatedComments = Math.min(Math.max(user.comment_karma * 0.1, 50), 2000);

      return {
        exists: true,
        karma: user.total_karma,
        accountAge: ageString,
        recentActivity: sampleComments.length > 0,
        estimatedComments: Math.floor(estimatedComments)
      };
    } catch {
      return {
        exists: false,
        karma: 0,
        accountAge: 'Unknown',
        recentActivity: false,
        estimatedComments: 0
      };
    }
  }
}

export const redditApi = new RedditApiService();