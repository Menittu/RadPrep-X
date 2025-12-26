
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Question } from '../types';
import { Search as SearchIcon, Book, CheckCircle, Info } from 'lucide-react';

const SearchManager: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      const all = await db.questions
        .filter(q => 
          q.text.toLowerCase().includes(query.toLowerCase()) || 
          q.chapter.toLowerCase().includes(query.toLowerCase())
        )
        .toArray();
      setResults(all);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-50" />
        <input 
          type="text"
          placeholder="Search by topic, keyword, or chapter..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-white/5 border border-primary/20 dark:border-white/10 p-5 pl-14 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-lg"
        />
        {isSearching && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {results.length > 0 ? results.map((q) => (
          <div key={q.id} className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-black/5 dark:border-white/5 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {q.chapter}
              </span>
            </div>
            <h4 className="text-lg font-medium leading-relaxed mb-4">{q.text}</h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 px-4 py-2 rounded-2xl text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Correct Answer: {q.options[q.correctIndex]}</span>
              </div>
            </div>
            {q.explanation && (
               <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex gap-3 text-xs opacity-60">
                  <Info className="w-4 h-4 shrink-0 text-primary" />
                  <p>{q.explanation}</p>
               </div>
            )}
          </div>
        )) : query.trim() && !isSearching ? (
          <div className="text-center py-20 opacity-30 italic">
            No matches found for "{query}"
          </div>
        ) : !query.trim() && (
          <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
            <Book className="w-20 h-20 mb-4" />
            <p className="max-w-xs">Start typing to explore the deep radiotherapy question bank.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchManager;
