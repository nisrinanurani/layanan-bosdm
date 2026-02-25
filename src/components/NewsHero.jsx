import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Info, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- IMPORT ASSET ---
import logoBrin from '../assets/logo-brin-decs.png';
import logoBerakhlak from '../assets/logo-berakhlak.png';

const NEWS_DATA = [
    {
        id: 1,
        title: "BRIN Luncurkan Satelit Nano Generasi Terbaru untuk Pemantauan Maritim",
        date: "24 Okt 2025",
        category: "Teknologi",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600",
        desc: "Terobosan baru dalam kemandirian teknologi antariksa nasional untuk menjaga kedaulatan laut Indonesia."
    },
    {
        id: 2,
        title: "Pendaftaran Riset dan Inovasi untuk Indonesia Maju Dibuka",
        date: "22 Okt 2025",
        category: "Pengumuman",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1600",
        desc: "Program pendanaan riset tahunan kembali dibuka dengan fokus pada ketahanan pangan dan energi."
    },
    {
        id: 3,
        title: "Kunjungan Delegasi Peneliti Jepang ke Fasilitas Nuklir Serpong",
        date: "20 Okt 2025",
        category: "Kerjasama",
        image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1600",
        desc: "Memperkuat kerjasama bilateral dalam pengembangan teknologi nuklir untuk tujuan damai dan medis."
    }
];

const FLYER_INFO = {
    title: "Seleksi CASN BRIN 2025",
    desc: "Simak jadwal pelaksanaan SKB dan ketentuan pemberkasan bagi peserta yang lolos tahap awal.",
    link: "#"
};

export default function NewsHero() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    // Fungsi Navigasi Manual
    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? NEWS_DATA.length - 1 : prev - 1));
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === NEWS_DATA.length - 1 ? 0 : prev + 1));
    }, []);

    // Auto Slide
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-blue-50 group">

            {/* === NAVBAR (Z-INDEX 50 AGAR DI DEPAN) === */}
            <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/20 px-6 py-4 bg-white/40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo BRIN (Kiri) */}
                    <div className="flex items-center gap-3 cursor-pointer group/logo" onClick={() => navigate('/')}>
                        <img
                            src={logoBrin}
                            alt="Logo BRIN"
                            className="h-10 w-auto object-contain group-hover/logo:scale-105 transition-transform"
                        />
                    </div>
                    <div className="flex-1 text-center hidden md:block">
                        <span className="font-bold text-sm lg:text-base text-slate-800 tracking-tight uppercase">
                            Dashboard Biro Organisasi dan Sumber Daya Manusia BRIN
                        </span>
                    </div>
                    {/* Logo BerAKHLAK (Kanan) */}
                    <div className="flex items-center">
                        <img
                            src={logoBerakhlak}
                            alt="Logo BerAKHLAK"
                            className="h-10 w-auto object-contain"
                        />
                    </div>
                </div>
            </nav>

            {/* === 1. BACKGROUND SLIDER === */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={NEWS_DATA[currentIndex].image}
                        alt="News Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-100/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-100 via-transparent to-transparent opacity-90" />
                </motion.div>
            </AnimatePresence>

            {/* === 2. NAVIGATION ARROWS (Z-INDEX 30) === */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-slate-700 hover:bg-white hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-slate-700 hover:bg-white hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* === 3. CONTENT CONTAINER === */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center pb-12">
                <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-end lg:items-center">
                    <div className="lg:col-span-7 relative z-20">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-blue-100 text-blue-600 rounded-sm shadow-sm">
                                {NEWS_DATA[currentIndex].category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-4 text-slate-900">
                                {NEWS_DATA[currentIndex].title}
                            </h1>
                            <p className="text-lg text-slate-700 mb-8 max-w-xl line-clamp-2 font-medium">
                                {NEWS_DATA[currentIndex].desc}
                            </p>
                            <button
                                onClick={() => navigate(`/berita/${NEWS_DATA[currentIndex].id}`)}
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Baca Selengkapnya
                            </button>
                            <div className="flex gap-2 mt-8">
                                {NEWS_DATA.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-blue-300'}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="hidden lg:block lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl border border-blue-50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0" />
                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-blue-100 rounded-lg text-blue-700">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-extrabold tracking-widest text-blue-700 uppercase">Info Terbaru</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">{FLYER_INFO.title}</h3>
                                <p className="text-sm text-slate-600 font-medium mb-6">{FLYER_INFO.desc}</p>
                                <a href="#" className="inline-flex items-center px-5 py-2.5 bg-blue-700 text-white text-sm font-bold rounded-lg gap-2">
                                    Cek Detail <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* === 4. SCROLLING TICKER === */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-blue-50 border-t border-blue-200 h-14 flex items-center shadow-sm">
                <div className="bg-blue-700 h-full flex items-center px-8 shrink-0 z-30 relative">
                    <span className="text-xs font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
                        <Megaphone className="w-4 h-4 animate-pulse" />
                        Terkini
                    </span>
                    <div className="absolute top-0 right-[-12px] w-0 h-0 border-t-[56px] border-t-blue-700 border-r-[12px] border-r-transparent"></div>
                </div>
                <div className="overflow-hidden whitespace-nowrap w-full relative">
                    <motion.div
                        className="inline-flex items-center gap-16 pl-4"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                    >
                        {[...NEWS_DATA, ...NEWS_DATA].map((news, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-slate-600 group cursor-pointer hover:text-blue-800 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 group-hover:bg-blue-600"></span>
                                <span className="font-semibold tracking-wide">{news.title}</span>
                                <span className="text-slate-400 mx-2">|</span>
                                <span className="text-blue-600 text-xs uppercase">{news.category}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}