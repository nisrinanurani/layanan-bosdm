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

        // Validasi
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
            // Cukup Daftar ke Auth saja.
            // Trigger SQL akan otomatis buat data di tabel 'profiles' & set role 'pegawai'
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { nama: formData.nama, nip: formData.nip } // Metadata ini akan diambil trigger
                }
            });

            if (error) throw error;

            alert("Registrasi Berhasil! Cek email untuk verifikasi (atau langsung login jika mode dev).");
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative"
                        >
                            <div className="bg-white p-6 text-center border-b border-slate-100 relative">
                                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                                <h2 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h2>
                                <p className="text-slate-500 text-sm mt-1">Biro Organisasi dan Sumber Daya Manusia</p>
                            </div>
                            <div className="p-8 bg-slate-50/50">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input type="text" name="nama" onChange={handleChange} placeholder="Nama Lengkap" className="w-full px-4 py-3 rounded-lg border border-slate-200" required />
                                    <input type="text" name="nip" onChange={handleChange} placeholder="NIP" className="w-full px-4 py-3 rounded-lg border border-slate-200" required />
                                    <input type="email" name="email" onChange={handleChange} placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-slate-200" required />
                                    <input type="password" name="password" onChange={handleChange} placeholder="Password" className="w-full px-4 py-3 rounded-lg border border-slate-200" required />
                                    <input type="password" name="confirmPassword" onChange={handleChange} placeholder="Konfirmasi Password" className="w-full px-4 py-3 rounded-lg border border-slate-200" required />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 disabled:bg-slate-400"
                                    >
                                        {loading ? "Memproses..." : "Daftar Sekarang"}
                                    </button>
                                </form>
                                <div className="mt-6 text-center text-sm text-slate-500">
                                    Sudah punya akun? <button onClick={() => { onClose(); onSwitchToLogin(); }} className="text-blue-600 font-medium hover:underline">Masuk di sini</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
