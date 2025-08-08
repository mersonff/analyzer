import { CacheService } from '../services/cacheService';
import { TextAnalysis } from '../services/textAnalysisService';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    service = new CacheService();
  });

  const createMockAnalysis = (text: string, wordCount: number = 10): any => ({
    text,
    analysis: {
      characterCount: text.length,
      characterCountNoSpaces: text.replace(/\s/g, '').length,
      wordCount,
      sentenceCount: 1,
      paragraphCount: 1,
      averageWordsPerSentence: wordCount,
      mostCommonWords: [],
      topWords: [], // Added missing property
    } as TextAnalysis,
    timestamp: new Date().toISOString(),
  });

  describe('addAnalysis', () => {
    it('should add analysis to cache', () => {
      const analysis = createMockAnalysis('test text');

      service.addAnalysis(analysis);

      expect(service.getTotalCount()).toBe(1);
      expect(service.getHistory(1)[0]).toEqual(analysis);
    });

    it('should add new analyses at the beginning', () => {
      const analysis1 = createMockAnalysis('first text');
      const analysis2 = createMockAnalysis('second text');

      service.addAnalysis(analysis1);
      service.addAnalysis(analysis2);

      const history = service.getHistory(2);
      expect(history[0]).toEqual(analysis2);
      expect(history[1]).toEqual(analysis1);
    });
  });

  describe('getHistory', () => {
    it('should return limited number of analyses', () => {
      for (let i = 0; i < 5; i++) {
        service.addAnalysis(createMockAnalysis(`text ${i}`));
      }

      const history = service.getHistory(3);
      expect(history.length).toBe(3);
    });

    it('should return empty array when no analyses', () => {
      const history = service.getHistory(10);
      expect(history).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      service.addAnalysis(createMockAnalysis('text 1', 5)); // 6 chars
      service.addAnalysis(createMockAnalysis('text 2 longer', 10)); // 13 chars

      const stats = service.getStats();

      expect(stats.totalAnalyses).toBe(2);
      expect(stats.averageWordCount).toBe(7.5);
      expect(stats.averageCharacterCount).toBe(9.5); // (6 + 13) / 2
      expect(stats.lastAnalysis).toBeTruthy();
    });

    it('should return empty stats when no analyses', () => {
      const stats = service.getStats();

      expect(stats.totalAnalyses).toBe(0);
      expect(stats.averageWordCount).toBe(0);
      expect(stats.averageCharacterCount).toBe(0);
      expect(stats.lastAnalysis).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all analyses', () => {
      service.addAnalysis(createMockAnalysis('test'));
      expect(service.getTotalCount()).toBe(1);

      service.clear();
      expect(service.getTotalCount()).toBe(0);
    });
  });
});
