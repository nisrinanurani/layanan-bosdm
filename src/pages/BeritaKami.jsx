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

    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');

    const categories = ['BERITA', 'FLYER'];

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.judul?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'Semua' ||
                item.tipe?.toUpperCase() === filterCategory.toUpperCase();
            const matchesDate = !selectedDate || (item.waktu && item.waktu.includes(selectedDate));
            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [data, searchTerm, filterCategory, selectedDate]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* NAVBAR - Dibuat Sticky */}
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

            {/* CONTENT CONTAINER - Ditambah padding top agar tidak nempel navbar */}
            <div className="max-w-7xl mx-auto p-8">
                {/* Judul Halaman */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Manajemen Berita</h1>
                    <p className="text-slate-500 text-sm">Kelola konten berita dan flyer promosi di sini.</p>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari judul..."
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
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
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <select
                            className="px-3 py-1.5 text-xs text-slate-600 bg-transparent outline-none cursor-pointer min-w-[140px]"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="Semua">Semua Kategori</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {/* Tombol Reset Filter (Hanya muncul jika filter aktif) */}
                        {(selectedDate || filterCategory !== 'Semua') && (
                            <button
                                onClick={() => { setSelectedDate(''); setFilterCategory('Semua'); }}
                                className="ml-2 p-1 hover:bg-red-50 rounded-full group"
                                title="Reset Filter"
                            >
                                <X className="w-3 h-3 text-red-400 group-hover:text-red-600" />
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/berita-kami/editor')}
                            className="md:ml-auto w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Tambah Data
                        </button>
                    )}
                </div>

                {/* TABEL DATA */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Judul Konten</th>
                                <th className="p-4 text-center">Tipe</th>
                                <th className="p-4 text-center">Tanggal Terbit</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.length > 0 ? filteredData.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 text-center text-slate-400 font-medium">{idx + 1}.</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {item.judul}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.tipe === 'BERITA' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {item.tipe}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-slate-500 font-medium">
                                        {item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => navigate(`/berita/${item.id}`)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => navigate(`/berita-kami/editor/${item.id}`)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Edit Konten"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400 italic bg-white">
                                        Tidak ada data yang sesuai dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}