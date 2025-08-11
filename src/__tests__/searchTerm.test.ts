import { CacheService } from '../services/cacheService';

describe('CacheService - Search Term', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  describe('searchByTerm', () => {
    it('should return empty array when no term provided', () => {
      const result = cacheService.searchByTerm('');
      expect(result).toEqual([]);
    });

    it('should return empty array when term is only whitespace', () => {
      const result = cacheService.searchByTerm('   ');
      expect(result).toEqual([]);
    });

    it('should find analyses containing the search term', () => {
      // Add test data
      const testAnalysis1 = {
        text: 'This is a wonderful day!',
        analysis: {
          characterCount: 24,
          characterCountNoSpaces: 20,
          wordCount: 5,
          sentenceCount: 1,
          paragraphCount: 1,
          averageWordsPerSentence: 5,
          mostCommonWords: [{ word: 'wonderful', count: 1 }],
          topWords: [{ word: 'wonderful', count: 1 }],
          sentiment: {
            sentiment: 'positive' as const,
            score: 0.9,
            summary: 'Sentimento positivo detectado',
          },
        },
        timestamp: '2025-01-01T00:00:00Z',
      };

      const testAnalysis2 = {
        text: 'Another example text',
        analysis: {
          characterCount: 20,
          characterCountNoSpaces: 17,
          wordCount: 3,
          sentenceCount: 1,
          paragraphCount: 1,
          averageWordsPerSentence: 3,
          mostCommonWords: [{ word: 'example', count: 1 }],
          topWords: [{ word: 'example', count: 1 }],
          sentiment: {
            sentiment: 'neutral' as const,
            score: 0.5,
            summary: 'Sentimento neutro',
          },
        },
        timestamp: '2025-01-01T00:01:00Z',
      };

      cacheService.addAnalysis(testAnalysis1);
      cacheService.addAnalysis(testAnalysis2);

      // Search for 'wonderful' - should find first analysis
      const result1 = cacheService.searchByTerm('wonderful');
      expect(result1).toHaveLength(1);
      expect(result1[0].text).toBe('This is a wonderful day!');

      // Search for 'example' - should find second analysis
      const result2 = cacheService.searchByTerm('example');
      expect(result2).toHaveLength(1);
      expect(result2[0].text).toBe('Another example text');

      // Search for 'text' - should find second analysis
      const result3 = cacheService.searchByTerm('text');
      expect(result3).toHaveLength(1);
      expect(result3[0].text).toBe('Another example text');
    });

    it('should be case insensitive', () => {
      const testAnalysis = {
        text: 'Testing CASE sensitivity',
        analysis: {
          characterCount: 24,
          characterCountNoSpaces: 21,
          wordCount: 3,
          sentenceCount: 1,
          paragraphCount: 1,
          averageWordsPerSentence: 3,
          mostCommonWords: [{ word: 'testing', count: 1 }],
          topWords: [{ word: 'testing', count: 1 }],
          sentiment: {
            sentiment: 'neutral' as const,
            score: 0.5,
            summary: 'Sentimento neutro',
          },
        },
        timestamp: '2025-01-01T00:00:00Z',
      };

      cacheService.addAnalysis(testAnalysis);

      // Test different cases
      expect(cacheService.searchByTerm('TESTING')).toHaveLength(1);
      expect(cacheService.searchByTerm('testing')).toHaveLength(1);
      expect(cacheService.searchByTerm('Testing')).toHaveLength(1);
      expect(cacheService.searchByTerm('case')).toHaveLength(1);
      expect(cacheService.searchByTerm('CASE')).toHaveLength(1);
    });

    it('should respect the limit parameter', () => {
      // Add multiple analyses with the same term
      for (let i = 1; i <= 15; i++) {
        const testAnalysis = {
          text: `Test analysis number ${i}`,
          analysis: {
            characterCount: 20,
            characterCountNoSpaces: 17,
            wordCount: 4,
            sentenceCount: 1,
            paragraphCount: 1,
            averageWordsPerSentence: 4,
            mostCommonWords: [{ word: 'test', count: 1 }],
            topWords: [{ word: 'test', count: 1 }],
            sentiment: {
              sentiment: 'neutral' as const,
              score: 0.5,
              summary: 'Sentimento neutro',
            },
          },
          timestamp: `2025-01-01T00:0${i < 10 ? '0' + i : i}:00Z`,
        };
        cacheService.addAnalysis(testAnalysis);
      }

      // Test different limits
      expect(cacheService.searchByTerm('test', 5)).toHaveLength(5);
      expect(cacheService.searchByTerm('test', 10)).toHaveLength(10);
      expect(cacheService.searchByTerm('test', 20)).toHaveLength(15); // Should return all 15
    });

    it('should return empty array when no matches found', () => {
      const testAnalysis = {
        text: 'This is a sample text',
        analysis: {
          characterCount: 21,
          characterCountNoSpaces: 17,
          wordCount: 5,
          sentenceCount: 1,
          paragraphCount: 1,
          averageWordsPerSentence: 5,
          mostCommonWords: [{ word: 'sample', count: 1 }],
          topWords: [{ word: 'sample', count: 1 }],
          sentiment: {
            sentiment: 'neutral' as const,
            score: 0.5,
            summary: 'Sentimento neutro',
          },
        },
        timestamp: '2025-01-01T00:00:00Z',
      };

      cacheService.addAnalysis(testAnalysis);

      const result = cacheService.searchByTerm('nonexistent');
      expect(result).toEqual([]);
    });
  });
});
