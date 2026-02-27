import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('SEMUA');
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const kategori = ['SEMUA', 'UMUM', 'MUTASI', 'PENGEMBANGAN', 'DATA'];

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setData(saved);
    }, []);

    return (
        <div className="min-h-screen bg-brand-gray-50 p-10 font-sans">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-brand-dark">Berita Kami</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mt-2">Biro Organisasi dan SDM</p>
                </div>
                {isAdmin && (
                    <button onClick={() => navigate('/BeritaKami/editor')} className="bg-brand-dark text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-blue-100">
                        <Plus className="w-4 h-4" /> Unggah Berita
                    </button>
                )}
            </header>

            {/* FILTER KATEGORI - KEMBALI SEPERTI SEMULA */}
            <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                {kategori.map(k => (
                    <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${filter === k ? 'bg-brand-primary text-white shadow-lg' : 'bg-white text-brand-gray-400 border border-brand-gray-100'
                            }`}
                    >
                        {k}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-brand-gray-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-gray-50/50 border-b border-brand-gray-100 font-black text-[10px] uppercase tracking-widest text-brand-gray-400">
                            <th className="p-6">Judul Berita</th>
                            <th className="p-6 text-center">Fungsi</th>
                            {isAdmin && <th className="p-6 text-center">Status</th>}
                            <th className="p-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-50">
                        {data.filter(i => filter === 'SEMUA' || i.fungsi === filter).map((item) => (
                            <tr key={item.id} className="hover:bg-brand-blue-50/30 transition-all">
                                <td className="p-6">
                                    <div className="font-black text-brand-dark uppercase text-xs mb-1">{item.judul}</div>
                                    <div className="text-[9px] font-bold text-brand-gray-400 uppercase tracking-widest">{new Date(item.waktu).toLocaleDateString()}</div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className="px-4 py-1.5 rounded-full font-black text-[9px] uppercase bg-brand-blue-50 text-brand-primary">
                                        {item.fungsi || 'UMUM'}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="p-6 text-center">
                                        <button className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${item.isHero ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-gray-100 text-brand-gray-300'}`}>
                                            {item.isHero ? '● Tayang' : '○ Sembunyi'}
                                        </button>
                                    </td>
                                )}
                                <td className="p-6 text-center">
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => navigate(`/berita/${item.id}`)} className="font-black text-[10px] uppercase text-brand-primary hover:underline">Baca</button>
                                        {isAdmin && <button className="font-black text-[10px] uppercase text-brand-blue-700 hover:underline">Edit</button>}
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