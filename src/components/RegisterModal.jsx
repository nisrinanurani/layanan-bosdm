import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, IdCard, Building2, LayoutGrid, ArrowRight, CheckCircle2, Copy, Send, ChevronDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
    const [loading, setLoading] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false); // State untuk Modal Aduan
    const [generatedUsername, setGeneratedUsername] = useState(null);
    const [helpMessage, setHelpMessage] = useState('');

    const biroList = [
        "Biro Organisasi dan Sumber Daya Manusia", "Biro Perencanaan dan Keuangan",
        "Biro Hukum dan Kerja Sama", "Biro Komunikasi Publik, Umum, dan Kesekretariatan",
        "Biro Manajemen Barang Milik Negara dan Pengadaan", "Inspektorat Utama"
    ];

    const unitList = [
        "Fungsi Organisasi dan Tata Laksana", "Fungsi Pembinaan dan Penegakan Disiplin",
        "Fungsi Manajemen Kinerja dan Penghargaan", "Fungsi Perencanaan dan Pengembangan Karir",
        "Fungsi Perencanaan dan Pengembangan Kompetensi", "Fungsi Penilaian Kompetensi",
        "Fungsi Pengelolaan Data dan Informasi SDM", "Fungsi Kesekretariatan Majelis Profesor",
        "Fungsi Kesekretariatan Reformasi Birokrasi", "Fungsi Mutasi Umum dan Kesejahteraan",
        "Fungsi Mutasi dan Pengelolaan Jabatan Fungsional I", "Fungsi Mutasi dan Pengelolaan Jabatan Fungsional II",
        "Fungsi Mutasi dan Pengelolaan Jabatan Fungsional III", "Fungsi Program Pembinaan dan Penugasan Ulang",
        "Layanan Kawasan SDM 1", "Layanan Kawasan SDM 2", "Layanan Kawasan SDM 3",
        "Layanan Kawasan SDM 4", "Layanan Kawasan SDM 5", "Layanan Kawasan SDM 6",
        "Layanan Kawasan SDM 7", "Layanan Kawasan SDM 8", "Layanan Kawasan SDM 9"
    ];

    const [formData, setFormData] = useState({
        nama_depan: '', nama_belakang: '', nip: '', biro: '', unit: '', password: '', confirmPassword: ''
    });

    const [searchBiro, setSearchBiro] = useState('');
    const [searchUnit, setSearchUnit] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSelect = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (field === 'biro') setSearchBiro(value);
        if (field === 'unit') setSearchUnit(value);
        setOpenDropdown(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return alert("Password tidak cocok!");
        setLoading(true);
        try {
            const res = await fetch('/api/register_final.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                setGeneratedUsername(data.username);
            } else {
                alert("Gagal mendaftar: " + data.message);
            }
        } catch (err) {
            alert("Gagal terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />

                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative border border-slate-100 overflow-hidden">

                        {/* === 1. SUCCESS VIEW (Pop-up Username) === */}
                        {generatedUsername && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-12 text-center rounded-[3rem]">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Pendaftaran Berhasil</h2>
                                <div className="mt-8 p-2 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] w-full flex items-center justify-between">
                                    <span className="flex-1 font-mono text-2xl font-black text-blue-600 pl-6 text-left">{generatedUsername}</span>
                                    <button onClick={() => { navigator.clipboard.writeText(generatedUsername); alert("Username disalin!"); }} className="px-6 py-4 bg-white shadow-md rounded-2xl text-blue-600 font-black text-[10px] uppercase">Salin</button>
                                </div>
                                <button onClick={() => { onClose(); setGeneratedUsername(null); onSwitchToLogin(); }} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">Lanjut ke Login <ArrowRight className="w-4 h-4" /></button>
                            </motion.div>
                        )}

                        {/* === 2. ADUAN / HELP VIEW === */}
                        <AnimatePresence>
                            {isHelpOpen && (
                                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="absolute inset-0 z-[60] bg-white p-12 flex flex-col">
                                    <button onClick={() => setIsHelpOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
                                    <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center text-center">
                                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto"><MessageSquare className="w-6 h-6" /></div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ada Masalah?</h3>
                                        <p className="text-slate-500 text-xs font-bold mt-2 mb-8 uppercase tracking-widest leading-relaxed">Sampaikan kendala Anda pada tim teknis kami.</p>
                                        <div className="space-y-4">
                                            <input type="text" placeholder="Nama Lengkap" className="w-full p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm" />
                                            <textarea placeholder="Tuliskan pesan Anda..." className="w-full p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm min-h-[120px] resize-none" value={helpMessage} onChange={(e) => setHelpMessage(e.target.value)} />
                                            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">Kirim Aduan <Send className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* === 3. FORM UTAMA === */}
                        <div className="p-8 text-center bg-slate-50 border-b rounded-t-[3rem]">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Registrasi Pegawai</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input name="nama_depan" placeholder="Nama Depan" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                                <input name="nama_belakang" placeholder="Nama Belakang" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                            </div>
                            <input name="nip" placeholder="NIP" onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm" required />

                            {/* DROPDOWN BIRO */}
                            <div className="relative">
                                <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-300 z-10" />
                                <input type="text" placeholder="Cari Biro..." value={searchBiro} onChange={(e) => { setSearchBiro(e.target.value); setOpenDropdown('biro'); }} onFocus={() => setOpenDropdown('biro')} className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-blue-100 transition-all" />
                                <ChevronDown className={`absolute right-4 top-4 w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'biro' ? 'rotate-180' : ''}`} />
                                {openDropdown === 'biro' && (
                                    <div className="absolute z-[110] w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-52 overflow-y-auto">
                                        {biroList.filter(i => i.toLowerCase().includes(searchBiro.toLowerCase())).map((item, idx) => (
                                            <div key={idx} onClick={() => handleSelect('biro', item)} className="p-4 text-xs font-bold text-slate-600 hover:bg-blue-50 cursor-pointer border-b last:border-0">{item}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* DROPDOWN UNIT */}
                            <div className="relative">
                                <LayoutGrid className="absolute left-4 top-4 w-5 h-5 text-slate-300 z-10" />
                                <input type="text" placeholder="Cari Fungsi..." value={searchUnit} onChange={(e) => { setSearchUnit(e.target.value); setOpenDropdown('unit'); }} onFocus={() => setOpenDropdown('unit')} className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-blue-100 transition-all" />
                                <ChevronDown className={`absolute right-4 top-4 w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'unit' ? 'rotate-180' : ''}`} />
                                {openDropdown === 'unit' && (
                                    <div className="absolute z-[110] w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-52 overflow-y-auto">
                                        {unitList.filter(i => i.toLowerCase().includes(searchUnit.toLowerCase())).map((item, idx) => (
                                            <div key={idx} onClick={() => handleSelect('unit', item)} className="p-4 text-xs font-bold text-slate-600 hover:bg-blue-50 cursor-pointer border-b last:border-0">{item}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                                <input type="password" name="confirmPassword" placeholder="Konfirmasi" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3">
                                {loading ? "Proses..." : "Daftar Sekarang"} <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* TOMBOL ADUAN */}
                            <div className="mt-6 text-center">
                                <button type="button" onClick={() => setIsHelpOpen(true)} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                                    Ada kendala pendaftaran?
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}