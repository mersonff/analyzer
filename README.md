# Text Analyzer API

[![Tests](https://img.shields.io/badge/tests-21%20passing-brightgreen)](https://github.com/mersonff/analyzer)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Uma API RESTful para análise de texto que fornece estatísticas detalhadas sobre textos fornecidos pelos usuários.

## Tecnologias Utilizadas

- **Linguagem**: TypeScript/Node.js
- **Framework**: Express.js
- **Documentação**: Swagger/OpenAPI
- **Linting**: ESLint
- **Formatação**: Prettier
- **Testes**: Jest
- **Logger**: Winston
- **Segurança**: Helmet, CORS, Rate Limiting

## Funcionalidades

- ✅ **Análise de texto com IA**: Contagem de palavras e análise de sentimento
- ✅ **Top 5 palavras mais frequentes** (filtradas de stopwords)  
- ✅ **Análise de sentimento usando IA pública** (Hugging Face API)
- ✅ **Busca por termo**: Encontre análises anteriores por conteúdo
- ✅ **Cache inteligente**: Histórico automático de todas as análises
- ✅ **Documentação interativa** com Swagger
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Logs estruturados** com Winston
- ✅ **Validação robusta** de entrada
- ✅ **Tratamento de erros** detalhado

## Integração com IA Pública

O projeto utiliza **APIs públicas de IA** para análise de sentimento:
- **Hugging Face API**: Modelo `distilbert-base-uncased-finetuned-sst-2-english`
- **Fallback inteligente**: Sistema local baseado em palavras-chave quando a API não está disponível
- **Análise robusta**: Retorna sentimento (positivo/negativo/neutro), confiança e resumo em português

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd text-analyzer
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Ou compile e execute em produção:
```bash
npm run build
npm start
```

## Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Executa a versão compilada
- `npm test` - Executa os testes
- `npm run lint` - Verifica problemas no código
- `npm run lint:fix` - Corrige problemas de linting automaticamente
- `npm run format` - Formata o código com Prettier
- `npm run format:check` - Verifica se o código está formatado corretamente

## Uso da API

### Endpoints Disponíveis

#### 🚀 POST /api/analyze-text
**Endpoint principal** - Analisa um texto com contagem de palavras e análise de sentimento usando IA.

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Este é um texto muito positivo e inspirador!"
  }'
```

**Response:**
```json
{
  "text": "Este é um texto muito positivo e inspirador!",
  "analysis": {
    "wordCount": 8,
    "topWords": [
      { "word": "texto", "count": 1 },
      { "word": "positivo", "count": 1 },
      { "word": "inspirador", "count": 1 }
    ],
    "sentiment": {
      "sentiment": "positive",
      "confidence": 0.95,
      "summary": "O texto demonstra um sentimento muito positivo"
    }
  },
  "timestamp": "2025-08-08T15:30:00.000Z"
}
```

#### 🔍 GET /api/search-term
Busca análises anteriores que contenham um termo específico.

**Request:**
```bash
curl "http://localhost:3000/api/search-term?term=positivo&limit=5"
```

**Query Parameters:**
- `term` (obrigatório): Termo a ser buscado nos textos
- `limit` (opcional): Número máximo de resultados (1-100, padrão: 10)

**Response:**
```json
{
  "term": "positivo",
  "results": [
    {
      "text": "Este é um texto muito positivo...",
      "analysis": {
        "wordCount": 8,
        "topWords": [...],
        "sentiment": {...}
      },
      "timestamp": "2025-08-08T15:30:00.000Z"
    }
  ],
  "found": 1,
  "limit": 5
}
```

### Documentação Completa

Acesse a documentação interativa da API em: `http://localhost:3000/api-docs`

## Estrutura do Projeto

```
src/
├── controllers/     # Controladores da API (textController.ts)
├── middleware/      # Middlewares (validation.ts, errorHandler.ts)
├── routes/          # Definição das rotas (textRoutes.ts)
├── services/        # Lógica de negócio (análise de texto, cache, sentimento, stopwords)
├── utils/           # Utilitários (logger.ts)
└── __tests__/       # Testes unitários

logs/                # Logs da aplicação (combined.log, error.log)
```

## Limites e Validações

- **Tamanho máximo do texto**: 100.000 caracteres
- **Rate limit**: 100 requests por IP a cada 15 minutos
- **Texto obrigatório**: Não pode ser vazio ou nulo
- **Cache inteligente**: Mantém histórico de todas as análises em memória
- **Busca case-insensitive**: Termos podem ser encontrados independente de maiúsculas/minúsculas

## Desenvolvimento

O projeto utiliza:
- **TypeScript** para tipagem estática
- **ESLint** para qualidade do código  
- **Prettier** para formatação consistente
- **Jest** para testes unitários (21 testes passando)
- **Nodemon** para desenvolvimento com hot reload
- **Winston** para logs estruturados
- **Swagger/OpenAPI** para documentação interativa

## Análise de Sentimento com IA

- **API Principal**: Hugging Face (DistilBERT) - **Requer autenticação** 🔑
- **Fallback Local**: Sistema baseado em palavras-chave (sempre disponível)
- **Saída**: Sentimento (positive/negative/neutral), confiança e resumo em português

### 🔧 Configuração da API Hugging Face (Opcional)

Para usar análise de sentimento com IA real:

1. **Criar conta**: [huggingface.co](https://huggingface.co/join)
2. **Gerar token**: Settings → Access Tokens → New Token
3. **Configurar variável de ambiente**:
   ```bash
   # .env
   HUGGING_FACE_TOKEN=hf_xxxxxxxxxxxxxxxxx
   ```
4. **Descomentar linha de autorização** em `src/services/sentimentAnalysisService.ts`:
   ```typescript
   'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
   ```

**Sem token**: O sistema usa fallback local (funciona perfeitamente!) 🚀

## CI/CD e Qualidade

O projeto inclui um pipeline completo de CI/CD com GitHub Actions:

### ✅ Verificações Automáticas
- **Testes unitários** (21 testes)
- **Linting** com ESLint
- **Formatação** com Prettier
- **Type checking** com TypeScript
- **Build** de produção
- **Docker build** e teste do container
- **Cobertura de código**

### 🔒 Branch Protection
- **Main branch protegida** - não permite push direto
- **Pull requests obrigatórios**
- **Status checks obrigatórios** - todos os testes devem passar
- **Reviews obrigatórios** antes do merge
- **Branch deve estar atualizada** com main

### 🚀 Como usar
```bash
# Configurar branch protection (uma vez só)
./setup-branch-protection.sh

# Workflow automático roda em:
# - Push para main/develop
# - Pull requests para main/develop
```

### 📊 Status Checks
O workflow verifica:
1. **Tests** - Todos os testes unitários
2. **Quality Check** - Lint, format, type check
3. **Build Docker** - Container funcional
4. **CI Status** - Status geral combinado

---

*This is a challenge by [Coodesh](https://coodesh.com/)*
