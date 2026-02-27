import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Edit3, Trash2, ArrowLeft,
    Calendar as CalendarIcon, ChevronDown, ImageIcon, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- IMPORT LOGO ---
import logoBrin from '../assets/logo-brin-decs.png';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === STATE DATA ===
    const [dataBerita, setDataBerita] = useState(() => {
        const saved = localStorage.getItem('data_berita_bosdm');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                judul: "Sosialisasi Peraturan Kepala BRIN Terkait Manajemen Talenta",
                fungsi: "Fungsi Penilaian Kompetensi",
                gambar: "",
                waktu: "2026-02-25"
            }
        ];
    });

    // === STATE FILTER & UI ===
    const [searchBerita, setSearchBerita] = useState('');
    const [filterFungsi, setFilterFungsi] = useState('Semua');
    const [filterTanggal, setFilterTanggal] = useState('');
    const [limit, setLimit] = useState(10);

    // === HANDLERS ===
    const handleDelete = (id) => {
        if (window.confirm("Hapus berita ini?")) {
            const updated = dataBerita.filter(b => b.id !== id);
            setDataBerita(updated);
            localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        }
    };

    const filteredBerita = useMemo(() => {
        return dataBerita.filter(b => {
            const matchesSearch = b.judul.toLowerCase().includes(searchBerita.toLowerCase());
            const matchesFungsi = filterFungsi === 'Semua' || b.fungsi === filterFungsi;
            const matchesTanggal = filterTanggal === '' || b.waktu === filterTanggal;
            return matchesSearch && matchesFungsi && matchesTanggal;
        });
    }, [dataBerita, searchBerita, filterFungsi, filterTanggal]);

    return (
        <div className="min-h-screen bg-[#F0F7FF] font-sans pb-20">
            {/* === NAVBAR === */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-[#F0F7FF]/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo BRIN" className="h-10 w-auto object-contain" />
                        <span className="font-bold text-lg tracking-tight text-slate-900">Portal BOSDM</span>
                    </div>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    {/* HANYA INI YANG FONT BLACK */}
                    <h1 className="text-4xl font-black text-slate-900 lowercase tracking-tighter">kumpulan berita</h1>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/berita-kami/editor')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black lowercase flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                            + unggah berita terkini...
                        </button>
                    )}
                </div>

                {/* FILTER BAR */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari judul berita..."
                            className="w-full pl-4 pr-10 py-2.5 bg-[#E1EFFF] border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            value={searchBerita}
                            onChange={(e) => setSearchBerita(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 bg-[#E1EFFF] p-1 border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 px-3">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="date"
                                className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
                                value={filterTanggal}
                                onChange={(e) => setFilterTanggal(e.target.value)}
                            />
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div className="flex items-center gap-2 px-3">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
                                value={filterFungsi}
                                onChange={(e) => setFilterFungsi(e.target.value)}
                            >
                                <option value="Semua">Fungsi</option>
                                <option value="Fungsi Penilaian Kompetensi">Penilaian Kompetensi</option>
                                <option value="Fungsi Mutasi">Mutasi</option>
                                <option value="Fungsi Kesejahteraan">Kesejahteraan</option>
                            </select>
                        </div>
                    </div>

                    {/* PAGINATION LIMIT (v) */}
                    <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>tampilkan</span>
                        <div className="relative flex items-center">
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="appearance-none bg-[#E1EFFF] border border-slate-200 pl-3 pr-7 py-1.5 rounded-md text-slate-900 outline-none cursor-pointer font-bold"
                            >
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 text-slate-400 pointer-events-none" />
                        </div>
                        <span>v</span>
                    </div>
                </div>

                {/* TABEL DATA */}
                <div className="bg-[#E1EFFF] border border-[#8ECAFE]/30 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#F0F7FF] border-b border-[#8ECAFE]/30 text-slate-400 font-bold uppercase">
                            <tr>
                                <th className="p-5 w-16 text-center">no</th>
                                <th className="p-5">berita</th>
                                <th className="p-5 w-48 text-center md:text-left">waktu unggah</th>
                                {isAdmin && <th className="p-5 w-32 text-center">aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 border-b border-slate-100">
                            {filteredBerita.slice(0, limit).map((item, idx) => (
                                <tr key={item.id} className="hover:bg-[#F0F7FF] transition-colors">
                                    <td className="p-6 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="p-6">
                                        <div className="flex flex-col md:flex-row items-start gap-6">
                                            <div className="w-full md:w-40 h-24 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 shadow-sm">
                                                {item.gambar ? (
                                                    <img src={item.gambar} alt="Thumb" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center opacity-30">
                                                        <ImageIcon className="w-5 h-5 text-white mx-auto mb-1" />
                                                        <span className="text-[8px] text-white font-black uppercase">no image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight uppercase tracking-tight">{item.judul}</h3>
                                                <span className="text-[10px] font-semibold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    {item.fungsi}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-slate-500 font-bold text-center md:text-left">
                                        {new Date(item.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-6">
                                            <div className="flex justify-center gap-4">
                                                <button onClick={() => navigate(`/berita-kami/editor/${item.id}`)} className="text-amber-500 hover:scale-125 transition-transform"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}