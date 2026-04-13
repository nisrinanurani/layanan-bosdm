import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp, MessageCircle, Search, Plus, X, Send, Clock, ChevronRight
} from 'lucide-react';

export default function ForumList({ onSelectThread, user }) {
    const [threads, setThreads] = useState([]);
    const [allHashtags, setAllHashtags] = useState(['Umum', 'Gaji', 'Kebijakan', 'Cuti', 'Mutasi']);
    const [activeHashtag, setActiveHashtag] = useState(null);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // 1. Ambil data dari SQL via API
    const fetchThreads = async () => {
        try {
            const res = await fetch('/api/forum_handler.php');
            const data = await res.json();
            setThreads(data);

            // Ekstrak hashtag unik dari database untuk filter
            const tagsFromDB = data.map(t => t.hashtags).filter(Boolean);
            setAllHashtags(prev => [...new Set([...prev, ...tagsFromDB])]);
        } catch (e) {
            console.error("Gagal sinkronisasi database");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchThreads(); }, []);

    // 2. Logika Like (Update ke SQL)
    const handleLike = async (e, id) => {
        e.stopPropagation();
        try {
            await fetch('/api/forum_handler.php', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ thread_id: id })
            });
            fetchThreads();
        } catch (e) { console.error("Gagal like"); }
    };

    // 3. Simpan Thread Baru ke SQL
    const handleCreateSubmit = async (formData) => {
        try {
            const res = await fetch('/api/forum_handler.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    title: formData.title,
                    content: formData.content,
                    hashtags: formData.hashtags.join(', ')
                })
            });
            const result = await res.json();
            if (result.status === 'success') {
                setShowCreate(false);
                fetchThreads();
            }
        } catch (e) { alert("Gagal mengirim pertanyaan"); }
    };

    // 4. Client-side filtering
    const sorted = useMemo(() => {
        return threads.filter(t => {
            const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                (t.nama_depan || "").toLowerCase().includes(search.toLowerCase());
            const matchTag = !activeHashtag || (t.hashtags || '').includes(activeHashtag);
            const matchDate = !filterDate || new Date(t.created_at).toDateString() === new Date(filterDate).toDateString();
            const isAnswered = parseInt(t.comment_count) > 0;
            const matchStatus = filterStatus === 'all' || (filterStatus === 'answered' && isAnswered) || (filterStatus === 'unanswered' && !isAnswered);
            return matchSearch && matchTag && matchDate && matchStatus;
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [threads, search, activeHashtag, filterDate, filterStatus]);

    const timeAgo = (iso) => {
        const diff = (Date.now() - new Date(iso)) / 1000;
        if (diff < 60) return 'baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        return new Date(iso).toLocaleDateString();
    };

    return (
        <div className="max-w-5xl mx-auto px-4 pb-20 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="text-left">
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic">Ngobrol Yuk! 💬</h1>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium uppercase tracking-widest">Forum Diskusi Pegawai</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                    + Buat Pertanyaan
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Cari pertanyaan..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left">
                <div className="grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-center px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <span>#</span><span>Pertanyaan</span><span>Aksi</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                    {isLoading ? <p className="p-10 text-center font-bold text-slate-400 uppercase text-xs">Memuat data diskusi...</p> :
                        sorted.length > 0 ? sorted.map((thread, idx) => (
                            <div key={thread.id} onClick={() => onSelectThread(thread)} className="grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-center px-4 py-3 hover:bg-blue-50/30 cursor-pointer transition-colors">
                                <span className="text-xs text-slate-300 font-bold">{idx + 1}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{thread.title}</p>
                                    <div className="flex gap-2 text-[10px] text-slate-400 mt-1 uppercase font-bold">
                                        <Clock className="w-3 h-3" /> {timeAgo(thread.created_at)} ·
                                        <ThumbsUp className="w-3 h-3" /> {thread.likes || 0} ·
                                        <MessageCircle className="w-3 h-3" /> {thread.comment_count || 0}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                        )) : (
                            <p className="p-10 text-center text-slate-400 text-xs font-bold uppercase">Tidak ada pertanyaan ditemukan.</p>
                        )}
                </div>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <CreateThreadModal
                        onClose={() => setShowCreate(false)}
                        onSubmit={handleCreateSubmit}
                        allHashtags={allHashtags}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Komponen Modal yang sebelumnya hilang sehingga menyebabkan blank page
function CreateThreadModal({ onClose, onSubmit, allHashtags }) {
    const [form, setForm] = useState({ title: '', content: '', hashtags: [] });

    const toggleTag = (tag) => {
        setForm(prev => ({
            ...prev,
            hashtags: prev.hashtags.includes(tag)
                ? prev.hashtags.filter(t => t !== tag)
                : [...prev.hashtags, tag]
        }));
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-left">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
                    <X />
                </button>

                <h2 className="text-xl font-black uppercase italic mb-6 tracking-tighter text-slate-900">Buat Diskusi Baru</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Judul Pertanyaan</label>
                        <input
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                            placeholder="Apa yang ingin kamu tanyakan?"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Detail Pertanyaan</label>
                        <textarea
                            rows={4}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 resize-none transition-all"
                            placeholder="Jelaskan masalah atau topik yang ingin dibahas..."
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Topik / Hashtag</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {allHashtags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${form.hashtags.includes(tag)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400'
                                        }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => onSubmit(form)}
                        disabled={!form.title.trim() || !form.content.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" /> Posting Sekarang
                    </button>
                </div>
            </motion.div>
        </div>
    );
}