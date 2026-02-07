import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, LogOut, Clock, ChevronRight, Award, Trophy } from 'lucide-react';
import { api } from '../api';

export default function LearnerDashboard({ user, logout, onPlayCourse }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: courses = [] } = useQuery(['courses'], () => api.get('/courses').then(res => res.data));

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Calculate rank progress (mock logic)
    const nextRankPoints = 200;
    const progressPercent = Math.min((user.points / nextRankPoints) * 100, 100);
    const circumference = 2 * Math.PI * 60; // r=60

    const isGuest = user.role === 'guest';

    return (
        <div className="flex h-screen bg-[#f8f6f2] font-sans overflow-hidden">
            <div className="flex-1 flex flex-col relative h-full">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${isGuest ? 'bg-gray-400' : 'bg-[#b8594d]'}`}>
                            {isGuest ? 'G' : user.name.charAt(0)}
                        </div>
                        <h1 className="text-xl font-bold text-[#1a1614]">{isGuest ? 'Browse Courses' : 'My Courses'}</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#b8594d]/20 transition-all w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={logout} className={`text-sm font-bold transition-colors flex items-center gap-2 ${isGuest ? 'text-[#b8594d] border border-[#b8594d] px-4 py-2 rounded-full hover:bg-[#b8594d] hover:text-white' : 'text-gray-400 hover:text-[#b8594d]'}`}>
                            {isGuest ? 'Sign In' : <LogOut size={18} />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                                <div className="h-48 relative bg-gray-100 shrink-0">
                                    <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md text-white ${course.price > 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                        {course.price > 0 ? 'Paid' : 'Free'}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-2 text-[#1a1614] leading-tight line-clamp-2">{course.title}</h3>
                                    <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
                                        <Clock size={12} /> {course._count?.lessons || 0} Lessons
                                        <span className="mx-1">•</span>
                                        <span>{course.total_duration}</span>
                                    </div>
                                    <button
                                        onClick={() => isGuest ? logout() : onPlayCourse(course.id)}
                                        className={`mt-auto w-full py-3 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isGuest ? 'bg-gray-800 hover:bg-black' : 'bg-[#1a1614] hover:bg-[#b8594d]'}`}
                                    >
                                        {isGuest ? 'Login to Enroll' : 'Continue'} <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Profile Sidebar */}
            <aside className="w-[320px] bg-white border-l border-gray-100 h-full flex flex-col shrink-0 z-20 shadow-xl shadow-gray-200/50">
                {isGuest ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">👋</div>
                        <h2 className="text-2xl font-bold text-[#1a1614]">Welcome Guest!</h2>
                        <p className="text-gray-500">Sign up to track your progress, earn badges, and join the leaderboard.</p>
                        <button onClick={logout} className="w-full py-3 bg-[#b8594d] text-white font-bold rounded-lg hover:bg-[#a04e43] shadow-lg shadow-[#b8594d]/20 transition-all">
                            Create Free Account
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b border-gray-100 text-center">
                            <h2 className="text-lg font-bold mb-6 text-left flex items-center gap-2">
                                <Trophy size={18} className="text-yellow-500" /> My Profile
                            </h2>
                            <div className="w-32 h-32 mx-auto relative flex items-center justify-center mb-4">
                                {/* SVG Circle Progress */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                                    <circle
                                        cx="64" cy="64" r="60"
                                        stroke="#b8594d" strokeWidth="8" fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - (circumference * (progressPercent / 100))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Points</div>
                                    <div className="text-3xl font-black text-[#1a1614]">{user.points}</div>
                                    <div className="text-xs font-bold text-[#b8594d] bg-[#b8594d]/10 px-2 py-1 rounded-full mt-1 inline-block">{user.rank}</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Next rank at {nextRankPoints} pts</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Badges & Ranks</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Newbie', points: 0, color: 'gray' },
                                    { name: 'Explorer', points: 40, color: 'blue' },
                                    { name: 'Achiever', points: 60, color: 'indigo' },
                                    { name: 'Expert', points: 100, color: 'pink' },
                                    { name: 'Master', points: 500, color: 'amber' }
                                ].map((badge) => (
                                    <div key={badge.name} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${user.points >= badge.points ? 'border-[#b8594d]/20 bg-[#b8594d]/5' : 'border-gray-100 opacity-50 grayscale'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.points >= badge.points ? 'bg-[#b8594d] text-white shadow-md shadow-[#b8594d]/30' : 'bg-gray-100 text-gray-400'}`}>
                                                <Award size={14} />
                                            </div>
                                            <span className={`font-bold text-sm ${user.points >= badge.points ? 'text-[#1a1614]' : 'text-gray-400'}`}>{badge.name}</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-gray-400">{badge.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
