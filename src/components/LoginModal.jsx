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
            {/* 1. OVERLAY: Kita buat hitam pekat (Solid) agar fokus ke Modal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/90" // Kita ganti ke /90 (sangat pekat) dan hapus blur
            />

            {/* 2. MODAL CARD: Pakai bg-white murni agar solid & terlihat jelas */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white w-full max-w-sm rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden p-8 text-center"
            >
                {/* Tombol Close (X) agar user gampang keluar */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Pilih Mode Login</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Klik salah satu akun simulasi:</p>
                </div>

                <div className="space-y-3">
                    {/* TOMBOL SUPERADMIN */}
                    <button
                        onClick={() => handleQuickLogin('superadmin')}
                        className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 border border-red-100 rounded-2xl transition-all group"
                    >
                        <div className="bg-red-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                            <HardHat className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-slate-900 text-sm">Masuk: Superadmin</p>
                            <p className="text-[10px] text-red-600 font-black uppercase tracking-tight">Akses Penuh + Edit Profil</p>
                        </div>
                    </button>

                    {/* TOMBOL ADMIN UNIT */}
                    <button
                        onClick={() => handleQuickLogin('admin')}
                        className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl transition-all group"
                    >
                        <div className="bg-blue-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-slate-900 text-sm">Masuk: Admin Unit</p>
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-tight">Monitoring & Jawab Tiket</p>
                        </div>
                    </button>

                    {/* TOMBOL PEGAWAI (Dibuat lebih kontras) */}
                    <button
                        onClick={() => handleQuickLogin('pegawai')}
                        className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all group"
                    >
                        <div className="bg-slate-600 text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-slate-900 text-sm">Masuk: Pegawai Biasa</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Kirim Pertanyaan</p>
                        </div>
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-bold text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan Dashboard...
                    </div>
                )}
            </motion.div>
        </div>
    );
}
