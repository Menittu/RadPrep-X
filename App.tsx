
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  BarChart3, 
  Database, 
  Menu, 
  X, 
  ChevronRight,
  Bookmark as BookmarkIcon,
  Sun,
  Moon
} from 'lucide-react';
import { AppRoute } from './types';
import Dashboard from './views/Dashboard';
import SessionManager from './views/SessionManager';
import Vault from './views/Vault';
import Analytics from './views/Analytics';
import SearchManager from './views/SearchManager';
import Bookmarks from './views/Bookmarks';

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('theme') === 'dark' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<'Practice' | 'Mock'>('Practice');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navigate = (route: AppRoute, chapter?: string, mode?: 'Practice' | 'Mock') => {
    setActiveRoute(route);
    if (chapter !== undefined) setSelectedChapter(chapter || null);
    if (mode) setSessionMode(mode);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard onStartSession={navigate} />;
      case AppRoute.PRACTICE:
      case AppRoute.MOCK:
        return (
          <SessionManager 
            mode={sessionMode} 
            chapter={selectedChapter || undefined} 
            onExit={() => setActiveRoute(AppRoute.DASHBOARD)} 
          />
        );
      case AppRoute.VAULT:
        return <Vault />;
      case AppRoute.ANALYTICS:
        return <Analytics />;
      case AppRoute.SEARCH:
        return <SearchManager />;
      case AppRoute.BOOKMARKS:
        return <Bookmarks onStartPractice={navigate} />;
      default:
        return <Dashboard onStartSession={navigate} />;
    }
  };

  const navItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.SEARCH, label: 'Search', icon: Search },
    { id: AppRoute.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { id: AppRoute.BOOKMARKS, label: 'Bookmarks', icon: BookmarkIcon },
    { id: AppRoute.VAULT, label: 'Data Vault', icon: Database },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-primary dark:text-primary-container tracking-tight">
              RadPrep <span className="font-light">Pro</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-primary-container" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed left-0 top-0 h-full w-80 bg-[#F0F5F5] dark:bg-[#141C1C] z-[60] 
        transition-transform duration-500 ease-m3-fluid transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        rounded-r-3xl shadow-2xl flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <span className="text-xl font-bold text-primary dark:text-primary-container">Menu</span>
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">
          <p className="px-4 py-2 text-xs font-semibold text-secondary dark:text-secondary-container uppercase tracking-widest opacity-60">System</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-4 rounded-full transition-all
                ${activeRoute === item.id 
                  ? 'bg-primary-container text-primary dark:bg-primary dark:text-white font-medium' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-on-surface dark:text-on-surface-dark'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {activeRoute === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}

          <div className="my-6 border-t border-black/5 dark:border-white/5" />
          
          <p className="px-4 py-2 text-xs font-semibold text-secondary dark:text-secondary-container uppercase tracking-widest opacity-60">Study Modes</p>
          <button 
            onClick={() => navigate(AppRoute.PRACTICE, undefined, 'Practice')}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-on-surface dark:text-on-surface-dark"
          >
            <BookOpen className="w-5 h-5" />
            <span>Practice Session</span>
          </button>
          <button 
            onClick={() => navigate(AppRoute.MOCK, undefined, 'Mock')}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-on-surface dark:text-on-surface-dark"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Mock Examination</span>
          </button>
        </nav>

        <div className="p-6 text-center text-xs text-secondary opacity-50">
          v1.0.0 • Radiotherapy Prep
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
