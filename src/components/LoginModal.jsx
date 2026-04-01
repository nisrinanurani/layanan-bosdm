import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2, LogIn, Lock, User as UserIcon } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Fetch ke API login di InfinityFree
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loginData.username,
                    password: loginData.password
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Berhasil Login: Mengirim data user (termasuk is_superadmin) ke App Utama
                onLoginSuccess(data.user);
                onClose();
            } else {
                // Gagal: Username atau Password salah
                setError(data.message || "Username atau Password salah!");
            }
        } catch (err) {
            setError("Gagal terhubung ke database. Pastikan koneksi internet stabil.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                {/* 1. OVERLAY */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
                />

                {/* 2. MODAL CARD */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden p-10 text-center border border-slate-100"
                >
                    {/* Tombol Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header Login */}
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-5 shadow-sm">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Login Portal</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Biro Organisasi & SDM</p>
                    </div>

                    {/* Alert Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-tight"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form Login */}
                    <form onSubmit={handleLogin} className="space-y-3">
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                name="username"
                                placeholder="USERNAME"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                onChange={handleChange}
                                value={loginData.username}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                placeholder="PASSWORD"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none font-bold text-sm transition-all"
                                onChange={handleChange}
                                value={loginData.password}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 mt-8 disabled:bg-slate-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memverifikasi...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    <span>Masuk ke Sistem</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Modal */}
                    <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Gunakan username otomatis yang <br /> didapat saat registrasi.
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}