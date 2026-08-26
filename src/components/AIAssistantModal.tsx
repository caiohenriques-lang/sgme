import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
  Trash2,
  MapPin,
  FileText,
  Filter,
  ExternalLink,
  Download,
  Check,
  Copy,
  ChevronRight,
  Compass,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EquipmentRecord, FilterState, ActiveTab } from '../types';
import { sendChatMessage, ChatMessage, AIAction } from '../services/aiService';
import { exportFilteredRecordsPDF, exportSingleRecordPDF } from '../utils/pdfExport';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: EquipmentRecord[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectRecord: (record: EquipmentRecord) => void;
}

const QUICK_SUGGESTIONS = [
  {
    icon: '⚡',
    label: 'Equipamentos Inoperantes',
    prompt: 'Quais equipamentos estão inoperantes atualmente e quais são os motivos registrados?',
  },
  {
    icon: '⏳',
    label: 'Aferições a Vencer',
    prompt: 'Quais radares têm data de vencimento da aferição mais próxima ou vencida?',
  },
  {
    icon: '📍',
    label: 'Coordenadas do Radar GBR287',
    prompt: 'Quais são as coordenadas geográficas, endereço e dados do radar GBR287?',
  },
  {
    icon: '📊',
    label: 'Resumo por Contrato',
    prompt: 'Faça um resumo executivo da distribuição de equipamentos entre os contratos 2740/24, 2741/24 e 2742/24.',
  },
  {
    icon: '📄',
    label: 'Gerar Relatório em PDF',
    prompt: 'Gere um resumo técnico dos radares da Regional Centro-Sul com opção de download em PDF.',
  },
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  records,
  filters,
  setFilters,
  activeTab,
  setActiveTab,
  onSelectRecord,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Olá! Sou o **Assistente Inteligente GEAPI**, alimentado por IA.\n\nPosso ajudar você a:\n- 📍 **Consultar Coordenadas Geográficas** e localizações exatas de radares\n- 🔍 **Pesquisar Status, Contratos e Tipos** (CEV, DAS, DIF, DTLP, DCP)\n- ⏱️ **Verificar Prazos de Aferição** e equipamentos inoperantes\n- 📄 **Emitir Relatórios e PDFs** personalizados para download\n- 🗺️ **Navegar e Filtrar** dados diretamente no portal\n\nComo posso ajudar você hoje?`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history format
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-8)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: m.text,
        }));

      const res = await sendChatMessage({
        message: textToSend,
        history,
        records,
        filters,
        activeTab,
      });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date(),
        actions: res.actions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Erro no assistente IA:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Ocorreu um erro ao consultar o assistente de IA:**\n${err.message || 'Não foi possível completar a requisição. Verifique se a chave de API está configurada.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Histórico limpo. Como posso ajudar com os equipamentos da GEAPI?',
        timestamp: new Date(),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Action Handlers
  const handleExecuteAction = (action: AIAction) => {
    if (action.type === 'QUICK_PROMPT' && action.payload?.prompt) {
      handleSend(action.payload.prompt);
    } else if (action.type === 'NAVIGATE_TAB' && action.payload?.tab) {
      setActiveTab(action.payload.tab as ActiveTab);
    } else if (action.type === 'VIEW_EQUIPMENT' && action.payload?.codigo) {
      const code = String(action.payload.codigo).trim().toUpperCase();
      const rec = records.find(
        (r) => r.CÓDIGO && r.CÓDIGO.trim().toUpperCase() === code
      );
      if (rec) {
        onSelectRecord(rec);
      } else {
        alert(`Equipamento com código "${code}" não foi localizado na base.`);
      }
    } else if (action.type === 'APPLY_FILTERS' && action.payload) {
      setFilters((prev) => ({
        ...prev,
        ...action.payload,
      }));
    } else if (action.type === 'DOWNLOAD_PDF') {
      // Baixa PDF compilado baseado nos filtros ou registros atuais
      exportFilteredRecordsPDF(
        records,
        action.payload?.title || 'Relatório Gerado por IA'
      );
    } else if (action.type === 'OPEN_GOOGLE_MAPS' && action.payload) {
      const { lat, lng } = action.payload;
      if (lat && lng) {
        window.open(
          `https://www.google.com/maps?q=${lat},${lng}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    }
  };

  // Helper to extract coordinates from text
  const extractCoordinates = (text: string) => {
    const latMatch = text.match(/Latitude[:\s]+(-?\d+\.\d+)/i) || text.match(/Lat[:\s]+(-?\d+\.\d+)/i);
    const lngMatch = text.match(/Longitude[:\s]+(-?\d+\.\d+)/i) || text.match(/Lng[:\s]+(-?\d+\.\d+)/i) || text.match(/Lon[:\s]+(-?\d+\.\d+)/i);
    
    if (latMatch && lngMatch) {
      return {
        lat: parseFloat(latMatch[1]),
        lng: parseFloat(lngMatch[1]),
      };
    }
    return null;
  };

  // Helper to extract equipment code from text
  const extractEquipmentCode = (text: string) => {
    const match = text.match(/\b(GBR\d+|R\d+|CEV\d+|DAS\d+|DIF\d+|P\d+)\b/i);
    if (match) {
      return match[1].toUpperCase();
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-all">
      <div
        className={`bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col w-full transition-all duration-200 ${
          isExpanded
            ? 'h-[96vh] sm:max-w-4xl'
            : 'h-[85vh] sm:h-[680px] sm:max-w-2xl'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between rounded-t-2xl border-b border-slate-800 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md ring-2 ring-blue-400/40">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Assistente IA GEAPI
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Fiscalização Eletrônica • Inteligência Operacional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Limpar Histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer hidden sm:flex"
              title={isExpanded ? 'Restaurar Tamanho' : 'Expandir Janela'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors cursor-pointer ml-1"
              title="Fechar Assistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-600 shrink-0 flex items-center gap-1 mr-1">
            <Compass className="w-3 h-3 text-blue-700" /> Sugestões:
          </span>
          {QUICK_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              disabled={loading}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-800 hover:text-blue-900 rounded-full text-[11px] font-medium transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const coords = !isUser ? extractCoordinates(msg.text) : null;
            const codeFound = !isUser ? extractEquipmentCode(msg.text) : null;
            const matchedRecord = codeFound
              ? records.find((r) => r.CÓDIGO?.toUpperCase() === codeFound)
              : null;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs font-normal'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {/* Message Content with Basic Markdown Formatting */}
                  <div className="space-y-2 whitespace-pre-wrap break-words">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      // Check for bullet lists
                      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        const items = paragraph.split('\n');
                        return (
                          <ul key={pIdx} className="space-y-1 my-1.5 pl-3 list-disc list-outside">
                            {items.map((it, itIdx) => {
                              const clean = it.replace(/^[-*]\s+/, '');
                              return (
                                <li key={itIdx}>
                                  <FormattedText text={clean} />
                                </li>
                              );
                            })}
                          </ul>
                        );
                      }
                      return (
                        <p key={pIdx}>
                          <FormattedText text={paragraph} />
                        </p>
                      );
                    })}
                  </div>

                  {/* Coords Interactive Banner */}
                  {coords && (
                    <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-blue-900 font-mono text-xs">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-semibold">Coordenadas Detectadas:</div>
                          <div className="text-[11px] text-blue-700">
                            Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveTab('mapa');
                            if (matchedRecord) onSelectRecord(matchedRecord);
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Ver no Mapa</span>
                        </button>
                        <a
                          href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Maps</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Equipment Mini-Card if Code was detected */}
                  {matchedRecord && (
                    <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{matchedRecord.CÓDIGO}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">
                              {matchedRecord.TIPO}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-xs">
                            {matchedRecord['ENDEREÇO COMPLETO']}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectRecord(matchedRecord)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Ficha Técnica</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons Triggered by AI */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleExecuteAction(act)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 hover:border-blue-400 font-semibold text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                        >
                          {act.type === 'QUICK_PROMPT' && <Sparkles className="w-3 h-3 text-blue-600" />}
                          {act.type === 'DOWNLOAD_PDF' && <Download className="w-3 h-3 text-blue-600" />}
                          {act.type === 'NAVIGATE_TAB' && <Compass className="w-3 h-3 text-blue-600" />}
                          {act.type === 'VIEW_EQUIPMENT' && <FileText className="w-3 h-3 text-blue-600" />}
                          {act.type === 'APPLY_FILTERS' && <Filter className="w-3 h-3 text-blue-600" />}
                          {act.type === 'OPEN_GOOGLE_MAPS' && <MapPin className="w-3 h-3 text-blue-600" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer: Timestamp and Copy */}
                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {msg.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-slate-600 transition-colors p-1 rounded cursor-pointer"
                        title="Copiar Resposta"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-2 text-slate-600 text-xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span>O Assistente GEAPI está analisando os dados...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre radares, contratos, coordenadas, aferições ou peça relatórios..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>IA conectada à base de dados oficial GEAPI / BHTRANS</span>
            <span className="hidden sm:inline">Pressione Enter para enviar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to render bold, italics, and code blocks cleanly
function FormattedText({ text }: { text: string }) {
  // Simple token parser for **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={idx}
              className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono text-[11px] border border-slate-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}
