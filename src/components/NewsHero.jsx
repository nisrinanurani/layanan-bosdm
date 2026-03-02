import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, Calendar,
    ArrowRight, Newspaper, MousePointer2,
    LayoutGrid, Star
} from 'lucide-react';

// Pastikan path asset benar sesuai folder project kamu
import logoBrin from '../assets/logo-brin-decs.png';
import logoBerakhlak from '../assets/logo-berakhlak.png';

export default function NewsHero() {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allData, setAllData] = useState([]);

    // 1. AMBIL DATA DARI LOCALSTORAGE
    useEffect(() => {
        const loadData = () => {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            setAllData(saved);
        };
        loadData();
        // Listener agar data update jika ada perubahan di tab lain (opsional)
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    // 2. FILTER DATA UNTUK SLIDER (Hanya yang isHero: true)
    const heroItems = useMemo(() => {
        return allData.filter(item => item.isHero).slice(0, 10);
    }, [allData]);

    // 3. FILTER DATA UNTUK SIDEBAR (15 Berita Terbaru)
    const sidebarItems = useMemo(() => {
        return [...allData].sort((a, b) => new Date(b.waktu) - new Date(a.waktu)).slice(0, 15);
    }, [allData]);

    // 4. LOGIKA NAVIGASI SLIDER
    const handleNext = () => {
        if (heroItems.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % heroItems.length);
        }
    };

    const handlePrev = () => {
        if (heroItems.length > 0) {
            setCurrentIndex((prev) => (prev === 0 ? heroItems.length - 1 : prev - 1));
        }
    };

    // 5. AUTO SLIDE (Reset jika user klik manual)
    useEffect(() => {
        if (heroItems.length > 1) {
            const timer = setInterval(handleNext, 8000);
            return () => clearInterval(timer);
        }
    }, [heroItems, currentIndex]);

    // --- TAMPILAN JIKA DATA MASIH KOSONG (EMPTY STATE) ---
    if (allData.length === 0) {
        return (
            <section className="max-w-[1600px] mx-auto px-4 py-8 font-sans">
                <div className="bg-[#0f172a] h-[600px] rounded-[2.5rem] flex flex-col justify-center items-center text-center p-10 border-4 border-white shadow-2xl">
                    <img src={logoBrin} alt="BRIN" className="h-16 w-auto mb-8 opacity-50" />
                    <h1 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4">
                        DASHBOARD BIRO ORGANISASI DAN <br />
                        <span className="text-blue-500">SUMBER DAYA MANUSIA BRIN</span>
                    </h1>
                    <div className="w-20 h-1 bg-blue-600 my-6"></div>
                    <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-xs">Belum ada konten berita yang tersedia saat ini</p>
                </div>
            </section>
        );
    }

    const currentHero = heroItems[currentIndex];

    return (
        <section className="max-w-[1600px] mx-auto px-4 py-8 font-sans">
            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">

                {/* --- SISI KIRI: SLIDER UTAMA (NEWS HERO) --- */}
                <div className="relative flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden group shadow-2xl border-4 border-white">
                    {heroItems.length > 0 ? (
                        <>
                            {/* Visual Background */}
                            <div className="absolute inset-0">
                                <img
                                    key={currentHero.id}
                                    src={currentHero.tipe === 'BERITA' ? currentHero.gambar : currentHero.flyer}
                                    className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s]"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent"></div>
                            </div>

                            {/* Content Slider */}
                            <div className="relative h-full p-8 md:p-12 flex flex-col justify-between z-10">
                                <div className="flex items-center gap-4">
                                    <img src={logoBrin} alt="BRIN" className="h-10 w-auto" />
                                    <div className="w-px h-6 bg-white/20"></div>
                                    <img src={logoBerakhlak} alt="BerAKHLAK" className="h-8 w-auto" />
                                </div>

                                <div className="max-w-2xl animate-slide-up" key={currentHero?.id}>
                                    <div className="mb-4">
                                        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                                            Highlight {currentHero.tipe}
                                        </span>
                                    </div>
                                    <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4">
                                        DASHBOARD BIRO ORGANISASI DAN <br />
                                        <span className="text-blue-400">SUMBER DAYA MANUSIA BRIN</span>
                                    </h1>
                                    <div className="flex items-center gap-3 text-white/50 text-[10px] font-bold uppercase tracking-widest mb-6">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        {new Date(currentHero.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h2 className="text-xl md:text-2xl text-white font-bold mb-8 line-clamp-2 uppercase tracking-wide">
                                        {currentHero.judul}
                                    </h2>
                                    <button
                                        onClick={() => navigate(`/berita/${currentHero.id}`)}
                                        className="bg-white text-[#0f172a] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3 w-fit"
                                    >
                                        Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Navigasi & Indikator */}
                                <div className="flex items-center justify-between mt-8">
                                    <div className="flex gap-2">
                                        <button onClick={handlePrev} className="p-3 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all border border-white/10"><ChevronLeft className="w-6 h-6" /></button>
                                        <button onClick={handleNext} className="p-3 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all border border-white/10"><ChevronRight className="w-6 h-6" /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        {heroItems.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-blue-500' : 'w-3 bg-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Tampilan jika berita ada tapi tidak ada yang ditandai Bintang (isHero)
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                            <Star className="w-12 h-12 text-blue-500 mb-4 opacity-20" />
                            <h3 className="text-white/40 font-black uppercase tracking-widest text-sm">Pilih konten sorotan di menu Manajemen Berita</h3>
                        </div>
                    )}
                </div>

                {/* --- SISI KANAN: SIDEBAR (DAFTAR BERITA KAMI) --- */}
                <div className="w-full lg:w-[420px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-white flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Newspaper className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Berita Kami</h3>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
                        {sidebarItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/berita/${item.id}`)}
                                className="group flex gap-4 p-3 rounded-[1.5rem] hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-100"
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={item.tipe === 'BERITA' ? item.gambar : item.flyer}
                                        className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shadow-sm transition-transform group-hover:scale-105"
                                        alt=""
                                    />
                                    {item.isHero && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full border-2 border-white">
                                            <Star className="w-2 h-2 text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.tipe === 'BERITA' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {item.tipe}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {new Date(item.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <h4 className="text-[13px] font-bold text-slate-700 leading-snug line-clamp-2 uppercase group-hover:text-blue-700 transition-colors">
                                        {item.judul}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Sidebar (Link Selengkapnya) */}
                    <div className="p-4 bg-slate-50">
                        <button
                            onClick={() => navigate('/berita-kami')}
                            className="w-full py-4 bg-[#0f172a] hover:bg-blue-600 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                        >
                            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Selengkapnya</span>
                            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Tambahkan Animasi di CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </section>
    );
}