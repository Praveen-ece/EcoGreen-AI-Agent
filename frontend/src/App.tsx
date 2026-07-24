import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf, Sparkles, AlertCircle, Send, Compass,
  MessageCircle, Plus, Clock, Upload,
  Leaf as LeafIcon, Trash2, Moon, Sun, Download, Menu, X, User, LogOut
} from 'lucide-react';
import html2canvas from 'html2canvas';

import ProductAnalysisCard from './components/ProductAnalysisCard';
import AlternativesGrid from './components/AlternativesGrid';
import ComparisonTable from './components/ComparisonTable';
import BestChoiceBanner from './components/BestChoiceBanner';
import GreenTipsList from './components/GreenTipsList';
import LoadingState from './components/LoadingState';

import LoginPage from './pages/LoginPage';

import { useTheme } from './contexts/ThemeContext';
import { useToast } from './contexts/ToastContext';

import {
  analyzeProduct,
  chatWithEco,
  analyzeProductImage,
  fetchHistory,
  deleteHistoryItem,
  clearAllHistory,
  clearToken
} from './api/client';

import { ProductAnalysis } from './types/product';

// ── Detect question vs product description ────────────────────────────────────
function isQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  const starters = [
    'what', 'which', 'how', 'why', 'when', 'where', 'who', 'is', 'are',
    'can', 'could', 'should', 'do', 'does', 'will', 'would', 'tell me',
    'explain', 'describe', 'give me', 'list', 'i need to know', 'i want to know',
  ];
  if (t.endsWith('?')) return true;
  return starters.some(w => t.startsWith(w));
}

// ── Format Date/Time for History ──────────────────────────────────────────────
function formatTimeLabel(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) {
    return 'some time ago';
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: 'user' | 'analysis' | 'answer' | 'error';
  content: string;
  analysis?: ProductAnalysis;
}

interface Session {
  id: string;
  title: string;
  timeLabel: string;
  messages: Message[];
}

// ── App ───────────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const { setTheme, isDark } = useTheme();
  const { addToast } = useToast();

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('ecopick_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('ecopick_is_guest') === 'true';
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'structured'>('simple');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Structured form
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCountry, setProdCountry] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];
  const isEmpty = messages.length === 0 && !isLoading;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Sync Guest History to LocalStorage ─────────────────────────────────────
  useEffect(() => {
    if (isGuest) {
      if (sessions.length > 0) {
        localStorage.setItem('ecopick_guest_history', JSON.stringify(sessions));
      } else {
        localStorage.removeItem('ecopick_guest_history');
      }
    }
  }, [sessions, isGuest]);

  // ── DB History loader on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!user && !isGuest) return; // Wait until logged in or guest

    async function loadHistory() {
      if (isGuest) {
        try {
          const cached = localStorage.getItem('ecopick_guest_history');
          if (cached) {
            setSessions(JSON.parse(cached));
          }
        } catch (e) {
          console.error('Failed to load guest history:', e);
        }
        return;
      }

      try {
        const historyData = await fetchHistory();
        const mappedSessions: Session[] = historyData.map((doc: any) => {
          const title = doc.productName || doc.productDescription.slice(0, 30);
          return {
            id: doc._id,
            title: title.length > 30 ? title.slice(0, 30) + '…' : title,
            timeLabel: formatTimeLabel(doc.createdAt),
            messages: [
              {
                id: `user-${doc._id}`,
                type: 'user',
                content: doc.productDescription,
              },
              {
                id: `analysis-${doc._id}`,
                type: 'analysis',
                content: '',
                analysis: doc.rawAnalysis,
              },
            ],
          };
        });
        setSessions(mappedSessions);
      } catch (err: any) {
        console.error('Failed to load history from database:', err);
        addToast('error', 'Could not load your history. Please check your connection.');
      }
    }
    loadHistory();
  }, [user, isGuest, addToast]);

  // ── Handle Logout ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('ecopick_is_guest');
    localStorage.removeItem('ecopick_guest_history');
    setUser(null);
    setIsGuest(false);
    setSessions([]);
    setActiveSessionId(null);
    addToast('info', 'Logged out successfully.');
  };

  // ── Handle Deleting a Session from DB and state ─────────────────────────────
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      if (!isGuest) {
        await deleteHistoryItem(sessionId);
      }
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
      addToast('success', 'Analysis deleted successfully.');
    } catch (err: any) {
      addToast('error', `Failed to delete session: ${err.message || err}`);
    }
  };

  // ── Handle Clearing All History from DB and state ───────────────────────────
  const handleClearAllHistory = async () => {
    try {
      if (!isGuest) {
        await clearAllHistory();
      }
      setSessions([]);
      setActiveSessionId(null);
      addToast('success', 'All history cleared.');
    } catch (err: any) {
      addToast('error', `Failed to clear history: ${err.message || err}`);
    }
  };

  // ── Session helpers ───────────────────────────────────────────────────────
  const createNewSession = () => {
    const id = `session-${Date.now()}`;
    const session: Session = { id, title: 'New Chat', timeLabel: 'just now', messages: [] };
    setSessions(prev => [session, ...prev]);
    setActiveSessionId(id);
    setInputValue('');
    clearStructuredForm();
    setImageFile(null);
    if (window.innerWidth < 1024) setMobileMenuOpen(false);
    return id;
  };

  const updateSession = (sessionId: string, msgs: Message[], firstUserMsg: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, messages: msgs, title: firstUserMsg.slice(0, 40) + (firstUserMsg.length > 40 ? '…' : '') }
        : s
    ));
  };

  const buildStructuredDescription = () => {
    if (!prodName.trim() || !prodCategory.trim()) return null;
    return `Analyze this product:\n- Product Name: ${prodName.trim()}\n- Category: ${prodCategory.trim()}${prodMaterial.trim() ? `\n- Material: ${prodMaterial.trim()}` : ''}${prodBrand.trim() ? `\n- Brand: ${prodBrand.trim()}` : ''}${prodCountry.trim() ? `\n- Country of Manufacture: ${prodCountry.trim()}` : ''}`;
  };

  const clearStructuredForm = () => {
    setProdName(''); setProdCategory(''); setProdMaterial('');
    setProdBrand(''); setProdCountry('');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();

    let rawText = '';
    let displayText = '';

    if (activeTab === 'structured' && !overrideText) {
      const built = buildStructuredDescription();
      if (!built) return;
      rawText = built;
      displayText = `${prodName} (${prodCategory})${prodBrand ? ` by ${prodBrand}` : ''}`;
      clearStructuredForm();
    } else {
      const text = overrideText ?? inputValue;
      if (!text.trim() && !imageFile) return;

      if (imageFile && !text.trim()) {
        rawText = `image-upload`;
        displayText = `📷 ${imageFile.name}`;
      } else if (imageFile && text.trim()) {
        rawText = `image-upload`;
        displayText = `📷 ${imageFile.name}${text.trim() ? ` — ${text.trim()}` : ''}`;
      } else {
        rawText = text.trim();
        displayText = rawText.length > 100 ? rawText.slice(0, 100) + '…' : rawText;
      }
      setInputValue('');
      setImageFile(null);
    }

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    const userMsg: Message = { id: userMsgId, type: 'user', content: displayText };
    const currentMsgs = [...(sessions.find(s => s.id === sessionId)?.messages ?? []), userMsg];

    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, messages: currentMsgs, title: displayText.slice(0, 40) }
        : s
    ));
    setActiveSessionId(sessionId);
    setIsLoading(true);

    const treatAsQuestion = activeTab === 'simple' && isQuestion(rawText) && !imageFile && !overrideText?.startsWith('Analyze');

    try {
      let aiMsg: Message;
      let finalSessionId = sessionId;

      if (imageFile) {
        const capturedFile = imageFile;
        setImageFile(null);
        const result = await analyzeProductImage(capturedFile, inputValue.trim());
        aiMsg = { id: aiMsgId, type: 'analysis', content: '', analysis: result };
        if (result._id) finalSessionId = result._id;
      } else if (treatAsQuestion) {
        const answer = await chatWithEco(rawText);
        aiMsg = { id: aiMsgId, type: 'answer', content: answer };
      } else {
        const result = await analyzeProduct(rawText);
        aiMsg = { id: aiMsgId, type: 'analysis', content: '', analysis: result };
        if (result._id) finalSessionId = result._id;
      }
      const updatedMsgs = [...currentMsgs, aiMsg];
      
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const finalTitle = aiMsg.analysis?.productAnalysis.product || displayText;
          return {
            ...s,
            id: finalSessionId,
            messages: updatedMsgs,
            title: finalTitle.length > 30 ? finalTitle.slice(0, 30) + '…' : finalTitle
          };
        }
        return s;
      }));
      setActiveSessionId(finalSessionId);
    } catch (err: any) {
      const errMsg: Message = { id: aiMsgId, type: 'error', content: err.message || 'Something went wrong. Please try again.' };
      updateSession(sessionId, [...currentMsgs, errMsg], displayText);
      addToast('error', 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
    e.target.value = '';
  };

  const handleExport = async (messageId: string) => {
    const element = document.getElementById(`analysis-${messageId}`);
    if (!element) return;
    
    addToast('info', 'Preparing export...');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0f172a' : '#f6fcf8'
      });
      
      const link = document.createElement('a');
      link.download = `EcoPick-Analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      addToast('success', 'Export successful!');
    } catch (error) {
      addToast('error', 'Failed to export image.');
    }
  };



  const visibleSessions = showAllHistory ? sessions : sessions.slice(0, 5);

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen">
        <LoginPage onLogin={setUser} onGuest={() => setIsGuest(true)} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      
      {/* ── MOBILE HEADER ──────────────────────────────────────────────────── */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
            <LeafIcon className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100">EcoPick</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 bg-white dark:bg-slate-900 border-r border-emerald-100 dark:border-emerald-900/50 flex flex-col py-4 px-3 gap-3 shadow-2xl lg:shadow-none`}>
        
        {/* Mobile close button */}
        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-500">
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 px-1 mb-2 mt-2 lg:mt-0 cursor-pointer select-none" onClick={() => { setActiveSessionId(null); if(window.innerWidth<1024) setMobileMenuOpen(false); }}>
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm shadow-emerald-600/30">
            <LeafIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Eco<span className="text-emerald-600">Pick</span>
            </span>
            <p className="text-[9px] font-bold text-emerald-600 tracking-widest uppercase leading-none mt-0.5">
              AI Sustainability Agent
            </p>
          </div>
        </div>

        {/* New Chat */}
        <button
          onClick={createNewSession}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </button>

        {/* Recent history */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0 mt-2 pr-1 custom-scrollbar">
          {sessions.length > 0 && (
            <div className="flex items-center justify-between px-2 pt-2 pb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Recent Activity
              </span>
              <button
                onClick={handleClearAllHistory}
                className="text-[9px] font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-all"
              >
                Clear all
              </button>
            </div>
          )}
          
          <div className="space-y-1">
            {visibleSessions.map(session => (
              <div
                key={session.id}
                onClick={() => { setActiveSessionId(session.id); if(window.innerWidth<1024) setMobileMenuOpen(false); }}
                className={`group w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-start gap-2.5 cursor-pointer border ${
                  activeSessionId === session.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Compass className={`w-4 h-4 flex-shrink-0 mt-0.5 ${activeSessionId === session.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{session.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{session.timeLabel}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className={`opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded transition-all flex-shrink-0 ${activeSessionId === session.id ? 'opacity-100' : ''}`}
                  title="Delete this analysis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {sessions.length > 5 && (
            <button
              onClick={() => setShowAllHistory(v => !v)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-dashed border-slate-200 dark:border-slate-700"
            >
              <Clock className="w-3.5 h-3.5" />
              {showAllHistory ? 'Show less' : 'View all history'}
            </button>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          {/* User Profile */}
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-full text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user ? user.name : 'Guest User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user ? user.email : 'Not logged in'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex-shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900 relative">
        
        {/* Background Mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none" />

        {/* Scrollable conversation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-14 lg:pt-0" ref={chatContainerRef}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">

            {/* Welcome hero */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-fade-in-up">
                <div className="bg-emerald-500 p-5 rounded-3xl text-white shadow-md transform hover:scale-105 transition-transform">
                  <Leaf className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                    Ask me anything about <span className="text-emerald-600">sustainability</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
                    Type a question about eco-friendly products, carbon footprint, sustainable materials, or describe a product to get a full environmental analysis.
                  </p>
                </div>
              </div>
            )}

            {/* Message thread */}
            {messages.map((msg, idx) => (
              <div key={msg.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>

                {/* User bubble */}
                {msg.type === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] md:max-w-[75%] bg-emerald-600 text-white px-5 py-3.5 rounded-3xl rounded-tr-sm shadow-md text-sm md:text-base font-medium leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Error */}
                {msg.type === 'error' && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 border-l-4 border-l-rose-500 p-4 rounded-2xl rounded-tl-sm flex items-start gap-3 shadow-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-rose-800 dark:text-rose-300">Analysis Failed</p>
                        <p className="text-sm text-rose-700 dark:text-rose-400 mt-1 leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eco answer (Chat) */}
                {msg.type === 'answer' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg text-white shadow-sm">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">EcoPick Agent</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800/30 rounded-3xl rounded-tl-sm p-6 shadow-sm shadow-emerald-900/5 space-y-3">
                      {msg.content.split('\n').map((line, i) => {
                        const t = line.trim();
                        if (!t) return <div key={i} className="h-2" />;
                        if (t.startsWith('- ') || t.startsWith('• ') || t.startsWith('* ')) {
                          return (
                            <div key={i} className="flex items-start gap-3 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                              <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                              <span>{t.replace(/^[-•*]\s+/, '')}</span>
                            </div>
                          );
                        }
                        if (/^\*\*(.+)\*\*$/.test(t)) {
                          return <p key={i} className="text-base font-bold text-slate-800 dark:text-slate-100">{t.replace(/\*\*/g, '')}</p>;
                        }
                        return <p key={i} className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{t}</p>;
                      })}
                    </div>
                  </div>
                )}

                {/* Product analysis */}
                {msg.type === 'analysis' && msg.analysis && (
                  <div className="space-y-6" id={`analysis-${msg.id}`}>
                    <div className="flex items-center justify-between ml-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg text-white shadow-sm">
                          <Leaf className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Sustainability Report</span>
                      </div>
                      
                      {/* Export Button */}
                      <button 
                        onClick={() => handleExport(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Image
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
                      <div className="xl:col-span-2">
                        <ProductAnalysisCard analysis={msg.analysis.productAnalysis} />
                      </div>
                      <div className="xl:col-span-3">
                        <BestChoiceBanner
                          productName={msg.analysis.bestChoice.productName}
                          explanation={msg.analysis.bestChoice.explanation}
                        />
                      </div>
                    </div>

                    <AlternativesGrid
                      alternatives={msg.analysis.alternatives}
                      bestChoiceName={msg.analysis.bestChoice.productName}
                    />

                    <ComparisonTable
                      productAnalysis={msg.analysis.productAnalysis}
                      alternatives={msg.analysis.alternatives}
                      bestChoiceName={msg.analysis.bestChoice.productName}
                    />

                    <GreenTipsList aiTips={msg.analysis.greenShoppingTips} />

                    {msg.analysis.dataDisclaimer && (
                      <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start gap-3">
                        <Compass className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          <strong className="text-slate-700 dark:text-slate-300">Data Notice:</strong> {msg.analysis.dataDisclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 ml-1">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg text-white shadow-sm">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider animate-pulse">
                    EcoPick is analyzing...
                  </span>
                </div>
                <LoadingState />
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* ── Fixed input bar ──────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-emerald-100/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-4 shadow-[0_-10px_40px_-10px_rgba(16,185,129,0.1)]">
          <div className="max-w-4xl mx-auto space-y-3">

            {/* Tab row + Image Upload */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('simple')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'simple'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  Ask / Describe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('structured')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'structured'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  Product Form
                </button>
              </div>

              {/* Image Upload button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  imageFile
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {imageFile ? `📷 ${imageFile.name.slice(0, 15)}…` : 'Upload Image'}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Input area */}
            {activeTab === 'simple' ? (
              <form onSubmit={handleSubmit} className="flex gap-2 items-end relative">
                <div className="flex-1 relative">
                  {imageFile && (
                    <div className="absolute left-3 top-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-1 rounded-md flex items-center gap-1 font-semibold border border-emerald-200 dark:border-emerald-800">
                      <span>Image attached</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); setImageFile(null); }} className="hover:text-rose-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask an eco question or describe a product... (Enter to send)"
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-emerald-500 bg-white/50 dark:bg-slate-800/50 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm md:text-base leading-relaxed shadow-inner-sm max-h-[120px] custom-scrollbar"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <kbd className="hidden md:inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded text-[10px] font-bold tracking-widest uppercase border border-slate-200 dark:border-slate-600">
                      Enter ↵
                    </kbd>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !imageFile) || isLoading}
                  className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 ${
                    (inputValue.trim() || imageFile) && !isLoading
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white cursor-pointer shadow-emerald-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="Product name *" value={prodName}
                    onChange={(e) => setProdName(e.target.value)} disabled={isLoading} required
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-500 bg-white dark:bg-slate-900 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors" />
                  <input type="text" placeholder="Category *" value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)} disabled={isLoading} required
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-500 bg-white dark:bg-slate-900 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors" />
                  <input type="text" placeholder="Material (optional)" value={prodMaterial}
                    onChange={(e) => setProdMaterial(e.target.value)} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-500 bg-white dark:bg-slate-900 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors" />
                  <input type="text" placeholder="Brand (optional)" value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-500 bg-white dark:bg-slate-900 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors" />
                  <input type="text" placeholder="Country (optional)" value={prodCountry}
                    onChange={(e) => setProdCountry(e.target.value)} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-emerald-500 bg-white dark:bg-slate-900 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors md:col-span-2" />
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit"
                    disabled={!prodName.trim() || !prodCategory.trim() || isLoading}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all w-full md:w-auto ${
                      prodName.trim() && prodCategory.trim() && !isLoading
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                    }`}>
                    <Sparkles className="w-4 h-4" />
                    Analyze Sustainability
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
