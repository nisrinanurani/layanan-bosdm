import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, HelpCircle, Send, FileText, X, CheckCircle, Clock,
    Calendar as CalendarIcon, ChevronRight, AlertCircle, Loader2,
    MessageCircle, Eye, Download, Filter, Paperclip, Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TanyaKami({ userRole }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('kirim');

    // === STATE FITUR KIRIM (TETAP SAMA) ===
    const [formData, setFormData] = useState({ judul: '', deskripsi: '', unitId: '', file: null });
    const [showGuidance, setShowGuidance] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [searchTermGuidance, setSearchTermGuidance] = useState('');

    // === STATE MONITORING & RIWAYAT (DITINGKATKAN) ===
    const [riwayat, setRiwayat] = useState(() => {
        try {
            const saved = localStorage.getItem('data_pertanyaan');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // State UI Monitoring Baru
    const [searchMonitoring, setSearchMonitoring] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedPertanyaan, setSelectedPertanyaan] = useState(null);
    const [answeringId, setAnsweringId] = useState(null);
    const [redirectingId, setRedirectingId] = useState(null);
    const [answerForm, setAnswerForm] = useState({ teks: '', file: null, link: '' });

    // Data Unit (Tetap Sama)
    const [units] = useState([
        { id_unit: 5142, fungsi: 'Fungsi Mutasi dan Pengelolaan Jabatan Fungsional I', deskripsi: 'Urusan mutasi, kenaikan pangkat, dan jabatan fungsional.' },
        { id_unit: 5149, fungsi: 'Fungsi Penilaian Kompetensi', deskripsi: 'Urusan asesmen, ujian dinas, dan pemetaan kompetensi.' },
        { id_unit: 5148, fungsi: 'Fungsi Pengelolaan Data dan Informasi SDM', deskripsi: 'Urusan data pegawai, aplikasi internal, dan statistik.' },
    ]);

    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === HANDLER KIRIM (ORIGINAL) ===
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) { alert("Ukuran file terlalu besar! Maksimal 2MB."); return; }
        setFormData({ ...formData, file });
    };

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleSubmit = async () => {
        if (!formData.unitId) { alert("Pilih unit tujuan terlebih dahulu!"); return; }
        if (!formData.judul.trim()) { alert("Judul masalah harus diisi!"); return; }
        if (!formData.deskripsi.trim()) { alert("Deskripsi harus diisi!"); return; }

        setIsSubmitting(true);
        const unitInfo = units.find(u => String(u.id_unit) === String(formData.unitId));

        let fileData = null;
        let fileType = null;
        if (formData.file) {
            try {
                fileData = await fileToBase64(formData.file);
                fileType = formData.file.type;
            } catch (err) { console.error('Gagal baca file:', err); }
        }

        const newPertanyaan = {
            id: Date.now(),
            pengirim: userRole || 'User', // Tambahan info pengirim
            judul: formData.judul.trim(),
            deskripsi: formData.deskripsi.trim(),
            unit_id: formData.unitId,
            unit_nama: unitInfo ? unitInfo.fungsi : formData.unitId,
            file_name: formData.file ? formData.file.name : null,
            file_data: fileData,
            file_type: fileType,
            status: 'menunggu',
            jawaban: null,
            created_at: new Date().toISOString(),
            dialihkan: false
        };

        const updated = [newPertanyaan, ...riwayat];
        setRiwayat(updated);
        localStorage.setItem('data_pertanyaan', JSON.stringify(updated));
        setFormData({ judul: '', deskripsi: '', unitId: '', file: null });
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 4000);
        setIsSubmitting(false);
    };

    // === HANDLER MONITORING (BARU) ===
    const filteredMonitoring = useMemo(() => {
        return riwayat.filter(item => {
            const matchesSearch = item.judul.toLowerCase().includes(searchMonitoring.toLowerCase());
            const matchesStatus = filterStatus === 'semua' || item.status === filterStatus;
            const matchesDate = !selectedDate || item.created_at.includes(selectedDate);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [riwayat, searchMonitoring, filterStatus, selectedDate]);

    const handleSendAnswer = () => {
        const updated = riwayat.map(item =>
            item.id === answeringId
                ? { ...item, status: 'dijawab', jawaban: answerForm.teks, jawaban_link: answerForm.link }
                : item
        );
        setRiwayat(updated);
        localStorage.setItem('data_pertanyaan', JSON.stringify(updated));
        setAnsweringId(null);
        setAnswerForm({ teks: '', file: null, link: '' });
    };

    const handleRedirect = (unitId) => {
        const unit = units.find(u => u.id_unit === parseInt(unitId));
        const updated = riwayat.map(item =>
            item.id === redirectingId
                ? { ...item, unit_nama: unit.fungsi, dialihkan: true }
                : item
        );
        setRiwayat(updated);
        localStorage.setItem('data_pertanyaan', JSON.stringify(updated));
        setRedirectingId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-bold text-lg">Portal BOSDM</span>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                        <button onClick={() => setActiveTab('kirim')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'kirim' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Kirim Pertanyaan</button>
                        <button onClick={() => setActiveTab('riwayat')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'riwayat' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>{isAdmin ? 'Monitoring' : 'Riwayat'} <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{riwayat.filter(d => d.status === 'menunggu').length}</span></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {activeTab === 'kirim' ? (
                    // === VIEW KIRIM: TETAP SAMA SEPERTI KODINGAN LAMA ANDA ===
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Tanya Kami</h1>
                        <p className="text-slate-500 mb-10">Sampaikan kendala atau pertanyaan Anda kepada unit yang tepat.</p>
                        {submitSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-green-700 font-medium text-sm">Pertanyaan berhasil dikirim!</p>
                            </div>
                        )}
                        <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">Unit Tujuan <HelpCircle className="w-4 h-4 text-blue-500 cursor-pointer" onClick={() => setShowGuidance(true)} /></label>
                                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.unitId} onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}>
                                    <option value="">-- Pilih Fungsi/Unit Tujuan --</option>
                                    {units.map(u => <option key={u.id_unit} value={u.id_unit}>{u.fungsi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Judul Masalah</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Deskripsi Lengkap</label>
                                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none min-h-[150px]" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} />
                            </div>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 relative flex flex-col items-center justify-center">
                                <input type="file" className="absolute inset-0 opacity-0" onChange={handleFileChange} accept=".pdf,image/*" />
                                <FileText className="w-5 h-5 text-blue-600 mb-1" />
                                <span className="text-xs font-bold text-slate-500">{formData.file ? formData.file.name : "Upload PDF/Gambar"}</span>
                            </div>
                            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Kirim Pertanyaan
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // === VIEW MONITORING: VISUAL BARU (GAMBAR 2) ===
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black text-slate-900 mb-2">{isAdmin ? 'Monitoring Pertanyaan' : 'Riwayat Pertanyaan'}</h1>
                            <p className="text-slate-500 font-medium text-lg">Semua pertanyaan masuk dari pengguna. Klik baris untuk detail.</p>
                        </div>

                        {/* Search & Filter Area */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="text" placeholder='Cari pertanyaan...' className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={searchMonitoring} onChange={(e) => setSearchMonitoring(e.target.value)} />
                            </div>
                            <div className="flex gap-4 border-t border-slate-100 pt-6">
                                <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" onChange={(e) => setSelectedDate(e.target.value)} />
                                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="semua">Semua Status</option>
                                    <option value="menunggu">Menunggu Jawaban</option>
                                    <option value="dijawab">Sudah Dijawab</option>
                                </select>
                            </div>
                        </div>

                        {/* Table Monitoring */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">No</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Dari</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Judul</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Waktu</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredMonitoring.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setSelectedPertanyaan(item)}>
                                            <td className="p-5 text-sm text-slate-500">{idx + 1}.</td>
                                            <td className="p-5 text-sm text-slate-900 font-bold underline decoration-slate-200 decoration-2 underline-offset-4">{item.pengirim}</td>
                                            <td className="p-5 text-sm text-slate-600 font-medium">{item.judul}</td>
                                            <td className="p-5 text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${item.status === 'menunggu' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                                                    {item.status === 'menunggu' ? '● Menunggu Jawaban' : '✓ Sudah Dijawab'}
                                                </span>
                                            </td>
                                            <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col gap-2 items-center">
                                                    {isAdmin && <button onClick={() => setAnsweringId(item.id)} className="w-24 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold">Jawab</button>}
                                                    {isAdmin && <button onClick={() => setRedirectingId(item.id)} className={`w-24 py-2 rounded-lg text-[11px] font-bold ${item.dialihkan ? 'bg-slate-200 text-slate-500' : 'bg-red-600 text-white'}`}>{item.dialihkan ? 'Dialihkan' : 'Dialihkan'}</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* POP-UP 1: DETAIL PERTANYAAN (GAMBAR 1) */}
            <AnimatePresence>
                {selectedPertanyaan && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPertanyaan(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 overflow-hidden">
                            <button onClick={() => setSelectedPertanyaan(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">{selectedPertanyaan.judul}</h2>
                            <p className="text-slate-600 leading-relaxed text-lg mb-8 italic">"{selectedPertanyaan.deskripsi}"</p>
                            <div className="flex items-center gap-6 text-sm font-bold text-slate-400 mb-10 border-b pb-8 border-slate-100">
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><CalendarIcon className="w-4 h-4" /> {new Date(selectedPertanyaan.created_at).toLocaleDateString('id-ID')}</span>
                                <span className="flex items-center gap-2 text-blue-600"><HelpCircle className="w-4 h-4" /> {selectedPertanyaan.unit_nama}</span>
                            </div>

                            {selectedPertanyaan.jawaban && (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white"><CheckCircle className="w-5 h-5" /></div>
                                        <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Jawaban Admin</span>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed">{selectedPertanyaan.jawaban}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* POP-UP 2: INPUT JAWABAN */}
            <AnimatePresence>
                {answeringId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAnsweringId(null)} className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8">
                            <h3 className="text-2xl font-black mb-6">Berikan Tanggapan</h3>
                            <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none min-h-[150px] mb-6" placeholder="Ketik jawaban resmi..." value={answerForm.teks} onChange={(e) => setAnswerForm({ ...answerForm, teks: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="relative border-2 border-dashed border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer">
                                    <input type="file" className="absolute inset-0 opacity-0" />
                                    <Paperclip className="w-5 h-5 text-slate-400 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-500">Lampirkan File</span>
                                </div>
                                <div className="border-2 border-slate-100 p-4 rounded-xl flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">Tautkan Link</span>
                                    <input type="text" placeholder="https://..." className="text-xs outline-none text-blue-600 bg-transparent" value={answerForm.link} onChange={(e) => setAnswerForm({ ...answerForm, link: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setAnsweringId(null)} className="flex-1 py-4 font-bold text-slate-400">Batal</button>
                                <button onClick={handleSendAnswer} className="flex-2 py-4 px-8 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">Kirim Jawaban</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* POP-UP 3: ALIKHAN FUNGSI */}
            <AnimatePresence>
                {redirectingId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRedirectingId(null)} className="absolute inset-0 bg-red-900/20 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
                            <h3 className="text-xl font-black mb-2 text-red-600 uppercase">Alihkan Pertanyaan</h3>
                            <div className="space-y-3 mb-8">
                                {units.map(u => (
                                    <button key={u.id_unit} onClick={() => handleRedirect(u.id_unit)} className="w-full p-4 text-left rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700">{u.fungsi}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setRedirectingId(null)} className="w-full py-3 text-slate-400 font-bold text-sm">Batalkan</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL PANDUAN UNIT (TETAP SAMA) */}
            <AnimatePresence>
                {showGuidance && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGuidance(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Panduan Unit</h3>
                                <button onClick={() => setShowGuidance(false)} className="p-2"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="text" placeholder="Cari fungsi..." className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl outline-none" value={searchTermGuidance} onChange={(e) => setSearchTermGuidance(e.target.value)} />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-3">
                                {units.filter(u => u.fungsi.toLowerCase().includes(searchTermGuidance.toLowerCase())).map(u => (
                                    <div key={u.id_unit} onClick={() => { setFormData({ ...formData, unitId: u.id_unit }); setShowGuidance(false); }} className="p-4 rounded-xl border hover:border-blue-500 hover:bg-blue-50 cursor-pointer">
                                        <h4 className="font-bold text-sm">{u.fungsi}</h4>
                                        <p className="text-xs text-slate-500">{u.deskripsi}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}