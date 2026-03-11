import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, ChevronLeft, ChevronRight, Check, Clock,
    User, ArrowRight, Save, AlertTriangle, Users, Lock
} from 'lucide-react';

const STAGES = [
    { key: 'PENGAJUAN', label: 'Pengajuan', note: 'Laporan telah berhasil dikirim.' },
    { key: 'VALIDASI', label: 'Validasi', note: 'Pemeriksaan kelengkapan berkas oleh admin.' },
    { key: 'INVESTIGASI', label: 'Investigasi', note: 'Tim PIC sedang melakukan pendalaman bukti/saksi.' },
    { key: 'PUTUSAN', label: 'Putusan', note: 'Proses finalisasi hasil pemeriksaan.' },
    { key: 'SELESAI', label: 'Selesai', note: 'Putusan akhir telah diterbitkan.' },
];

const VERDICTS = ['TERBUKTI', 'TIDAK TERBUKTI', 'DITOLAK'];

function StageStepper({ currentStage, onSelect }) {
    const currentIdx = STAGES.findIndex(s => s.key === currentStage);
    return (
        <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100 z-0">
                <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIdx / (STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <div className="flex justify-between items-start relative z-10">
                {STAGES.map((stage, idx) => {
                    const isDone = idx < currentIdx;
                    const isActive = idx === currentIdx;
                    const isNext = idx === currentIdx + 1;
                    return (
                        <button
                            key={stage.key}
                            onClick={() => isNext || isActive ? onSelect(stage.key) : null}
                            className={`flex flex-col items-center gap-2 group ${isNext ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-not-allowed'}`}
                        >
                            <motion.div
                                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all shadow-sm ${isDone ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200 shadow-lg' : isNext ? 'bg-white border-blue-300 text-blue-400 group-hover:border-blue-500 group-hover:bg-blue-50' : 'bg-white border-slate-200 text-slate-300'}`}
                            >
                                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </motion.div>
                            <span className={`text-[10px] font-bold text-center leading-tight w-16 ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                                {stage.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ActionPanel({ report, onSave, onClose }) {
    const currentStageIdx = STAGES.findIndex(s => s.key === report.stage);
    const [selectedStage, setSelectedStage] = useState(report.stage);
    const [verdict, setVerdict] = useState(report.verdict || '');
    const [officialResponse, setOfficialResponse] = useState(report.official_response || '');
    const [preview, setPreview] = useState(false);
    const [saved, setSaved] = useState(false);

    const isSettingFinal = selectedStage === 'SELESAI';
    const canSave = !isSettingFinal || (isSettingFinal && verdict && officialResponse.trim());

    const handleSave = () => {
        if (!canSave) return;
        onSave(report.id, {
            stage: selectedStage,
            verdict: isSettingFinal ? verdict : report.verdict,
            official_response: isSettingFinal ? `<p>${officialResponse}</p>` : report.official_response
        });
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">{report.tipe}</span>
                            <h3 className="text-lg font-black text-slate-900 mt-2">{report.subject}</h3>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                                <User className="w-3.5 h-3.5" /> NIP: {report.nip} · {report.satker}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors shrink-0">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7">
                    {/* Report description */}
                    <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                        {report.deskripsi}
                    </div>

                    {/* Stage stepper */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-5">Progress Tahapan</label>
                        <StageStepper currentStage={selectedStage} onSelect={setSelectedStage} />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedStage}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-2xl"
                            >
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{selectedStage}</p>
                                <p className="text-sm text-slate-600 font-medium mt-1">{STAGES.find(s => s.key === selectedStage)?.note}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Final verdict & response (only if SELESAI) */}
                    <AnimatePresence>
                        {isSettingFinal && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-5"
                            >
                                {/* Verdict selector */}
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5" /> Putusan Akhir <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {VERDICTS.map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setVerdict(v)}
                                                className={`py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all ${verdict === v ? v === 'TERBUKTI' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' : v === 'TIDAK TERBUKTI' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' : 'bg-slate-700 text-white border-slate-700 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Official response rich text */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                            <Shield className="w-3.5 h-3.5" />
                                            Jawaban Panjang Putusan Akhir <span className="text-red-500">*</span>
                                        </label>
                                        <button onClick={() => setPreview(!preview)} className="text-xs font-bold text-blue-600 hover:underline">
                                            {preview ? 'Edit' : 'Preview'}
                                        </button>
                                    </div>
                                    {preview ? (
                                        <div
                                            className="min-h-[160px] p-5 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: `<p>${officialResponse}</p>` }}
                                        />
                                    ) : (
                                        <textarea
                                            value={officialResponse}
                                            onChange={e => setOfficialResponse(e.target.value)}
                                            rows={6}
                                            placeholder="Tuliskan penjelasan resmi mengenai hasil pemeriksaan. Jelaskan dasar putusan, fakta yang ditemukan, dan tindak lanjut yang akan diambil..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium resize-none"
                                        />
                                    )}
                                    {isSettingFinal && !officialResponse.trim() && (
                                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Wajib diisi sebelum dapat menyimpan putusan akhir.
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                    <motion.button
                        onClick={handleSave}
                        disabled={!canSave}
                        whileTap={canSave ? { scale: 0.97 } : {}}
                        className={`flex-[2] py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${canSave ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                        {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> {isSettingFinal ? 'Simpan & Selesai' : 'Simpan Perubahan'}</>}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminLaporAction({ userRole }) {
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const [reports, setReports] = useState(() => {
        try {
            const saved = localStorage.getItem('lapor_kak_data');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [selectedReport, setSelectedReport] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStage, setFilterStage] = useState('SEMUA');

    const saveReports = (updated) => {
        setReports(updated);
        localStorage.setItem('lapor_kak_data', JSON.stringify(updated));
    };

    const handleSave = (id, updates) => {
        const updated = reports.map(r => r.id === id ? { ...r, ...updates } : r);
        saveReports(updated);
        setSelectedReport(null);
    };

    const filtered = reports.filter(r => {
        const matchSearch = r.subject.toLowerCase().includes(search.toLowerCase()) || r.satker?.toLowerCase().includes(search.toLowerCase());
        const matchStage = filterStage === 'SEMUA' || r.stage === filterStage;
        return matchSearch && matchStage;
    });

    if (!isAdmin) return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <h2 className="text-xl font-black text-slate-600 mb-2">Akses Terbatas</h2>
            <p className="text-sm text-slate-400 font-medium">Halaman ini hanya dapat diakses oleh Admin atau Super Admin.</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 pb-20">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Admin Panel — Lapor KAK!</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">{reports.length} total laporan masuk</p>
            </motion.div>

            {/* Filters */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 mb-6 shadow-sm flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari laporan..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all" />
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:border-blue-500 transition-all">
                    <option value="SEMUA">Semua Tahap</option>
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-bold text-sm">Belum ada laporan masuk.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {['No', 'Subjek', 'Pelapor/NIP', 'Satker', 'Tahap', 'Tanggal', 'Aksi'].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((report, idx) => (
                                <motion.tr
                                    key={report.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-5 py-4 text-sm text-slate-400 font-bold">{idx + 1}.</td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-slate-800 max-w-[200px] truncate">{report.subject}</p>
                                        {report.verdict && <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full mt-1 inline-block">{report.verdict}</span>}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                                        <p>{report.nama || report.tipe}</p>
                                        <p className="text-slate-400">{report.nip}</p>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-600 font-medium max-w-[120px] truncate">{report.satker}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${report.stage === 'SELESAI' ? 'bg-green-50 text-green-600 border-green-200' : report.stage === 'INVESTIGASI' ? 'bg-amber-50 text-amber-600 border-amber-200' : report.stage === 'PENGAJUAN' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {report.stage}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500 font-medium">{new Date(report.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                                        >
                                            Kelola <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AnimatePresence>
                {selectedReport && (
                    <ActionPanel
                        report={selectedReport}
                        onSave={handleSave}
                        onClose={() => setSelectedReport(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
