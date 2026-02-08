import React, { useState } from 'react';
import { User, Mail, Lock, Camera, Save, ChevronLeft } from 'lucide-react';
import api from '../api';

export default function ProfileView({ user, onBack, onUpdateUser }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = React.useRef(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setLoading(true);
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar: data.url }));
            setMessage({ type: 'success', text: 'Image uploaded! Click Save to apply.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.put('/user/profile', {
                name: formData.name,
                bio: formData.bio,
                avatar: formData.avatar,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            onUpdateUser(data.user);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-bg-body p-8 font-sans custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-main mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-xs">Back to Dashboard</span>
                </button>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column: Avatar & Quick Info */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-bg-surface border border-border rounded-3xl p-8 text-center shadow-xl">
                            <div className="relative inline-block mb-6 group">
                                <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10 overflow-hidden bg-gradient-to-br from-primary to-primary-hover">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:scale-110 transition-transform cursor-pointer"
                                >
                                    <Camera size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-text-main mb-1">{user.name}</h2>
                            <p className="text-sm text-text-secondary mb-6 capitalize">{user.role}</p>

                            <div className="flex justify-center gap-4 border-t border-border pt-6">
                                <div className="text-center">
                                    <div className="text-xl font-black text-text-main">{user.points || 0}</div>
                                    <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Points</div>
                                </div>
                                <div className="w-px bg-border h-8 my-auto" />
                                <div className="text-center">
                                    <div className="text-xl font-black text-text-main">{user.level || 1}</div>
                                    <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Level</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="flex-1">
                        <div className="bg-bg-surface border border-border rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-text-main mb-8 flex items-center gap-3">
                                <User className="text-primary" size={24} />
                                Personalized Profile Settings
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                            <input
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-bg-body border border-border rounded-xl pl-12 pr-4 py-3 text-text-main outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                            <input
                                                disabled
                                                type="email"
                                                value={formData.email}
                                                className="w-full bg-bg-body/50 border border-border rounded-xl pl-12 pr-4 py-3 text-text-secondary cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1">Bio / Headline</label>
                                    <textarea
                                        name="bio"
                                        rows="3"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about yourself..."
                                        className="w-full bg-bg-body border border-border rounded-xl px-4 py-3 text-text-main outline-none focus:border-primary transition-colors resize-none"
                                    />
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h4 className="text-md font-bold text-text-main mb-6 flex items-center gap-3">
                                        <Lock className="text-danger" size={20} />
                                        Security & Credentials
                                    </h4>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1">Current Password (Required for changes)</label>
                                            <input
                                                name="currentPassword"
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className="w-full bg-bg-body border border-border rounded-xl px-4 py-3 text-text-main outline-none focus:border-primary transition-colors"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1">New Password</label>
                                                <input
                                                    name="newPassword"
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-bg-body border border-border rounded-xl px-4 py-3 text-text-main outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1">Confirm New Password</label>
                                                <input
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-bg-body border border-border rounded-xl px-4 py-3 text-text-main outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {message.text && (
                                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {message.type === 'success' ? '✨' : '⚠️'} {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {loading ? 'Saving Changes...' : 'Update Production Profile'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
