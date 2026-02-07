import { useState } from 'react';
import {
    Box, Home, LayoutGrid, BarChart2, Users, Settings, LogOut, Moon, Sun, Monitor
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, theme, toggleTheme, user }) {
    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Courses', roles: ['admin', 'teacher'] },
        { id: 'reporting', icon: BarChart2, label: 'Reporting', roles: ['admin', 'teacher'] },
        { id: 'instructors', icon: Users, label: 'Instructors', roles: ['admin'] }, // Admin only
    ];

    const canView = (item) => item.roles.includes(user.role);

    return (
        <aside className="w-[260px] h-screen bg-[#1a1614] dark:bg-black text-[#f5f0e8] flex flex-col border-r border-white/5 shrink-0 transition-all duration-300">
            {/* Logo */}
            <div className="p-6 mb-4 flex items-center gap-3">
                {/* Placeholder: If logo images exist, replace this Box with img */}
                {/* {theme === 'dark'
             ? <img src="/logo-dark.png" alt="Dark Mode Logo" className="h-8" />
             : <img src="/logo-light.png" alt="Light Mode Logo" className="h-8" />
        } */}
                {/* Fallback SVG Logo implementation based on description */}
                <div className="w-8 h-8 bg-[#b8594d] rounded-lg flex items-center justify-center text-white">
                    <Box size={20} />
                </div>
                <div className="text-xl font-bold tracking-tight">
                    Learn<span className="text-[#b8594d]">Sphere</span>
                </div>
            </div>

            {/* Main Menu */}
            <div className="px-3 mb-6">
                <div className="text-xs uppercase tracking-widest text-white/40 mb-3 px-3 font-bold">Main Menu</div>
                {menuItems.filter(canView).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all mb-1
              ${activeView === item.id
                                ? 'bg-[#b8594d] text-white shadow-lg shadow-[#b8594d]/40'
                                : 'text-white/70 hover:bg-white/5 hover:text-white dark:hover:bg-white/10'
                            }`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* System Menu */}
            <div className="px-3 mb-6">
                <div className="text-xs uppercase tracking-widest text-white/40 mb-3 px-3 font-bold">System</div>
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white mb-1"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {user.role === 'admin' && (
                    <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white mb-1">
                        <Settings size={20} />
                        <span>Platform Settings</span>
                    </button>
                )}

                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white mb-1">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            {/* User Logic */}
            <div className="mt-auto p-6 border-t border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#b8594d] rounded-full flex items-center justify-center font-bold text-white border-2 border-white/10">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-white/50">{user.label}</div>
                </div>
            </div>
        </aside>
    );
}
