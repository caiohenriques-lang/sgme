import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { buildGeapinhoSystemPrompt } from './src/shared/geapinhoPrompt';

let geminiClient: GoogleGenAI | null = null;
let quotaExhaustedUntil: number | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada no ambiente.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'GEAPI Radar Portal' });
  });

  // Autenticação exclusiva do módulo Interrupções de Equipamentos
  app.post('/api/interrupcoes/auth', (req, res) => {
    try {
      const expectedPassword = 'GEAPIFE-CONTROLE';
      const { password } = req.body || {};

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ authenticated: false, error: 'Senha não fornecida.' });
      }

      if (password.trim() === expectedPassword) {
        return res.status(200).json({ authenticated: true });
      } else {
        return res.status(401).json({ authenticated: false, error: 'Senha incorreta.' });
      }
    } catch (err) {
      return res.status(500).json({ authenticated: false, error: 'Erro interno na validação de acesso.' });
    }
  });

  // AI Status check (determina se o GEAPINHO está ativo ou deve ser ocultado por falta de cota/token)
  app.get('/api/gemini/status', (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ available: false, reason: 'NO_API_KEY' });
    }
    if (quotaExhaustedUntil && Date.now() < quotaExhaustedUntil) {
      return res.json({
        available: false,
        reason: 'QUOTA_EXHAUSTED',
        retryAfter: quotaExhaustedUntil,
      });
    }
    return res.json({ available: true });
  });

  // AI Chat Route for GEAPI Assistant
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(401).json({
          error: 'GEMINI_API_KEY não configurada no ambiente.',
          isQuotaExhausted: true,
          code: 'NO_API_KEY',
        });
      }

      if (quotaExhaustedUntil && Date.now() < quotaExhaustedUntil) {
        return res.status(429).json({
          error: 'Cota de tokens do assistente temporariamente esgotada.',
          isQuotaExhausted: true,
          code: 'QUOTA_EXHAUSTED',
          retryAfter: quotaExhaustedUntil,
        });
      }

      const { message, history = [], context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Mensagem do usuário é obrigatória.' });
      }

      const ai = getGeminiClient();

      const systemInstruction = buildGeapinhoSystemPrompt(context);

      // Monta histórico de mensagens anteriores
      const formattedContents: any[] = [];
      for (const h of history) {
        formattedContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.parts }],
        });
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Modelo padrão de alta velocidade e resposta instantânea (Gemini 3.7 Flash sem latência de raciocínio)
      const modelName = 'gemini-3.7-flash';
      let response: any = null;

      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.2,
            maxOutputTokens: 800,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        });
      } catch (err: any) {
        console.warn(`Tentando fallback com gemini-flash-latest devido a:`, err?.message);
        try {
          response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.2,
              maxOutputTokens: 800,
            },
          });
        } catch (err2: any) {
          console.warn(`Tentando fallback simples para gemini-3.7-flash sem config especial:`, err2?.message);
          response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.2,
              maxOutputTokens: 800,
            },
          });
        }
      }

      const fullText = response?.text || 'Não foi possível gerar uma resposta no momento.';

      // Extrai ações estruturadas da resposta se presentes
      let text = fullText;
      let actions: any[] = [];

      const actionsMatch = fullText.match(/```actions\s*([\s\S]*?)\s*```/);
      if (actionsMatch) {
        try {
          actions = JSON.parse(actionsMatch[1]);
          text = fullText.replace(/```actions\s*[\s\S]*?\s*```/, '').trim();
        } catch (e) {
          console.warn('Erro ao parsear bloco de ações do Gemini:', e);
        }
      }

      res.json({
        text,
        actions,
      });
    } catch (error: any) {
      console.error('Erro na rota /api/gemini/chat:', error);
      const errMsg = (error?.message || '').toString();
      const errStatus = error?.status || error?.statusCode || error?.code;
      
      const isQuota = 
        errStatus === 429 ||
        /resource_exhausted|quota|rate limit|too many requests|tokens/i.test(errMsg);

      if (isQuota) {
        // Bloqueia temporariamente por 1 hora (ou até reinício da cota)
        quotaExhaustedUntil = Date.now() + 60 * 60 * 1000;
        return res.status(429).json({
          error: 'Cota de tokens da API Gemini esgotada.',
          code: 'RESOURCE_EXHAUSTED',
          isQuotaExhausted: true,
          retryAfter: quotaExhaustedUntil,
        });
      }

      res.status(500).json({
        error: error.message || 'Erro interno ao processar a solicitação de IA.',
        isQuotaExhausted: false,
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

