import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, DollarSign, TrendingUp, Filter, Download } from 'lucide-react';
import { api } from '../api';

export default function Reporting() {
    const { data: stats, isLoading } = useQuery(['stats'], () => api.get('/stats').then(res => res.data));
    const { data: courses = [] } = useQuery(['courses'], () => api.get('/courses').then(res => res.data));
    const [filter, setFilter] = useState('all');

    if (isLoading) return <div className="p-8 text-gray-500">Loading reports...</div>;

    const statCards = [
        { label: 'Total Learners', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Courses', value: stats?.total_courses || 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Revenue', value: `$${stats?.total_revenue || 0}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#f8f6f2] p-8 gap-8 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#1a1614]">Performance Overview</h2>
                    <p className="text-gray-500">Track your platform's growth and engagement.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
                    <Download size={16} /> Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-black text-[#1a1614]">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Table Section */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Course Performance</h3>
                    <div className="flex gap-2">
                        {['All', 'Paid', 'Free'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f.toLowerCase())}
                                className={`px-3 py-1 text-xs font-bold rounded-full border ${filter === f.toLowerCase() ? 'bg-[#1a1614] text-white border-[#1a1614]' : 'bg-white text-gray-500 border-gray-200'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Course Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Enrollments</th>
                                <th className="px-6 py-4">Lessons</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {courses.filter(c => filter === 'all' || (filter === 'paid' && c.price > 0) || (filter === 'free' && c.price === 0)).map(course => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{course.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${course.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{course.price > 0 ? `$${course.price}` : 'Free'}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{course.views_count}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{course.enrollments_count || course._count?.enrollments || 0}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{course._count?.lessons || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
