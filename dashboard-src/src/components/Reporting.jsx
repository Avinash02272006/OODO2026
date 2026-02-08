import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, DollarSign, TrendingUp, Filter, Download, Activity } from 'lucide-react';
import { api } from '../api';

export default function Reporting() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: () => api.get('/analytics/teacher').then(res => res.data)
    });
    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses').then(res => res.data)
    });
    const [filter, setFilter] = useState('all');

    if (isLoading) return <div className="p-10 text-text-secondary animate-pulse">Loading analytics...</div>;

    const statCards = [
        { label: 'Total Learners', value: stats?.totalLearners || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Courses', value: stats?.activeCourses || 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Avg Completion', value: `${stats?.averageCompletion || 0}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Enrollments', value: courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const filteredCourses = courses.filter(c => {
        if (filter === 'paid') return c.price > 0;
        if (filter === 'free') return c.price === 0;
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-bg-body p-8 gap-8 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-text-main tracking-tight">Performance Overview</h2>
                    <p className="text-text-secondary font-medium">real-time insights into your academy.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-text-main shadow-sm hover:bg-gray-50 hover:shadow-md transition-all">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-5 hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-text-main tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Table Section */}
            <div className="flex-1 bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                        <Filter size={18} className="text-bg-sidebar" /> Course Performance
                    </h3>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {['All', 'Paid', 'Free'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f.toLowerCase())}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === f.toLowerCase() ? 'bg-white text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-text-secondary text-xs uppercase font-bold sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5">Course Name</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Price</th>
                                <th className="px-6 py-5 text-center">Enrollments</th>
                                <th className="px-6 py-5 text-center">Lessons</th>
                                <th className="px-6 py-5 text-right">Revenue (Est)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-text-main group-hover:text-primary transition-colors">{course.title}</div>
                                        <div className="text-xs text-text-secondary font-mono">{course.slug}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${course.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-text-secondary text-sm">{course.price > 0 ? `$${course.price}` : 'Free'}</td>
                                    <td className="px-6 py-5 font-mono text-text-main text-center bg-gray-50/50">{course._count?.enrollments || 0}</td>
                                    <td className="px-6 py-5 font-mono text-text-main text-center">{course._count?.lessons || 0}</td>
                                    <td className="px-6 py-5 font-mono text-text-main text-right font-bold">
                                        ${((course.price || 0) * (course._count?.enrollments || 0)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCourses.length === 0 && (
                        <div className="text-center py-20 text-text-secondary">
                            <p>No courses match your filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
