import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, Shield, UserCheck, MoreVertical, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function Instructors() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [openMenuId, setOpenMenuId] = useState(null);
    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => api.get('/api/users').then(res => res.data)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.patch(`/api/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setOpenMenuId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setOpenMenuId(null);
        }
    });

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || u.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex flex-col h-full bg-bg-body font-sans p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Instructors & Staff</h1>
                    <p className="text-text-secondary text-sm">Manage access and permissions for platform administrators.</p>
                </div>
                <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                    + Invite Instructor
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm mb-6 flex justify-between items-center">
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-2 border border-border rounded-lg focus:border-primary outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-bg-body"
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Teacher</option>
                        <option>User</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading staff members...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No members found.</td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-text-main">{user.name}</div>
                                            <div className="text-sm text-text-secondary flex items-center gap-1">
                                                <Mail size={12} /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                        <Shield size={12} />
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        {user.status === 'active' ? 'Active' : (user.status === 'on_leave' ? 'On Leave' : 'Suspended')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenuId === user.id && (
                                        <div className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => updateMutation.mutate({ id: user.id, data: { role: user.role === 'admin' ? 'teacher' : 'admin' } })}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-text-main hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Shield size={14} className="text-primary" />
                                                Switch to {user.role === 'admin' ? 'Teacher' : 'Admin'}
                                            </button>
                                            <button
                                                onClick={() => updateMutation.mutate({ id: user.id, data: { status: user.status === 'active' ? 'on_leave' : 'active' } })}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-text-main hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <UserCheck size={14} className="text-blue-500" />
                                                Toggle Status
                                            </button>
                                            <div className="h-px bg-border my-1" />
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this user account?')) {
                                                        deleteMutation.mutate(user.id);
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Delete Member
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}
        </div>
    );
}
