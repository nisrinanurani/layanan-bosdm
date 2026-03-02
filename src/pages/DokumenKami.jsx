import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, FileText, ExternalLink, Plus,
    Trash2, X, FileType, ArrowLeft
} from 'lucide-react';

// Asset Path (Samakan dengan NewsHero)
import logoBrin from '../assets/logo-brin-decs.png';
import logoBerakhlak from '../assets/logo-berakhlak.png';

export default function DokumenKami({ userRole }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Semua");
    const [documents, setDocuments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ judul: '', kategori: 'PANDUAN', link: '' });

    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    // Load Data
    useEffect(() => {
        const savedDocs = JSON.parse(localStorage.getItem('data_dokumen_bosdm') || '[]');
        setDocuments(savedDocs);
    }, []);

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

    const categories = ["Semua", "PERATURAN", "PANDUAN", "TEMPLATE", "SOP", "LAPORAN"];
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.judul.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "Semua" || doc.kategori === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [documents, searchTerm, filterCategory]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* --- 1. NAVBAR IDENTITAS --- */}
            <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-[60] shadow-sm">
                <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
                    <div className="flex justify-start">
                        <img
                            src={logoBrin} alt="BRIN"
                            className="h-10 w-auto object-contain cursor-pointer"
                            onClick={() => navigate('/')}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1 className="text-xs md:text-[13px] font-black text-slate-900 uppercase tracking-[0.1em] leading-tight">
                            DASHBOARD BIRO ORGANISASI DAN <br className="hidden md:block" />
                            SUMBER DAYA MANUSIA BRIN
                        </h1>
                    </div>
                    <div className="flex justify-end">
                        <img src={logoBerakhlak} alt="BerAKHLAK" className="h-8 w-auto object-contain" />
                    </div>
                </div>
            </nav>

            {/* --- 2. KONTEN UTAMA --- */}
            <main className="max-w-6xl mx-auto px-6 py-8">

                {/* TOMBOL KEMBALI KE DASHBOARD */}
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 mb-8 text-slate-400 hover:text-blue-600 transition-all"
                >
                    <div className="p-2 rounded-full group-hover:bg-blue-50 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kembali ke Dashboard</span>
                </button>

                {/* HEADER HALAMAN */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-slate-900 rounded-3xl shadow-xl">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Dokumen Kami</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Pusat Tautan & Arsip Digital</p>
                        </div>
                    </div>

                    {/* SEARCH & ADD ACTION */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text" placeholder="Cari judul..."
                                className="pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold w-full md:w-72 focus:border-blue-500 outline-none transition-all shadow-sm"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* FILTER CATEGORY PILLS */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat} onClick={() => setFilterCategory(cat)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                                    : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* TABEL DOKUMEN (STYLE LINKTREE) */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border-4 border-white overflow-hidden mb-20">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <th className="px-8 py-6 text-center w-24">No.</th>
                                <th className="px-6 py-6">Judul Dokumen</th>
                                <th className="px-6 py-6">Kategori</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
                                <tr key={doc.id} className="group hover:bg-blue-50/50 transition-all">
                                    <td className="px-8 py-8 text-center text-sm font-black text-slate-200">{index + 1}</td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors shadow-sm">
                                                <FileType className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-tight">{doc.judul}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                                            {doc.kategori}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center justify-end gap-3">
                                            <a
                                                href={doc.link} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                                            >
                                                Buka <ExternalLink className="w-4 h-4" />
                                            </a>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center opacity-20 font-black uppercase tracking-[0.5em] text-sm italic">
                                        Data Dokumen Kosong
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* MODAL INPUT (ADMIN ONLY) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/95" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border-4 border-white">
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-slate-900">Input Dokumen</h2>
                        <form onSubmit={handleAddDocument} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Dokumen</label>
                                <input
                                    required type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl mt-2 text-sm font-bold focus:border-blue-500 outline-none"
                                    placeholder="Contoh: SOP Cuti Tahunan"
                                    value={newDoc.judul} onChange={(e) => setNewDoc({ ...newDoc, judul: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</label>
                                <select
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl mt-2 text-sm font-bold outline-none"
                                    value={newDoc.kategori} onChange={(e) => setNewDoc({ ...newDoc, kategori: e.target.value })}
                                >
                                    {categories.filter(c => c !== "Semua").map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Link Dokumen (URL)</label>
                                <input
                                    required type="url" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl mt-2 text-sm font-bold focus:border-blue-500 outline-none"
                                    placeholder="https://google-drive.com/..."
                                    value={newDoc.link} onChange={(e) => setNewDoc({ ...newDoc, link: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-4 shadow-xl hover:bg-slate-900 transition-all">
                                Simpan ke Arsip
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}