import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, FileText, ExternalLink, Plus,
    Trash2, X, FileType, ArrowLeft,
    ChevronDown, Filter
} from 'lucide-react';

// Asset Path
import logoBrin from '../assets/logo-brin-decs.png';

export default function DokumenKami({ userRole }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Semua");
    const [documents, setDocuments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ judul: '', kategori: 'PANDUAN', link: '' });

    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

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

            {/* 1. NAVBAR */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto px-6 py-12">

                {/* --- HEADER CONTROLS --- */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-4 bg-white px-8 py-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-4 border-white hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kembali</span>
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative group w-full md:w-80 text-slate-900">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text" placeholder="Cari Judul..."
                                className="w-full pl-14 pr-8 py-5 bg-white border-4 border-white rounded-[2.5rem] text-sm font-black uppercase shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative w-full md:w-64 group text-slate-900">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 pointer-events-none z-10" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full pl-14 pr-12 py-5 bg-white border-4 border-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/50 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-100 transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat === "Semua" ? "Semua Kategori" : cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {isAdmin && (
                            <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto p-5 bg-blue-600 text-white rounded-[2.5rem] shadow-xl border-4 border-white hover:bg-slate-900 transition-all">
                                <Plus className="w-6 h-6 mx-auto" />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- TABEL --- */}
                <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/60 border-4 border-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50 text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">
                                    <th className="px-12 py-10 text-center w-28">No.</th>
                                    <th className="px-8 py-10 italic">Judul Dokumen</th>
                                    <th className="px-10 py-10 text-center">Kategori</th>
                                    <th className="px-12 py-10 text-right w-48">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
                                    <tr key={doc.id} className="group hover:bg-blue-50/50 transition-all">
                                        <td className="px-12 py-10 text-center text-sm font-black text-slate-200">{index + 1}</td>
                                        <td className="px-8 py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-white transition-all shadow-sm">
                                                    <FileType className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                                                </div>
                                                <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{doc.judul}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 text-center">
                                            <span className="px-6 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                                                {doc.kategori}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center justify-end gap-3">
                                                <a href={doc.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                                                    Buka
                                                </a>
                                                {isAdmin && (
                                                    <button onClick={() => handleDelete(doc.id)} className="p-4 bg-red-50 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all shadow-sm border-4 border-white">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-48 text-center opacity-10 font-black uppercase tracking-[1em] text-xs italic text-slate-900">Data Kosong</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* --- MODAL INPUT --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/95" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl border-4 border-white">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-slate-900">Input Data</h2>
                        <form onSubmit={handleAddDocument} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Judul</label>
                                <input required type="text" className="w-full p-6 bg-slate-50 border-4 border-slate-50 rounded-[1.8rem] mt-2 text-sm font-bold outline-none focus:border-blue-500 transition-all" value={newDoc.judul} onChange={(e) => setNewDoc({ ...newDoc, judul: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kategori</label>
                                <select className="w-full p-6 bg-slate-50 border-4 border-slate-50 rounded-[1.8rem] mt-2 text-sm font-bold outline-none cursor-pointer focus:border-blue-500 text-slate-900" value={newDoc.kategori} onChange={(e) => setNewDoc({ ...newDoc, kategori: e.target.value })} >
                                    {categories.filter(c => c !== "Semua").map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">URL Dokumen</label>
                                <input required type="url" className="w-full p-6 bg-slate-50 border-4 border-slate-50 rounded-[1.8rem] mt-2 text-sm font-bold outline-none focus:border-blue-500" value={newDoc.link} onChange={(e) => setNewDoc({ ...newDoc, link: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-[11px] mt-6 shadow-xl hover:bg-slate-900 transition-all">Simpan</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}