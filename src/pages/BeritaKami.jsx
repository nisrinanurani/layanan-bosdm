import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout } from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    const toggleHero = (id) => {
        if (!isAdmin) return;
        const currentHeroCount = data.filter(i => i.isHero).length;
        const target = data.find(i => i.id === id);

        if (!target.isHero && currentHeroCount >= 10) {
            alert("⚠️ Batas Maksimal! Slot halaman depan penuh (10/10).");
            return;
        }

        const updated = data.map(i => i.id === id ? { ...i, isHero: !i.isHero } : i);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        setData(updated);
    };

    return (
        <div className="min-h-screen bg-brand-gray-50 p-10 font-sans">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-brand-dark leading-none">Pusat Konten</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mt-3">Layanan Biro Organisasi & SDM</p>
                </div>
                {isAdmin && (
                    <button onClick={() => navigate('/berita-kami/editor')} className="bg-brand-dark text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-primary transition-all shadow-xl shadow-brand-blue-100">
                        <Plus className="w-4 h-4" /> Unggah Konten Baru
                    </button>
                )}
            </header>

            <div className="bg-white border border-brand-gray-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-gray-50/50 border-b border-brand-gray-100 font-black text-[10px] uppercase tracking-widest text-brand-gray-400">
                            <th className="p-6">Informasi Konten</th>
                            <th className="p-6 text-center">Kategori</th>
                            {isAdmin && <th className="p-6 text-center">Status Beranda</th>}
                            <th className="p-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-50">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-brand-blue-50/30 transition-all">
                                <td className="p-6">
                                    <div className="font-black text-brand-dark uppercase text-xs mb-1">{item.judul}</div>
                                    <div className="text-[9px] font-bold text-brand-gray-400 uppercase tracking-widest">{new Date(item.waktu).toLocaleDateString()}</div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-tighter ${item.tipe === 'BERITA' ? 'bg-brand-blue-50 text-brand-primary' : 'bg-brand-gray-100 text-brand-gray-600'}`}>
                                        {item.tipe === 'BERITA' ? '📰 Berita' : '🖼️ Flyer'}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="p-6 text-center">
                                        <button onClick={() => toggleHero(item.id)} className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${item.isHero ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-gray-100 text-brand-gray-300'}`}>
                                            {item.isHero ? '● Tayang' : '○ Sembunyi'}
                                        </button>
                                    </td>
                                )}
                                <td className="p-6 text-center">
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => navigate(`/berita/${item.id}`)} className="font-black text-[10px] uppercase text-brand-primary hover:underline">Baca</button>
                                        {isAdmin && <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} className="font-black text-[10px] uppercase text-brand-blue-700 hover:underline">Edit</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}