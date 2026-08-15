import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Hash, 
  Clock, 
  Trash2, 
  Layers, 
  Sparkles,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

export default function Sidebar({ 
  documents = [], 
  selectedDocId, 
  onSelectDoc, 
  onDeleteDoc, 
  onOpenIngestion,
  activeFilter,
  setActiveFilter,
  selectedTag,
  setSelectedTag,
  graphStats
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Extract all unique tags with count
  const tagCounts = documents.reduce((acc, doc) => {
    (doc.tags || []).forEach(tag => {
      const clean = tag.replace(/^#/, '').trim();
      if (clean) {
        acc[clean] = (acc[clean] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  // Filter documents based on type & tag
  const filteredDocs = documents.filter(doc => {
    const matchesType = activeFilter === 'all' || doc.type === activeFilter;
    const matchesTag = !selectedTag || (doc.tags || []).some(t => t.replace(/^#/, '').toLowerCase() === selectedTag.toLowerCase());
    return matchesType && matchesTag;
  });

  return (
    <aside className={`border-r border-gruvbox-bg1 bg-gruvbox-bgHard/80 backdrop-blur-md flex flex-col transition-all duration-300 z-20 ${
      collapsed ? 'w-14' : 'w-80'
    } h-[calc(100vh-4rem)] select-none`}>
      
      {/* Sidebar Header */}
      <div className="p-3 border-b border-gruvbox-bg1 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gruvbox-yellow" />
            <span className="text-xs font-mono font-bold text-gruvbox-fg uppercase tracking-wider">Vault Library</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gruvbox-bg1 text-gruvbox-gray">
              {documents.length}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Type Filter Tabs */}
          <div className="p-2 border-b border-gruvbox-bg1 flex gap-1">
            <button
              onClick={() => { setActiveFilter('all'); setSelectedTag(null); }}
              className={`flex-1 py-1 px-2 rounded text-[11px] font-mono transition-all text-center ${
                activeFilter === 'all' && !selectedTag
                  ? 'bg-gruvbox-bg1 text-gruvbox-yellow font-semibold shadow-sm'
                  : 'text-gruvbox-gray hover:text-gruvbox-fg hover:bg-gruvbox-bg/50'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => { setActiveFilter('pdf'); setSelectedTag(null); }}
              className={`flex-1 py-1 px-1.5 rounded text-[11px] font-mono transition-all text-center flex items-center justify-center gap-1 ${
                activeFilter === 'pdf'
                  ? 'bg-gruvbox-red/20 text-gruvbox-red font-semibold border border-gruvbox-red/30'
                  : 'text-gruvbox-gray hover:text-gruvbox-red hover:bg-gruvbox-bg/50'
              }`}
            >
              PDFs
            </button>
            <button
              onClick={() => { setActiveFilter('youtube'); setSelectedTag(null); }}
              className={`flex-1 py-1 px-1.5 rounded text-[11px] font-mono transition-all text-center flex items-center justify-center gap-1 ${
                activeFilter === 'youtube'
                  ? 'bg-gruvbox-orange/20 text-gruvbox-orange font-semibold border border-gruvbox-orange/30'
                  : 'text-gruvbox-gray hover:text-gruvbox-orange hover:bg-gruvbox-bg/50'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => { setActiveFilter('note'); setSelectedTag(null); }}
              className={`flex-1 py-1 px-1.5 rounded text-[11px] font-mono transition-all text-center flex items-center justify-center gap-1 ${
                activeFilter === 'note'
                  ? 'bg-gruvbox-blue/20 text-gruvbox-blue font-semibold border border-gruvbox-blue/30'
                  : 'text-gruvbox-gray hover:text-gruvbox-blue hover:bg-gruvbox-bg/50'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Tag Filter Pills */}
          {sortedTags.length > 0 && (
            <div className="px-3 py-2 border-b border-gruvbox-bg1/70 overflow-x-auto scrollbar-none flex items-center gap-1.5 max-h-20 flex-wrap">
              <span className="text-[10px] font-mono text-gruvbox-gray flex items-center gap-1 mr-1">
                <Hash className="w-3 h-3 text-gruvbox-aqua" /> Tags:
              </span>
              {sortedTags.slice(0, 8).map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gruvbox-aqua text-gruvbox-bgHard font-bold shadow-sm'
                        : 'bg-gruvbox-bg1 text-gruvbox-aqua hover:bg-gruvbox-aqua/20 border border-gruvbox-aqua/20'
                    }`}
                  >
                    #{tag}
                    <span className="opacity-70 text-[9px]">({count})</span>
                  </button>
                );
              })}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] font-mono text-gruvbox-red hover:underline ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Document List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-xs font-mono text-gruvbox-gray">No documents found.</p>
                <button
                  onClick={() => onOpenIngestion('pdf')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gruvbox-bg1 hover:bg-gruvbox-bg2 text-xs font-mono text-gruvbox-yellow border border-gruvbox-yellow/30"
                >
                  <Plus className="w-3.5 h-3.5" /> Ingest Knowledge
                </button>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const isPdf = doc.type === 'pdf';
                const isYt = doc.type === 'youtube';

                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                    className={`group relative p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'bg-gruvbox-bg/95 border-gruvbox-yellow/50 shadow-glass-glow-yellow/20'
                        : 'bg-gruvbox-bg/40 hover:bg-gruvbox-bg/80 border-gruvbox-bg1 hover:border-gruvbox-gray/30'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className={`mt-0.5 p-1.5 rounded ${
                        isPdf 
                          ? 'bg-gruvbox-red/15 text-gruvbox-red' 
                          : isYt 
                          ? 'bg-gruvbox-orange/15 text-gruvbox-orange' 
                          : 'bg-gruvbox-blue/15 text-gruvbox-blue'
                      }`}>
                        {isPdf ? <FileText className="w-3.5 h-3.5" /> : isYt ? <YouTubeIcon className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-mono font-medium truncate ${
                          isSelected ? 'text-gruvbox-yellow' : 'text-gruvbox-fg group-hover:text-gruvbox-fgLight'
                        }`}>
                          {doc.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-gruvbox-gray">
                          {doc.wordCount > 0 && <span>{doc.wordCount.toLocaleString()} words</span>}
                          {doc.durationFormatted && <span>{doc.durationFormatted}</span>}
                          {doc.flashcards?.length > 0 && (
                            <span className="text-gruvbox-purple">🗂️ {doc.flashcards.length} cards</span>
                          )}
                          {doc.quizQuestions?.length > 0 && (
                            <span className="text-gruvbox-green">🎯 {doc.quizQuestions.length} Qs</span>
                          )}
                        </div>

                        {/* Tags preview */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {doc.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gruvbox-bg1/80 text-gruvbox-aqua">
                                #{tag.replace(/^#/, '')}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-[9px] font-mono text-gruvbox-gray">+{doc.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${doc.title}" from vault?`)) {
                            onDeleteDoc(doc.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gruvbox-red/20 text-gruvbox-gray hover:text-gruvbox-red transition-all"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Vault Footer Stats */}
          <div className="p-3 border-t border-gruvbox-bg1 bg-gruvbox-bg/50">
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-1.5 rounded bg-gruvbox-bg1/40 border border-gruvbox-bg1">
                <span className="block text-[10px] text-gruvbox-gray">DOCS</span>
                <span className="text-xs font-bold text-gruvbox-fg">{documents.length}</span>
              </div>
              <div className="p-1.5 rounded bg-gruvbox-bg1/40 border border-gruvbox-bg1">
                <span className="block text-[10px] text-gruvbox-gray">CONCEPTS</span>
                <span className="text-xs font-bold text-gruvbox-yellow">{graphStats?.conceptsCount || 0}</span>
              </div>
              <div className="p-1.5 rounded bg-gruvbox-bg1/40 border border-gruvbox-bg1">
                <span className="block text-[10px] text-gruvbox-gray">LINKS</span>
                <span className="text-xs font-bold text-gruvbox-aqua">{graphStats?.totalLinks || 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
