import axios from 'axios';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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
  timeDifference: number;
}

interface OpenRouterContradictionResult {
  isContradiction: boolean;
  confidenceScore: number;
  category: string;
  reasoning: string;
  contextualFactors: string[];
  requiresHumanReview: boolean;
  severity: 'low' | 'medium' | 'high';
  evidencePoints: string[];
}

class OpenRouterService {
  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private isAvailable: boolean = false;
  private currentModelIndex = 0;
  
  // Free models in order of preference
  private freeModels = [
    'mistralai/mistral-small-3.2-24b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1-0528-qwen3-8b:free',
    'qwen/qwq-32b:free'
  ];

  constructor() {
    try {
      this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!this.apiKey) {
        console.warn('OpenRouter API key not found - using fallback analysis');
        this.isAvailable = false;
        return;
      }
      
      this.isAvailable = true;
      console.log('OpenRouter service initialized with free models:', this.freeModels);
    } catch (error) {
      console.warn('Failed to initialize OpenRouter service:', error);
      this.isAvailable = false;
    }
  }

  private getCurrentModel(): string {
    return this.freeModels[this.currentModelIndex];
  }

  private rotateModel(): void {
    this.currentModelIndex = (this.currentModelIndex + 1) % this.freeModels.length;
    console.log('Rotated to model:', this.getCurrentModel());
  }

  private async makeRequest(messages: OpenRouterMessage[], retryCount = 0): Promise<OpenRouterResponse> {
    if (!this.isAvailable || !this.apiKey) {
      throw new Error('OpenRouter service not available');
    }

    const currentModel = this.getCurrentModel();
    
    const requestData: OpenRouterRequest = {
      model: currentModel,
      messages,
      temperature: 0.1,
      max_tokens: 1000,
      top_p: 0.8
    };

    try {
      console.log(`Making OpenRouter request with model: ${currentModel}`);
      
      const response = await axios.post(this.baseUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Thought Police - Reddit Analysis'
        },
        timeout: 30000
      });

      console.log('OpenRouter request successful:', {
        model: currentModel,
        tokensUsed: response.data.usage?.total_tokens || 0
      });

      return response.data;
    } catch (error: any) {
      console.warn(`OpenRouter request failed with model ${currentModel}:`, error?.response?.data || error.message);
      
      // Handle rate limits and model-specific errors
      if (error?.response?.status === 429 || error?.response?.status === 503) {
        if (retryCount < this.freeModels.length - 1) {
          console.log('Rate limited or model unavailable, trying next model...');
          this.rotateModel();
          return this.makeRequest(messages, retryCount + 1);
        }
      }
      
      // Handle quota exceeded
      if (error?.response?.data?.error?.message?.includes('quota') || 
          error?.response?.data?.error?.message?.includes('limit')) {
        if (retryCount < this.freeModels.length - 1) {
          console.log('Quota exceeded, trying next model...');
          this.rotateModel();
          return this.makeRequest(messages, retryCount + 1);
        }
      }
      
      throw new Error(`OpenRouter API failed: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  async analyzeContradiction(request: ContradictionAnalysisRequest): Promise<OpenRouterContradictionResult> {
    if (!this.isAvailable) {
      return this.getFallbackAnalysis(request, 'Service unavailable');
    }

    try {
      const prompt = this.buildAnalysisPrompt(request);
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are an expert analyst specializing in detecting contradictions in social media posts. Analyze statements carefully and respond only in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.makeRequest(messages);
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenRouter');
      }

      return this.parseResponse(content);
    } catch (error: any) {
      console.warn('OpenRouter analysis error, using fallback:', error?.message || error);
      return this.getFallbackAnalysis(request, error?.message || 'API error');
    }
  }

  private buildAnalysisPrompt(request: ContradictionAnalysisRequest): string {
    const daysDifference = Math.floor(request.timeDifference / (24 * 60 * 60));
    
    return `Analyze these Reddit statements for contradictions:

CONTEXT:
- Statement 1: ${request.statement1.date} in r/${request.statement1.subreddit} (Score: ${request.statement1.score})
- Statement 2: ${request.statement2.date} in r/${request.statement2.subreddit} (Score: ${request.statement2.score})
- Time gap: ${daysDifference} days
- Topics: ${request.topicOverlap.join(', ')}

STATEMENT 1: "${request.statement1.text}"
STATEMENT 2: "${request.statement2.text}"

Consider: context, sarcasm, personal growth, different communities, hypotheticals.

Respond ONLY with valid JSON:
{
  "isContradiction": boolean,
  "confidenceScore": number (0-100),
  "category": "political|personal-preference|factual|opinion|lifestyle|relationship|technology|entertainment",
  "reasoning": "brief explanation",
  "contextualFactors": ["factor1", "factor2"],
  "requiresHumanReview": boolean,
  "severity": "low|medium|high",
  "evidencePoints": ["evidence1", "evidence2"]
}`;
  }

  private parseResponse(content: string): OpenRouterContradictionResult {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
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
      console.error('Failed to parse OpenRouter response:', error);
      throw new Error('Invalid response format');
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

  private getFallbackAnalysis(request: ContradictionAnalysisRequest, reason: string): OpenRouterContradictionResult {
    const hasOpposingWords = this.hasBasicContradiction(
      request.statement1.text, 
      request.statement2.text
    );
    
    const confidenceScore = hasOpposingWords ? 65 : 30;
    
    return {
      isContradiction: hasOpposingWords,
      confidenceScore,
      category: this.detectCategory(request.topicOverlap),
      reasoning: `Fallback analysis (${reason}). ${hasOpposingWords ? 'Basic opposing patterns detected.' : 'No clear contradictions found.'}`,
      contextualFactors: ['FALLBACK_ANALYSIS'],
      requiresHumanReview: true,
      severity: hasOpposingWords ? 'medium' : 'low',
      evidencePoints: hasOpposingWords ? ['Opposing language patterns'] : ['No contradictory evidence']
    };
  }

  private hasBasicContradiction(text1: string, text2: string): boolean {
    const opposites = [
      ['love', 'hate'], ['like', 'dislike'], ['good', 'bad'],
      ['best', 'worst'], ['always', 'never'], ['support', 'oppose']
    ];

    const lower1 = text1.toLowerCase();
    const lower2 = text2.toLowerCase();

    return opposites.some(([pos, neg]) => 
      (lower1.includes(pos) && lower2.includes(neg)) ||
      (lower1.includes(neg) && lower2.includes(pos))
    );
  }

  private detectCategory(topicOverlap: string[]): string {
    return topicOverlap.length > 0 ? topicOverlap[0] : 'opinion';
  }

  async batchAnalyzeContradictions(requests: ContradictionAnalysisRequest[]): Promise<OpenRouterContradictionResult[]> {
    const results: OpenRouterContradictionResult[] = [];
    
    if (!this.isAvailable) {
      return requests.map(request => this.getFallbackAnalysis(request, 'Service unavailable'));
    }
    
    // Process in smaller batches to respect rate limits
    const batchSize = 2;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(request => this.analyzeContradiction(request))
        );
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.warn('Individual analysis failed:', result.reason);
            results.push(this.getFallbackAnalysis(batch[index], 'Request failed'));
          }
        });
        
        // Delay between batches
        if (i + batchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.warn('Batch processing error:', error);
        const fallbackResults = batch.map(request => 
          this.getFallbackAnalysis(request, 'Batch failed')
        );
        results.push(...fallbackResults);
      }
    }
    
    return results;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }
    
    try {
      const messages: OpenRouterMessage[] = [
        { role: 'user', content: 'Respond with "OK" if you understand this message.' }
      ];
      
      const response = await this.makeRequest(messages);
      const content = response.choices[0]?.message?.content?.toLowerCase() || '';
      return content.includes('ok');
    } catch (error) {
      console.warn('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

export const openRouterService = new OpenRouterService();