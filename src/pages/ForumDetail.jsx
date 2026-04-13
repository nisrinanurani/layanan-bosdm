import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ThumbsUp, MessageCircle, Send, User, Clock, Star, CheckCircle } from 'lucide-react';

export default function ForumDetail({ thread, onBack, user }) {
    const [comments, setComments] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [replyTarget, setReplyTarget] = useState(null);

    const fetchComments = async () => {
        const res = await fetch(`/api/comment_handler.php?thread_id=${thread.id}`);
        const data = await res.json();
        setComments(data);
    };

    useEffect(() => { fetchComments(); }, [thread.id]);

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        await fetch('/api/comment_handler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: thread.id,
                user_id: user.id,
                comment: replyText,
                parent_id: replyTarget ? replyTarget.id : null
            })
        });
        setReplyText('');
        setReplyTarget(null);
        fetchComments();
    };

    // Gunakan visual CommentCard kamu yang ada sistem replies.filter(c => c.parentId === comment.id)
    return (
        <div className="max-w-3xl mx-auto px-4 pb-20 pt-10 text-left">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6">
                <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            {/* Tampilan Thread Utama */}
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 mb-4">{thread.title}</h1>
                <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: thread.content }} />
            </div>

            {/* List Komentar (Gunakan rekursi visual kamu) */}
            <div className="space-y-4">
                {comments.filter(c => !c.parent_id).map(comment => (
                    <div key={comment.id} className="bg-white p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-sm">{comment.nama_depan}</span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.comment}</p>
                        <button
                            onClick={() => setReplyTarget(comment)}
                            className="text-[10px] font-black text-blue-600 mt-3 uppercase tracking-widest"
                        >
                            Balas
                        </button>
                    </div>
                ))}
            </div>

            {/* Input Form (Floating) */}
            <div className="fixed bottom-6 inset-x-0 max-w-3xl mx-auto px-4">
                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex gap-3 items-center">
                    <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={replyTarget ? `Membalas ${replyTarget.nama_depan}...` : "Tulis komentar..."}
                        className="flex-1 bg-slate-50 rounded-xl p-3 text-sm outline-none resize-none"
                        rows={1}
                    />
                    <button onClick={handleSendReply} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}