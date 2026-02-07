import { useState, useEffect } from 'react';
import {
    BookOpen, Users, LogOut
} from 'lucide-react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import api from './api';

import CourseEditor from './components/CourseEditor';
import Reporting from './components/Reporting';
import CoursePlayer from './components/CoursePlayer';
import CourseList from './components/CourseList';
import LearnerDashboard from './components/LearnerDashboard';

const queryClient = new QueryClient();

// ----------------------------------------------------
// MODERN LOGIN SCREEN
// ----------------------------------------------------
function LoginScreen({ onLoginSuccess }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter out potential non-admin users for demo quick access
    // ...

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700;800&display=swap');
        .login-body { font-family: 'Karla', sans-serif; background: #1a1614; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow-x: hidden; }
        .login-container { display: grid; grid-template-columns: 1fr 1fr; background: #f5f0e8; width: 100%; height: 100vh; overflow: hidden; }
        .left-panel { background: linear-gradient(135deg, #b8594d 0%, #a04e43 50%, #8b4339 100%); position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .glass-container { width: 400px; padding: 40px; background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border-radius: 24px; border: 2px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; align-items: center; z-index: 10; color: white; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .floating-obj { position: absolute; opacity: 0.6; animation: floatLinear 20s infinite linear; font-size: 3rem;}
        @keyframes floatLinear { 0% { transform: translateY(110vh) rotate(0deg); } 100% { transform: translateY(-10vh) rotate(360deg); } }
        .right-panel { display: flex; flex-direction: column; justify-content: center; padding: 60px; background: #f5f0e8; position: relative; }
        .input-group { width: 100%; margin-bottom: 15px; }
        .input-group input { width: 100%; padding: 15px; background: #e8e0d5; border: 2px solid transparent; border-radius: 8px; font-family: 'Karla'; font-size: 1rem; transition: 0.3s; }
        .input-group input:focus { border-color: #b8594d; background: white; outline: none; }
        .btn-submit { width: 100%; padding: 15px; background: #1a1614; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-submit:hover { background: #b8594d; transform: translateY(-2px); }
        .toggle-link { color: #b8594d; font-weight: 700; cursor: pointer; margin-left: 5px; }
        
        @media (max-width: 768px) {
            .login-container { grid-template-columns: 1fr; }
            .left-panel { display: none; }
        }
    `;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (mode === 'signup') {
                if (password !== confirmPassword) throw new Error("Passwords mismatch");
                const { data } = await api.post('/register', { name, email, password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            } else {
                const { data } = await api.post('/login', { email, password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Authentication Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-body">
            <style>{styles}</style>
            <div className="login-container">
                {/* Left Panel */}
                <div className="left-panel">
                    <div className="floating-obj" style={{ left: '10%', animationDelay: '0s' }}>✏️</div>
                    <div className="floating-obj" style={{ left: '80%', animationDelay: '-5s' }}>📐</div>
                    <div className="glass-container">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 text-4xl shadow-lg border-2 border-white/30">🚀</div>
                        <h1 className="text-3xl font-bold mb-2">LearnSphere</h1>
                        <p className="opacity-80">Industrial Application for Next-Gen Learning</p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-4xl font-black text-[#1a1614] mb-2">{mode === 'login' ? 'Welcome Back!' : 'Join the Revolution'}</h2>
                        <form onSubmit={handleSubmit}>
                            {mode === 'signup' && (
                                <div className="input-group"><input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required /></div>
                            )}
                            <div className="input-group"><input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                            <div className="input-group"><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                            {mode === 'signup' && (
                                <div className="input-group"><input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
                            )}
                            {error && <div className="text-red-500 mb-4 text-sm font-bold bg-red-100 p-3 rounded">{error}</div>}
                            <button className="btn-submit" disabled={loading}>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</button>
                        </form>
                        <div className="mt-8 text-center text-gray-500 font-medium">
                            {mode === 'login' ? (
                                <>New here? <span onClick={() => setMode('signup')} className="toggle-link">Create Account</span></>
                            ) : (
                                <>Already have an account? <span onClick={() => setMode('login')} className="toggle-link">Log In</span></>
                            )}
                        </div>
                        {/* Demo Links */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
                            <p className="mb-2 uppercase tracking-wide font-bold text-gray-300">Quick Access (Demo)</p>
                            <div className="flex justify-center gap-4">
                                <span onClick={() => { setEmail('admin@learnsphere.com'); setPassword('password') }} className="cursor-pointer hover:text-[#b8594d] transition-colors">Admin</span>
                                <span>|</span>
                                <span onClick={() => onLoginSuccess({ name: 'Guest', role: 'guest' })} className="cursor-pointer hover:text-[#b8594d] transition-colors">Browse as Guest</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// ADMIN DASHBOARD
// ----------------------------------------------------
function AdminDashboard({ user, logout }) {
    const [activeTab, setActiveTab] = useState('courses');
    const [selectedCourse, setSelectedCourse] = useState(null);

    const adminStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .admin-layout { display: flex; font-family: 'Plus Jakarta Sans', sans-serif; background: #f8f6f2; height: 100vh; overflow: hidden; }
        .sidebar { width: 260px; background: #1a1614; color: #f5f0e8; display: flex; flex-direction: column; padding: 24px 0; border-right: 1px solid rgba(255,255,255,0.05); }
        .logo-area { padding: 0 24px; margin-bottom: 32px; display: flex; items-center; gap: 12px; font-weight: 800; font-size: 1.25rem; }
        .nav-item { padding: 12px 24px; margin: 4px 12px; border-radius: 8px; color: rgba(255,255,255,0.7); cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; font-weight: 500; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .nav-item.active { background: #b8594d; color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(184,89,77,0.4); }
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .header { height: 72px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; z-index: 10; }
    `;

    if (selectedCourse) {
        return <CourseEditor courseId={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    }

    return (
        <div className="admin-layout">
            <style>{adminStyles}</style>

            <aside className="sidebar">
                <div className="logo-area">
                    <div className="w-8 h-8 bg-[#b8594d] rounded-lg flex items-center justify-center text-white"><BookOpen size={18} /></div>
                    Learn<span className="text-[#b8594d]">Sphere</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-500 px-6 mb-2 tracking-widest">Main Menu</div>
                <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                    <BookOpen size={18} /> Courses
                </div>
                <div className={`nav-item ${activeTab === 'reporting' ? 'active' : ''}`} onClick={() => setActiveTab('reporting')}>
                    <Users size={18} /> Reporting
                </div>
                <div className="mt-auto px-6 pt-6 pb-6 border-t border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#b8594d] rounded-full flex items-center justify-center font-bold text-white border-2 border-white/10 shrink-0">{user.name.charAt(0)}</div>
                    <div>
                        <div className="text-sm font-bold text-white leading-none mb-1">{user.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                </div>
            </aside>

            <div className="main-content">
                <header className="header">
                    <div>
                        <h2 className="text-xl font-bold text-[#1a1614]">{activeTab === 'courses' ? 'Course Management' : 'Analytics & Reporting'}</h2>
                        <p className="text-sm text-gray-500">Backoffice Control Center</p>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
                        <LogOut size={16} /> Sign Out
                    </button>
                </header>
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'courses' ? (
                        <CourseList onSelectCourse={setSelectedCourse} />
                    ) : (
                        <div className="p-8 h-full overflow-y-auto"><Reporting /></div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// MAIN APP SHELL
// ----------------------------------------------------
function MainApp() {
    const [playingCourseId, setPlayingCourseId] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) setUser(JSON.parse(storedUser));
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setPlayingCourseId(null);
    };

    if (!user) return <LoginScreen onLoginSuccess={setUser} />;

    if (user.role === 'admin' || user.email.includes('admin')) {
        return <AdminDashboard user={user} logout={logout} />;
    }

    if (playingCourseId) return <CoursePlayer courseId={playingCourseId} onBack={() => setPlayingCourseId(null)} />;

    return <LearnerDashboard user={user} logout={logout} onPlayCourse={setPlayingCourseId} />;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MainApp />
        </QueryClientProvider>
    );
}
