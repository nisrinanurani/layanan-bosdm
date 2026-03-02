import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar as CalendarIcon, ChevronDown, X,
    Newspaper, Image as ImageIcon, ArrowLeft,
    Edit3, Trash2, Eye, LayoutGrid, AlertCircle
} from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === STATE UTAMA ===
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [selectedDate, setSelectedDate] = useState('');

    // Daftar Kategori Tetap
    const categories = ['BERITA', 'FLYER'];

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    // === LOGIC FILTER (OTOMATIS) ===
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'Semua' || item.tipe.toUpperCase() === filterCategory.toUpperCase();
            // Cek apakah item.waktu (string ISO/Date) mengandung string selectedDate (YYYY-MM-DD)
            const matchesDate = !selectedDate || (item.waktu && item.waktu.includes(selectedDate));

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [data, searchTerm, filterCategory, selectedDate]);

    // === LOGIC ACTION ===
    const handleToggleHero = (id) => {
        if (!isAdmin) return;
        const currentHeroCount = data.filter(i => i.isHero).length;
        const target = data.find(i => i.id === id);

        if (!target.isHero && currentHeroCount >= 10) {
            alert("⚠️ Batas Maksimal! Sorotan utama sudah penuh (10/10).");
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

    const heroItems = data.filter(item => item.isHero).slice(0, 10);

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

                {/* PREVIEW SOROTAN */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Preview Sorotan ({heroItems.length}/10)</h2>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                        {heroItems.map((hero) => (
                            <div key={hero.id} className="min-w-[280px] h-36 bg-slate-900 rounded-[2rem] relative overflow-hidden shrink-0 border-4 border-white shadow-md">
                                <img src={hero.tipe === 'BERITA' ? hero.gambar : hero.flyer} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                    <h3 className="text-white text-[10px] font-black uppercase line-clamp-2 leading-tight">{hero.judul}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mb-8">
                    <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic">BERITA & FLYER</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Pusat Informasi Biro Organisasi dan SDM BRIN</p>
                </div>

                {/* --- FILTER BAR (KAPSUL STYLE) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">

                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Cari judul konten..."
                                className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-slate-200 bg-white outline-none shadow-sm font-medium text-sm focus:border-blue-600 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Kapsul Filter (Tanggal | Kategori) */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-[1.5rem] shadow-sm w-full md:w-auto overflow-hidden">

                            {/* Filter Tanggal */}
                            <div className="relative flex items-center gap-3 px-6 py-4 border-r border-slate-100 group cursor-pointer hover:bg-slate-50 transition-all">
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
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

                            {/* Filter Kategori */}
                            <div className="relative flex items-center px-6 py-4 min-w-[180px] cursor-pointer hover:bg-slate-50 transition-all group">
                                <select
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="Semua">Semua Kategori</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <span className={`text-sm font-bold flex-1 ${filterCategory !== 'Semua' ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {filterCategory === 'Semua' ? 'Kategori' : filterCategory}
                                </span>
                                <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <button onClick={() => navigate('/berita-kami/editor')} className="w-full lg:w-auto bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> Unggah Baru
                        </button>
                    )}
                </div>

                {/* TABEL */}
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
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <tr key={item.id} className="group hover:bg-blue-50/10 transition-all">
                                    {isAdmin && (
                                        <td className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={item.isHero || false} onChange={() => handleToggleHero(item.id)} className="sr-only" />
                                                    <div className={`w-7 h-7 border-2 rounded-lg transition-all flex items-center justify-center ${item.isHero ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-slate-200'}`}>
                                                        {item.isHero && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </label>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                                <img src={item.tipe === 'BERITA' ? item.gambar : item.flyer} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 uppercase text-sm group-hover:text-blue-600 transition-colors mb-1">{item.judul}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID') : '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase ${item.tipe === 'BERITA' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {item.tipe}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center gap-6 items-center">
                                            <button onClick={() => navigate(`/berita/${item.id}`)} className="text-slate-300 hover:text-blue-600"><Eye className="w-5 h-5" /></button>
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} className="text-slate-300 hover:text-amber-500"><Edit3 className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={isAdmin ? 4 : 3} className="p-24 text-center text-slate-300 font-bold uppercase text-xs italic tracking-widest">Data tidak ditemukan</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}