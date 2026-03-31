import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, IdCard, Building2, LayoutGrid, ArrowRight, CheckCircle2, Copy, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
    const [loading, setLoading] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [generatedUsername, setGeneratedUsername] = useState(null);
    const [helpMessage, setHelpMessage] = useState('');

    const [formData, setFormData] = useState({
        nama_depan: '',
        nama_belakang: '',
        nip: '',
        biro: '',
        unit: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://layanan-bosdm.free.nf/api/register_final.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Tampilkan Username yang dibuat sistem di Pop-up
                setGeneratedUsername(result.username);
            } else {
                // Muncul jika Nama + Biro + Unit sudah terdaftar di database
                alert("Gagal: " + result.message);
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    };

    const copyUsername = () => {
        navigator.clipboard.writeText(generatedUsername);
        alert("Username disalin ke clipboard!");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* 1. BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
                    />

                    {/* 2. MAIN MODAL CARD */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-slate-100"
                    >

                        {/* === POP-UP BERHASIL (SUCCESS VIEW) === */}
                        {generatedUsername && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Registrasi Berhasil</h2>
                                <p className="text-slate-500 text-sm mt-2">Simpan username ini untuk masuk ke dashboard:</p>

                                <div className="mt-8 p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] w-full flex items-center justify-between group">
                                    <span className="font-mono text-2xl font-black text-blue-600 uppercase tracking-widest">{generatedUsername}</span>
                                    <button onClick={copyUsername} className="p-3 bg-white shadow-md rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => { onClose(); onSwitchToLogin(); }}
                                    className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-slate-200"
                                >
                                    Lanjut ke Login Portal
                                </button>
                            </motion.div>
                        )}

                        {/* === MODAL ADUAN / BANTUAN === */}
                        <AnimatePresence>
                            {isHelpOpen && (
                                <motion.div
                                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="absolute inset-0 z-[60] bg-white p-12 flex flex-col"
                                >
                                    <button onClick={() => setIsHelpOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900">
                                        <X className="w-6 h-6" />
                                    </button>
                                    <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
                                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase">Ada Masalah?</h3>
                                        <p className="text-slate-500 text-xs font-bold mt-2 mb-8 leading-relaxed uppercase tracking-wide">
                                            Malu bertanya sesat dijalan! ceritakan pada kami.
                                        </p>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between px-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap</label>
                                                    <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded-full">Sama Persis dengan di Intra</span>
                                                </div>
                                                <input type="text" placeholder="Gunakan nama lengkap anda..." className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm" />
                                            </div>
                                            <textarea placeholder="Tuliskan pesan atau kendala Anda..." className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm min-h-[120px] resize-none" value={helpMessage} onChange={(e) => setHelpMessage(e.target.value)} />
                                            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                                                Kirim Aduan <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* === FORM REGISTRASI UTAMA === */}
                        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Registrasi Pegawai</h2>
                            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mt-1">lengkapi data anda</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Nama Depan & Belakang */}
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                    <input type="text" name="nama_depan" onChange={handleChange} placeholder="Nama Depan" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm" required />
                                </div>
                                <input type="text" name="nama_belakang" onChange={handleChange} placeholder="Nama Belakang" className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm" required />

                                {/* NIP */}
                                <div className="col-span-2 relative">
                                    <IdCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                    <input type="text" name="nip" onChange={handleChange} placeholder="Nomor Induk Pegawai (NIP)" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm" required />
                                </div>

                                {/* Dropdown Biro */}
                                <div className="col-span-2 relative">
                                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                    <select name="biro" onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm appearance-none" required>
                                        <option value="">Pilih Biro...</option>
                                        <option value="Biro Organisasi dan Sumber Daya Manusia">Biro Organisasi dan Sumber Daya Manusia</option>
                                        <option value="Biro Perencanaan dan Keuangan">Biro Perencanaan dan Keuangan</option>
                                        <option value="Biro Hukum dan Kerja Sama">Biro Hukum dan Kerja Sama</option>
                                        <option value="Biro Komunikasi Publik, Umum, dan Kesekretariatan">Biro Komunikasi Publik, Umum, dan Kesekretariatan</option>
                                        <option value="Biro Manajemen Barang Milik Negara dan Pengadaan">Biro Manajemen Barang Milik Negara dan Pengadaan</option>
                                        <option value="Deputi Bidang Kebijakan Pembangunan">Deputi Bidang Kebijakan Pembangunan</option>
                                        <option value="Deputi Bidang Sumber Daya Manusia Ilmu Pengetahuan dan Teknologi">Deputi Bidang Sumber Daya Manusia Ilmu Pengetahuan dan Teknologi</option>
                                        <option value="Deputi Bidang Insfrastruktur Riset dan Inovasi">Deputi Bidang Insfrastruktur Riset dan Inovasi</option>
                                        <option value="Deputi Bidang Fasilitasi Riset dan Inovasi">Deputi Bidang Fasilitasi Riset dan Inovasi</option>
                                        <option value="Deputi Bidang Pemanfaatan Riset dan Inovasi ">Deputi Bidang Pemanfaatan Riset dan Inovasi</option>
                                        <option value="Deputi Bidang Riset dan Inovasi Daerah">Deputi Bidang Riset dan Inovasi Daerah</option>
                                        <option value="Inspektorat Utama">Inspektorat Utama</option>
                                    </select>
                                </div>

                                {/* Dropdown Unit */}
                                <div className="col-span-2 relative">
                                    <LayoutGrid className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                    <select name="unit" onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm appearance-none" required>
                                        <option value="">Pilih Fungsi / Unit...</option>
                                        <option value="Fungsi Pengelolaan SDM">Fungsi Pengelolaan SDM</option>
                                        <option value="Fungsi Organisasi">Fungsi Organisasi</option>
                                        <option value="Fungsi Perencanaan">Fungsi Perencanaan</option>
                                    </select>
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                    <input type="password" name="password" onChange={handleChange} placeholder="Password" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm" required />
                                </div>
                                <input type="password" name="confirmPassword" onChange={handleChange} placeholder="Konfirmasi" className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-sm" required />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 mt-8 disabled:bg-slate-200"
                            >
                                {loading ? "Mendaftarkan..." : "Daftar Akun Sekarang"}
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsHelpOpen(true)}
                                    className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                >
                                    Ada kendala?
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}