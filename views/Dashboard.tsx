
import React, { useEffect, useState } from 'react';
import { db } from '../db';
import { ActiveSession, Attempt, AppRoute } from '../types';
import { 
  Play, 
  RotateCcw, 
  Award, 
  Clock, 
  ArrowRight, 
  BrainCircuit, 
  Layers,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface DashboardProps {
  onStartSession: (route: AppRoute, chapter?: string, mode?: 'Practice' | 'Mock') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [stats, setStats] = useState({ totalQuestions: 0, totalAttempts: 0, avgScore: 0 });
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [chapters, setChapters] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Load active session
      const session = await db.activeSessions.get('current');
      setActiveSession(session || null);

      // Load general stats
      const qCount = await db.questions.count();
      const allAttempts = await db.attempts.toArray();
      const avg = allAttempts.length > 0 
        ? Math.round(allAttempts.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / allAttempts.length * 100) 
        : 0;

      setStats({
        totalQuestions: qCount,
        totalAttempts: allAttempts.length,
        avgScore: avg
      });

      setRecentAttempts(allAttempts.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3));

      // Load available chapters/question banks
      const allQuestions = await db.questions.toArray();
      const chapterMap: { [key: string]: number } = {};
      allQuestions.forEach(q => {
        chapterMap[q.chapter] = (chapterMap[q.chapter] || 0) + 1;
      });
      setChapters(Object.entries(chapterMap).map(([name, count]) => ({ name, count })));
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-10 pb-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-primary-container/30 dark:bg-primary/20 p-8 rounded-3xl border border-primary/10 flex flex-col justify-between min-h-[220px]">
          <div>
            <h2 className="text-3xl font-bold text-primary dark:text-primary-container mb-2">Ready for Prep?</h2>
            <p className="text-on-surface/70 dark:text-on-surface-dark/70 max-w-lg">
              Launch a comprehensive mixed-session or select a specific domain below to focus your efforts.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => onStartSession(AppRoute.PRACTICE, undefined, 'Practice')}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Mixed Practice
            </button>
            <button 
              onClick={() => onStartSession(AppRoute.MOCK, undefined, 'Mock')}
              className="px-6 py-3 border border-primary/20 bg-white/50 dark:bg-black/20 text-primary dark:text-primary-container rounded-full font-medium flex items-center gap-2 hover:bg-primary/5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Full Mock Exam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center">
            <Award className="w-8 h-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{stats.avgScore}%</span>
            <span className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Mastery</span>
          </div>
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center">
            <Layers className="w-8 h-8 text-secondary mb-2" />
            <span className="text-2xl font-bold">{stats.totalQuestions}</span>
            <span className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Questions</span>
          </div>
        </div>
      </section>

      {/* Active Session Resume */}
      {activeSession && (
        <section className="bg-primary/5 dark:bg-primary/10 p-1 border-2 border-primary/20 rounded-[32px] overflow-hidden">
          <div className="bg-white dark:bg-[#1A2323] p-6 rounded-[28px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Resume {activeSession.type}</h3>
                <p className="text-sm opacity-60">Question {activeSession.currentIdx + 1} • {activeSession.chapter || 'All Domains'}</p>
              </div>
            </div>
            <button 
              onClick={() => onStartSession(activeSession.type === 'Practice' ? AppRoute.PRACTICE : AppRoute.MOCK, activeSession.chapter, activeSession.type)}
              className="bg-primary text-white p-3 rounded-2xl hover:scale-105 transition-transform shadow-md"
            >
              <ArrowRight />
            </button>
          </div>
        </section>
      )}

      {/* Question Bank Selection */}
      <section>
        <div className="flex items-center gap-3 mb-6 px-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Select Question Bank</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.length > 0 ? chapters.map((chapter) => (
            <div 
              key={chapter.name}
              className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-black/5 dark:border-white/5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="mb-6">
                <span className="text-[10px] font-bold text-primary dark:text-primary-container bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {chapter.count} Questions
                </span>
                <h4 className="text-lg font-bold mt-2 leading-snug group-hover:text-primary transition-colors">{chapter.name}</h4>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onStartSession(AppRoute.PRACTICE, chapter.name, 'Practice')}
                  className="flex-1 py-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-container rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-all"
                >
                  <BookOpen className="w-3 h-3" /> Practice
                </button>
                <button 
                  onClick={() => onStartSession(AppRoute.MOCK, chapter.name, 'Mock')}
                  className="flex-1 py-2.5 bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-container rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-secondary hover:text-white transition-all"
                >
                  <ShieldCheck className="w-3 h-3" /> Mock
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 bg-white/50 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-[32px] text-center">
              <p className="opacity-40 italic">No question banks imported yet.</p>
              <button 
                onClick={() => onStartSession(AppRoute.VAULT)}
                className="text-primary font-bold text-sm mt-2 underline"
              >
                Go to Data Vault
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Recent History */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            <h3 className="text-xl font-bold">Recent Attempts</h3>
          </div>
          <button 
            onClick={() => onStartSession(AppRoute.ANALYTICS)}
            className="text-primary dark:text-primary-container text-sm font-medium"
          >
            Full Report
          </button>
        </div>
        
        <div className="space-y-3">
          {recentAttempts.map((attempt) => (
            <div 
              key={attempt.id}
              className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                  (attempt.score/attempt.total) >= 0.7 ? 'bg-green-100 text-green-700' : 
                  (attempt.score/attempt.total) >= 0.4 ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'
                }`}>
                  {Math.round((attempt.score/attempt.total) * 100)}%
                </div>
                <div>
                  <h4 className="font-medium text-sm truncate max-w-[150px] sm:max-w-none">{attempt.chapter || 'Mixed Session'}</h4>
                  <p className="text-[10px] opacity-50 font-medium uppercase tracking-wider">{attempt.mode} • {new Date(attempt.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{attempt.score}/{attempt.total}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
