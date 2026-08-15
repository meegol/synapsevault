import React, { useState } from 'react';
import { 
  Upload, 
  Plus, 
  X, 
  FileText, 
  AlertCircle
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';
import { apiFetch } from '../api';
import { parsePdfInBrowser } from '../utils/clientPdfParser';

export default function IngestionModal({ 
  isOpen, 
  onClose, 
  initialTab = 'pdf', 
  onIngestSuccess 
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'pdf' | 'youtube' | 'note'
  
  // PDF state
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  // Loading & Progress state
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setLoading(true);
    setError(null);
    setStatusMessage('Reading PDF structure in browser...');

    try {
      // 1. Parse text and extract figures in browser (bypasses all payload size limits)
      let parsed;
      try {
        parsed = await parsePdfInBrowser(pdfFile, (p) => {
          setStatusMessage(`Extracting page ${p.current} of ${p.total}...`);
        });
      } catch (clientParseErr) {
        console.warn('Browser parser failed, attempting direct upload:', clientParseErr);
      }

      let res;
      if (parsed && parsed.rawText && parsed.rawText.trim().length > 0) {
        setStatusMessage(`Generating study notes & reviewer (${parsed.wordCount.toLocaleString()} words)...`);
        
        res = await apiFetch('/api/ingest-pdf-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: parsed.title,
            rawText: parsed.rawText,
            numPages: parsed.numPages,
            wordCount: parsed.wordCount,
            images: parsed.images || []
          })
        });
      } else {
        // Fallback to direct upload
        setStatusMessage('Uploading document for processing...');
        const formData = new FormData();
        formData.append('file', pdfFile);

        res = await apiFetch('/api/upload-pdf', {
          method: 'POST',
          body: formData
        });
      }

      if (!res.ok) {
        let errText = 'Failed to process PDF';
        try {
          const errData = await res.json();
          errText = errData.error || errText;
        } catch (_) {
          errText = `Server responded with status ${res.status}: ${res.statusText}`;
        }
        throw new Error(errText);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setStatusMessage('Indexing concepts and graph nodes...');
      setTimeout(() => {
        setLoading(false);
        onIngestSuccess(data.document);
        onClose();
      }, 400);
    } catch (err) {
      console.error('PDF Ingest failed:', err);
      setError(err.message || 'Failed to ingest PDF. Please check the file and try again.');
      setLoading(false);
    }
  };

  const handleYouTubeIngest = async () => {
    if (!youtubeUrl.trim()) return;
    setLoading(true);
    setError(null);
    setStatusMessage('Fetching captions and timestamps...');

    try {
      setTimeout(() => setStatusMessage('Generating study notes and chapters...'), 1200);

      const res = await apiFetch('/api/fetch-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: youtubeUrl.trim() })
      });

      if (!res.ok) {
        let errText = 'Failed to process YouTube video';
        try {
          const errData = await res.json();
          errText = errData.error || errText;
        } catch (_) {
          errText = `Server responded with status ${res.status}: ${res.statusText}`;
        }
        throw new Error(errText);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setStatusMessage('Indexing concepts...');
      setTimeout(() => {
        setLoading(false);
        onIngestSuccess(data.document);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to ingest YouTube video');
      setLoading(false);
    }
  };

  const handleNoteCreate = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setLoading(true);
    setError(null);
    setStatusMessage('Saving note and indexing concepts...');

    try {
      const tagsArray = noteTags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

      const res = await apiFetch('/api/create-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          tags: tagsArray
        })
      });

      if (!res.ok) {
        let errText = 'Failed to create note';
        try {
          const errData = await res.json();
          errText = errData.error || errText;
        } catch (_) {
          errText = `Server responded with status ${res.status}: ${res.statusText}`;
        }
        throw new Error(errText);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setLoading(false);
      onIngestSuccess(data.document);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create note');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none font-mono">
      <div className="glass-panel-elevated w-full max-w-lg rounded-2xl overflow-hidden border border-gruvbox-bg1 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gruvbox-bg1 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gruvbox-fgLight">Import Document</h3>
            <p className="text-[11px] text-gruvbox-gray">Add PDF, video transcript, or note to vault</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-2 flex gap-1.5 border-b border-gruvbox-bg1">
          <button
            onClick={() => { setActiveTab('pdf'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'pdf'
                ? 'bg-gruvbox-red/20 text-gruvbox-red border border-gruvbox-red/30'
                : 'text-gruvbox-gray hover:text-gruvbox-fg hover:bg-gruvbox-bg'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={() => { setActiveTab('youtube'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'youtube'
                ? 'bg-gruvbox-orange/20 text-gruvbox-orange border border-gruvbox-orange/30'
                : 'text-gruvbox-gray hover:text-gruvbox-fg hover:bg-gruvbox-bg'
            }`}
          >
            <YouTubeIcon className="w-3.5 h-3.5" /> YouTube
          </button>
          <button
            onClick={() => { setActiveTab('note'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'note'
                ? 'bg-gruvbox-blue/20 text-gruvbox-blue border border-gruvbox-blue/30'
                : 'text-gruvbox-gray hover:text-gruvbox-fg hover:bg-gruvbox-bg'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Note
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="p-2.5 rounded-lg bg-gruvbox-red/10 border border-gruvbox-red/30 text-xs text-gruvbox-red flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setPdfFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-gruvbox-red bg-gruvbox-red/10'
                    : pdfFile
                    ? 'border-gruvbox-green/50 bg-gruvbox-green/5'
                    : 'border-gruvbox-bg2 hover:border-gruvbox-red/40 bg-gruvbox-bg/40'
                }`}
                onClick={() => document.getElementById('pdf-file-input').click()}
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPdfFile(e.target.files[0]);
                    }
                  }}
                />

                {pdfFile ? (
                  <div className="space-y-1">
                    <FileText className="w-8 h-8 text-gruvbox-green mx-auto mb-2" />
                    <p className="text-xs font-bold text-gruvbox-fg">{pdfFile.name}</p>
                    <p className="text-[11px] text-gruvbox-gray">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-gruvbox-gray mx-auto mb-2" />
                    <p className="text-xs font-bold text-gruvbox-fg">
                      Drag and drop PDF here, or click to browse
                    </p>
                    <p className="text-[11px] text-gruvbox-gray">
                      Supports textbooks, slides, and papers
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handlePdfUpload}
                disabled={!pdfFile || loading}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  pdfFile && !loading
                    ? 'bg-gruvbox-red hover:bg-gruvbox-redDim text-gruvbox-bgHard cursor-pointer'
                    : 'bg-gruvbox-bg1 text-gruvbox-gray cursor-not-allowed opacity-50'
                }`}
              >
                {loading ? statusMessage : 'Import PDF & Generate Notes'}
              </button>
            </div>
          )}

          {/* TAB 2: YOUTUBE */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-gruvbox-gray uppercase tracking-wider block mb-1.5">
                  YouTube URL
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-orange">
                    <YouTubeIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={loading}
                    className="w-full bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/50 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-gruvbox-bg1 focus:border-gruvbox-orange focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleYouTubeIngest}
                disabled={!youtubeUrl.trim() || loading}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  youtubeUrl.trim() && !loading
                    ? 'bg-gruvbox-orange hover:bg-gruvbox-orangeDim text-gruvbox-bgHard cursor-pointer'
                    : 'bg-gruvbox-bg1 text-gruvbox-gray cursor-not-allowed opacity-50'
                }`}
              >
                {loading ? statusMessage : 'Fetch Transcripts & Generate Notes'}
              </button>
            </div>
          )}

          {/* TAB 3: NOTE */}
          {activeTab === 'note' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gruvbox-gray uppercase tracking-wider block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/50 text-xs px-3 py-2 rounded-lg border border-gruvbox-bg1 focus:border-gruvbox-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gruvbox-gray uppercase tracking-wider block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="physics, math, algorithms"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/50 text-xs px-3 py-2 rounded-lg border border-gruvbox-bg1 focus:border-gruvbox-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gruvbox-gray uppercase tracking-wider block mb-1">
                  Markdown Content
                </label>
                <textarea
                  placeholder="Paste or write notes..."
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/50 text-xs p-3 rounded-lg border border-gruvbox-bg1 focus:border-gruvbox-blue focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleNoteCreate}
                disabled={!noteTitle.trim() || !noteContent.trim() || loading}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  noteTitle.trim() && noteContent.trim() && !loading
                    ? 'bg-gruvbox-blue hover:bg-gruvbox-blueDim text-gruvbox-bgHard cursor-pointer'
                    : 'bg-gruvbox-bg1 text-gruvbox-gray cursor-not-allowed opacity-50'
                }`}
              >
                {loading ? statusMessage : 'Save Note'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
