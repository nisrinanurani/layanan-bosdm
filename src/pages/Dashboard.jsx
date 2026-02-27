import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Bell, Edit3, Plus, Trash2, MessageCircle, Users, X } from 'lucide-react'; // Tambahkan X di sini
import { useNavigate } from 'react-router-dom';

// --- TAMBAHKAN IMPORT INI ---
import logoBrin from '../assets/logo-brin-decs.png';
// ----------------------------

const DASHBOARD_MENU = [
    {
        id: 'profil',
        title: "PROFIL DAN MENGENAL KAMI",
        desc: "Visi, Misi, kontak Person Layanan BOSDM",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
        color: "bg-blue-100",
    },
    {
        id: 'berita',
        title: "BERITA BOSDM",
        desc: "Tusi Layanan pusat dan Lksdm",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
        color: "bg-blue-500",
    },
    {
        id: 'grafik',
        title: "GRAFIK KEPEGAWAIAN",
        desc: "Keadaan Kepegawaian Terkini",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
        color: "bg-indigo-900",
    },
    {
        id: 'link',
        title: "KUMPULAN LINK BOSDM",
        desc: "berhubungan dengan tusi BOSDM",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
        color: "bg-blue-900",
    },
    {
        id: 'tanya',
        title: "TANYA KAMI",
        desc: "Sampaikan kepada kami",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
        color: "bg-slate-200",
    },
    {
        id: 'download',
        title: "DOWNLOAD DOKUMEN",
        desc: "Kumpulan SK, Dokumen, Peraturan terkait",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
        color: "bg-blue-400",
    }
];

export default function Dashboard({ userRole, onLogout }) {
    const navigate = useNavigate();
    const currentRole = userRole || 'pegawai';

    // Definisikan izin dengan aman
    const canManageUsers = currentRole === 'superadmin';

    return (
        <div className="min-h-screen bg-[#F0F7FF] font-sans text-slate-900 relative pb-20">

            {/* === NAVBAR === */}
            <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 z-50 bg-[#F0F7FF]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    {/* Logo BRIN */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img
                            src={logoBrin}
                            alt="Logo BRIN"
                            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=BRIN" }}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="h-6 w-px bg-slate-200"></div>

                        {/* Dropdown Profile */}
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-3 group-hover:opacity-80 transition-opacity">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900">Portal BOSDM</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{currentRole}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>

                            {/* Dropdown Content */}
                            <div className="absolute right-0 mt-2 w-48 bg-[#E1EFFF] border border-[#8ECAFE]/40 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
                                <div className="py-1">
                                    {canManageUsers && (
                                        <button
                                            onClick={() => navigate('/kelola-user')}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                                        >
                                            <Users className="w-4 h-4" /> Kelola User
                                        </button>
                                    )}
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                                    >
                                        <LogOut className="w-4 h-4" /> Keluar Aplikasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* === CONTENT GRID === */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">Layanan Kepegawaian</h1>
                    <p className="text-slate-500">Pilih menu layanan yang Anda butuhkan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {DASHBOARD_MENU.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onClick={() => {
                                if (item.id === 'profil') navigate('/profil');
                                if (item.id === 'berita') navigate('/berita-kami', { state: { userRole } });
                                if (item.id === 'tanya') navigate('/tanya');
                                if (item.id === 'link') navigate('/semua-link', { state: { userRole } });
                            }}
                            className="group relative cursor-pointer"
                        >
                            <div className={`relative h-64 w-full rounded-2xl overflow-hidden mb-5 border border-slate-900/10 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 ${item.color}`}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover object-top grayscale opacity-90 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-500"
                                />
                            </div>

                            <div className="pr-4">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1 leading-snug group-hover:text-blue-700 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-base text-slate-600 font-medium leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}