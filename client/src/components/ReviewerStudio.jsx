import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Edit3, 
  Eye, 
  Sparkles, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Hash, 
  Trash2, 
  Image as ImageIcon, 
  ZoomIn, 
  X,
  Play,
  Layers,
  Award,
  Save,
  Loader2
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';
import FlashcardsView from './FlashcardsView';
import QuizView from './QuizView';
import MarkdownRenderer from './MarkdownRenderer';
import { apiFetch } from '../api';

export default function ReviewerStudio({ 
  document, 
  onDeleteDoc, 
  onUpdateDoc,
  onTagClick, 
  onConceptClick, 
  onFlashcardReview,
  onQuizComplete
}) {
  const [activeTab, setActiveTab] = useState('note'); // 'note' | 'figures' | 'video' | 'ai_summary' | 'flashcards' | 'quiz'
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [copied, setCopied] = useState(false);
  const [currentYtTime, setCurrentYtTime] = useState(0);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (document) {
      setEditTitle(document.title || '');
      setEditContent(document.rawText || '');
      setEditTags((document.tags || []).join(', '));
      setIsEditing(false);
      setActiveTab('note');
    }
  }, [document?.id]);

  if (!document) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-12 text-center select-none font-mono">
        <BookOpen className="w-10 h-10 text-gruvbox-gray mb-3 opacity-40" />
        <h3 className="text-sm font-bold text-gruvbox-fg">No Note Selected</h3>
        <p className="text-xs text-gruvbox-gray mt-1 max-w-sm">
          Select a document from the vault library or click a concept node in the Knowledge Graph.
        </p>
      </div>
    );
  }

  const { reviewer, type, title, sourceUrl, author, durationFormatted, wordCount, chapters, images = [], flashcards = [], quizQuestions = [] } = document;

  const isPdf = type === 'pdf';
  const isYt = type === 'youtube';

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      const parsedTags = editTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const res = await apiFetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          rawText: editContent,
          tags: parsedTags
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.document && onUpdateDoc) {
          onUpdateDoc(data.document);
        }
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummarizeWithAI = async () => {
    setIsSummarizing(true);
    try {
      const res = await apiFetch(`/api/documents/${document.id}/summarize`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.document && onUpdateDoc) {
          onUpdateDoc(data.document);
          setActiveTab('ai_summary');
        }
      }
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyNotes = () => {
    const textToCopy = `# ${title}\n\n${document.rawText || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = `---
title: "${title}"
type: "${type}"
tags: [${(document.tags || []).map(t => `"#${t.replace(/^#/, '')}"`).join(', ')}]
date: "${document.createdAt}"
---

# ${title}

${document.rawText || ''}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseTimestampToSeconds = (ts) => {
    if (!ts) return 0;
    const parts = ts.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-gruvbox-bgHard font-mono overflow-hidden">
      
      {/* Obsidian Vault Header */}
      <div className="p-4 md:px-6 border-b border-gruvbox-bg1 bg-gruvbox-bgHard/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 select-none flex-shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
            isPdf ? 'bg-gruvbox-red/20 text-gruvbox-red' :
            isYt ? 'bg-gruvbox-orange/20 text-gruvbox-orange' :
            'bg-gruvbox-blue/20 text-gruvbox-blue'
          }`}>
            {isPdf ? <FileText className="w-4 h-4" /> : isYt ? <YouTubeIcon className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gruvbox-bg1 text-gruvbox-gray">
                {type}
              </span>
              {author && <span className="text-xs text-gruvbox-gray">{author}</span>}
              {durationFormatted && (
                <span className="flex items-center gap-1 text-xs text-gruvbox-orange">
                  <Clock className="w-3 h-3" /> {durationFormatted}
                </span>
              )}
              {wordCount > 0 && (
                <span className="text-xs text-gruvbox-gray">
                  {wordCount.toLocaleString()} words
                </span>
              )}
              {images.length > 0 && (
                <span className="text-xs text-gruvbox-aqua flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> {images.length} {images.length === 1 ? 'Figure' : 'Figures'}
                </span>
              )}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-base font-bold text-gruvbox-fgLight bg-gruvbox-bg border border-gruvbox-bg2 rounded px-2 py-1 mt-1 focus:outline-none focus:border-gruvbox-yellow"
                placeholder="Note Title..."
              />
            ) : (
              <h1 className="text-sm md:text-base font-bold text-gruvbox-fgLight truncate mt-1">
                {title}
              </h1>
            )}

            {/* Tags */}
            {isEditing ? (
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full text-xs text-gruvbox-aqua bg-gruvbox-bg border border-gruvbox-bg2 rounded px-2 py-0.5 mt-1.5 focus:outline-none"
                placeholder="Tags (comma separated: risk, trading, chart)..."
              />
            ) : (
              document.tags && document.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {document.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => onTagClick && onTagClick(tag)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-gruvbox-bg1 hover:bg-gruvbox-aqua/20 text-gruvbox-aqua border border-gruvbox-aqua/20 transition-colors flex items-center gap-0.5"
                    >
                      <Hash className="w-2.5 h-2.5" />
                      {tag.replace(/^#/, '')}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isEditing ? (
            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gruvbox-green hover:bg-gruvbox-green/80 text-gruvbox-bgHard font-bold text-xs transition-colors"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Note</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-xs text-gruvbox-fg transition-colors"
              title="Edit Note Content"
            >
              <Edit3 className="w-3.5 h-3.5 text-gruvbox-yellow" />
              <span>Edit</span>
            </button>
          )}

          {/* Optional On-Demand AI Summary Trigger */}
          <button
            onClick={handleSummarizeWithAI}
            disabled={isSummarizing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-purple/20 hover:bg-gruvbox-purple/30 border border-gruvbox-purple/40 text-xs text-gruvbox-purple transition-colors"
            title="Generate AI Reviewer on demand"
          >
            {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Summarize with AI</span>
          </button>

          <button
            onClick={handleCopyNotes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-xs text-gruvbox-fg transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-gruvbox-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-xs text-gruvbox-yellow transition-colors"
            title="Export Markdown File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Delete "${title}" from vault?`)) onDeleteDoc(document.id);
            }}
            className="p-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-red/20 border border-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-red transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Obsidian Vault Tabs */}
      <div className="px-4 md:px-6 border-b border-gruvbox-bg1 bg-gruvbox-bg/40 flex items-center gap-1 select-none overflow-x-auto flex-shrink-0">
        <button
          onClick={() => { setActiveTab('note'); setIsEditing(false); }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'note' && !isEditing
              ? 'border-gruvbox-yellow text-gruvbox-yellow'
              : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Note Content
        </button>

        {images.length > 0 && (
          <button
            onClick={() => { setActiveTab('figures'); setIsEditing(false); }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'figures'
                ? 'border-gruvbox-aqua text-gruvbox-aqua'
                : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Figures ({images.length})
          </button>
        )}

        {isYt && (
          <button
            onClick={() => { setActiveTab('video'); setIsEditing(false); }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'video'
                ? 'border-gruvbox-orange text-gruvbox-orange'
                : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <YouTubeIcon className="w-3.5 h-3.5" />
            Video & Chapters
          </button>
        )}

        {reviewer && reviewer.executiveSummary && (
          <button
            onClick={() => { setActiveTab('ai_summary'); setIsEditing(false); }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ai_summary'
                ? 'border-gruvbox-purple text-gruvbox-purple'
                : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Reviewer
          </button>
        )}

        {flashcards.length > 0 && (
          <button
            onClick={() => { setActiveTab('flashcards'); setIsEditing(false); }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'flashcards'
                ? 'border-gruvbox-green text-gruvbox-green'
                : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Flashcards ({flashcards.length})
          </button>
        )}

        {quizQuestions.length > 0 && (
          <button
            onClick={() => { setActiveTab('quiz'); setIsEditing(false); }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'quiz'
                ? 'border-gruvbox-yellow text-gruvbox-yellow'
                : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Practice Quiz ({quizQuestions.length})
          </button>
        )}
      </div>

      {/* Main Workspace View */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
        
        {/* TAB 1: NOTE CONTENT (OBSIDIAN MARKDOWN EDITOR & READER) */}
        {(activeTab === 'note' || isEditing) && (
          <div className="max-w-4xl mx-auto space-y-4 pb-12">
            
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gruvbox-yellow uppercase tracking-wider">
                    Editing Markdown Note
                  </span>
                  <span className="text-[11px] text-gruvbox-gray">
                    Tip: Use [[Concept]] to create interactive graph nodes!
                  </span>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={22}
                  className="w-full font-mono text-xs text-gruvbox-fg bg-gruvbox-bg border border-gruvbox-bg2 rounded-xl p-4 leading-relaxed focus:outline-none focus:border-gruvbox-yellow shadow-inner"
                  placeholder="Write your markdown note here..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-xs text-gruvbox-gray"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gruvbox-green text-gruvbox-bgHard font-bold text-xs hover:bg-gruvbox-green/80"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-xl border border-gruvbox-bg1 min-h-[400px]">
                {document.rawText && document.rawText.trim().length > 0 ? (
                  <MarkdownRenderer 
                    content={document.rawText} 
                    onWikilinkClick={onConceptClick} 
                  />
                ) : (
                  <div className="text-center py-12 text-gruvbox-gray">
                    <p className="text-xs">This note is currently empty.</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-gruvbox-bg1 text-gruvbox-yellow text-xs font-bold"
                    >
                      Click here to start editing
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: FIGURES & DIAGRAMS */}
        {activeTab === 'figures' && !isEditing && (
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
              <h3 className="text-xs font-bold text-gruvbox-aqua uppercase tracking-wider mb-1">
                Extracted Figures & Diagrams ({images.length})
              </h3>
              <p className="text-[11px] text-gruvbox-gray">
                High-resolution diagrams extracted directly from the uploaded document.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div
                  key={img.id || i}
                  className="glass-panel rounded-xl overflow-hidden border border-gruvbox-bg1 group cursor-pointer hover:border-gruvbox-aqua transition-colors flex flex-col"
                  onClick={() => setActiveLightboxImg(img)}
                >
                  <div className="relative aspect-video bg-black/40 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-5 h-5 text-gruvbox-fgLight" />
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1 border-t border-gruvbox-bg1 bg-gruvbox-bg/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gruvbox-fgLight truncate">{img.name}</span>
                      <span className="text-[10px] text-gruvbox-gray flex-shrink-0">
                        {img.sizeBytes ? (img.sizeBytes / 1024).toFixed(1) + ' KB' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO & CHAPTERS */}
        {activeTab === 'video' && !isEditing && (
          <div className="max-w-3xl mx-auto space-y-4 pb-12">
            {sourceUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-gruvbox-bg1 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${sourceUrl.split('v=')[1]?.split('&')[0]}?autoplay=0&start=${currentYtTime}`}
                  title={title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {chapters && chapters.length > 0 && (
              <div className="glass-panel p-4 rounded-xl border border-gruvbox-bg1">
                <h3 className="text-xs font-bold text-gruvbox-orange uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  Video Timestamps & Chapters
                </h3>
                <div className="space-y-1.5">
                  {chapters.map((chap, cIdx) => (
                    <div
                      key={cIdx}
                      onClick={() => setCurrentYtTime(chap.start || parseTimestampToSeconds(chap.timestamp))}
                      className="p-2.5 rounded-lg bg-gruvbox-bg/50 hover:bg-gruvbox-bg border border-gruvbox-bg1 cursor-pointer transition-colors flex items-start gap-2.5 group"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-gruvbox-orange/20 text-gruvbox-orange text-[11px] font-bold flex-shrink-0">
                        {chap.timestamp}
                      </span>
                      <p className="text-xs text-gruvbox-fg leading-relaxed">
                        {chap.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI REVIEWER (IF SEEDED OR GENERATED ON DEMAND) */}
        {activeTab === 'ai_summary' && reviewer && !isEditing && (
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            
            {reviewer.executiveSummary && (
              <div className="glass-panel p-5 rounded-xl border-l-2 border-l-gruvbox-purple">
                <span className="text-[11px] font-bold text-gruvbox-purple uppercase tracking-wider block mb-1.5">
                  Executive Summary
                </span>
                <MarkdownRenderer 
                  content={reviewer.executiveSummary} 
                  onWikilinkClick={onConceptClick} 
                />
              </div>
            )}

            {reviewer.keyTakeaways && reviewer.keyTakeaways.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gruvbox-gray uppercase tracking-wider mb-2.5">
                  Key Takeaways
                </h3>
                <div className="space-y-2">
                  {reviewer.keyTakeaways.map((takeaway, idx) => (
                    <div 
                      key={idx}
                      className="glass-panel p-3 rounded-lg flex items-start gap-2.5 border border-gruvbox-bg1"
                    >
                      <span className="w-4 h-4 rounded bg-gruvbox-bg1 text-gruvbox-yellow text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-gruvbox-fg leading-relaxed">
                        {takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviewer.comprehensiveSections && reviewer.comprehensiveSections.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gruvbox-gray uppercase tracking-wider">
                  Structured Study Sections
                </h3>
                {reviewer.comprehensiveSections.map((section, sIdx) => (
                  <div key={sIdx} className="glass-panel rounded-xl overflow-hidden border border-gruvbox-bg1 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-gruvbox-fgLight">
                      {section.sectionTitle}
                    </h4>
                    <MarkdownRenderer 
                      content={section.detailedNotesMarkdown} 
                      onWikilinkClick={onConceptClick} 
                    />
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 5: FLASHCARDS */}
        {activeTab === 'flashcards' && !isEditing && (
          <FlashcardsView
            flashcards={flashcards}
            docTitle={title}
            onCardReviewed={onFlashcardReview}
          />
        )}

        {/* TAB 6: QUIZ */}
        {activeTab === 'quiz' && !isEditing && (
          <QuizView
            quizQuestions={quizQuestions}
            docTitle={title}
            onQuizCompleted={onQuizComplete}
          />
        )}

      </div>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-gruvbox-bgHard border border-gruvbox-bg1 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 px-4 border-b border-gruvbox-bg1 flex items-center justify-between bg-gruvbox-bg/60">
              <span className="text-xs font-bold text-gruvbox-fgLight truncate">{activeLightboxImg.name}</span>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="p-1 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-6rem)] flex items-center justify-center bg-black/40">
              <img
                src={activeLightboxImg.dataUrl}
                alt={activeLightboxImg.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
