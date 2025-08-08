import { StopwordsService } from './stopwordsService';
import { SentimentAnalysisService, SentimentAnalysis } from './sentimentAnalysisService';

export interface WordCount {
  word: string;
  count: number;
}

export interface TextAnalysis {
  characterCount: number;
  characterCountNoSpaces: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  mostCommonWords: WordCount[];
  topWords: WordCount[]; // Top 5 words without stopwords
  sentiment?: SentimentAnalysis;
}

export class TextAnalysisService {
  private stopwordsService: StopwordsService;
  private sentimentService: SentimentAnalysisService;

  constructor() {
    this.stopwordsService = new StopwordsService();
    this.sentimentService = new SentimentAnalysisService();
  }

  public async analyzeText(text: string, includeSentiment = true): Promise<TextAnalysis> {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;

    // Word count
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const wordCount = words.length;

    // Sentence count (simplified - counts periods, exclamation marks, question marks)
    const sentences = text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;

    // Paragraph count
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0);
    const paragraphCount = Math.max(paragraphs.length, 1);

    // Average words per sentence
    const averageWordsPerSentence =
      sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Most common words (including short words and stopwords)
    const wordFrequency = this.getWordFrequency(words);
    const mostCommonWords = Object.entries(wordFrequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top 5 words without stopwords
    const topWords = this.stopwordsService.getTopWords(words, 5);

    // Sentiment analysis
    let sentiment: SentimentAnalysis | undefined;
    if (includeSentiment) {
      try {
        sentiment = await this.sentimentService.analyzeSentiment(text);
      } catch (error) {
        // Sentiment analysis is optional, continue without it
        sentiment = undefined;
      }
    }

    return {
      characterCount,
      characterCountNoSpaces,
      wordCount,
      sentenceCount,
      paragraphCount,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 100) / 100,
      mostCommonWords,
      topWords,
      sentiment,
    };
  }

  private getWordFrequency(words: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};

    for (const word of words) {
      if (word.length > 0) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    }

    return frequency;
  }
}
