import axios from 'axios';
import logger from '../utils/logger';

export interface SentimentResult {
  label: string;
  confidence: number;
}

export interface SentimentAnalysis {
  sentiment: string;
  confidence: number;
  summary: string;
}

export class SentimentAnalysisService {
  private readonly huggingFaceUrl =
    'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';

  public async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      // Limit text size for API call (Hugging Face has limits)
      const truncatedText = text.substring(0, 512);

      const response = await axios.post<SentimentResult[]>(
        this.huggingFaceUrl,
        {
          inputs: truncatedText,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response from Hugging Face API');
      }

      // Get the result with highest confidence
      const result = response.data.reduce((prev, current) =>
        current.confidence > prev.confidence ? current : prev
      );

      const sentiment = result.label.toLowerCase();
      const confidence = Math.round(result.confidence * 100) / 100;

      return {
        sentiment,
        confidence,
        summary: this.generateSentimentSummary(sentiment, confidence),
      };
    } catch (error) {
      logger.error('Error analyzing sentiment with Hugging Face:', error);

      // Fallback to simple keyword-based sentiment analysis
      return this.fallbackSentimentAnalysis(text);
    }
  }

  private fallbackSentimentAnalysis(text: string): SentimentAnalysis {
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'love',
      'like',
      'happy',
      'joy',
      'positive',
      'best',
      'awesome',
      'perfect',
    ];

    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'horrible',
      'hate',
      'dislike',
      'sad',
      'angry',
      'negative',
      'worst',
      'disappointing',
      'poor',
      'frustrating',
    ];

    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word =>
      positiveWords.includes(word)
    ).length;
    const negativeCount = words.filter(word =>
      negativeWords.includes(word)
    ).length;

    let sentiment: string;
    let confidence: number;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.6 + (positiveCount - negativeCount) * 0.1, 0.95);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.6 + (negativeCount - positiveCount) * 0.1, 0.95);
    } else {
      sentiment = 'neutral';
      confidence = 0.5;
    }

    return {
      sentiment,
      confidence: Math.round(confidence * 100) / 100,
      summary: `Análise baseada em palavras-chave (fallback): ${sentiment} com ${Math.round(confidence * 100)}% de confiança`,
    };
  }

  private generateSentimentSummary(
    sentiment: string,
    confidence: number
  ): string {
    const confidencePercent = Math.round(confidence * 100);

    const sentimentLabels: Record<string, string> = {
      positive: 'positivo',
      negative: 'negativo',
      neutral: 'neutro',
    };

    const sentimentLabel = sentimentLabels[sentiment] || sentiment;

    if (confidencePercent >= 80) {
      return `O texto demonstra um sentimento claramente ${sentimentLabel} (${confidencePercent}% de confiança).`;
    } else if (confidencePercent >= 60) {
      return `O texto tende a ser ${sentimentLabel} (${confidencePercent}% de confiança).`;
    } else {
      return `O sentimento do texto é incerto, mas ligeiramente ${sentimentLabel} (${confidencePercent}% de confiança).`;
    }
  }
}
