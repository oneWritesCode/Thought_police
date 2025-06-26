import { redditApi } from './redditApi';
import { multiModelPipeline } from './multiModelPipeline';
import { cacheService } from './cacheService';
import { Analysis } from '../types';

export class AnalysisService {
  async analyzeUser(username: string, analyzerUserId: string = '1'): Promise<Analysis> {
    try {
      // Validate username
      if (!username || username.trim().length === 0) {
        throw new Error('Username is required');
      }

      const cleanUsername = username.trim().replace(/^u\//, '');

      // Check cache first
      if (cacheService.hasValidAnalysis(cleanUsername)) {
        console.log(`Using cached analysis for ${cleanUsername}`);
        const cachedReport = cacheService.getAnalysis(cleanUsername);
        
        return {
          id: `analysis-cached-${Date.now()}-${cleanUsername}`,
          targetUsername: cleanUsername,
          analyzerUserId,
          contradictionsFound: cachedReport.contradictions.length,
          confidenceScore: cachedReport.contradictions.length > 0 
            ? Math.round(cachedReport.contradictions.reduce((sum, c) => sum + c.confidenceScore, 0) / cachedReport.contradictions.length)
            : 0,
          analysisDate: new Date().toISOString(),
          reportData: cachedReport,
          status: 'completed'
        };
      }

      // Fetch user data from Reddit
      console.log(`Fetching fresh data for ${cleanUsername}`);
      const userData = await redditApi.getFullUserData(cleanUsername);
      
      if (!userData.user) {
        throw new Error('User not found on Reddit');
      }

      // Check if user has enough content to analyze
      if (userData.comments.length === 0 && userData.posts.length === 0) {
        throw new Error('User has no public comments or posts to analyze');
      }

      // Perform multi-model pipeline analysis
      console.log(`Starting multi-model pipeline analysis for ${cleanUsername}`);
      const reportData = await multiModelPipeline.analyzeUser(
        userData.comments, 
        userData.posts, 
        cleanUsername
      );

      // Create analysis result
      const analysis: Analysis = {
        id: `analysis-${Date.now()}-${cleanUsername}`,
        targetUsername: cleanUsername,
        analyzerUserId,
        contradictionsFound: reportData.contradictions.length,
        confidenceScore: reportData.contradictions.length > 0 
          ? Math.round(reportData.contradictions.reduce((sum, c) => sum + c.confidenceScore, 0) / reportData.contradictions.length)
          : 0,
        analysisDate: new Date().toISOString(),
        reportData,
        status: 'completed'
      };

      console.log(`Multi-model pipeline analysis complete for ${cleanUsername}: ${analysis.contradictionsFound} contradictions found`);
      return analysis;

    } catch (error) {
      console.error('Analysis failed:', error);
      
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
  }> {
    try {
      const cleanUsername = username.trim().replace(/^u\//, '');
      const user = await redditApi.getUserInfo(cleanUsername);
      const comments = await redditApi.getUserComments(cleanUsername, 10);
      
      const accountAge = Math.floor((Date.now() / 1000 - user.created_utc) / (24 * 60 * 60));
      const ageString = accountAge < 30 ? `${accountAge} days` : 
                       accountAge < 365 ? `${Math.floor(accountAge / 30)} months` : 
                       `${Math.floor(accountAge / 365)} years`;

      return {
        exists: true,
        karma: user.total_karma,
        accountAge: ageString,
        recentActivity: comments.length > 0
      };
    } catch {
      return {
        exists: false,
        karma: 0,
        accountAge: 'Unknown',
        recentActivity: false
      };
    }
  }

  // Cache management methods
  clearUserCache(username: string): void {
    const cleanUsername = username.trim().replace(/^u\//, '');
    cacheService.clearAnalysis(cleanUsername);
  }

  getCacheStats() {
    return cacheService.getStats();
  }
}

export const analysisService = new AnalysisService();