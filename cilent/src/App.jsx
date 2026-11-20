import { useState, useEffect, useCallback } from 'react';


const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;


export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [activeTab, setActiveTab] = useState('feed');

  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [status, setStatus] = useState('lost');
  const [location, setLocation] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimResult, setClaimResult] = useState(null);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  const [notifications, setNotifications] = useState([]);

  const fetchItems = useCallback(async () => {
    let query = `${API_BASE}/items?`;
    if (categoryFilter) query += `category=${categoryFilter}&`;
    if (statusFilter) query += `status=${statusFilter}&`;
    if (searchTerm) query += `search=${searchTerm}&`;

    const res = await fetch(query);
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
  }, [categoryFilter, statusFilter, searchTerm]);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setNotifications(data);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const timeoutId = setTimeout(() => {
      fetchItems();
      fetchNotifications();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [token, fetchItems, fetchNotifications]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/auth/login' : '/auth/signup';
    const body = isLoginMode
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      alert(data.error);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.clear();
  };

  const handlePostItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title, description, category,
        status, location, secret_question: secretQuestion,
        secret_answer: secretAnswer
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setActiveTab('feed');
      fetchItems();
      setTitle(''); setDescription(''); setLocation('');
      setSecretQuestion(''); setSecretAnswer('');
    } else {
      alert(data.error);
    }
  };

  const handleClaimItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/items/${selectedItem.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ answer: claimAnswer })
    });
    const data = await res.json();
    setClaimResult(data);
    if (data.success) fetchItems();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-zinc-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="relative max-w-md w-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-slate-800 text-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white text-3xl mb-4 shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20">
              🎓
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Campus Lost & Found</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Smart matching & secure campus recovery network</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm font-medium placeholder-slate-600"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">College Email</label>
              <input
                type="email"
                placeholder="student@campus.edu"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm font-medium placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm font-medium placeholder-slate-600"
              />
            </div>
            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-[0.98] text-sm tracking-wide">
              {isLoginMode ? 'Sign In to Hub' : 'Create Student Account'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="w-full mt-6 text-xs text-slate-400 hover:text-indigo-400 font-semibold text-center transition"
          >
            {isLoginMode ? "Don't have an account? <span class='text-indigo-400 underline'>Sign up</span>" : 'Already registered? Sign in here'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Navigation Header */}
      <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20">
            C
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Campus Hub <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">v2.0</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Lost & Found Network</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Browse Feed
            </button>
            <button
              onClick={() => setActiveTab('post')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'post' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              + Report Item
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold relative transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Alerts
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          <div className="pl-3 border-l border-slate-800 flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{user.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Verified
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 px-3.5 py-2 rounded-xl border border-rose-500/20 transition-all shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Tab bar (Bottom or secondary row) */}
      <div className="md:hidden flex bg-slate-900 border-b border-slate-800 px-4 py-2 justify-around">
        <button onClick={() => setActiveTab('feed')} className={`text-xs font-bold py-1.5 px-3 rounded-lg ${activeTab === 'feed' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Feed</button>
        <button onClick={() => setActiveTab('post')} className={`text-xs font-bold py-1.5 px-3 rounded-lg ${activeTab === 'post' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Report</button>
        <button onClick={() => setActiveTab('notifications')} className={`text-xs font-bold py-1.5 px-3 rounded-lg relative ${activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
          Alerts {notifications.length > 0 && `(${notifications.length})`}
        </button>
      </div>

      <main className="max-w-5xl mx-auto mt-8 px-4">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-slate-800/80 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[240px]">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search item title, keyword, or place..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm text-slate-200 font-medium placeholder-slate-600"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-300 cursor-pointer flex-1 sm:flex-none hover:border-slate-700 transition"
                >
                  <option value="">All Statuses</option>
                  <option value="lost">🔴 Lost Items</option>
                  <option value="found">🟢 Found Items</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-300 cursor-pointer flex-1 sm:flex-none hover:border-slate-700 transition"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="ID Cards">ID Cards</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {items.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-800/80 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-[11px] px-3.5 py-1.5 rounded-full uppercase font-black tracking-wider border ${item.status === 'lost'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        {item.status === 'lost' ? '● Lost Item' : '● Found Item'}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-indigo-300 rounded-xl border border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-normal">{item.description}</p>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        📍 {item.location}
                      </span>
                      <span className="text-[11px]">
                        By <strong className="text-slate-300 font-semibold">{item.uploader_name}</strong>
                      </span>
                    </div>
                  </div>

                  {item.status === 'found' && (
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setClaimResult(null);
                        setClaimAnswer('');
                      }}
                      className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                    >
                      <span>🔒</span> Claim This Item Securely
                    </button>
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <div className="col-span-2 text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                  <span className="text-4xl mb-3 block opacity-60">📭</span>
                  <p className="text-slate-300 font-bold text-sm">No items found matching your filters.</p>
                  <p className="text-slate-500 text-xs mt-1">Try resetting your search parameters or report a new item.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <div className="bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl max-w-xl mx-auto border border-slate-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 text-xl mb-2 border border-indigo-500/20">
                📝
              </div>
              <h2 className="text-xl font-black text-white">Report Lost or Found Item</h2>
              <p className="text-xs text-slate-400 mt-1">Our intelligent backend engine will run a smart cross-match instantly.</p>
            </div>

            <form onSubmit={handlePostItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="lost">I Lost This Item</option>
                    <option value="found">I Found This Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="ID Cards">ID Cards</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Casio Scientific Calculator fx-991ES"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 font-medium placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Provide distinguishing marks, unique scratches, colors..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 font-medium placeholder-slate-600 resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-indigo-400 tracking-wider mb-1.5">Location Lost / Found</label>
                <input
                  type="text"
                  placeholder="e.g. Central Library 2nd Floor Study Desk"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 font-medium placeholder-slate-600"
                />
              </div>

              {/* Security Question Section */}
              <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔐</span>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Anti-Fraud Security Verification</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Set a secure question that only the true owner would know. They must answer this correctly to claim the item.
                </p>
                <input
                  type="text"
                  placeholder="Secret Question (e.g. What sticker is on the back?)"
                  value={secretQuestion}
                  onChange={e => setSecretQuestion(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 font-medium placeholder-slate-600"
                />
                <input
                  type="text"
                  placeholder="Secret Answer (e.g. Batman Logo)"
                  value={secretAnswer}
                  onChange={e => setSecretAnswer(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 font-medium placeholder-slate-600"
                />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all text-xs uppercase tracking-wider">
                Post Item & Trigger Smart Match
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl max-w-xl mx-auto border border-slate-800">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2.5">
              <span>🔔</span> Smart Match Alerts
            </h2>
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="p-4 bg-slate-950 border border-indigo-500/20 rounded-2xl text-xs text-slate-300 flex items-start gap-3 shadow-sm">
                  <span className="text-indigo-400 text-base mt-0.5">✨</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-100 leading-snug">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block font-medium">{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-20 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800">
                  <span className="text-3xl mb-2 block opacity-50">🔔</span>
                  <p className="text-slate-300 font-bold text-xs">No smart match alerts yet.</p>
                  <p className="text-slate-500 text-[11px] mt-1">When someone posts a matching item, you will be notified instantly!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Claim Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 text-slate-100">
            <h3 className="text-lg font-black text-white mb-1">Claim Verification</h3>
            <p className="text-xs font-bold text-indigo-400 mb-5 uppercase tracking-wider">{selectedItem.title}</p>

            {!claimResult?.success ? (
              <form onSubmit={handleClaimItem} className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Finder's Security Question:</p>
                  <p className="text-xs font-bold italic text-indigo-300">"{selectedItem.secret_question}"</p>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Your Secret Answer</label>
                  <input
                    type="text"
                    placeholder="Type precise answer..."
                    value={claimAnswer}
                    onChange={e => setClaimAnswer(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 font-medium placeholder-slate-600"
                  />
                </div>

                {claimResult && (
                  <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center">{claimResult.error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition">
                    Verify Answer
                  </button>
                  <button type="button" onClick={() => setSelectedItem(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl text-xs transition">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-xs">
                  <p className="font-black text-emerald-400 text-sm mb-1">Verification Successful! 🎉</p>
                  <p className="text-slate-300 text-[11px] mb-3 font-medium">Coordinate with the finder to collect your item safely:</p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-1">
                    <p className="font-bold text-white text-xs">Name: {claimResult.uploader.name}</p>
                    <p className="font-medium text-slate-400 text-xs">Email: {claimResult.uploader.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg">
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}