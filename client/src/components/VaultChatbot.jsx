import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  BookOpen, 
  RotateCcw, 
  Copy, 
  Check, 
  FileText, 
  Layers,
  ChevronDown,
  X,
  ExternalLink
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';
import { apiFetch } from '../api';
import MarkdownRenderer from './MarkdownRenderer';

export default function VaultChatbot({ 
  documents = [], 
  selectedDocId, 
  onSelectDoc, 
  onClose,
  isOpen = true
}) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Ask questions across your notes, compare concepts from your PDFs and YouTube lectures, or generate study reviews.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scopeDocId, setScopeDocId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const selectedDoc = documents.find(d => d.id === scopeDocId);

  const handleSend = async (textToSend = input) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          scopeDocId: scopeDocId
        })
      });

      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'model',
          content: `**Error**: ${data.error}`,
          isError: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'model',
          content: data.reply,
          sources: data.sources
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: `**Error**: ${err.message}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const suggestedPrompts = [
    "Summarize core themes across all documents",
    "List all key formulas and rules in my vault",
    "What are the most frequent concepts discussed?",
    "Give me a 3-question conceptual quiz on my notes"
  ];

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col bg-gruvbox-bgHard font-mono overflow-hidden">
      
      {/* Header */}
      <div className="p-4 md:px-6 border-b border-gruvbox-bg1 bg-gruvbox-bgHard/90 backdrop-blur-md flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gruvbox-yellow/20 border border-gruvbox-yellow/30 flex items-center justify-center text-gruvbox-yellow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gruvbox-fgLight">Vault Assistant</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gruvbox-bg1 text-gruvbox-aqua font-semibold">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-[10px] text-gruvbox-gray">{documents.length} documents indexed</p>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={scopeDocId || ''}
              onChange={(e) => setScopeDocId(e.target.value || null)}
              className="bg-gruvbox-bg text-gruvbox-fg text-xs rounded-lg px-3 py-1.5 border border-gruvbox-bg1 focus:border-gruvbox-yellow focus:outline-none pr-8 cursor-pointer"
            >
              <option value="">Whole Vault ({documents.length} Docs)</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-yellow transition-all"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div 
              key={idx}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isUser ? 'bg-gruvbox-blue/20 text-gruvbox-blue border border-gruvbox-blue/30' :
                'bg-gruvbox-yellow/20 text-gruvbox-yellow border border-gruvbox-yellow/30'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`rounded-2xl p-4 text-xs leading-relaxed border transition-all ${
                isUser 
                  ? 'bg-gruvbox-bg1/90 text-gruvbox-fgLight border-gruvbox-bg2 rounded-tr-none' 
                  : 'glass-panel text-gruvbox-fg border-gruvbox-bg1 rounded-tl-none prose-gruvbox shadow-glass'
              }`}>
                {isUser ? (
                  <div className="whitespace-pre-line">
                    {msg.content}
                  </div>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {msg.sources && msg.sources.length > 0 && !isUser && (
                  <div className="mt-4 pt-3 border-t border-gruvbox-bg1/60 text-[10px] text-gruvbox-gray space-y-1">
                    <span className="font-bold text-gruvbox-aqua block">Sources Cited:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map(s => (
                        <button
                          key={s.id}
                          onClick={() => onSelectDoc && onSelectDoc(s.id)}
                          className="px-2 py-0.5 rounded bg-gruvbox-bgHard hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-gruvbox-fgDim hover:text-gruvbox-yellow flex items-center gap-1 transition-colors"
                        >
                          {s.type === 'pdf' ? <FileText className="w-2.5 h-2.5 text-gruvbox-red" /> : <YouTubeIcon className="w-2.5 h-2.5 text-gruvbox-orange" />}
                          <span className="truncate max-w-[140px]">{s.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!isUser && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="p-1 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-gruvbox-green" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-gruvbox-yellow/20 text-gruvbox-yellow border border-gruvbox-yellow/30 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="glass-panel rounded-2xl rounded-tl-none p-4 text-xs border border-gruvbox-bg1 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-gruvbox-yellow animate-ping"></span>
              <span className="text-gruvbox-gray">Searching vault...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 md:px-6 py-2 overflow-x-auto scrollbar-none flex gap-2">
          {suggestedPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-gruvbox-bg/80 hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-gruvbox-fgDim hover:text-gruvbox-yellow whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 md:px-6 border-t border-gruvbox-bg1 bg-gruvbox-bgHard/90 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            placeholder={
              scopeDocId
                ? `Ask about "${selectedDoc?.title.slice(0, 25)}..."`
                : "Ask about your notes, PDFs, or concepts..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/70 text-xs px-4 py-3 rounded-xl border border-gruvbox-bg1 focus:border-gruvbox-yellow/60 focus:outline-none focus:ring-1 focus:ring-gruvbox-yellow/40 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-3 rounded-xl font-bold transition-all ${
              input.trim() && !loading
                ? 'bg-gruvbox-yellow hover:bg-gruvbox-yellowDim text-gruvbox-bgHard shadow-glass-glow-yellow cursor-pointer'
                : 'bg-gruvbox-bg1 text-gruvbox-gray cursor-not-allowed opacity-50'
            }`}
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
