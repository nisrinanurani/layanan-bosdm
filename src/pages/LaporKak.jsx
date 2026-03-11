import { useState, useRef } from 'react';
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

function getFileIcon(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const type = file.type;
    if (type.startsWith('image/')) return { icon: Image, color: 'text-green-600', bg: 'bg-green-50', label: 'Gambar' };
    if (type === 'application/pdf' || ext === 'pdf') return { icon: FileText, color: 'text-red-600', bg: 'bg-red-50', label: 'PDF' };
    if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Video' };
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return { icon: Archive, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Arsip' };
    if (['doc', 'docx'].includes(ext)) return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Dokumen' };
    return { icon: Paperclip, color: 'text-slate-500', bg: 'bg-slate-50', label: ext.toUpperCase() };
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Compact File List ──
function FileList({ files, onRemove }) {
    if (files.length === 0) return null;
    return (
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {files.map((file, idx) => {
                const meta = getFileIcon(file);
                const IconComp = meta.icon;
                return (
                    <div key={idx} className={`flex items-center gap-3 px-3 py-2 ${meta.bg}`}>
                        <IconComp className={`w-4 h-4 shrink-0 ${meta.color}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">{meta.label} · {formatFileSize(file.size)}</p>
                        </div>
                        <button onClick={() => onRemove(idx)} className="shrink-0 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ── Simple Rich Text Box ──
function RichTextBox({ value, onChange, placeholder, minHeight = '120px', readOnly = false }) {
    const ref = useRef(null);
    const exec = (cmd) => { document.execCommand(cmd, false, null); ref.current?.focus(); };

    if (readOnly) {
        return (
            <div
                className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none bg-white rounded-xl p-4 border border-blue-100"
                dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-400 italic">Belum ada tanggapan.</p>' }}
            />
        );
    }
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 border-b border-slate-100">
                <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold'); }} className="p-1.5 rounded hover:bg-slate-200 transition-colors"><Bold className="w-3.5 h-3.5 text-slate-600" /></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic'); }} className="p-1.5 rounded hover:bg-slate-200 transition-colors"><Italic className="w-3.5 h-3.5 text-slate-600" /></button>
                <div className="w-px h-4 bg-slate-200 mx-0.5" />
                <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-1.5 rounded hover:bg-slate-200 transition-colors"><List className="w-3.5 h-3.5 text-slate-600" /></button>
                <span className="ml-auto text-[10px] text-slate-400 font-medium pr-1">Rich Text</span>
            </div>
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={e => onChange(e.currentTarget.innerHTML)}
                className="px-4 py-3 text-sm text-slate-700 leading-relaxed outline-none bg-white"
                style={{ minHeight }}
            />
        </div>
    );
}

// ── Vertical Timeline ──
function VerticalTimeline({ report }) {
    const currentStageIdx = STAGES.findIndex(s => s.key === report.stage);
    return (
        <div className="space-y-0">
            {STAGES.map((stage, idx) => {
                const isDone = idx < currentStageIdx;
                const isActive = idx === currentStageIdx;
                const isPending = idx > currentStageIdx;
                return (
                    <motion.div key={stage.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <motion.div animate={isActive ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${isDone ? 'bg-green-500 border-green-500' : isActive ? 'bg-blue-600 border-blue-600 shadow-blue-200 shadow-lg' : 'bg-white border-slate-200'}`}>
                                {isDone ? <Check className="w-4 h-4 text-white" /> :
                                    isActive ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Clock className="w-3.5 h-3.5 text-white" /></motion.div> :
                                        <div className="w-2 h-2 rounded-full bg-slate-200" />}
                            </motion.div>
                            {idx < STAGES.length - 1 && <div className={`w-0.5 flex-1 min-h-[32px] ${isDone ? 'bg-green-400' : 'bg-slate-100'}`} />}
                        </div>
                        <div className={`flex-1 pb-6 ${idx === STAGES.length - 1 ? 'pb-0' : ''}`}>
                            <div className={`rounded-xl p-3 border ${isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : isDone ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>{stage.key}</span>
                                    {isActive && <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase">Aktif</span>}
                                    {isDone && <span className="text-[9px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase">Selesai</span>}
                                </div>
                                <p className={`text-sm font-bold ${isPending ? 'text-slate-300' : 'text-slate-700'}`}>{stage.label}</p>
                                <p className={`text-xs mt-0.5 ${isPending ? 'text-slate-300' : 'text-slate-500'}`}>{stage.note}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ── Verdict Badge ──
function VerdictBadge({ verdict }) {
    const variants = { TERBUKTI: 'bg-red-600 text-white shadow-red-200', 'TIDAK TERBUKTI': 'bg-green-600 text-white shadow-green-200', DITOLAK: 'bg-slate-600 text-white shadow-slate-200' };
    return (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm shadow-lg uppercase tracking-wide ${variants[verdict] || 'bg-slate-100 text-slate-600'}`}>
            <Shield className="w-4 h-4" /> SELESAI ({verdict})
        </motion.div>
    );
}

// ── Report Row ──
function ReportRow({ report, idx, onClick }) {
    const stageIdx = STAGES.findIndex(s => s.key === report.stage);
    const pct = Math.round((stageIdx / (STAGES.length - 1)) * 100);
    return (
        <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
            onClick={() => onClick(report)}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-red-50/40 transition-all group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${report.stage === 'SELESAI' ? 'bg-green-50 text-green-600 border-green-200' : report.stage === 'INVESTIGASI' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {report.stage}
                    </span>
                    <span className="text-[10px] text-slate-400">{report.tipe}</span>
                    {report.verdict && <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full">{report.verdict}</span>}
                    {report.submittedBy && <span className="text-[9px] text-slate-400 font-medium">oleh {report.submittedBy}</span>}
                </div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors truncate">{report.subject}</p>
                <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-1 overflow-hidden max-w-[120px]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${report.stage === 'SELESAI' ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Tahap {stageIdx + 1}/{STAGES.length} · {STAGES[stageIdx]?.label}</span>
                    <span className="text-[10px] text-slate-400">{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </motion.div>
    );
}

// ── Filter Bar ──
function FilterBar({ filterDate, setFilterDate, filterStatus, setFilterStatus }) {
    return (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="pl-3 pr-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all text-slate-600 cursor-pointer" />
            {filterDate && (
                <button onClick={() => setFilterDate('')} className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
                    <X className="w-3 h-3" /> Reset
                </button>
            )}
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            {[{ key: 'all', label: 'Semua' }, ...STAGES.map(s => ({ key: s.key, label: s.label }))].map(s => (
                <button key={s.key} onClick={() => setFilterStatus(s.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${filterStatus === s.key
                        ? s.key === 'SELESAI' ? 'bg-green-600 text-white border-green-600'
                            : s.key === 'INVESTIGASI' ? 'bg-amber-500 text-white border-amber-500'
                                : s.key === 'all' ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-600'}`}>
                    {s.label}
                </button>
            ))}
        </div>
    );
}

const DUMMY_USER = { nip: '198504201010011001', satker: 'Biro Organisasi dan SDM' };

export default function LaporKak({ userRole }) {
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    // ── Core state — ALL hooks declared unconditionally at the top ──
    const [view, setView] = useState('list');         // 'list' | 'form' | 'detail'
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminTab, setAdminTab] = useState('inbox'); // 'inbox' | 'mine' (admin only)

    const [reports, setReports] = useState(() => {
        try {
            const saved = localStorage.getItem('lapor_kak_data');
            return saved ? JSON.parse(saved) : [
                {
                    id: 9001, tipe: 'Diri Sendiri', nip: '198504201010011001', satker: 'Biro OSDM',
                    nama: 'Ahmad Fauzi', subject: 'Potensi Konflik Kepentingan dalam Pengadaan',
                    deskripsi: 'Terdapat beberapa kejanggalan dalam proses pengadaan barang yang perlu diinvestigasi lebih lanjut.',
                    incident_date: '2026-01-15', files: [], stage: 'INVESTIGASI', verdict: null,
                    official_response: '', final_note: '', createdAt: '2026-01-16T08:00:00Z',
                    submittedBy: 'Pegawai'
                }
            ];
        } catch { return []; }
    });

    // ── Form state ──
    const [reporterType, setReporterType] = useState('diri');
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        nama: '', nip: DUMMY_USER.nip, satker: DUMMY_USER.satker,
        namaOrang: '', nipOrang: '', satkerOrang: '',
        subject: '', deskripsi: '', incident_date: ''
    });
    const [submitOk, setSubmitOk] = useState(false);

    // ── Filter state (ALL at top level) ──
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // ── Admin detail state ──
    const [adminStage, setAdminStage] = useState('');
    const [adminVerdict, setAdminVerdict] = useState('');
    const [adminResponse, setAdminResponse] = useState('');
    const [adminFinalNote, setAdminFinalNote] = useState('');
    const [adminSaveOk, setAdminSaveOk] = useState(false);
    const [stageError, setStageError] = useState('');

    // ── Helpers ──
    const saveReports = (updated) => {
        setReports(updated);
        localStorage.setItem('lapor_kak_data', JSON.stringify(updated));
    };

    const handleFileAdd = (e) => {
        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        e.target.value = '';
    };
    const handleFileRemove = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = () => {
        if (!form.subject.trim() || !form.deskripsi.trim()) return;
        const submitter = userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Pegawai';
        const newReport = {
            id: Date.now(),
            tipe: reporterType === 'diri' ? 'Diri Sendiri' : 'Orang Lain',
            nip: reporterType === 'diri' ? DUMMY_USER.nip : form.nipOrang,
            satker: reporterType === 'diri' ? DUMMY_USER.satker : form.satkerOrang,
            nama: reporterType === 'diri' ? submitter : form.namaOrang,
            subject: form.subject.trim(),
            deskripsi: form.deskripsi.trim(),
            incident_date: form.incident_date,
            files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
            stage: 'PENGAJUAN', verdict: null,
            official_response: '', final_note: '',
            createdAt: new Date().toISOString(),
            submittedBy: submitter,   // track siapa yang membuat
            isAdminReport: isAdmin,   // flag: laporan dari admin/superadmin
        };
        saveReports([newReport, ...reports]);
        setFiles([]);
        setForm({ nama: '', nip: DUMMY_USER.nip, satker: DUMMY_USER.satker, namaOrang: '', nipOrang: '', satkerOrang: '', subject: '', deskripsi: '', incident_date: '' });
        setSubmitOk(true);
        setTimeout(() => { setSubmitOk(false); setView('list'); }, 2000);
    };

    const openDetail = (report) => {
        setSelectedReport(report);
        setAdminStage(report.stage || 'PENGAJUAN');
        setAdminVerdict(report.verdict || '');
        setAdminResponse(report.official_response || '');
        setAdminFinalNote(report.final_note || '');
        setAdminSaveOk(false);
        setStageError('');
        setView('detail');
    };

    const handleAdminSave = () => {
        if (adminStage === 'SELESAI' && !adminFinalNote.replace(/<[^>]+>/g, '').trim()) {
            setStageError('Penjelasan Putusan wajib diisi sebelum status "Selesai".');
            return;
        }
        setStageError('');
        const updated = reports.map(r =>
            r.id === selectedReport.id
                ? { ...r, stage: adminStage, verdict: adminVerdict || null, official_response: adminResponse, final_note: adminFinalNote }
                : r
        );
        saveReports(updated);
        setSelectedReport(prev => ({ ...prev, stage: adminStage, verdict: adminVerdict || null, official_response: adminResponse, final_note: adminFinalNote }));
        setAdminSaveOk(true);
        setTimeout(() => setAdminSaveOk(false), 2000);
    };

    // ── Apply filters helper ──
    const applyFilters = (list) => list.filter(r => {
        const matchDate = !filterDate || new Date(r.createdAt).toDateString() === new Date(filterDate).toDateString();
        const matchStatus = filterStatus === 'all' || r.stage === filterStatus;
        return matchDate && matchStatus;
    });

    // ──────────────── FORM VIEW ────────────────
    if (view === 'form') return (
        <div className="max-w-2xl mx-auto px-4 pb-20">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors mb-6 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali
            </motion.button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Buat Laporan</h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">Semua laporan dijaga kerahasiaannya.</p>

                {submitOk && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 font-bold text-sm">
                        <Check className="w-5 h-5 text-green-600" /> Laporan berhasil dikirim! Mengalihkan...
                    </motion.div>
                )}

                <div className="bg-white rounded-3xl border border-slate-100 p-7 space-y-5 shadow-sm">
                    {/* Reporter toggle */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Melaporkan</label>
                        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                            <button onClick={() => setReporterType('diri')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${reporterType === 'diri' ? 'bg-white text-red-600 shadow' : 'text-slate-500'}`}>
                                <User className="w-4 h-4" /> Diri Sendiri
                            </button>
                            <button onClick={() => setReporterType('orang')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${reporterType === 'orang' ? 'bg-white text-red-600 shadow' : 'text-slate-500'}`}>
                                <Users className="w-4 h-4" /> Orang Lain
                            </button>
                        </div>
                    </div>

                    {/* Auto / manual fields */}
                    <AnimatePresence mode="wait">
                        {reporterType === 'diri' ? (
                            <motion.div key="diri" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">NIP (Auto-fill)</label>
                                    <input readOnly value={DUMMY_USER.nip} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Satker (Auto-fill)</label>
                                    <input readOnly value={DUMMY_USER.satker} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="orang" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nama</label>
                                        <input value={form.namaOrang} onChange={e => setForm({ ...form, namaOrang: e.target.value })} placeholder="Nama lengkap" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">NIP</label>
                                        <input value={form.nipOrang} onChange={e => setForm({ ...form, nipOrang: e.target.value })} placeholder="NIP orang tersebut" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Satker</label>
                                    <input value={form.satkerOrang} onChange={e => setForm({ ...form, satkerOrang: e.target.value })} placeholder="Unit/Satker orang tersebut" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Subject & Date */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Subjek Laporan</label>
                        <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Ringkasan singkat mengenai laporan" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Deskripsi Detail</label>
                        <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={4} placeholder="Jelaskan kronologi kejadian secara detail dan jujur..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Tanggal Kejadian</label>
                        <input type="date" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all cursor-pointer" />
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                            Bukti Pendukung <span className="text-slate-400 font-normal normal-case">(opsional · bisa pilih lebih dari 1 file)</span>
                        </label>
                        <button onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:border-red-300 hover:bg-red-50/50 transition-all group">
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                            <span className="text-sm font-bold text-slate-500 group-hover:text-red-600 transition-colors">Klik atau seret file ke sini</span>
                            <span className="text-xs text-slate-400 ml-1">— semua jenis file didukung</span>
                        </button>
                        <input ref={fileInputRef} type="file" accept="*/*" multiple className="hidden" onChange={handleFileAdd} />
                        <FileList files={files} onRemove={handleFileRemove} />
                        {files.length > 0 && <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{files.length} file terpilih</p>}
                    </div>

                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={!form.subject.trim() || !form.deskripsi.trim()}
                        className="w-full py-3.5 bg-red-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5" /> Kirim Laporan
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // ──────────────── DETAIL VIEW ────────────────
    if (view === 'detail' && selectedReport) {
        const displayReport = isAdmin
            ? { ...selectedReport, stage: adminStage, verdict: adminVerdict || null, official_response: adminResponse }
            : selectedReport;

        return (
            <div className="max-w-2xl mx-auto px-4 pb-20">
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => setView('list')}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors mb-5 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Semua Laporan
                </motion.button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    {/* Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">{selectedReport.tipe}</span>
                                <h2 className="text-xl font-black text-slate-900 mt-2">{selectedReport.subject}</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    {new Date(selectedReport.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    {selectedReport.submittedBy && ` · oleh ${selectedReport.submittedBy}`}
                                </p>
                            </div>
                            {selectedReport.stage === 'SELESAI' && selectedReport.verdict && <VerdictBadge verdict={selectedReport.verdict} />}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">{selectedReport.deskripsi}</p>
                        <div className="flex gap-4 mt-3 text-xs text-slate-500 font-medium flex-wrap">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> NIP: {selectedReport.nip}</span>
                            <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> {selectedReport.satker}</span>
                        </div>
                        {selectedReport.files?.length > 0 && (
                            <div className="mt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{selectedReport.files.length} File Bukti</p>
                                <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 overflow-hidden">
                                    {selectedReport.files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                                            <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="text-xs font-medium text-slate-600 truncate">{f.name}</span>
                                            <span className="text-[10px] text-slate-400 ml-auto shrink-0">{f.size ? formatFileSize(f.size) : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">Progress Penanganan</h3>
                        <VerticalTimeline report={displayReport} />
                    </div>

                    {/* Official Response */}
                    {(displayReport.official_response || isAdmin) && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 border-2 border-blue-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-black text-blue-900 text-sm uppercase tracking-wide">Tanggapan Resmi PIC Bindis</p>
                                    <p className="text-xs text-blue-600 font-medium">Penjelasan resmi mengenai hasil pemeriksaan</p>
                                </div>
                            </div>
                            {isAdmin ? (
                                <RichTextBox value={adminResponse} onChange={setAdminResponse} placeholder="Tulis tanggapan resmi di sini..." minHeight="100px" />
                            ) : (
                                <RichTextBox value={selectedReport.official_response} onChange={() => {}} readOnly />
                            )}
                        </div>
                    )}

                    {/* Admin Controls */}
                    {isAdmin && (
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-500" /> Kontrol Progress PIC
                            </h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tahap Milestone</label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {STAGES.map(s => (
                                        <button key={s.key} onClick={() => { setAdminStage(s.key); if (s.key !== 'SELESAI') setStageError(''); }}
                                            className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border ${adminStage === s.key
                                                ? s.key === 'SELESAI' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-300 hover:text-blue-600'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {adminStage === 'SELESAI' && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Verdict / Putusan</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['TERBUKTI', 'TIDAK TERBUKTI', 'DITOLAK'].map(v => (
                                            <button key={v} onClick={() => setAdminVerdict(v)}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${adminVerdict === v
                                                    ? v === 'TERBUKTI' ? 'bg-red-600 text-white border-red-600' : v === 'TIDAK TERBUKTI' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-600 text-white border-slate-600'
                                                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {adminStage === 'SELESAI' && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                        Penjelasan Putusan <span className="text-red-500">*</span>
                                        <span className="text-slate-400 font-normal normal-case ml-1">(wajib sebelum Selesai)</span>
                                    </label>
                                    <RichTextBox value={adminFinalNote} onChange={setAdminFinalNote} placeholder="Tuliskan penjelasan lengkap mengenai putusan akhir..." minHeight="90px" />
                                    {stageError && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" /> {stageError}
                                        </motion.p>
                                    )}
                                </motion.div>
                            )}
                            {adminSaveOk && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 font-bold text-sm">
                                    <Check className="w-4 h-4" /> Perubahan berhasil disimpan!
                                </motion.div>
                            )}
                            <button onClick={handleAdminSave}
                                className="w-full py-3 bg-slate-900 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 text-sm">
                                <Check className="w-4 h-4" /> Simpan Perubahan
                            </button>
                        </div>
                    )}

                    {/* Final Note read-only for user */}
                    {!isAdmin && selectedReport.stage === 'SELESAI' && selectedReport.final_note && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Penjelasan Putusan Resmi</p>
                            <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedReport.final_note }} />
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // ──────────────── LIST VIEW ────────────────
    // Semua laporan dari pegawai (non-admin)
    const pegawaiReports = applyFilters(reports.filter(r => !r.isAdminReport));
    // Laporan yang dibuat oleh admin sendiri
    const adminOwnReports = applyFilters(reports.filter(r => r.isAdminReport));
    // Untuk pegawai — hanya laporan sendiri
    const myPegawaiReports = applyFilters(reports.filter(r => r.tipe === 'Diri Sendiri' && !r.isAdminReport));

    return (
        <div className="max-w-3xl mx-auto px-4 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Lapor KAK! 🛡️</h1>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">
                        {isAdmin ? `${pegawaiReports.length} laporan masuk · ${adminOwnReports.length} laporan admin` : `${myPegawaiReports.length} laporan saya`}
                    </p>
                </div>
                <button onClick={() => setView('form')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95 text-sm">
                    <Plus className="w-4 h-4" /> Buat Laporan
                </button>
            </motion.div>

            {/* Filter Bar */}
            <FilterBar
                filterDate={filterDate} setFilterDate={setFilterDate}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            />

            {/* ── ADMIN VIEW: Tab inbox vs laporan admin ── */}
            {isAdmin ? (
                <>
                    {/* Tab switcher */}
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-4">
                        <button onClick={() => setAdminTab('inbox')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === 'inbox' ? 'bg-white text-red-600 shadow' : 'text-slate-500'}`}>
                            <Inbox className="w-4 h-4" /> Laporan Masuk
                            {pegawaiReports.length > 0 && (
                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pegawaiReports.length}</span>
                            )}
                        </button>
                        <button onClick={() => setAdminTab('mine')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === 'mine' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>
                            <User className="w-4 h-4" /> Laporan Saya
                            {adminOwnReports.length > 0 && (
                                <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{adminOwnReports.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        {adminTab === 'inbox' ? (
                            <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {pegawaiReports.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold text-sm">Tidak ada laporan masuk.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
                                        {pegawaiReports.map((r, i) => <ReportRow key={r.id} report={r} idx={i} onClick={openDetail} />)}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {adminOwnReports.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold text-sm">Belum ada laporan dari Anda.</p>
                                        <button onClick={() => setView('form')} className="mt-3 text-xs text-red-500 font-bold hover:underline">+ Buat Laporan</button>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
                                        {adminOwnReports.map((r, i) => <ReportRow key={r.id} report={r} idx={i} onClick={openDetail} />)}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            ) : (
                // ── PEGAWAI VIEW ──
                <>
                    {myPegawaiReports.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-bold text-sm">Belum ada laporan.</p>
                            <p className="text-xs mt-1">Klik "Buat Laporan" untuk memulai.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
                            {myPegawaiReports.map((r, i) => <ReportRow key={r.id} report={r} idx={i} onClick={openDetail} />)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
