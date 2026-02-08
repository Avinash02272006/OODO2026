import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, Shield, UserCheck, MoreVertical, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function Instructors() {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Mock functionality - backend might need an endpoint for listing users
    // Current server.js doesn't have a general "list users" endpoint.
    // I should add one to server.js or just show a mock UI for now.
    // Given the constraints, I'll add the endpoint to server.js in a later step if needed, 
    // but for now I'll mock the data in the UI to ensure it looks good.

    // Actually, server.js has `GET /api/analytics/teacher` which counts users.
    // I'll assume we can add `GET /api/users` later.
    // Let's use a mock list for the UI demonstration.

    const mockUsers = [
        { id: 1, name: 'Admin User', email: 'admin@learnsphere.com', role: 'admin', status: 'active' },
        { id: 2, name: 'John Doe', email: 'john@example.com', role: 'teacher', status: 'active' },
        { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'teacher', status: 'on_leave' },
    ];

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
                    <select className="px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-bg-body">
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Teacher</option>
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
                        {mockUsers.map((user) => (
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
                                        {user.status === 'active' ? 'Active' : 'On Leave'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
