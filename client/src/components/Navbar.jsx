import { 
  Network, 
  BookOpen, 
  FileText, 
  Search, 
  Plus, 
  Download, 
  BrainCircuit, 
  Upload, 
  Lock, 
  MessageSquare 
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenIngestion, 
  onExportVault, 
  onLockVault, 
  activeView, 
  setActiveView 
}) {
  return (
    <header className="h-14 px-4 border-b border-gruvbox-bg1 bg-gruvbox-bgHard/90 backdrop-blur-md flex items-center justify-between z-30 sticky top-0 font-mono">
      {/* Brand & View Navigation */}
      <div className="flex items-center gap-5">
        <div 
          onClick={() => setActiveView('graph')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gruvbox-bg1 border border-gruvbox-bg2 flex items-center justify-center text-gruvbox-yellow">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-gruvbox-fgLight tracking-tight">Synapse</span>
            <span className="text-sm text-gruvbox-yellow font-bold">Vault</span>
          </div>
        </div>

        {/* View Switch Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-gruvbox-bg p-1 rounded-lg border border-gruvbox-bg1">
          <button
            onClick={() => setActiveView('graph')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeView === 'graph'
                ? 'bg-gruvbox-bg1 text-gruvbox-yellow font-semibold'
                : 'text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Graph
          </button>
          <button
            onClick={() => setActiveView('reviewer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeView === 'reviewer'
                ? 'bg-gruvbox-bg1 text-gruvbox-aqua font-semibold'
                : 'text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Reviewer
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeView === 'chat'
                ? 'bg-gruvbox-bg1 text-gruvbox-purple font-semibold'
                : 'text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Search & Ask
          </button>
        </nav>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gruvbox-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search keywords, concepts, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/60 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-gruvbox-bg1 focus:border-gruvbox-yellow/60 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gruvbox-gray hover:text-gruvbox-fg text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onOpenIngestion('pdf')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-red/15 hover:bg-gruvbox-red/25 border border-gruvbox-red/30 text-gruvbox-red text-xs transition-colors"
          title="Upload PDF"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={() => onOpenIngestion('youtube')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-orange/15 hover:bg-gruvbox-orange/25 border border-gruvbox-orange/30 text-gruvbox-orange text-xs transition-colors"
          title="Ingest YouTube Video"
        >
          <YouTubeIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Video</span>
        </button>

        <button
          onClick={() => onOpenIngestion('note')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-blue/15 hover:bg-gruvbox-blue/25 border border-gruvbox-blue/30 text-gruvbox-blue text-xs transition-colors"
          title="New Note"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Note</span>
        </button>

        <div className="w-[1px] h-4 bg-gruvbox-bg1 mx-1" />

        <button
          onClick={onExportVault}
          className="p-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg text-xs transition-colors"
          title="Export Markdown Vault"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onLockVault}
          className="p-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-red/20 border border-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-red text-xs transition-colors"
          title="Lock Vault"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
