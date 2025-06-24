import { RedditComment, RedditPost } from './redditApi';

interface ProcessedComment {
  text: string;
  date: number;
  subreddit: string;
  score: number;
  permalink: string;
  type: 'comment' | 'post';
  context?: string;
  topics: string[];
  sentiment: number;
  entities: string[];
  relevanceScore: number;
}

interface CommentPair {
  comment1: ProcessedComment;
  comment2: ProcessedComment;
  similarity: number;
  timeDifference: number;
  topicOverlap: string[];
  contradictionPotential: number;
}

class SmartPreprocessor {
  private opinionKeywords = [
    'i think', 'i believe', 'i feel', 'in my opinion', 'personally',
    'i love', 'i hate', 'i prefer', 'i like', 'i dislike',
    'always', 'never', 'best', 'worst', 'better', 'worse',
    'should', 'shouldn\'t', 'must', 'can\'t stand', 'amazing', 'terrible',
    'absolutely', 'definitely', 'completely', 'totally'
  ];

  private strongSentimentWords = {
    positive: ['love', 'amazing', 'fantastic', 'excellent', 'perfect', 'brilliant', 'outstanding'],
    negative: ['hate', 'terrible', 'awful', 'horrible', 'disgusting', 'pathetic', 'worthless']
  };

  private topicKeywords = {
    political: ['trump', 'biden', 'democrat', 'republican', 'conservative', 'liberal', 'politics', 'election'],
    technology: ['iphone', 'android', 'apple', 'google', 'ai', 'crypto', 'bitcoin', 'programming'],
    entertainment: ['movie', 'film', 'tv show', 'music', 'game', 'netflix', 'youtube'],
    lifestyle: ['diet', 'exercise', 'food', 'health', 'fitness', 'work', 'job'],
    relationship: ['dating', 'relationship', 'marriage', 'family', 'friends']
  };

  /**
   * Extract only the most relevant comments for analysis
   */
  extractRelevantComments(comments: RedditComment[], posts: RedditPost[], maxComments: number = 80): ProcessedComment[] {
    console.log(`Smart preprocessing: filtering ${comments.length + posts.length} items to ${maxComments} most relevant`);
    
    const allItems: ProcessedComment[] = [];

    // Process comments
    comments.forEach(comment => {
      if (this.isRelevantForAnalysis(comment.body)) {
        allItems.push({
          text: comment.body,
          date: comment.created_utc,
          subreddit: comment.subreddit,
          score: comment.score,
          permalink: comment.permalink,
          type: 'comment',
          context: comment.link_title,
          topics: this.detectTopics(comment.body),
          sentiment: this.calculateSentiment(comment.body),
          entities: this.extractEntities(comment.body),
          relevanceScore: this.calculateRelevanceScore(comment.body, comment.score)
        });
      }
    });

    // Process posts
    posts.forEach(post => {
      const fullText = `${post.title} ${post.selftext}`.trim();
      if (this.isRelevantForAnalysis(fullText)) {
        allItems.push({
          text: fullText,
          date: post.created_utc,
          subreddit: post.subreddit,
          score: post.score,
          permalink: post.permalink,
          type: 'post',
          topics: this.detectTopics(fullText),
          sentiment: this.calculateSentiment(fullText),
          entities: this.extractEntities(fullText),
          relevanceScore: this.calculateRelevanceScore(fullText, post.score)
        });
      }
    });

    // Sort by relevance score and return top items
    const sortedItems = allItems
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxComments);

    console.log(`Smart preprocessing complete: selected ${sortedItems.length} high-relevance items`);
    return sortedItems;
  }

  /**
   * Find the most promising contradiction candidate pairs
   */
  findContradictionCandidates(comments: ProcessedComment[], maxPairs: number = 25): CommentPair[] {
    console.log(`Finding contradiction candidates from ${comments.length} comments, targeting ${maxPairs} pairs`);
    
    const pairs: CommentPair[] = [];

    for (let i = 0; i < comments.length; i++) {
      for (let j = i + 1; j < comments.length; j++) {
        const comment1 = comments[i];
        const comment2 = comments[j];

        // Skip if too similar in time (less than 7 days)
        const timeDiff = Math.abs(comment2.date - comment1.date);
        if (timeDiff < 7 * 24 * 60 * 60) continue;

        // Skip if both are questions or very short
        if (this.isQuestion(comment1.text) && this.isQuestion(comment2.text)) continue;
        if (comment1.text.length < 50 || comment2.text.length < 50) continue;

        const topicOverlap = this.getTopicOverlap(comment1.topics, comment2.topics);
        const entityOverlap = this.getEntityOverlap(comment1.entities, comment2.entities);
        
        // Must have some topic or entity overlap
        if (topicOverlap.length === 0 && entityOverlap.length === 0) continue;

        const similarity = this.calculateTextSimilarity(comment1.text, comment2.text);
        const contradictionPotential = this.calculateContradictionPotential(comment1, comment2);

        // Only include pairs with reasonable contradiction potential
        if (contradictionPotential > 0.3) {
          pairs.push({
            comment1,
            comment2,
            similarity,
            timeDifference: timeDiff,
            topicOverlap: [...topicOverlap, ...entityOverlap],
            contradictionPotential
          });
        }
      }
    }

    // Sort by contradiction potential and return top pairs
    const sortedPairs = pairs
      .sort((a, b) => b.contradictionPotential - a.contradictionPotential)
      .slice(0, maxPairs);

    console.log(`Found ${sortedPairs.length} high-potential contradiction candidates`);
    return sortedPairs;
  }

  private isRelevantForAnalysis(text: string): boolean {
    if (!text || text.length < 30) return false;
    
    const lowerText = text.toLowerCase();
    
    // Skip deleted/removed content
    if (lowerText.includes('[deleted]') || lowerText.includes('[removed]')) return false;
    
    // Must contain opinion indicators or strong sentiment
    const hasOpinionIndicator = this.opinionKeywords.some(keyword => lowerText.includes(keyword));
    const hasStrongSentiment = this.hasStrongSentiment(lowerText);
    
    return hasOpinionIndicator || hasStrongSentiment;
  }

  private calculateRelevanceScore(text: string, score: number): number {
    let relevanceScore = 0;
    const lowerText = text.toLowerCase();

    // Opinion strength (0-30 points)
    const opinionCount = this.opinionKeywords.filter(keyword => lowerText.includes(keyword)).length;
    relevanceScore += Math.min(opinionCount * 5, 30);

    // Sentiment strength (0-20 points)
    const sentimentStrength = Math.abs(this.calculateSentiment(text));
    relevanceScore += sentimentStrength * 20;

    // Comment score bonus (0-25 points)
    if (score > 0) {
      relevanceScore += Math.min(Math.log(score + 1) * 5, 25);
    }

    // Length bonus for substantial comments (0-15 points)
    if (text.length > 100) {
      relevanceScore += Math.min((text.length - 100) / 50, 15);
    }

    // Topic diversity bonus (0-10 points)
    const topicCount = this.detectTopics(text).length;
    relevanceScore += Math.min(topicCount * 3, 10);

    return relevanceScore;
  }

  private calculateContradictionPotential(comment1: ProcessedComment, comment2: ProcessedComment): number {
    let potential = 0;

    // Sentiment opposition (0-0.4)
    const sentimentDiff = Math.abs(comment1.sentiment - comment2.sentiment);
    potential += Math.min(sentimentDiff, 0.4);

    // Topic overlap bonus (0-0.3)
    const topicOverlap = this.getTopicOverlap(comment1.topics, comment2.topics);
    potential += Math.min(topicOverlap.length * 0.1, 0.3);

    // Time difference bonus (0-0.2)
    const daysDiff = comment1.timeDifference / (24 * 60 * 60);
    if (daysDiff > 30) potential += 0.1;
    if (daysDiff > 90) potential += 0.1;

    // Strong opinion words bonus (0-0.2)
    if (this.hasStrongOpinions(comment1.text) && this.hasStrongOpinions(comment2.text)) {
      potential += 0.2;
    }

    // Penalty for high similarity (likely not contradictory)
    const similarity = this.calculateTextSimilarity(comment1.text, comment2.text);
    if (similarity > 0.7) potential -= 0.3;

    return Math.max(0, potential);
  }

  private hasStrongSentiment(text: string): boolean {
    const words = text.split(/\s+/);
    return words.some(word => 
      this.strongSentimentWords.positive.includes(word.toLowerCase()) ||
      this.strongSentimentWords.negative.includes(word.toLowerCase())
    );
  }

  private hasStrongOpinions(text: string): boolean {
    const strongWords = ['absolutely', 'definitely', 'completely', 'totally', 'always', 'never'];
    const lowerText = text.toLowerCase();
    return strongWords.some(word => lowerText.includes(word));
  }

  private isQuestion(text: string): boolean {
    return text.trim().endsWith('?') || text.toLowerCase().startsWith('what') || 
           text.toLowerCase().startsWith('how') || text.toLowerCase().startsWith('why');
  }

  private detectTopics(text: string): string[] {
    const lowerText = text.toLowerCase();
    const detectedTopics: string[] = [];

    Object.entries(this.topicKeywords).forEach(([topic, keywords]) => {
      const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matchCount > 0) {
        detectedTopics.push(topic);
      }
    });

    return detectedTopics.length > 0 ? detectedTopics : ['opinion'];
  }

  private calculateSentiment(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let wordCount = 0;

    words.forEach(word => {
      if (this.strongSentimentWords.positive.includes(word)) {
        score += 1;
        wordCount++;
      }
      if (this.strongSentimentWords.negative.includes(word)) {
        score -= 1;
        wordCount++;
      }
    });

    return wordCount > 0 ? score / wordCount : 0;
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = [];
    
    // Simple entity extraction patterns
    const patterns = [
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, // Names
      /\b(iPhone|Android|Tesla|Netflix|Amazon|Google|Apple|Microsoft)\b/gi, // Brands
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)].slice(0, 5);
  }

  private getTopicOverlap(topics1: string[], topics2: string[]): string[] {
    return topics1.filter(topic => topics2.includes(topic));
  }

  private getEntityOverlap(entities1: string[], entities2: string[]): string[] {
    return entities1.filter(entity => 
      entities2.some(e => e.toLowerCase() === entity.toLowerCase())
    );
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }
}

export const smartPreprocessor = new SmartPreprocessor();