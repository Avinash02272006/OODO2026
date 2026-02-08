import React, { useState, useRef } from 'react';
import { X, UploadCloud, Video, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export default function ContentWizard({ courseId, lesson, onClose }) {
    const [activeTab, setActiveTab] = useState('content');
    const [formData, setFormData] = useState({
        title: lesson?.title || '',
        category: lesson?.category || 'video', // video, document, image
        content_url: lesson?.content_url || '',
        duration: lesson?.duration || '00:00',
        allow_download: lesson?.allow_download || false,
        description: lesson?.description || '',
        additional_link: lesson?.additional_link || '',
        additional_file_url: lesson?.additional_file_url || '',
        responsible: lesson?.responsible || 'Admin User'
    });

    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const additionalFileInputRef = useRef(null);

    // Mutation for Create/Update
    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = { ...data, type: data.category }; // backend expects 'type' but we use category for UI
            if (lesson) {
                return api.put(`/lessons/${lesson.id}`, payload);
            } else {
                return api.post(`/courses/${courseId}/lessons`, payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            onClose();
        }
    });

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [field]: res.data.url }));
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed");
        }
    };

    const handleSubmit = () => {
        if (!formData.title) return alert("Title is required");
        mutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1 block">
                            {activeTab === 'additional' ? 'Additional Attachment' : activeTab} Tab
                        </span>
                        <h2 className="text-xl font-bold text-gray-800">
                            {lesson ? 'Edit Content' : 'Add New Content'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 pt-2 gap-4 bg-gray-50">
                    {['content', 'description', 'additional'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab
                                ? 'border-[#b8594d] text-[#b8594d]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'additional' ? 'Additional Attachment' : tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto flex-1 bg-[#1a1614] text-white">
                    <div className="space-y-6">

                        {/* Common Title Field (always visible/required? Design shows it inside specific tabs, but likely shared) */}
                        <div>
                            <label className="block text-sm font-bold text-orange-400 mb-2">Content Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-transparent border-b border-gray-600 focus:border-orange-400 outline-none py-2 text-lg text-blue-400 font-semibold placeholder-gray-600"
                                placeholder="e.g. Advanced Sales & CRM Automation"
                            />
                        </div>

                        {activeTab === 'content' && (
                            <div className="space-y-8 animate-in fade-in">
                                {/* Category Selection */}
                                <div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="video"
                                                checked={formData.category === 'video'}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="accent-purple-500 w-4 h-4"
                                            />
                                            <span className="text-sm">Video</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="document"
                                                checked={formData.category === 'document'}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="accent-purple-500 w-4 h-4"
                                            />
                                            <span className="text-sm">Document</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="image"
                                                checked={formData.category === 'image'}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="accent-purple-500 w-4 h-4"
                                            />
                                            <span className="text-sm">Image</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Conditional Fields */}
                                {formData.category === 'video' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Video Link</label>
                                            <input
                                                type="text"
                                                value={formData.content_url}
                                                onChange={e => setFormData({ ...formData, content_url: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none py-2 text-sm text-blue-300 placeholder-gray-600"
                                                placeholder="(Google Drive link or YouTube link)"
                                            />
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-400">Responsible:</label>
                                                <input
                                                    type="text"
                                                    value={formData.responsible}
                                                    onChange={e => setFormData({ ...formData, responsible: e.target.value })}
                                                    className="bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none py-1 w-32 text-center text-sm"
                                                    placeholder="Name"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-400">Duration:</label>
                                                <input
                                                    type="text"
                                                    value={formData.duration}
                                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                    className="bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none py-1 w-20 text-center text-sm"
                                                    placeholder="00:00"
                                                />
                                                <span className="text-sm text-gray-500">hours</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(formData.category === 'document' || formData.category === 'image') && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                                    {formData.category === 'document' ? 'Document File' : 'Image File'}
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={formData.content_url}
                                                        className="flex-1 bg-transparent border-b border-gray-600 py-2 text-sm text-gray-400 truncate"
                                                        placeholder="No file selected"
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors"
                                                    >
                                                        Upload {formData.category === 'document' ? 'file' : 'image'}
                                                    </button>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, 'content_url')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-20">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-400">Responsible:</label>
                                                <input
                                                    type="text"
                                                    value={formData.responsible}
                                                    onChange={e => setFormData({ ...formData, responsible: e.target.value })}
                                                    className="bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none py-1 w-32 text-center text-sm"
                                                    placeholder="Name"
                                                />
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <span className="text-sm text-gray-400">Allow Download :</span>
                                                <div className={`w-5 h-5 rounded border border-purple-500 flex items-center justify-center ${formData.allow_download ? 'bg-purple-500' : 'bg-transparent'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allow_download}
                                                        onChange={e => setFormData({ ...formData, allow_download: e.target.checked })}
                                                        className="hidden"
                                                    />
                                                    {formData.allow_download && <Check size={14} className="text-white" />}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'description' && (
                            <div className="h-full animate-in fade-in">
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-64 bg-transparent border border-gray-700 rounded p-4 text-sm text-gray-300 focus:border-orange-400 outline-none resize-none placeholder-blue-300/50"
                                    placeholder="Write your content description here..."
                                />
                            </div>
                        )}

                        {activeTab === 'additional' && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-400">File :</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.additional_file_url}
                                            className="flex-1 bg-transparent border-b border-gray-600 py-2 text-sm text-gray-400 truncate"
                                            placeholder="No file selected"
                                        />
                                        <button
                                            onClick={() => additionalFileInputRef.current?.click()}
                                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
                                        >
                                            Upload your file
                                        </button>
                                        <input
                                            type="file"
                                            ref={additionalFileInputRef}
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, 'additional_file_url')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-400">Link :</label>
                                    <input
                                        type="text"
                                        value={formData.additional_link}
                                        onChange={e => setFormData({ ...formData, additional_link: e.target.value })}
                                        className="w-[300px] bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none py-2 text-sm text-blue-300 placeholder-gray-600"
                                        placeholder="e.g : www.google.com"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#1a1614] border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded text-gray-400 font-bold hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </div>
        </div>
    );
}
