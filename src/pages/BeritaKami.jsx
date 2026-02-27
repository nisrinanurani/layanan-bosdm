import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar as CalendarIcon, ChevronDown,
    Newspaper, Image as ImageIcon, ArrowLeft,
    Edit3, Trash2, Eye, LayoutGrid, AlertCircle, X
} from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === STATE DATA ===
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('data_berita_bosdm');
        return saved ? JSON.parse(saved) : [];
    });

    // === STATE FILTER & UI ===
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipe, setFilterTipe] = useState('Semua Kategori');
    const [selectedDate, setSelectedDate] = useState('');
    const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Menutup dropdown kategori saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowKategoriDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // === LOGIC TOGGLE SOROTAN (LIMIT 10) ===
    const handleToggleHero = (id) => {
        if (!isAdmin) return;
        const currentHeroCount = data.filter(i => i.isHero).length;
        const target = data.find(i => i.id === id);

        if (!target.isHero && currentHeroCount >= 10) {
            alert("⚠️ Batas Maksimal! Slot sorotan halaman depan sudah penuh (10/10).");
            return;
        }

        const updatedData = data.map(item =>
            item.id === id ? { ...item, isHero: !item.isHero } : item
        );
        setData(updatedData);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updatedData));
    };

    const handleDelete = (id) => {
        if (window.confirm("Hapus konten ini secara permanen?")) {
            const updated = data.filter(item => item.id !== id);
            setData(updated);
            localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        }
    };

    // === CORE FILTERING LOGIC ===
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterTipe === 'Semua Kategori' || item.tipe.toUpperCase() === filterTipe.toUpperCase();
            // Menyamakan format tanggal untuk filter
            const matchesDate = !selectedDate || (item.waktu && item.waktu.includes(selectedDate));

            return matchesSearch && matchesType && matchesDate;
        });
    }, [data, searchTerm, filterTipe, selectedDate]);

    const heroItems = data.filter(item => item.isHero).slice(0, 10);
    const currentHeroCount = heroItems.length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
            <div className="max-w-[1600px] mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                            <Newspaper className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Manajemen Konten</h2>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </header>

                {/* SECTION: PREVIEW SOROTAN (BOX ATAS) */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Preview Sorotan Utama ({currentHeroCount}/10)</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <p className="text-[9px] font-black text-amber-700 uppercase tracking-tight">Catatan: Maksimal 10 konten pilihan untuk slide utama.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                        {heroItems.map((hero) => (
                            <div key={hero.id} className="min-w-[280px] h-36 bg-slate-900 rounded-[2rem] relative overflow-hidden shrink-0 border-4 border-white shadow-md">
                                <img src={hero.tipe === 'BERITA' ? hero.gambar : hero.flyer} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                                <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-slate-900/90 to-transparent">
                                    <h3 className="text-white text-[10px] font-black uppercase line-clamp-2 leading-tight">{hero.judul}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mb-8">
                    <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic tracking-tighter">BERITA & FLYER</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Pusat Informasi Biro Organisasi dan SDM BRIN</p>
                </div>

                {/* --- FILTER BAR PREMIUM (SEARCH + TANGGAL + KATEGORI) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">

                        {/* Search Input */}
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari judul konten..."
                                className="w-full pl-14 pr-6 py-4 rounded-[1.2rem] border border-slate-200 bg-white outline-none font-medium text-sm focus:border-blue-600 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Kotak Gabungan (Tanggal | Kategori) */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-[1.2rem] shadow-sm overflow-visible w-full md:w-auto">

                            {/* Filter Tanggal */}
                            <div className="relative flex items-center gap-4 px-6 py-4 border-r border-slate-100 group cursor-pointer hover:bg-slate-50 transition-all">
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                                <span className={`text-sm font-bold ${selectedDate ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID') : 'dd/mm/yyyy'}
                                </span>
                                <CalendarIcon className={`w-5 h-5 ${selectedDate ? 'text-blue-600' : 'text-slate-300'} group-hover:text-blue-600`} />
                                {selectedDate && (
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedDate(''); }} className="z-30 ml-1">
                                        <X className="w-3 h-3 text-red-400 hover:text-red-600" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Kategori Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => setShowKategoriDropdown(!showKategoriDropdown)}
                                    className="px-8 py-4 flex items-center gap-10 cursor-pointer hover:bg-slate-50 transition-colors min-w-[200px] justify-between group"
                                >
                                    <span className={`text-sm font-bold ${filterTipe !== 'Semua Kategori' ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {filterTipe}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-transform ${showKategoriDropdown ? 'rotate-180' : ''}`} />
                                </div>

                                {showKategoriDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2 shadow-blue-900/10">
                                        {['Semua Kategori', 'BERITA', 'FLYER'].map((cat) => (
                                            <div
                                                key={cat}
                                                onClick={() => {
                                                    setFilterTipe(cat);
                                                    setShowKategoriDropdown(false);
                                                }}
                                                className="px-6 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                                            >
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <button onClick={() => navigate('/berita-kami/editor')} className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> Unggah Baru
                        </button>
                    )}
                </div>

                {/* --- TABEL MANAJEMEN --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                {isAdmin && <th className="p-8 text-center">Sorotan</th>}
                                <th className="p-8">Isi Konten</th>
                                <th className="p-8 text-center">Tipe</th>
                                <th className="p-8 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.length > 0 ? filteredData.map((item, idx) => (
                                <tr key={item.id} className="group hover:bg-blue-50/20 transition-all">
                                    {isAdmin && (
                                        <td className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isHero || false}
                                                        onChange={() => handleToggleHero(item.id)}
                                                        disabled={!item.isHero && currentHeroCount >= 10}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-7 h-7 border-2 rounded-lg transition-all flex items-center justify-center ${item.isHero ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-slate-200 hover:border-blue-600'}`}>
                                                        {item.isHero && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </label>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                                                <img src={item.tipe === 'BERITA' ? item.gambar : item.flyer} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 uppercase text-sm group-hover:text-blue-600 transition-colors mb-1">{item.judul}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID') : 'No Date'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-tighter ${item.tipe === 'BERITA' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {item.tipe === 'BERITA' ? '📰 Berita' : '🎨 Flyer'}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center gap-6 items-center">
                                            <button onClick={() => navigate(`/berita/${item.id}`)} className="text-slate-300 hover:text-blue-600 transition-colors"><Eye className="w-5 h-5" /></button>
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} className="text-slate-300 hover:text-amber-500 transition-colors"><Edit3 className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={isAdmin ? 4 : 3} className="p-24 text-center text-slate-300 font-bold uppercase text-xs italic tracking-widest">Tidak ada data ditemukan</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}