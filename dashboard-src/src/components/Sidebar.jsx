import { useState } from 'react';
import {
    Box, Home, LayoutGrid, BarChart2, Users, Settings, LogOut, Moon, Sun, Monitor, PieChart
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, theme, toggleTheme, user, logout, onProfileClick }) {
    const menuItems = [
        { id: 'overview', icon: PieChart, label: 'Overview', roles: ['admin'] },
        { id: 'dashboard', icon: LayoutGrid, label: 'Courses', roles: ['admin', 'teacher'] },
        { id: 'reporting', icon: BarChart2, label: 'Reporting', roles: ['admin', 'teacher'] },
        { id: 'instructors', icon: Users, label: 'Instructors', roles: ['admin'] },
    ];

    const canView = (item) => item.roles.includes(user.role);

    return (
        <aside className="w-[280px] h-screen bg-bg-sidebar text-bg-sidebar-text flex flex-col border-r border-border shrink-0 transition-all duration-300 font-sans shadow-2xl z-20">
            {/* Logo */}
            <div
                className="p-8 pb-4 flex items-center gap-3 cursor-pointer group"
                onClick={() => setActiveView('overview')}
            >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Box size={22} strokeWidth={2.5} />
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-bg-sidebar-text">
                    Learn<span className="text-primary">Sphere</span>
                </div>
            </div>

            {/* Main Menu */}
            <div className="px-4 py-6 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-4 px-4 font-bold select-none opacity-70">Main Menu</div>
                {menuItems.filter(canView).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group relative overflow-hidden
                            ${activeView === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-text-secondary hover:bg-white/5 hover:text-bg-sidebar-text'
                            }`}
                    >
                        <item.icon size={20} className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative z-10">{item.label}</span>
                        {activeView === item.id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                ))}
            </div>

            {/* System Menu */}
            <div className="px-4 mt-auto mb-6 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-4 px-4 font-bold select-none opacity-70">System</div>
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-bg-sidebar-text transition-all group"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {user.role === 'admin' && (
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-bg-sidebar-text transition-all">
                        <Settings size={20} />
                        <span>Platform Settings</span>
                    </button>
                )}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-danger transition-all group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>

            {/* User Profile */}
            <div
                className="p-6 border-t border-border bg-black/10 backdrop-blur-sm cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={onProfileClick}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center font-bold text-lg text-white border-2 border-white/10 shadow-lg shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-bg-sidebar-text truncate group-hover:text-primary transition-colors">{user.name}</div>
                        <div className="text-xs text-text-secondary capitalize truncate">{user.role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
