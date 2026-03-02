import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar, ChevronDown, X,
    Newspaper, Image as ImageIcon, ArrowLeft,
    Edit3, Trash2, Eye, LayoutGrid, Star,
    AlertCircle
} from 'lucide-react';

// Pastikan path logo sesuai dengan folder project kamu
import logoBrin from '../assets/logo-brin-decs.png';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // --- STATE UTAMA ---
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');

    const categories = ['BERITA', 'FLYER'];

    // --- LOAD DATA AWAL ---
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    // --- LOGIC: PREVIEW SOROTAN BERANDA ---
    const heroItems = useMemo(() => {
        return data.filter(item => item.isHero).slice(0, 10);
    }, [data]);

    // --- LOGIC: FILTER TABEL ---
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = (item.judul || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'Semua' ||
                (item.tipe || "").toUpperCase() === filterCategory.toUpperCase();
            const matchesDate = !selectedDate || (item.waktu && item.waktu.includes(selectedDate));

            return matchesSearch && matchesCategory && matchesDate;
        }).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
    }, [data, searchTerm, filterCategory, selectedDate]);

    // --- HANDLER: TOGGLE HERO (NAIK/TURUN BERANDA) ---
    const toggleHero = (id) => {
        const target = data.find(item => item.id === id);

        // Proteksi: Maksimal 10 konten di beranda
        if (!target.isHero && heroItems.length >= 10) {
            alert("Maksimal 10 konten di beranda. Matikan konten lain dulu!");
            return;
        }

        const updatedData = data.map(item =>
            item.id === id ? { ...item, isHero: !item.isHero } : item
        );

        setData(updatedData);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updatedData));
    };

    // --- HANDLER: HAPUS ---
    const handleDelete = (id) => {
        if (window.confirm('Yakin ingin menghapus konten ini?')) {
            const updatedData = data.filter(item => item.id !== id);
            setData(updatedData);
            localStorage.setItem('data_berita_bosdm', JSON.stringify(updatedData));
        }
    };

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

            {/* 2. AREA KONTEN */}
            <div className="max-w-7xl mx-auto p-6 md:p-8">

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Manajemen Berita</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Atur konten publikasi yang tayang di aplikasi BOSDM.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/berita-kami/editor')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Unggah Baru
                        </button>
                    )}
                </div>

                {/* 3. PREVIEW BERANDA (CARD SLIDER) */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-5">
                        <LayoutGrid className="w-5 h-5 text-blue-600" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Preview Beranda ({heroItems.length}/10)</h2>
                    </div>

                    {heroItems.length > 0 ? (
                        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
                            {heroItems.map((hero) => (
                                <div key={hero.id} className="min-w-[280px] h-40 bg-slate-900 rounded-[2rem] relative overflow-hidden shrink-0 border-4 border-white shadow-lg group">
                                    <img
                                        src={hero.tipe === 'BERITA' ? hero.gambar : hero.flyer}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                                        <div className="flex items-center gap-1.5 mb-1 text-yellow-400">
                                            <Star className="w-3 h-3 fill-yellow-400" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{hero.tipe}</span>
                                        </div>
                                        <h3 className="text-white text-xs font-bold line-clamp-2 uppercase leading-tight">{hero.judul}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Belum ada konten terpilih untuk beranda</p>
                        </div>
                    )}
                </section>

                {/* 4. FILTER BAR (STYLE SEMUALINK) */}
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

                {/* 5. TABEL DATA UTAMA */}
                <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest">
                                <tr>
                                    <th className="p-5 w-16 text-center">No</th>
                                    <th className="p-5">Isi Informasi</th>
                                    <th className="p-5 text-center">Tipe</th>
                                    <th className="p-5 text-center">Waktu</th>
                                    <th className="p-5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.length > 0 ? filteredData.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="p-5 text-center text-slate-300 font-bold">{idx + 1}.</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <img src={item.tipe === 'BERITA' ? item.gambar : item.flyer} className="w-12 h-8 rounded object-cover bg-slate-100 shrink-0" alt="" />
                                                <span className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                    {item.judul}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.tipe === 'BERITA' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                                                }`}>
                                                {item.tipe}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center text-slate-500 font-bold uppercase">
                                            {item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-3">
                                                {/* Tombol Toggle Beranda (Star) */}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => toggleHero(item.id)}
                                                        className={`p-2 rounded-xl transition-all border shadow-sm ${item.isHero
                                                                ? 'bg-yellow-400 border-yellow-500 text-white'
                                                                : 'bg-white border-slate-100 text-slate-300 hover:text-yellow-500'
                                                            }`}
                                                        title="Tampilkan di Beranda"
                                                    >
                                                        <Star className={`w-4 h-4 ${item.isHero ? 'fill-white' : ''}`} />
                                                    </button>
                                                )}

                                                <button onClick={() => navigate(`/berita/${item.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100"><Eye className="w-4 h-4" /></button>

                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100"><Edit3 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="p-16 text-center text-slate-400 italic font-bold uppercase tracking-widest opacity-30">Data tidak ditemukan</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}