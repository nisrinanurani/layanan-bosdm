import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, FileText, ExternalLink, Plus,
    Trash2, X, FileType, ArrowLeft
} from 'lucide-react';

// Asset Path
import logoBrin from '../assets/logo-brin-decs.png';

export default function DokumenKami({ userRole }) {
    const navigate = useNavigate();

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
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

    const categories = ["PERATURAN", "PANDUAN", "TEMPLATE", "SOP", "LAPORAN"];

    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.judul.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "Semua" || doc.kategori === filterCategory;

            // Logika filter tanggal sederhana berdasarkan ID (timestamp)
            let matchesDate = true;
            if (selectedDate) {
                const docDate = new Date(doc.id).toISOString().split('T')[0];
                matchesDate = docDate === selectedDate;
            }

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [documents, searchTerm, filterCategory, selectedDate]);

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

            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* 2. HEADER TITLE */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Dokumen Kami</h2>
                        <p className="text-sm text-slate-500">Akses berkas dan panduan resmi BOSDM</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Tambah Data
                        </button>
                    )}
                </div>

                {/* 3. FILTER BAR (STYLE SEMUALINK & BERITAKAMI) */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari judul konten..."
                            className="w-full pl-5 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    </div>

                    <div className="flex items-center bg-white p-1 border border-slate-200 rounded-xl shadow-sm w-full md:w-auto">
                        <input
                            type="date"
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 outline-none bg-transparent cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <select
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer min-w-[140px]"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="Semua">Semua Kategori</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {(selectedDate || filterCategory !== 'Semua') && (
                            <button onClick={() => { setSelectedDate(''); setFilterCategory('Semua'); }} className="ml-2 p-1 hover:bg-red-50 rounded-full">
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. DATA TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-6 py-4 text-center w-16">No.</th>
                                    <th className="px-6 py-4">Judul Dokumen</th>
                                    <th className="px-6 py-4 text-center">Kategori</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-center text-sm text-slate-400">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{doc.judul}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase">
                                                {doc.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={doc.link} target="_blank" rel="noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-slate-300 text-sm italic">
                                            Tidak ada dokumen ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* 5. MODAL TAMBAH */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Dokumen</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddDocument} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Judul</label>
                                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="..." value={newDoc.judul} onChange={(e) => setNewDoc({ ...newDoc, judul: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Kategori</label>
                                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={newDoc.kategori} onChange={(e) => setNewDoc({ ...newDoc, kategori: e.target.value })} >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Link</label>
                                <input required type="url" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." value={newDoc.link} onChange={(e) => setNewDoc({ ...newDoc, link: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md mt-4">
                                Simpan Dokumen
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}