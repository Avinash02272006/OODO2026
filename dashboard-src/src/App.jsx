import React, { useState, useEffect } from 'react';
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
import Instructors from './components/Instructors';
import AdminOverview from './components/AdminOverview';
import Sidebar from './components/Sidebar';
import ProfileView from './components/ProfileView';

const queryClient = new QueryClient();

// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8 text-center font-sans">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong 🚨</h1>
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-red-200 max-w-2xl w-full text-left overflow-auto">
                        <p className="font-bold text-gray-800 mb-2">{this.state.error?.toString()}</p>
                        <pre className="text-xs text-red-500 bg-red-50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <div className="mt-8 flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('user');
                                localStorage.removeItem('token');
                                window.location.reload();
                            }}
                            className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
                        >
                            Reset Login & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ----------------------------------------------------
// MODERN LOGIN SCREEN
function LoginScreen({ onLoginSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [role, setRole] = useState('student'); // 'student' | 'admin' | 'guest'
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation Logic
    const validate = () => {
        if (role === 'guest') return null;
        if (mode === 'signup') {
            if (!formData.name) return "Name is required";
            if (!formData.email.includes('@')) return "Invalid Email";
            if (formData.password.length < 8) return "Password must be > 8 characters";
            if (!/[A-Z]/.test(formData.password)) return "Password must have an uppercase letter";
            if (!/[a-z]/.test(formData.password)) return "Password must have a lowercase letter";
            if (!/[!@#$%^&*]/.test(formData.password)) return "Password must have a special character";
            if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        }
        return null;
    };

    const handleRoleSwitch = (newRole) => {
        setRole(newRole);
        setError('');
        if (newRole === 'admin') {
            setFormData({ ...formData, email: 'admin@learnsphere.com', password: 'password' });
        } else if (newRole === 'student') {
            setFormData({ ...formData, email: 'student@example.com', password: 'password' });
        } else {
            setFormData({ ...formData, email: '', password: '' });
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (role === 'guest') {
            onLoginSuccess({ name: 'Guest User', role: 'guest', points: 0, level: 1 });
            return;
        }

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            if (mode === 'signup') {
                const { data } = await api.post('/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role === 'admin' ? 'admin' : 'user'
                });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            } else {
                const { data } = await api.post('/login', {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Authentication Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Logo */}
            <div className="z-10 mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-4">
                    🚀
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">LearnSphere</h1>
            </div>

            {/* Role Switcher */}
            <div className="z-10 flex bg-white/5 p-1 rounded-xl mb-6 backdrop-blur-md border border-white/10">
                {['student', 'admin', 'guest'].map((r) => (
                    <button
                        key={r}
                        onClick={() => handleRoleSwitch(r)}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${role === r ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* Card */}
            <div className="z-10 w-full max-w-md bg-[#0a0a0a] border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-6 text-center tracking-wide uppercase border-b border-white/10 pb-4 text-gray-400">
                    {role === 'guest' ? 'Guest Access' : (mode === 'login' ? `${role} Login` : `${role} Sign up`)}
                </h2>

                {role === 'guest' ? (
                    <div className="space-y-6 text-center">
                        <p className="text-gray-400 text-sm">Access the platform as a guest to browse courses. You won't be able to track progress or earn points.</p>
                        <button
                            onClick={() => handleSubmit()}
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Enter as Guest
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-white transition-colors"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-white transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-white transition-colors"
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-white transition-colors"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-400 text-xs font-bold bg-red-900/20 p-3 rounded border border-red-900/50 flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>
                )}

                {role !== 'guest' && (
                    <div className="mt-6 flex justify-between items-center text-xs text-gray-500 font-medium">
                        {mode === 'login' ? (
                            <>
                                <button className="hover:text-white transition-colors">Forgot Password?</button>
                                <span className="text-gray-700">|</span>
                                <button onClick={() => setMode('signup')} className="hover:text-white transition-colors uppercase font-bold">Sign Up</button>
                            </>
                        ) : (
                            <div className="w-full text-center">
                                Already have an account? <button onClick={() => setMode('login')} className="text-white hover:underline uppercase font-bold ml-1">Sign In</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 text-gray-600 text-[10px] uppercase tracking-[0.2em] font-bold">
                Professional Learning Management System
            </div>
        </div>
    );
}


// ----------------------------------------------------
// ADMIN DASHBOARD
// ----------------------------------------------------
function AdminDashboard({ user, logout }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'overview' | 'reporting' | 'instructors'
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Mock theme toggle (or implement context)
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    if (showProfile) {
        return <ProfileView user={user} onBack={() => setShowProfile(false)} onUpdateUser={(updated) => {
            // Update local storage and state is handled by parent, but we can pass it up
            window.location.reload(); // Simple way to refresh all views with new user data
        }} />;
    }

    if (selectedCourse) {
        return <CourseEditor courseId={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    }

    let viewTitle = 'Course Management';
    if (activeTab === 'overview') viewTitle = 'Dashboard Overview';
    if (activeTab === 'reporting') viewTitle = 'Analytics & Reporting';
    if (activeTab === 'instructors') viewTitle = 'Staff Management';

    return (
        <div className="flex h-screen bg-bg-body overflow-hidden font-sans transition-colors duration-500">
            <Sidebar
                activeView={activeTab}
                setActiveView={(v) => { setActiveTab(v); setShowProfile(false); }}
                user={user}
                logout={logout}
                theme={theme}
                toggleTheme={toggleTheme}
                onProfileClick={() => setShowProfile(true)}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-colors duration-500">
                <header className="h-16 bg-bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-10 shrink-0 transition-colors duration-500">
                    <div>
                        <h2 className="text-xl font-bold text-text-main">
                            {viewTitle}
                        </h2>
                        <p className="text-sm text-text-secondary">Backoffice Control Center</p>
                    </div>
                </header>
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'overview' && <AdminOverview />}
                    {activeTab === 'dashboard' && <CourseList onSelectCourse={setSelectedCourse} />}
                    {activeTab === 'reporting' && (
                        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                            <Reporting />
                        </div>
                    )}
                    {activeTab === 'instructors' && <Instructors />}
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
    const [showProfile, setShowProfile] = useState(false);

    const { data: profile } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => api.get('/user/profile').then(res => {
            const up = res.data.user || res.data;
            return { ...user, ...up };
        }),
        enabled: !!user && user.role !== 'guest'
    });

    useEffect(() => {
        if (profile) {
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
        }
    }, [profile]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem("user");
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setPlayingCourseId(null);
    };

    if (!user) return <LoginScreen onLoginSuccess={setUser} />;

    if (user.role === 'admin' || (user.email && user.email.includes('admin'))) {
        return <AdminDashboard user={user} logout={logout} />;
    }

    if (playingCourseId) return <CoursePlayer courseId={playingCourseId} user={user} onBack={() => setPlayingCourseId(null)} />;

    if (showProfile) {
        return <ProfileView user={user} onBack={() => setShowProfile(false)} onUpdateUser={(u) => {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
        }} />;
    }

    return <LearnerDashboard user={user} logout={logout} onPlayCourse={setPlayingCourseId} onProfileClick={() => setShowProfile(true)} onHomeClick={() => setShowProfile(false)} />;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <MainApp />
            </ErrorBoundary>
        </QueryClientProvider>
    );
}
