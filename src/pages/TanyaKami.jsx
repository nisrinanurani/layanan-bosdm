import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, HelpCircle, Send, FileText,
    X, CheckCircle, Clock, Calendar, ChevronRight, AlertCircle, Loader2, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TanyaKami({ userRole }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('kirim');

    // State Form
    const [formData, setFormData] = useState({ judul: '', deskripsi: '', unitId: '', file: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [showGuidance, setShowGuidance] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // State Riwayat — persisten via localStorage
    const [riwayat, setRiwayat] = useState(() => {
        try {
            const saved = localStorage.getItem('data_pertanyaan');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Simpan ke localStorage setiap kali riwayat berubah
    const saveRiwayat = (data) => {
        setRiwayat(data);
        localStorage.setItem('data_pertanyaan', JSON.stringify(data));
    };

    // Data Unit
    const [units] = useState([
        { id_unit: 5142, fungsi: 'Fungsi Mutasi dan Pengelolaan Jabatan Fungsional I', deskripsi: 'Urusan mutasi, kenaikan pangkat, dan jabatan fungsional.' },
        { id_unit: 5149, fungsi: 'Fungsi Penilaian Kompetensi', deskripsi: 'Urusan asesmen, ujian dinas, dan pemetaan kompetensi.' },
        { id_unit: 5148, fungsi: 'Fungsi Pengelolaan Data dan Informasi SDM', deskripsi: 'Urusan data pegawai, aplikasi internal, dan statistik.' },
    ]);

    // Filter Fungsi
    const filteredUnits = units.filter(u =>
        u.fungsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hitung unread
    const unreadCount = riwayat.filter(d => d.status === 'menunggu').length;

    // === HANDLER: File Change ===
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar! Maksimal 2MB.");
            return;
        }
        setFormData({ ...formData, file });
    };

    // === HANDLER: Submit Pertanyaan (Simulasi — simpan ke local state) ===
    const handleSubmit = () => {
        if (!formData.unitId) { alert("Pilih unit tujuan terlebih dahulu!"); return; }
        if (!formData.judul.trim()) { alert("Judul masalah harus diisi!"); return; }
        if (!formData.deskripsi.trim()) { alert("Deskripsi harus diisi!"); return; }

        setIsSubmitting(true);

        setTimeout(() => {
            const unitInfo = units.find(u => String(u.id_unit) === String(formData.unitId));

            const newPertanyaan = {
                id: Date.now(),
                judul: formData.judul.trim(),
                deskripsi: formData.deskripsi.trim(),
                unit_id: formData.unitId,
                unit_nama: unitInfo ? unitInfo.fungsi : formData.unitId,
                file_name: formData.file ? formData.file.name : null,
                status: 'menunggu',
                jawaban: null,
                created_at: new Date().toISOString(),
            };

            const updated = [newPertanyaan, ...riwayat];
            saveRiwayat(updated);
            setFormData({ judul: '', deskripsi: '', unitId: '', file: null });
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 4000);
            setIsSubmitting(false);
        }, 800);
    };

    // === HANDLER: Admin menjawab pertanyaan ===
    const handleJawab = (id) => {
        const jawaban = prompt("Masukkan jawaban untuk pertanyaan ini:");
        if (jawaban && jawaban.trim()) {
            const updated = riwayat.map(item =>
                item.id === id
                    ? { ...item, status: 'dijawab', jawaban: jawaban.trim() }
                    : item
            );
            saveRiwayat(updated);
        }
    };

    // === STATUS BADGE ===
    const StatusBadge = ({ status }) => {
        const styles = {
            menunggu: 'bg-amber-100 text-amber-700 border-amber-200',
            dijawab: 'bg-green-100 text-green-700 border-green-200',
        };
        const icons = {
            menunggu: <Clock className="w-3 h-3" />,
            dijawab: <CheckCircle className="w-3 h-3" />,
        };
        const labels = {
            menunggu: 'Menunggu Jawaban',
            dijawab: 'Sudah Dijawab',
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status] || styles.menunggu}`}>
                {icons[status] || icons.menunggu} {labels[status] || status}
            </span>
        );
    };

    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-bold text-lg">Portal BOSDM</span>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('kirim')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'kirim' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            Kirim Pertanyaan
                        </button>
                        <button
                            onClick={() => setActiveTab('riwayat')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'riwayat' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                        >
                            {isAdmin ? 'Monitoring' : 'Riwayat'} {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{unreadCount}</span>}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {activeTab === 'kirim' ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Tanya Kami</h1>
                        <p className="text-slate-500 mb-10">Sampaikan kendala atau pertanyaan Anda kepada unit yang tepat.</p>

                        {/* Success Message */}
                        <AnimatePresence>
                            {submitSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <p className="text-green-700 font-medium text-sm">Pertanyaan berhasil dikirim! Anda bisa memantau statusnya di tab {isAdmin ? 'Monitoring' : 'Riwayat'}.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            {/* Pilih Unit Tujuan */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    Unit Tujuan <HelpCircle className="w-4 h-4 text-blue-500 cursor-pointer" onClick={() => setShowGuidance(true)} />
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none"
                                        value={formData.unitId}
                                        onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                    >
                                        <option value="">-- Pilih Fungsi/Unit Tujuan --</option>
                                        {units.map(u => <option key={u.id_unit} value={u.id_unit}>{u.fungsi}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronRight className="w-5 h-5 rotate-90" />
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-slate-400 italic">Klik ikon tanda tanya jika Anda bingung memilih unit.</p>
                            </div>

                            {/* Judul & Deskripsi */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Judul Masalah</label>
                                <input
                                    type="text" placeholder="Misal: Kendala Input SK Mutasi"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                    value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Deskripsi Lengkap</label>
                                <textarea
                                    placeholder="Jelaskan secara detail..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all min-h-[150px]"
                                    value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                />
                            </div>

                            {/* Lampiran */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,image/*" />
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FileText className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-slate-500">{formData.file ? formData.file.name : "Upload PDF/Gambar"}</span>
                                    <span className="text-[10px] text-slate-400">Maksimal 2MB</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-400 disabled:shadow-none"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
                                ) : (
                                    <><Send className="w-5 h-5" /> Kirim Pertanyaan</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* === TAB RIWAYAT / MONITORING === */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                            {isAdmin ? 'Monitoring Pertanyaan' : 'Riwayat Pertanyaan'}
                        </h1>
                        <p className="text-slate-500 mb-10">
                            {isAdmin
                                ? 'Semua pertanyaan masuk dari pengguna. Klik "Jawab" untuk merespons.'
                                : 'Daftar pertanyaan yang pernah Anda kirim.'}
                        </p>

                        {riwayat.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">Belum ada pertanyaan.</p>
                                <p className="text-sm mt-1">Kirim pertanyaan pertama Anda di tab "Kirim Pertanyaan"!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {riwayat.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h3 className="font-bold text-slate-900">{item.judul}</h3>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{item.deskripsi}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="text-blue-500 font-medium">{item.unit_nama || `Unit ${item.unit_id}`}</span>
                                            {item.file_name && (
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <FileText className="w-3 h-3" /> {item.file_name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Jawaban Admin */}
                                        {item.jawaban && (
                                            <div className="mt-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                                                <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Jawaban:</p>
                                                <p className="text-sm text-green-800 leading-relaxed">{item.jawaban}</p>
                                            </div>
                                        )}

                                        {/* Tombol Jawab (hanya untuk admin/superadmin & status menunggu) */}
                                        {isAdmin && item.status === 'menunggu' && (
                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => handleJawab(item.id)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" /> Jawab
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

            {/* MODAL PANDUAN UNIT & SEARCH */}
            <AnimatePresence>
                {showGuidance && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGuidance(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="font-bold text-lg">Cari Unit/Fungsi</h3>
                                <button onClick={() => setShowGuidance(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6">
                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text" placeholder="Ketik kata kunci (misal: Cuti, Mutasi, SK)..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {filteredUnits.length > 0 ? filteredUnits.map(u => (
                                        <div
                                            key={u.id_unit}
                                            onClick={() => { setFormData({ ...formData, unitId: u.id_unit }); setShowGuidance(false); }}
                                            className="p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-widest">{u.id_unit}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-1">{u.fungsi}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{u.deskripsi}</p>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10">
                                            <AlertCircle className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                                            <p className="text-sm text-slate-400 font-medium">Fungsi tidak ditemukan. Coba kata kunci lain.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
