import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, User, Users, Bell, Mail, Settings,
    ChevronDown, Inbox, MessageSquare, ShieldCheck
} from 'lucide-react';
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

// Menambahkan onOpenEditProfil dan onOpenInbox ke dalam destructured props
export default function Dashboard({ user, onLogout, onOpenEditProfil, onOpenInbox }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // 1. Fetch Notifikasi dari Database
    useEffect(() => {
        const fetchNotif = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`/api/get_notifikasi.php?user_id=${user.id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setNotifications(data.data);
                    // Hitung yang is_read == 0
                    const count = data.data.filter(n => n.is_read == 0).length;
                    setUnreadCount(count);
                }
            } catch (err) {
                console.error("Gagal mengambil notifikasi");
            }
        };

        fetchNotif();
        // Opsional: Polling setiap 30 detik untuk update notif otomatis
        const interval = setInterval(fetchNotif, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Helper warna notifikasi
    const getNotifStyle = (kategori) => {
        switch (kategori) {
            case 'lapor_pak': return 'bg-yellow-50 border-l-4 border-yellow-400';
            case 'keamanan': return 'bg-green-50 border-l-4 border-green-400';
            case 'tanya_kami': return 'bg-blue-50 border-l-4 border-blue-400';
            default: return 'bg-white border-l-4 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-brand-gray-50 font-sans text-slate-900 relative pb-20 transition-colors duration-500">

            {/* NAVBAR */}
            <nav className="border-b border-brand-gray-200 px-6 py-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md text-left">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo BRIN" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>

                    <div className="flex items-center gap-6">

                        {/* ICON NOTIFIKASI QUICK VIEW */}
                        <div className="relative group/notif cursor-pointer p-2">
                            <Bell className="w-5 h-5 text-slate-400 group-hover/notif:text-blue-600 transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                    {unreadCount}
                                </span>
                            )}

                            {/* MINI DROPDOWN NOTIFIKASI */}
                            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl opacity-0 invisible group-hover/notif:opacity-100 group-hover/notif:visible transition-all duration-300 z-[70] overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Notifikasi Terbaru</h4>
                                    <span className="text-[10px] font-bold text-blue-600 cursor-pointer" onClick={onOpenInbox}>Lihat Semua</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto text-left">
                                    {notifications.length > 0 ? (
                                        notifications.slice(0, 5).map((n) => (
                                            <div key={n.id} className={`p-4 border-b border-slate-50 last:border-0 ${getNotifStyle(n.kategori)}`}>
                                                <p className="text-xs font-bold text-slate-800 leading-tight">{n.pesan}</p>
                                                <p className="text-[9px] text-slate-400 mt-1 uppercase font-medium">{new Date(n.tanggal).toLocaleString('id-ID')}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 text-xs font-medium">Tidak ada notifikasi baru</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-brand-gray-200"></div>

                        {/* USER PROFILE DROPDOWN */}
                        <div className="relative group cursor-pointer py-1">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-brand-dark uppercase tracking-tighter leading-tight text-right">
                                        {user?.nama_depan || 'Pegawai'}
                                    </p>
                                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest text-right">
                                        {user?.is_superadmin ? 'Superadmin' : 'Pegawai'}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                                    {user?.foto ? (
                                        <img src={`/api/uploads/profil/${user.foto}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-brand-primary" />
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-300 group-hover:rotate-180 transition-transform" />
                            </div>

                            {/* DROPDOWN MENU */}
                            <div className="absolute right-0 mt-2 w-60 bg-white border border-brand-gray-100 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] overflow-hidden translate-y-2 group-hover:translate-y-0 text-left">
                                <div className="p-5 bg-slate-50/50 border-b border-brand-gray-100 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">NIP Pegawai</p>
                                    <p className="text-xs font-bold text-slate-800">{user?.nip || '---'}</p>
                                </div>

                                <div className="p-2">
                                    {/* Perbaikan: Menggunakan onOpenEditProfil untuk modal */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onOpenEditProfil(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-blue-50 rounded-2xl transition-all uppercase tracking-wider group/item"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500" /> Edit Profil
                                    </button>

                                    {/* Perbaikan: Menggunakan onOpenInbox untuk modal */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onOpenInbox(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-orange-50 rounded-2xl transition-all uppercase tracking-wider group/item"
                                    >
                                        <Mail className="w-4 h-4 text-slate-400 group-hover/item:text-orange-500" /> Inbox Layanan
                                    </button>

                                    {user?.is_superadmin && (
                                        <button onClick={() => navigate('/kelola-user')} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-brand-primary bg-blue-50/50 hover:bg-brand-primary hover:text-white rounded-2xl transition-all uppercase tracking-wider mt-1 text-left">
                                            <ShieldCheck className="w-4 h-4" /> Kelola Pengguna
                                        </button>
                                    )}
                                </div>

                                <div className="p-2 mt-1 border-t border-brand-gray-100 bg-slate-50/30">
                                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all uppercase tracking-widest text-left">
                                        <LogOut className="w-4 h-4" /> Keluar Aplikasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 py-12 text-left">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Layanan Kepegawaian</h1>
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.3em] mt-3">Portal Manajemen Konten BOSDM</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {DASHBOARD_MENU.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onClick={() => {
                                navigate(`/${item.id === 'berita' ? 'berita-kami' : item.id === 'link' ? 'semua-link' : item.id === 'download' ? 'dokumen-kami' : item.id === 'grafik' ? 'grafik-data' : item.id}`);
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