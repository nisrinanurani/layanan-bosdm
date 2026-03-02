import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar, ChevronDown, X,
    Newspaper, Image as ImageIcon, ArrowLeft,
    Edit3, Trash2, Eye, LayoutGrid, AlertCircle
} from 'lucide-react';
import logoBrin from '../assets/logo-brin-decs.png';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === 1. PASTIKAN STATE INI ADA SEMUA ===
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua'); // Harus 'Semua'

    // === 2. DEFINISIKAN KATEGORI AGAR TIDAK ERROR ===
    const categories = ['BERITA', 'FLYER'];

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    // === 3. FILTERING LOGIC (BAGIAN PALING RAWAN BLANK) ===
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Cek search term (aman)
            const matchesSearch = item.judul?.toLowerCase().includes(searchTerm.toLowerCase());

            // Cek Kategori (Pastikan field di JSON-mu namanya 'tipe')
            const matchesCategory = filterCategory === 'Semua' ||
                item.tipe?.toUpperCase() === filterCategory.toUpperCase();

            // Cek Tanggal (Pastikan field di JSON-mu namanya 'waktu')
            const matchesDate = !selectedDate || (item.waktu && item.waktu.includes(selectedDate));

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [data, searchTerm, filterCategory, selectedDate]);

    // Jika filteredData error, layar bakal blank. 
    // Makanya kita tambahkan optional chaining (?.) di atas.
    {/* NAVBAR */ }
    <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />

            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
        </div>
    </nav>

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">



                {/* Judul Halaman */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 uppercase">Manajemen Berita</h1>
                    <p className="text-slate-500 text-sm">Kelola berita dan flyer promosi di sini.</p>
                </div>

                {/* --- FILTER BAR (STYLE SEMUALINK) --- */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari judul..."
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>

                    {/* Filter Kotak (Tanggal | Kategori) */}
                    <div className="flex items-center bg-white p-1 border border-slate-200 rounded-lg shadow-sm">
                        <input
                            type="date"
                            className="px-3 py-1.5 text-xs text-slate-600 outline-none bg-transparent cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select
                            className="px-3 py-1.5 text-xs text-slate-600 bg-transparent outline-none cursor-pointer"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="Semua">Semua Kategori</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/berita-kami/editor')}
                            className="ml-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> Tambah Data
                        </button>
                    )}
                </div>

                {/* TABEL DATA */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Judul</th>
                                <th className="p-4 text-center">Tipe</th>
                                <th className="p-4 text-center">Waktu</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-center text-slate-400">{idx + 1}.</td>
                                    <td className="p-4 font-bold text-slate-800">{item.judul}</td>
                                    <td className="p-4 text-center">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase">
                                            {item.tipe}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-slate-500">
                                        {item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => navigate(`/berita/${item.id}`)} className="text-blue-500"><Eye className="w-4 h-4" /></button>
                                            {isAdmin && (
                                                <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} className="text-amber-500"><Edit3 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}