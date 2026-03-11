import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ThumbsUp, MessageCircle, ChevronDown, ChevronUp,
    Send, User, Clock, Star, CheckCircle
} from 'lucide-react';

function CommentCard({ comment, allComments, onLike, likedIds, onReply, isAdmin, onApprove, threadAuthor }) {
    const replies = allComments.filter(c => c.parentId === comment.id);
    const [showReplies, setShowReplies] = useState(false);
    const liked = likedIds.includes(comment.id);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            {/* Approved badge — floating */}
            {comment.isApproved && (
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-3 right-4 z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-amber-200 uppercase tracking-wide"
                >
                    <Star className="w-3 h-3 fill-white" />
                    Approved by Creator 🔥
                </motion.div>
            )}

            <div className={`rounded-2xl p-5 border transition-all ${comment.isApproved ? 'bg-amber-50 border-amber-200 shadow-md shadow-amber-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                {/* Comment header: [Author] ➔ [ReplyTo] */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-black text-sm text-slate-800">{comment.author}</span>
                    {comment.replyTo && (
                        <>
                            <span className="text-slate-400 font-bold text-sm">➔</span>
                            <span className="font-bold text-sm text-blue-600">{comment.replyTo}</span>
                        </>
                    )}
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </div>

                {/* Comment body */}
                <div
                    className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: comment.text }}
                />

                {/* Actions row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50 flex-wrap">
                    <button
                        onClick={() => onLike(comment.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-all ${liked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
                    >
                        <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-blue-600' : ''}`} />
                        {comment.likes}
                    </button>
                    <button onClick={() => onReply(comment)} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Balas
                    </button>
                    {isAdmin && !comment.isApproved && (
                        <button onClick={() => onApprove(comment.id)} className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors ml-auto">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Jadikan Jawaban Terbaik
                        </button>
                    )}
                    {replies.length > 0 && (
                        <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors ml-auto">
                            {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {replies.length} Balasan
                        </button>
                    )}
                </div>
            </div>

            {/* Collapsible replies with indent */}
            <AnimatePresence>
                {showReplies && replies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pl-8 mt-3 space-y-3 border-l-2 border-blue-100 ml-4">
                            {replies.map(reply => (
                                <CommentCard
                                    key={reply.id}
                                    comment={reply}
                                    allComments={allComments}
                                    onLike={onLike}
                                    likedIds={likedIds}
                                    onReply={onReply}
                                    isAdmin={isAdmin}
                                    onApprove={onApprove}
                                    threadAuthor={threadAuthor}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function ForumDetail({ thread: initialThread, onBack, userRole }) {
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const currentUser = userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Pegawai';

    // Load fresh thread data from localStorage
    const [thread, setThread] = useState(() => {
        try {
            const threads = JSON.parse(localStorage.getItem('forum_threads') || '[]');
            return threads.find(t => t.id === initialThread.id) || initialThread;
        } catch { return initialThread; }
    });

    const topLevelComments = thread.comments?.filter(c => !c.parentId) || [];

    const [likedIds, setLikedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('forum_liked_ids') || '[]'); } catch { return []; }
    });

    const [replyTarget, setReplyTarget] = useState(null); // { id, author } of comment being replied to
    const [replyText, setReplyText] = useState('');
    const [threadLiked, setThreadLiked] = useState(() => {
        try { return JSON.parse(localStorage.getItem('forum_thread_liked') || '[]').includes(initialThread.id); } catch { return false; }
    });

    const saveThreads = useCallback((updatedThread) => {
        try {
            const threads = JSON.parse(localStorage.getItem('forum_threads') || '[]');
            const updated = threads.map(t => t.id === updatedThread.id ? updatedThread : t);
            localStorage.setItem('forum_threads', JSON.stringify(updated));
            setThread(updatedThread);
        } catch { }
    }, []);

    const handleLikeThread = () => {
        if (threadLiked) return;
        const updatedThread = { ...thread, likes: thread.likes + 1 };
        saveThreads(updatedThread);
        const liked = [...(JSON.parse(localStorage.getItem('forum_thread_liked') || '[]')), thread.id];
        localStorage.setItem('forum_thread_liked', JSON.stringify(liked));
        setThreadLiked(true);
    };

    const handleLikeComment = (commentId) => {
        if (likedIds.includes(commentId)) return;
        const updatedComments = thread.comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c);
        const updatedThread = { ...thread, comments: updatedComments };
        saveThreads(updatedThread);
        const newLiked = [...likedIds, commentId];
        setLikedIds(newLiked);
        localStorage.setItem('forum_liked_ids', JSON.stringify(newLiked));
    };

    const handleApprove = (commentId) => {
        const updatedComments = thread.comments.map(c => ({ ...c, isApproved: c.id === commentId }));
        saveThreads({ ...thread, comments: updatedComments });
    };

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        const newComment = {
            id: Date.now(),
            threadId: thread.id,
            author: currentUser,
            text: replyText.trim(),
            likes: 0,
            parentId: replyTarget ? replyTarget.id : null,
            replyTo: replyTarget ? replyTarget.author : null,
            isApproved: false,
            createdAt: new Date().toISOString()
        };
        const updatedThread = { ...thread, comments: [...(thread.comments || []), newComment] };
        saveThreads(updatedThread);
        setReplyText('');
        setReplyTarget(null);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 pb-20">
            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Forum
            </motion.button>

            {/* Thread content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 p-8 mb-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {/* Hashtag chips — menggantikan label satker */}
                    {(thread.hashtags || []).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full">
                            #{tag}
                        </span>
                    ))}
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(thread.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-5 leading-snug">{thread.title}</h1>
                <div
                    className="text-slate-700 leading-relaxed prose prose-sm max-w-none mb-6 text-sm"
                    dangerouslySetInnerHTML={{ __html: thread.content }}
                />
                <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800">{thread.author}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Pembuat Pertanyaan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLikeThread} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${threadLiked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                            <ThumbsUp className={`w-4 h-4 ${threadLiked ? 'fill-blue-600' : ''}`} />
                            {thread.likes}
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-500 font-bold">
                            <MessageCircle className="w-4 h-4" />
                            {thread.comments?.length || 0}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Comments section */}
            <div className="mb-6">
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    {thread.comments?.length || 0} Komentar
                </h2>
                <div className="space-y-4">
                    {topLevelComments.map(comment => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            allComments={thread.comments || []}
                            onLike={handleLikeComment}
                            likedIds={likedIds}
                            onReply={(c) => { setReplyTarget(c); setReplyText(''); }}
                            isAdmin={isAdmin || thread.author === currentUser}
                            onApprove={handleApprove}
                            threadAuthor={thread.author}
                        />
                    ))}
                    {topLevelComments.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">Belum ada komentar. Jadilah yang pertama!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm sticky bottom-4"
            >
                {replyTarget && (
                    <div className="flex items-center justify-between mb-3 px-3 py-2 bg-blue-50 rounded-xl">
                        <span className="text-xs font-bold text-blue-600">Membalas <strong>{replyTarget.author}</strong></span>
                        <button onClick={() => setReplyTarget(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                )}
                <div className="flex gap-3 items-end">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mb-1">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={replyTarget ? `Balas ${replyTarget.author}...` : 'Tulis komentar atau jawaban...'}
                        rows={2}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium resize-none"
                    />
                    <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="mb-1 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
