import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { buildGeapinhoSystemPrompt } from '../../src/shared/geapinhoPrompt';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada no ambiente da Vercel.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });
  }
  return geminiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { message, history = [], context = {} } = req.body || {};

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

    return res.status(200).json({
      text,
      actions,
    });
  } catch (error: any) {
    console.error('Erro na serverless function /api/gemini/chat:', error);
    return res.status(500).json({
      error: error.message || 'Erro interno ao processar a solicitação de IA na Vercel.',
    });
  }
}
