import { Request, Response } from 'express';
import { TextAnalysisService } from '../services/textAnalysisService';
import { CacheService } from '../services/cacheService';
import logger from '../utils/logger';

interface TextAnalysisRequest extends Request {
  body: {
    text: string;
  };
}

interface SearchRequest extends Request {
  query: {
    term: string;
    limit?: string;
  };
}

class TextController {
  private textAnalysisService: TextAnalysisService;
  private cacheService: CacheService;

  constructor() {
    this.textAnalysisService = new TextAnalysisService();
    this.cacheService = new CacheService();
  }

  public analyzeText = async (
    req: TextAnalysisRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { text } = req.body;

      logger.info('Analyzing text', { textLength: text.length });

      const analysis = await this.textAnalysisService.analyzeText(text);

      const result = {
        text,
        analysis,
        timestamp: new Date().toISOString(),
      };

      // Save to cache/history
      this.cacheService.addAnalysis(result);

      res.json(result);
    } catch (error) {
      logger.error('Error analyzing text:', error);
      res.status(500).json({
        error: 'Internal server error while analyzing text',
      });
    }
  };

  public searchTerm = async (
    req: SearchRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { term } = req.query;

      if (!term || typeof term !== 'string') {
        res.status(400).json({
          error: 'Search term is required and must be a string',
        });
        return;
      }

      const limit = parseInt(req.query.limit || '10', 10);
      const validLimit = Math.max(1, Math.min(limit, 100));

      logger.info('Searching for term', { term, limit: validLimit });

      const results = this.cacheService.searchByTerm(term, validLimit);

      res.json({
        term,
        results,
        found: results.length,
        limit: validLimit,
      });
    } catch (error) {
      logger.error('Error searching term:', error);
      res.status(500).json({
        error: 'Internal server error while searching term',
      });
    }
  };
}

export default new TextController();
