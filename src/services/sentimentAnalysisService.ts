import axios from 'axios';
import logger from '../utils/logger';

export interface SentimentResult {
  label: string;
  score: number;
}

export interface SentimentAnalysis {
  sentiment: string;
  score: number;
  summary: string;
}

export class SentimentAnalysisService {
  // Nota: A API da Hugging Face pode ter mudanças nos modelos disponíveis
  // O sistema usa fallback local confiável quando a API não está disponível
  private readonly huggingFaceUrl =
    'https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english';

  public async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      // Limit text size for API call (Hugging Face has limits)
      const truncatedText = text.substring(0, 512);

      const response = await axios.post<SentimentResult[][]>(
        this.huggingFaceUrl,
        {
          inputs: truncatedText,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          },
          timeout: 10000,
        }
      );

      if (!response.data || !Array.isArray(response.data) || !Array.isArray(response.data[0])) {
        throw new Error('Invalid response from Hugging Face API');
      }

      // Get the result with highest score from the first array
      const results = response.data[0];
      const result = results.reduce((prev, current) =>
        current.score > prev.score ? current : prev
      );

      return {
        sentiment: result.label === 'POSITIVE' ? 'positive' : 'negative',
        score: result.score, // score is already a score value
        summary: this.generateSentimentSummary(
          result.label === 'POSITIVE' ? 'positive' : 'negative', 
          result.score
        ),
      };
    } catch (error) {
      logger.error('error', {
        message: `Error analyzing sentiment with Hugging Face: ${(error as Error).message}`,
        service: 'text-analyzer',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      });
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
    let score: number;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min(0.6 + (positiveCount - negativeCount) * 0.1, 0.95);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = Math.min(0.6 + (negativeCount - positiveCount) * 0.1, 0.95);
    } else {
      sentiment = 'neutral';
      score = 0.5;
    }

    return {
      sentiment,
      score: Math.round(score * 100) / 100,
      summary: `Análise baseada em palavras-chave (fallback): ${sentiment} com ${Math.round(score * 100)}% de confiança`,
    };
  }

  private generateSentimentSummary(
    sentiment: string,
    score: number
  ): string {
    const scorePercent = Math.round(score * 100);

    const sentimentLabels: Record<string, string> = {
      positive: 'positivo',
      negative: 'negativo',
      neutral: 'neutro',
    };

    const sentimentLabel = sentimentLabels[sentiment] || sentiment;

    if (scorePercent >= 80) {
      return `O texto demonstra um sentimento claramente ${sentimentLabel} (${scorePercent}% de confiança).`;
    } else if (scorePercent >= 60) {
      return `O texto tende a ser ${sentimentLabel} (${scorePercent}% de confiança).`;
    } else {
      return `O sentimento do texto é incerto, mas ligeiramente ${sentimentLabel} (${scorePercent}% de confiança).`;
    }
  }
}
