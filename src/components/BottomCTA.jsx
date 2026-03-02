import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowRight, Headphones } from 'lucide-react';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

export default function BottomCTA({ onOpenLogin, onOpenRegister }) {
    return (
        <section className="relative w-full py-24 px-4 overflow-hidden flex items-center justify-center min-h-[600px]">

            {/* === 1. BACKGROUND IMAGE (Sama seperti referensi PublicStats) === */}
            <div className="absolute inset-0 z-0">
                {/* Kita pakai gambar gedung/bendera yang mirip nuansa pemerintahan */}
                <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000"
                    alt="Background Kantor"
                    className="w-full h-full object-cover"
                />
                {/* Overlay Biru Transparan supaya teks terbaca */}
                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-blue-900/40" />
            </div>

            {/* === 2. KONTEN UTAMA === */}
            <div className="relative z-10 w-full max-w-5xl mx-auto text-center">

                {/* --- HEADER (Badge & Judul) --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="mb-12"
                >
                    {/* Badge Kecil (Pill Shape) */}
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-6">
                        <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Akses Layanan
                        </span>
                    </div>

                    {/* Judul Besar (Style: Statistik Kepegawaian) */}
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                        Pusat Layanan <span className="text-blue-200">BOSDM</span>
                    </h2>

                    {/* Subjudul */}
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                        Pusat layanan informasi terintegrasi.
                    </p>
                </motion.div>

                {/* --- CARD PUTIH (Pengganti Grafik) --- */}
                {/* Ini adalah "kotak" yang sama seperti di gambar referensi, tapi isinya Tombol */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    custom={0.2}
                    className="bg-white rounded-3xl p-10 md:p-14 shadow-2xl shadow-blue-900/50 mx-auto max-w-4xl relative overflow-hidden"
                >
                    {/* Dekorasi Background Card (Tipis) */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full translate-y-1/2 translate-x-1/2 opacity-100 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full translate-y-1/2 -translate-x-1/2 opacity-100 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">

                        {/* Kolom Kiri: Teks Ajakan */}
                        <div className="text-left md:w-1/2">
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                Siap untuk masuk?
                            </h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Silakan login untuk mengakses fitur lengkap.
                            </p>

                            {/* Link Helpdesk */}
                            <a href="mailto:helpdesk@brin.go.id" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                <Headphones className="w-4 h-4" />
                                Bantuan
                            </a>
                        </div>

                        {/* Divider Vertical (Hanya di Desktop) */}
                        <div className="hidden md:block w-px h-32 bg-slate-200" />

                        {/* Kolom Kanan: Tombol Action */}
                        <div className="flex flex-col gap-4 w-full md:w-auto min-w-[280px]">
                            {/* Tombol Login (Primary) */}
                            <motion.button
                                onClick={onOpenLogin}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
                            >
                                <LogIn className="w-5 h-5" />
                                Login
                            </motion.button>

                            {/* Tombol Daftar (Secondary - Outline) */}
                            <motion.button
                                onClick={onOpenRegister}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 px-6 bg-red-600 border-2 border-red-200 text-white font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-3"
                            >
                                <UserPlus className="w-5 h-5" />
                                Daftar Akun Baru
                            </motion.button>
                        </div>

                    </div>
                </motion.div>

            </div>
        </section>
    );
}