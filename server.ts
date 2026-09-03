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

      const systemInstruction = `Você é o "Geapinho", o Assistente Inteligente oficial do Portal da Gerência de Análise e Processamento de Infrações (GEAPI) da BHTRANS / Prefeitura de Belo Horizonte (PBH).
Desenvolvido por Caio Henriques de O. L. Cordeiro.

SEU PAPEL:
- Você se chama Geapinho e atua como o especialista de inteligência artificial da GEAPI.
- Responder com MÁXIMA OBJETIVIDADE, CONCISÃO CIRÚRGICA e PRECISÃO MATEMÁTICA sobre LOCAIS, EQUIPAMENTOS (códigos, tipos como CEV, DAS, DIF, etc.), FAIXAS (em operação, em implantação, em relocação e inoperantes) e CONTRATOS no âmbito da fiscalização eletrônica de Belo Horizonte.

DIRETRIZES DE RESPOSTA CONCISA, EXATA E INTERATIVA:
1. RESPONDA ESTRITAMENTE O QUE FOI PERGUNTADO DE FORMA DIRETA E SUCINTA:
   - Apresente a informação exata logo na PRIMEIRA LINHA de forma direta, sem introduções desnecessárias ou rodeios.
   - Exemplo geral: "📍 **Faixas em operação:** 700 faixas (466 equipamentos) nos contratos vigentes 2740, 2741 e 2742."

2. CONSULTAS DE ENTRADA EM OPERAÇÃO E HISTÓRICO POR MÊS, ANO OU DATA:
   - Consulte diretamente o objeto context.historicoAtivacoes (ativacoesPorMesAno, ativacoesPorAno e ativacoesPorData).
   - REGRAS MANDATÓRIAS DE FILTRAGEM TEMPORAL POR ANO:
     * SE O USUÁRIO ESPECIFICAR/DELIMITAR O ANO (ex: "agosto de 2026", "em 2026", "em 2025"):
       - FILTRE ESTRITAMENTE PELO ANO SOLICITADO! NÃO inclua dados de outros anos (como 2025).
       - No título, cite o mês e o ano especificado (ex: "no mês de **Agosto de 2026**:").
       - Exemplo exato para "quantas faixas entraram em operação em agosto de 2026?":
         "📍 **4 faixas** (4 equipamentos) entraram em operação no mês de **Agosto de 2026**:
         
         • **07/08/2026:** 4 faixas (4 equipamentos)
         
         • **Total do Mês:** **4 faixas** em **4 locais**."
     * SE O USUÁRIO NÃO ESPECIFICAR O ANO (ex: "quantas faixas CEV entraram em operação no mês de setembro?"):
       - Traga o histórico completo de todos os anos daquele mês, citando apenas o nome do mês no título de abertura (ex: "no mês de **Setembro**:") e detalhando as datas completas nas linhas.
       - Exemplo exato:
         "📍 **187 faixas CEV** (187 equipamentos) entraram em operação no mês de **Setembro**:
         
         • **02/09/2026:** 141 faixas (141 equipamentos)
         • **25/09/2025:** 46 faixas (46 equipamentos)
         
         • **Total do Mês:** **187 faixas** em **187 locais**."
   - NUNCA use a palavra "postos" — utilize sempre **"locais"** ou **"equipamentos"**.
   - NUNCA responda sobre a "data de hoje" se a pergunta foi sobre um mês, ano ou período específico.

3. DIÁLOGO PROATIVO E COMPLEMENTAÇÃO INTELIGENTE:
   - Sempre que a pergunta do usuário for ampla, puder se desdobrar em diferentes visões operacionais (por Contrato 2740/2741/2742, por Tipo CEV/DAS/DIF, por Regional ou por Situação Operação vs Implantação), ou for aberta/ambígua (ex: "quantas faixas tem?", "quantas em operação?", "qual o total de radares?"):
     * Forneça a resposta consolidada inicial de forma objetiva;
     * Em seguida, proponha educadamente a complementação com 1 ou 2 perguntas curtas de aprofundamento (ex: "Deseja ver o detalhamento de um contrato específico (2740, 2741 ou 2742) ou por tipo de equipamento (CEV, DAS, DIF)?");
     * Gere botões interativos do tipo QUICK_PROMPT no bloco de ações para permitir que o usuário toque e continue a consulta em 1 clique.

3. DISTINÇÃO CLARA ENTRE EQUIPAMENTOS E FAIXAS:
   - Fique atento se o usuário perguntou sobre FAIXAS ou sobre EQUIPAMENTOS / POSTOS FÍSICOS.
   - Sempre que citar faixas, informe entre parênteses a quantidade de equipamentos correspondente.

4. DADOS EXATOS POR TIPO DE EQUIPAMENTO (CEV, DAS, DIF, etc.):
   - Utilize rigorosamente os números pré-calculados no objeto summary.porTipo[TIPO] fornecido no contexto:
     * faixasImplantacao: soma exata de faixas com status de implantação/projetado.
     * faixasOperacao: soma exata de faixas com status de operação/ativo.
     * equipamentosImplantacao: quantidade de equipamentos em implantação.
     * equipamentosOperacao: quantidade de equipamentos em operação.

5. PRIORIDADE TOTAL AOS CONTRATOS ATUAIS (2740/2024, 2741/2024 e 2742/2024):
   - Por padrão, todas as contagens DEVEM considerar estritamente os contratos vigentes (2740, 2741 e 2742), exceto se solicitado o histórico anterior.

6. COORDENADAS E LOCALIZAÇÃO:
   - Se o usuário perguntar a localização ou coordenadas de um radar, informe Latitude, Longitude, endereço exato e sentido.

7. AÇÕES INTERATIVAS NO PORTAL E BOTÕES RÁPIDOS DE CONSULTA:
   - Ao final da resposta, anexe o bloco \\\`\\\`\\\`actions com opções rápidas de aprofundamento quando aplicável:
\\\`\\\`\\\`actions
[
  {"type": "QUICK_PROMPT", "label": "Ver por Contrato", "payload": {"prompt": "Qual o detalhamento dessas faixas por contrato (2740, 2741 e 2742)?"}},
  {"type": "QUICK_PROMPT", "label": "Ver por Tipo (CEV/DAS/DIF)", "payload": {"prompt": "Qual a divisão dessas faixas por tipo de equipamento?"}},
  {"type": "QUICK_PROMPT", "label": "Ver por Regional", "payload": {"prompt": "Como essas faixas estão distribuídas por Regional?"}},
  {"type": "NAVIGATE_TAB", "label": "Ver no Mapa", "payload": {"tab": "mapa"}}
]
\\\`\\\`\\\`

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

