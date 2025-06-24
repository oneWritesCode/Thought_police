import { GoogleGenerativeAI } from '@google/generative-ai';

interface ContradictionAnalysisRequest {
  statement1: {
    text: string;
    date: string;
    subreddit: string;
    score: number;
    context?: string;
  };
  statement2: {
    text: string;
    date: string;
    subreddit: string;
    score: number;
    context?: string;
  };
  topicOverlap: string[];
  timeDifference: number; // in seconds
}

interface GeminiContradictionResult {
  isContradiction: boolean;
  confidenceScore: number; // 0-100
  category: string;
  reasoning: string;
  contextualFactors: string[];
  requiresHumanReview: boolean;
  severity: 'low' | 'medium' | 'high';
  evidencePoints: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isAvailable: boolean = false;

  constructor() {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Gemini API key not found - using fallback analysis');
        this.isAvailable = false;
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent analysis
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });
      this.isAvailable = true;
    } catch (error) {
      console.warn('Failed to initialize Gemini service:', error);
      this.isAvailable = false;
    }
  }

  async analyzeContradiction(request: ContradictionAnalysisRequest): Promise<GeminiContradictionResult> {
    // If Gemini is not available, immediately return fallback
    if (!this.isAvailable || !this.model) {
      return this.getFallbackAnalysis(request, 'Service unavailable');
    }

    try {
      const prompt = this.buildAnalysisPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
    } catch (error: any) {
      console.warn('Gemini API error, using fallback:', error?.message || error);
      
      // Check for specific quota errors
      if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        return this.getFallbackAnalysis(request, 'API quota exceeded');
      }
      
      // Check for other API errors
      if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
        return this.getFallbackAnalysis(request, 'Authentication error');
      }
      
      // Generic API error fallback
      return this.getFallbackAnalysis(request, 'API error');
    }
  }

  private buildAnalysisPrompt(request: ContradictionAnalysisRequest): string {
    const daysDifference = Math.floor(request.timeDifference / (24 * 60 * 60));
    
    return `You are an expert analyst specializing in detecting contradictions in social media posts. Analyze these two Reddit statements for potential contradictions.

CONTEXT INFORMATION:
- Statement 1: Posted ${request.statement1.date} in r/${request.statement1.subreddit} (Score: ${request.statement1.score})
- Statement 2: Posted ${request.statement2.date} in r/${request.statement2.subreddit} (Score: ${request.statement2.score})
- Time difference: ${daysDifference} days
- Detected topic overlap: ${request.topicOverlap.join(', ')}
- Statement 1 context: ${request.statement1.context || 'N/A'}
- Statement 2 context: ${request.statement2.context || 'N/A'}

STATEMENT 1:
"${request.statement1.text}"

STATEMENT 2:
"${request.statement2.text}"

ANALYSIS INSTRUCTIONS:
1. Determine if these statements genuinely contradict each other
2. Consider context, sarcasm, hypothetical scenarios, and personal growth
3. Account for different subreddit contexts (serious vs casual vs meme communities)
4. Evaluate if the time gap suggests genuine opinion evolution vs flip-flopping
5. Assess the severity and confidence of any contradiction found

IMPORTANT CONSIDERATIONS:
- Personal growth and changing opinions over time are normal
- Sarcasm, jokes, and hypothetical statements should not be flagged
- Context matters: statements in different communities may have different meanings
- Consider if the user might be playing devil's advocate or exploring different perspectives
- Mental health, addiction recovery, and trauma contexts require special sensitivity

Please respond in the following JSON format:
{
  "isContradiction": boolean,
  "confidenceScore": number (0-100),
  "category": "political|personal-preference|factual|opinion|lifestyle|relationship|technology|entertainment",
  "reasoning": "Detailed explanation of your analysis",
  "contextualFactors": ["factor1", "factor2", ...],
  "requiresHumanReview": boolean,
  "severity": "low|medium|high",
  "evidencePoints": ["specific evidence point 1", "specific evidence point 2", ...]
}

Be thorough but fair. False positives harm credibility, but genuine contradictions should be identified with appropriate confidence levels.`;
  }

  private parseGeminiResponse(text: string): GeminiContradictionResult {
    try {
      // Extract JSON from the response (Gemini sometimes adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return {
        isContradiction: Boolean(parsed.isContradiction),
        confidenceScore: Math.max(0, Math.min(100, Number(parsed.confidenceScore) || 0)),
        category: this.validateCategory(parsed.category),
        reasoning: String(parsed.reasoning || 'Analysis completed'),
        contextualFactors: Array.isArray(parsed.contextualFactors) ? parsed.contextualFactors : [],
        requiresHumanReview: Boolean(parsed.requiresHumanReview),
        severity: this.validateSeverity(parsed.severity),
        evidencePoints: Array.isArray(parsed.evidencePoints) ? parsed.evidencePoints : []
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid response format from Gemini');
    }
  }

  private validateCategory(category: string): string {
    const validCategories = [
      'political', 'personal-preference', 'factual', 'opinion', 
      'lifestyle', 'relationship', 'technology', 'entertainment'
    ];
    return validCategories.includes(category) ? category : 'opinion';
  }

  private validateSeverity(severity: string): 'low' | 'medium' | 'high' {
    const validSeverities = ['low', 'medium', 'high'];
    return validSeverities.includes(severity) ? severity as any : 'medium';
  }

  private getFallbackAnalysis(request: ContradictionAnalysisRequest, reason: string = 'API unavailable'): GeminiContradictionResult {
    // Enhanced fallback analysis when Gemini is unavailable
    const hasOpposingWords = this.hasBasicContradiction(
      request.statement1.text, 
      request.statement2.text
    );
    
    const hasStrongOpposition = this.hasStrongOpposition(
      request.statement1.text,
      request.statement2.text
    );
    
    const confidenceScore = hasStrongOpposition ? 75 : hasOpposingWords ? 60 : 25;
    
    return {
      isContradiction: hasOpposingWords || hasStrongOpposition,
      confidenceScore,
      category: this.detectCategory(request.topicOverlap),
      reasoning: `Fallback analysis used (${reason}). ${hasStrongOpposition ? 'Strong opposing language detected.' : hasOpposingWords ? 'Basic opposing patterns found.' : 'No clear contradictions detected.'}`,
      contextualFactors: ['FALLBACK_ANALYSIS', reason.toUpperCase().replace(/\s+/g, '_')],
      requiresHumanReview: true,
      severity: hasStrongOpposition ? 'high' : hasOpposingWords ? 'medium' : 'low',
      evidencePoints: this.getEvidencePoints(request.statement1.text, request.statement2.text)
    };
  }

  private hasBasicContradiction(text1: string, text2: string): boolean {
    const opposites = [
      ['love', 'hate'],
      ['like', 'dislike'],
      ['good', 'bad'],
      ['best', 'worst'],
      ['always', 'never'],
      ['support', 'oppose'],
      ['agree', 'disagree'],
      ['yes', 'no'],
      ['true', 'false']
    ];

    const lower1 = text1.toLowerCase();
    const lower2 = text2.toLowerCase();

    return opposites.some(([pos, neg]) => 
      (lower1.includes(pos) && lower2.includes(neg)) ||
      (lower1.includes(neg) && lower2.includes(pos))
    );
  }

  private hasStrongOpposition(text1: string, text2: string): boolean {
    const strongOpposites = [
      ['absolutely love', 'absolutely hate'],
      ['completely agree', 'completely disagree'],
      ['totally support', 'totally oppose'],
      ['definitely yes', 'definitely no'],
      ['strongly support', 'strongly oppose']
    ];

    const lower1 = text1.toLowerCase();
    const lower2 = text2.toLowerCase();

    return strongOpposites.some(([pos, neg]) => 
      (lower1.includes(pos) && lower2.includes(neg)) ||
      (lower1.includes(neg) && lower2.includes(pos))
    );
  }

  private detectCategory(topicOverlap: string[]): string {
    if (topicOverlap.length === 0) return 'opinion';
    return topicOverlap[0];
  }

  private getEvidencePoints(text1: string, text2: string): string[] {
    const evidence: string[] = [];
    
    if (this.hasStrongOpposition(text1, text2)) {
      evidence.push('Strong opposing language patterns detected');
    } else if (this.hasBasicContradiction(text1, text2)) {
      evidence.push('Basic contradictory terms found');
    }
    
    const sentiment1 = this.getBasicSentiment(text1);
    const sentiment2 = this.getBasicSentiment(text2);
    
    if (Math.abs(sentiment1 - sentiment2) > 1) {
      evidence.push('Significant sentiment difference between statements');
    }
    
    if (evidence.length === 0) {
      evidence.push('No clear contradictory evidence found');
    }
    
    return evidence;
  }

  private getBasicSentiment(text: string): number {
    const positive = ['good', 'great', 'love', 'like', 'amazing', 'awesome', 'excellent'];
    const negative = ['bad', 'hate', 'terrible', 'awful', 'horrible', 'worst', 'sucks'];
    
    const lower = text.toLowerCase();
    let score = 0;
    
    positive.forEach(word => {
      if (lower.includes(word)) score += 1;
    });
    
    negative.forEach(word => {
      if (lower.includes(word)) score -= 1;
    });
    
    return score;
  }

  async batchAnalyzeContradictions(requests: ContradictionAnalysisRequest[]): Promise<GeminiContradictionResult[]> {
    const results: GeminiContradictionResult[] = [];
    
    // If service is not available, return all fallback results immediately
    if (!this.isAvailable) {
      return requests.map(request => this.getFallbackAnalysis(request, 'Service unavailable'));
    }
    
    // Process in batches to respect rate limits
    const batchSize = 3; // Reduced batch size to be more conservative
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      try {
        // Process batch with individual error handling
        const batchResults = await Promise.allSettled(
          batch.map(request => this.analyzeContradiction(request))
        );
        
        // Convert settled promises to results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Individual request failed, use fallback
            console.warn('Individual analysis failed:', result.reason);
            results.push(this.getFallbackAnalysis(batch[index], 'Individual request failed'));
          }
        });
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay
        }
      } catch (error) {
        console.warn('Batch processing error:', error);
        // Add fallback results for entire failed batch
        const fallbackResults = batch.map(request => 
          this.getFallbackAnalysis(request, 'Batch processing failed')
        );
        results.push(...fallbackResults);
      }
    }
    
    return results;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isAvailable || !this.model) {
      return false;
    }
    
    try {
      const testPrompt = "Respond with 'OK' if you can understand this message.";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      return text.toLowerCase().includes('ok');
    } catch (error) {
      console.warn('Gemini connection test failed:', error);
      this.isAvailable = false; // Mark as unavailable if test fails
      return false;
    }
  }
}

export const geminiService = new GeminiService();