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
      timeout: 15000,
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

  async getUserComments(username: string, limit: number = 100): Promise<RedditComment[]> {
    const url = `${this.baseUrl}/user/${username}/comments.json?limit=${limit}&sort=new`;
    console.log('Fetching comments for:', username, 'limit:', limit);
    const data = await this.makeRequest(url);
    
    if (!data.data || !data.data.children) {
      console.log('No comments found for user:', username);
      return [];
    }

    const comments = data.data.children
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

    console.log('Comments fetched successfully:', {
      username,
      totalComments: comments.length,
      filteredFrom: data.data.children.length
    });

    return comments;
  }

  async getUserPosts(username: string, limit: number = 50): Promise<RedditPost[]> {
    const url = `${this.baseUrl}/user/${username}/submitted.json?limit=${limit}&sort=new`;
    console.log('Fetching posts for:', username, 'limit:', limit);
    const data = await this.makeRequest(url);
    
    if (!data.data || !data.data.children) {
      console.log('No posts found for user:', username);
      return [];
    }

    const posts = data.data.children
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

    console.log('Posts fetched successfully:', {
      username,
      totalPosts: posts.length,
      filteredFrom: data.data.children.length
    });

    return posts;
  }

  async getFullUserData(username: string): Promise<{
    user: RedditUser;
    comments: RedditComment[];
    posts: RedditPost[];
  }> {
    try {
      console.log('Fetching full user data for:', username);
      const [user, comments, posts] = await Promise.all([
        this.getUserInfo(username),
        this.getUserComments(username, ),
        this.getUserPosts(username, 100),
      ]);

      console.log('Full user data fetched successfully:', {
        username,
        commentsCount: comments.length,
        postsCount: posts.length,
        totalKarma: user.total_karma
      });

      return { user, comments, posts };
    } catch (error) {
      console.error('Failed to fetch full user data:', {
        username,
        error: error.message
      });
      throw error;
    }
  }
}

export const redditApi = new RedditApiService();