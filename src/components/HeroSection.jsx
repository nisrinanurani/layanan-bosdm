import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ChevronDown, LogIn, UserPlus } from 'lucide-react';

// Pastikan import gambar sesuai nama file kamu
import gedungBrin from '../assets/gedung-brin-thamrin.png';
import logoBrin from '../assets/logo-brin-decs.png';

export default function HeroSection({ onOpenLogin }) {
    const containerRef = useRef(null);

    // --- 1. SETUP MOUSE PARALLAX (INTERAKTIF GERAK MOUSE) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring Config: Mengatur kehalusan/kekenyalan gerakan mouse
    const springConfig = { stiffness: 100, damping: 30 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Transformasi Gerakan:
    // Background bergerak lebih jauh (30px) berlawanan arah mouse
    const bgX = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
    const bgY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);

    // Konten Teks bergerak sedikit (10px) searah mouse (Efek kedalaman 3D)
    const contentX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
    const contentY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        // Menghitung posisi mouse relatif terhadap tengah container (-0.5 s/d 0.5)
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    // --- 2. VARIANTS ANIMASI (Flow Entrance) ---
    // Parent (Container) mengatur anak-anaknya
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15, // Jeda 0.15 detik antar elemen (Logo -> Judul -> Subjudul -> Tombol)
                delayChildren: 0.2,
            },
        },
    };

    // Child (Item) animasi muncul dari bawah
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 50, damping: 20 } // Efek bouncy halus
        },
    };

    return (
        <section
            id="hero"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex items-center justify-left overflow-hidden bg-[#E0F2FE]"
        >
            {/* ===== LAYER 1: Background Elements (Bergerak Parallax) ===== */}
            <motion.div
                style={{ x: bgX, y: bgY, scale: 1.05 }} // Scale sedikit biar ga bocor pas gerak
                className="absolute inset-0 z-0"
            >
                {/* Foto Gedung */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${gedungBrin})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center right', // Tetap fokus kanan
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            </motion.div>

            {/* ===== LAYER 2: Gradient Overlay (Diam/Static) ===== */}
            {/* Gradasi ini penting agar teks terbaca jelas di atas foto */}
            <div
                className="absolute inset-0 z-1"
                style={{
                    background: `linear-gradient(to right, #E0F2FE 0%, #E0F2FE 35%, rgba(224, 242, 254, 0.9) 45%, rgba(224, 242, 254, 0.4) 65%, rgba(224, 242, 254, 0.05) 80%, transparent 100%)`,
                }}
            />

            {/* ===== LAYER 3: Main Content (Interactive) ===== */}
            <motion.div
                className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 text-left"
                variants={containerVariants} // Parent mengaktifkan stagger
                initial="hidden"
                animate="visible"
                style={{ x: contentX, y: contentY }} // Teks ikut bergerak halus mengikuti mouse
            >
                {/* Logo BRIN */}
                <motion.img
                    src={logoBrin}
                    alt="Logo BRIN"
                    variants={itemVariants}
                    // -ml-2 atau -ml-3 digunakan untuk menarik logo ke kiri agar sejajar optis dengan teks
                    className="block h-16 md:h-24 w-auto mb-8 drop-shadow-sm -ml-2 md:-ml-3"
                />

                {/* Heading */}
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-brand-dark leading-tight tracking-tight"
                >
                    Welcome to <br />
                    Biro Organisasi <br />
                    dan Sumber <br />
                    Daya Manusia{' '}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="mt-6 text-lg sm:text-xl text-brand-gray-500 max-w-2xl leading-relaxed"
                >
                    Pusat Layanan Biro Organisasi dan Sumber Daya Manusia <br />
                    Badan Riset dan Inovasi Nasional
                </motion.p>

                {/* CTA Buttons (Interaktif Hover) */}
                <motion.div
                    variants={itemVariants}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-left gap-4"
                >
                    <motion.button
                        onClick={onOpenLogin}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-brand-red rounded-xl shadow-lg shadow-brand-red/30 hover:shadow-brand-red/50 transition-all duration-300"
                    >
                        <LogIn className="w-5 h-5" />
                        MASUK
                    </motion.button>

                    <motion.a
                        href="#"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-brand-primary border-2 border-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all duration-300"
                    >
                        <UserPlus className="w-5 h-5" />
                        DAFTAR BARU
                    </motion.a>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
            >
                <span className="text-xs font-medium text-brand-gray-400 tracking-wide">
                    Scroll untuk Data Publik
                </span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ChevronDown className="w-5 h-5 text-brand-primary/60" />
                </motion.div>
            </motion.div>
        </section>
    );
}