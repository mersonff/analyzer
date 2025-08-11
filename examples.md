# Exemplos de uso da API

## 1. Testar se a API está funcionando
```bash
curl http://localhost:3000/
```

## 2. Analisar um texto (endpoint principal)
```bash
curl -X POST http://localhost:3000/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Este é um exemplo de texto para análise. Ele contém várias palavras e demonstra um sentimento muito positivo!"
  }'
```

## 3. Buscar análises por termo
```bash
curl "http://localhost:3000/api/search-term?term=exemplo&limit=5"
```

## 4. Acessar documentação Swagger
Abra no navegador: http://localhost:3000/api-docs

## Exemplo de resposta da análise:
```json
{
  "text": "Este é um exemplo de texto para análise...",
  "analysis": {
    "wordCount": 12,
    "topWords": [
      { "word": "texto", "count": 2 },
      { "word": "exemplo", "count": 1 },
      { "word": "análise", "count": 1 }
    ],
    "sentiment": {
      "sentiment": "positive",
      "score": 0.95,
      "summary": "O texto demonstra um sentimento positivo"
    }
  },
  "timestamp": "2025-08-08T15:30:00.000Z"
}
```

## Exemplo de resposta da busca:
```json
{
  "term": "exemplo",
  "results": [
    {
      "text": "Este é um exemplo de texto...",
      "analysis": {
        "wordCount": 12,
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
