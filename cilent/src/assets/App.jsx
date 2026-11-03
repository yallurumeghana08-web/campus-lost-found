import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

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

    useEffect(() => {
        if (token) {
            fetchItems();
            fetchNotifications();
        }
    }, [token, categoryFilter, statusFilter, searchTerm]);

    const fetchItems = async () => {
        let query = `${API_BASE}/items?`;
        if (categoryFilter) query += `category=${categoryFilter}&`;
        if (statusFilter) query += `status=${statusFilter}&`;
        if (searchTerm) query += `search=${searchTerm}&`;

        const res = await fetch(query);
        const data = await res.json();
        if (Array.isArray(data)) setItems(data);
    };

    const fetchNotifications = async () => {
        const res = await fetch(`${API_BASE}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isLoginMode ? '/auth/login' : '/auth/signup';
        const body = isLoginMode ? { email: authEmail, password: authPassword } : { name: authName, email: authEmail, password: authPassword };

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
            body: JSON.stringify({ title, description, category, status, location, secret_question: secretQuestion, secret_answer: secretAnswer })
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            setActiveTab('feed');
            fetchItems();
            setTitle(''); setDescription(''); setLocation(''); setSecretQuestion(''); setSecretAnswer('');
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-6">
                        <span className="text-4xl">🎓</span>
                        <h2 className="text-2xl font-extrabold text-slate-800 mt-2">Campus Lost & Found</h2>
                        <p className="text-sm text-slate-500 mt-1">Smart matching & secure recovery hub</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLoginMode && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Full Name</label>
                                <input type="text" placeholder="John Doe" value={authName} onChange={e => setAuthName(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-800" />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">College Email</label>
                            <input type="email" placeholder="student@campus.edu" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Password</label>
                            <input type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-800" />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition transform active:scale-95">
                            {isLoginMode ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                    <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-semibold text-center transition">
                        {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 pb-16">
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Campus Hub</h1>
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>Browse Feed</button>
                    <button onClick={() => setActiveTab('post')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'post' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>+ Post Item</button>
                    <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded-xl text-sm font-semibold relative transition ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        Notifications {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">{notifications.length}</span>}
                    </button>
                    <div className="pl-4 border-l border-slate-200 flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-800">{user.name}</p>
                            <p className="text-[10px] text-slate-400">Student</p>
                        </div>
                        <button onClick={handleLogout} className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto mt-8 px-4">
                {activeTab === 'feed' && (
                    <div>
                        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/80 mb-6 flex flex-wrap gap-4 items-center justify-between">
                            <input type="text" placeholder="🔍 Search items by keyword or location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex-1 min-w-[240px] outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm text-slate-800" />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-700">
                                <option value="">All Statuses</option>
                                <option value="lost">Lost</option>
                                <option value="found">Found</option>
                            </select>
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-700">
                                <option value="">All Categories</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Books">Books</option>
                                <option value="ID Cards">ID Cards</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {items.map(item => (
                                <div key={item.id} className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 transition flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`text-xs px-3 py-1 rounded-full uppercase font-extrabold tracking-wide ${item.status === 'lost' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                                                {item.status}
                                            </span>
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">{item.category}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                            <span className="font-semibold text-slate-700">📍 {item.location}</span>
                                            <span>By {item.uploader_name}</span>
                                        </div>
                                    </div>
                                    {item.status === 'found' && (
                                        <button onClick={() => { setSelectedItem(item); setClaimResult(null); setClaimAnswer(''); }} className="mt-5 w-full bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 text-sm font-bold py-2.5 rounded-xl border border-indigo-200/60 transition shadow-sm">
                                            🔒 Claim Item Securely
                                        </button>
                                    )}
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-2 text-center py-16 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                                    <p className="text-slate-400 font-medium">No items match your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'post' && (
                    <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-xl mx-auto border border-slate-200/80">
                        <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                            <span>📝</span> Report Lost or Found Item
                        </h2>
                        <form onSubmit={handlePostItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                                        <option value="lost">I Lost This Item</option>
                                        <option value="found">I Found This Item</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                                        <option value="Electronics">Electronics</option>
                                        <option value="Books">Books</option>
                                        <option value="ID Cards">ID Cards</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Item Title</label>
                                <input type="text" placeholder="e.g. Casio Calculator" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Description</label>
                                <textarea placeholder="Distinguishing marks, colors..." value={description} onChange={e => setDescription(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" rows="3"></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-indigo-900 mb-1">Location Lost / Found</label>
                                <input type="text" placeholder="e.g. Library 2nd Floor" value={location} onChange={e => setLocation(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                            </div>
                            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                                <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide mb-1">🔐 Secure Verification Question</p>
                                <p className="text-xs text-amber-700 mb-3">Set a secret question only the real owner knows.</p>
                                <input type="text" placeholder="Question (e.g. What sticker is on the back?)" value={secretQuestion} onChange={e => setSecretQuestion(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm mb-2 outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                                <input type="text" placeholder="Secret Answer" value={secretAnswer} onChange={e => setSecretAnswer(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition">Post Item & Run Smart Match</button>
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-xl mx-auto border border-slate-200/80">
                        <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                            <span>🔔</span> Smart Match Alerts
                        </h2>
                        <div className="space-y-3">
                            {notifications.map(notif => (
                                <div key={notif.id} className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-sm text-slate-700 flex items-start gap-3">
                                    <span className="text-indigo-600 font-bold mt-0.5">✨</span>
                                    <div>
                                        <p className="font-semibold text-indigo-900">{notif.message}</p>
                                        <span className="text-[11px] text-slate-400 mt-1 block">{new Date(notif.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">No smart match alerts yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100">
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Claim Verification</h3>
                        <p className="text-xs font-bold text-indigo-600 mb-4 uppercase tracking-wide">{selectedItem.title}</p>

                        {!claimResult?.success ? (
                            <form onSubmit={handleClaimItem} className="space-y-4">
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <p className="text-xs font-bold text-indigo-900 uppercase mb-1">Security Question:</p>
                                    <p className="text-sm font-semibold italic text-indigo-700">"{selectedItem.secret_question}"</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Your Answer</label>
                                    <input type="text" placeholder="Type secret answer..." value={claimAnswer} onChange={e => setClaimAnswer(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                                </div>
                                {claimResult && <p className="text-xs font-bold text-rose-500">{claimResult.error}</p>}
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-indigo-500/20 transition">Verify Answer</button>
                                    <button type="button" onClick={() => setSelectedItem(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm">
                                    <p className="font-extrabold text-emerald-700 text-base mb-1">Verification Successful! 🎉</p>
                                    <p className="text-emerald-800 text-xs mb-3">Coordinate with the finder to collect your item safely:</p>
                                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 space-y-1">
                                        <p className="font-bold text-slate-800">Name: {claimResult.uploader.name}</p>
                                        <p className="font-semibold text-slate-600 text-xs">Email: {claimResult.uploader.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm shadow-lg transition">Close Window</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}