import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, Users, Clock, BookOpen, MoreVertical, Edit, Share2, LayoutGrid, List
} from 'lucide-react';
import { api } from '../api';

export default function CourseList({ onSelectCourse }) {
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    const queryClient = useQueryClient();
    const { data: courses = [], isLoading } = useQuery(['courses'], () => api.get('/courses').then(res => res.data));

    const createCourseMutation = useMutation(
        (title) => api.post('/courses', { title }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['courses']);
                setShowCreateModal(false);
                setNewCourseTitle('');
            }
        }
    );

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-gray-500">Loading courses...</div>;

    return (
        <div className="flex flex-col h-full bg-[#f8f6f2]">
            {/* Toolbar */}
            <div className="px-8 py-6 mb-4 flex items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#b8594d] outline-none bg-white shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-200 rounded p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-500'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-500'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-[#b8594d] text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-[#a04e43] transition-colors"
                    >
                        <Plus size={18} /> New Course
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                <div className="h-40 bg-gray-100 relative">
                                    <img src={course.image} className="w-full h-full object-cover" />
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md text-white shadow-sm ${course.status === 'published' ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                                        {course.status}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-800 mb-2 truncate" title={course.title}>{course.title}</h3>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {course.tags?.split(',').filter(Boolean).map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                                        <span className="flex items-center gap-1"><Users size={14} /> {course.views_count}</span>
                                        <span className="flex items-center gap-1"><FileText size={14} /> {course._count?.lessons}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {course.total_duration}</span>
                                    </div>

                                    <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onSelectCourse(course.id)}
                                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded font-bold text-sm hover:border-[#b8594d] hover:text-[#b8594d]"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-[#1a1614] text-white rounded-xl p-4 flex items-center gap-6 border border-gray-800 hover:border-gray-700 transition-colors relative group">
                                <div className="absolute top-0 right-0">
                                    <div className={`px-8 py-1 text-xs font-bold uppercase transform rotate-45 translate-x-4 translate-y-2 shadow-sm ${course.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                        {course.status}
                                    </div>
                                </div>

                                <div className="absolute top-4 right-16 flex gap-2">
                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-bold w-20">Share</button>
                                    <button
                                        onClick={() => onSelectCourse(course.id)}
                                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-bold w-20"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="w-1 min-w-[4px] h-20 bg-blue-500 rounded-full"></div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-blue-400 mb-2">{course.title}</h3>
                                    <div className="flex gap-2">
                                        {course.tags?.split(',').filter(Boolean).map(tag => (
                                            <span key={tag} className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded cursor-pointer hover:bg-red-500/20 hover:text-red-400">
                                                {tag} <span className="ml-1 opacity-50">&times;</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 text-sm text-orange-400 font-mono w-48">
                                    <div className="flex justify-between"><span>Views</span> <span className="font-bold">{course.views_count}</span></div>
                                    <div className="flex justify-between"><span>Contents</span> <span className="font-bold">{course._count?.lessons}</span></div>
                                    <div className="flex justify-between"><span>Duration</span> <span className="font-bold">{course.total_duration}</span></div>
                                </div>

                                <div className="w-24"></div> {/* Spacer for buttons */}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a1614] rounded-xl border border-gray-700 shadow-2xl w-full max-w-md p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-white font-bold">Create Course</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Provide a name..</label>
                            <input
                                type="text"
                                autoFocus
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && createCourseMutation.mutate(newCourseTitle)}
                                className="w-full bg-transparent border-2 border-white/20 rounded p-2 text-white outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                                placeholder="Eg: Basics of Odoo CRM"
                            />
                        </div>
                        <div className="p-4 bg-white/5 flex justify-end">
                            <button
                                onClick={() => createCourseMutation.mutate(newCourseTitle)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
