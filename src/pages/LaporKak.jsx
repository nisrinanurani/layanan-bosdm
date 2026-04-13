import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Image, Video, Archive, Paperclip,
    Upload, X, Send, ChevronLeft, ChevronRight,
    Check, Clock, Shield, AlertTriangle,
    User, Users, ArrowRight, Bold, Italic, List,
    Filter, Plus, Inbox
} from 'lucide-react';

const STAGES = [
    { key: 'PENGAJUAN', label: 'Pengajuan', note: 'Laporan telah berhasil dikirim.' },
    { key: 'VALIDASI', label: 'Validasi', note: 'Pemeriksaan kelengkapan berkas oleh admin.' },
    { key: 'INVESTIGASI', label: 'Investigasi', note: 'Tim PIC sedang melakukan pendalaman bukti/saksi.' },
    { key: 'PUTUSAN', label: 'Putusan', note: 'Proses finalisasi hasil pemeriksaan.' },
    { key: 'SELESAI', label: 'Selesai', note: 'Putusan akhir telah diterbitkan.' },
];

// --- HELPER FUNCTIONS (Tetap Dipertahankan) ---
function getFileIcon(file) {
    const name = file.name || "";
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return { icon: Image, color: 'text-green-600', bg: 'bg-green-50', label: 'Gambar' };
    if (ext === 'pdf') return { icon: FileText, color: 'text-red-600', bg: 'bg-red-50', label: 'PDF' };
    if (['mp4', 'mov', 'avi'].includes(ext)) return { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Video' };
    return { icon: Paperclip, color: 'text-slate-500', bg: 'bg-slate-50', label: ext.toUpperCase() };
}

export default function LaporKak({ user }) {
    const userRole = user?.is_superadmin ? 'superadmin' : 'pegawai';
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // ── Core State ──
    const [view, setView] = useState('list');
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [adminTab, setAdminTab] = useState('inbox');

    // ── Filter State ──
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // ── Form State ──
    const [reporterType, setReporterType] = useState('diri');
    const [files, setFiles] = useState([]); // State untuk menampung multiple files
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        namaOrang: '', nipOrang: '', satkerOrang: '',
        subject: '', deskripsi: '', incident_date: ''
    });
    const [submitOk, setSubmitOk] = useState(false);

    // ── Admin Update State ──
    const [adminStage, setAdminStage] = useState('');
    const [adminVerdict, setAdminVerdict] = useState('');
    const [adminResponse, setAdminResponse] = useState('');
    const [adminSaveOk, setAdminSaveOk] = useState(false);

    // 1. Ambil data dari SQL (Ditambahkan fetch attachments)
    const fetchReports = async () => {
        try {
            const res = await fetch(`/api/lapor_handler.php?user_id=${user.id}&role=${userRole}`);
            const data = await res.json();
            setReports(data);
        } catch (e) { console.error("Gagal ambil laporan"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchReports(); }, [user.id, userRole]);

    // 2. Submit ke Database (Dihubungkan ke Multiple Upload)
    const handleSubmit = async () => {
        if (!form.subject.trim()) return;
        try {
            // TAHAP 1: Kirim data teks
            const res = await fetch('/api/lapor_handler.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    tipe: reporterType === 'diri' ? 'Diri Sendiri' : 'Orang Lain',
                    nama_terlapor: reporterType === 'diri' ? user.nama_depan : form.namaOrang,
                    nip_terlapor: reporterType === 'diri' ? user.nip : form.nipOrang,
                    satker_terlapor: reporterType === 'diri' ? user.satker : form.satkerOrang,
                    subject: form.subject,
                    deskripsi: form.deskripsi,
                    incident_date: form.incident_date
                })
            });

            const result = await res.json();

            if (result.status === 'success') {
                const reportId = result.report_id;

                // TAHAP 2: Jika ada file, kirim ke upload_handler.php
                if (files.length > 0) {
                    const formData = new FormData();
                    formData.append('report_id', reportId);
                    files.forEach((file) => {
                        formData.append('files[]', file);
                    });

                    await fetch('/api/upload_handler.php', {
                        method: 'POST',
                        body: formData, // Jangan set header Content-Type di sini
                    });
                }

                setSubmitOk(true);
                setTimeout(() => {
                    setSubmitOk(false);
                    setView('list');
                    fetchReports();
                    setFiles([]); // Reset files
                    setForm({ namaOrang: '', nipOrang: '', satkerOrang: '', subject: '', deskripsi: '', incident_date: '' });
                }, 2000);
            }
        } catch (e) { alert("Error database atau koneksi server"); }
    };

    // 3. Admin Update Progress
    const handleAdminSave = async () => {
        const res = await fetch('/api/lapor_handler.php', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                report_id: selectedReport.id,
                stage: adminStage,
                verdict: adminVerdict,
                response: adminResponse
            })
        });
        if ((await res.json()).status === 'success') {
            setAdminSaveOk(true);
            setTimeout(() => setAdminSaveOk(false), 2000);
            fetchReports();
        }
    };

    const handleFileAdd = (e) => {
        const selected = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selected]);
        e.target.value = '';
    };

    const filteredReports = reports.filter(r => {
        const matchDate = !filterDate || new Date(r.created_at).toDateString() === new Date(filterDate).toDateString();
        const matchStatus = filterStatus === 'all' || r.stage === filterStatus;
        return matchDate && matchStatus;
    });

    // --- VIEW: FORM ---
    if (view === 'form') return (
        <div className="max-w-2xl mx-auto px-4 pb-20 text-left">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter">Buat Laporan Rahasia</h2>

            {submitOk && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-green-50 text-green-700 rounded-2xl font-bold text-sm flex items-center gap-2 border border-green-100">
                    <Check className="w-4 h-4" /> Laporan & Bukti Berhasil Dikirim!
                </motion.div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-5 shadow-2xl shadow-red-50/50">
                <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                    <button onClick={() => setReporterType('diri')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reporterType === 'diri' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Diri Sendiri</button>
                    <button onClick={() => setReporterType('orang')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reporterType === 'orang' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Orang Lain</button>
                </div>

                {reporterType === 'orang' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                        <input placeholder="Nama Terlapor" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-red-100" value={form.namaOrang} onChange={e => setForm({ ...form, namaOrang: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder="NIP" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-red-100" value={form.nipOrang} onChange={e => setForm({ ...form, nipOrang: e.target.value })} />
                            <input placeholder="Satker" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-red-100" value={form.satkerOrang} onChange={e => setForm({ ...form, satkerOrang: e.target.value })} />
                        </div>
                    </motion.div>
                )}

                <input placeholder="Subjek Laporan" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-100" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                <textarea placeholder="Deskripsi kejadian secara detail..." rows={5} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-100 resize-none" value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />

                <div className="grid grid-cols-2 gap-3 italic">
                    <div className="text-[10px] font-bold text-slate-400 uppercase ml-4">Tanggal Kejadian</div>
                    <input type="date" className="w-full px-6 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} />
                </div>

                {/* --- FITUR MULTIPLE UPLOAD (Visual Dipertahankan) --- */}
                <div className="space-y-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 hover:border-red-300 hover:bg-red-50/50 transition-all group">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                        <span className="text-sm font-bold text-slate-500 group-hover:text-red-600">Unggah Bukti Pendukung</span>
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />

                    <div className="grid grid-cols-1 gap-2">
                        {files.map((f, idx) => {
                            const meta = getFileIcon(f);
                            const Icon = meta.icon;
                            return (
                                <div key={idx} className={`flex items-center justify-between p-3 ${meta.bg} rounded-xl border border-slate-100`}>
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${meta.color}`} />
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{f.name}</span>
                                    </div>
                                    <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <button onClick={handleSubmit} className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs active:scale-95">
                    <Send className="w-4 h-4" /> Kirim Laporan Ke PIC
                </button>
            </div>
        </div>
    );

    // --- VIEW: LIST (Tetap Sama) ---
    if (view === 'list') return (
        <div className="max-w-3xl mx-auto px-4 pb-20 text-left">
            <div className="flex justify-between items-center mb-8 pt-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Monitoring Laporan 🛡️</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Saluran Pengaduan Internal</p>
                </div>
                <button onClick={() => setView('form')} className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Lapor Baru
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase tracking-widest text-xs">Menyelaraskan Data...</div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-red-50/50 overflow-hidden divide-y divide-slate-50">
                    {filteredReports.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-bold text-sm italic">Belum ada laporan yang tercatat.</div>
                    ) : filteredReports.map((r, i) => (
                        <div key={r.id} onClick={() => {
                            setSelectedReport(r);
                            setView('detail');
                            setAdminStage(r.stage);
                            setAdminVerdict(r.verdict);
                            setAdminResponse(r.official_response || '');
                        }} className="p-6 hover:bg-red-50/30 cursor-pointer transition-all flex justify-between items-center group">
                            <div>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${r.stage === 'SELESAI' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{r.stage}</span>
                                <h3 className="text-sm font-black text-slate-800 mt-2 uppercase tracking-tight group-hover:text-red-600 transition-colors">{r.subject}</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                    {new Date(r.created_at).toLocaleDateString('id-ID')} · {r.tipe}
                                    {isAdmin && ` · Pelapor: ${r.nama_depan}`}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // --- VIEW: DETAIL ---
    if (view === 'detail') return (
        <div className="max-w-2xl mx-auto px-4 pb-20 text-left">
            <button onClick={() => setView('list')} className="mb-6 flex items-center gap-2 font-bold text-slate-400 hover:text-red-600 transition-colors">
                <ChevronLeft /> Kembali ke Daftar
            </button>

            <div className="space-y-6">
                {/* Laporan Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase border border-red-100">{selectedReport.tipe}</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(selectedReport.created_at).toLocaleString()}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase italic mb-4">{selectedReport.subject}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{selectedReport.deskripsi}</p>

                    {/* Display Attachments */}
                    {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                        <div className="border-t border-slate-50 pt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Paperclip className="w-3 h-3" /> Bukti Lampiran ({selectedReport.attachments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedReport.attachments.map((file, idx) => (
                                    <a key={idx} href={`/api/uploads/${file.nama_file}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all">
                                        <Paperclip className="w-3 h-3 text-blue-500" />
                                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">{file.nama_file}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline Progress */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" /> Status Penanganan
                    </h3>
                    <div className="space-y-6">
                        {STAGES.map((s, idx) => {
                            const currentIdx = STAGES.findIndex(st => st.key === (isAdmin ? adminStage : selectedReport.stage));
                            const isDone = idx <= currentIdx;
                            const isActive = idx === currentIdx;
                            return (
                                <div key={s.key} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-300'}`}>
                                            {isDone ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                        </div>
                                        {idx !== STAGES.length - 1 && <div className={`w-0.5 h-10 ${isDone ? 'bg-green-500' : 'bg-slate-100'}`} />}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`text-xs font-black uppercase ${isDone ? 'text-slate-900' : 'text-slate-300'}`}>{s.label}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{s.note}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Admin Control (Hanya Muncul Jika Admin) */}
                {isAdmin && (
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-red-500" />
                            <h3 className="text-sm font-black uppercase italic tracking-tighter">Panel Verifikasi Admin</h3>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-3 tracking-widest">Ubah Milestone Progress</label>
                            <div className="grid grid-cols-2 gap-2">
                                {STAGES.map(s => (
                                    <button key={s.key} onClick={() => setAdminStage(s.key)} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${adminStage === s.key ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}>{s.label}</button>
                                ))}
                            </div>
                        </div>

                        {adminStage === 'SELESAI' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Verdict / Putusan Akhir</label>
                                    <div className="flex gap-2">
                                        {['TERBUKTI', 'TIDAK TERBUKTI', 'DITOLAK'].map(v => (
                                            <button key={v} onClick={() => setAdminVerdict(v)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${adminVerdict === v ? 'bg-white text-slate-900 border-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{v}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Tanggapan Resmi Admin</label>
                                    <textarea className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs font-bold focus:border-red-600 outline-none min-h-[100px]" placeholder="Berikan alasan atau detail putusan..." value={adminResponse} onChange={e => setAdminResponse(e.target.value)} />
                                </div>
                            </motion.div>
                        )}

                        <button onClick={handleAdminSave} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">
                            {adminSaveOk ? 'Berhasil Disimpan! ✅' : 'Update Laporan Sekarang'}
                        </button>
                    </div>
                )}

                {/* Tampilan Verdict untuk Pegawai */}
                {!isAdmin && selectedReport.stage === 'SELESAI' && (
                    <div className="bg-green-600 p-8 rounded-[2.5rem] shadow-xl text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Check className="w-8 h-8" />
                            <div>
                                <h3 className="font-black uppercase italic text-lg leading-none">Laporan Selesai</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Hasil Investigasi Akhir</p>
                            </div>
                        </div>
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest">Putusan:</span>
                                <span className="bg-white text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{selectedReport.verdict}</span>
                            </div>
                            <p className="text-xs font-medium leading-relaxed italic opacity-90">"{selectedReport.official_response || 'Laporan telah diselesaikan sesuai prosedur yang berlaku.'}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}