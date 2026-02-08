import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, UploadCloud, Eye, Plus, MoreVertical,
    Video, FileText, Image as ImageIcon, HelpCircle, X, Check
} from 'lucide-react';
import { api } from '../api';
import ContentWizard from './ContentWizard';
import QuizWizard from './QuizWizard';

export default function CourseEditor({ courseId, onBack }) {
    const [activeTab, setActiveTab] = useState('content');
    const [showContentWizard, setShowContentWizard] = useState(false);
    const [showQuizWizard, setShowQuizWizard] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const queryClient = useQueryClient();

    // Fetch Course Data
    const { data: course, isLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.get(`/courses/${courseId}`).then(res => res.data)
    });

    // Mutations
    const updateCourse = useMutation({
        mutationFn: (data) => api.put(`/courses/${courseId}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    });

    const deleteLesson = useMutation({
        mutationFn: (id) => api.delete(`/lessons/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>;

    const handleSave = (field, value) => {
        updateCourse.mutate({ [field]: value });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-800">Course Editor</h1>
                        <span className="text-sm text-gray-500">{course?.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all hidden md:block">
                        New
                    </button>
                    <div className="h-6 w-px bg-gray-300 hidden md:block" />
                    <button className="px-4 py-2 bg-[#1a1614] text-white rounded-lg text-sm font-bold hover:bg-black shadow-sm transition-all">
                        Contact Attendees
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        Add Attendees
                    </button>
                    <div className="h-6 w-px bg-gray-300 hidden md:block mx-1" />

                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-sm font-medium text-gray-600">Publish on website</span>
                        <button
                            onClick={() => handleSave('status', course.status === 'published' ? 'draft' : 'published')}
                            className={`w-10 h-5 rounded-full relative transition-colors ${course.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${course.status === 'published' ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 shadow-sm transition-all">
                        <Eye size={16} /> Preview
                    </button>
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Top Info Section */}
                <div className="p-8 border-b border-gray-100 flex gap-8">
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                            <input
                                type="text"
                                defaultValue={course.title}
                                onBlur={(e) => handleSave('title', e.target.value)}
                                className="w-full text-2xl font-bold text-[#2a2a2a] border-b-2 border-gray-200 focus:border-[#b8594d] outline-none px-0 py-2 bg-transparent transition-colors placeholder-gray-300"
                                placeholder="e.g. Basics of Odoo CRM"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                type="text"
                                defaultValue={course.tags}
                                onBlur={(e) => handleSave('tags', e.target.value)}
                                className="w-full text-sm text-gray-600 border-b border-gray-200 focus:border-[#b8594d] outline-none px-0 py-1 bg-transparent transition-colors"
                                placeholder="Add tags..."
                            />
                        </div>

                    </div>

                    {/* Image Upload Box */}
                    <div className="w-64 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#b8594d] hover:text-[#b8594d] transition-all cursor-pointer relative group">
                        {course.image ? (
                            <img src={course.image} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <>
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-xs font-medium">Course Image</span>
                            </>
                        )}
                        {/* Mock upload button */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 bg-white rounded shadow text-gray-600 hover:text-blue-600"><UploadCloud size={14} /></button>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 px-8">
                    {['Content', 'Description', 'Options', 'Quiz'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                ? 'border-[#b8594d] text-[#b8594d]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 min-h-[400px] bg-gray-50/50">
                    {activeTab === 'content' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-4">
                                <div className="col-span-6">Content Title</div>
                                <div className="col-span-4">Category</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            <div className="space-y-2">
                                {course.lessons?.map(lesson => (
                                    <div key={lesson.id} className="group bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                                        <div className="grid grid-cols-12 w-full items-center gap-4">
                                            <div className="col-span-6 font-medium text-gray-800 flex items-center gap-3">
                                                {lesson.category === 'video' && <Video size={16} className="text-blue-500" />}
                                                {lesson.category === 'document' && <FileText size={16} className="text-orange-500" />}
                                                {lesson.category === 'image' && <ImageIcon size={16} className="text-purple-500" />}
                                                {lesson.title}
                                            </div>
                                            <div className="col-span-4 text-sm text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded w-fit">
                                                {lesson.category}
                                            </div>
                                            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedLesson(lesson); setShowContentWizard(true); }}
                                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteLesson.mutate(lesson.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded text-red-500"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => { setSelectedLesson(null); setShowContentWizard(true); }}
                                    className="bg-[#a04e43] text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-[#a04e43]/20 hover:bg-[#8c433a] transition-all flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add Content
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'description' && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[300px]">
                            <textarea
                                defaultValue={course.description}
                                onBlur={(e) => handleSave('description', e.target.value)}
                                className="w-full h-full min-h-[300px] outline-none resize-none text-gray-700 leading-relaxed"
                                placeholder="Write your content description here..."
                            />
                        </div>
                    )}

                    {activeTab === 'options' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-4">
                            {/* Left Column: Access Rights */}
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Access Course Rights</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Show course to</label>
                                        <select
                                            value={course.visibility || 'everyone'}
                                            onChange={(e) => handleSave('visibility', e.target.value)}
                                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#b8594d] transition-colors"
                                        >
                                            <option value="everyone">Everyone</option>
                                            <option value="signed_in">Signed In Users</option>
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1 italic">
                                            Define who can access your courses and their content.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Access rules</label>
                                        <p className="text-xs text-gray-400 mb-3 -mt-2 italic">
                                            Defines how people can access/enroll to your courses.
                                        </p>

                                        <div className="space-y-3">
                                            {[
                                                { id: 'open', label: 'Open' },
                                                { id: 'invite', label: 'On Invitation' },
                                                { id: 'payment', label: 'On Payment' }
                                            ].map((rule) => (
                                                <div key={rule.id} className="flex items-center gap-3">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${course.accessRule === rule.id ? 'bg-[#b8594d] border-[#b8594d]' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}>
                                                            {course.accessRule === rule.id && <Check size={14} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="accessRule"
                                                            value={rule.id}
                                                            checked={course.accessRule === rule.id}
                                                            onChange={(e) => handleSave('accessRule', e.target.value)}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">{rule.label}</span>
                                                    </label>

                                                    {/* Price Input Inline */}
                                                    {rule.id === 'payment' && course.accessRule === 'payment' && (
                                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                            <span className="text-sm font-bold text-gray-500">Price:</span>
                                                            <input
                                                                type="number"
                                                                defaultValue={course.price}
                                                                onBlur={(e) => handleSave('price', parseFloat(e.target.value))}
                                                                className="w-24 p-1 text-sm border-b border-gray-300 focus:border-[#b8594d] outline-none bg-transparent"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Responsible */}
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Responsible</h3>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Course Admin</label>
                                    <select
                                        value={course.adminId || ''}
                                        onChange={(e) => handleSave('adminId', e.target.value)}
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#b8594d] transition-colors"
                                    >
                                        <option value="" disabled>Select Admin</option>
                                        <option value="admin-id-1">Admin User</option>
                                        <option value="teacher-id-1">Teacher 1</option>
                                        <option value="teacher-id-2">Teacher 2</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                        Decide who'll be the responsible of the course.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="text-lg font-semibold text-gray-700">Course Quizzes</h3>
                            </div>

                            <div className="space-y-2">
                                {course.quizzes?.map(quiz => (
                                    <div key={quiz.id} className="group bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all">
                                        <span className="font-medium text-gray-800 flex items-center gap-3">
                                            <HelpCircle size={16} className="text-purple-500" />
                                            {quiz.title}
                                        </span>
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedQuiz(quiz); setShowQuizWizard(true); }}
                                                className="text-sm px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => { setSelectedQuiz(null); setShowQuizWizard(true); }}
                                    className="bg-[#8b5cf6] text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-[#8b5cf6]/20 hover:bg-[#7c3aed] transition-all flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add Quiz
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Wizards */}
            {showContentWizard && (
                <ContentWizard
                    courseId={courseId}
                    lesson={selectedLesson}
                    onClose={() => { setShowContentWizard(false); setSelectedLesson(null); }}
                />
            )}
            {showQuizWizard && (
                <QuizWizard
                    courseId={courseId}
                    quiz={selectedQuiz}
                    onClose={() => { setShowQuizWizard(false); setSelectedQuiz(null); }}
                />
            )}
        </div>
    );
}
