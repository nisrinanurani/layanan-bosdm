import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Link as LinkIcon, Plus, Edit3, Trash2, X,
    ExternalLink, Save, PlusCircle, Globe, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SemuaLink({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === STATE DATA ===
    const [dataLinks, setDataLinks] = useState(() => {
        const saved = localStorage.getItem('kumpulan_link_bosdm');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                judul: "Layanan Kepegawaian Internal",
                links: ["https://sso.brin.go.id", "https://intra.brin.go.id"],
                updatedAt: new Date().toISOString()
            }
        ];
    });

    // === STATE UI ===
    const [searchLink, setSearchLink] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ id: null, judul: '', links: [''] });

    // === LOGIC HANDLERS ===
    const handleSaveToLocal = (data) => {
        setDataLinks(data);
        localStorage.setItem('kumpulan_link_bosdm', JSON.stringify(data));
    };

    const handleAddField = () => {
        setNewLinkData({ ...newLinkData, links: [...newLinkData.links, ''] });
    };

    const handleRemoveField = (index) => {
        const updatedLinks = newLinkData.links.filter((_, i) => i !== index);
        setNewLinkData({ ...newLinkData, links: updatedLinks });
    };

    const handleUpdateLinkValue = (index, value) => {
        const updatedLinks = [...newLinkData.links];
        updatedLinks[index] = value;
        setNewLinkData({ ...newLinkData, links: updatedLinks });
    };

    const handleSaveLinks = () => {
        if (!newLinkData.judul.trim()) return alert("Judul harus diisi!");

        const cleanLinks = newLinkData.links.filter(l => l.trim() !== "");
        if (cleanLinks.length === 0) return alert("Minimal satu link harus diisi!");

        if (newLinkData.id) {
            // Mode EDIT
            const updated = dataLinks.map(item =>
                item.id === newLinkData.id
                    ? { ...item, judul: newLinkData.judul, links: cleanLinks, updatedAt: new Date().toISOString() }
                    : item
            );
            handleSaveToLocal(updated);
        } else {
            // Mode TAMBAH
            const newData = {
                id: Date.now(),
                judul: newLinkData.judul,
                links: cleanLinks,
                updatedAt: new Date().toISOString()
            };
            handleSaveToLocal([newData, ...dataLinks]);
        }

        setShowModal(false);
        setNewLinkData({ id: null, judul: '', links: [''] });
    };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kumpulan link ini?")) {
            const updated = dataLinks.filter(item => item.id !== id);
            handleSaveToLocal(updated);
        }
    };

    const handleEditOpen = (item) => {
        setNewLinkData({ id: item.id, judul: item.judul, links: item.links });
        setShowModal(true);
    };

    // === FILTERING ===
    const filteredLinks = useMemo(() => {
        return dataLinks.filter(item =>
            item.judul.toLowerCase().includes(searchLink.toLowerCase())
        );
    }, [dataLinks, searchLink]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 px-6">
            <div className="max-w-6xl mx-auto py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Kumpulan Link BOSDM</h1>
                    <p className="text-slate-500 font-medium">Akses cepat seluruh tautan penting Biro Organisasi dan SDM BRIN.</p>
                </div>

                {/* FILTER & SEARCH BAR */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari judul kumpulan link..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner"
                            value={searchLink}
                            onChange={(e) => setSearchLink(e.target.value)}
                        />
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => {
                                setNewLinkData({ id: null, judul: '', links: [''] });
                                setShowModal(true);
                            }}
                            className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Tambah Data
                        </button>
                    )}
                </div>

                {/* TABEL DATA */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Judul Kumpulan</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Link</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Terakhir Diperbarui</th>
                                {isAdmin && <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLinks.length > 0 ? filteredLinks.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Globe className="w-4 h-4" /></div>
                                            <span className="font-bold text-slate-900">{item.judul}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-2">
                                            {item.links.map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
                                                >
                                                    <LinkIcon className="w-3 h-3" /> Link {i + 1}
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                                        {new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-6">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditOpen(item)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="p-20 text-center text-slate-400">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">Tidak ada link ditemukan</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TAMBAH/EDIT (HANYA ADMIN) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
                            <h3 className="text-2xl font-black mb-6 text-slate-900">
                                {newLinkData.id ? "Edit Kumpulan Link" : "Tambah Kumpulan Link"}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Judul Kumpulan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Portal Absensi Pegawai"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner"
                                        value={newLinkData.judul}
                                        onChange={(e) => setNewLinkData({ ...newLinkData, judul: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Daftar URL Link</label>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {newLinkData.links.map((link, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
                                                    <LinkIcon className="w-4 h-4 text-blue-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        className="text-sm outline-none bg-transparent w-full font-medium text-blue-600"
                                                        value={link}
                                                        onChange={(e) => handleUpdateLinkValue(idx, e.target.value)}
                                                    />
                                                </div>
                                                {idx > 0 && (
                                                    <button onClick={() => handleRemoveField(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleAddField} className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline">
                                        <PlusCircle className="w-4 h-4" /> Tambah Input Link
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-10">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl">Batal</button>
                                <button onClick={handleSaveLinks} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
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