import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar as CalendarIcon, ChevronDown,
    Newspaper, Image as ImageIcon, ArrowLeft,
    Edit3, Trash2, Eye, LayoutGrid, AlertCircle, X
} from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // States
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipe, setFilterTipe] = useState('Semua Kategori');
    const [filterTanggal, setFilterTanggal] = useState('');
    const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowKategoriDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Logic Toggle Sorotan Beranda
    const handleToggleHero = (id) => {
        if (!isAdmin) return;
        const currentHeroCount = data.filter(i => i.isHero).length;
        const target = data.find(i => i.id === id);

        if (!target.isHero && currentHeroCount >= 10) {
            alert("⚠️ Batas Maksimal 10 Konten!");
            return;
        }

        const updatedData = data.map(item => {
            if (item.id === id) return { ...item, isHero: !item.isHero };
            return item;
        });

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

    // CORE LOGIC: FILTERING SYSTEM
    const filteredData = data.filter(item => {
        const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterTipe === 'Semua Kategori' || item.tipe.toUpperCase() === filterTipe.toUpperCase();

        // Filter Tanggal (Menyamakan format YYYY-MM-DD)
        const itemDate = new Date(item.waktu).toISOString().split('T')[0];
        const matchesDate = !filterTanggal || itemDate === filterTanggal;

        return matchesSearch && matchesType && matchesDate;
    });

    const heroItems = data.filter(item => item.isHero).slice(0, 10);
    const currentHeroCount = heroItems.length;

    return (
        <div className="min-h-screen bg-brand-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-[1600px] mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-primary p-2 rounded-xl shadow-lg">
                            <Newspaper className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Manajemen Konten</h2>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-brand-primary transition-all">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </header>

                {/* PREVIEW SECTION (SOROTAN) */}
                <section className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5 text-brand-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-brand-dark">Preview Sorotan Utama ({currentHeroCount}/10)</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Catatan: Maksimal 10 konten pilihan untuk slide utama.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                        {heroItems.map((hero) => (
                            <div key={hero.id} className="min-w-[280px] h-40 bg-brand-dark rounded-[2.5rem] relative overflow-hidden shrink-0 border-4 border-white shadow-xl">
                                <img src={hero.tipe === 'BERITA' ? hero.gambar : hero.flyer} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                                <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-brand-dark/90 to-transparent">
                                    <h3 className="text-white text-[10px] font-black uppercase line-clamp-2">{hero.judul}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FILTER & SEARCH ENGINE */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-300" />
                            <input
                                type="text"
                                placeholder="Cari judul..."
                                className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-brand-gray-200 bg-white outline-none font-medium text-sm focus:border-brand-primary transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Combined Interactive Filter */}
                        <div className="flex items-center bg-white border border-brand-gray-200 rounded-[1.5rem] shadow-sm overflow-visible w-full md:w-auto">

                            {/* Filter Tanggal (HTML5 Date Input) */}
                            <div className="relative flex items-center gap-3 px-6 py-4 border-r border-brand-gray-100 group">
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    value={filterTanggal}
                                    onChange={(e) => setFilterTanggal(e.target.value)}
                                />
                                <span className={`text-sm font-medium ${filterTanggal ? 'text-brand-primary' : 'text-brand-gray-400'}`}>
                                    {filterTanggal ? new Date(filterTanggal).toLocaleDateString('id-ID') : 'Semua Tanggal'}
                                </span>
                                <CalendarIcon className="w-5 h-5 text-brand-gray-300 group-hover:text-brand-primary transition-colors" />
                                {filterTanggal && (
                                    <button onClick={() => setFilterTanggal('')} className="z-20 ml-1">
                                        <X className="w-4 h-4 text-red-400" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Kategori Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => setShowKategoriDropdown(!showKategoriDropdown)}
                                    className="px-6 py-4 flex items-center gap-8 cursor-pointer hover:bg-brand-gray-50 transition-colors min-w-[180px]"
                                >
                                    <span className="text-brand-gray-400 text-sm font-medium">{filterTipe}</span>
                                    <ChevronDown className={`w-5 h-5 text-brand-gray-300 transition-transform ${showKategoriDropdown ? 'rotate-180' : ''}`} />
                                </div>

                                {showKategoriDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-brand-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                                        {['Semua Kategori', 'BERITA', 'FLYER'].map((cat) => (
                                            <div
                                                key={cat}
                                                onClick={() => {
                                                    setFilterTipe(cat);
                                                    setShowKategoriDropdown(false);
                                                }}
                                                className="px-6 py-3 text-sm font-bold text-brand-dark hover:bg-brand-blue-50 hover:text-brand-primary cursor-pointer transition-colors"
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
                        <button onClick={() => navigate('/berita-kami/editor')} className="w-full md:w-auto bg-brand-dark text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-brand-primary transition-all flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> Unggah Baru
                        </button>
                    )}
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-brand-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-brand-gray-50/50">
                            <tr>
                                {isAdmin && <th className="p-8 font-black text-[11px] text-brand-gray-300 text-center">SOROTAN</th>}
                                <th className="p-8 font-black text-[11px] text-brand-gray-300">ISI KONTEN</th>
                                <th className="p-8 font-black text-[11px] text-brand-gray-300 text-center">KATEGORI</th>
                                <th className="p-8 font-black text-[11px] text-brand-gray-300 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray-50">
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <tr key={item.id} className="group hover:bg-brand-blue-50/10 transition-all">
                                    {isAdmin && (
                                        <td className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={item.isHero || false} onChange={() => handleToggleHero(item.id)} disabled={!item.isHero && currentHeroCount >= 10} className="sr-only" />
                                                    <div className={`w-7 h-7 border-2 rounded-lg transition-all flex items-center justify-center ${item.isHero ? 'bg-brand-primary border-brand-primary' : 'bg-white border-brand-gray-200'}`}>
                                                        {item.isHero && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </label>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <img src={item.tipe === 'BERITA' ? item.gambar : item.flyer} className="w-20 h-14 rounded-xl object-cover bg-brand-dark" alt="" />
                                            <div>
                                                <div className="font-black text-brand-dark uppercase text-sm group-hover:text-brand-primary transition-colors">{item.judul}</div>
                                                <div className="text-[10px] font-bold text-brand-gray-300 italic uppercase">{new Date(item.waktu).toLocaleDateString('id-ID')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase ${item.tipe === 'BERITA' ? 'bg-brand-blue-50 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {item.tipe}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center gap-6 items-center">
                                            <button onClick={() => navigate(`/berita/${item.id}`)}><Eye className="w-5 h-5 text-brand-gray-200 hover:text-brand-primary" /></button>
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)}><Edit3 className="w-5 h-5 text-brand-gray-200 hover:text-amber-500" /></button>
                                                    <button onClick={() => handleDelete(item.id)}><Trash2 className="w-5 h-5 text-brand-gray-200 hover:text-red-500" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-20 text-center text-brand-gray-300 font-bold uppercase text-xs italic tracking-widest">Data tidak ditemukan</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}