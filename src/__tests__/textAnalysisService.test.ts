import { TextAnalysisService } from '../services/textAnalysisService';

describe('TextAnalysisService', () => {
  let service: TextAnalysisService;

  beforeEach(() => {
    service = new TextAnalysisService();
  });

  describe('analyzeText', () => {
    it('should analyze simple text correctly', async () => {
      const text = 'Hello world. This is a test.';
      const result = await service.analyzeText(text, false); // Skip sentiment for faster test

      expect(result.characterCount).toBe(28);
      expect(result.characterCountNoSpaces).toBe(23);
      expect(result.wordCount).toBe(6);
      expect(result.sentenceCount).toBe(2);
      expect(result.paragraphCount).toBe(1);
      expect(result.averageWordsPerSentence).toBe(3);
      expect(result.mostCommonWords.length).toBeGreaterThan(0);
      expect(result.topWords.length).toBeGreaterThan(0);
    });

    it('should handle empty text', async () => {
      await expect(service.analyzeText('')).rejects.toThrow(
        'Text must be a non-empty string'
      );
    });

    it('should handle non-string input', async () => {
      await expect(service.analyzeText(null as any)).rejects.toThrow(
        'Text must be a non-empty string'
      );
      await expect(service.analyzeText(123 as any)).rejects.toThrow(
        'Text must be a non-empty string'
      );
    });

    it('should count paragraphs correctly', async () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const result = await service.analyzeText(text, false);

      expect(result.paragraphCount).toBe(3);
    });

    it('should filter stopwords in topWords', async () => {
      const text =
        'The big dog and the cat. The dog is very big and beautiful.';
      const result = await service.analyzeText(text, false);

      // topWords should not include most common stopwords like "the", "and", "is"
      // Note: "very" might still appear as it's not in our stopwords list and could be considered meaningful
      const stopwordsInTopWords = result.topWords.filter(w =>
        ['the', 'and'].includes(w.word)
      );
      expect(stopwordsInTopWords.length).toBe(0);

      // Should include meaningful words
      expect(result.topWords.some(w => w.word === 'big')).toBe(true);
      expect(result.topWords.some(w => w.word === 'dog')).toBe(true);
    });

    it('should handle text with only punctuation', async () => {
      const text = '!@#$%^&*()';
      const result = await service.analyzeText(text, false);

      expect(result.characterCount).toBe(10);
      expect(result.wordCount).toBe(0);
      expect(result.mostCommonWords).toEqual([]);
      expect(result.topWords).toEqual([]);
    });

    it('should include sentiment analysis when requested', async () => {
      const text = 'This is a wonderful and amazing day!';
      const result = await service.analyzeText(text, true);

      expect(result.sentiment).toBeDefined();
      if (result.sentiment) {
        expect(['positive', 'negative', 'neutral']).toContain(
          result.sentiment.sentiment
        );
        expect(typeof result.sentiment.score).toBe('number');
        expect(typeof result.sentiment.summary).toBe('string');
      }
    }, 15000); // Longer timeout for API call

    it('should skip sentiment analysis when not requested', async () => {
      const text = 'This is a test.';
      const result = await service.analyzeText(text, false);

      expect(result.sentiment).toBeUndefined();
    });
  });
});
