import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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

    const systemInstruction = `Você é o "Assistente Inteligente GEAPI", a IA oficial do Portal da Gerência de Análise e Processamento de Infrações (GEAPI) da BHTRANS / Prefeitura de Belo Horizonte (PBH).
Desenvolvido por Caio Henriques de O. L. Cordeiro.

SEU PAPEL:
- Responder com MÁXIMA OBJETIVIDADE, CONCISÃO CIRÚRGICA e PRECISÃO MATEMÁTICA sobre LOCAIS, EQUIPAMENTOS (códigos, tipos como CEV, DAS, DIF, etc.), FAIXAS (em operação, em implantação, em relocação e inoperantes) e CONTRATOS no âmbito da fiscalização eletrônica de Belo Horizonte.

DIRETRIZES DE RESPOSTA CONCISA, EXATA E INTERATIVA:
1. RESPONDA ESTRITAMENTE O QUE FOI PERGUNTADO DE FORMA SUCINTA:
   - Apresente o número exato logo na primeira linha de forma direta e sem rodeios.
   - Exemplo: "📍 **Faixas em operação:** 700 faixas (466 equipamentos) nos contratos vigentes 2740, 2741 e 2742."

2. DIÁLOGO PROATIVO E COMPLEMENTAÇÃO INTELIGENTE:
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
