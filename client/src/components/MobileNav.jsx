import React from 'react';
import { 
  Network, 
  BookOpen, 
  Bot, 
  Plus, 
  Menu, 
  Sparkles 
} from 'lucide-react';

export default function MobileNav({ 
  activeView, 
  setActiveView, 
  onOpenIngestion, 
  onToggleSidebar 
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gruvbox-bgHard/95 backdrop-blur-lg border-t border-gruvbox-bg1 flex items-center justify-around px-2 z-40 select-none font-mono">
      {/* Knowledge Graph */}
      <button
        onClick={() => setActiveView('graph')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
          activeView === 'graph' ? 'text-gruvbox-yellow font-bold' : 'text-gruvbox-gray hover:text-gruvbox-fg'
        }`}
      >
        <Network className="w-5 h-5" />
        <span className="text-[10px]">Graph</span>
      </button>

      {/* Reviewer Studio */}
      <button
        onClick={() => setActiveView('reviewer')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
          activeView === 'reviewer' ? 'text-gruvbox-aqua font-bold' : 'text-gruvbox-gray hover:text-gruvbox-fg'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px]">Reviewer</span>
      </button>

      {/* Center Floating Ingest Button */}
      <button
        onClick={() => onOpenIngestion('pdf')}
        className="w-12 h-12 -mt-6 rounded-full bg-gruvbox-yellow text-gruvbox-bgHard flex items-center justify-center shadow-glass-glow-yellow border-2 border-gruvbox-bgHard active:scale-95 transition-transform"
        title="Ingest Knowledge"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* AI Chatbot Oracle */}
      <button
        onClick={() => setActiveView('chat')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
          activeView === 'chat' ? 'text-gruvbox-purple font-bold' : 'text-gruvbox-gray hover:text-gruvbox-fg'
        }`}
      >
        <Bot className="w-5 h-5" />
        <span className="text-[10px]">AI Oracle</span>
      </button>

      {/* Library Drawer Toggle */}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col items-center gap-1 p-2 rounded-lg text-gruvbox-gray hover:text-gruvbox-fg"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">Library</span>
      </button>
    </div>
  );
}
