import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from './utils/logger';
import textRoutes from './routes/textRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Text Analyzer API',
      version: '1.0.0',
      description: 'API para análise de texto com funcionalidades de contagem de palavras, caracteres e análise de sentimentos',
    },
    servers: [
      {
        url: 'https://text-analyzer-api-ihg6y4y3ta-uc.a.run.app',
        description: 'Production server (Google Cloud Run)',
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api', textRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Text Analyzer API is running!',
    documentation: '/api-docs',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
