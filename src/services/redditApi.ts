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

interface FetchOptions {
  maxItems?: number;
  maxAge?: number; // days
  verbose?: boolean;
}

class RedditApiService {
  private baseUrl = '/api/reddit';
  private pushShiftUrl = 'https://api.pushshift.io/reddit';
  private axiosInstance;
  private verbose = false;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000, // Increased for Pushshift
    });

    // Enhanced retry configuration
    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               error.code === 'ECONNRESET' ||
               error.code === 'ENOTFOUND' ||
               error.code === 'ECONNABORTED' ||
               error.message.includes('socket hang up') ||
               error.response?.status === 503 || // Reddit overload
               error.response?.status === 502 || // Bad gateway
               error.response?.status === 504;   // Gateway timeout
      },
      onRetry: (retryCount, error, requestConfig) => {
        if (this.verbose) {
          console.log(`Retrying request (attempt ${retryCount}):`, requestConfig.url);
        }
      },
    });
  }

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  private debug(...args: any[]) {
    if (this.verbose) {
      console.log('[RedditAPI]', ...args);
    }
  }

  private async makeRequest(url: string, source: 'reddit' | 'pushshift' = 'reddit'): Promise<any> {
    try {
      this.debug('Making request to:', url);
      const response = await this.axiosInstance.get(url);
      this.debug('Request successful:', { url, status: response.status });
      return response.data;
    } catch (error) {
      this.debug('Request failed:', { url, error: error.message });
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(source === 'reddit' ? 'User not found' : 'No data found');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        } else if (error.response?.status >= 500) {
          throw new Error(`Server error occurred (${error.response.status}). Please try again.`);
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Request timeout. Please try again.');
        }
      }
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Streaming iterator for unlimited Reddit pagination
  async* iterateComments(username: string, options: FetchOptions = {}): AsyncGenerator<RedditComment[], void, unknown> {
    const { maxItems = 10000, maxAge = 365 } = options;
    let totalFetched = 0;
    let after: string | null = null;
    const cutoffDate = Date.now() / 1000 - (maxAge * 24 * 60 * 60);

    this.debug(`Starting Reddit comment iteration for ${username}, max: ${maxItems}, maxAge: ${maxAge} days`);

    // Phase 1: Reddit official API (newest ~1000 items)
    while (totalFetched < maxItems) {
      try {
        let url = `${this.baseUrl}/user/${username}/comments.json?limit=100&sort=new`;
        if (after) {
          url += `&after=${after}`;
        }

        const data = await this.makeRequest(url, 'reddit');
        
        if (!data.data || !data.data.children || data.data.children.length === 0) {
          this.debug('No more comments from Reddit API');
          break;
        }

        const batch = data.data.children
          .map((child: any) => child.data)
          .filter((comment: any) => {
            return comment.body && 
                   comment.body !== '[deleted]' && 
                   comment.body !== '[removed]' &&
                   comment.body.length > 20 &&
                   comment.created_utc >= cutoffDate;
          })
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

        if (batch.length > 0) {
          yield batch;
          totalFetched += batch.length;
          this.debug(`Reddit batch yielded: ${batch.length}, total: ${totalFetched}`);
        }

        after = data.data.after;
        if (!after) {
          this.debug('Reddit pagination complete');
          break;
        }

        await this.delay(1000); // Rate limiting
      } catch (error) {
        this.debug('Reddit API error:', error.message);
        break;
      }
    }

    // Phase 2: Pushshift for historical data (if we need more and haven't hit limits)
    if (totalFetched < maxItems && totalFetched < 8000) { // Pushshift practical limit
      this.debug('Switching to Pushshift for historical data');
      
      let before = Math.floor(Date.now() / 1000);
      let pushShiftAttempts = 0;
      const maxPushShiftAttempts = 8;

      while (totalFetched < maxItems && pushShiftAttempts < maxPushShiftAttempts) {
        try {
          const url = `${this.pushShiftUrl}/comment/search?author=${username}&size=500&before=${before}&sort=desc`;
          
          const data = await this.makeRequest(url, 'pushshift');
          
          if (!data.data || data.data.length === 0) {
            this.debug('No more comments from Pushshift');
            break;
          }

          const batch = data.data
            .filter((comment: any) => {
              return comment.body && 
                     comment.body !== '[deleted]' && 
                     comment.body !== '[removed]' &&
                     comment.body.length > 20 &&
                     comment.created_utc >= cutoffDate;
            })
            .map((comment: any) => ({
              id: comment.id,
              body: comment.body,
              created_utc: comment.created_utc,
              subreddit: comment.subreddit,
              score: comment.score || 1,
              permalink: comment.permalink || `/r/${comment.subreddit}/comments/${comment.link_id}/${comment.id}/`,
              author: comment.author,
              link_title: comment.link_title,
            }));

          if (batch.length > 0) {
            yield batch;
            totalFetched += batch.length;
            before = Math.min(...batch.map(c => c.created_utc)) - 1;
            this.debug(`Pushshift batch yielded: ${batch.length}, total: ${totalFetched}`);
          } else {
            break;
          }

          pushShiftAttempts++;
          await this.delay(2000); // Pushshift rate limiting
        } catch (error) {
          this.debug('Pushshift error:', error.message);
          break;
        }
      }
    }

    this.debug(`Comment iteration complete: ${totalFetched} total comments`);
  }

  // Streaming iterator for posts
  async* iteratePosts(username: string, options: FetchOptions = {}): AsyncGenerator<RedditPost[], void, unknown> {
    const { maxItems = 2000, maxAge = 365 } = options;
    let totalFetched = 0;
    let after: string | null = null;
    const cutoffDate = Date.now() / 1000 - (maxAge * 24 * 60 * 60);

    this.debug(`Starting Reddit post iteration for ${username}, max: ${maxItems}`);

    // Reddit API for posts
    while (totalFetched < maxItems) {
      try {
        let url = `${this.baseUrl}/user/${username}/submitted.json?limit=100&sort=new`;
        if (after) {
          url += `&after=${after}`;
        }

        const data = await this.makeRequest(url, 'reddit');
        
        if (!data.data || !data.data.children || data.data.children.length === 0) {
          break;
        }

        const batch = data.data.children
          .map((child: any) => child.data)
          .filter((post: any) => {
            return post.selftext && 
                   post.selftext !== '[deleted]' && 
                   post.selftext !== '[removed]' &&
                   post.selftext.length > 20 &&
                   post.created_utc >= cutoffDate;
          })
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

        if (batch.length > 0) {
          yield batch;
          totalFetched += batch.length;
        }

        after = data.data.after;
        if (!after) break;

        await this.delay(1000);
      } catch (error) {
        this.debug('Posts API error:', error.message);
        break;
      }
    }

    this.debug(`Post iteration complete: ${totalFetched} total posts`);
  }

  // Legacy methods for compatibility
  async getUserInfo(username: string): Promise<RedditUser> {
    const url = `${this.baseUrl}/user/${username}/about.json`;
    this.debug('Fetching user info for:', username);
    const data = await this.makeRequest(url, 'reddit');
    
    if (!data.data) {
      throw new Error('User not found');
    }

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

  async getUserComments(username: string, maxComments: number = 5000): Promise<RedditComment[]> {
    const comments: RedditComment[] = [];
    
    for await (const batch of this.iterateComments(username, { maxItems: maxComments })) {
      comments.push(...batch);
      if (comments.length >= maxComments) break;
    }
    
    return comments.slice(0, maxComments);
  }

  async getUserPosts(username: string, maxPosts: number = 2000): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];
    
    for await (const batch of this.iteratePosts(username, { maxItems: maxPosts })) {
      posts.push(...batch);
      if (posts.length >= maxPosts) break;
    }
    
    return posts.slice(0, maxPosts);
  }

  async getFullUserData(username: string, options: FetchOptions = {}): Promise<{
    user: RedditUser;
    comments: RedditComment[];
    posts: RedditPost[];
  }> {
    try {
      this.debug('Fetching comprehensive user data for:', username);
      
      // Fetch user info first
      const user = await this.getUserInfo(username);
      
      // Stream all content
      const comments: RedditComment[] = [];
      const posts: RedditPost[] = [];

      // Collect comments
      for await (const batch of this.iterateComments(username, options)) {
        comments.push(...batch);
        if (comments.length >= (options.maxItems || 5000)) break;
      }

      // Collect posts
      for await (const batch of this.iteratePosts(username, options)) {
        posts.push(...batch);
        if (posts.length >= 1000) break;
      }

      this.debug('Comprehensive data complete:', {
        username,
        comments: comments.length,
        posts: posts.length,
        totalContent: comments.length + posts.length
      });

      return { user, comments, posts };
    } catch (error) {
      this.debug('Failed to fetch comprehensive user data:', error.message);
      throw error;
    }
  }

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
      const sampleComments: RedditComment[] = [];
      let batchCount = 0;
      
      for await (const batch of this.iterateComments(username, { maxItems: 20 })) {
        sampleComments.push(...batch);
        batchCount++;
        if (batchCount >= 1) break; // Just first batch for preview
      }
      
      const accountAge = Math.floor((Date.now() / 1000 - user.created_utc) / (24 * 60 * 60));
      const ageString = accountAge < 30 ? `${accountAge} days` : 
                       accountAge < 365 ? `${Math.floor(accountAge / 30)} months` : 
                       `${Math.floor(accountAge / 365)} years`;

      // Better estimation based on karma and account age
      const dailyKarma = user.comment_karma / Math.max(accountAge, 1);
      const estimatedComments = Math.min(Math.max(dailyKarma * 2, 100), 8000);

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