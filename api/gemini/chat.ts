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
- Responder dúvidas com clareza, precisão técnica e cordialidade sobre equipamentos de fiscalização eletrônica (radares), contratos, interrupções, aferições do Inmetro/IPEM, prazos, bairros, regionais e coordenadas geográficas de Belo Horizonte.
- Ajudar os operadores e gestores públicos a consultar dados, extrair relatórios, analisar status operacionais e obter localizações exatas.

CONHECIMENTO DOMÍNIO GEAPI:
- CONTRATOS ATUAIS (2024):
  * 2740/2024 (ou 2740/24): ELISEU KOPP & CIA LTDA.
  * 2741/2024 (ou 2741/24): SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.
  * 2742/2024 (ou 2742/24): CONSÓRCIO TRÂNSITO SEGURO
- CONTRATOS ANTERIORES: 2585/20, 2586/20, 2587/20
- TIPOS DE EQUIPAMENTOS E SIGLAS:
  * CEV: Controlador Eletrônico de Velocidade (radar de velocidade)
  * DAS: Detector de Avanço Semafórico (avanço de sinal vermelho)
  * DIF: Detector de Invasão de Faixa exclusiva de ônibus
  * DTLP: Detector de Tráfego em Local/Horário Proibido (caminhões/veículos pesados)
  * DCP: Detector de Conversão em Local Proibido
  * Combinações: CEV+DIF, DAS+DIF, etc.
- SITUAÇÕES: Ativo, Inoperante, Em Implantação, Desativado, etc.
- CONDIÇÃO: Existente, Projetado, Cancelado, Realocado, etc.
- REGIONAIS DE BH: Barreiro, Centro-Sul, Leste, Nordeste, Noroeste, Norte, Oeste, Pampulha, Venda Nova.

DIRETRIZES DE RESPOSTA:
1. Responda em Português do Brasil (pt-BR) de forma elegante, estruturada e objetiva, usando formatação Markdown (tópicos com marcadores, tabelas e negrito).
2. Se o usuário perguntar sobre coordenadas geográficas ou localização de um equipamento, forneça sempre a Latitude, a Longitude e o endereço completo.
3. Se o usuário pedir para gerar um relatório ou PDF, resuma os dados solicitados e informe que ele pode clicar no botão de ação gerado para baixar o PDF imediatamente.
4. Para acionar ações interativas na interface, você pode anexar ao final da sua resposta uma tag JSON de ações no formato:
\`\`\`actions
[
  {"type": "VIEW_EQUIPMENT", "label": "Ver Ficha de [CÓDIGO]", "payload": {"codigo": "[CÓDIGO]"}},
  {"type": "NAVIGATE_TAB", "label": "Ir para o Mapa", "payload": {"tab": "mapa"}},
  {"type": "APPLY_FILTERS", "label": "Filtrar por [REGIONAL]", "payload": {"regional": "[NOME_REGIONAL]"}},
  {"type": "DOWNLOAD_PDF", "label": "Baixar Relatório em PDF", "payload": {"title": "[TÍTULO_DO_RELATORIO]"}},
  {"type": "OPEN_GOOGLE_MAPS", "label": "Abrir no Google Maps", "payload": {"lat": -19.92, "lng": -43.94, "address": "Endereço"}}
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const fullText = response.text || 'Não foi possível gerar uma resposta no momento.';

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
