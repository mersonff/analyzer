import { TextAnalysis } from './textAnalysisService';

export interface AnalysisResult {
  text: string;
  analysis: TextAnalysis;
  timestamp: string;
}

export interface Stats {
  totalAnalyses: number;
  averageWordCount: number;
  averageCharacterCount: number;
  lastAnalysis: string | null;
}

export class CacheService {
  private analyses: AnalysisResult[] = [];
  private maxSize = 1000; // Maximum number of analyses to keep in memory

  public addAnalysis(analysis: AnalysisResult): void {
    this.analyses.unshift(analysis); // Add to beginning

    // Keep only the most recent analyses
    if (this.analyses.length > this.maxSize) {
      this.analyses = this.analyses.slice(0, this.maxSize);
    }
  }

  public getHistory(limit: number = 10): AnalysisResult[] {
    return this.analyses.slice(0, Math.min(limit, this.analyses.length));
  }

  public searchByTerm(term: string, limit: number = 10): AnalysisResult[] {
    const searchTerm = term.toLowerCase().trim();

    if (!searchTerm) {
      return [];
    }

    const matches = this.analyses.filter(analysis =>
      analysis.text.toLowerCase().includes(searchTerm)
    );

    return matches.slice(0, Math.min(limit, matches.length));
  }

  public getTotalCount(): number {
    return this.analyses.length;
  }

  public getStats(): Stats {
    if (this.analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageWordCount: 0,
        averageCharacterCount: 0,
        lastAnalysis: null,
      };
    }

    const totalWords = this.analyses.reduce(
      (sum, analysis) => sum + analysis.analysis.wordCount,
      0
    );

    const totalCharacters = this.analyses.reduce(
      (sum, analysis) => sum + analysis.analysis.characterCount,
      0
    );

    return {
      totalAnalyses: this.analyses.length,
      averageWordCount:
        Math.round((totalWords / this.analyses.length) * 100) / 100,
      averageCharacterCount:
        Math.round((totalCharacters / this.analyses.length) * 100) / 100,
      lastAnalysis: this.analyses[0]?.timestamp || null,
    };
  }

  public clear(): void {
    this.analyses = [];
  }
}
