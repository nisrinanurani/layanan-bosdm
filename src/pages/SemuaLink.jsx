import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Link as LinkIcon, Plus, Edit3, Trash2, X,
    Save, PlusCircle, ArrowLeft, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import logoBrin from '../assets/logo-brin-decs.png';

export default function SemuaLink({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const isSuperAdmin = userRole === 'superadmin';

    // === STATE DATA UTAMA ===
    const [dataLinks, setDataLinks] = useState(() => {
        const saved = localStorage.getItem('kumpulan_link_bosdm');
        return saved ? JSON.parse(saved) : [];
    });

    // === STATE KATEGORI DINAMIS ===
    const [categories, setCategories] = useState(() => {
        const savedCats = localStorage.getItem('kategori_link_bosdm');
        return savedCats ? JSON.parse(savedCats) : ['Internal', 'Eksternal', 'Lainnya'];
    });

    // === STATE UI & FORM ===
    const [searchLink, setSearchLink] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [selectedDate, setSelectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newCatInput, setNewCatInput] = useState('');

    const [newLinkData, setNewLinkData] = useState({
        id: null,
        judul: '',
        kategori: categories[0],
        links: ['']
    });

    // === HANDLER KATEGORI (SUPERADMIN) ===
    const handleAddCategory = () => {
        const val = newCatInput.trim();
        if (!val) return;
        if (categories.includes(val)) return alert("Kategori sudah ada!");

        const updated = [...categories, val];
        setCategories(updated);
        localStorage.setItem('kategori_link_bosdm', JSON.stringify(updated));
        setNewCatInput('');
    };

    const handleRemoveCategory = (catToDelete) => {
        if (categories.length <= 1) return alert("Minimal harus ada satu kategori.");
        if (window.confirm(`Hapus kategori "${catToDelete}"? Link dengan kategori ini tidak akan terhapus, tapi kategorinya perlu diupdate.`)) {
            const updated = categories.filter(c => c !== catToDelete);
            setCategories(updated);
            localStorage.setItem('kategori_link_bosdm', JSON.stringify(updated));
            if (newLinkData.kategori === catToDelete) {
                setNewLinkData({ ...newLinkData, kategori: updated[0] });
            }
        }
    };

    // === HANDLER DATA LINK ===
    const handleSaveLinks = () => {
        if (!newLinkData.judul.trim()) return alert("Judul wajib diisi!");
        const cleanLinks = newLinkData.links.filter(l => l.trim() !== "");
        if (cleanLinks.length === 0) return alert("Minimal isi satu URL!");

        let updatedData;
        if (newLinkData.id) {
            updatedData = dataLinks.map(item =>
                item.id === newLinkData.id
                    ? { ...item, ...newLinkData, links: cleanLinks, updatedAt: new Date().toISOString() }
                    : item
            );
        } else {
            const newData = { ...newLinkData, id: Date.now(), links: cleanLinks, updatedAt: new Date().toISOString() };
            updatedData = [newData, ...dataLinks];
        }

        setDataLinks(updatedData);
        localStorage.setItem('kumpulan_link_bosdm', JSON.stringify(updatedData));
        setShowModal(false);
        setNewLinkData({ id: null, judul: '', kategori: categories[0], links: [''] });
    };

    const handleDeleteLink = (id) => {
        if (confirm("Hapus kumpulan link ini?")) {
            const updated = dataLinks.filter(d => d.id !== id);
            setDataLinks(updated);
            localStorage.setItem('kumpulan_link_bosdm', JSON.stringify(updated));
        }
    };

    const filteredLinks = useMemo(() => {
        return dataLinks.filter(item => {
            const matchesSearch = item.judul.toLowerCase().includes(searchLink.toLowerCase());
            const matchesCategory = filterCategory === 'Semua' || item.kategori === filterCategory;
            const matchesDate = !selectedDate || item.updatedAt.includes(selectedDate);
            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [dataLinks, searchLink, filterCategory, selectedDate]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* NAVBAR */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                        <span className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">Portal BOSDM</span>
                    </div>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Kumpulan Link</h1>
                    <p className="text-slate-500 text-sm">Akses cepat tautan penting Biro Organisasi dan SDM.</p>
                </div>

                {/* FILTER BAR */}
                <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
                    <div className="relative w-full md:w-80">
                        <input type="text" placeholder="Cari judul link" className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" value={searchLink} onChange={(e) => setSearchLink(e.target.value)} />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 border border-slate-200 rounded-lg shadow-sm">
                        <input type="date" className="px-3 py-1.5 text-xs text-slate-600 outline-none" onChange={(e) => setSelectedDate(e.target.value)} />
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select className="px-3 py-1.5 text-xs text-slate-600 bg-transparent outline-none cursor-pointer" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="Semua">Semua Kategori</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {isAdmin && (
                        <button onClick={() => {
                            setNewLinkData({ id: null, judul: '', kategori: categories[0], links: [''] });
                            setShowModal(true);
                        }} className="ml-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100">
                            <Plus className="w-4 h-4" /> Tambah Data
                        </button>
                    )}
                </div>

                {/* TABEL */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Judul</th>
                                <th className="p-4">Link URL</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Waktu</th>
                                {isAdmin && <th className="p-4 text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLinks.length > 0 ? filteredLinks.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-center text-slate-400">{idx + 1}.</td>
                                    <td className="p-4 font-bold text-slate-800">{item.judul}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {item.links.map((link, i) => (
                                                <a key={i} href={link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                                                    <LinkIcon className="w-3 h-3" /> {link}
                                                </a>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded font-bold text-[10px]">{item.kategori}</span></td>
                                    <td className="p-4 text-slate-500">{new Date(item.updatedAt).toLocaleDateString('id-ID')}</td>
                                    {isAdmin && (
                                        <td className="p-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => { setNewLinkData(item); setShowModal(true); }} className="text-amber-500 hover:text-amber-600"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteLink(item.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan={isAdmin ? 6 : 5} className="p-10 text-center text-slate-400 italic">Data tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* MODAL TAMBAH/EDIT DENGAN KELOLA KATEGORI */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-black mb-6 text-slate-900">{newLinkData.id ? "Edit Data Link" : "Tambah Data Link"}</h3>

                            <div className="space-y-6">
                                {/* INPUT JUDUL */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul Kumpulan</label>
                                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" value={newLinkData.judul} onChange={(e) => setNewLinkData({ ...newLinkData, judul: e.target.value })} />
                                </div>

                                {/* KELOLA KATEGORI (DROPDOWN + LIST HAPUS) */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Kategori</label>
                                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 cursor-pointer mb-3" value={newLinkData.kategori} onChange={(e) => setNewLinkData({ ...newLinkData, kategori: e.target.value })}>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>

                                    {/* AREA KHUSUS SUPERADMIN: TAMBAH/HAPUS LIST KATEGORI */}
                                    {isSuperAdmin && (
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Editor List Kategori (Superadmin Only)</p>
                                            <div className="flex gap-2 mb-4">
                                                <input type="text" placeholder="Ketik kategori baru..." className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} />
                                                <button onClick={handleAddCategory} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700">Tambah</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(cat => (
                                                    <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 shadow-sm">
                                                        {cat}
                                                        <button onClick={() => handleRemoveCategory(cat)} className="text-red-400 hover:text-red-600 transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* INPUT URL LINKS */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daftar Link URL</label>
                                    <div className="space-y-3">
                                        {newLinkData.links.map((link, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input type="text" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-blue-600 outline-none" value={link} onChange={(e) => {
                                                    const updated = [...newLinkData.links];
                                                    updated[idx] = e.target.value;
                                                    setNewLinkData({ ...newLinkData, links: updated });
                                                }} />
                                                {idx > 0 && <button onClick={() => setNewLinkData({ ...newLinkData, links: newLinkData.links.filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setNewLinkData({ ...newLinkData, links: [...newLinkData.links, ''] })} className="mt-3 flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline">
                                        <PlusCircle className="w-4 h-4" /> Tambah URL Lain
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-10">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl">Batal</button>
                                <button onClick={handleSaveLinks} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all">
                                    <Save className="w-5 h-5" /> Simpan Perubahan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}