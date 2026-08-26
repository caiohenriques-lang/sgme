import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

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

  // AI Chat Route for GEAPI Assistant
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Mensagem do usuário é obrigatória.' });
      }

      const ai = getGeminiClient();

      const systemInstruction = `Você é o "Assistente Inteligente GEAPI", a IA oficial do Portal da Gerência de Análise e Processamento de Infrações (GEAPI) da BHTRANS / Prefeitura de Belo Horizonte (PBH).
Desenvolvido por Caio Henriques de O. L. Cordeiro.

SEU PAPEL:
- Responder com MÁXIMA OBJETIVIDADE, CONCISÃO CIRÚRGICA e PRECISÃO MATEMÁTICA sobre LOCAIS, EQUIPAMENTOS (códigos, tipos como CEV, DAS, DIF, etc.), FAIXAS (em operação, em implantação, em relocação e inoperantes) e CONTRATOS no âmbito da fiscalização eletrônica de Belo Horizonte.

DIRETRIZES DE RESPOSTA CONCISA E EXATA:
1. RESPONDA ESTRITAMENTE O QUE FOI PERGUNTADO (SEM ENCHIMENTO DE LINGUIÇA):
   - Se o usuário perguntou "Quantas faixas em implantação CEV?", responda DIRETAMENTE com o número exato, por exemplo:
     "📍 **Faixas CEV em implantação:** [X] faixas ([Y] equipamentos/locais)."
   - NÃO adicione introduções longas, tabelas gigantes não solicitadas, notas desnecessárias de rodapé ou parágrafos redundantes quando o usuário fizer uma pergunta pontual.
   - Seja extremamente sucinto, claro e direto ao ponto.

2. DISTINÇÃO CLARA ENTRE EQUIPAMENTOS E FAIXAS:
   - Fique atento se o usuário perguntou sobre **FAIXAS** ou sobre **EQUIPAMENTOS / LOCAIS**.
   - No contexto do GEAPI:
     * **Faixas**: Quantidade total de faixas monitoradas (soma da coluna FAIXAS).
     * **Equipamentos**: Quantidade de unidades/postos físicos de radar.
     * Sempre que informar faixas, se útil, cite entre parênteses a quantidade de equipamentos correspondente para evitar ambiguidades.

3. DADOS EXATOS POR TIPO DE EQUIPAMENTO (CEV, DAS, DIF, etc.):
   - Utilize rigorosamente os números pré-calculados no objeto summary.porTipo[TIPO] fornecido no contexto:
     * faixasImplantacao: soma exata de faixas com status de implantação/projetado.
     * faixasOperacao: soma exata de faixas com status de operação/ativo.
     * equipamentosImplantacao: quantidade de equipamentos em implantação.
     * equipamentosOperacao: quantidade de equipamentos em operação.

4. PRIORIDADE TOTAL AOS CONTRATOS ATUAIS (2740/2024, 2741/2024 e 2742/2024):
   - Por padrão, todas as contagens DEVEM considerar estritamente os contratos vigentes (2740, 2741 e 2742), exceto se solicitado o histórico anterior.

5. COORDENADAS E LOCALIZAÇÃO:
   - Se o usuário perguntar a localização ou coordenadas de um radar, informe Latitude, Longitude, endereço exato e sentido.

6. AÇÕES INTERATIVAS NO PORTAL:
   - Somente anexe bloco de ações (\`\`\`actions ... \`\`\`) se forem estritamente úteis para a pergunta.

DADOS DO CONTEXTO ATUAL DO PORTAL:
${JSON.stringify(context, null, 2)}
`;

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
      res.status(500).json({
        error: error.message || 'Erro interno ao processar a solicitação de IA.',
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

