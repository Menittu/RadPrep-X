
import React, { useEffect, useState } from 'react';
import { db } from '../db';
import { Attempt } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target, Activity, Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ mastery: 0, total: 0 });

  useEffect(() => {
    const processData = async () => {
      const attempts = await db.attempts.toArray();
      const chapterStats: { [key: string]: { correct: number, total: number } } = {};

      attempts.forEach(a => {
        const key = a.chapter || 'Mixed';
        if (!chapterStats[key]) chapterStats[key] = { correct: 0, total: 0 };
        chapterStats[key].correct += a.score;
        chapterStats[key].total += a.total;
      });

      const data = Object.entries(chapterStats).map(([name, stats]) => ({
        name,
        accuracy: Math.round((stats.correct / stats.total) * 100)
      }));

      setChartData(data);
      setSummary({
        mastery: data.filter(d => d.accuracy >= 70).length,
        total: data.length
      });
    };

    processData();
  }, []);

  const getBarColor = (accuracy: number) => {
    if (accuracy >= 70) return '#22C55E'; // Green
    if (accuracy >= 40) return '#00696B'; // Teal
    return '#EF4444'; // Red
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-black/5 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
             <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{summary.mastery}/{summary.total}</p>
            <p className="text-xs opacity-50 uppercase font-bold tracking-tighter">Chapters Mastered</p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-black/5 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-container/30 text-primary rounded-2xl flex items-center justify-center">
             <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{chartData.length}</p>
            <p className="text-xs opacity-50 uppercase font-bold tracking-tighter">Active Domains</p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-black/5 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">Stable</p>
            <p className="text-xs opacity-50 uppercase font-bold tracking-tighter">Learning Curve</p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-white/5 p-8 rounded-[40px] border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Accuracy by Domain</h3>
        </div>
        
        <div className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, opacity: 0.6 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, opacity: 0.6 }} 
                  unit="%" 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="accuracy" radius={[20, 20, 20, 20]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center opacity-30 italic">
              No data available to generate charts.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <span className="text-xs opacity-60">Mastery (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00696B]" />
            <span className="text-xs opacity-60">Developing (40-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="text-xs opacity-60">Review Required (&lt;40%)</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
