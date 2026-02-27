import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, IdCard, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        nip: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama || !formData.nip || !formData.email || !formData.password) {
            alert("Mohon lengkapi semua data!");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { nama: formData.nama, nip: formData.nip }
                }
            });

            if (error) throw error;
            alert("Registrasi Berhasil! Cek email untuk verifikasi.");
            onClose();
            onSwitchToLogin();
        } catch (error) {
            alert("Gagal: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop dengan Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                        {/* CARD UTAMA - GANTI KE bg-white AGAR TIDAK TRANSPARAN */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-brand-gray-100"
                        >
                            {/* Header Modal */}
                            <div className="p-8 text-center border-b border-brand-gray-50 relative bg-brand-gray-50/50">
                                <button onClick={onClose} className="absolute top-6 right-6 text-brand-gray-400 hover:text-brand-primary transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                                <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Daftar Akun</h2>
                                <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mt-2">Biro Organisasi & SDM</p>
                            </div>

                            {/* Form Area */}
                            <div className="p-10">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-brand-gray-400 ml-2 tracking-widest">Informasi Personal</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-brand-gray-300" />
                                            <input type="text" name="nama" onChange={handleChange} placeholder="Nama Lengkap" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold text-sm" required />
                                        </div>
                                        <div className="relative">
                                            <IdCard className="absolute left-4 top-3.5 w-5 h-5 text-brand-gray-300" />
                                            <input type="text" name="nip" onChange={handleChange} placeholder="NIP" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold text-sm" required />
                                        </div>
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <label className="text-[10px] font-black uppercase text-brand-gray-400 ml-2 tracking-widest">Kredensial Login</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-brand-gray-300" />
                                            <input type="email" name="email" onChange={handleChange} placeholder="Email Institusi" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold text-sm" required />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-brand-gray-300" />
                                            <input type="password" name="password" onChange={handleChange} placeholder="Password" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold text-sm" required />
                                        </div>
                                        <input type="password" name="confirmPassword" onChange={handleChange} placeholder="Konfirmasi Password" className="w-full px-4 py-3.5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold text-sm" required />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-brand-primary hover:bg-brand-dark text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-brand-blue-100 transition-all flex items-center justify-center gap-3 mt-8 disabled:bg-brand-gray-200"
                                    >
                                        {loading ? "Memproses..." : "Daftar Sekarang"}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-xs font-bold text-brand-gray-400 uppercase tracking-tight">
                                        Sudah punya akun? <button onClick={() => { onClose(); onSwitchToLogin(); }} className="text-brand-primary hover:underline font-black ml-1">Masuk di sini</button>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}