import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Zap, 
  Send, 
  ClipboardList, 
  QrCode, 
  ArrowLeft,
  User,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  Calendar,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate 
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface EmotionLog {
  id: number;
  employee_number: string;
  emotion: string;
  comment: string;
  timestamp: string;
}

const EMOTIONS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'excited', label: 'Excited', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'loved', label: 'Loved', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'angry', label: 'Angry', icon: Frown, color: 'text-red-600', bg: 'bg-red-50' },
];

// --- Components ---

const UserView = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInvalidIdPopup, setShowInvalidIdPopup] = useState(false);

  const handleEmployeeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string (for backspacing)
    if (value === '') {
      setEmployeeNumber('');
      return;
    }
    
    // Check if it's a number
    if (!/^\d+$/.test(value)) {
      setShowInvalidIdPopup(true);
      setTimeout(() => setShowInvalidIdPopup(false), 2000);
      return;
    }
    
    setEmployeeNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber || !selectedEmotion || !comment.trim()) {
      setErrorMessage('Please fill in your employee number, select an emotion, and provide a comment.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/submit-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeNumber, emotion: selectedEmotion, comment }),
      });

      if (response.ok) {
        setStatus('success');
        setEmployeeNumber('');
        setSelectedEmotion(null);
        setComment('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 relative">
      {/* Invalid ID Popup */}
      <AnimatePresence>
        {showInvalidIdPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <AlertCircle className="w-5 h-5" />
            Invalid Employee ID
          </motion.div>
        )}
      </AnimatePresence>

      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Sentiment Analysis</h1>
        <p className="text-zinc-500">Share your emotional status with the team.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Employee Number */}
        <div className="space-y-2">
          <label htmlFor="employeeNumber" className="text-sm font-medium text-zinc-700 block">
            Employee Number
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              id="employeeNumber"
              type="text"
              required
              placeholder="e.g. 123456"
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={employeeNumber}
              onChange={handleEmployeeNumberChange}
            />
          </div>
        </div>

        {/* Emotion Grid */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 block">Select Emotion</label>
          <div className="grid grid-cols-5 gap-2">
            {EMOTIONS.map((emotion) => {
              const Icon = emotion.icon;
              const isSelected = selectedEmotion === emotion.id;
              return (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => setSelectedEmotion(emotion.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 border-2",
                    isSelected 
                      ? cn("border-emerald-500", emotion.bg) 
                      : "border-transparent bg-zinc-50 hover:bg-zinc-100"
                  )}
                >
                  <Icon className={cn("w-8 h-8 mb-1", isSelected ? emotion.color : "text-zinc-400")} />
                  <span className={cn("text-[10px] font-medium uppercase tracking-wider", isSelected ? "text-emerald-700" : "text-zinc-500")}>
                    {emotion.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium text-zinc-700 block">
            Comment (Required)
          </label>
          <textarea
            id="comment"
            rows={3}
            required
            placeholder="Please share why you're feeling this way..."
            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2",
            status === 'submitting' ? "bg-zinc-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
          )}
        >
          {status === 'submitting' ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Status
            </>
          )}
        </button>

        {/* Feedback Messages */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700"
            >
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">Status submitted successfully!</p>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <footer className="pt-8 flex justify-center gap-4">
        <Link to="/qr" className="text-xs font-medium text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors">
          <QrCode className="w-3 h-3" />
          Show QR Code
        </Link>
        <Link to="/admin" className="text-xs font-medium text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors">
          <ClipboardList className="w-3 h-3" />
          Admin View
        </Link>
      </footer>
    </div>
  );
};

const AdminView = () => {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; logId: number | null }>({
    isOpen: false,
    logId: null
  });

  // Expiration State
  const [expirations, setExpirations] = useState<Record<string, string>>({});

  const fetchLogs = async () => {
    try {
      const [logsRes, expRes] = await Promise.all([
        fetch('/api/admin/logs'),
        fetch('/api/admin/expirations')
      ]);
      const logsData = await logsRes.json();
      const expData = await expRes.json();
      
      setLogs(logsData);
      
      const expMap: Record<string, string> = {};
      expData.forEach((item: { date_str: string; expires_at: string }) => {
        expMap[item.date_str] = item.expires_at;
      });
      setExpirations(expMap);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  const confirmDelete = (id: number) => {
    setDeleteModal({ isOpen: true, logId: id });
  };

  const handleDelete = async () => {
    if (!deleteModal.logId) return;
    
    try {
      const res = await fetch(`/api/admin/logs/${deleteModal.logId}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs(logs.filter(log => log.id !== deleteModal.logId));
        setDeleteModal({ isOpen: false, logId: null });
      }
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const handleSetExpiration = async (dateStr: string, expiresAt: string) => {
    try {
      const res = await fetch('/api/admin/set-expiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr, expiresAt }),
      });
      if (res.ok) {
        setExpirations(prev => ({ ...prev, [dateStr]: expiresAt }));
      }
    } catch (err) {
      console.error('Failed to set expiration:', err);
    }
  };

  const toggleComment = (id: number) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDate = (date: string) => {
    const isNowExpanded = !expandedDates[date];
    setExpandedDates(prev => ({ ...prev, [date]: isNowExpanded }));
    
    if (isNowExpanded) {
      setActiveDate(date);
    } else if (activeDate === date) {
      setActiveDate(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin062802') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 min-h-[80vh] flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-zinc-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Login</h1>
          <p className="text-zinc-500">Enter password to view employee data</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && <p className="text-xs text-rose-500 font-medium">{loginError}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-all"
          >
            Login
          </button>
        </form>
        
        <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-600 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </Link>
      </div>
    );
  }

  // Group logs by date
  const groupedLogs = logs.reduce((groups: Record<string, EmotionLog[]>, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, EmotionLog[]>);

  // Calculate stats for charts based on activeDate
  const statsLogs = activeDate ? (groupedLogs[activeDate] || []) : logs;
  const totalLogs = statsLogs.length;
  const emotionStats = EMOTIONS.map(emotion => {
    const count = statsLogs.filter(log => log.emotion === emotion.id).length;
    const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
    return { ...emotion, count, percentage };
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, logId: null })}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">Confirm Delete</h3>
                <p className="text-zinc-500 text-sm">Are you sure you want to delete this employee log? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, logId: null })}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Sentiment Analysis Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {activeDate ? `Viewing data for ${activeDate}` : 'Viewing overall employee emotional status'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {emotionFilter && (
            <button 
              onClick={() => setEmotionFilter(null)}
              className="text-xs font-medium px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors"
            >
              Clear Filter: {EMOTIONS.find(e => e.id === emotionFilter)?.label}
            </button>
          )}
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-sm font-medium text-zinc-400 hover:text-zinc-600"
          >
            Logout
          </button>
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </header>

      {/* Stats Section with Donut Charts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {emotionStats.map((stat) => {
          const Icon = stat.icon;
          const data = [
            { name: 'Count', value: stat.count },
            { name: 'Remaining', value: Math.max(0, totalLogs - stat.count) }
          ];
          const colorName = stat.color.split('-')[1];
          const hexColor = {
            emerald: '#10b981',
            amber: '#f59e0b',
            blue: '#3b82f6',
            purple: '#a855f7',
            rose: '#f43f5e',
            red: '#dc2626'
          }[colorName] || '#10b981';

          const isActiveFilter = emotionFilter === stat.id;

          return (
            <button 
              key={stat.id} 
              onClick={() => setEmotionFilter(emotionFilter === stat.id ? null : stat.id)}
              className={cn(
                "bg-white border rounded-2xl p-4 flex flex-col items-center space-y-2 shadow-sm transition-all duration-200",
                isActiveFilter ? "border-zinc-900 ring-2 ring-zinc-900/5 scale-[1.02]" : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <div className="w-full h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      innerRadius={30}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={hexColor} />
                      <Cell fill="#f4f4f5" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-zinc-900">{stat.percentage}%</p>
                <p className="text-[10px] text-zinc-400">{stat.count} responses</p>
              </div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-400 rounded-full animate-spin mb-4" />
          <span>Loading logs...</span>
        </div>
      ) : Object.keys(groupedLogs).length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl text-zinc-400">
          No logs found yet.
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedLogs) as [string, EmotionLog[]][]).map(([date, dateLogs]) => {
            const isExpanded = expandedDates[date];
            const filteredDateLogs = emotionFilter 
              ? dateLogs.filter(log => log.emotion === emotionFilter)
              : dateLogs;

            if (emotionFilter && filteredDateLogs.length === 0) return null;

            const dateKey = new Date(dateLogs[0].timestamp).toISOString().split('T')[0];
            const expiration = expirations[dateKey];
            const isExpiredSoon = expiration && new Date(expiration).getTime() - new Date().getTime() < 3600000;

            return (
              <div key={date} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button 
                    onClick={() => toggleDate(date)}
                    className={cn(
                      "flex-1 flex items-center justify-between p-4 rounded-2xl transition-all border",
                      activeDate === date ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", activeDate === date ? "bg-emerald-400" : "bg-emerald-500")} />
                      <h2 className="text-lg font-semibold">{date}</h2>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", activeDate === date ? "bg-white/10" : "bg-zinc-100")}>
                        {dateLogs.length} entries
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  {/* Expiration Picker */}
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl p-2 px-4 shadow-sm">
                    <Clock className={cn("w-4 h-4", expiration ? "text-amber-500" : "text-zinc-400")} />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Expiration</span>
                      <input 
                        type="datetime-local"
                        className="text-xs font-medium outline-none bg-transparent"
                        value={expiration ? expiration.slice(0, 16) : ''}
                        onChange={(e) => handleSetExpiration(dateKey, e.target.value)}
                      />
                    </div>
                    {expiration && (
                      <button 
                        onClick={() => handleSetExpiration(dateKey, '')}
                        className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400"
                        title="Clear expiration"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Emotion</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Comment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {filteredDateLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-400 italic">
                                    No entries matching the selected emotion filter.
                                  </td>
                                </tr>
                              ) : (
                                filteredDateLogs.map((log) => {
                                  const emotionInfo = EMOTIONS.find(e => e.id === log.emotion);
                                  const Icon = emotionInfo?.icon || Meh;
                                  const isCommentExpanded = expandedComments[log.id];
                                  return (
                                    <React.Fragment key={log.id}>
                                      <tr className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                              <User className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <span className="font-medium text-zinc-900">{log.employee_number}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4">
                                          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", emotionInfo?.bg, emotionInfo?.color)}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {emotionInfo?.label || log.emotion}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4">
                                          <button 
                                            onClick={() => toggleComment(log.id)}
                                            className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                                          >
                                            {isCommentExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            {isCommentExpanded ? 'Hide Comment' : 'View Comment'}
                                          </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                          <button 
                                            onClick={() => confirmDelete(log.id)}
                                            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                                            title="Delete log"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                      {isCommentExpanded && (
                                        <tr className="bg-zinc-50/30">
                                          <td colSpan={5} className="px-6 py-4">
                                            <div className="p-4 bg-white border border-zinc-100 rounded-xl text-sm text-zinc-600 shadow-inner">
                                              <p className="font-medium text-zinc-400 text-[10px] uppercase tracking-wider mb-2">Employee Comment:</p>
                                              {log.comment}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const QRCodeView = () => {
  const appUrl = window.location.origin;

  return (
    <div className="max-w-md mx-auto p-6 min-h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">Scan to Access</h1>
        <p className="text-zinc-500">Scan this QR code with your phone to log your emotion status.</p>
      </div>
      
      <div className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-xl">
        <QRCodeSVG 
          value={appUrl} 
          size={256}
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="text-center space-y-4">
        <div className="px-4 py-2 bg-zinc-100 rounded-lg font-mono text-xs text-zinc-500 break-all">
          {appUrl}
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Routes>
          <Route path="/" element={<UserView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/qr" element={<QRCodeView />} />
        </Routes>
      </div>
    </Router>
  );
}
