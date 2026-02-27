import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Newspaper, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filterTipe, setFilterTipe] = useState('SEMUA');
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    // 1. Logic Toggle Hero dengan Proteksi Limit 10
    const toggleHero = (id) => {
        if (!isAdmin) return;
        const currentHeroCount = data.filter(i => i.isHero === true).length;
        const target = data.find(i => i.id === id);

        // Proteksi Limit 10
        if (!target.isHero && currentHeroCount >= 10) {
            alert("⚠️ Batas Maksimal! Slot halaman depan sudah penuh (10/10). Sembunyikan konten lain terlebih dahulu.");
            return;
        }

        const updated = data.map(item => {
            if (item.id === id) return { ...item, isHero: !item.isHero };
            return item;
        });

        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        setData(updated);
    };

    // 2. Logic Filter Tipe
    const filteredData = data.filter(item => {
        if (filterTipe === 'SEMUA') return true;
        if (filterTipe === 'INFOGRAFIS') return item.tipe === 'FLYER';
        return item.tipe === filterTipe;
    });

    // 3. Counter Slot Beranda
    const currentHeroCount = data.filter(item => item.isHero === true).length;

    return (
        <div className="p-8 bg-brand-gray-50 min-h-screen font-sans">
            {/* HEADER & COUNTER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-brand-gray-400 font-black text-[10px] uppercase tracking-widest mb-4 hover:text-brand-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
                    </button>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-brand-dark leading-none">Manajemen Konten</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mt-3">Layanan Publikasi BOSDM</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all shadow-sm ${currentHeroCount >= 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-blue-50 text-brand-primary border-brand-blue-100'
                        }`}>
                        Slot Beranda: {currentHeroCount} / 10
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/berita-kami/editor')}
                            className="bg-brand-dark text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-primary transition-all shadow-xl shadow-brand-blue-100"
                        >
                            <Plus className="w-4 h-4" /> Unggah Konten Baru
                        </button>
                    )}
                </div>
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex gap-3 mb-8">
                {['SEMUA', 'BERITA', 'INFOGRAFIS'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilterTipe(t)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${filterTipe === t
                                ? 'bg-brand-dark text-white'
                                : 'bg-white text-brand-gray-400 border border-brand-gray-100 hover:border-brand-primary hover:text-brand-primary'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* TABEL DAFTAR KONTEN */}
            <div className="bg-white rounded-[3rem] shadow-xl shadow-brand-blue-100/20 border border-brand-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-brand-gray-50/50 border-b border-brand-gray-100">
                        <tr>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-brand-gray-400">Judul Konten</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 text-center">Kategori</th>
                            {isAdmin && <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 text-center">Status Beranda</th>}
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-50">
                        {filteredData.length > 0 ? filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-brand-blue-50/30 transition-colors group">
                                <td className="p-6">
                                    <div className="font-black text-brand-dark uppercase text-xs mb-1 group-hover:text-brand-primary transition-colors">{item.judul}</div>
                                    <div className="text-[9px] font-bold text-brand-gray-300 uppercase tracking-widest">{new Date(item.waktu).toLocaleDateString()}</div>
                                </td>

                                <td className="p-6 text-center">
                                    <span className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-tighter flex items-center justify-center gap-2 w-fit mx-auto ${item.tipe === 'BERITA'
                                            ? 'bg-brand-blue-50 text-brand-primary'
                                            : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                        {item.tipe === 'BERITA' ? <Newspaper className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                        {item.tipe === 'BERITA' ? 'Berita' : 'Infografis/Flyer'}
                                    </span>
                                </td>

                                {isAdmin && (
                                    <td className="p-6 text-center">
                                        <button
                                            onClick={() => toggleHero(item.id)}
                                            className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${item.isHero
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                                                    : 'bg-brand-gray-100 text-brand-gray-300 hover:bg-brand-gray-200'
                                                }`}
                                        >
                                            {item.isHero ? '● Tayang' : '○ Sembunyi'}
                                        </button>
                                    </td>
                                )}

                                <td className="p-6 text-center">
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => navigate(`/berita/${item.id}`)}
                                            className="text-brand-primary font-black text-[10px] uppercase hover:underline tracking-widest"
                                        >
                                            Baca
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => navigate(`/berita-kami/editor/${item.id}`)}
                                                className="text-amber-600 font-black text-[10px] uppercase hover:underline tracking-widest"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={isAdmin ? 4 : 3} className="p-20 text-center text-brand-gray-300 font-black uppercase text-[10px] tracking-widest italic">
                                    Tidak ada konten ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}