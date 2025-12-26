
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Question } from '../types';
import { Download, Upload, Trash2, FileJson, CheckCircle, AlertTriangle } from 'lucide-react';

const Vault: React.FC = () => {
  const [qCount, setQCount] = useState(0);
  const [chapters, setChapters] = useState<{name: string, count: number}[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const total = await db.questions.count();
    setQCount(total);
    
    const all = await db.questions.toArray();
    const chapterMap: {[key: string]: number} = {};
    all.forEach(q => {
      chapterMap[q.chapter] = (chapterMap[q.chapter] || 0) + 1;
    });
    setChapters(Object.entries(chapterMap).map(([name, count]) => ({ name, count })));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const questions: Question[] = Array.isArray(data) ? data : [data];
        
        // Sanitize
        const validQuestions = questions.map(q => ({
          chapter: q.chapter || file.name.replace('.json', ''),
          text: q.text || 'Missing text',
          options: q.options || [],
          correctIndex: q.correctIndex ?? 0,
          explanation: q.explanation || ''
        }));

        await db.questions.bulkAdd(validQuestions);
        loadInfo();
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } catch (err) {
        alert('Invalid JSON format');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = async () => {
    const all = await db.questions.toArray();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radprep_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear the entire question bank? This cannot be undone.')) {
      await db.questions.clear();
      loadInfo();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-primary/5 dark:bg-white/5 rounded-[40px] border border-primary/10">
        <div>
          <h2 className="text-4xl font-black text-primary dark:text-primary-container mb-2">{qCount}</h2>
          <p className="opacity-60 font-medium">Total Questions in Bank</p>
        </div>
        <div className="flex gap-3">
           <label className="cursor-pointer bg-primary text-white px-6 py-4 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-all">
             <Upload className="w-5 h-5" />
             Import Bank
             <input type="file" className="hidden" accept=".json" onChange={handleImport} />
           </label>
           <button onClick={handleExport} className="px-6 py-4 border-2 border-primary/20 text-primary dark:text-primary-container rounded-full font-bold flex items-center gap-2 hover:bg-primary/5 transition-all">
             <Download className="w-5 h-5" />
             Export All
           </button>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-3xl flex items-center gap-3 animate-in fade-in zoom-in-95">
          <CheckCircle className="w-5 h-5" />
          Import Successful! Question bank updated.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h3 className="text-xl font-bold mb-4 px-4">Chapters Found</h3>
          <div className="space-y-3">
            {chapters.length > 0 ? chapters.map((c, idx) => (
              <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-3xl flex items-center justify-between border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-container/30 rounded-2xl flex items-center justify-center text-primary">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{c.name}</span>
                </div>
                <span className="text-sm font-bold opacity-40">{c.count} qns</span>
              </div>
            )) : (
              <div className="p-8 text-center bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-primary/20 opacity-40 italic">
                No chapters detected. Please import data.
              </div>
            )}
          </div>
        </section>

        <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[40px] border border-red-200 dark:border-red-900/30">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold mb-4">
            <AlertTriangle className="w-6 h-6" />
            <h3>Maintenance</h3>
          </div>
          <p className="text-sm opacity-70 mb-8 leading-relaxed">
            Clearing the database will permanently remove all questions, chapters, and custom data you have imported. Ensure you have an export backup before proceeding.
          </p>
          <button 
            onClick={handleClear}
            className="w-full bg-red-600 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Reset Data Vault
          </button>
        </section>
      </div>
    </div>
  );
};

export default Vault;
