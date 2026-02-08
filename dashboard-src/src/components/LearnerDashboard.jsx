import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, LogOut, Clock, ChevronRight, Award, Trophy, Star, BookOpen, Check, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function LearnerDashboard({ user, logout, onPlayCourse, onProfileClick, onHomeClick }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [aiInsights, setAiInsights] = useState({}); // Track which courses have insights open

    const toggleInsight = (id) => {
        setAiInsights(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses').then(res => res.data)
    });

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Calculate rank progress (mock logic for demo)
    const nextRankPoints = 200;
    const progressPercent = Math.min((user.points / nextRankPoints) * 100, 100);
    const circumference = 2 * Math.PI * 64; // r=64

    const isGuest = user.role === 'guest';

    return (
        <div className="flex h-screen bg-[#1a1614] font-sans overflow-hidden text-white">
            <div className="flex-1 flex flex-col relative h-full">
                <header className="h-16 bg-white/5 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-8 z-20 shrink-0">
                    <div
                        className="font-bold text-lg tracking-tight text-white/90 font-serif italic cursor-pointer hover:text-white transition-colors"
                        onClick={onHomeClick}
                    >
                        LearnSphere
                    </div>
                    <div className="flex items-center gap-6">
                        <div
                            className="text-right hidden md:block cursor-pointer group"
                            onClick={onProfileClick}
                        >
                            <div className="text-sm font-bold text-white mb-0.5 group-hover:text-amber-500 transition-colors">{isGuest ? 'Guest User' : user.name}</div>
                            {!isGuest && <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Logged In</div>}
                        </div>
                        <div
                            onClick={onProfileClick}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/10 relative overflow-hidden group cursor-pointer
                            ${isGuest ? 'bg-gray-700' : 'bg-gradient-to-br from-[#b8594d] to-[#a04e43]'}`}
                        >
                            {isGuest ? 'G' : (user.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : user.name.charAt(0))}
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-white transition-colors" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-dark flex flex-col">
                    {/* Sub-Header Area per mockup */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-4 shrink-0">
                        <h2 className="text-xl font-medium text-white italic font-serif">
                            {isGuest ? 'Discover Learning' : 'My Courses'}
                        </h2>

                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search course"
                                className="w-full md:w-64 pl-4 pr-10 py-2 bg-transparent border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white transition-all text-white placeholder-gray-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-500 animate-in fade-in zoom-in duration-500 min-h-[400px]">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                <BookOpen size={32} className="opacity-40" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No courses found</h3>
                            <p className="max-w-xs text-center text-sm">Try adjusting your search terms.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course, index) => {
                                const isEnrolled = course.isEnrolled;
                                const isStarted = course.progress > 0;
                                const isPaid = course.price && course.price > 0;

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => isGuest ? logout() : onPlayCourse(course.id)}
                                        className="bg-[#1a1614] rounded-2xl shadow-2xl border border-white/10 overflow-hidden hover:border-[#b8594d] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 relative cursor-pointer"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="h-40 relative bg-gray-900 shrink-0 overflow-hidden">
                                            <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" alt={course.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1614] to-transparent opacity-90" />

                                            {isPaid && (
                                                <div className="absolute top-3 right-3 bg-green-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 transform rotate-3">
                                                    Paid
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col relative -mt-10">
                                            <div className="bg-[#2a2624] p-4 rounded-xl border border-white/5 shadow-xl flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg text-blue-400 mb-2 leading-tight line-clamp-2 group-hover:text-[#b8594d] transition-colors" title={course.title}>
                                                    {course.title}
                                                </h3>

                                                <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                                                    {course.description || "Start learning to explore more about this topic."}
                                                </p>

                                                <div className="mb-4">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleInsight(course.id); }}
                                                        className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors group"
                                                    >
                                                        <Sparkles size={12} className={`transition-transform duration-500 ${aiInsights[course.id] ? 'rotate-180 scale-125' : 'group-hover:scale-110'}`} />
                                                        {aiInsights[course.id] ? 'Hide Magic Insight' : 'Magic Insight'}
                                                    </button>
                                                    {aiInsights[course.id] && (
                                                        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                                            <p className="text-[11px] text-gray-300 leading-relaxed italic">
                                                                "This course uses <span className="text-purple-300 font-bold">real-world case studies</span> to bridge the gap between theory and execution, focusing on scalable solutions."
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {(course.tags || 'Tag 1, Tag 2').split(',').slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300 font-medium">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="mt-auto">
                                                    {isPaid && !isEnrolled ? (
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => onPlayCourse(course.id)} // Should trigger buy
                                                                className="flex-1 py-2 bg-transparent border border-[#b8594d] text-[#b8594d] rounded-lg font-bold text-xs hover:bg-[#b8594d] hover:text-white transition-all shadow-[0_0_10px_rgba(184,89,77,0.2)]"
                                                            >
                                                                Buy Course
                                                            </button>
                                                            <span className="font-bold text-white text-sm">INR {course.price}</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => isGuest ? logout() : onPlayCourse(course.id)}
                                                            className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide
                                                            ${!isEnrolled
                                                                    ? 'bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-lg shadow-indigo-500/20'
                                                                    : 'bg-[#b8594d] text-white hover:bg-[#a04e43] shadow-lg shadow-[#b8594d]/20'}`}
                                                        >
                                                            {isGuest ? 'Login to Join' : (!isStarted ? 'Join Course' : 'Continue')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Sidebar - ONLY for non-guests on "My Courses" */}
            {!isGuest && (
                <aside className="w-[340px] bg-[#1a1614] border-l border-white/10 h-full flex flex-col shrink-0 z-30 shadow-2xl relative">
                    <div className="p-8 border-b border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2
                                className="text-xl font-medium text-white italic cursor-pointer hover:text-primary transition-colors"
                                style={{ fontFamily: 'serif' }}
                                onClick={onProfileClick}
                            >
                                My profile
                            </h2>
                        </div>

                        <div className="relative flex flex-col items-center justify-center mb-8">
                            {/* SVG Circle Progress */}
                            <div className="relative w-48 h-48 group cursor-pointer">
                                <div className="absolute inset-0 bg-[#00c0a3]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                                    <circle cx="96" cy="96" r="68" stroke="#222" strokeWidth="2" fill="transparent" />
                                    {/* Tick mark decoration on ring */}
                                    <circle
                                        cx="96" cy="96" r="68"
                                        stroke="#00c0a3" strokeWidth="4" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 68}
                                        strokeDashoffset={(2 * Math.PI * 68) - ((2 * Math.PI * 68) * (progressPercent / 100))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total {user.points}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Points</div>
                                    <div className="text-3xl font-black text-[#ffa500] tracking-tighter" style={{ textShadow: '0 0 20px rgba(255,165,0,0.3)' }}>
                                        {user.rank || 'Newbie'}
                                    </div>
                                </div>

                                {/* Orbiting dot */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[6px]">
                                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-dark">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Badges & Ranks</h3>
                        <div className="space-y-1">
                            {[
                                { name: 'Newbie', points: 20 },
                                { name: 'Explorer', points: 40 },
                                { name: 'Achiever', points: 60 },
                                { name: 'Specialist', points: 80 },
                                { name: 'Expert', points: 100 },
                                { name: 'Master', points: 120 }
                            ].map((badge) => {
                                const isUnlocked = user.points >= badge.points;
                                return (
                                    <div key={badge.name} className="flex items-center justify-between py-3 px-4 rounded-xl transition-all group hover:bg-white/5">
                                        <div className={`font-bold text-sm ${isUnlocked ? 'text-[#ffa500]' : 'text-gray-600'}`}>{badge.name}</div>
                                        <div className={`text-xs font-medium ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>{badge.points} Points</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
