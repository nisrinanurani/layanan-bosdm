import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, FileText, ExternalLink, Plus,
    Trash2, X, Link as LinkIcon, FileType
} from 'lucide-react';

export default function DokumenKami({ userRole }) {
    // 1. STATE UTAMA
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Semua");
    const [documents, setDocuments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State Form Tambah Data
    const [newDoc, setNewDoc] = useState({ judul: '', kategori: 'PANDUAN', link: '' });

    // Cek apakah user punya akses edit (Admin/Superadmin)
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    // 2. LOAD DATA DARI LOCAL STORAGE
    useEffect(() => {
        const savedDocs = JSON.parse(localStorage.getItem('data_dokumen_bosdm') || '[]');
        if (savedDocs.length === 0) {
            // Data default jika masih kosong
            const initialData = [
                { id: Date.now(), judul: "Panduan Penggunaan Dashboard", kategori: "PANDUAN", link: "https://google.com" }
            ];
            setDocuments(initialData);
            localStorage.setItem('data_dokumen_bosdm', JSON.stringify(initialData));
        } else {
            setDocuments(savedDocs);
        }
    }, []);

    // 3. FUNGSI TAMBAH & HAPUS
    const handleAddDocument = (e) => {
        e.preventDefault();
        const docToAdd = { ...newDoc, id: Date.now() };
        const updatedDocs = [docToAdd, ...documents];
        setDocuments(updatedDocs);
        localStorage.setItem('data_dokumen_bosdm', JSON.stringify(updatedDocs));
        setIsModalOpen(false);
        setNewDoc({ judul: '', kategori: 'PANDUAN', link: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm("Hapus dokumen ini?")) {
            const updatedDocs = documents.filter(doc => doc.id !== id);
            setDocuments(updatedDocs);
            localStorage.setItem('data_dokumen_bosdm', JSON.stringify(updatedDocs));
        }
    };

    // 4. FILTERING
    const categories = ["Semua", "PERATURAN", "PANDUAN", "TEMPLATE", "SOP", "LAPORAN"];
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.judul.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "Semua" || doc.kategori === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [documents, searchTerm, filterCategory]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Dokumen Kami</h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium italic">Pusat Link & Dokumen Resmi BOSDM BRIN</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text" placeholder="Cari judul..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* TOMBOL TAMBAH (HANYA UNTUK ADMIN) */}
                        {isAdmin && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- FILTER KATEGORI --- */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat} onClick={() => setFilterCategory(cat)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* --- TABEL DOKUMEN --- */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <th className="px-8 py-5 text-center w-20">No.</th>
                                <th className="px-6 py-5">Judul Dokumen</th>
                                <th className="px-6 py-5">Kategori</th>
                                <th className="px-8 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDocs.map((doc, index) => (
                                <tr key={doc.id} className="group hover:bg-blue-50/30 transition-all">
                                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-300">{index + 1}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                                <FileType className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{doc.judul}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md">
                                            {doc.kategori}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={doc.link} target="_blank" rel="noreferrer"
                                                className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- MODAL TAMBAH DATA (KHUSUS ADMIN) --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Tambah Dokumen Baru</h2>
                            <form onSubmit={handleAddDocument} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Dokumen</label>
                                    <input
                                        required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Contoh: Peraturan No. 1..."
                                        value={newDoc.judul} onChange={(e) => setNewDoc({ ...newDoc, judul: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-1 text-sm font-bold outline-none"
                                        value={newDoc.kategori} onChange={(e) => setNewDoc({ ...newDoc, kategori: e.target.value })}
                                    >
                                        {categories.filter(c => c !== "Semua").map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Link Dokumen (URL)</label>
                                    <input
                                        required type="url" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://..."
                                        value={newDoc.link} onChange={(e) => setNewDoc({ ...newDoc, link: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-4 shadow-lg shadow-blue-200 hover:bg-blue-700">
                                    Simpan Dokumen
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}