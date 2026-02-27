import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldCheck, HardHat, Loader2 } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    // FUNGSI LOGIN INSTAN
    const handleQuickLogin = (role) => {
        setIsLoading(true);
        setTimeout(() => {
            onLoginSuccess(role);
            setIsLoading(false);
            onClose();
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-[#E1EFFF] w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-8 text-center"
            >
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Pilih Mode Login</h2>
                    <p className="text-slate-500 text-sm font-medium">Klik salah satu akun simulasi di bawah ini:</p>
                </div>

                <div className="space-y-3">
                    {/* TOMBOL SUPERADMIN */}
                    <button
                        onClick={() => handleQuickLogin('superadmin')}
                        className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 border border-red-100 rounded-2xl transition-all group"
                    >
                        <div className="bg-red-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <HardHat className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-slate-900 text-sm">Masuk: Superadmin</p>
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">Akses Penuh + Edit Profil</p>
                        </div>
                    </button>

                    {/* TOMBOL ADMIN UNIT */}
                    <button
                        onClick={() => handleQuickLogin('admin')}
                        className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl transition-all group"
                    >
                        <div className="bg-blue-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-slate-900 text-sm">Masuk: Admin Unit</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Monitoring & Jawab Tiket</p>
                        </div>
                    </button>

                    {/* TOMBOL PEGAWAI */}
                    <button
                        onClick={() => handleQuickLogin('pegawai')}
                        className="w-full flex items-center gap-4 p-4 bg-[#E1EFFF] hover:bg-[#F0F7FF] border border-slate-200 rounded-2xl transition-all group"
                    >
                        <div className="bg-slate-400 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-slate-900 text-sm">Masuk: Pegawai Biasa</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Kirim Pertanyaan</p>
                        </div>
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-bold text-xs animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan Dashboard...
                    </div>
                )}
            </motion.div>
        </div>
    );
}
