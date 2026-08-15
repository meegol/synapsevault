import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GraphView from './components/GraphView';
import ReviewerStudio from './components/ReviewerStudio';
import VaultChatbot from './components/VaultChatbot';
import IngestionModal from './components/IngestionModal';
import MobileNav from './components/MobileNav';
import LockScreen from './components/LockScreen';
import { apiFetch, getAuthToken, clearAuthToken } from './api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));
  const [activeView, setActiveView] = useState('graph'); // 'graph' | 'reviewer' | 'chat'
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);

  // Modals
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [ingestionTab, setIngestionTab] = useState('pdf');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check auth session validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchVaultData();
        } else {
          clearAuthToken();
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsAuthenticated(true);
        fetchVaultData();
      }
    };

    checkAuth();

    // Listen for lock events
    const handleLockEvent = () => setIsAuthenticated(false);
    window.addEventListener('vault:lock', handleLockEvent);
    return () => window.removeEventListener('vault:lock', handleLockEvent);
  }, []);

  // Fetch documents and graph data from server
  const fetchVaultData = async () => {
    try {
      const [docsRes, graphRes] = await Promise.all([
        apiFetch('/api/documents'),
        apiFetch('/api/graph')
      ]);

      const docsData = await docsRes.json();
      const graphJson = await graphRes.json();

      setDocuments(docsData.documents || []);
      setGraphData(graphJson || { nodes: [], links: [] });

      // Default select first doc if none selected
      if (!selectedDocId && docsData.documents && docsData.documents.length > 0) {
        setSelectedDocId(docsData.documents[0].id);
      }
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  };

  const handleUnlock = (token) => {
    setIsAuthenticated(true);
    fetchVaultData();
  };

  const handleLockVault = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    clearAuthToken();
    setIsAuthenticated(false);
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocId(docId);
    setActiveView('reviewer');
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteDoc = async (docId) => {
    try {
      setDocuments(prev => {
        const next = prev.filter(d => d.id !== docId);
        if (selectedDocId === docId) {
          setSelectedDocId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
      await apiFetch(`/api/documents/${docId}`, { method: 'DELETE' });
      fetchVaultData();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleIngestSuccess = (newDoc) => {
    fetchVaultData();
    setSelectedDocId(newDoc.id);
    setActiveView('reviewer');
  };

  const handleOpenIngestion = (tab = 'pdf') => {
    setIngestionTab(tab);
    setIsIngestionOpen(true);
  };

  const handleExportVault = async () => {
    try {
      const res = await apiFetch('/api/export-vault');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SynapseVault_Export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export vault:', err);
    }
  };

  const handleTagClick = (tag) => {
    const cleanTag = tag.replace(/^#/, '');
    setSelectedTag(cleanTag);
    setActiveView('graph');
    setSearchQuery(cleanTag);
  };

  const handleConceptClick = (conceptName) => {
    setActiveView('graph');
    setSearchQuery(conceptName);
  };

  const handleFlashcardReview = async (cardIndex, isMastered) => {
    if (!selectedDocId) return;
    try {
      await apiFetch(`/api/documents/${selectedDocId}/flashcard-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIndex, isMastered })
      });
      fetchVaultData();
    } catch (err) {
      console.error('Failed to update flashcard:', err);
    }
  };

  const handleQuizComplete = async (score, totalQuestions) => {
    if (!selectedDocId) return;
    try {
      await apiFetch(`/api/documents/${selectedDocId}/quiz-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, totalQuestions })
      });
      fetchVaultData();
    } catch (err) {
      console.error('Failed to record quiz result:', err);
    }
  };

  // If vault is locked, render Lock Screen
  if (!isAuthenticated) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  const selectedDocument = documents.find(d => d.id === selectedDocId) || documents[0];

  return (
    <div className="h-screen w-screen bg-gruvbox-bgHard text-gruvbox-fg flex flex-col overflow-hidden font-sans select-none">
      
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenIngestion={handleOpenIngestion}
        onExportVault={handleExportVault}
        onLockVault={handleLockVault}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        
        {/* Desktop Left Sidebar */}
        <div className="hidden md:flex flex-col flex-shrink-0 h-full min-h-0">
          <Sidebar
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDoc={handleSelectDoc}
            onDeleteDoc={handleDeleteDoc}
            onOpenIngestion={handleOpenIngestion}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            graphStats={graphData.stats}
          />
        </div>

        {/* Mobile Slide-over Drawer for Sidebar */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="relative w-4/5 max-w-xs bg-gruvbox-bgHard h-full z-10 shadow-2xl flex flex-col">
              <Sidebar
                documents={documents}
                selectedDocId={selectedDocId}
                onSelectDoc={handleSelectDoc}
                onDeleteDoc={handleDeleteDoc}
                onOpenIngestion={handleOpenIngestion}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                graphStats={graphData.stats}
              />
            </div>
          </div>
        )}

        {/* Center Main View Canvas / Studio / Chat */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 h-full overflow-hidden pb-16 md:pb-0">
          {activeView === 'graph' && (
            <GraphView
              graphData={graphData}
              searchQuery={searchQuery}
              onSelectDoc={handleSelectDoc}
              documents={documents}
            />
          )}

          {activeView === 'reviewer' && (
            <ReviewerStudio
              document={selectedDocument}
              onDeleteDoc={handleDeleteDoc}
              onTagClick={handleTagClick}
              onConceptClick={handleConceptClick}
              onFlashcardReview={handleFlashcardReview}
              onQuizComplete={handleQuizComplete}
            />
          )}

          {activeView === 'chat' && (
            <VaultChatbot
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={handleSelectDoc}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenIngestion={handleOpenIngestion}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Ingestion Modal (PDF / YouTube / Note) */}
      <IngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        initialTab={ingestionTab}
        onIngestSuccess={handleIngestSuccess}
      />
    </div>
  );
}
