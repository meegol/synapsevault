import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Award, 
  ChevronRight,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizView({ 
  quizQuestions = [], 
  docTitle = '', 
  onQuizCompleted 
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center font-mono">
        <HelpCircle className="w-12 h-12 text-gruvbox-gray/50 mb-3" />
        <h3 className="text-base font-bold text-gruvbox-fg">No Quiz Questions Available</h3>
        <p className="text-xs text-gruvbox-gray mt-1 max-w-sm">
          Practice questions are generated automatically when analyzing PDFs, YouTube lectures, or notes.
        </p>
      </div>
    );
  }

  const handleSelectOption = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleCalculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    setSubmitted(true);

    if (correct / quizQuestions.length >= 0.7) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    if (onQuizCompleted) {
      onQuizCompleted(correct, quizQuestions.length);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentQIndex(0);
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const score = quizQuestions.reduce((acc, q, idx) => acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0), 0);
  const scorePercentage = Math.round((score / quizQuestions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 font-mono select-none">
      {/* Quiz Header */}
      <div className="glass-panel p-4 rounded-xl mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-gruvbox-yellow" />
            <h3 className="text-sm font-bold text-gruvbox-fgLight">Practice Exam & Review Arena</h3>
          </div>
          <p className="text-[11px] text-gruvbox-gray mt-0.5">{docTitle}</p>
        </div>

        {submitted ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-gruvbox-gray">Score:</span>
              <span className={`text-lg font-bold ml-1.5 ${
                scorePercentage >= 80 ? 'text-gruvbox-green' :
                scorePercentage >= 50 ? 'text-gruvbox-yellow' : 'text-gruvbox-red'
              }`}>
                {score} / {quizQuestions.length} ({scorePercentage}%)
              </span>
            </div>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-gruvbox-bg1 hover:bg-gruvbox-bg2 text-gruvbox-yellow transition-all"
              title="Retake Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-xs text-gruvbox-gray">Answered: </span>
            <strong className="text-gruvbox-aqua">{totalAnswered} / {quizQuestions.length}</strong>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {quizQuestions.map((q, qIdx) => {
          const userAnswer = selectedAnswers[qIdx];
          const isCorrect = userAnswer === q.correctIndex;
          const isAnswered = userAnswer !== undefined;

          return (
            <div 
              key={qIdx}
              className={`glass-panel p-5 rounded-xl border transition-all duration-200 ${
                submitted
                  ? isCorrect 
                    ? 'border-gruvbox-green/40 shadow-sm'
                    : 'border-gruvbox-red/40 shadow-sm'
                  : isAnswered
                  ? 'border-gruvbox-yellow/30'
                  : 'border-gruvbox-bg1'
              }`}
            >
              {/* Question Title */}
              <div className="flex items-start gap-3 mb-4">
                <span className="w-6 h-6 rounded-md bg-gruvbox-bg1 text-gruvbox-yellow text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {qIdx + 1}
                </span>
                <p className="text-sm font-medium text-gruvbox-fgLight leading-relaxed flex-1">
                  {q.question}
                </p>
              </div>

              {/* Options Grid */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isThisOptionCorrect = optIdx === q.correctIndex;

                  let optClass = 'bg-gruvbox-bg/60 hover:bg-gruvbox-bg border-gruvbox-bg1 text-gruvbox-fg';
                  
                  if (submitted) {
                    if (isThisOptionCorrect) {
                      optClass = 'bg-gruvbox-green/15 border-gruvbox-green/60 text-gruvbox-green font-semibold';
                    } else if (isSelected && !isThisOptionCorrect) {
                      optClass = 'bg-gruvbox-red/15 border-gruvbox-red/60 text-gruvbox-red';
                    } else {
                      optClass = 'bg-gruvbox-bg/30 border-gruvbox-bg1/40 text-gruvbox-gray opacity-60';
                    }
                  } else if (isSelected) {
                    optClass = 'bg-gruvbox-yellow/20 border-gruvbox-yellow text-gruvbox-yellow font-semibold shadow-glass-glow-yellow/20';
                  }

                  const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-gruvbox-bg1 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {optLetter}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {submitted && isThisOptionCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-gruvbox-green flex-shrink-0" />
                      )}
                      {submitted && isSelected && !isThisOptionCorrect && (
                        <XCircle className="w-4 h-4 text-gruvbox-red flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Explanation Breakdown */}
              {submitted && (
                <div className="mt-4 ml-9 p-3.5 rounded-lg bg-gruvbox-bg1/60 border border-gruvbox-bg1 text-xs text-gruvbox-fgDim space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-gruvbox-aqua text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" /> EXPLANATION & KEY INSIGHT
                  </div>
                  <p className="leading-relaxed">
                    {q.explanation || 'According to the source documentation, this is the supported answer.'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit or Reset Bar */}
      <div className="mt-8 flex items-center justify-end gap-3 sticky bottom-4 z-10">
        {!submitted ? (
          <button
            onClick={handleCalculateScore}
            disabled={totalAnswered === 0}
            className={`py-3 px-6 rounded-xl font-mono text-xs font-bold transition-all shadow-glass flex items-center gap-2 ${
              totalAnswered > 0
                ? 'bg-gruvbox-green hover:bg-gruvbox-greenDim text-gruvbox-bgHard shadow-glass-glow-aqua cursor-pointer'
                : 'bg-gruvbox-bg1 text-gruvbox-gray cursor-not-allowed opacity-50'
            }`}
          >
            <Check className="w-4 h-4" /> Submit Answers ({totalAnswered}/{quizQuestions.length})
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="py-3 px-6 rounded-xl bg-gruvbox-yellow hover:bg-gruvbox-yellowDim text-gruvbox-bgHard font-mono text-xs font-bold transition-all shadow-glass-glow-yellow flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}
