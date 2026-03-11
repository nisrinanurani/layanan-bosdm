import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ThumbsUp, MessageCircle, Search, Plus, X, Send, Clock, Star, ChevronRight, Hash,
    Upload, Image, FileText, Filter
} from 'lucide-react';

/* ── Seed data ────────────────────────────────────────── */
const DEFAULT_HASHTAGS = ['Umum', 'Gaji', 'Kebijakan', 'Cuti', 'Kenaikan Pangkat', 'Mutasi', 'SIASN', 'Diklat'];

const SEED_THREADS = [
    {
        id: 1, title: 'Bagaimana cara mengajukan kenaikan pangkat secara online melalui SIASN?',
        content: '<p>Saya ingin bertanya mengenai prosedur pengajuan kenaikan pangkat secara online. Apakah ada panduan lengkap yang bisa diikuti?</p>',
        author: 'Ahmad Fauzi', satker: 'Biro OSDM', likes: 47, createdAt: '2025-12-10T08:30:00Z',
        hashtags: ['Kenaikan Pangkat', 'SIASN'],
        comments: [
            { id: 101, threadId: 1, author: 'Budi Santoso', text: 'Proses bisa memakan 3-6 bulan.', likes: 12, parentId: null, replyTo: null, isApproved: false, createdAt: '2025-12-10T09:00:00Z' },
            { id: 102, threadId: 1, author: 'Sri Wahyuni', text: 'Akses via siasn.bkn.go.id dan login menggunakan NIP.', likes: 28, parentId: null, replyTo: null, isApproved: true, createdAt: '2025-12-10T10:15:00Z' },
        ]
    },
    {
        id: 2, title: 'Info terbaru kebijakan WFH dan WFO pasca-pandemi di lingkungan BRIN',
        content: '<p>Apakah ada kebijakan resmi terbaru terkait Work From Home dan Work From Office?</p>',
        author: 'Dewi Rahayu', satker: 'Pusat Riset', likes: 34, createdAt: '2026-01-05T07:00:00Z',
        hashtags: ['Kebijakan'],
        comments: [
            { id: 201, threadId: 2, author: 'HR Admin', text: 'Maksimum 40% WFH per bulan untuk ASN fungsional.', likes: 20, parentId: null, replyTo: null, isApproved: true, createdAt: '2026-01-05T09:00:00Z' },
        ]
    },
    {
        id: 3, title: 'Syarat dan prosedur pengajuan tugas belajar S2/S3 ke luar negeri 2026',
        content: '<p>Apa saja persyaratan yang harus dipenuhi dan kapan jadwal pendaftaran dibuka?</p>',
        author: 'Indra Kurniawan', satker: 'PRTBG', likes: 62, createdAt: '2026-02-01T10:00:00Z',
        hashtags: ['Diklat', 'Kebijakan'],
        comments: [
            { id: 301, threadId: 3, author: 'Kepala SDM', text: 'Pendaftaran dibuka setiap awal kuartal. Minimal 2 tahun masa kerja.', likes: 35, parentId: null, replyTo: null, isApproved: true, createdAt: '2026-02-01T14:00:00Z' }
        ]
    },
    {
        id: 4, title: 'Cara update data kepegawaian yang salah di MySAPK — Panduan Lengkap',
        content: '<p>Data pangkat saya masih salah di MySAPK sejak TMT 2024. Bagaimana prosedur perbaikannya?</p>',
        author: 'Siti Aisyah', satker: 'Biro Hukum', likes: 29, createdAt: '2026-01-20T09:00:00Z',
        hashtags: ['SIASN', 'Umum'],
        comments: []
    },
    {
        id: 5, title: 'Pengumuman: BIMTEK Manajemen Kinerja ASN Bulan Maret 2026',
        content: '<p>Ada informasi resmi mengenai BIMTEK Manajemen Kinerja ASN bulan Maret?</p>',
        author: 'Tony Wijaya', satker: 'Seksi Diklat', likes: 18, createdAt: '2026-02-15T11:00:00Z',
        hashtags: ['Diklat'],
        comments: [
            { id: 501, threadId: 5, author: 'Admin Diklat', text: 'BIMTEK 10-12 Maret 2026 di Gedung B.', likes: 10, parentId: null, replyTo: null, isApproved: true, createdAt: '2026-02-16T08:00:00Z' }
        ]
    },
    {
        id: 6, title: 'Apakah ada fasilitas konseling SDM untuk pegawai kontrak di BRIN?',
        content: '<p>Saya pegawai kontrak, apakah tersedia layanan konseling dari Biro SDM?</p>',
        author: 'Nina Permata', satker: 'Setjen', likes: 11, createdAt: '2026-03-01T13:00:00Z',
        hashtags: ['Umum'],
        comments: []
    },
    {
        id: 7, title: 'Prosedur pengajuan cuti bersalin dan hak pegawai perempuan BRIN',
        content: '<p>Berapa lama cuti bersalin, apa dokumen yang diperlukan, dan apakah ada tunjangan tambahan?</p>',
        author: 'Rina Hastuti', satker: 'Biro OSDM', likes: 55, createdAt: '2026-03-05T09:30:00Z',
        hashtags: ['Cuti'],
        comments: [
            { id: 701, threadId: 7, author: 'Kabiro SDM', text: 'Cuti bersalin 3 bulan sesuai PP. Dokumen: surat keterangan dokter.', likes: 40, parentId: null, replyTo: null, isApproved: true, createdAt: '2026-03-05T11:00:00Z' }
        ]
    },
    {
        id: 8, title: 'Mekanisme pengajuan remunerasi untuk tenaga fungsional peneliti',
        content: '<p>Perbedaan remunerasi Ahli Muda vs Ahli Madya, komponen dan cara pengajuannya?</p>',
        author: 'Agus Prasetyo', satker: 'PRTKG', likes: 23, createdAt: '2026-03-08T08:00:00Z',
        hashtags: ['Gaji'],
        comments: []
    },
];

/* ── Custom scrollbar CSS (injected once) ────────────── */
const SCROLLBAR_STYLE = `
.forum-scroll::-webkit-scrollbar { width: 4px; }
.forum-scroll::-webkit-scrollbar-track { background: transparent; }
.forum-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
.forum-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.forum-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
`;

/* ── Hashtag pill ─────────────────────────────────────── */
function HashtagPill({ tag, active, onClick }) {
    return (
        <motion.button
            layout
            onClick={() => onClick(tag)}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${active
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                }`}
        >
            <Hash className="w-2.5 h-2.5" />{tag}
        </motion.button>
    );
}

/* ── Create Thread Modal ─────────────────────────────── */
function CreateThreadModal({ onClose, onSubmit, initialHashtag, allHashtags, onNewHashtag }) {
    const [form, setForm] = useState({
        title: '',
        content: '',
        hashtags: initialHashtag ? [initialHashtag] : [],
    });
    const [tagInput, setTagInput] = useState('');
    const [attachments, setAttachments] = useState([]);
    const fileRef = useRef(null);

    const handleFileAdd = (e) => {
        const incoming = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...incoming]);
        e.target.value = '';
    };
    const removeFile = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));
    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return { icon: Image, color: 'text-green-600', bg: 'bg-green-50' };
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' };
        return { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' };
    };
    const fmtSize = (b) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

    const addTag = (tag) => {
        const clean = tag.trim().replace(/^#/, '');
        if (!clean || form.hashtags.includes(clean)) return;
        setForm(f => ({ ...f, hashtags: [...f.hashtags, clean] }));
        if (!allHashtags.includes(clean)) onNewHashtag(clean);
        setTagInput('');
    };

    const removeTag = (tag) => setForm(f => ({ ...f, hashtags: f.hashtags.filter(h => h !== tag) }));

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-hidden">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-slate-900">Buat Pertanyaan Baru</h3>
                        <p className="text-xs text-slate-400 font-medium">Pertanyaanmu bisa membantu orang lain!</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Judul Pertanyaan</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Tulis judul yang jelas dan spesifik..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Isi Pertanyaan</label>
                        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                            rows={4} placeholder="Jelaskan pertanyaanmu secara detail..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium resize-none" />
                    </div>

                    {/* Hashtag input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Hashtag Topik <span className="text-slate-400 font-normal normal-case">(klik untuk tambah dari daftar, atau ketik baru)</span>
                        </label>

                        {/* Selected tags */}
                        {form.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {form.hashtags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-full">
                                        #{tag}
                                        <button onClick={() => removeTag(tag)} className="hover:opacity-70 transition-opacity ml-0.5">
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Existing hashtags to pick */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {allHashtags.filter(t => !form.hashtags.includes(t)).map(tag => (
                                <button key={tag} onClick={() => addTag(tag)}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-300 transition-all">
                                    #{tag}
                                </button>
                            ))}
                        </div>

                        {/* Custom tag input */}
                        <div className="flex gap-2">
                            <input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                                placeholder="#TopikBaru (tekan Enter)"
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-400 transition-all" />
                            <button onClick={() => addTag(tagInput)}
                                className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all">
                                + Tambah
                            </button>
                        </div>
                    </div>
                </div>

                    {/* ── Attachment: Gambar/PDF ── */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Lampiran <span className="font-normal normal-case text-slate-400">(gambar/PDF, opsional)</span>
                        </label>
                        <button type="button" onClick={() => fileRef.current?.click()}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50/40 transition-all group">
                            <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Klik untuk pilih file</span>
                            <span className="text-xs text-slate-400">— JPG, PNG, PDF</span>
                        </button>
                        <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileAdd} />
                        {attachments.length > 0 && (
                            <div className="mt-2 border border-slate-100 rounded-xl divide-y divide-slate-50 overflow-hidden">
                                {attachments.map((file, i) => {
                                    const meta = getFileIcon(file);
                                    const Icon = meta.icon;
                                    return (
                                        <div key={i} className={`flex items-center gap-2 px-3 py-2 ${meta.bg}`}>
                                            <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />
                                            <span className="text-xs font-bold text-slate-700 truncate flex-1">{file.name}</span>
                                            <span className="text-[10px] text-slate-400">{fmtSize(file.size)}</span>
                                            <button onClick={() => removeFile(i)} className="p-1 hover:text-red-500 text-slate-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                <div className="flex gap-3 mt-4">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                    <button
                        onClick={() => { if (form.title.trim() && form.content.trim()) onSubmit({ ...form, attachments }); }}
                        disabled={!form.title.trim() || !form.content.trim()}
                        className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        <Send className="w-4 h-4" /> Kirim Pertanyaan
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── Main Component ───────────────────────────────────── */
export default function ForumList({ onSelectThread, userRole }) {
    // ── State ──
    const [threads, setThreads] = useState(() => {
        try {
            const saved = localStorage.getItem('forum_threads_v2');
            return saved ? JSON.parse(saved) : SEED_THREADS;
        } catch { return SEED_THREADS; }
    });

    const [allHashtags, setAllHashtags] = useState(() => {
        try {
            const saved = localStorage.getItem('forum_hashtags');
            return saved ? JSON.parse(saved) : DEFAULT_HASHTAGS;
        } catch { return DEFAULT_HASHTAGS; }
    });

    const [activeHashtag, setActiveHashtag] = useState(null);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [filterDate, setFilterDate] = useState('');       // format YYYY-MM-DD (input type=date)
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'answered' | 'unanswered'

    const [likedIds, setLikedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('forum_liked_ids') || '[]'); } catch { return []; }
    });

    // ── Helpers ──
    const saveThreads = (updated) => {
        setThreads(updated);
        localStorage.setItem('forum_threads_v2', JSON.stringify(updated));
    };

    const saveHashtags = (updated) => {
        setAllHashtags(updated);
        localStorage.setItem('forum_hashtags', JSON.stringify(updated));
    };

    const handleNewHashtag = (tag) => {
        if (!allHashtags.includes(tag)) saveHashtags([...allHashtags, tag]);
    };

    const synopsis = (content) => {
        const text = content.replace(/<[^>]+>/g, '');
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
    };

    const timeAgo = (iso) => {
        const diff = (Date.now() - new Date(iso)) / 1000;
        if (diff < 60) return 'baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        return `${Math.floor(diff / 86400)} hari lalu`;
    };

    // ── Sorting & Filtering ── Murni berdasarkan waktu posting terbaru
    const sorted = useMemo(() => {
        return threads
            .filter(t => {
                const matchSearch =
                    t.title.toLowerCase().includes(search.toLowerCase()) ||
                    (t.author || '').toLowerCase().includes(search.toLowerCase());
                const matchTag = !activeHashtag ||
                    (t.hashtags || []).includes(activeHashtag);
                const matchDate = !filterDate ||
                    new Date(t.createdAt).toDateString() === new Date(filterDate).toDateString();
                const isAnswered = t.comments?.some(c => c.isApproved);
                const matchStatus =
                    filterStatus === 'all' ||
                    (filterStatus === 'answered' && isAnswered) ||
                    (filterStatus === 'unanswered' && !isAnswered);
                return matchSearch && matchTag && matchDate && matchStatus;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [threads, search, activeHashtag, filterDate, filterStatus]);

    // ── Handlers ──
    const handleLike = (e, id) => {
        e.stopPropagation();
        if (likedIds.includes(id)) return;
        const updated = threads.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t);
        const newLiked = [...likedIds, id];
        setThreads(updated);
        setLikedIds(newLiked);
        localStorage.setItem('forum_threads_v2', JSON.stringify(updated));
        localStorage.setItem('forum_liked_ids', JSON.stringify(newLiked));
    };

    const handleCreate = ({ title, content, hashtags }) => {
        const newThread = {
            id: Date.now(), title, content: `<p>${content}</p>`,
            author: userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Pegawai',
            satker: 'BOSDM', likes: 0, createdAt: new Date().toISOString(),
            hashtags: hashtags || [],
            comments: []
        };
        saveThreads([newThread, ...threads]);
        setShowCreate(false);
    };

    const handleTagFilter = (tag) => {
        setActiveHashtag(prev => prev === tag ? null : tag);
    };

    // ── Render ──
    return (
        <>
            {/* Inject custom scrollbar style once */}
            <style>{SCROLLBAR_STYLE}</style>

            <div className="max-w-5xl mx-auto px-4 pb-20">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Ngobrol Yuk! 💬</h1>
                        <p className="text-slate-400 text-xs mt-0.5 font-medium">
                            {sorted.length}/{threads.length} pertanyaan · <span className="text-blue-500 font-bold">Terbaru tampil duluan</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-sm shrink-0">
                        <Plus className="w-4 h-4" /> Buat Pertanyaan
                    </button>
                </motion.div>

                {/* ── Search Bar ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 }}
                    className="relative mb-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Cari pertanyaan atau penulis..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm text-sm" />
                </motion.div>

                {/* ── Filter: Tanggal + Status ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
                    className="flex items-center gap-2 mb-3 flex-wrap">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {/* Date filter */}
                    <div className="relative">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="pl-3 pr-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-slate-600 cursor-pointer"
                        />
                    </div>
                    {filterDate && (
                        <button onClick={() => setFilterDate('')}
                            className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
                            <X className="w-3 h-3" /> Reset Tanggal
                        </button>
                    )}
                    <div className="w-px h-4 bg-slate-200 mx-0.5" />
                    {/* Status filter */}
                    {['all', 'answered', 'unanswered'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                filterStatus === s
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}>
                            {s === 'all' ? 'Semua Status' : s === 'answered' ? '✓ Terjawab' : '○ Belum Dijawab'}
                        </button>
                    ))}
                </motion.div>

                {/* ── Dynamic Hashtag Filter Bar ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.07 }}
                    className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 forum-scroll">
                    {/* All button */}
                    <motion.button
                        layout
                        onClick={() => setActiveHashtag(null)}
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${!activeHashtag
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                            }`}
                    >
                        Semua
                    </motion.button>

                    <div className="w-px h-4 bg-slate-200 shrink-0" />

                    {allHashtags.map(tag => (
                        <HashtagPill
                            key={tag}
                            tag={tag}
                            active={activeHashtag === tag}
                            onClick={handleTagFilter}
                        />
                    ))}
                </motion.div>

                {/* ── Table Container with fixed height + custom scroll ── */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    {/* Column header */}
                    <div className="grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-center px-4 py-2 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">#</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Pertanyaan (Terbaru)
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</span>
                    </div>

                    {/* Scrollable rows — fixed height */}
                    <div className="divide-y divide-slate-50 overflow-y-auto max-h-[520px] forum-scroll">
                        {sorted.length === 0 && (
                            <div className="py-16 text-center text-slate-400">
                                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-bold">Tidak ada thread ditemukan.</p>
                                {activeHashtag && (
                                    <button onClick={() => setActiveHashtag(null)}
                                        className="mt-2 text-xs text-blue-500 font-bold hover:underline">
                                        Hapus filter #{activeHashtag}
                                    </button>
                                )}
                            </div>
                        )}

                        {sorted.map((thread, idx) => {
                            const hasApproved = thread.comments?.some(c => c.isApproved);
                            const isPromoted = hasApproved || thread.likes >= 30;
                            const liked = likedIds.includes(thread.id);

                            return (
                                <motion.div
                                    key={thread.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(idx * 0.025, 0.2) }}
                                    onClick={() => onSelectThread(thread)}
                                    className={`grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-center px-4 py-2.5 cursor-pointer transition-all group
                                        ${hasApproved
                                            ? 'hover:bg-amber-50/60 border-l-2 border-l-amber-400'
                                            : 'hover:bg-blue-50/30 border-l-2 border-l-transparent'}`}
                                >
                                    {/* Row number */}
                                    <span className="text-[11px] font-black text-slate-300 text-center tabular-nums">{idx + 1}</span>

                                    {/* Content */}
                                    <div className="min-w-0">
                                        {/* Badges row — Terjawab + hashtag chips (klikable untuk filter) */}
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            {hasApproved && (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                                                    <Star className="w-2.5 h-2.5 fill-amber-500" /> Terjawab
                                                </span>
                                            )}
                                            {(thread.hashtags || []).map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={e => { e.stopPropagation(); handleTagFilter(tag); }}
                                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors shrink-0 border ${
                                                        activeHashtag === tag
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                                                    }`}
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Title */}
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight truncate">
                                            {thread.title}
                                        </p>

                                        {/* Preview */}
                                        <p className="text-xs text-slate-400 leading-tight mt-0.5 truncate">
                                            {synopsis(thread.content)}
                                        </p>

                                        {/* Meta row */}
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5" /> {timeAgo(thread.createdAt)}
                                            </span>
                                            <button
                                                onClick={e => handleLike(e, thread.id)}
                                                className={`flex items-center gap-0.5 text-[10px] font-bold transition-all ${liked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
                                            >
                                                <ThumbsUp className={`w-3 h-3 ${liked ? 'fill-blue-600' : ''}`} />
                                                {thread.likes}
                                            </button>
                                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                                <MessageCircle className="w-3 h-3" /> {thread.comments?.length || 0} jawaban
                                            </span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onSelectThread(thread); }}
                                        className="shrink-0 flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                                    >
                                        Kepo-in yuk! <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer count */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                            Menampilkan {sorted.length} dari {threads.length} pertanyaan
                            {activeHashtag && ` · filter: #${activeHashtag}`}
                        </span>
                        {activeHashtag && (
                            <button onClick={() => setActiveHashtag(null)}
                                className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-0.5 transition-colors">
                                <X className="w-3 h-3" /> Hapus Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreate && (
                        <CreateThreadModal
                            onClose={() => setShowCreate(false)}
                            onSubmit={handleCreate}
                            initialHashtag={activeHashtag}
                            allHashtags={allHashtags}
                            onNewHashtag={handleNewHashtag}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
