import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, IdCard, Building2, LayoutGrid, ArrowRight, CheckCircle2, Copy, Send, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
    const [loading, setLoading] = useState(false);
    const [generatedUsername, setGeneratedUsername] = useState(null);

    // Data List
    const biroList = [
        "Biro Organisasi dan Sumber Daya Manusia", "Biro Perencanaan dan Keuangan",
        "Biro Hukum dan Kerja Sama", "Biro Komunikasi Publik, Umum, dan Kesekretariatan",
        "Biro Manajemen Barang Milik Negara dan Pengadaan", "Inspektorat Utama"
    ];

    const unitList = [
        "Fungsi Organisasi dan Tata Laksana",
        "Fungsi Pembinaan dan Penegakan Disiplin",
        "Fungsi Manajemen Kinerja dan Penghargaan",
        "Fungsi Perencanaan dan Pengembangan Karir",
        "Fungsi Perencanaan dan Pengembangan Kompetensi",
        "Fungsi Penilaian Kompetensi",
        "Fungsi Pengelolaan Data dan Informasi SDM",
        "Fungsi Kesekretariatan Majelis Profesor",
        "Fungsi Kesekretariatan Reformasi Birokrasi",
        "Fungsi Mutasi Umum dan Kesejahteraan",
        "Fungsi Mutasi dan Pengelolaan Jabatan Fungsional I",
        "Fungsi Mutasi dan Pengelolaan Jabatan Fungsional II",
        "Fungsi Mutasi dan Pengelolaan Jabatan Fungsional III",
        "Fungsi Program Pembinaan dan Penugasan Ulang",
        "Layanan Kawasan SDM 1",
        "Layanan Kawasan SDM 2",
        "Layanan Kawasan SDM 3",
        "Layanan Kawasan SDM 4",
        "Layanan Kawasan SDM 5",
        "Layanan Kawasan SDM 6",
        "Layanan Kawasan SDM 7",
        "Layanan Kawasan SDM 8",
        "Layanan Kawasan SDM 9"
    ];

    // Form State
    const [formData, setFormData] = useState({
        nama_depan: '', nama_belakang: '', nip: '', biro: '', unit: '', password: '', confirmPassword: ''
    });

    // Search & UI State
    const [searchBiro, setSearchBiro] = useState('');
    const [searchUnit, setSearchUnit] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null); // 'biro' atau 'unit' atau null

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle Selection
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
            const res = await fetch('https://layanan-bosdm.free.nf/api/register_final.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') setGeneratedUsername(data.username);
            else alert(data.message);
        } catch (err) { alert("Koneksi gagal."); }
        finally { setLoading(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />

                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative border border-slate-100 overflow-visible">

                        {/* HEADER */}
                        <div className="p-8 text-center bg-slate-50 border-b rounded-t-[3rem]">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Registrasi Pegawai</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-4">
                            {/* NAMA & NIP (Singkat saja untuk contoh) */}
                            <div className="grid grid-cols-2 gap-4">
                                <input name="nama_depan" placeholder="Nama Depan" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                                <input name="nama_belakang" placeholder="Nama Belakang" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                            </div>
                            <input name="nip" placeholder="NIP" onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm" required />

                            {/* SEARCHABLE BIRO */}
                            <div className="relative">
                                <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-300 z-10" />
                                <input
                                    type="text"
                                    placeholder="Ketik/Pilih Biro..."
                                    value={searchBiro}
                                    onChange={(e) => { setSearchBiro(e.target.value); setOpenDropdown('biro'); }}
                                    onFocus={() => setOpenDropdown('biro')}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                                />
                                <ChevronDown className={`absolute right-4 top-4 w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'biro' ? 'rotate-180' : ''}`} />

                                <AnimatePresence>
                                    {openDropdown === 'biro' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-[110] w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-52 overflow-y-auto">
                                            {biroList.filter(i => i.toLowerCase().includes(searchBiro.toLowerCase())).map((item, idx) => (
                                                <div key={idx} onClick={() => handleSelect('biro', item)} className="p-4 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b last:border-0">
                                                    {item}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* SEARCHABLE UNIT */}
                            <div className="relative">
                                <LayoutGrid className="absolute left-4 top-4 w-5 h-5 text-slate-300 z-10" />
                                <input
                                    type="text"
                                    placeholder="Ketik/Pilih Fungsi..."
                                    value={searchUnit}
                                    onChange={(e) => { setSearchUnit(e.target.value); setOpenDropdown('unit'); }}
                                    onFocus={() => setOpenDropdown('unit')}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                                />
                                <ChevronDown className={`absolute right-4 top-4 w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'unit' ? 'rotate-180' : ''}`} />

                                <AnimatePresence>
                                    {openDropdown === 'unit' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-[110] w-full mt-2 bg-white border rounded-2xl shadow-2xl max-h-52 overflow-y-auto">
                                            {unitList.filter(i => i.toLowerCase().includes(searchUnit.toLowerCase())).map((item, idx) => (
                                                <div key={idx} onClick={() => handleSelect('unit', item)} className="p-4 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b last:border-0">
                                                    {item}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* PASSWORD */}
                            <div className="grid grid-cols-2 gap-4">
                                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                                <input type="password" name="confirmPassword" placeholder="Konfirmasi" onChange={handleChange} className="p-4 rounded-2xl bg-slate-50 border outline-none font-bold text-sm w-full" required />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3">
                                {loading ? "Proses..." : "Daftar Sekarang"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}