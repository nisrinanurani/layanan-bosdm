import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit3, Trash2, X, ArrowLeft,
    Calendar as CalendarIcon, Save, ChevronDown, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- IMPORT LOGO ---
import logoBrin from '../assets/logo-brin-decs.png';

export default function BeritaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === STATE DATA BERITA ===
    const [dataBerita, setDataBerita] = useState(() => {
        const saved = localStorage.getItem('data_berita_bosdm');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                judul: "Sosialisasi Peraturan Kepala BRIN Terkait Manajemen Talenta",
                fungsi: "Fungsi Penilaian Kompetensi",
                gambar: "",
                waktu: "2026-02-24"
            }
        ];
    });

    // === STATE UI & PAGINATION ===
    const [searchBerita, setSearchBerita] = useState('');
    const [filterFungsi, setFilterFungsi] = useState('Semua');
    const [limit, setLimit] = useState(10); // State untuk dropdown v
    const [showModal, setShowModal] = useState(false);
    const [formBerita, setFormBerita] = useState({ id: null, judul: '', fungsi: 'Umum', gambar: '', waktu: '' });

    // === HANDLERS ===
    const handleSaveBerita = () => {
        if (!formBerita.judul || !formBerita.waktu) return alert("Mohon lengkapi data berita!");

        let updated;
        if (formBerita.id) {
            updated = dataBerita.map(b => b.id === formBerita.id ? { ...formBerita } : b);
        } else {
            const newEntry = { ...formBerita, id: Date.now() };
            updated = [newEntry, ...dataBerita];
        }

        setDataBerita(updated);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        setShowModal(false);
        setFormBerita({ id: null, judul: '', fungsi: 'Umum', gambar: '', waktu: '' });
    };

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
            return matchesSearch && matchesFungsi;
        });
    }, [dataBerita, searchBerita, filterFungsi]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* === NAVBAR (SERAGAM) === */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo BRIN" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                        <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors text-slate-900">Portal BOSDM</span>
                    </div>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h1 className="text-4xl font-black text-slate-900 lowercase tracking-tight">kumpulan berita</h1>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setFormBerita({ id: null, judul: '', fungsi: 'Umum', gambar: '', waktu: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
                        >
                            + unggah berita terkini...
                        </button>
                    )}
                </div>

                {/* FILTER BAR DENGAN DROPDOWN LIMIT (v) */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari judul berita"
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            value={searchBerita}
                            onChange={(e) => setSearchBerita(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 border border-slate-200 rounded-lg shadow-sm">
                        <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded">kalender</button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select
                            className="px-3 py-1.5 text-xs text-slate-500 bg-transparent outline-none cursor-pointer"
                            onChange={(e) => setFilterFungsi(e.target.value)}
                        >
                            <option value="Semua">fungsi</option>
                            <option value="Internal">Internal</option>
                            <option value="SDM">SDM</option>
                        </select>
                    </div>

                    {/* PAGINATION LIMIT DROPDOWN */}
                    <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>menampilkan</span>
                        <div className="relative flex items-center">
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="appearance-none bg-white border border-slate-200 pl-3 pr-7 py-1 rounded text-slate-900 outline-none cursor-pointer font-bold"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* TABEL DENGAN LOGIKA SLICE LIMIT */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                            <tr>
                                <th className="p-5 w-16 text-center">No</th>
                                <th className="p-5">berita</th>
                                <th className="p-5 w-48 text-center md:text-left">waktu unggah</th>
                                {isAdmin && <th className="p-5 w-32 text-center">aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredBerita.slice(0, limit).map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 text-center text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="p-6">
                                        <div className="flex flex-col md:flex-row items-start gap-6">
                                            {/* Thumbnail Gambar */}
                                            <div className="w-full md:w-40 h-24 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 shadow-sm">
                                                {item.gambar ? (
                                                    <img src={item.gambar} alt="Thumb" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center px-2">
                                                        <ImageIcon className="w-5 h-5 text-white/20 mx-auto mb-1" />
                                                        <span className="text-[8px] text-white/50 font-black leading-none uppercase">Thumbnail Berita</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-black text-slate-900 mb-2 leading-tight uppercase tracking-tighter">{item.judul}</h3>
                                                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.fungsi}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-slate-500 font-bold text-center md:text-left">
                                        {new Date(item.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-6">
                                            <div className="flex justify-center gap-4">
                                                <button onClick={() => { setFormBerita(item); setShowModal(true); }} className="text-amber-500 hover:scale-110 transition-transform"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* MODAL UNGGAH BERITA (KHUSUS ADMIN) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
                            <h3 className="text-2xl font-black mb-6 text-slate-900">Form Kendali Berita</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Judul Konten</label>
                                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" value={formBerita.judul} onChange={(e) => setFormBerita({ ...formBerita, judul: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Kategori/Fungsi</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formBerita.fungsi} onChange={(e) => setFormBerita({ ...formBerita, fungsi: e.target.value })}>
                                            <option value="Umum">Umum</option>
                                            <option value="Internal">Internal</option>
                                            <option value="SDM">SDM</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tanggal Publikasi</label>
                                        <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formBerita.waktu} onChange={(e) => setFormBerita({ ...formBerita, waktu: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tautan Gambar (URL)</label>
                                    <input type="text" placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formBerita.gambar} onChange={(e) => setFormBerita({ ...formBerita, gambar: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-10">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl">Batal</button>
                                <button onClick={handleSaveBerita} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                                    <Save className="w-4 h-4" /> Publish Berita
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}