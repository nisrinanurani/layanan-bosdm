import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, Calendar,
    ArrowRight, Newspaper, MousePointer2
} from 'lucide-react';

// Pastikan path asset benar
import logoBrin from '../assets/logo-brin-white.png';
import logoBerakhlak from '../assets/logo-berakhlak.png';

export default function NewsHeroCombined() {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allData, setAllData] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setAllData(saved);
    }, []);

    // Filter Data untuk Slider (Hanya yang isHero)
    const heroItems = useMemo(() => {
        return allData.filter(item => item.isHero).slice(0, 10);
    }, [allData]);

    // Data untuk Sidebar (Semua berita, urutan terbaru)
    const sidebarItems = useMemo(() => {
        return [...allData].sort((a, b) => new Date(b.waktu) - new Date(a.waktu)).slice(0, 15);
    }, [allData]);

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? heroItems.length - 1 : prev - 1));

    if (allData.length === 0) return null;

    return (
        <section className="max-w-[1600px] mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">

                {/* --- SISI KIRI: NEWS HERO SLIDER --- */}
                <div className="relative flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                    {heroItems.length > 0 ? (
                        <>
                            {/* Background & Overlay */}
                            <div className="absolute inset-0">
                                <img
                                    src={heroItems[currentIndex].tipe === 'BERITA' ? heroItems[currentIndex].gambar : heroItems[currentIndex].flyer}
                                    className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s]"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full p-10 flex flex-col justify-between z-10">
                                <div className="flex items-center gap-4 opacity-80">
                                    <img src={logoBrin} alt="BRIN" className="h-8 w-auto" />
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <img src={logoBerakhlak} alt="BerAKHLAK" className="h-6 w-auto" />
                                </div>

                                <div className="max-w-2xl animate-fade-in">
                                    <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight mb-4">
                                        DASHBOARD BIRO ORGANISASI DAN <br />
                                        <span className="text-blue-400">SUMBER DAYA MANUSIA BRIN</span>
                                    </h1>
                                    <div className="flex items-center gap-3 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(heroItems[currentIndex].waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h2 className="text-xl text-white font-bold mb-6 line-clamp-2 uppercase">
                                        {heroItems[currentIndex].judul}
                                    </h2>
                                    <button
                                        onClick={() => navigate(`/berita/${heroItems[currentIndex].id}`)}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-lg"
                                    >
                                        Selengkapnya
                                    </button>
                                </div>

                                {/* Slider Navigation */}
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <button onClick={handlePrev} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><ChevronLeft className="w-5 h-5" /></button>
                                        <button onClick={handleNext} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {heroItems.map((_, idx) => (
                                            <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/20'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-white/20 font-black uppercase tracking-widest">No Highlight</div>
                    )}
                </div>

                {/* --- SISI KANAN: SIDEBAR "BERITA KAMI" --- */}
                <div className="w-full lg:w-[400px] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-blue-600" />
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Berita Kami</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">TERBARU</span>
                    </div>

                    {/* Scrollable List Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {sidebarItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/berita/${item.id}`)}
                                className="group flex gap-3 p-3 rounded-2xl hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-100"
                            >
                                <img
                                    src={item.tipe === 'BERITA' ? item.gambar : item.flyer}
                                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 shadow-sm"
                                    alt=""
                                />
                                <div className="flex flex-col justify-center overflow-hidden">
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded w-fit mb-1 ${item.tipe === 'BERITA' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {item.tipe}
                                    </span>
                                    <h4 className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 uppercase group-hover:text-blue-700">
                                        {item.judul}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 mt-1">{new Date(item.waktu).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Sidebar: Link Selengkapnya */}
                    <button
                        onClick={() => navigate('/berita-kami')}
                        className="m-4 p-4 bg-slate-900 rounded-2xl flex items-center justify-between group hover:bg-blue-600 transition-all"
                    >
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Selengkapnya</span>
                        <div className="bg-white/10 p-1 rounded-lg group-hover:bg-white/20 transition-all">
                            <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </button>
                </div>

            </div>
        </section>
    );
}