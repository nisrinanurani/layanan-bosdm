import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Edit3, Trash2, ArrowLeft,
    Calendar as CalendarIcon, Save, ChevronDown, Image as ImageIcon, Filter
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
                judul: "SOSIALISASI PERATURAN KEPALA BRIN TERKAIT MANAJEMEN TALENTA",
                fungsi: "Fungsi Penilaian Kompetensi",
                gambar: "",
                waktu: "2026-02-25"
            }
        ];
    });

    // === STATE FILTER & UI ===
    const [searchBerita, setSearchBerita] = useState('');
    const [filterFungsi, setFilterFungsi] = useState('Semua');
    const [filterTanggal, setFilterTanggal] = useState(''); // Filter Kalender
    const [limit, setLimit] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [formBerita, setFormBerita] = useState({ id: null, judul: '', fungsi: 'Umum', gambar: '', waktu: '' });

    // === HANDLERS ===
    const handleSaveBerita = () => {
        if (!formBerita.judul || !formBerita.waktu) return alert("Mohon lengkapi data berita!");

        const updated = formBerita.id
            ? dataBerita.map(b => b.id === formBerita.id ? { ...formBerita } : b)
            : [{ ...formBerita, id: Date.now() }, ...dataBerita];

        setDataBerita(updated);
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Hapus berita ini?")) {
            const updated = dataBerita.filter(b => b.id !== id);
            setDataBerita(updated);
            localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        }
    };

    // === LOGIKA FILTER DINAMIS ===
    const filteredBerita = useMemo(() => {
        return dataBerita.filter(b => {
            const matchesSearch = b.judul.toLowerCase().includes(searchBerita.toLowerCase());
            const matchesFungsi = filterFungsi === 'Semua' || b.fungsi === filterFungsi;
            const matchesTanggal = filterTanggal === '' || b.waktu === filterTanggal;
            return matchesSearch && matchesFungsi && matchesTanggal;
        });
    }, [dataBerita, searchBerita, filterFungsi, filterTanggal]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* === NAVBAR === */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo BRIN" className="h-10 w-auto object-contain" />
                        <span className="font-black text-lg tracking-tighter text-slate-900 uppercase">Portal BOSDM</span>
                    </div>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h1 className="text-4xl font-black text-slate-900 lowercase tracking-tighter">kumpulan berita</h1>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setFormBerita({ id: null, judul: '', fungsi: 'Umum', gambar: '', waktu: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
                        >
                            + unggah berita terkini...
                        </button>
                    )}
                </div>

                {/* FILTER BAR (KALENDER & FUNGSI) */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    {/* Pencarian */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="CARI JUDUL BERITA..."
                            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-full text-[10px] font-black tracking-widest outline-none focus:ring-2 focus:ring-blue-500 shadow-sm uppercase"
                            value={searchBerita}
                            onChange={(e) => setSearchBerita(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>

                    {/* Filter Group */}
                    <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm">
                        {/* Kalender / Filter Tanggal */}
                        <div className="flex items-center gap-2 px-3 relative">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="date"
                                className="text-[10px] font-black uppercase text-slate-600 bg-transparent outline-none cursor-pointer"
                                value={filterTanggal}
                                onChange={(e) => setFilterTanggal(e.target.value)}
                            />
                            {filterTanggal && (
                                <button onClick={() => setFilterTanggal('')} className="text-[8px] font-black text-red-500 ml-1">RESET</button>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-200"></div>

                        {/* Filter Fungsi BOSDM */}
                        <div className="flex items-center gap-2 px-3">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                className="text-[10px] font-black uppercase text-slate-600 bg-transparent outline-none cursor-pointer"
                                value={filterFungsi}
                                onChange={(e) => setFilterFungsi(e.target.value)}
                            >
                                <option value="Semua">SEMUA FUNGSI</option>
                                <option value="Umum">UMUM</option>
                                <option value="Fungsi Penilaian Kompetensi">PENILAIAN KOMPETENSI</option>
                                <option value="Fungsi Mutasi">MUTASI</option>
                                <option value="Fungsi Kesejahteraan">KESEJAHTERAAN</option>
                            </select>
                        </div>
                    </div>

                    {/* PAGINATION LIMIT (DROPDOWN v) */}
                    <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>menampilkan</span>
                        <div className="relative flex items-center">
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="appearance-none bg-white border border-slate-200 pl-3 pr-7 py-2 rounded-lg text-slate-900 outline-none cursor-pointer font-black"
                            >
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* TABEL DATA */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="p-6 w-16 text-center">no</th>
                                <th className="p-6">berita</th>
                                <th className="p-6 w-48 text-center md:text-left">waktu unggah</th>
                                {isAdmin && <th className="p-6 w-32 text-center">aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredBerita.slice(0, limit).map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 text-center text-slate-400 font-black text-xs">{idx + 1}</td>
                                    <td className="p-6">
                                        <div className="flex flex-col md:flex-row items-start gap-6">
                                            <div className="w-full md:w-44 h-28 rounded-2xl bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 shadow-inner">
                                                {item.gambar ? (
                                                    <img src={item.gambar} alt="Thumb" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center opacity-30">
                                                        <ImageIcon className="w-6 h-6 text-white mx-auto mb-1" />
                                                        <span className="text-[7px] text-white font-black uppercase tracking-tighter">no image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 py-1">
                                                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight uppercase tracking-tighter">{item.judul}</h3>
                                                <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 tracking-wider">
                                                    {item.fungsi}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-slate-500 font-black text-xs text-center md:text-left uppercase tracking-tighter">
                                        {new Date(item.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-6">
                                            <div className="flex justify-center gap-4">
                                                <button onClick={() => { setFormBerita(item); setShowModal(true); }} className="text-amber-500 hover:scale-125 transition-transform"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBerita.length === 0 && (
                        <div className="p-20 text-center font-black text-slate-300 uppercase text-xs tracking-[0.2em]">
                            -- Tidak ada berita ditemukan --
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL FORM (ADMIN) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 overflow-hidden border border-white/20">
                            <h3 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tighter">Form Kendali Berita</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Judul Berita</label>
                                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-black uppercase text-xs transition-all" value={formBerita.judul} onChange={(e) => setFormBerita({ ...formBerita, judul: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fungsi / Unit</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs uppercase" value={formBerita.fungsi} onChange={(e) => setFormBerita({ ...formBerita, fungsi: e.target.value })}>
                                            <option value="Umum">UMUM</option>
                                            <option value="Fungsi Penilaian Kompetensi">PENILAIAN KOMPETENSI</option>
                                            <option value="Fungsi Mutasi">MUTASI</option>
                                            <option value="Fungsi Kesejahteraan">KESEJAHTERAAN</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Post</label>
                                        <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs" value={formBerita.waktu} onChange={(e) => setFormBerita({ ...formBerita, waktu: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">URL Thumbnail Gambar</label>
                                    <input type="text" placeholder="HTTPS://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs" value={formBerita.gambar} onChange={(e) => setFormBerita({ ...formBerita, gambar: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-[10px] tracking-widest">Batal</button>
                                <button onClick={handleSaveBerita} className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                                    <Save className="w-4 h-4" /> Simpan & Publish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}