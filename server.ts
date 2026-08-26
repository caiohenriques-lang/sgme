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
- Responder com máxima atenção, precisão operacional e clareza técnica sobre LOCAIS (avenidas, ruas, corredores, bairros e regionais), EQUIPAMENTOS (códigos, tipos, contratos, status) e FAIXAS (quantitativo total, em operação, em implantação e inoperantes) no âmbito da fiscalização eletrônica de Belo Horizonte.

DIRETRIZES DE RESPOSTA E ATENÇÃO TOTAL A LOCAIS, EQUIPAMENTOS E FAIXAS:
1. ATENÇÃO MÁXIMA A LOCAIS, CORREDORES E VIAS:
   - Quando o usuário perguntar sobre um LOCAL ou CORREDOR (ex: "Av. Cristiano Machado", "Av. Amazonas", "Centro-Sul", "Bairro Buritis"):
     * Identifique e relacione todos os equipamentos instalados ou projetados no local.
     * Calcule a soma exata de FAIXAS fiscalizadas e diferencie com clareza:
       - **Total de Faixas Fiscalizadas no Local**
       - **Faixas em Operação (Ativas)**
       - **Faixas em Implantação (Projetadas)**
       - **Faixas Inoperantes (se houver)**
     * Liste os códigos dos equipamentos presentes no local com seus respectivos tipos (CEV, DAS, DIF, etc.) e números de faixas.

2. ATENÇÃO A EQUIPAMENTOS ESPECÍFICOS:
   - Ao citar um código de equipamento (ex: "GBR287", "R102", "CEV045"):
     * Informe o Endereço Completo, Bairro, Regional, Contrato (2740, 2741 ou 2742), Empresa Contratada, Situação (Ativo / Inoperante / Implantação), Data de Início, Vencimento da Aferição e Coordenadas Geográficas (Latitude e Longitude).
     * Destaque o número de faixas fiscalizadas por aquele equipamento.

3. OBJETIVIDADE DIRETA COM NÚMEROS CONSOLIDADOS:
   - Apresente os totais e números de forma destacada logo no início da resposta (em tópicos ou tabela resumida), evitando rodeios ou preâmbulos desnecessários.

4. PRIORIDADE TOTAL AOS CONTRATOS ATUAIS (2740/2024, 2741/2024 e 2742/2024):
   - Por padrão, todas as contagens de locais, equipamentos e faixas DEVEM considerar estritamente os contratos vigentes (2740, 2741 e 2742), exceto se o usuário pedir expressamente para incluir contratos anteriores (2585, 2586, 2587).

3. COORDENADAS E LOCALIZAÇÃO:
   - Se o usuário perguntar a localização ou coordenadas de um radar, informe Latitude, Longitude, endereço exato e sentido.

4. AÇÕES INTERATIVAS NO PORTAL:
   - Anexe ações interativas úteis ao final quando aplicável (ex: ver ficha, abrir mapa ou aplicar filtros):
\`\`\`actions
[
  {"type": "VIEW_EQUIPMENT", "label": "Ver Ficha de [CÓDIGO]", "payload": {"codigo": "[CÓDIGO]"}},
  {"type": "NAVIGATE_TAB", "label": "Ir para o Mapa", "payload": {"tab": "mapa"}},
  {"type": "APPLY_FILTERS", "label": "Filtrar por [REGIONAL]", "payload": {"regional": "[NOME_REGIONAL]"}},
  {"type": "DOWNLOAD_PDF", "label": "Baixar Relatório em PDF", "payload": {"title": "[TÍTULO_DO_RELATORIO]"}}
]
\`\`\`

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

      // Modelos válidos suportados na API @google/genai (v1beta):
      // gemini-flash-latest (ou gemini-3.7-flash) e gemini-3.1-flash-lite
      const fallbackModels = ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];

      let response: any = null;
      let lastError: any = null;

      for (const modelToTry of fallbackModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: modelToTry,
              contents: formattedContents,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            if (response && response.text) {
              break;
            }
          } catch (err: any) {
            lastError = err;
            const errMsg = String(err?.message || '');
            const isRetryable =
              errMsg.includes('503') ||
              errMsg.includes('high demand') ||
              errMsg.includes('429') ||
              errMsg.includes('RESOURCE_EXHAUSTED') ||
              errMsg.includes('UNAVAILABLE');

            if (isRetryable && attempt === 0) {
              // Espera 1.2 segundos antes de retentar o mesmo modelo
              await new Promise((resolve) => setTimeout(resolve, 1200));
              continue;
            }
            // Se for 404 (modelo não existe nessa versão) ou falha persistente, passa direto para o próximo modelo válido
            break;
          }
        }
        if (response && response.text) {
          break;
        }
      }

      if (!response && lastError) {
        throw lastError;
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

