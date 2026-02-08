import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, Users, Clock, FileText, LayoutGrid, List, X, MoreVertical, Star, Share2, BarChart2
} from 'lucide-react';
import { api } from '../api';

export default function CourseList({ onSelectCourse }) {
    const [viewMode, setViewMode] = useState('list'); // Default to list to match wireframe
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    const queryClient = useQueryClient();
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses').then(res => res.data)
    });

    const createCourseMutation = useMutation({
        mutationFn: (title) => api.post('/courses', { title }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            setShowCreateModal(false);
            setNewCourseTitle('');
        }
    });

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return (
        <div className="flex items-center justify-center h-full text-text-secondary font-medium animate-pulse">
            Loading courses...
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-bg-body font-sans relative">
            {/* Toolbar */}
            <div className="px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full max-w-lg group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-bg-surface text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-text-secondary shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-bg-surface rounded-lg p-1 border border-border shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-main'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-main'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-20 custom-scrollbar">
                {filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                        <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-4 border border-border">
                            <Search size={24} className="opacity-50" />
                        </div>
                        <p className="font-medium">No courses found matching your search.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredCourses.map(course => (
                                    <div key={course.id} onClick={() => onSelectCourse(course.id)} className="bg-bg-surface rounded-2xl shadow-lg border border-border overflow-hidden hover:border-primary transition-all cursor-pointer group flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 duration-300">
                                        <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            {course.image && <img src={course.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Thumbnail" />}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-text-main mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                                            <div className="text-xs text-text-secondary mb-4 line-clamp-2">{course.tags}</div>
                                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-border">
                                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{course.status}</span>
                                                <span className="text-xs text-text-secondary font-medium">{course._count?.lessons || 0} Lessons</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // LIST VIEW
                            <div className="space-y-4">
                                {filteredCourses.map(course => (
                                    <div key={course.id} className="relative bg-bg-surface rounded-xl border border-border p-6 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-primary transition-all hover:shadow-lg duration-300">

                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className="text-xl font-bold text-text-main mb-2 cursor-pointer hover:text-primary transition-colors truncate"
                                                onClick={() => onSelectCourse(course.id)}
                                            >
                                                {course.title}
                                            </h3>

                                            <div className="flex flex-wrap gap-2 items-center">
                                                {course.tags?.split(',').filter(Boolean).length > 0 ? (
                                                    course.tags.split(',').map((tag, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-full bg-bg-body text-text-secondary text-xs border border-border">{tag.trim()}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-text-secondary text-sm italic">No tags</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs font-medium text-text-secondary w-48 shrink-0">
                                            <span className="text-right">Views</span>
                                            <span className="text-text-main">{course.views_count || 0}</span>
                                            <span className="text-right">Contents</span>
                                            <span className="text-text-main">{course._count?.lessons || 0}</span>
                                            <span className="text-right">Duration</span>
                                            <span className="text-text-main">{course.total_duration || '00:00'}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button className="px-6 py-1.5 border border-border rounded-lg text-text-main text-xs font-bold hover:bg-bg-body transition-colors uppercase tracking-wider">
                                                Share
                                            </button>
                                            <button
                                                onClick={() => onSelectCourse(course.id)}
                                                className="px-6 py-1.5 bg-primary border border-primary rounded-lg text-white text-xs font-bold hover:bg-primary-hover hover:border-primary-hover transition-colors uppercase tracking-wider shadow-lg shadow-primary/20"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* FLOATING ADD BUTTON */}
            <div className="absolute bottom-12 left-12 z-40">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-primary-hover hover:scale-110 transition-all border-4 border-bg-body"
                >
                    <Plus size={32} className="text-white" strokeWidth={3} />
                </button>
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-bg-surface border border-border shadow-2xl w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-300 relative m-4 rounded-2xl">

                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-bg-body/50">
                            <h3 className="text-xl font-bold text-text-main tracking-tight">Create New Course</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-text-main transition-colors p-2 hover:bg-bg-body rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex flex-col gap-8">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-2 ml-1">Course Title</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createCourseMutation.mutate(newCourseTitle)}
                                    className="w-full bg-bg-body border-2 border-border p-4 text-text-main text-lg focus:border-primary outline-none transition-all placeholder-text-secondary rounded-xl"
                                    placeholder="e.g. Advanced React Patterns"
                                />
                                <div className="absolute right-4 bottom-4 opacity-0 group-focus-within:opacity-100 transition-opacity text-primary text-[10px] font-mono font-bold border border-primary/20 px-2 py-1 rounded bg-primary/5">
                                    ⏎ ENTER
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 text-text-secondary font-bold hover:text-text-main transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => createCourseMutation.mutate(newCourseTitle)}
                                    disabled={!newCourseTitle.trim()}
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                                >
                                    Create Course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
