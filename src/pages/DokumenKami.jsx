import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, FileText, Plus, Trash2, X, ArrowLeft,
    Edit3, Save, Shield, ChevronDown, Check, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoBrin from '../assets/logo-brin-decs.png';

/* ── Slim Scrollbar ───────────────────────────────── */
const SLIM_SCROLL = `
.slim-scroll::-webkit-scrollbar { width: 4px; }
.slim-scroll::-webkit-scrollbar-track { background: transparent; }
.slim-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
.slim-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.slim-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
`;

/* ── Constants ────────────────────────────────────── */
const DEFAULT_CATEGORIES = ['PERATURAN', 'PANDUAN', 'TEMPLATE', 'SOP', 'LAPORAN'];
const SEMUA_KEY = 'Semua';
const LS_DOCS = 'data_dokumen_bosdm_v2';
const LS_CATS = 'dokumen_kategori_v2';

const loadDocs = () => { try { const s = localStorage.getItem(LS_DOCS); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveDocs = (d) => localStorage.setItem(LS_DOCS, JSON.stringify(d));
const loadCats = () => { try { const s = localStorage.getItem(LS_CATS); return s ? JSON.parse(s) : DEFAULT_CATEGORIES; } catch { return DEFAULT_CATEGORIES; } };
const saveCats = (d) => localStorage.setItem(LS_CATS, JSON.stringify(d));

/* ── Checklist Dropdown ───────────────────────────── */
function CategoryChecklistDropdown({ allCats, selected, onChange, placeholder = 'Filter Kategori' }) {
    const [open, setOpen] = useState(false);
    const toggle = (c) => {
        if (c === SEMUA_KEY) { onChange([SEMUA_KEY]); setOpen(false); return; }
        const without = selected.filter(x => x !== SEMUA_KEY);
        if (without.includes(c)) onChange(without.filter(x => x !== c));
        else onChange([...without, c]);
    };
    const label = selected.includes(SEMUA_KEY) ? SEMUA_KEY : selected.length === 0 ? placeholder : selected.join(', ');
    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-400 transition-all">
                <span className="truncate">{label}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        <div className="overflow-y-auto max-h-48 slim-scroll">
                            {[SEMUA_KEY, ...allCats].map(c => (
                                <button key={c} type="button" onClick={() => toggle(c)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-blue-50 transition-colors ${selected.includes(c) ? 'text-blue-600' : 'text-slate-600'}`}>
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected.includes(c) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                        {selected.includes(c) && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── SUPERADMIN: Category Manager ─────────────────── */
function CategoryManager({ categories, setCategories, docs, saveDocs: saveDocsExt }) {
    const [input, setInput] = useState('');
    const [editingIdx, setEditingIdx] = useState(null);
    const [editVal, setEditVal] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [captchaInput, setCaptchaInput] = useState('');

    const add = () => {
        const v = input.trim().toUpperCase();
        if (!v || categories.includes(v)) return;
        const updated = [...categories, v];
        setCategories(updated); saveCats(updated);
        setInput('');
    };

    const askDelete = (c) => { setDeleteTarget(c); setCaptchaInput(''); };
    const cancelDelete = () => { setDeleteTarget(null); setCaptchaInput(''); };
    const confirmDelete = () => {
        if (captchaInput !== deleteTarget) return;
        const updated = categories.filter(x => x !== deleteTarget);
        setCategories(updated); saveCats(updated);
        cancelDelete();
    };

    const startEdit = (idx) => { setEditingIdx(idx); setEditVal(categories[idx]); };
    const commitEdit = () => {
        const oldName = categories[editingIdx];
        const newName = editVal.trim().toUpperCase();
        if (!newName || newName === oldName) { setEditingIdx(null); return; }
        if (categories.includes(newName)) { alert('Kategori sudah ada!'); return; }
        const updatedCats = categories.map((c, i) => i === editingIdx ? newName : c);
        setCategories(updatedCats); saveCats(updatedCats);
        // Cascade update docs
        if (docs && saveDocsExt) {
            saveDocsExt(docs.map(d => d.kategori === oldName ? { ...d, kategori: newName } : d));
        }
        setEditingIdx(null);
    };

    const affectedCount = deleteTarget ? docs?.filter(d => d.kategori === deleteTarget).length ?? 0 : 0;
    const captchaMatches = captchaInput === deleteTarget;

    return (
        <>
            <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Superadmin — Editor Kategori</span>
                </div>
                <div className="flex gap-2 mb-3">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
                        placeholder="Nama kategori baru (Enter untuk tambah)"
                        className="flex-1 px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                    <button onClick={add} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((c, idx) => (
                        editingIdx === idx ? (
                            <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 border border-blue-300 rounded-full">
                                <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingIdx(null); }}
                                    className="text-[11px] font-bold text-blue-800 bg-transparent outline-none w-24" />
                                <button onClick={commitEdit} className="text-blue-600 hover:text-blue-800"><Save className="w-3 h-3" /></button>
                                <button onClick={() => setEditingIdx(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                            </span>
                        ) : (
                            <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
                                {c}
                                <button onClick={() => startEdit(idx)} title="Edit" className="hover:text-blue-900 transition-colors">
                                    <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button onClick={() => askDelete(c)} title="Hapus" className="hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )
                    ))}
                    {categories.length === 0 && <span className="text-xs text-slate-400 italic">Belum ada kategori.</span>}
                </div>
            </div>

            {/* ── Delete Confirmation Modal + Captcha ── */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={cancelDelete} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                            <div className="bg-red-50 border-b border-red-100 px-6 pt-6 pb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Konfirmasi Hapus</p>
                                        <p className="text-base font-black text-slate-900">Hapus kategori <span className="text-red-600">"{deleteTarget}"</span>?</p>
                                    </div>
                                </div>
                                {affectedCount > 0 && (
                                    <div className="flex items-start gap-2 bg-red-100 rounded-2xl px-3 py-2.5 mt-3">
                                        <span className="text-red-500 shrink-0 text-sm">⚠️</span>
                                        <p className="text-[11px] font-bold text-red-700 leading-relaxed">
                                            Kategori ini digunakan oleh <strong>{affectedCount} dokumen</strong>. Dokumen tersebut akan tetap ada namun kategorinya tidak lagi valid.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-5 space-y-3">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Ketik nama kategori berikut secara <strong>persis</strong> untuk mengonfirmasi:
                                </p>
                                <div className="px-4 py-2.5 bg-slate-100 rounded-xl text-center border border-slate-200">
                                    <span className="font-black text-slate-800 text-sm tracking-widest select-none">{deleteTarget}</span>
                                </div>
                                <input autoFocus value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && captchaMatches && confirmDelete()}
                                    placeholder={`Ketik "${deleteTarget}"`}
                                    className={`w-full px-3 py-2.5 text-sm font-bold border-2 rounded-xl outline-none transition-all ${
                                        captchaInput.length === 0 ? 'border-slate-200 bg-slate-50'
                                        : captchaMatches ? 'border-green-400 bg-green-50 text-green-700'
                                        : 'border-red-300 bg-red-50 text-red-600'
                                    }`} />
                                <AnimatePresence>
                                    {captchaMatches && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Konfirmasi cocok — tombol hapus aktif
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex gap-2 px-6 pb-6">
                                <button onClick={cancelDelete} className="flex-1 py-2.5 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm border border-slate-200">
                                    Batal
                                </button>
                                <button onClick={confirmDelete} disabled={!captchaMatches}
                                    className="flex-[2] py-2.5 bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-100">
                                    <Trash2 className="w-4 h-4" /> Ya, Hapus Kategori
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ── Add Document Modal ───────────────────────────── */
function AddDocModal({ categories, onClose, onSave, isSuperAdmin, cats, setCats, docs, saveDocsExt }) {
    const [form, setForm] = useState({ judul: '', kategori: categories[0] || '', deskripsi: '', link: '' });
    const [selectedCat, setSelectedCat] = useState([categories[0] || '']);

    const valid = form.judul.trim() && form.link.trim() && selectedCat.length > 0 && !selectedCat.includes(SEMUA_KEY);

    const handleSave = () => {
        if (!valid) return;
        onSave({ ...form, kategori: selectedCat[0] });
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-4 my-6">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                </button>
                <h3 className="font-black text-xl text-slate-900">Tambah Dokumen</h3>

                {/* Superadmin Category Manager inside modal */}
                {isSuperAdmin && (
                    <CategoryManager categories={cats} setCategories={setCats} docs={docs} saveDocs={saveDocsExt} />
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Judul <span className="text-red-500">*</span></label>
                    <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })}
                        placeholder="Nama dokumen"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Kategori <span className="text-red-500">*</span></label>
                    <CategoryChecklistDropdown
                        allCats={categories}
                        selected={selectedCat}
                        onChange={(v) => { const filtered = v.filter(x => x !== SEMUA_KEY); setSelectedCat(filtered.length ? filtered : selectedCat); }}
                        placeholder="Pilih kategori..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deskripsi</label>
                    <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                        rows={2} placeholder="Keterangan singkat dokumen..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Link / URL <span className="text-red-500">*</span></label>
                    <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                    <button onClick={handleSave} disabled={!valid}
                        className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        <Save className="w-4 h-4" /> Tambah Dokumen
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── MAIN COMPONENT ──────────────────────────────── */
export default function DokumenKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['admin', 'superadmin'].includes(userRole);
    const isSuperAdmin = userRole === 'superadmin';

    const [docs, setDocs] = useState(loadDocs);
    const [categories, setCategories] = useState(loadCats);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCat, setFilterCat] = useState([SEMUA_KEY]);
    const [selectedDate, setSelectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);

    const saveAndSetDocs = (updated) => { setDocs(updated); saveDocs(updated); };

    const handleAddDoc = (form) => {
        const newDoc = { ...form, id: Date.now(), createdAt: new Date().toISOString() };
        saveAndSetDocs([newDoc, ...docs]);
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Hapus dokumen ini?')) return;
        saveAndSetDocs(docs.filter(d => d.id !== id));
    };

    const filteredDocs = useMemo(() => {
        const sorted = [...docs].sort((a, b) => (b.createdAt || b.id) > (a.createdAt || a.id) ? 1 : -1);
        return sorted.filter(doc => {
            const matchSearch = doc.judul.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = filterCat.includes(SEMUA_KEY) || filterCat.includes(doc.kategori);
            const matchDate = !selectedDate || new Date(doc.createdAt || doc.id).toISOString().split('T')[0] === selectedDate;
            return matchSearch && matchCat && matchDate;
        });
    }, [docs, searchTerm, filterCat, selectedDate]);

    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

    return (
        <>
            <style>{SLIM_SCROLL}</style>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
                {/* Navbar */}
                <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                            <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                        </div>
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </button>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-6 py-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase">Dokumen Kami</h1>
                            <p className="text-slate-500 text-sm mt-1">Akses berkas dan panduan resmi BOSDM.</p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-sm shrink-0">
                                <Plus className="w-4 h-4" /> Tambah Data
                            </button>
                        )}
                    </div>

                    {/* Table card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Filter toolbar */}
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <div className="relative flex-1 min-w-[180px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Cari judul dokumen..."
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                            </div>
                            {/* Date filter */}
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                className="pl-3 pr-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all text-slate-600 cursor-pointer" />
                            {selectedDate && (
                                <button onClick={() => setSelectedDate('')} className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
                                    <X className="w-3 h-3" /> Reset
                                </button>
                            )}
                            {/* Category filter dropdown with checklist */}
                            <div className="w-48">
                                <CategoryChecklistDropdown allCats={categories} selected={filterCat} onChange={setFilterCat} />
                            </div>
                            {(filterCat.length > 0 && !filterCat.includes(SEMUA_KEY)) && (
                                <button onClick={() => setFilterCat([SEMUA_KEY])} className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors">
                                    <X className="w-3 h-3" /> Reset Kategori
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto slim-scroll">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['No', 'Judul', 'Kategori', 'Deskripsi', 'Waktu', ...(isAdmin ? ['Aksi'] : [])].map(h => (
                                            <th key={h} className="px-3 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredDocs.length === 0 && (
                                        <tr><td colSpan={isAdmin ? 6 : 5} className="py-16 text-center text-slate-400">
                                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-bold">Belum ada dokumen.</p>
                                        </td></tr>
                                    )}
                                    {filteredDocs.map((doc, idx) => (
                                        <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-3 py-2.5 text-[11px] text-slate-400 tabular-nums">{idx + 1}</td>
                                            <td className="px-3 py-2.5 max-w-[200px]">
                                                <a href={doc.link} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-blue-600 transition-colors truncate">
                                                    <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                                                    <span className="truncate">{doc.judul}</span>
                                                </a>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="text-[9px] font-black px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 uppercase whitespace-nowrap">
                                                    {doc.kategori}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-slate-400 max-w-[200px]">
                                                <span className="line-clamp-2">{doc.deskripsi || <span className="italic text-slate-300">—</span>}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-[10px] text-slate-400 whitespace-nowrap">{formatDate(doc.createdAt)}</td>
                                            {isAdmin && (
                                                <td className="px-3 py-2.5">
                                                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-medium">{filteredDocs.length} dokumen ditampilkan · klik judul untuk buka</span>
                        </div>
                    </div>
                </main>

                {/* Add Modal */}
                <AnimatePresence>
                    {showModal && (
                        <AddDocModal
                            categories={categories}
                            onClose={() => setShowModal(false)}
                            onSave={handleAddDoc}
                            isSuperAdmin={isSuperAdmin}
                            cats={categories}
                            setCats={(updated) => { setCategories(updated); saveCats(updated); }}
                            docs={docs}
                            saveDocsExt={saveAndSetDocs}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}