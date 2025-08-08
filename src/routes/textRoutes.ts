import express from 'express';
import textController from '../controllers/textController';
import { validateText } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TextAnalysisRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: O texto a ser analisado
 *           example: "Este é um exemplo de texto para análise. Ele demonstra um sentimento positivo!"
 *     AnalysisResult:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           description: O texto original
 *         analysis:
 *           type: object
 *           properties:
 *             wordCount:
 *               type: integer
 *               description: Contagem total de palavras
 *             topWords:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   word:
 *                     type: string
 *                   count:
 *                     type: integer
 *               description: As 5 palavras mais frequentes
 *             sentiment:
 *               type: object
 *               properties:
 *                 sentiment:
 *                   type: string
 *                   enum: [positive, negative, neutral]
 *                 confidence:
 *                   type: number
 *                 summary:
 *                   type: string
 *               description: Análise de sentimento usando IA
 *         timestamp:
 *           type: string
 *           format: date-time
 *     SearchTermResponse:
 *       type: object
 *       properties:
 *         term:
 *           type: string
 *           description: Termo buscado
 *           example: "exemplo"
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnalysisResult'
 *           description: Análises que contêm o termo
 *         found:
 *           type: integer
 *           description: Número de resultados encontrados
 *           example: 3
 *         limit:
 *           type: integer
 *           description: Limite aplicado na busca
 *           example: 10
 */

/**
 * @swagger
 * /api/analyze-text:
 *   post:
 *     summary: Analisa um texto fornecido
 *     description: Endpoint principal para análise de texto com contagem de palavras e análise de sentimento usando IA
 *     tags: [Text Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TextAnalysisRequest'
 *     responses:
 *       200:
 *         description: Análise do texto realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResult'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Text is required and must be a non-empty string"
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/analyze-text', validateText, textController.analyzeText);

/**
 * @swagger
 * /api/search-term:
 *   get:
 *     summary: Buscar análises por termo
 *     description: Busca análises anteriores que contenham um termo específico no texto
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: term
 *         required: true
 *         description: Termo a ser buscado nos textos analisados
 *         schema:
 *           type: string
 *           example: "exemplo"
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Número máximo de resultados (1-100, padrão 10)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 term:
 *                   type: string
 *                   description: Termo buscado
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnalysisResult'
 *                   description: Análises que contêm o termo
 *                 found:
 *                   type: integer
 *                   description: Número de resultados encontrados
 *                 limit:
 *                   type: integer
 *                   description: Limite aplicado na busca
 *       400:
 *         description: Termo de busca inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Search term is required and must be a string"
 */
router.get('/search-term', textController.searchTerm);

export default router;
