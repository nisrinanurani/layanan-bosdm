import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, Calendar,
    ArrowRight, Newspaper, Star
} from 'lucide-react';

// Asset Path
import logoBrin from '../assets/logo-brin-decs.png';
import logoBerakhlak from '../assets/logo-berakhlak.png';

export default function NewsHero() {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allData, setAllData] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        setAllData(saved);
    }, []);

    const heroItems = useMemo(() => allData.filter(item => item.isHero).slice(0, 10), [allData]);
    const sidebarItems = useMemo(() => [...allData].sort((a, b) => new Date(b.waktu) - new Date(a.waktu)).slice(0, 15), [allData]);

    const handleNext = () => heroItems.length > 0 && setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    const handlePrev = () => heroItems.length > 0 && setCurrentIndex((prev) => (prev === 0 ? heroItems.length - 1 : prev - 1));

    useEffect(() => {
        if (heroItems.length > 1) {
            const timer = setInterval(handleNext, 8000);
            return () => clearInterval(timer);
        }
    }, [heroItems, currentIndex]);

    const currentHero = heroItems[currentIndex];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* --- NAVBAR: IDENTITAS TENGAH --- */}
            <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-[60] shadow-sm">
                <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

                    {/* KIRI: LOGO BRIN */}
                    <div className="flex justify-start">
                        <img
                            src={logoBrin}
                            alt="BRIN"
                            className="h-10 w-auto object-contain cursor-pointer"
                            onClick={() => navigate('/')}
                        />
                    </div>

                    {/* TENGAH: JUDUL DASHBOARD (Sesuai Request) */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1 className="text-xs md:text-[13px] font-black text-slate-900 uppercase tracking-[0.1em] leading-tight">
                            DASHBOARD BIRO ORGANISASI DAN <br className="hidden md:block" />
                            SUMBER DAYA MANUSIA BRIN
                        </h1>
                    </div>

                    {/* KANAN: LOGO BERAKHLAK */}
                    <div className="flex justify-end">
                        <img
                            src={logoBerakhlak}
                            alt="BerAKHLAK"
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                </div>
            </nav>

            {/* --- KONTEN UTAMA --- */}
            <section className="max-w-[1600px] mx-auto px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">

                    {/* SISI KIRI: NEWS HERO (SLIDER) */}
                    <div className="relative flex-[2] bg-[#0f172a] rounded-[3rem] overflow-hidden group shadow-2xl border-4 border-white">
                        {heroItems.length > 0 ? (
                            <>
                                <div className="absolute inset-0">
                                    <img
                                        key={currentHero?.id}
                                        src={currentHero?.tipe === 'BERITA' ? currentHero.gambar : currentHero.flyer}
                                        className="w-full h-full object-cover opacity-50 scale-105 group-hover:scale-100 transition-transform duration-[10s]"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent"></div>
                                </div>

                                <div className="relative h-full p-10 md:p-16 flex flex-col justify-end z-10">
                                    <div className="max-w-3xl animate-slide-up" key={currentHero?.id}>
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-900/40">
                                                {currentHero?.tipe} TERBARU
                                            </span>
                                            <div className="flex items-center gap-2 text-white/60 text-[11px] font-bold uppercase tracking-widest">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {new Date(currentHero?.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <h2 className="text-3xl md:text-5xl text-white font-black mb-10 line-clamp-2 uppercase tracking-tighter leading-[1.1]">
                                            {currentHero?.judul}
                                        </h2>

                                        <button
                                            onClick={() => navigate(`/berita/${currentHero.id}`)}
                                            className="bg-white text-[#0f172a] px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4 w-fit"
                                        >
                                            Baca Selengkapnya <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Navigasi Slider */}
                                    <div className="flex items-center justify-between mt-12 border-t border-white/10 pt-8">
                                        <div className="flex gap-3">
                                            <button onClick={handlePrev} className="p-3 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"><ChevronLeft className="w-6 h-6" /></button>
                                            <button onClick={handleNext} className="p-3 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"><ChevronRight className="w-6 h-6" /></button>
                                        </div>
                                        <div className="flex gap-2.5">
                                            {heroItems.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-14 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'w-3 bg-white/20'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/10 font-black uppercase tracking-[0.5em] text-xl">Konten Sorotan Kosong</div>
                        )}
                    </div>

                    {/* SISI KANAN: SIDEBAR (BERITA KAMI) */}
                    <div className="w-full lg:w-[450px] bg-white rounded-[3rem] shadow-2xl border-4 border-white flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                                    <Newspaper className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl leading-none">Berita Kami</h3>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Update</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {sidebarItems.length > 0 ? sidebarItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/berita/${item.id}`)}
                                    className="group flex gap-5 p-3 rounded-[2rem] hover:bg-blue-50/50 transition-all cursor-pointer border border-transparent hover:border-blue-100/50"
                                >
                                    <div className="relative shrink-0">
                                        <img src={item.tipe === 'BERITA' ? item.gambar : item.flyer} className="w-20 h-20 rounded-[1.5rem] object-cover bg-slate-100 shadow-md group-hover:scale-105 transition-transform" alt="" />
                                        {item.isHero && (
                                            <div className="absolute -top-1 -right-1 bg-yellow-400 p-1.5 rounded-full border-2 border-white shadow-sm">
                                                <Star className="w-2 h-2 text-white fill-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${item.tipe === 'BERITA' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {item.tipe}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.waktu).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2 uppercase group-hover:text-blue-700 transition-colors">
                                            {item.judul}
                                        </h4>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center opacity-20 font-black uppercase tracking-[0.3em] text-xs italic">Belum ada konten</div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => navigate('/berita-kami')}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center gap-4 group hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                            >
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Selengkapnya</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
}