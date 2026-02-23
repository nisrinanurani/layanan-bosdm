import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Bell, Edit3, Plus, Trash2, MessageCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    // Aturan Akses berdasarkan role dari database
    const permissions = {
        canManageUsers: currentRole === 'superadmin',
        canEditCharts: currentRole === 'superadmin',
        canManageContent: ['superadmin', 'admin'].includes(currentRole),
        canAnswerQuestions: ['superadmin', 'admin'].includes(currentRole),
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 relative pb-20">

            {/* === NAVBAR === */}
            <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo - Klik untuk kembali ke Landing Page */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">B</div>
                        <span className="font-bold text-lg tracking-tight group-hover:text-blue-600 transition-colors">Portal BOSDM</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {permissions.canManageUsers && (
                            <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                <Users className="w-4 h-4" /> Kelola User
                            </button>
                        )}
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={onLogout}>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold group-hover:text-blue-600 transition-colors">Portal BOSDM</p>
                                <p className="text-xs text-slate-500 uppercase">{currentRole}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 group-hover:border-blue-400 transition-colors">
                                <User className="w-full h-full p-2 text-slate-400" />
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
                                if (item.id === 'tanya') navigate('/tanya');
                            }}
                            className="group relative cursor-pointer"
                        >
                            {/* KOTAK GAMBAR */}
                            <div className={`relative h-64 w-full rounded-2xl overflow-hidden mb-5 border border-slate-900/10 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 ${item.color}`}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover object-top grayscale opacity-90 mix-blend-multiply group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-500"
                                />

                                {/* Action Buttons */}
                                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                    {item.id === 'grafik' && permissions.canEditCharts && (
                                        <button className="bg-white text-indigo-900 p-2 rounded-lg shadow-lg font-bold text-xs flex items-center gap-1"><Edit3 className="w-4 h-4" /> Edit</button>
                                    )}
                                    {['berita', 'link', 'download'].includes(item.id) && permissions.canManageContent && (
                                        <>
                                            <button className="bg-white text-blue-600 p-2 rounded-lg shadow-lg"><Plus className="w-4 h-4" /></button>
                                            <button className="bg-white text-red-600 p-2 rounded-lg shadow-lg"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    )}
                                    {item.id === 'tanya' && (
                                        <button className="bg-white text-slate-700 p-2 rounded-lg shadow-lg font-bold text-xs flex items-center gap-1">
                                            {permissions.canAnswerQuestions ? "Jawab" : "Tanya"} <MessageCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
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
