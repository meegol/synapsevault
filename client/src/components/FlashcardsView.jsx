import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Sparkles, 
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardsView({ flashcards = [], docTitle = '', onCardReviewed }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [masteredCards, setMasteredCards] = useState(new Set());

  const currentCard = flashcards[currentIndex];
  const progressPercent = flashcards.length > 0 ? Math.round((studiedCards.size / flashcards.length) * 100) : 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(f => !f);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        handlePrev();
      } else if (e.code === 'Digit1') {
        handleRate(false);
      } else if (e.code === 'Digit2' || e.code === 'Digit3') {
        handleRate(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, flashcards]);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Layers className="w-12 h-12 text-gruvbox-gray/50 mb-3" />
        <h3 className="text-base font-mono font-bold text-gruvbox-fg">No Flashcards Generated Yet</h3>
        <p className="text-xs font-mono text-gruvbox-gray mt-1 max-w-sm">
          Flashcards are automatically extracted when you ingest PDFs, YouTube videos, or notes.
        </p>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(i => (i + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(i => (i - 1 + flashcards.length) % flashcards.length);
  };

  const handleRate = (mastered) => {
    setStudiedCards(prev => new Set([...prev, currentIndex]));
    if (mastered) {
      setMasteredCards(prev => {
        const next = new Set([...prev, currentIndex]);
        if (next.size === flashcards.length) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        return next;
      });
    }

    if (onCardReviewed) {
      onCardReviewed(currentIndex, mastered);
    }

    handleNext();
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col items-center select-none font-mono">
      {/* Progress Header */}
      <div className="w-full flex items-center justify-between mb-4 text-xs text-gruvbox-gray">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gruvbox-yellow">Card {currentIndex + 1} of {flashcards.length}</span>
          {currentCard.category && (
            <span className="px-2 py-0.5 rounded bg-gruvbox-bg1 text-gruvbox-aqua text-[10px]">
              {currentCard.category}
            </span>
          )}
          {currentCard.difficulty && (
            <span className={`px-2 py-0.5 rounded text-[10px] ${
              currentCard.difficulty === 'hard' ? 'bg-gruvbox-red/20 text-gruvbox-red' :
              currentCard.difficulty === 'medium' ? 'bg-gruvbox-yellow/20 text-gruvbox-yellow' :
              'bg-gruvbox-green/20 text-gruvbox-green'
            }`}>
              {currentCard.difficulty.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Mastered: <strong className="text-gruvbox-green">{masteredCards.size}/{flashcards.length}</strong></span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gruvbox-bg1 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-gruvbox-yellow to-gruvbox-aqua transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer perspective-1000 group mb-6"
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>
          {/* Front Face (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden glass-panel-elevated p-8 rounded-2xl flex flex-col justify-between border-2 border-gruvbox-bg1 group-hover:border-gruvbox-yellow/40 transition-colors">
            <div className="flex items-center justify-between text-gruvbox-gray text-xs">
              <span className="flex items-center gap-1.5 text-gruvbox-yellow font-bold uppercase tracking-wider text-[11px]">
                <HelpCircle className="w-4 h-4" /> QUESTION
              </span>
              <span className="text-[10px]">Click or Press Space to Flip</span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-lg md:text-xl font-mono font-medium text-gruvbox-fgLight leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gruvbox-gray">
              <span>{docTitle}</span>
              <div className="flex items-center gap-1 text-gruvbox-yellow">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Flip Card</span>
              </div>
            </div>
          </div>

          {/* Back Face (Answer) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass-panel-elevated p-8 rounded-2xl flex flex-col justify-between border-2 border-gruvbox-aqua/40">
            <div className="flex items-center justify-between text-gruvbox-gray text-xs">
              <span className="flex items-center gap-1.5 text-gruvbox-aqua font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4" /> ANSWER / EXPLANATION
              </span>
              <span className="text-[10px]">Click to Flip back</span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-48">
              <p className="text-base md:text-lg font-mono text-gruvbox-fg leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gruvbox-gray">
              <span>Synapse Active Recall</span>
              <span className="text-gruvbox-aqua font-medium">Rate your recall below ↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Confidence Buttons */}
      <div className="w-full flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="p-3 rounded-xl bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-all"
          title="Previous Card (← or A)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {isFlipped ? (
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => handleRate(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-gruvbox-red/15 hover:bg-gruvbox-red/25 border border-gruvbox-red/40 text-gruvbox-red font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" /> Need Review (1)
            </button>
            <button
              onClick={() => handleRate(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-gruvbox-green/15 hover:bg-gruvbox-green/25 border border-gruvbox-green/40 text-gruvbox-green font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> Mastered (2)
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsFlipped(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-gruvbox-bg1 hover:bg-gruvbox-bg2 border border-gruvbox-yellow/30 text-gruvbox-yellow font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" /> Reveal Answer (Space)
          </button>
        )}

        <button
          onClick={handleNext}
          className="p-3 rounded-xl bg-gruvbox-bg hover:bg-gruvbox-bg1 border border-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-all"
          title="Next Card (→ or D)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="mt-6 flex items-center gap-4 text-[10px] text-gruvbox-gray">
        <span><kbd className="px-1.5 py-0.5 bg-gruvbox-bg1 rounded border border-gruvbox-bg2">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-gruvbox-bg1 rounded border border-gruvbox-bg2">← / →</kbd> Prev / Next</span>
        <span><kbd className="px-1.5 py-0.5 bg-gruvbox-bg1 rounded border border-gruvbox-bg2">1 / 2</kbd> Review / Mastered</span>
      </div>
    </div>
  );
}
