import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

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
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const target = saved.find(i => i.id === id);
        const heroCount = saved.filter(i => i.isHero).length;

        if (!target.isHero && heroCount >= 10) {
            alert("⚠️ Batas Maksimal! Slot beranda penuh (10/10).");
            return;
        }

        const updated = saved.map(i => i.id === id ? { ...i, isHero: !i.isHero } : i);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        setData(updated);
    };

    const deleteContent = (id) => {
        if (!window.confirm("Hapus konten ini?")) return;
        const updated = data.filter(i => i.id !== id);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        setData(updated);
    };

    return (
        <div className="min-h-screen bg-white p-10">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Manajemen Konten</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mt-2">Biro Organisasi dan Sumber Daya Manusia</p>
                </div>
                {isAdmin && (
                    <button onClick={() => navigate('/BeritaKami/editor')} className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                        <Plus className="w-4 h-4" /> Unggah Konten Baru
                    </button>
                )}
            </header>

            <div className="border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400">
                            <th className="p-6">Informasi Konten</th>
                            <th className="p-6 text-center">Kategori</th>
                            {isAdmin && <th className="p-6 text-center">Status Beranda</th>}
                            <th className="p-6 text-center">Opsi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-all">
                                <td className="p-6">
                                    <div className="font-black text-slate-800 uppercase text-xs mb-1">{item.judul}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.waktu).toLocaleDateString('id-ID')}</div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase ${item.tipe === 'BERITA' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {item.tipe === 'BERITA' ? '📰 Berita' : '🖼️ Flyer'}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="p-6 text-center">
                                        <button onClick={() => toggleHero(item.id)} className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${item.isHero ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300'}`}>
                                            {item.isHero ? '● Tayang' : '○ Sembunyi'}
                                        </button>
                                    </td>
                                )}
                                <td className="p-6 text-center">
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => navigate(`/berita/${item.id}`)} className="font-black text-[10px] uppercase text-blue-600 hover:underline">Baca</button>
                                        {isAdmin && (
                                            <>
                                                <button onClick={() => navigate(`/BeritaKami/editor/${item.id}`)} className="font-black text-[10px] uppercase text-amber-500 hover:underline">Edit</button>
                                                <button onClick={() => deleteContent(item.id)} className="font-black text-[10px] uppercase text-red-400 hover:underline">Hapus</button>
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
    );
}