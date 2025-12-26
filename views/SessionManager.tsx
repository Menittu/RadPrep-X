
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../db';
import { Question, ActiveSession, Attempt } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Flag, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Save,
  Trophy
} from 'lucide-react';

interface SessionManagerProps {
  mode: 'Practice' | 'Mock';
  chapter?: string;
  onExit: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ mode, chapter, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fix: Move initializeSession out of useEffect to make it accessible to the "Review Session" button.
  const initializeSession = useCallback(async () => {
    setLoading(true);
    // Check for saved session
    const saved = await db.activeSessions.get('current');
    
    if (saved && saved.type === mode && (saved.chapter === chapter || (!saved.chapter && !chapter))) {
      // Resume
      const qList = await db.questions.bulkGet(saved.questionIds);
      setQuestions(qList.filter(Boolean) as Question[]);
      setCurrentIdx(saved.currentIdx);
      setAnswers(saved.answers);
    } else {
      // New session
      let qBank: Question[];
      if (chapter) {
        qBank = await db.questions.where('chapter').equals(chapter).toArray();
      } else {
        qBank = await db.questions.toArray();
      }

      // Shuffle
      const shuffled = qBank.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(20, shuffled.length));
      
      setQuestions(selected);
      setAnswers(new Array(selected.length).fill(null));
      setCurrentIdx(0);

      // Clear existing active session
      await db.activeSessions.clear();
      await db.activeSessions.put({
        id: 'current',
        type: mode,
        chapter,
        questionIds: selected.map(q => q.id!),
        currentIdx: 0,
        answers: new Array(selected.length).fill(null),
        startTime: Date.now()
      });
    }
    setLoading(false);
  }, [mode, chapter]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    // Sync to DB whenever state changes
    if (!loading && !sessionComplete) {
      db.activeSessions.update('current', {
        currentIdx,
        answers
      });
    }

    // Check bookmark status
    const checkBookmark = async () => {
      if (questions[currentIdx]?.id) {
        const b = await db.bookmarks.get(questions[currentIdx].id!);
        setIsBookmarked(!!b);
      }
    };
    if (questions.length > 0) checkBookmark();
    setShowExplanation(false);
  }, [currentIdx, answers, loading, sessionComplete, questions]);

  const handleSelectAnswer = (optionIndex: number) => {
    if (answers[currentIdx] !== null && mode === 'Practice') return; // Only one selection in practice mode
    
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIndex;
    setAnswers(newAnswers);
    
    if (mode === 'Practice') {
      setShowExplanation(true);
    }
  };

  const toggleBookmark = async () => {
    const qId = questions[currentIdx].id!;
    if (isBookmarked) {
      await db.bookmarks.delete(qId);
      setIsBookmarked(false);
    } else {
      await db.bookmarks.put({ questionId: qId, timestamp: Date.now() });
      setIsBookmarked(true);
    }
  };

  const finishSession = async () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });

    const attempt: Attempt = {
      timestamp: Date.now(),
      chapter: chapter || 'Mixed',
      score,
      total: questions.length,
      mode,
      questionIds: questions.map(q => q.id!),
      userAnswers: answers
    };

    await db.attempts.add(attempt);
    await db.activeSessions.clear();
    setSessionComplete(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl">
      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
      <h3 className="text-xl font-bold">No Questions Found</h3>
      <p className="opacity-60 mb-6">Import some data in the Vault to get started.</p>
      <button onClick={onExit} className="bg-primary text-white px-8 py-3 rounded-full">Go Back</button>
    </div>
  );

  if (sessionComplete) {
    const scoreVal = answers.reduce((acc, curr, idx) => curr === questions[idx].correctIndex ? acc + 1 : acc, 0);
    const percentage = Math.round((scoreVal / questions.length) * 100);

    return (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative inline-block mt-8">
           <Trophy className="w-24 h-24 text-primary-container mx-auto drop-shadow-xl" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-3xl text-primary">
              {percentage}%
           </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-2">Excellent Effort!</h2>
          <p className="opacity-60">You scored {scoreVal} out of {questions.length} questions correctly.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl">
            <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Mode</p>
            <p className="text-lg font-medium">{mode}</p>
          </div>
          <div className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl">
            <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Status</p>
            <p className="text-lg font-medium text-green-500">Saved</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              setSessionComplete(false);
              setCurrentIdx(0);
              setAnswers(new Array(questions.length).fill(null));
              initializeSession(); // Reuse same question set
            }}
            className="w-full bg-primary text-white py-4 rounded-full font-bold hover:shadow-lg transition-all"
          >
            Review Session
          </button>
          <button 
            onClick={onExit}
            className="w-full border border-primary text-primary py-4 rounded-full font-bold hover:bg-primary/5 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Session Progress Header */}
      <div className="fixed top-16 left-0 w-full h-1 z-50 overflow-hidden">
        <div 
          className="h-full bg-primary dark:bg-primary-container transition-all duration-500 ease-m3-fluid" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="flex items-center justify-between mb-8 mt-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
          <X className="w-6 h-6" />
        </button>
        <div className="text-sm font-bold bg-primary/10 text-primary dark:bg-primary-container/20 dark:text-primary-container px-4 py-1.5 rounded-full">
          Question {currentIdx + 1} / {questions.length}
        </div>
        <button 
          onClick={toggleBookmark}
          className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isBookmarked ? 'text-primary' : 'text-on-surface/30'}`}
        >
          <Flag className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-[#1A2323] p-8 rounded-[32px] border border-black/5 dark:border-white/5 min-h-[160px] flex items-center">
          <p className="text-xl font-medium leading-relaxed">{currentQuestion.text}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentIdx] === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showFeedback = mode === 'Practice' && answers[currentIdx] !== null;

            let styles = "w-full text-left p-5 rounded-3xl transition-all border-2 flex items-center justify-between ";
            if (isSelected) {
              if (showFeedback) {
                styles += isCorrect ? "bg-green-50 border-green-500 text-green-900" : "bg-red-50 border-red-500 text-red-900";
              } else {
                styles += "bg-primary-container border-primary text-on-surface font-medium";
              }
            } else {
              if (showFeedback && isCorrect) {
                styles += "bg-green-50 border-green-200 text-green-900";
              } else {
                styles += "bg-white dark:bg-white/5 border-transparent dark:border-white/5 hover:border-primary/30";
              }
            }

            return (
              <button key={idx} onClick={() => handleSelectAnswer(idx)} className={styles}>
                <span>{option}</span>
                {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {showFeedback && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="bg-[#E0F2F1]/50 dark:bg-primary/10 p-6 rounded-3xl border border-primary/20 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <Lightbulb className="w-5 h-5" />
              <span>Insight</span>
            </div>
            <p className="text-sm leading-relaxed opacity-80">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex gap-4 mt-8 pb-10">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="flex-1 py-4 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center gap-2 disabled:opacity-30"
          >
            <ChevronLeft /> Previous
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button 
              onClick={finishSession}
              className="flex-[2] py-4 bg-primary text-white rounded-full flex items-center justify-center gap-2 font-bold hover:shadow-lg"
            >
              Finish <Save className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="flex-[2] py-4 bg-primary text-white rounded-full flex items-center justify-center gap-2 font-bold hover:shadow-lg"
            >
              Next <ChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
