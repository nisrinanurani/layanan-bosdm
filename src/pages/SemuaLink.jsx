import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Link as LinkIcon, Plus, Edit3, Trash2, X,
    Save, ArrowLeft, ExternalLink, Shield, ChevronDown, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoBrin from '../assets/logo-brin-decs.png';

/* ── Slim Scrollbar CSS ───────────────────────────── */
const SLIM_SCROLL = `
.slim-scroll::-webkit-scrollbar { width: 4px; }
.slim-scroll::-webkit-scrollbar-track { background: transparent; }
.slim-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
.slim-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.slim-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
`;

/* ── Constants ────────────────────────────────────── */
const DEFAULT_FUNGSI = ['PDIS', 'JF1', 'JF2', 'JF3', 'Mutasi', 'Umum'];
const SEMUA_KEY = 'Semua';
const LS_LINKS = 'sl_links_v2';
const LS_FUNGSI = 'sl_fungsi_v2';

const loadLinks = () => { try { const s = localStorage.getItem(LS_LINKS); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveLinks = (d) => localStorage.setItem(LS_LINKS, JSON.stringify(d));
const loadFungsi = () => { try { const s = localStorage.getItem(LS_FUNGSI); return s ? JSON.parse(s) : DEFAULT_FUNGSI; } catch { return DEFAULT_FUNGSI; } };
const saveFungsi = (d) => localStorage.setItem(LS_FUNGSI, JSON.stringify(d));

/* ── Multi-checklist Dropdown ─────────────────────── */
function FungsiChecklistDropdown({ allFungsi, selected, onChange }) {
    const [open, setOpen] = useState(false);
    const toggle = (f) => {
        if (f === SEMUA_KEY) { onChange([SEMUA_KEY]); setOpen(false); return; }
        const without = selected.filter(x => x !== SEMUA_KEY);
        if (without.includes(f)) onChange(without.filter(x => x !== f));
        else onChange([...without, f]);
    };
    const label = selected.includes(SEMUA_KEY) ? 'Semua' : selected.length === 0 ? 'Pilih Fungsi...' : selected.join(', ');
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
                        className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        <div className="overflow-y-auto max-h-48 slim-scroll">
                            {[SEMUA_KEY, ...allFungsi].map(f => (
                                <button key={f} type="button" onClick={() => toggle(f)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-blue-50 transition-colors ${selected.includes(f) ? 'text-blue-600' : 'text-slate-600'}`}>
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected.includes(f) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                        {selected.includes(f) && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── SUPERADMIN: Function Manager ─────────────────── */
function FunctionManager({ fungsi, setFungsi, links, saveAndSet }) {
    const [input, setInput] = useState('');
    const [editingIdx, setEditingIdx] = useState(null);
    const [editVal, setEditVal] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [captchaInput, setCaptchaInput] = useState('');

    const add = () => {
        const v = input.trim();
        if (!v || fungsi.includes(v)) return;
        const updated = [...fungsi, v];
        setFungsi(updated); saveFungsi(updated);
        setInput('');
    };

    const askDelete = (f) => { setDeleteTarget(f); setCaptchaInput(''); };
    const cancelDelete = () => { setDeleteTarget(null); setCaptchaInput(''); };
    const confirmDelete = () => {
        if (captchaInput !== deleteTarget) return;
        const updated = fungsi.filter(x => x !== deleteTarget);
        setFungsi(updated); saveFungsi(updated);
        cancelDelete();
    };

    const startEdit = (idx) => { setEditingIdx(idx); setEditVal(fungsi[idx]); };
    const commitEdit = () => {
        const oldName = fungsi[editingIdx];
        const newName = editVal.trim();
        if (!newName || newName === oldName) { setEditingIdx(null); return; }
        if (fungsi.includes(newName)) { alert('Nama fungsi sudah ada!'); return; }
        const updatedFungsi = fungsi.map((f, i) => i === editingIdx ? newName : f);
        setFungsi(updatedFungsi); saveFungsi(updatedFungsi);
        if (links && saveAndSet) {
            saveAndSet(links.map(l => ({ ...l, fungsi: (l.fungsi || []).map(f => f === oldName ? newName : f) })));
        }
        setEditingIdx(null);
    };

    const affectedCount = deleteTarget ? (links?.filter(l => (l.fungsi || []).includes(deleteTarget)).length ?? 0) : 0;
    const captchaMatches = captchaInput === deleteTarget;

    return (
        <>
            <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Superadmin — Editor Fungsi</span>
                </div>
                <div className="flex gap-2 mb-3">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
                        placeholder="Nama fungsi baru (Enter untuk tambah)"
                        className="flex-1 px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                    <button onClick={add} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {fungsi.map((f, idx) => (
                        editingIdx === idx ? (
                            <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 border border-blue-300 rounded-full">
                                <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingIdx(null); }}
                                    className="text-[11px] font-bold text-blue-800 bg-transparent outline-none w-24" />
                                <button onClick={commitEdit} className="text-blue-600 hover:text-blue-800"><Save className="w-3 h-3" /></button>
                                <button onClick={() => setEditingIdx(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                            </span>
                        ) : (
                            <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
                                {f}
                                <button onClick={() => startEdit(idx)} title="Edit nama" className="hover:text-blue-900 transition-colors">
                                    <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button onClick={() => askDelete(f)} title="Hapus" className="hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )
                    ))}
                    {fungsi.length === 0 && <span className="text-xs text-slate-400 italic">Belum ada fungsi.</span>}
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

                            {/* Red header */}
                            <div className="bg-red-50 border-b border-red-100 px-6 pt-6 pb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Konfirmasi Hapus</p>
                                        <p className="text-base font-black text-slate-900">Hapus fungsi <span className="text-red-600">"{deleteTarget}"</span>?</p>
                                    </div>
                                </div>
                                {affectedCount > 0 && (
                                    <div className="flex items-start gap-2 bg-red-100 rounded-2xl px-3 py-2.5 mt-3">
                                        <span className="text-red-500 mt-0.5 shrink-0 text-sm">⚠️</span>
                                        <p className="text-[11px] font-bold text-red-700 leading-relaxed">
                                            Fungsi ini tercatat di <strong>{affectedCount} link</strong>. Link-link tersebut akan tetap ada, namun fungsinya tidak lagi valid dalam daftar aktif.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Captcha area */}
                            <div className="px-6 py-5 space-y-3">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Untuk mengonfirmasi penghapusan, ketik nama fungsi berikut secara <strong>persis</strong>:
                                </p>
                                <div className="px-4 py-2.5 bg-slate-100 rounded-xl text-center border border-slate-200">
                                    <span className="font-black text-slate-800 text-sm tracking-widest select-none">{deleteTarget}</span>
                                </div>
                                <input
                                    autoFocus
                                    value={captchaInput}
                                    onChange={e => setCaptchaInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && captchaMatches && confirmDelete()}
                                    placeholder={`Ketik "${deleteTarget}"`}
                                    className={`w-full px-3 py-2.5 text-sm font-bold border-2 rounded-xl outline-none transition-all ${
                                        captchaInput.length === 0
                                            ? 'border-slate-200 bg-slate-50'
                                            : captchaMatches
                                                ? 'border-green-400 bg-green-50 text-green-700'
                                                : 'border-red-300 bg-red-50 text-red-600'
                                    }`}
                                />
                                <AnimatePresence>
                                    {captchaMatches && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Konfirmasi cocok — tombol hapus aktif
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 px-6 pb-6">
                                <button onClick={cancelDelete}
                                    className="flex-1 py-2.5 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm border border-slate-200">
                                    Batal
                                </button>
                                <button onClick={confirmDelete} disabled={!captchaMatches}
                                    className="flex-[2] py-2.5 bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-100">
                                    <Trash2 className="w-4 h-4" /> Ya, Hapus Fungsi
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ── ADMIN: Add/Edit Modal ───────────────────────── */
function LinkFormModal({ allFungsi, editItem, onClose, onSave, isSuperAdmin, fungsi: fungsiList, setFungsi, links, saveAndSet }) {
    const [form, setForm] = useState(editItem || { judul: '', url: '', deskripsi: '', fungsi: [SEMUA_KEY] });
    const valid = form.judul.trim() && form.url.trim();
    const handleSave = () => { if (!valid) return; onSave(form); };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-4 my-6">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                </button>
                <h3 className="font-black text-xl text-slate-900">{editItem ? 'Edit Link' : 'Tambah Link Baru'}</h3>

                {isSuperAdmin && (
                    <FunctionManager fungsi={fungsiList} setFungsi={setFungsi} links={links} saveAndSet={saveAndSet} />
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Judul <span className="text-red-500">*</span></label>
                    <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })}
                        placeholder="Nama link yang mudah dikenali"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">URL <span className="text-red-500">*</span></label>
                    <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                        placeholder="https://contoh.go.id/link"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deskripsi</label>
                    <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                        rows={3} placeholder="Penjelasan singkat mengenai link ini..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Fungsi yang Diizinkan</label>
                    <FungsiChecklistDropdown allFungsi={allFungsi} selected={form.fungsi || [SEMUA_KEY]} onChange={v => setForm({ ...form, fungsi: v })} />
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                    <button onClick={handleSave} disabled={!valid}
                        className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        <Save className="w-4 h-4" /> {editItem ? 'Simpan Perubahan' : 'Tambah Link'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── ADMIN: Table View ───────────────────────────── */
function AdminLinkTable({ links, allFungsi, onEdit, onDelete, search, setSearch, filterFungsi, setFilterFungsi, filterDate, setFilterDate }) {
    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                </div>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    className="pl-3 pr-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-slate-600 cursor-pointer" />
                {filterDate && (
                    <button onClick={() => setFilterDate('')} className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-3 h-3" /> Reset
                    </button>
                )}
                <div className="w-44">
                    <FungsiChecklistDropdown allFungsi={allFungsi} selected={filterFungsi} onChange={setFilterFungsi} />
                </div>
                {(filterFungsi.length > 0 && !filterFungsi.includes(SEMUA_KEY)) && (
                    <button onClick={() => setFilterFungsi([SEMUA_KEY])} className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-3 h-3" /> Reset Fungsi
                    </button>
                )}
            </div>
            <div className="overflow-x-auto slim-scroll">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100">
                            {['No', 'Judul', 'Link URL', 'Fungsi', 'Deskripsi', 'Waktu', 'Aksi'].map(h => (
                                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {links.length === 0 && (
                            <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-bold">Belum ada link.</p>
                            </td></tr>
                        )}
                        {links.map((item, idx) => (
                            <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                                className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-3 py-2.5 text-[11px] text-slate-400 tabular-nums">{idx + 1}</td>
                                <td className="px-3 py-2.5 font-bold text-slate-800 max-w-[160px] truncate">{item.judul}</td>
                                <td className="px-3 py-2.5 max-w-[150px]">
                                    <a href={item.url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium truncate text-xs">
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{item.url}</span>
                                    </a>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                                        {(item.fungsi || [SEMUA_KEY]).map(f => (
                                            <span key={f} className="text-[9px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase whitespace-nowrap">{f}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[160px]">
                                    <span className="line-clamp-2">{item.deskripsi || <span className="italic text-slate-300">—</span>}</span>
                                </td>
                                <td className="px-3 py-2.5 text-[10px] text-slate-400 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                                <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium">{links.length} link ditampilkan</span>
            </div>
        </div>
    );
}

/* ── PEGAWAI: Compact List View ──────────────────── */
function UserLinkList({ links, search, setSearch, filterDate, setFilterDate }) {
    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul link..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm" />
                </div>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    className="pl-3 pr-3 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-slate-600 cursor-pointer shadow-sm" />
                {filterDate && (
                    <button onClick={() => setFilterDate('')} className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-[2rem_1fr_2fr] gap-x-4 px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi</span>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px] slim-scroll">
                    {links.length === 0 && (
                        <div className="py-16 text-center text-slate-400">
                            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-bold">Tidak ada link yang cocok.</p>
                        </div>
                    )}
                    {links.map((item, idx) => (
                        <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                            onClick={() => window.open(item.url, '_blank', 'noreferrer')}
                            className="grid grid-cols-[2rem_1fr_2fr] gap-x-4 items-center px-4 py-2 cursor-pointer hover:bg-blue-50/40 transition-all group">
                            <span className="text-[11px] text-slate-300 text-center tabular-nums font-black">{idx + 1}</span>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate flex items-center gap-1.5">
                                    <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                                    {item.judul}
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 truncate">{item.deskripsi || <span className="italic">—</span>}</p>
                        </motion.div>
                    ))}
                </div>
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">{links.length} link tersedia · klik baris untuk membuka</span>
                </div>
            </div>
        </div>
    );
}

/* ── MAIN COMPONENT ──────────────────────────────── */
export default function SemuaLink({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const isSuperAdmin = userRole === 'superadmin';
    const userFungsi = 'JF1';

    const [links, setLinks] = useState(loadLinks);
    const [fungsi, setFungsi] = useState(loadFungsi);
    const [search, setSearch] = useState('');
    const [filterFungsi, setFilterFungsi] = useState([SEMUA_KEY]);
    const [filterDate, setFilterDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const saveAndSet = (updated) => { setLinks(updated); saveLinks(updated); };
    const handleSave = (form) => {
        if (editItem) saveAndSet(links.map(l => l.id === editItem.id ? { ...l, ...form, updatedAt: new Date().toISOString() } : l));
        else saveAndSet([{ ...form, id: Date.now(), createdAt: new Date().toISOString() }, ...links]);
        setShowModal(false); setEditItem(null);
    };
    const handleEdit = (item) => { setEditItem(item); setShowModal(true); };
    const handleDelete = (id) => { if (!window.confirm('Hapus link ini?')) return; saveAndSet(links.filter(l => l.id !== id)); };

    const sortedLinks = useMemo(() => [...links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [links]);

    const adminFiltered = useMemo(() => sortedLinks.filter(item => {
        const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase());
        const matchFungsi = filterFungsi.includes(SEMUA_KEY) || (item.fungsi || []).some(f => filterFungsi.includes(f) || f === SEMUA_KEY);
        const matchDate = !filterDate || new Date(item.createdAt).toDateString() === new Date(filterDate).toDateString();
        return matchSearch && matchFungsi && matchDate;
    }), [sortedLinks, search, filterFungsi, filterDate]);

    const pegawaiFiltered = useMemo(() => sortedLinks.filter(item => {
        const visible = (item.fungsi || [SEMUA_KEY]).includes(SEMUA_KEY) || (item.fungsi || []).includes(userFungsi);
        const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase());
        const matchDate = !filterDate || new Date(item.createdAt).toDateString() === new Date(filterDate).toDateString();
        return visible && matchSearch && matchDate;
    }), [sortedLinks, search, filterDate, userFungsi]);

    return (
        <>
            <style>{SLIM_SCROLL}</style>
            <div className="min-h-screen bg-slate-50 font-sans pb-20">
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

                <main className="max-w-7xl mx-auto py-10 px-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase">Kumpulan Link</h1>
                            <p className="text-slate-500 text-sm mt-1">Akses cepat tautan penting Biro Organisasi dan SDM BRIN.</p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => { setEditItem(null); setShowModal(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-sm shrink-0">
                                <Plus className="w-4 h-4" /> Tambah Link
                            </button>
                        )}
                    </div>

                    {isAdmin ? (
                        <AdminLinkTable
                            links={adminFiltered} allFungsi={fungsi}
                            onEdit={handleEdit} onDelete={handleDelete}
                            search={search} setSearch={setSearch}
                            filterFungsi={filterFungsi} setFilterFungsi={setFilterFungsi}
                            filterDate={filterDate} setFilterDate={setFilterDate}
                        />
                    ) : (
                        <UserLinkList
                            links={pegawaiFiltered}
                            search={search} setSearch={setSearch}
                            filterDate={filterDate} setFilterDate={setFilterDate}
                        />
                    )}
                </main>

                <AnimatePresence>
                    {showModal && (
                        <LinkFormModal
                            allFungsi={fungsi}
                            editItem={editItem}
                            onClose={() => { setShowModal(false); setEditItem(null); }}
                            onSave={handleSave}
                            isSuperAdmin={isSuperAdmin}
                            fungsi={fungsi}
                            setFungsi={(updated) => { setFungsi(updated); saveFungsi(updated); }}
                            links={links}
                            saveAndSet={saveAndSet}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}