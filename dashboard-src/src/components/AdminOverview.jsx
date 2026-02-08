import { useState } from 'react';
import {
    Users, Clock, PlayCircle, CheckCircle, ChevronDown, ListFilter,
    Search, MoreHorizontal, ArrowUpDown
} from 'lucide-react';

export default function AdminOverview() {
    // ----------------------------------------------------
    // STATE
    // ----------------------------------------------------
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'yet_to_start', 'in_progress', 'completed'
    const [columnMenuOpen, setColumnMenuOpen] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        sno: true,
        courseName: true,
        participant: true,
        enrolledDate: true,
        startDate: true,
        timeSpent: true,
        completion: true,
        completedDate: true,
        status: true,
    });

    const toggleColumn = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));

    // Mock Data
    const allUsers = [
        { id: 1, course: 'Basics of Odoo CRM', participant: 'Salman Khan', enrolled: 'Feb 14, 2026', start: 'Feb 16, 2026', time: '2:20', completion: 30, completedDate: '-', status: 'In Progress' },
        { id: 2, course: 'Advanced Sales', participant: 'John Doe', enrolled: 'Feb 10, 2026', start: '-', time: '0:00', completion: 0, completedDate: '-', status: 'Yet to Start' },
        { id: 3, course: 'Inventory Management', participant: 'Jane Smith', enrolled: 'Feb 12, 2026', start: 'Feb 13, 2026', time: '5:45', completion: 100, completedDate: 'Feb 20, 2026', status: 'Completed' },
        { id: 4, course: 'Basics of Odoo CRM', participant: 'Alice Brown', enrolled: 'Feb 15, 2026', start: 'Feb 17, 2026', time: '1:10', completion: 45, completedDate: '-', status: 'In Progress' },
        { id: 5, course: 'Website Builder', participant: 'Bob White', enrolled: 'Feb 01, 2026', start: '-', time: '0:00', completion: 0, completedDate: '-', status: 'Yet to Start' },
        { id: 6, course: 'Accounting 101', participant: 'Charlie Green', enrolled: 'Jan 20, 2026', start: '-', time: '0:00', completion: 0, completedDate: '-', status: 'Yet to Start' },
        { id: 7, course: 'HR Management', participant: 'Diana Prince', enrolled: 'Feb 05, 2026', start: '-', time: '0:00', completion: 0, completedDate: '-', status: 'Yet to Start' },
        { id: 8, course: 'Project Management', participant: 'Evan Wright', enrolled: 'Feb 11, 2026', start: '-', time: '0:00', completion: 0, completedDate: '-', status: 'Yet to Start' },
    ];

    // Filter Logic
    const filteredUsers = allUsers.filter(user => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'yet_to_start') return user.status === 'Yet to Start';
        if (activeFilter === 'in_progress') return user.status === 'In Progress';
        if (activeFilter === 'completed') return user.status === 'Completed';
        return true;
    });

    // Counts
    const counts = {
        all: allUsers.length,
        yet_to_start: allUsers.filter(u => u.status === 'Yet to Start').length,
        in_progress: allUsers.filter(u => u.status === 'In Progress').length,
        completed: allUsers.filter(u => u.status === 'Completed').length,
    };

    // ----------------------------------------------------
    // COMPONENT RENDER
    // ----------------------------------------------------
    return (
        <div className="p-8 h-full overflow-y-auto font-sans text-text-main bg-bg-body custom-scrollbar">
            {/* 1. OVERVIEW CARDS */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-6 text-text-main border-l-4 border-primary pl-3">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Card 1: Total Participants */}
                    <Card
                        icon={Users}
                        count={counts.all}
                        label="Total Participants"
                        active={activeFilter === 'all'}
                        onClick={() => setActiveFilter('all')}
                        color="text-blue-500" // Icon color
                    />
                    {/* Card 2: Yet to Start */}
                    <Card
                        icon={Clock}
                        count={counts.yet_to_start}
                        label="Yet to Start"
                        active={activeFilter === 'yet_to_start'}
                        onClick={() => setActiveFilter('yet_to_start')}
                        color="text-orange-400"
                    />
                    {/* Card 3: In Progress */}
                    <Card
                        icon={PlayCircle}
                        count={counts.in_progress}
                        label="In Progress"
                        active={activeFilter === 'in_progress'}
                        onClick={() => setActiveFilter('in_progress')}
                        color="text-yellow-500"
                    />
                    {/* Card 4: Completed */}
                    <Card
                        icon={CheckCircle}
                        count={counts.completed}
                        label="Completed"
                        active={activeFilter === 'completed'}
                        onClick={() => setActiveFilter('completed')}
                        color="text-[#10b981]"
                    />
                </div>
                <p className="text-xs text-center text-text-secondary mt-4 italic">
                    By clicking on cards show the related data/reports in the given column below
                </p>
            </div>

            {/* 2. USERS TABLE SECTION */}
            <div className="bg-bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
                {/* Table Header / Toolbar */}
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Users</span>
                        <h3 className="text-lg font-bold text-text-main">
                            {activeFilter === 'all' ? 'All Participants' :
                                activeFilter === 'yet_to_start' ? 'Participants Yet to Start' :
                                    activeFilter === 'in_progress' ? 'Participants In Progress' : 'Completed Participants'}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {/* Column Customizer */}
                        <div className="relative">
                            <button
                                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-bg-body border border-border rounded-lg text-sm font-medium text-text-secondary hover:text-text-main transition-colors"
                            >
                                <ListFilter size={16} />
                                Customizable table
                                <ChevronDown size={14} />
                            </button>

                            {/* Popover Menu */}
                            {columnMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setColumnMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-bg-surface shadow-2xl z-20 border border-border rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3 pb-2 border-b border-border">
                                            Pick columns to show/hide
                                        </div>
                                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            {Object.keys(visibleColumns).map((key) => (
                                                <label key={key} className="flex items-center gap-3 cursor-pointer group hover:bg-bg-body p-2 rounded-lg transition-colors">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${visibleColumns[key] ? 'bg-primary border-primary' : 'border-text-secondary'}`}>
                                                        {visibleColumns[key] && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-text-secondary group-hover:text-text-main capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={visibleColumns[key]}
                                                        onChange={() => toggleColumn(key)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-body border-b border-border text-xs uppercase tracking-wider text-text-secondary font-semibold">
                                {visibleColumns.sno && <th className="px-6 py-4">S.No.</th>}
                                {visibleColumns.courseName && <th className="px-6 py-4">Course Name</th>}
                                {visibleColumns.participant && <th className="px-6 py-4">Participant name</th>}
                                {visibleColumns.enrolledDate && <th className="px-6 py-4">Enrolled Date</th>}
                                {visibleColumns.startDate && <th className="px-6 py-4">Start data</th>}
                                {visibleColumns.timeSpent && <th className="px-6 py-4">Time spent</th>}
                                {visibleColumns.completion && <th className="px-6 py-4">Completion %</th>}
                                {visibleColumns.completedDate && <th className="px-6 py-4">Completed date</th>}
                                {visibleColumns.status && <th className="px-6 py-4">Status</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, idx) => (
                                    <tr key={user.id} className="hover:bg-bg-body transition-colors group">
                                        {visibleColumns.sno && <td className="px-6 py-4 font-mono text-text-secondary">{idx + 1}</td>}
                                        {visibleColumns.courseName && <td className="px-6 py-4 font-bold text-text-main">{user.course}</td>}
                                        {visibleColumns.participant && (
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-primary hover:underline cursor-pointer">{user.participant}</div>
                                            </td>
                                        )}
                                        {visibleColumns.enrolledDate && <td className="px-6 py-4 text-text-secondary text-sm">{user.enrolled}</td>}
                                        {visibleColumns.startDate && <td className="px-6 py-4 text-text-secondary text-sm">{user.start}</td>}
                                        {visibleColumns.timeSpent && <td className="px-6 py-4 font-mono text-text-secondary text-sm">{user.time}</td>}
                                        {visibleColumns.completion && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-bg-body border border-border rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${user.completion === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${user.completion}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-text-main">{user.completion}%</span>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.completedDate && <td className="px-6 py-4 text-text-secondary text-sm">{user.completedDate}</td>}
                                        {visibleColumns.status && (
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${user.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                                        user.status === 'In Progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center text-text-secondary">
                                        No participants found matching this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                    <div>Showing {filteredUsers.length} of {allUsers.length} entries</div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-bg-body border border-border rounded hover:bg-border text-text-main transition-colors">Previous</button>
                        <button className="px-3 py-1 bg-bg-body border border-border rounded hover:bg-border text-text-main transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------

function Card({ icon: Icon, count, label, active, onClick, color }) {
    return (
        <button
            onClick={onClick}
            className={`relative p-6 rounded-2xl border transition-all duration-300 w-full text-center group overflow-hidden
                ${active
                    ? 'bg-text-main border-text-main text-bg-body shadow-xl scale-105'
                    : 'bg-bg-surface border-dashed border-border hover:border-text-secondary hover:bg-bg-body text-text-secondary'
                }`}
        >
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors
                 ${active ? 'bg-bg-surface/20 text-bg-body' : 'bg-bg-body ' + color}`}>
                <Icon size={24} strokeWidth={2} />
            </div>

            <div className={`text-3xl font-black mb-1 ${active ? 'text-bg-body' : 'text-text-main'}`}>
                {count}
            </div>

            <div className={`text-sm font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-text-secondary'}`}>
                {label}
            </div>

            {/* Selection Indicator */}
            {active && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#b8594d]"></div>
                </div>
            )}
            {/* Interaction Line */}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            )}
        </button>
    );
}
