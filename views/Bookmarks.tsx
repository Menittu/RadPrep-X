
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Question, AppRoute } from '../types';
import { Bookmark as BookmarkIcon, Play, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksProps {
  onStartPractice: (route: AppRoute, chapter?: string, mode?: 'Practice' | 'Mock') => void;
}

const Bookmarks: React.FC<BookmarksProps> = ({ onStartPractice }) => {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const list = await db.bookmarks.toArray();
    const ids = list.map(b => b.questionId);
    const questions = await db.questions.bulkGet(ids);
    setBookmarkedQuestions(questions.filter(Boolean) as Question[]);
  };

  const removeBookmark = async (id: number) => {
    await db.bookmarks.delete(id);
    loadBookmarks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Flags & Bookmarks</h2>
          <p className="text-sm opacity-50">{bookmarkedQuestions.length} saved for review</p>
        </div>
        {bookmarkedQuestions.length > 0 && (
           <button 
             onClick={() => onStartPractice(AppRoute.PRACTICE, undefined, 'Practice')}
             className="bg-primary text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold hover:shadow-lg transition-all"
           >
             <Play className="w-4 h-4" />
             Practice Flags
           </button>
        )}
      </div>

      <div className="space-y-4">
        {bookmarkedQuestions.length > 0 ? bookmarkedQuestions.map((q) => (
          <div key={q.id} className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-black/5 dark:border-white/5 group hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                 <span className="text-[10px] font-bold text-primary dark:text-primary-container bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                    {q.chapter}
                 </span>
                 <p className="font-medium mb-4 leading-relaxed">{q.text}</p>
                 <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{q.options[q.correctIndex]}</span>
                 </div>
              </div>
              <button 
                onClick={() => removeBookmark(q.id!)}
                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 flex flex-col items-center opacity-20">
             <BookmarkIcon className="w-16 h-16 mb-4" />
             <p className="font-bold">No bookmarks yet</p>
             <p className="text-sm">Flag questions during practice to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal subcomponent helper
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default Bookmarks;
