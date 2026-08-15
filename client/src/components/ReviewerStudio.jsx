import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Award, 
  Play, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Hash, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  X
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';
import FlashcardsView from './FlashcardsView';
import QuizView from './QuizView';

export default function ReviewerStudio({ 
  document, 
  onDeleteDoc, 
  onTagClick, 
  onConceptClick, 
  onFlashcardReview,
  onQuizComplete
}) {
  const [activeTab, setActiveTab] = useState('reviewer'); // 'reviewer' | 'figures' | 'flashcards' | 'quiz' | 'source'
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [currentYtTime, setCurrentYtTime] = useState(0);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  if (!document) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-12 text-center select-none font-mono">
        <BookOpen className="w-10 h-10 text-gruvbox-gray mb-3 opacity-40" />
        <h3 className="text-sm font-bold text-gruvbox-fg">No Document Selected</h3>
        <p className="text-xs text-gruvbox-gray mt-1 max-w-sm">
          Select a note from the left sidebar or click a node in the graph to view its reviewer.
        </p>
      </div>
    );
  }

  const { reviewer, type, title, sourceUrl, author, durationFormatted, wordCount, chapters, images = [] } = document;

  const isPdf = type === 'pdf';
  const isYt = type === 'youtube';

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({
      ...prev,
      [idx]: prev[idx] === undefined ? false : !prev[idx]
    }));
  };

  const handleCopyNotes = () => {
    let textToCopy = `# ${title}\n\n## Summary\n${reviewer?.executiveSummary || ''}\n\n## Key Takeaways\n${(reviewer?.keyTakeaways || []).join('\n- ')}\n\n`;
    (reviewer?.comprehensiveSections || []).forEach(s => {
      textToCopy += `### ${s.sectionTitle}\n${s.detailedNotesMarkdown}\n\n`;
    });

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    let md = `---
title: "${title}"
type: "${type}"
tags: [${(document.tags || []).map(t => `"#${t.replace(/^#/, '')}"`).join(', ')}]
date: "${document.createdAt}"
---

# ${title}

## Summary
${reviewer?.executiveSummary || ''}

## Key Takeaways
${(reviewer?.keyTakeaways || []).map(t => `- ${t}`).join('\n')}

## Study Sections
${(reviewer?.comprehensiveSections || []).map(s => `
### ${s.sectionTitle}
${s.detailedNotesMarkdown}
`).join('\n\n')}

## Glossary
${(reviewer?.glossary || []).map(g => `- **${g.term}**: ${g.definition}`).join('\n')}
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
      
      {/* Top Header */}
      <div className="p-4 md:px-6 border-b border-gruvbox-bg1 bg-gruvbox-bgHard/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 select-none flex-shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
            isPdf ? 'bg-gruvbox-red/20 text-gruvbox-red' :
            isYt ? 'bg-gruvbox-orange/20 text-gruvbox-orange' :
            'bg-gruvbox-blue/20 text-gruvbox-blue'
          }`}>
            {isPdf ? <FileText className="w-4 h-4" /> : isYt ? <YouTubeIcon className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
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

            <h1 className="text-sm md:text-base font-bold text-gruvbox-fgLight truncate mt-1">
              {title}
            </h1>

            {document.tags && document.tags.length > 0 && (
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
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
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
              if (confirm(`Delete "${title}"?`)) onDeleteDoc(document.id);
            }}
            className="p-1.5 rounded-lg bg-gruvbox-bg hover:bg-gruvbox-red/20 border border-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-red transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-6 border-b border-gruvbox-bg1 bg-gruvbox-bg/40 flex items-center gap-1 select-none overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveTab('reviewer')}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'reviewer'
              ? 'border-gruvbox-yellow text-gruvbox-yellow'
              : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Study Notes
        </button>

        {images.length > 0 && (
          <button
            onClick={() => setActiveTab('figures')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'figures'
                ? 'border-gruvbox-aqua text-gruvbox-aqua'
                : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Figures & Diagrams ({images.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'flashcards'
              ? 'border-gruvbox-purple text-gruvbox-purple'
              : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Flashcards ({document.flashcards?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'quiz'
              ? 'border-gruvbox-green text-gruvbox-green'
              : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Practice Quiz ({document.quizQuestions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'source'
              ? 'border-gruvbox-orange text-gruvbox-orange'
              : 'border-transparent text-gruvbox-gray hover:text-gruvbox-fg'
          }`}
        >
          {isYt ? <YouTubeIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          {isYt ? 'Video & Transcripts' : 'Source Document'}
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
        
        {/* TAB 1: STUDY NOTES */}
        {activeTab === 'reviewer' && (
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            
            {/* Executive Summary */}
            {reviewer?.executiveSummary && (
              <div className="glass-panel p-5 rounded-xl border-l-2 border-l-gruvbox-yellow">
                <span className="text-[11px] font-bold text-gruvbox-yellow uppercase tracking-wider block mb-1.5">
                  Summary
                </span>
                <p className="text-xs text-gruvbox-fg leading-relaxed">
                  {reviewer.executiveSummary}
                </p>
              </div>
            )}

            {/* Figures Preview Strip if Available */}
            {images.length > 0 && (
              <div className="glass-panel p-4 rounded-xl border border-gruvbox-bg1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-gruvbox-aqua uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Extracted Figures ({images.length})
                  </span>
                  <button
                    onClick={() => setActiveTab('figures')}
                    className="text-[10px] text-gruvbox-yellow hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {images.slice(0, 4).map((img, i) => (
                    <div 
                      key={img.id || i}
                      onClick={() => setActiveLightboxImg(img)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-gruvbox-bg1 bg-gruvbox-bg cursor-pointer hover:border-gruvbox-aqua transition-colors"
                    >
                      <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-4 h-4 text-gruvbox-fgLight" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1.5 py-0.5 text-[9px] text-gruvbox-fgDim truncate">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {reviewer?.keyTakeaways && reviewer.keyTakeaways.length > 0 && (
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

            {/* Sections */}
            {reviewer?.comprehensiveSections && reviewer.comprehensiveSections.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gruvbox-gray uppercase tracking-wider">
                    Sections ({reviewer.comprehensiveSections.length})
                  </h3>
                </div>

                {reviewer.comprehensiveSections.map((section, sIdx) => {
                  const isCollapsed = expandedSections[sIdx] === false;

                  return (
                    <div 
                      key={sIdx}
                      className="glass-panel rounded-xl overflow-hidden border border-gruvbox-bg1"
                    >
                      <div 
                        onClick={() => toggleSection(sIdx)}
                        className="p-3.5 bg-gruvbox-bg/60 hover:bg-gruvbox-bg flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded bg-gruvbox-bg1 text-gruvbox-aqua text-xs font-bold flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-gruvbox-fgLight">
                            {section.sectionTitle}
                          </h4>
                        </div>
                        <div className="text-gruvbox-gray">
                          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="p-4 space-y-3 border-t border-gruvbox-bg1">
                          <div className="prose-gruvbox text-xs leading-relaxed space-y-2 whitespace-pre-line">
                            {section.detailedNotesMarkdown}
                          </div>

                          {section.keyTerms && section.keyTerms.length > 0 && (
                            <div className="p-3 rounded-lg bg-gruvbox-bg1/30 border border-gruvbox-bg1 space-y-1.5">
                              <span className="text-[10px] font-bold text-gruvbox-yellow uppercase tracking-wider block">
                                Key Terms
                              </span>
                              <div className="space-y-1">
                                {section.keyTerms.map((kt, ktIdx) => (
                                  <div key={ktIdx} className="text-xs">
                                    <strong className="text-gruvbox-yellow">{kt.term}:</strong>{' '}
                                    <span className="text-gruvbox-fgDim">{kt.definition}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {section.formulasOrRules && section.formulasOrRules.length > 0 && (
                            <div className="p-3 rounded-lg bg-gruvbox-bg1/30 border border-gruvbox-purple/20 space-y-1.5">
                              <span className="text-[10px] font-bold text-gruvbox-purple uppercase tracking-wider block">
                                Formulas / Rules
                              </span>
                              <div className="space-y-1.5">
                                {section.formulasOrRules.map((f, fIdx) => (
                                  <div key={fIdx} className="text-xs">
                                    <div className="font-bold text-gruvbox-purple">{f.name}</div>
                                    {f.formula && (
                                      <div className="p-1.5 my-1 rounded bg-gruvbox-bgHard font-mono text-gruvbox-green border border-gruvbox-bg1 text-[11px]">
                                        {f.formula}
                                      </div>
                                    )}
                                    <p className="text-gruvbox-fgDim">{f.explanation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Concepts & Wikilinks */}
            {reviewer?.entities && reviewer.entities.length > 0 && (
              <div className="glass-panel p-4 rounded-xl border border-gruvbox-bg1">
                <h3 className="text-xs font-bold text-gruvbox-aqua uppercase tracking-wider mb-2.5">
                  Connected Concepts
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {reviewer.entities.map((ent, idx) => (
                    <button
                      key={idx}
                      onClick={() => onConceptClick && onConceptClick(ent.name || ent)}
                      className="px-2 py-0.5 rounded bg-gruvbox-bg1 hover:bg-gruvbox-yellow/20 border border-gruvbox-yellow/30 text-gruvbox-yellow text-xs transition-colors"
                      title={ent.description || 'View in Graph'}
                    >
                      [[{ent.name || ent}]]
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Glossary */}
            {reviewer?.glossary && reviewer.glossary.length > 0 && (
              <div className="glass-panel p-4 rounded-xl border border-gruvbox-bg1">
                <h3 className="text-xs font-bold text-gruvbox-gray uppercase tracking-wider mb-2.5">
                  Glossary ({reviewer.glossary.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {reviewer.glossary.map((g, gIdx) => (
                    <div key={gIdx} className="p-2.5 rounded-lg bg-gruvbox-bg/50 border border-gruvbox-bg1">
                      <strong className="text-xs text-gruvbox-yellow block">{g.term}</strong>
                      <p className="text-[11px] text-gruvbox-fgDim mt-0.5 leading-relaxed">{g.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: FIGURES & DIAGRAMS */}
        {activeTab === 'figures' && (
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
                  <div className="relative aspect-video bg-black/40 overflow-hidden flex items-center justify-center">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-5 h-5 text-gruvbox-fgLight" />
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between border-t border-gruvbox-bg1 bg-gruvbox-bg/50">
                    <span className="text-xs font-bold text-gruvbox-fg">{img.name}</span>
                    <span className="text-[10px] text-gruvbox-gray">
                      {(img.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <FlashcardsView
            flashcards={document.flashcards || []}
            docTitle={title}
            onCardReviewed={onFlashcardReview}
          />
        )}

        {/* TAB 4: QUIZ */}
        {activeTab === 'quiz' && (
          <QuizView
            quizQuestions={document.quizQuestions || []}
            docTitle={title}
            onQuizCompleted={onQuizComplete}
          />
        )}

        {/* TAB 5: SOURCE */}
        {activeTab === 'source' && (
          <div className="max-w-3xl mx-auto space-y-4 pb-12">
            {isYt ? (
              <div className="space-y-4">
                {document.sourceUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-gruvbox-bg1 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${document.sourceUrl.split('v=')[1]?.split('&')[0]}?autoplay=0&start=${currentYtTime}`}
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
                      Chapters
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
            ) : (
              <div className="glass-panel p-5 rounded-xl border border-gruvbox-bg1">
                <h3 className="text-xs font-bold text-gruvbox-gray uppercase tracking-wider mb-3">
                  Document Text ({document.rawText?.length || 0} characters)
                </h3>
                <pre className="text-xs text-gruvbox-fgDim whitespace-pre-wrap leading-relaxed max-h-[550px] overflow-y-auto p-3 rounded-lg bg-gruvbox-bgHard border border-gruvbox-bg1">
                  {document.rawText}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Lightbox Modal for Full-Resolution Image Inspection */}
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
              <span className="text-xs font-bold text-gruvbox-fgLight">{activeLightboxImg.name}</span>
              <button
                onClick={() => setActiveLightboxImg(null)}
                className="p-1 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-4rem)] flex items-center justify-center bg-black/40">
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
