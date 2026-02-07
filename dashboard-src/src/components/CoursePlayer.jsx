import { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, CheckCircle, Circle, PlayCircle, FileText, HelpCircle, Menu, X, Star, File
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// ----------------------------------------------------
// QUIZ ENGINE
// ----------------------------------------------------
function QuizPlayer({ quizId, onComplete }) {
    const { data: quiz, isLoading } = useQuery(['quiz', quizId], () => api.get(`/quizzes/${quizId}`).then(res => res.data));

    const [currentQIndex, setCurrentQIndex] = useState(-1);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    // If loading
    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Quiz...</div>;
    if (!quiz) return <div className="p-8 text-center text-red-500">Quiz not found</div>;

    const questions = quiz.questions || [];

    const handleStart = () => setCurrentQIndex(0);

    const handleAnswer = (optionIndex) => {
        setAnswers(prev => ({ ...prev, [currentQIndex]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            // q.choices[answers[idx]].correct
            const selectedChoice = q.choices[answers[idx]];
            if (selectedChoice && selectedChoice.correct) correctCount++;
        });
        const finalScore = Math.round((correctCount / questions.length) * 100);
        setScore(finalScore);

        // Call onComplete (could post score to backend here if endpoint existed)
        onComplete(finalScore);
    };

    // 1. Start Screen
    if (currentQIndex === -1 && score === null) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-2xl border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50/50">
                    <HelpCircle size={48} className="mx-auto text-[#b8594d] mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">{quiz.title}</h2>
                    <div className="flex flex-col gap-2 text-gray-500 mb-8 font-medium">
                        <p>{questions.length} Questions</p>
                        <p>Win points and badges!</p>
                    </div>
                    <button onClick={handleStart} className="px-8 py-3 bg-[#b8594d] text-white font-bold rounded-full hover:bg-[#a04e43] shadow-lg shadow-[#b8594d]/30 hover:scale-105 transition-all">
                        Start Quiz
                    </button>
                </div>
            </div>
        );
    }

    // 2. Result Screen
    if (score !== null) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white shadow-xl rounded-2xl p-12 max-w-md w-full border border-gray-100">
                    <div className="text-6xl mb-4">{score >= 70 ? '🎉' : '📚'}</div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">You Scored {score}%</h2>
                    <p className="text-gray-500 mb-8">{score >= 70 ? 'Great job! You passed.' : 'Keep practicing to drive it home.'}</p>
                    <button onClick={() => onComplete(score)} className="w-full py-3 bg-[#1a1614] text-white font-bold rounded-lg hover:bg-black transition-colors">
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // 3. Question Interface
    const question = questions[currentQIndex];
    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 animate-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">
                    <span>Question {currentQIndex + 1} of {questions.length}</span>
                    <span>{Math.round(((currentQIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#b8594d] rounded-full transition-all duration-300 ease-out" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-[#1a1614] mb-8">{question.text}</h3>

            <div className="space-y-4 mb-10">
                {question.choices.map((opt, idx) => (
                    <label key={idx} className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQIndex] === idx ? 'border-[#b8594d] bg-[#b8594d]/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                        <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${answers[currentQIndex] === idx ? 'border-[#b8594d]' : 'border-gray-300'}`}>
                            {answers[currentQIndex] === idx && <div className="w-3 h-3 bg-[#b8594d] rounded-full" />}
                        </div>
                        <span className="font-medium text-lg text-gray-700">{opt.text}</span>
                        <input type="radio" name="option" className="hidden" onChange={() => handleAnswer(idx)} checked={answers[currentQIndex] === idx} />
                    </label>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={answers[currentQIndex] === undefined}
                    className="px-8 py-3 bg-[#1a1614] text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors flex items-center gap-2"
                >
                    {currentQIndex === questions.length - 1 ? 'Submit Results' : 'Next Question'} <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// MAIN COURSE PLAYER
// ----------------------------------------------------
export default function CoursePlayer({ courseId, onBack }) {
    const [activeItem, setActiveItem] = useState(null); // { type: 'lesson'|'quiz', id: ... }, null = first item
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('content'); // 'content' | 'reviews'

    // Fetch Course & Lessons
    const { data: course, isLoading } = useQuery(['course', courseId], () => api.get(`/courses/${courseId}`).then(res => res.data));

    if (isLoading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading Course...</div>;
    if (!course) return <div className="h-screen flex items-center justify-center text-red-500">Course not found</div>;

    // Combine Lessons and Quizzes into a linear "Playlist"
    // Ideally backend gives order. For now: Lessons then Quizzes.
    const playlist = [
        ...(course.lessons || []).map(l => ({ ...l, itemType: 'lesson' })),
        ...(course.quizzes || []).map(q => ({ ...q, itemType: 'quiz', duration: '15 min' })) // Mock duration for quiz
    ];

    const currentItem = activeItem
        ? playlist.find(i => i.id === activeItem.id && i.itemType === activeItem.type)
        : playlist[0];

    const handleItemComplete = () => {
        // Find next
        const idx = playlist.findIndex(i => i.id === currentItem.id && i.itemType === currentItem.itemType);
        if (idx < playlist.length - 1) {
            const next = playlist[idx + 1];
            setActiveItem({ type: next.itemType, id: next.id });
        } else {
            alert("Course Completed!");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-[#1a1614]">

            {/* SIDEBAR NAVIGATION */}
            <aside className={`${sidebarOpen ? 'w-[350px]' : 'w-0'} bg-[#1a1614] text-white transition-all duration-300 flex flex-col shrink-0 relative border-r border-gray-800`}>
                <div className="p-6 border-b border-gray-800">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wider mb-6 transition-colors">
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                    <h2 className="text-xl font-bold leading-tight mb-4">{course.title}</h2>

                    {/* Progress Bar */}
                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                        <span>Course Progress</span>
                        <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#b8594d] h-full w-[0%]"></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {playlist.map((item, idx) => {
                        const isActive = currentItem?.id === item.id && currentItem?.itemType === item.itemType;
                        return (
                            <button
                                key={`${item.itemType}-${item.id}`}
                                onClick={() => setActiveItem({ type: item.itemType, id: item.id })}
                                className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group
                                    ${isActive ? 'bg-[#b8594d] text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'}
                                `}
                            >
                                <div className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                    <Circle size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] opacity-70 uppercase tracking-wider">
                                        {item.itemType === 'quiz' ? <HelpCircle size={10} /> : (
                                            <>
                                                {item.category === 'video' && <PlayCircle size={10} />}
                                                {item.category === 'document' && <FileText size={10} />}
                                                {item.category === 'image' && <File size={10} />}
                                            </>
                                        )}
                                        <span>{item.duration || '00:00'}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full bg-white relative">
                {/* Top Bar */}
                <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                            <Menu size={20} />
                        </button>
                        <h3 className="font-bold text-lg text-gray-800">{currentItem?.title}</h3>
                    </div>
                    <div className="flex gap-4">
                        <button
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'reviews' ? 'text-[#b8594d] border-b-2 border-[#b8594d]' : 'text-gray-500 hover:text-[#1a1614]'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Ratings & Reviews
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'content' ? 'text-[#b8594d] border-b-2 border-[#b8594d]' : 'text-gray-500 hover:text-[#1a1614]'}`}
                            onClick={() => setActiveTab('content')}
                        >
                            Course Overview
                        </button>
                        {currentItem?.itemType !== 'quiz' && activeTab === 'content' && (
                            <button onClick={handleItemComplete} className="ml-4 px-5 py-2 text-sm font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 flex items-center gap-2">
                                Mark Complete <CheckCircle size={16} />
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-50 relative">
                    <div className="max-w-5xl mx-auto h-full p-8 flex flex-col">

                        {activeTab === 'content' ? (
                            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col">
                                {/* CONTENT RENDERER */}
                                {currentItem?.itemType === 'lesson' && (
                                    <>
                                        {currentItem.category === 'video' && (
                                            <div className="w-full h-full bg-black flex items-center justify-center text-white relative group">
                                                {currentItem.content_url && currentItem.content_url.includes('http') ? (
                                                    <div className="text-center">
                                                        <a href={currentItem.content_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center hover:text-[#b8594d] transition-colors">
                                                            <PlayCircle size={80} className="mb-4 text-[#b8594d] opacity-90 group-hover:scale-110 transition-transform" />
                                                            <span className="font-bold text-lg">Watch Externally</span>
                                                            <span className="text-sm text-gray-500 mt-2">{currentItem.content_url}</span>
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                                                        <p className="text-gray-500">No video URL provided</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {currentItem.category === 'document' && (
                                            <div className="w-full h-full p-12 overflow-y-auto prose max-w-none">
                                                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                                                    <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                                                        <FileText size={32} />
                                                    </div>
                                                    <div>
                                                        <h1 className="text-3xl font-bold text-gray-900 m-0">{currentItem.title}</h1>
                                                        <p className="text-gray-500 mt-1">Read the documentation below.</p>
                                                    </div>
                                                </div>

                                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {currentItem.description || "No description provided."}
                                                </div>

                                                {currentItem.content_url && (
                                                    <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <FileText size={24} className="text-gray-400" />
                                                            <div>
                                                                <div className="font-bold text-gray-800">Attached Document</div>
                                                                <div className="text-xs text-gray-500 truncate max-w-xs">{currentItem.content_url}</div>
                                                            </div>
                                                        </div>
                                                        <a href={currentItem.content_url} target="_blank" className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-bold text-gray-700 hover:text-[#b8594d] transition-colors">
                                                            Download / View
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {currentItem.category === 'image' && (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-100/50">
                                                <img src={currentItem.content_url} className="max-w-full max-h-[80vh] rounded shadow-lg object-contain" alt="Lesson Content" />
                                            </div>
                                        )}
                                    </>
                                )}

                                {currentItem?.itemType === 'quiz' && (
                                    <QuizPlayer quizId={currentItem.id} onComplete={handleItemComplete} />
                                )}
                            </div>
                        ) : (
                            <ReviewsTab courseId={courseId} />
                        )}

                        {/* Bottom Navigation */}
                        {activeTab === 'content' && currentItem?.itemType !== 'quiz' && (
                            <div className="mt-6 flex justify-end">
                                <button onClick={handleItemComplete} className="flex items-center gap-2 px-8 py-3 bg-[#b8594d] text-white font-bold rounded-lg shadow-lg shadow-[#b8594d]/20 hover:scale-105 transition-all">
                                    Next Content <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

function ReviewsTab({ courseId }) {
    const { data: reviews = [], refetch } = useQuery(['reviews', courseId], () => api.get(`/courses/${courseId}/reviews`).then(res => res.data));
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const submitReview = useMutation(
        (data) => api.post(`/courses/${courseId}/reviews`, data),
        {
            onSuccess: () => {
                refetch();
                setComment('');
                setRating(5);
            }
        }
    );

    const averageRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

    return (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col p-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-6">Course Reviews</h2>

            <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
                <div className="text-center md:text-left min-w-[200px] flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="text-5xl font-black text-[#1a1614] mb-1">{averageRating}</div>
                    <div className="flex gap-1 justify-center text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= Math.round(Number(averageRating) || 0) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{reviews.length} Ratings</div>
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-sm mb-4">Add Your Review</h3>
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                <Star size={24} fill="currentColor" />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your experience..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 text-sm focus:outline-none focus:border-[#b8594d] transition-all"
                        rows={3}
                    />
                    <button
                        onClick={() => submitReview.mutate({ rating, comment })}
                        disabled={!comment.trim()}
                        className="px-6 py-2 bg-[#1a1614] text-white font-bold rounded-lg text-sm hover:bg-[#b8594d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#1a1614]/20 hover:shadow-[#b8594d]/40"
                    >
                        Submit Review
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {reviews.length === 0 && <p className="text-center text-gray-400 italic">No reviews yet. Be the first!</p>}
                {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-white">
                                    {review.user_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-[#1a1614]">{review.user_name}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex text-yellow-400 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm ml-14 leading-relaxed">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
