import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar, ChevronDown,
    Newspaper, Image as ImageIcon, ArrowLeft,
    Edit3, Trash2, Eye, LayoutGrid, AlertCircle
} from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipe, setFilterTipe] = useState('Semua Kategori');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    // Logic Toggle Sorotan Beranda dengan Checkbox & Limit 10
    const handleToggleHero = (id) => {
        if (!isAdmin) return;

        const currentHeroCount = data.filter(i => i.isHero).length;
        const target = data.find(i => i.id === id);

        // Proteksi Limit 10
        if (!target.isHero && currentHeroCount >= 10) {
            alert("⚠️ Batas Maksimal! Slot sorotan halaman depan sudah penuh (10/10). Hilangkan pilihan lain terlebih dahulu.");
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

    // Filter Data untuk Preview & Tabel
    const heroItems = data.filter(item => item.isHero).slice(0, 10);
    const currentHeroCount = heroItems.length;
    const filteredData = data.filter(item => {
        const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterTipe === 'Semua Kategori' || item.tipe === filterTipe;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-brand-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-[1600px] mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-primary p-2 rounded-xl shadow-lg shadow-brand-blue-100">
                            <Newspaper className="w-6 h-6 text-white" />
                        </div>
                        <div className="h-6 w-px bg-brand-gray-200"></div>
                        <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Manajemen Konten</h2>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-brand-primary transition-all">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
                    </button>
                </header>

                {/* SECTION: PREVIEW SOROTAN UTAMA */}
                <section className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5 text-brand-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-brand-dark">
                                Preview Sorotan Utama Beranda ({currentHeroCount}/10)
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight">
                                Catatan: Maksimal 10 konten pilihan yang akan ditayangkan di halaman depan.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                        {heroItems.length > 0 ? heroItems.map((hero) => (
                            <div key={hero.id} className="min-w-[280px] h-40 bg-brand-dark rounded-[2.5rem] relative overflow-hidden group shadow-xl border-4 border-white shrink-0">
                                <img src={hero.tipe === 'BERITA' ? hero.gambar : hero.flyer} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 to-transparent p-6 flex flex-col justify-end">
                                    <span className="text-[8px] font-black text-brand-primary bg-white px-2 py-0.5 rounded-full w-fit mb-2 uppercase">{hero.tipe}</span>
                                    <h3 className="text-white text-[10px] font-black uppercase leading-tight line-clamp-2">{hero.judul}</h3>
                                </div>
                            </div>
                        )) : (
                            <div className="w-full py-10 border-2 border-dashed border-brand-gray-200 rounded-[2.5rem] flex items-center justify-center bg-white/50">
                                <p className="text-brand-gray-300 font-bold uppercase text-[10px] tracking-[0.3em]">Ceklis pada tabel untuk memilih sorotan</p>
                            </div>
                        )}
                    </div>
                </section>

                <div className="mb-10">
                    <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-2 italic">BERITA & FLYER</h1>
                    <p className="text-brand-gray-400 font-bold text-sm uppercase tracking-widest">Layanan Informasi Publikasi BOSDM</p>
                </div>

                {/* FILTER & SEARCH AREA */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-300" />
                            <input
                                type="text"
                                placeholder="Cari judul konten..."
                                className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-brand-gray-200 bg-white outline-none shadow-sm font-medium text-sm focus:border-brand-primary transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center bg-white border border-brand-gray-200 rounded-[1.5rem] shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-r border-brand-gray-100 cursor-pointer hover:bg-brand-gray-50 transition-colors">
                                <span className="text-brand-gray-400 text-sm font-medium">Semua Tanggal</span>
                                <Calendar className="w-5 h-5 text-brand-gray-300" />
                            </div>
                            <div className="px-6 py-4 flex items-center gap-8 min-w-[180px] cursor-pointer hover:bg-brand-gray-50 transition-colors">
                                <span className="text-brand-gray-400 text-sm font-medium">{filterTipe}</span>
                                <ChevronDown className="w-5 h-5 text-brand-gray-300" />
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={() => navigate('/berita-kami/editor')} className="w-full md:w-auto bg-brand-dark text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-blue-100 hover:bg-brand-primary transition-all flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> Unggah Konten Baru
                        </button>
                    )}
                </div>

                {/* TABLE MANAJEMEN */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-brand-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-brand-gray-50 bg-brand-gray-50/20">
                                {isAdmin && <th className="p-8 font-black text-[11px] uppercase text-brand-gray-300 text-center">Sorotan</th>}
                                <th className="p-8 font-black text-[11px] uppercase tracking-widest text-brand-gray-300">Info Konten</th>
                                <th className="p-8 font-black text-[11px] uppercase tracking-widest text-brand-gray-300 text-center">Tipe</th>
                                <th className="p-8 font-black text-[11px] uppercase tracking-widest text-brand-gray-300 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray-50">
                            {filteredData.map((item, idx) => (
                                <tr key={item.id} className={`hover:bg-brand-blue-50/20 transition-all group ${item.isHero ? 'bg-brand-blue-50/5' : ''}`}>
                                    {isAdmin && (
                                        <td className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isHero || false}
                                                        onChange={() => handleToggleHero(item.id)}
                                                        disabled={!item.isHero && currentHeroCount >= 10}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`
                                                        w-7 h-7 border-2 rounded-lg transition-all flex items-center justify-center
                                                        ${item.isHero
                                                            ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-blue-100'
                                                            : 'bg-white border-brand-gray-200 hover:border-brand-primary'}
                                                        ${(!item.isHero && currentHeroCount >= 10) ? 'opacity-20 cursor-not-allowed bg-brand-gray-100' : ''}
                                                    `}>
                                                        {item.isHero && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-14 rounded-xl bg-brand-dark flex-shrink-0 overflow-hidden shadow-sm">
                                                <img src={item.tipe === 'BERITA' ? item.gambar : item.flyer} className="w-full h-full object-cover" alt="thumb" />
                                            </div>
                                            <div>
                                                <div className="font-black text-brand-dark uppercase text-sm group-hover:text-brand-primary transition-colors mb-1 leading-tight">{item.judul}</div>
                                                <div className="text-[10px] font-bold text-brand-gray-300 uppercase tracking-widest italic">{item.waktu}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <div className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-black text-[10px] uppercase w-fit mx-auto ${item.tipe === 'BERITA' ? 'bg-brand-blue-50 text-brand-primary' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {item.tipe === 'BERITA' ? <Newspaper className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                                            {item.tipe}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center items-center gap-6">
                                            <button onClick={() => navigate(`/berita/${item.id}`)} title="Lihat"><Eye className="w-5 h-5 text-brand-gray-200 hover:text-brand-primary transition-colors" /></button>
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} title="Edit"><Edit3 className="w-5 h-5 text-brand-gray-200 hover:text-amber-500 transition-colors" /></button>
                                                    <button onClick={() => handleDelete(item.id)} title="Hapus"><Trash2 className="w-5 h-5 text-brand-gray-200 hover:text-red-500 transition-colors" /></button>
                                                </>
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