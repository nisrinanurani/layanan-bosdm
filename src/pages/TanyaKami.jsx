import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, HelpCircle, Send, FileText, X, CheckCircle, Clock,
    Calendar as CalendarIcon, ChevronRight, AlertCircle, Loader2,
    MessageCircle, Eye, Download, Filter, Paperclip, Link as LinkIcon, Plus, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TanyaKami({ userRole }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('kirim');

    // === STATE FITUR KIRIM (ORIGINAL) ===
    const [formData, setFormData] = useState({ judul: '', deskripsi: '', unitId: '', file: null });
    const [showGuidance, setShowGuidance] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [searchTermGuidance, setSearchTermGuidance] = useState('');

    // === STATE MONITORING & RIWAYAT ===
    const [riwayat, setRiwayat] = useState(() => {
        try {
            const saved = localStorage.getItem('data_pertanyaan');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [searchMonitoring, setSearchMonitoring] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedPertanyaan, setSelectedPertanyaan] = useState(null);
    const [answeringId, setAnsweringId] = useState(null);
    const [redirectingId, setRedirectingId] = useState(null);

    // State Form Jawaban (Multi-File & Multi-Link)
    const [answerForm, setAnswerForm] = useState({ teks: '', files: [], links: [''] });

    const [units] = useState([
        { id_unit: 5142, fungsi: 'Fungsi Mutasi dan Pengelolaan Jabatan Fungsional I', deskripsi: 'Urusan mutasi, kenaikan pangkat, dan jabatan fungsional.' },
        { id_unit: 5149, fungsi: 'Fungsi Penilaian Kompetensi', deskripsi: 'Urusan asesmen, ujian dinas, dan pemetaan kompetensi.' },
        { id_unit: 5148, fungsi: 'Fungsi Pengelolaan Data dan Informasi SDM', deskripsi: 'Urusan data pegawai, aplikasi internal, dan statistik.' },
    ]);

    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // === LOGIC HANDLERS ===
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) { alert("Ukuran file terlalu besar! Maksimal 2MB."); return; }
        setFormData({ ...formData, file });
    };

    const handleSubmit = async () => {
        if (!formData.unitId) { alert("Pilih unit tujuan terlebih dahulu!"); return; }
        if (!formData.judul.trim()) { alert("Judul masalah harus diisi!"); return; }
        if (!formData.deskripsi.trim()) { alert("Deskripsi harus diisi!"); return; }

        setIsSubmitting(true);
        const unitInfo = units.find(u => String(u.id_unit) === String(formData.unitId));

        const newPertanyaan = {
            id: Date.now(),
            pengirim: 'User Beraksi',
            judul: formData.judul.trim(),
            deskripsi: formData.deskripsi.trim(),
            unit_nama: unitInfo ? unitInfo.fungsi : formData.unitId,
            file_name: formData.file ? formData.file.name : null,
            file_type: formData.file ? formData.file.type : null,
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

    // Handler Jawaban
    const addLinkField = () => setAnswerForm({ ...answerForm, links: [...answerForm.links, ''] });
    const updateLinkField = (idx, val) => {
        const newLinks = [...answerForm.links];
        newLinks[idx] = val;
        setAnswerForm({ ...answerForm, links: newLinks });
    };
    const handleFileChangeAnswer = (e) => {
        const newFiles = Array.from(e.target.files);
        setAnswerForm({ ...answerForm, files: [...answerForm.files, ...newFiles] });
    };

    const handleSendAnswer = () => {
        const updated = riwayat.map(item =>
            item.id === answeringId
                ? {
                    ...item,
                    status: 'dijawab',
                    jawaban: answerForm.teks,
                    jawaban_links: answerForm.links.filter(l => l.trim() !== ""),
                    jawaban_files_count: answerForm.files.length
                }
                : item
        );
        setRiwayat(updated);
        localStorage.setItem('data_pertanyaan', JSON.stringify(updated));
        setAnsweringId(null);
        setAnswerForm({ teks: '', files: [], links: [''] });
    };

    const filteredMonitoring = useMemo(() => {
        return riwayat.filter(item => {
            const matchesSearch = item.judul.toLowerCase().includes(searchMonitoring.toLowerCase());
            const matchesStatus = filterStatus === 'semua' || item.status === filterStatus;
            const matchesDate = !selectedDate || item.created_at.includes(selectedDate);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [riwayat, searchMonitoring, filterStatus, selectedDate]);

    // Ambil data pertanyaan yang sedang dijawab untuk preview
    const activeQuestion = riwayat.find(q => q.id === answeringId);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-bold text-lg text-slate-800">Portal BOSDM</span>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                        <button onClick={() => setActiveTab('kirim')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'kirim' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Kirim Pertanyaan</button>
                        <button onClick={() => setActiveTab('riwayat')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'riwayat' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>{isAdmin ? 'Monitoring' : 'Riwayat'} <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{riwayat.filter(d => d.status === 'menunggu').length}</span></button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {activeTab === 'kirim' ? (
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
                                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" value={formData.unitId} onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}>
                                    <option value="">-- Pilih Fungsi/Unit Tujuan --</option>
                                    {units.map(u => <option key={u.id_unit} value={u.id_unit}>{u.fungsi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Judul Masalah</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Deskripsi Lengkap</label>
                                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all min-h-[150px]" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} />
                            </div>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 relative flex flex-col items-center justify-center hover:bg-blue-50/50 transition-all">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,image/*" />
                                <FileText className="w-5 h-5 text-blue-600 mb-1" />
                                <span className="text-xs font-bold text-slate-500">{formData.file ? formData.file.name : "Upload PDF/Gambar"}</span>
                            </div>
                            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Kirim Pertanyaan
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black text-slate-900 mb-2">{isAdmin ? 'Monitoring Pertanyaan' : 'Riwayat Pertanyaan'}</h1>
                            <p className="text-slate-500 font-medium text-lg">Semua pertanyaan masuk dari pengguna. Klik baris untuk detail.</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="text" placeholder='Cari pertanyaan...' className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" value={searchMonitoring} onChange={(e) => setSearchMonitoring(e.target.value)} />
                            </div>
                            <div className="flex gap-4 border-t border-slate-100 pt-6">
                                <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer" onChange={(e) => setSelectedDate(e.target.value)} />
                                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer" onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="semua">Semua Status</option>
                                    <option value="menunggu">Menunggu Jawaban</option>
                                    <option value="dijawab">Sudah Dijawab</option>
                                </select>
                            </div>
                        </div>

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
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedPertanyaan(item)}>
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
                                                    {isAdmin && <button onClick={() => setAnsweringId(item.id)} className="w-24 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">Jawab</button>}
                                                    {isAdmin && <button onClick={() => setRedirectingId(item.id)} className={`w-24 py-2 rounded-lg text-[11px] font-bold transition-all ${item.dialihkan ? 'bg-slate-200 text-slate-500' : 'bg-red-600 text-white shadow-md shadow-red-100 hover:bg-red-700'}`}>{item.dialihkan ? 'Telah Dialihkan' : 'Dialihkan'}</button>}
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

            {/* POP-UP 1: DETAIL PERTANYAAN (KLIK BARIS) */}
            <AnimatePresence>
                {selectedPertanyaan && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPertanyaan(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 overflow-hidden">
                            <button onClick={() => setSelectedPertanyaan(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">{selectedPertanyaan.judul}</h2>
                            <p className="text-slate-600 leading-relaxed text-lg mb-8 italic">"{selectedPertanyaan.deskripsi}"</p>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 mb-10 border-b pb-8 border-slate-100">
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><CalendarIcon className="w-4 h-4" /> {new Date(selectedPertanyaan.created_at).toLocaleDateString('id-ID')}</span>
                                <span className="flex items-center gap-2 text-blue-600"><HelpCircle className="w-4 h-4" /> {selectedPertanyaan.unit_nama}</span>
                                {selectedPertanyaan.file_name && (
                                    <span className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1 rounded-lg"><Paperclip className="w-4 h-4" /> {selectedPertanyaan.file_name}</span>
                                )}
                            </div>

                            {selectedPertanyaan.jawaban && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-100"><CheckCircle className="w-5 h-5" /></div>
                                        <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Jawaban Resmi Admin</span>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed">{selectedPertanyaan.jawaban}</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* POP-UP 2: INPUT JAWABAN (MULTI-FILE, LINK & PREVIEW PERTANYAAN) */}
            <AnimatePresence>
                {answeringId && activeQuestion && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAnsweringId(null)} className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                            {/* AREA PREVIEW PERTANYAAN (ATAS) */}
                            <div className="p-8 bg-slate-50 border-b border-slate-200 overflow-y-auto max-h-[30%]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-100 px-2 py-0.5 rounded">Preview Pertanyaan</span>
                                    <button onClick={() => setAnsweringId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                                </div>
                                <h4 className="text-xl font-extrabold text-slate-900 mb-2">{activeQuestion.judul}</h4>
                                <p className="text-sm text-slate-600 italic leading-relaxed mb-4">"{activeQuestion.deskripsi}"</p>

                                {activeQuestion.file_name && (
                                    <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl inline-flex shadow-sm">
                                        {activeQuestion.file_type?.includes('pdf') ? <FileText className="w-4 h-4 text-red-500" /> : <Eye className="w-4 h-4 text-blue-500" />}
                                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">{activeQuestion.file_name}</span>
                                    </div>
                                )}
                            </div>

                            {/* AREA INPUT JAWABAN (BAWAH) */}
                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                <h3 className="text-2xl font-black mb-6 text-slate-900">Berikan Tanggapan</h3>

                                <textarea
                                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all min-h-[120px] mb-6 shadow-inner"
                                    placeholder="Ketik jawaban resmi di sini..."
                                    value={answerForm.teks}
                                    onChange={(e) => setAnswerForm({ ...answerForm, teks: e.target.value })}
                                />

                                {/* Lampiran File Jawaban */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lampiran File ({answerForm.files.length})</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                        {answerForm.files.map((file, idx) => (
                                            <div key={idx} className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center shadow-sm">
                                                <button onClick={() => setAnswerForm({ ...answerForm, files: answerForm.files.filter((_, i) => i !== idx) })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10">
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {file.type.includes('pdf') ? <FileText className="w-8 h-8 text-red-500 mb-2" /> : file.type.includes('image') ? <Eye className="w-8 h-8 text-blue-500 mb-2" /> : <Paperclip className="w-8 h-8 text-slate-400 mb-2" />}
                                                <span className="text-[10px] font-bold text-slate-600 truncate w-full px-1">{file.name}</span>
                                            </div>
                                        ))}
                                        <label className="border-2 border-dashed border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer min-h-[100px]">
                                            <input type="file" className="hidden" multiple onChange={handleFileChangeAnswer} />
                                            <Plus className="w-5 h-5 text-slate-400 mb-1" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tambah File</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Tautkan Multi-Link */}
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tautkan Link</label>
                                    <div className="space-y-3">
                                        {answerForm.links.map((link, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center gap-3">
                                                    <LinkIcon className="w-4 h-4 text-blue-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        className="text-sm outline-none bg-transparent w-full font-medium text-blue-600"
                                                        value={link}
                                                        onChange={(e) => updateLinkField(idx, e.target.value)}
                                                    />
                                                </div>
                                                {idx > 0 && (
                                                    <button onClick={() => setAnswerForm({ ...answerForm, links: answerForm.links.filter((_, i) => i !== idx) })} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={addLinkField} className="flex items-center gap-2 text-blue-600 font-bold text-xs px-2 hover:underline">
                                            <Plus className="w-3 h-3" /> Tambah Link Lain
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t border-slate-100">
                                    <button onClick={() => setAnsweringId(null)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
                                    <button onClick={handleSendAnswer} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <Send className="w-5 h-5" /> Kirim Jawaban Resmi
                                    </button>
                                </div>
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
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8">
                            <h3 className="text-xl font-black mb-2 text-red-600 uppercase tracking-tight">Alihkan Pertanyaan</h3>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Pilih fungsi yang lebih relevan untuk menjawab masalah ini:</p>
                            <div className="space-y-3 mb-8">
                                {units.map(u => (
                                    <button key={u.id_unit} onClick={() => handleRedirect(u.id_unit)} className="w-full p-4 text-left rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex justify-between items-center shadow-sm">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{u.fungsi}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setRedirectingId(null)} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Batalkan</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL PANDUAN UNIT (TETAP SAMA) */}
            <AnimatePresence>
                {showGuidance && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGuidance(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-8 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-2xl text-slate-900">Panduan Unit</h3>
                                <button onClick={() => setShowGuidance(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="text" placeholder="Cari fungsi..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" value={searchTermGuidance} onChange={(e) => setSearchTermGuidance(e.target.value)} />
                            </div>
                            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {units.filter(u => u.fungsi.toLowerCase().includes(searchTermGuidance.toLowerCase())).map(u => (
                                    <div key={u.id_unit} onClick={() => { setFormData({ ...formData, unitId: u.id_unit }); setShowGuidance(false); }} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 cursor-pointer shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-700">{u.fungsi}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{u.deskripsi}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
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