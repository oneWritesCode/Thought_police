import { redditApi } from './redditApi';
import { multiModelPipeline } from './multiModelPipeline';
import { cacheService } from './cacheService';
import { tokenBudget } from './tokenBudget';
import { Analysis } from '../types';

export class AnalysisService {
  private verbose = false;

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
    redditApi.setVerbose(verbose);
    multiModelPipeline.setVerbose(verbose);
  }

  private debug(...args: any[]) {
    if (this.verbose) {
      console.log('[AnalysisService]', ...args);
    }
  }

  async analyzeUser(username: string, analyzerUserId: string = '1'): Promise<Analysis> {
    try {
      // Validate username
      if (!username || username.trim().length === 0) {
        throw new Error('Username is required');
      }

      const cleanUsername = username.trim().replace(/^u\//, '');
      this.debug(`Starting comprehensive analysis for ${cleanUsername}`);

      // Check budget status
      const budgetStatus = tokenBudget.getBudgetStatus();
      this.debug('Budget status:', budgetStatus);

      if (budgetStatus.isWarning) {
        console.warn(`Budget warning: ${budgetStatus.percentage.toFixed(1)}% used`);
      }

      // Check cache first with content validation
      const userData = await redditApi.getFullUserData(cleanUsername, {
        maxItems: 5000,
        maxAge: 365,
        verbose: this.verbose
      });

      if (!userData.user) {
        throw new Error('User not found on Reddit');
      }

      // Check if user has enough content
      if (userData.comments.length === 0 && userData.posts.length === 0) {
        throw new Error('User has no public comments or posts to analyze');
      }

      this.debug(`Comprehensive data fetched for ${cleanUsername}:`, {
        comments: userData.comments.length,
        posts: userData.posts.length,
        totalContent: userData.comments.length + userData.posts.length,
        userKarma: userData.user.total_karma,
        accountAge: Math.floor((Date.now() / 1000 - userData.user.created_utc) / (24 * 60 * 60))
      });

      // Check cache with content validation
      if (cacheService.hasValidAnalysis(cleanUsername, userData.comments, userData.posts)) {
        this.debug(`Using cached analysis for ${cleanUsername}`);
        const cachedReport = cacheService.getAnalysis(cleanUsername, userData.comments, userData.posts);
        
        return {
          id: `analysis-cached-${Date.now()}-${cleanUsername}`,
          targetUsername: cleanUsername,
          analyzerUserId,
          contradictionsFound: cachedReport.contradictions.length,
          confidenceScore: this.calculateWeightedConfidence(cachedReport.contradictions),
          analysisDate: new Date().toISOString(),
          reportData: cachedReport,
          status: 'completed'
        };
      }

      // Perform optimized pipeline analysis
      this.debug(`Starting optimized pipeline analysis for ${cleanUsername}`);
      const reportData = await multiModelPipeline.analyzeUser(
        userData.comments, 
        userData.posts, 
        cleanUsername
      );

      // Create analysis result with weighted confidence
      const analysis: Analysis = {
        id: `analysis-${Date.now()}-${cleanUsername}`,
        targetUsername: cleanUsername,
        analyzerUserId,
        contradictionsFound: reportData.contradictions.length,
        confidenceScore: this.calculateWeightedConfidence(reportData.contradictions),
        analysisDate: new Date().toISOString(),
        reportData,
        status: 'completed'
      };

      this.debug(`Analysis complete for ${cleanUsername}:`, {
        contradictionsFound: analysis.contradictionsFound,
        weightedConfidence: analysis.confidenceScore,
        totalItemsAnalyzed: userData.comments.length + userData.posts.length,
        budgetUsed: tokenBudget.getBudgetStatus().spent.toFixed(4)
      });
      
      return analysis;

    } catch (error) {
      this.debug('Analysis failed:', error);
      
      // Return failed analysis with error info
      return {
        id: `analysis-failed-${Date.now()}`,
        targetUsername: username,
        analyzerUserId,
        contradictionsFound: 0,
        confidenceScore: 0,
        analysisDate: new Date().toISOString(),
        reportData: {
          summary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          contradictions: [],
          timeline: [],
          stats: {
            totalComments: 0,
            timespan: '0 days',
            topSubreddits: [],
            sentimentTrend: 0
          }
        },
        status: 'failed'
      };
    }
  }

  private calculateWeightedConfidence(contradictions: any[]): number {
    if (contradictions.length === 0) return 0;

    // Weight by recency and verification status
    let totalWeight = 0;
    let weightedSum = 0;

    for (const contradiction of contradictions) {
      let weight = 1;
      
      // Higher weight for verified contradictions
      if (contradiction.verified) {
        weight *= 1.5;
      }
      
      // Higher weight for recent contradictions
      const dates = contradiction.dates.map((d: string) => new Date(d).getTime());
      const avgDate = (dates[0] + dates[1]) / 2;
      const ageInDays = (Date.now() - avgDate) / (24 * 60 * 60 * 1000);
      
      if (ageInDays < 30) {
        weight *= 1.3; // Recent contradictions are more significant
      } else if (ageInDays > 365) {
        weight *= 0.8; // Older contradictions less significant
      }
      
      // Weight by confidence score
      weight *= (contradiction.confidenceScore / 100);
      
      weightedSum += contradiction.confidenceScore * weight;
      totalWeight += weight;
    }

    return Math.round(weightedSum / totalWeight);
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const cleanUsername = username.trim().replace(/^u\//, '');
      await redditApi.getUserInfo(cleanUsername);
      return true;
    } catch {
      return false;
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
      const cleanUsername = username.trim().replace(/^u\//, '');
      return await redditApi.getUserPreview(cleanUsername);
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

  // Enhanced cache management
  clearUserCache(username: string): void {
    const cleanUsername = username.trim().replace(/^u\//, '');
    cacheService.clearAnalysis(cleanUsername);
  }

  getCacheStats() {
    return cacheService.getStats();
  }

  getBudgetStats() {
    return {
      budget: tokenBudget.getBudgetStatus(),
      usage: tokenBudget.getUsageStats()
    };
  }

  resetBudget(): void {
    tokenBudget.resetBudget();
  }

  setBudget(maxDollar: number, warningThreshold: number = 80): void {
    tokenBudget.setBudget({ maxDollar, warningThreshold });
  }

  // Debug and monitoring methods
  getDebugInfo() {
    return {
      cache: cacheService.getDebugInfo(),
      budget: this.getBudgetStats(),
      verbose: this.verbose
    };
  }

  // Streaming analysis for large datasets
  async* analyzeUserStream(username: string): AsyncGenerator<{
    stage: string;
    progress: number;
    data?: any;
  }, void, unknown> {
    const cleanUsername = username.trim().replace(/^u\//, '');
    
    yield { stage: 'validation', progress: 0 };
    
    try {
      // Validate user
      const user = await redditApi.getUserInfo(cleanUsername);
      yield { stage: 'validation', progress: 100, data: { user } };
      
      // Stream comments
      yield { stage: 'fetching', progress: 0 };
      const comments: any[] = [];
      const posts: any[] = [];
      
      let fetchProgress = 0;
      for await (const batch of redditApi.iterateComments(cleanUsername, { maxItems: 5000 })) {
        comments.push(...batch);
        fetchProgress += 10;
        yield { stage: 'fetching', progress: Math.min(fetchProgress, 80) };
      }
      
      // Stream posts
      for await (const batch of redditApi.iteratePosts(cleanUsername, { maxItems: 1000 })) {
        posts.push(...batch);
        fetchProgress += 5;
        yield { stage: 'fetching', progress: Math.min(fetchProgress, 100) };
      }
      
      yield { stage: 'fetching', progress: 100, data: { comments: comments.length, posts: posts.length } };
      
      // Analysis
      yield { stage: 'analyzing', progress: 0 };
      const reportData = await multiModelPipeline.analyzeUser(comments, posts, cleanUsername);
      yield { stage: 'analyzing', progress: 100, data: reportData };
      
      // Complete
      yield { stage: 'complete', progress: 100, data: reportData };
      
    } catch (error) {
      yield { stage: 'error', progress: 0, data: { error: error.message } };
    }
  }
}

export const analysisService = new AnalysisService();