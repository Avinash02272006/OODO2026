import { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, CheckCircle, Circle, PlayCircle, FileText, HelpCircle, Menu, X, Star, File, BookOpen, Check, LogOut, Search, Paperclip, Send, Sparkles, Bot, Zap, Copy, Clock, Share2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// BingoModal has been removed for a more professional assessment workflow.

// ----------------------------------------------------
// QUIZ ENGINE
// ----------------------------------------------------
// ----------------------------------------------------
// QUIZ ENGINE (PREMIUM)
// ----------------------------------------------------
function QuizPlayer({ quizId, onComplete }) {
    const mockQuiz = {
        title: "Knowledge Assessment",
        questions: [
            {
                text: "What is the primary function of a CRM system in a modern business architecture?",
                choices: [
                    { text: "Strategic management of customer lifecycles and insights", correct: true },
                    { text: "Predictive analysis of global stock market movements", correct: false },
                    { text: "Internal network latency optimization", correct: false },
                    { text: "Inventory restocking automation for retail", correct: false }
                ]
            },
            {
                text: "Which architectural module is responsible for algorithmic marketing triggers?",
                choices: [
                    { text: "Passive Inventory Tracking", correct: false },
                    { text: "Marketing & Behavioral Automation Engine", correct: true },
                    { text: "Point of Sale (Legacy) Module", correct: false }
                ]
            },
            {
                text: "In a Kanban-based CRM, how are sales pipeline stages visually optimized?",
                choices: [
                    { text: "Via complex SQL tables only", correct: false },
                    { text: "Dynamic drag-and-drop state transitions", correct: true },
                    { text: "Static text-based checklists", correct: false }
                ]
            }
        ]
    };

    const isMock = quizId === 'demo_quiz_1';
    const { data: apiQuiz, isLoading } = useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => api.get(`/quizzes/${quizId}`).then(res => res.data),
        enabled: !isMock
    });

    const activeQuiz = isMock ? mockQuiz : apiQuiz;
    const [currentQIndex, setCurrentQIndex] = useState(-1);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    if (isLoading && !isMock) return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse font-bold tracking-widest uppercase text-xs">Synchronizing Quiz Data...</div>;
    const questions = activeQuiz?.questions || [];

    const handleAnswer = (choiceIdx) => {
        setAnswers(prev => ({ ...prev, [currentQIndex]: choiceIdx }));
    };

    const handleSubmit = () => {
        let correctOnes = 0;
        questions.forEach((q, idx) => {
            const userChoice = answers[idx];
            const choices = q.choices || q.options || [];
            if (choices[userChoice]?.correct === true) {
                correctOnes++;
            }
        });
        const finalScore = Math.round((correctOnes / questions.length) * 100);
        setScore(finalScore);
    };

    const getQuestionText = (q) => q?.text || q?.question || q?.q || "Untitled Question";
    const getChoiceText = (c) => typeof c === 'string' ? c : (c?.text || c?.choice || c?.label || "Option");

    // Screen 1: The Modern Briefing
    if (currentQIndex === -1 && score === null) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-[#09090b]">
                <div className="max-w-md w-full bg-[#111114] border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                    <div className="relative space-y-8">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mx-auto">
                            <HelpCircle size={32} className="text-blue-500" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Assessment Overview</h3>
                            <p className="text-gray-400 text-sm">Verify your understanding of the module concepts.</p>
                        </div>

                        <div className="space-y-4 py-6 border-y border-white/5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-medium uppercase tracking-wider">Total Questions</span>
                                <span className="text-white font-bold">{questions.length} Units</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-medium uppercase tracking-wider">Passing Score</span>
                                <span className="text-blue-400 font-bold">80%</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentQIndex(0)}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95 text-sm"
                        >
                            Begin Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Screen 2: Professional Result Screen
    if (score !== null) {
        const isPassed = score >= 80;
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-[#09090b]">
                <div className="max-w-lg w-full bg-[#111114] border border-white/5 rounded-3xl p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 border ${isPassed ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-orange-500/20 bg-orange-500/5 text-orange-500'}`}>
                        {isPassed ? <CheckCircle size={40} /> : <Star size={40} />}
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isPassed ? 'Assessment Passed' : 'Assessment Complete'}
                    </h2>
                    <p className="text-gray-400 font-medium mb-10">You've achieved a score of <span className={isPassed ? 'text-green-500' : 'text-orange-500'}>{score}%</span>.</p>

                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-12">
                        <div className={`h-full transition-all duration-1000 ease-out ${isPassed ? 'bg-blue-600' : 'bg-orange-500'}`} style={{ width: `${score}%` }} />
                    </div>

                    <button
                        onClick={() => onComplete(score)}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                    >
                        Return to Course <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // Screen 3: The Challenge
    const question = questions[currentQIndex];
    const progress = ((currentQIndex + 1) / questions.length) * 100;

    return (
        <div className="h-full flex flex-col bg-[#09090b]">
            {/* Minimal Progress Bar */}
            <div className="w-full h-1 bg-white/5 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-16 flex flex-col items-center">
                <div className="max-w-3xl w-full space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                Question {currentQIndex + 1}
                            </span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>
                        <h3 className="text-3xl font-black text-white leading-tight tracking-tight">
                            {getQuestionText(question)}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(question.choices || question.options || []).map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`flex items-center gap-6 p-6 rounded-3xl border text-left transition-all duration-300 group
                                    ${answers[currentQIndex] === idx
                                        ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-950 scale-[1.02]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                            >
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all font-black text-xs
                                    ${answers[currentQIndex] === idx ? 'border-white bg-white text-blue-600' : 'border-gray-600 text-gray-400 group-hover:border-gray-400'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className={`text-lg transition-colors font-medium flex-1 ${answers[currentQIndex] === idx ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                    {getChoiceText(opt)}
                                </span>
                                {answers[currentQIndex] === idx && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                            </button>
                        ))}
                    </div>

                    <div className="pt-10 flex justify-between items-center border-t border-white/5">
                        <div className="text-[11px] text-gray-500 font-medium">Select the best answer to continue</div>
                        <button
                            onClick={() => {
                                if (currentQIndex < questions.length - 1) {
                                    setCurrentQIndex(prev => prev + 1);
                                } else {
                                    handleSubmit();
                                }
                            }}
                            disabled={answers[currentQIndex] === undefined}
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all active:scale-95 text-sm flex items-center gap-2 shadow-lg shadow-blue-500/10"
                        >
                            {currentQIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Question'} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// AI SUMMARY MODAL
// ----------------------------------------------------
function AiSummaryModal({ item, onClose }) {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Hello! I've analyzed "${item?.title}". How can I help you today?` }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const userMsg = prompt;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setPrompt('');
        setIsThinking(true);

        // Simulate AI Logic
        setTimeout(() => {
            const isWebSearchNeeded = userMsg.toLowerCase().includes('current') || userMsg.toLowerCase().includes('latest') || userMsg.toLowerCase().includes('price') || userMsg.toLowerCase().includes('who is');

            if (isWebSearchNeeded) {
                setIsSearchingWeb(true);
                setTimeout(() => {
                    setIsSearchingWeb(false);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        text: `I couldn't find that in the course materials, so I searched the web: Based on the latest online data, here's what I found related to "${userMsg}"...`,
                        source: 'web'
                    }]);
                    setIsThinking(false);
                }, 2000);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: `Based on the course content, ${userMsg.toLowerCase().includes('how') ? 'the recommended approach is to follow the established workflow outlined in the documentation.' : 'this concept is fundamental to the architecture discussed in this session.'}`
                }]);
                setIsThinking(false);
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
            <div className="w-full h-full flex flex-col bg-[#09090b] relative animate-in slide-in-from-bottom-5 duration-700">
                {/* Immersive Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#111114] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <Bot size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-white tracking-tight">AI Companion Workspace</h2>
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">Live</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Analyzed: {item?.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all text-xs font-medium border border-white/10 active:scale-95">
                            <LogOut size={14} /> Export
                        </button>
                        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all border border-white/10 active:scale-90">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative bg-[#09090b]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#09090b]">
                            <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin mb-4" />
                            <p className="text-gray-500 text-xs font-medium animate-pulse">Analyzing content...</p>
                        </div>
                    ) : (
                        <>
                            {/* Left Side: Summary & Insights */}
                            <div className="w-1/2 border-r border-white/5 flex flex-col">
                                <div className="flex border-b border-white/5 px-6 gap-6 shrink-0 bg-[#111114]">
                                    {['summary', 'keyPoints', 'insights', 'resources'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                                        >
                                            {tab === 'keyPoints' ? 'Highlights' : tab === 'insights' ? 'Context' : tab === 'resources' ? 'Files' : 'Summary'}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-dark text-gray-300 leading-relaxed text-sm space-y-6">
                                    {activeTab === 'summary' && (
                                        <div className="animate-in fade-in duration-500 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-white font-bold text-lg">Topic Summary</h4>
                                                <button className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5" onClick={() => navigator.clipboard.writeText(`Summary for ${item.title}`)}>
                                                    <Copy size={12} /> Copy
                                                </button>
                                            </div>
                                            <p className="text-gray-400 leading-relaxed">This module provides comprehensive coverage of <span className="text-white">"{item?.title}"</span>. The analysis highlights key architectural patterns and implementation strategies discussed in the session.</p>
                                        </div>
                                    )}
                                    {activeTab === 'keyPoints' && (
                                        <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                                            {[
                                                { t: "Strategic Alignment", d: "Connecting content goals with measurable outcomes." },
                                                { t: "Optimization Loops", d: "Iterative processes for continuous improvement." },
                                                { t: "Risk Mitigation", d: "Identifying potential bottlenecks in execution." }
                                            ].map((p, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                                                    <div className="text-purple-400 font-bold text-xs mb-1 uppercase tracking-tighter">Point #{i + 1}</div>
                                                    <div className="text-white font-bold text-sm mb-1">{p.t}</div>
                                                    <div className="text-gray-500 text-xs">{p.d}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === 'resources' && (
                                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                            <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-4">Extracted Materials</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:border-blue-500/30">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><FileText size={20} /></div>
                                                    <div className="flex-1">
                                                        <div className="text-white font-bold text-xs">Technical Index.pdf</div>
                                                        <div className="text-[10px] text-gray-500">2.4 MB • Full Transcript</div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-700 font-bold" />
                                                </div>
                                                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:border-green-500/30">
                                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400"><Paperclip size={20} /></div>
                                                    <div className="flex-1">
                                                        <div className="text-white font-bold text-xs">Dataset Schema.xlsx</div>
                                                        <div className="text-[10px] text-gray-500">1.1 MB • Reference Table</div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-700 font-bold" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'insights' && (
                                        <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                                                <h5 className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-4">Contextual Intelligence</h5>
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-1 bg-blue-500 rounded-full shrink-0" />
                                                        <div>
                                                            <div className="text-white font-bold text-xs mb-1">Concept Saturation</div>
                                                            <div className="text-gray-500 text-[11px]">This lesson has a high density of new terminology. I recommend slowing down the playback during the second half.</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="w-1 bg-purple-500 rounded-full shrink-0" />
                                                        <div>
                                                            <div className="text-white font-bold text-xs mb-1">Prerequisite Link</div>
                                                            <div className="text-gray-500 text-[11px]">Directly builds upon the "Architecture Fundamentals" module from earlier.</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Chat System */}
                            <div className="w-1/2 flex flex-col bg-[#0d0d0d]">
                                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ask a Question</span>
                                    {isSearchingWeb && (
                                        <div className="flex items-center gap-2 animate-pulse text-blue-400">
                                            <Search size={12} />
                                            <span className="text-[10px] font-bold uppercase">Searching Web...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-dark scroll-smooth">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-tr-none'
                                                : msg.source === 'web'
                                                    ? 'bg-blue-500/10 border border-blue-500/20 text-gray-200 rounded-tl-none'
                                                    : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                                                }`}>
                                                {msg.role === 'assistant' && msg.source === 'web' && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest">
                                                        <Search size={10} /> Web Source
                                                    </div>
                                                )}
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && !isSearchingWeb && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-white/10 shrink-0">
                                    <form onSubmit={handleSend} className="relative">
                                        <input
                                            type="text"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Ask anything about this content..."
                                            className="w-full bg-[#151515] border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all pr-12 placeholder-gray-600"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"
                                            disabled={isThinking}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </form>
                                    <p className="text-[10px] text-gray-600 mt-3 text-center">
                                        Tip: Ask for <span className="text-gray-400">"latest data"</span> to trigger a web search.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// MAIN COURSE PLAYER
// ----------------------------------------------------
export default function CoursePlayer({ courseId, user, onBack }) {
    const [activeItem, setActiveItem] = useState(null); // { type: 'lesson'|'quiz', id: ... }, null = Show Overview
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'player'
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews'
    const [itemStatus, setItemStatus] = useState({}); // Track completion locally
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showAiSummary, setShowAiSummary] = useState(false);

    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const queryClient = useQueryClient();

    // Fetch Course & Lessons
    const { data: course, isLoading, refetch: refetchCourse } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.get(`/courses/${courseId}`).then(res => res.data)
    });

    const finishLessonMutation = useMutation({
        mutationFn: (lessonId) => api.post(`/lessons/${lessonId}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries(['course', courseId]);
            queryClient.invalidateQueries(['user-profile']);
            // Refetch course to get updated progressMap if server returns it
            refetchCourse();
        }
    });

    const submitReviewMutation = useMutation({
        mutationFn: (reviewData) => api.post(`/courses/${courseId}/reviews`, reviewData),
        onSuccess: () => {
            queryClient.invalidateQueries(['course', courseId]);
            setReviewText('');
            setReviewRating(5);
            alert("Review submitted successfully!");
        }
    });

    const isGuest = !user || user.role === 'guest';

    // Combine Lessons and Quizzes into a linear "Playlist" and inject mock examples of attachments
    const playlist = course ? [
        ...(course.lessons || []).map(l => ({
            ...l,
            category: l.type || l.category, // Normalize
            itemType: 'lesson',
            attachmentText: (l.type === 'document' || l.category === 'document' || l.allowDownload) ? 'Resource Available' : (l.type === 'video' ? 'Transcript' : null)
        })),
        ...(course.quizzes || []).map(q => ({ ...q, itemType: 'quiz', duration: q.duration || '15 min' }))
    ] : [];

    // DEBUG: Force add a Mock Quiz for demonstration if none exists or to ensure visibility
    if (course) {
        playlist.push({
            id: 'demo_quiz_1',
            title: 'Final Knowledge Check (Demo)',
            itemType: 'quiz',
            duration: '10 min',
            description: "A quick assessment to test your understanding of the core concepts covered in this module."
        });
    }

    // Use real progress from course data if available
    const progressMap = course?.progressMap || {};
    const totalCount = playlist.length;
    const completedCount = Object.keys(progressMap).filter(k => progressMap[k]).length;
    const progressPercent = Math.round((completedCount / totalCount) * 100) || 0;

    const handlePlayItem = (item) => {
        setActiveItem(item);
        setViewMode('player');
    };

    const handleBackToOverview = () => {
        setActiveItem(null);
        setViewMode('overview');
    };

    const handleItemComplete = async () => {
        if (activeItem && activeItem.type === 'lesson') {
            await finishLessonMutation.mutateAsync(activeItem.id);
        }

        const idx = playlist.findIndex(i => i.id === activeItem?.id && i.itemType === activeItem?.itemType);
        if (idx < playlist.length - 1) {
            const next = playlist[idx + 1];
            setActiveItem({ type: next.itemType, id: next.id });
        } else {
            handleBackToOverview();
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse bg-[#0f172a]">Loading...</div>;
    if (!course) return <div className="h-screen flex items-center justify-center text-red-500 font-bold text-xl bg-[#0f172a]">Course not found</div>;

    // -----------------------------------------------
    // VIEW: PLAYER (Sidebar + Content)
    // -----------------------------------------------
    if (viewMode === 'player' && activeItem) {
        const currentItem = playlist.find(i => i.id === activeItem.id && i.itemType === activeItem.type) || playlist[0];

        return (
            <div className="h-screen flex bg-[#09090b] text-white overflow-hidden relative font-sans">
                {showAiSummary && <AiSummaryModal item={currentItem || { title: course.title, description: course.description }} onClose={() => setShowAiSummary(false)} />}

                {/* 1. Professional Sidebar */}
                <aside className={`${sidebarOpen ? 'w-[320px]' : 'w-0'} bg-[#111114] border-r border-white/5 shrink-0 transition-all duration-300 flex flex-col relative z-20`}>
                    <div className="p-6 border-b border-white/5 space-y-6">
                        <button onClick={handleBackToOverview} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider group">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Hub
                        </button>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white line-clamp-2 leading-tight tracking-tight">{course.title}</h2>

                            {/* Progress Indicator */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Completion</span>
                                    <span className="text-white">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar-dark">
                        <p className="px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Course Content</p>
                        <div className="space-y-0.5">
                            {playlist.map((item, index) => {
                                const isActive = currentItem.id === item.id && currentItem.itemType === item.itemType;
                                const isCompleted = progressMap[item.id] === true;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handlePlayItem(item)}
                                        className={`w-full px-6 py-4 flex items-center gap-4 text-left transition-colors relative
                                            ${isActive ? 'bg-blue-600/10 border-r-2 border-blue-600' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        <div className="shrink-0">
                                            {isCompleted ? (
                                                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                                    <Check size={12} className="text-green-500" />
                                                </div>
                                            ) : (
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-blue-500' : 'border-white/10'}`}>
                                                    {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                                                    {item.itemType === 'quiz' ? 'Quiz' : 'Lesson'}
                                                </span>
                                            </div>
                                            <h4 className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                {item.title}
                                            </h4>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                </aside>

                {/* 2. Main Content Area */}
                <main className="flex-1 flex flex-col relative h-full bg-[#09090b] overflow-hidden">
                    {/* Simplified Header */}
                    <header className="px-10 py-6 flex items-center justify-between border-b border-white/5 bg-[#111114]/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Toggle Sidebar"
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{currentItem.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                                        <Clock size={12} />
                                        <span>{currentItem.duration || 'Session'}</span>
                                    </div>
                                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                                    <p className="text-[10px] text-gray-500 font-medium italic truncate max-w-md">
                                        {currentItem.description || "Synthesizing complex architectural patterns for modern CRM infrastructures."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentItem.allowDownload && (
                                <a
                                    href={currentItem.contentUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white text-xs font-bold rounded-lg transition-all border border-green-500/20 active:scale-95"
                                >
                                    <Download size={14} />
                                    <span>Download Resource</span>
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Course link copied to clipboard!');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all border border-white/10 active:scale-95"
                            >
                                <Share2 size={14} className="text-gray-400" />
                                <span>Share</span>
                            </button>
                            <button
                                onClick={() => setShowAiSummary(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-500/10 active:scale-95 border border-white/10"
                            >
                                <Sparkles size={14} className="text-blue-200" />
                                <span>AI Companion</span>
                            </button>
                        </div>
                    </header>

                    {/* Content Viewer */}
                    <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center custom-scrollbar-dark">
                        <div className="w-full max-w-5xl h-full min-h-[500px] bg-[#111114] border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
                            {currentItem.itemType === 'quiz' ? (
                                <QuizPlayer quizId={currentItem.id} onComplete={handleItemComplete} />
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 flex items-center justify-center p-8">
                                        {(currentItem.category === 'video' || currentItem.type === 'video') && (
                                            <div className="w-full aspect-video bg-black rounded-xl border border-white/5 flex items-center justify-center relative group">
                                                <PlayCircle size={64} className="text-white/20 group-hover:text-blue-500 transition-all cursor-pointer group-hover:scale-110" />
                                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                                    <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Sample Video Playback Mode</p>
                                                </div>
                                            </div>
                                        )}
                                        {(currentItem.category === 'document' || currentItem.type === 'document') && (
                                            <div className="w-full h-full flex bg-[#0d0d0d]">
                                                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar-dark relative">
                                                    <div className="max-w-2xl mx-auto space-y-8">
                                                        <h1 className="text-3xl font-bold text-white tracking-tight">{currentItem.title}</h1>
                                                        <div className="text-gray-400 text-lg leading-relaxed space-y-6 font-serif">
                                                            <p className="relative group cursor-text selection:bg-blue-500/30">
                                                                This module explores the critical intersection between architectural design and professional implementation workflows. Understanding these patterns is essential for building scalable, maintainable systems.
                                                                <button
                                                                    onClick={() => setShowAiSummary(true)}
                                                                    className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-600 rounded-lg text-white shadow-lg"
                                                                    title="Ask AI about this"
                                                                >
                                                                    <Bot size={16} />
                                                                </button>
                                                            </p>
                                                            <p className="text-gray-500 text-base">Key takeaway: Modularization is not just a technique, but a philosophy of design that ensures long-term viability.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notes Sidebar */}
                                                <div className="w-72 border-l border-white/5 flex flex-col bg-[#09090b]">
                                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Personal Notes</h5>
                                                        <FileText size={14} className="text-gray-700" />
                                                    </div>
                                                    <div className="flex-1 p-6 space-y-6">
                                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                            <textarea
                                                                placeholder="Add a thought..."
                                                                className="w-full bg-transparent border-none p-0 text-xs text-gray-300 placeholder-gray-700 resize-none h-32 focus:ring-0"
                                                            />
                                                        </div>
                                                        <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-blue-500/20">
                                                            Save to Cloud
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(currentItem.category === 'image' || currentItem.type === 'image') && (
                                            <img src={currentItem.contentUrl || currentItem.content_url} className="w-full h-full object-contain" alt="Content" />
                                        )}
                                    </div>

                                    {currentItem.itemType !== 'quiz' && (
                                        <div className="mt-auto border-t border-white/5 p-6 flex justify-end bg-[#111114]">
                                            <button
                                                onClick={handleItemComplete}
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all text-xs tracking-wide active:scale-95"
                                            >
                                                Mark as Complete <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // -----------------------------------------------
    // VIEW: OVERVIEW
    // -----------------------------------------------
    // -----------------------------------------------
    // VIEW: OVERVIEW
    // -----------------------------------------------
    return (
        <div className="min-h-screen bg-[#09090b] font-sans text-white overflow-y-auto custom-scrollbar-dark flex flex-col relative">
            {showAiSummary && <AiSummaryModal item={activeItem ? playlist.find(i => i.id === activeItem.id) : { title: course.title, description: course.description }} onClose={() => setShowAiSummary(false)} />}

            {/* Professional Header */}
            <header className="h-16 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
                <div
                    onClick={onBack}
                    className="font-bold text-xl tracking-tight text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Star size={18} className="text-white fill-white" />
                    </div>
                    LearnSphere
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-white">{isGuest ? 'Guest User' : user?.name}</div>
                        {!isGuest && <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Student Tier</div>}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-xl border border-white/10
                            ${isGuest ? 'bg-gray-800' : 'bg-blue-600'}`}>
                        {isGuest ? 'G' : user?.name?.charAt(0)}
                    </div>
                </div>
            </header>

            {/* Immersive Hero Section */}
            <div className="relative h-[460px] w-full shrink-0">
                <div className="absolute inset-0">
                    <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80'} className="w-full h-full object-cover opacity-40 grayscale-[0.5]" alt="Cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
                </div>

                <div className="absolute inset-0 p-12 flex flex-col justify-end max-w-7xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row gap-10 items-end relative">
                        <div className="w-56 h-56 rounded-2xl overflow-hidden border-4 border-white/5 shadow-2xl shrink-0 bg-[#111114]">
                            <img src={course.image} className="w-full h-full object-cover" alt="Thumbnail" />
                        </div>

                        <div className="flex-1 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">Mastery Course</span>
                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="text-xs text-gray-500 font-medium">Ver 2.4</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-none">{course.title}</h1>
                            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed font-medium">{course.description || "Master the fundamentals of this topic with our comprehensive course modules."}</p>
                        </div>

                        <div className="bg-[#111114]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl w-full md:w-80 shadow-2xl shrink-0">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-3xl font-bold text-white tabular-nums">{progressPercent}%</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Progress</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-8">
                                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
                                    <div className="text-lg font-bold text-white">{totalCount}</div>
                                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">Units</div>
                                </div>
                                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
                                    <div className="text-lg font-bold text-green-500">{completedCount}</div>
                                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">Done</div>
                                </div>
                                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
                                    <div className="text-lg font-bold text-blue-400">{totalCount - completedCount}</div>
                                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">Left</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Hub */}
            <div className="max-w-7xl mx-auto w-full p-12 mb-20">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors text-xs font-bold uppercase tracking-widest group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard Overview
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 mb-10 gap-6">
                    <div className="flex items-center gap-10">
                        <nav className="flex gap-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-6 border-b-2 font-bold text-xs uppercase tracking-widest transition-all relative ${activeTab === 'overview' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                Curriculum Hub
                                {activeTab === 'overview' && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`pb-6 border-b-2 font-bold text-xs uppercase tracking-widest transition-all relative ${activeTab === 'reviews' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                Community Feedback
                                {activeTab === 'reviews' && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                            </button>
                        </nav>

                        <button
                            onClick={() => setShowAiSummary(true)}
                            className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-600/20 transition-all group"
                        >
                            <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
                            Analyze Syllabus
                        </button>
                    </div>

                    <div className="relative group mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find specific lesson..."
                            className="bg-[#111114] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all w-72 placeholder-gray-600 font-medium"
                        />
                    </div>
                </div>

                {/* OVERVIEW TAB CONTENT */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center gap-6 mb-8">
                            <h3 className="text-xl font-bold text-white tracking-tight">{totalCount} Architectural Units</h3>
                            <div className="flex-1 border-b border-white/5 h-px"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {playlist.map((item, index) => {
                                const isCompleted = progressMap[item.id] === true;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handlePlayItem(item)}
                                        className="group flex items-center justify-between p-6 bg-[#111114] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-[#16161a] transition-all text-left shadow-lg"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-10 h-10 flex items-center justify-center text-gray-600 font-bold text-sm bg-white/5 rounded-xl group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded border ${isCompleted ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                                        {item.itemType === 'quiz' ? 'Assessment' : item.category || 'Unit'}
                                                    </span>
                                                    {item.duration && <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.duration}</span>}
                                                </div>
                                                <h4 className={`text-lg font-bold transition-colors ${isCompleted ? 'text-gray-500' : 'text-white group-hover:text-blue-400'}`}>
                                                    {item.title}
                                                </h4>
                                                {item.attachmentText && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-blue-500/60 font-medium mt-1.5">
                                                        <Paperclip size={10} /> {item.attachmentText}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {isCompleted ? (
                                                <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                                                    <Check size={20} />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border-2 border-white/5 flex items-center justify-center text-gray-700 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                                                    <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* REVIEWS TAB CONTENT */}
                {activeTab === 'reviews' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                        {/* Rating Header */}
                        <div className="flex items-center gap-16 mb-16 p-10 bg-[#111114] border border-white/5 rounded-3xl">
                            <div className="text-8xl font-bold text-white leading-none tracking-tighter">4.5</div>
                            <div className="space-y-4 flex-1">
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4].map(i => <Star key={i} size={28} className="fill-blue-500 text-blue-500" />)}
                                    <Star size={28} className="fill-blue-500/30 text-blue-500/30" />
                                </div>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em]">Verified Student Rating</p>
                            </div>
                            <button
                                onClick={() => {
                                    document.getElementById('review-input-area')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all shadow-xl active:scale-95"
                            >
                                Submit Feedback
                            </button>
                        </div>

                        <div id="review-input-area" className="flex gap-8 mb-16">
                            <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center font-bold text-white shadow-xl border border-white/10 bg-blue-600`}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 space-y-4">
                                <h5 className="text-xs text-gray-500 font-bold uppercase tracking-widest">Contribute to the collective</h5>
                                <div className="border border-white/5 rounded-2xl bg-[#111114] p-6 focus-within:border-blue-500/30 transition-all">
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="What are your thoughts on this curriculum?"
                                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-700 resize-none h-28 text-sm"
                                    />
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    onClick={() => setReviewRating(i)}
                                                    className={`${reviewRating >= i ? 'text-blue-500 fill-blue-500' : 'text-gray-700'} hover:text-blue-500 cursor-pointer transition-colors`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (!reviewText.trim()) return;
                                                submitReviewMutation.mutate({ text: reviewText, rating: reviewRating });
                                            }}
                                            disabled={submitReviewMutation.isPending}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            {submitReviewMutation.isPending ? 'Posting...' : 'Post Review'} <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-12">
                            {(course.reviews || []).length === 0 && (
                                <p className="text-center text-gray-500 py-10 italic">No reviews yet. Be the first to share your experience!</p>
                            )}
                            {(course.reviews || []).map((review) => (
                                <div key={review.id} className="flex gap-8 group">
                                    <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center font-bold text-white shadow-lg border border-white/10 bg-gray-800 group-hover:bg-gray-700 transition-colors`}>
                                        {review.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h6 className="text-sm font-bold text-white">{review.user?.name}</h6>
                                            <span className="text-[10px] text-gray-600 font-bold italic">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    className={`${review.rating > i ? 'fill-blue-500 text-blue-500' : 'text-gray-700'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-400 leading-relaxed text-sm bg-white/[0.02] border border-white/5 p-6 rounded-2xl group-hover:bg-white/[0.04] transition-colors">
                                            {review.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
