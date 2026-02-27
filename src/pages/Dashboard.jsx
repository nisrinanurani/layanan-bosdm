import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoBrin from '../assets/logo-brin-decs.png';

const DASHBOARD_MENU = [
    { id: 'profil', title: "PROFIL DAN MENGENAL KAMI", desc: "Visi, Misi, kontak Person Layanan BOSDM", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", color: "bg-blue-100" },
    { id: 'berita', title: "BERITA BOSDM", desc: "Tusi Layanan pusat dan Lksdm", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", color: "bg-blue-500" },
    { id: 'grafik', title: "GRAFIK KEPEGAWAIAN", desc: "Keadaan Kepegawaian Terkini", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800", color: "bg-indigo-900" },
    { id: 'link', title: "KUMPULAN LINK BOSDM", desc: "berhubungan dengan tusi BOSDM", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800", color: "bg-blue-900" },
    { id: 'tanya', title: "TANYA KAMI", desc: "Sampaikan kepada kami", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800", color: "bg-slate-200" },
    { id: 'download', title: "DOWNLOAD DOKUMEN", desc: "Kumpulan SK, Dokumen, Peraturan terkait", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800", color: "bg-blue-400" }
];

export default function Dashboard({ userRole, onLogout }) {
    const navigate = useNavigate();
    const currentRole = userRole || 'pegawai';
    const canManageUsers = currentRole === 'superadmin';

    return (
        /* BACKGROUND UTAMA: Pakai warna brand-gray-50 agar selaras dengan Editor/Berita */
        <div className="min-h-screen bg-brand-gray-50 font-sans text-slate-900 relative pb-20 transition-colors duration-500">

            {/* NAVBAR: Pakai background transparan/putih agar adem */}
            <nav className="border-b border-brand-gray-200 px-6 py-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo BRIN" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="h-6 w-px bg-brand-gray-200"></div>
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-brand-dark uppercase tracking-tighter">Portal BOSDM</p>
                                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{currentRole}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-brand-primary" />
                                </div>
                            </div>

                            <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
                                <div className="py-2">
                                    {canManageUsers && (
                                        <button onClick={() => navigate('/kelola-user')} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-brand-dark hover:bg-brand-blue-50 transition-colors uppercase tracking-widest">
                                            <Users className="w-4 h-4 text-brand-primary" /> Kelola User
                                        </button>
                                    )}
                                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-brand-gray-100 uppercase tracking-widest">
                                        <LogOut className="w-4 h-4" /> Keluar Aplikasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Layanan Kepegawaian</h1>
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.3em] mt-3">Portal Manajemen Konten BOSDM</p>
                </div>

                {/* CARD TETAP SAMA: Desain asli kamu tetap dipertahankan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {DASHBOARD_MENU.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onClick={() => {
                                if (item.id === 'profil') navigate('/profil');
                                if (item.id === 'berita') navigate('/berita-kami');
                                if (item.id === 'tanya') navigate('/tanya');
                                if (item.id === 'link') navigate('/semua-link');
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
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1 leading-snug group-hover:text-brand-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-base text-slate-600 font-medium leading-relaxed line-clamp-2">
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