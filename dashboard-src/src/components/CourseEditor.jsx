import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, UploadCloud, Eye, Plus, MoreVertical,
    Video, FileText, Image as ImageIcon, HelpCircle, X, Check
} from 'lucide-react';
import { api } from '../api'; // Adjusted import path based on file structure (src/api.js)
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
    const { data: course, isLoading } = useQuery(['course', courseId], () => api.get(`/courses/${courseId}`).then(res => res.data));

    // Mutations
    const updateCourse = useMutation((data) => api.put(`/courses/${courseId}`, data), {
        onSuccess: () => queryClient.invalidateQueries(['course', courseId])
    });

    const deleteLesson = useMutation((id) => api.delete(`/lessons/${id}`), {
        onSuccess: () => queryClient.invalidateQueries(['course', courseId])
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

                <div className="flex items-center gap-4">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Responsible</label>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                    AJ
                                </div>
                                <span className="text-sm text-gray-600">Admin User</span>
                            </div>
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
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Access Rights</h3>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-sm font-medium text-gray-600">Show course to</label>
                                        <div className="col-span-2">
                                            <select
                                                value={course.visibility}
                                                onChange={(e) => handleSave('visibility', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#b8594d]"
                                            >
                                                <option value="everyone">Everyone</option>
                                                <option value="signed_in">Signed In Users</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 items-start">
                                        <label className="text-sm font-medium text-gray-600 pt-1">Access rules</label>
                                        <div className="col-span-2 space-y-3">
                                            {['open', 'invite', 'payment'].map(type => (
                                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${course.access_type === type ? 'border-[#b8594d]' : 'border-gray-300'}`}>
                                                        {course.access_type === type && <div className="w-2.5 h-2.5 bg-[#b8594d] rounded-full" />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="access_type"
                                                        value={type}
                                                        checked={course.access_type === type}
                                                        onChange={(e) => handleSave('access_type', e.target.value)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-gray-700 capitalize">{type === 'payment' ? 'On Payment' : type}</span>
                                                </label>
                                            ))}

                                            {course.access_type === 'payment' && (
                                                <div className="ml-8 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-gray-500">Price:</span>
                                                        <input
                                                            type="number"
                                                            defaultValue={course.price}
                                                            onBlur={(e) => handleSave('price', parseFloat(e.target.value))}
                                                            className="w-32 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#b8594d]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Responsible</h3>
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Course Admin</label>
                                    <div className="col-span-2">
                                        <select className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#b8594d]">
                                            <option>Admin User</option>
                                        </select>
                                    </div>
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
