import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, X, FileSpreadsheet, BarChart2,
    LineChart as LineIcon, PieChart as PieIcon, Edit3, Save, Download,
    XCircle, AlertCircle, CheckCircle2, Info, Globe, EyeOff, ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';

import {
    PALETTES, TEMPLATE_HEADERS, downloadTemplate,
    downloadChartAsExcel, ChartRenderer
} from '../lib/chartUtils';
import logoBrin from '../assets/logo-brin-decs.png';

/* ─── helpers ─────────────────────────────────────────── */
const parseExcel = (file, onSuccess, onError) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (!rawRows.length) return onError('File kosong. Gunakan Template resmi.');
            const hdrs = (rawRows[0] || []).map(h => String(h).trim());
            const ok = TEMPLATE_HEADERS.every((h, i) => hdrs[i] === h);
            if (!ok) return onError(`Format tidak dikenali. Header: [${hdrs.join(', ')}]. Gunakan Template resmi dengan header [${TEMPLATE_HEADERS.join(', ')}].`);
            const rows = XLSX.utils.sheet_to_json(ws)
                .map(r => ({ name: String(r['Label'] || '').trim(), value: parseFloat(r['Nilai']) || 0 }))
                .filter(r => r.name);
            if (!rows.length) return onError('Tidak ada baris data. Pastikan kolom Label & Nilai terisi.');
            onSuccess(rows);
        } catch {
            onError('File tidak dapat dibaca. Pastikan format .xlsx atau .xls.');
        }
    };
    reader.readAsBinaryString(file);
};

/* ─── palette swatch picker ───────────────────────────── */
function PalettePicker({ value, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(PALETTES).map(([key, colors]) => (
                <button
                    key={key} type="button"
                    onClick={() => onChange(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-[10px] font-bold capitalize transition-all ${value === key ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                >
                    <div className="flex gap-0.5">
                        {colors.slice(0, 4).map((c, i) => <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                    </div>
                    {key}
                </button>
            ))}
        </div>
    );
}

/* ─── chart-type selector ─────────────────────────────── */
function ChartTypePicker({ value, onChange }) {
    const opts = [
        { key: 'bar', label: 'Bar', icon: <BarChart2 size={16} /> },
        { key: 'pie', label: 'Pie', icon: <PieIcon size={16} /> },
        { key: 'line', label: 'Line', icon: <LineIcon size={16} /> },
    ];
    return (
        <div className="flex gap-2">
            {opts.map(t => (
                <button key={t.key} type="button" onClick={() => onChange(t.key)}
                    className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all font-black text-[10px] uppercase ${value === t.key ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                    {t.icon}{t.label}
                </button>
            ))}
        </div>
    );
}

/* ─── publish toggle pill ─────────────────────────────── */
function PublishToggle({ published, onClick }) {
    return (
        <button
            onClick={onClick}
            title={published ? 'Sembunyikan dari halaman depan' : 'Tampilkan di halaman depan'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${published ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
        >
            {published ? <><Globe size={11} /> LIVE</> : <><EyeOff size={11} /> OFF</>}
        </button>
    );
}

/* ─── upload zone ─────────────────────────────────────── */
function ExcelUploadZone({ onData, rowCount }) {
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(false);

    const handle = (e) => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        setErr(null); setOk(false);
        parseExcel(file, rows => { onData(rows); setOk(true); }, msg => { setErr(msg); });
    };

    return (
        <div className="space-y-3">
            {/* Download Template */}
            <button type="button" onClick={downloadTemplate}
                className="w-full flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl hover:bg-emerald-100 hover:border-emerald-400 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Download className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-black text-emerald-700">Unduh Template Excel</p>
                    <p className="text-[10px] text-emerald-500">Template_GrafikData_BOSDM.xlsx</p>
                </div>
            </button>

            {/* Helper */}
            <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-blue-600 leading-relaxed">
                    Gunakan template ini <strong>tanpa mengubah nama header</strong>. Kolom A = <code className="bg-blue-100 px-1 rounded">Label</code>, Kolom B = <code className="bg-blue-100 px-1 rounded">Nilai</code>.
                </p>
            </div>

            {/* Upload */}
            <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${err ? 'border-red-300 bg-red-50' : ok ? 'border-emerald-300 bg-emerald-50' : 'border-blue-100 hover:bg-blue-50 hover:border-blue-400'}`}>
                    <FileSpreadsheet className={`w-5 h-5 ${err ? 'text-red-400' : ok ? 'text-emerald-500' : 'text-blue-500'}`} />
                    <span className={`text-xs font-bold ${err ? 'text-red-500' : ok ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {ok ? 'Ganti File' : 'Pilih File Excel'}
                    </span>
                    <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handle} />
                </label>
                <div className={`p-4 rounded-2xl flex flex-col justify-center ${ok ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Data Terdeteksi</span>
                    <span className={`text-lg font-black ${ok ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {rowCount} <span className="text-xs font-normal text-slate-400">Baris</span>
                    </span>
                </div>
            </div>

            {err && (
                <div className="flex items-start gap-2 px-3 py-3 bg-red-50 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-red-700 font-bold leading-relaxed">{err}</p>
                </div>
            )}
            {ok && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-[11px] text-emerald-700 font-bold">{rowCount} baris berhasil diimpor dari template resmi.</p>
                </div>
            )}
        </div>
    );
}

/* ─── Delete confirmation modal ───────────────────────── */
function DeleteModal({ chart, onCancel, onConfirm }) {
    const [captcha, setCaptcha] = useState('');
    const [step, setStep] = useState(1); // 1 = first warn, 2 = type name
    const match = captcha.trim() === chart.title.trim();
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onCancel} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-slate-900">Hapus Grafik?</h3>
                        <p className="text-xs text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                </div>

                {step === 1 ? (
                    <>
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-6">
                            <p className="text-sm text-red-700 font-bold leading-relaxed">
                                Anda akan menghapus grafik <strong>"{chart.title}"</strong> secara permanen beserta semua data di dalamnya.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onCancel} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-red-100 text-red-600 font-black rounded-2xl hover:bg-red-200 transition-all text-sm">
                                Lanjutkan →
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4">
                            <p className="text-xs text-amber-700 font-bold leading-relaxed">
                                Konfirmasi akhir: ketik judul grafik untuk melanjutkan.
                            </p>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ketik Judul Grafik</p>
                        <div className="p-3 bg-slate-50 rounded-xl mb-3 text-center">
                            <code className="text-sm font-black text-slate-700">{chart.title}</code>
                        </div>
                        <input
                            type="text" value={captcha} onChange={e => setCaptcha(e.target.value)}
                            placeholder="Ketik judul di atas..."
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all text-sm font-medium mb-5"
                        />
                        <div className="flex gap-3">
                            <button onClick={onCancel} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                            <button onClick={() => match && onConfirm()} disabled={!match}
                                className="flex-1 py-3 bg-red-600 text-white font-black rounded-2xl transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 shadow-lg shadow-red-100">
                                <Trash2 className="inline w-4 h-4 mr-1" />Hapus Permanen
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export default function GrafikData({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = userRole === 'superadmin';

    const [allCharts, setAllCharts] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editModal, setEditModal] = useState(null);   // chart being edited
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [cardStatus, setCardStatus] = useState({});

    // New chart form
    const [draft, setDraft] = useState({ title: '', type: 'bar', palette: 'ocean', data: [] });

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        const saved = localStorage.getItem('bosdm_dynamic_charts');
        if (saved) setAllCharts(JSON.parse(saved));
    }, [isAdmin, navigate]);

    const save = (updated) => {
        setAllCharts(updated);
        localStorage.setItem('bosdm_dynamic_charts', JSON.stringify(updated));
    };

    const resetAdd = () => { setIsAddOpen(false); setDraft({ title: '', type: 'bar', palette: 'ocean', data: [] }); };

    /* ── toggle publish ────────────────────────────────── */
    const togglePublish = (id) => save(allCharts.map(c => c.id === id ? { ...c, published: !c.published } : c));

    /* ── card-level import ─────────────────────────────── */
    const cardImport = (chartId, e) => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        const setStatus = (msg) => {
            setCardStatus(p => ({ ...p, [chartId]: msg }));
            setTimeout(() => setCardStatus(p => { const n = { ...p }; delete n[chartId]; return n; }), 4000);
        };
        parseExcel(
            file,
            rows => { save(allCharts.map(c => c.id === chartId ? { ...c, data: rows, updatedAt: new Date().toISOString() } : c)); setStatus(`success:${rows.length} baris diperbarui`); },
            msg => setStatus(`error:${msg}`)
        );
    };

    /* ── add submit ────────────────────────────────────── */
    const submitAdd = () => {
        if (!draft.title.trim() || !draft.data.length) return alert('Lengkapi judul dan data!');
        save([...allCharts, { ...draft, id: Date.now(), published: false, createdAt: new Date().toISOString() }]);
        resetAdd();
    };

    /* ── edit save ─────────────────────────────────────── */
    const submitEdit = () => {
        save(allCharts.map(c => c.id === editModal.id ? editModal : c));
        setEditModal(null);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* NAVBAR */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(-1)}>
                        <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 lg:p-10">
                {/* Page header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Pengelola Visualisasi</h1>
                        <p className="text-slate-400 text-sm mt-1">{allCharts.length} grafik · {allCharts.filter(c => c.published).length} live</p>
                    </div>
                    <button onClick={() => setIsAddOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-wider text-xs">
                        <Plus size={18} /> Tambah Grafik Baru
                    </button>
                </div>

                {/* Empty state */}
                {allCharts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                        <BarChart2 size={56} strokeWidth={1} className="mb-4" />
                        <p className="font-black uppercase tracking-widest text-sm">Belum ada grafik — klik "Tambah Grafik Baru"</p>
                    </div>
                )}

                {/* Chart grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allCharts.map(chart => (
                        <motion.div key={chart.id} layout
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col overflow-hidden">

                            {/* Card header */}
                            <div className="px-6 pt-5 pb-3 flex justify-between items-center">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">{chart.type} chart</p>
                                    <h3 className="font-black text-sm text-slate-800 truncate max-w-[180px]">{chart.title}</h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {/* Import Excel on card */}
                                    <label title="Perbarui data via Excel" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer">
                                        <FileSpreadsheet size={14} />
                                        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={e => cardImport(chart.id, e)} />
                                    </label>
                                    <button onClick={() => setEditModal({ ...chart })} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(chart)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Chart */}
                            <div id={`chart-${chart.id}`} className="px-4 pb-4 bg-white">
                                <ChartRenderer chart={chart} height={220} />
                            </div>

                            {/* Import status toast */}
                            {cardStatus[chart.id] && (() => {
                                const [type, msg] = cardStatus[chart.id].split(':');
                                const ok = type === 'success';
                                return (
                                    <div className={`mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border ${ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        {ok ? <CheckCircle2 size={13} className="shrink-0" /> : <AlertCircle size={13} className="shrink-0" />}
                                        {ok ? `✓ ${msg}` : msg}
                                    </div>
                                );
                            })()}

                            {/* Footer */}
                            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-50 flex justify-between items-center mt-auto">
                                <div className="flex items-center gap-2">
                                    {/* Palette swatches */}
                                    <div className="flex gap-1">
                                        {(PALETTES[chart.palette] || []).slice(0, 5).map((c, i) => (
                                            <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: c }} />
                                        ))}
                                    </div>
                                    {chart.updatedAt && (
                                        <span className="text-[9px] text-slate-300 font-medium">
                                            {new Date(chart.updatedAt).toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Publish toggle */}
                                    <PublishToggle published={chart.published} onClick={() => togglePublish(chart.id)} />
                                    {/* Download as Excel */}
                                    <button
                                        onClick={() => downloadChartAsExcel(chart)}
                                        title="Unduh data sebagai Excel"
                                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-50">
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ══ ADD MODAL ══════════════════════════════════════ */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                            className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">

                            {/* Modal header */}
                            <div className="flex justify-between items-center px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Visual Configurator</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Buat & preview grafik sebelum dipublikasi</p>
                                </div>
                                <button onClick={resetAdd} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-0 overflow-hidden flex-1">
                                {/* Left: Settings */}
                                <div className="overflow-y-auto p-8 space-y-6 border-r border-slate-100">
                                    {/* Title */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Judul Grafik</label>
                                        <input type="text"
                                            className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all text-slate-800 placeholder-slate-300"
                                            placeholder="Contoh: Rekap Status Pegawai"
                                            value={draft.title}
                                            onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} />
                                    </div>

                                    {/* Excel upload */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Impor Data Excel</label>
                                        <ExcelUploadZone onData={rows => setDraft(p => ({ ...p, data: rows }))} rowCount={draft.data.length} />
                                    </div>

                                    {/* Chart type */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Tipe Grafik</label>
                                        <ChartTypePicker value={draft.type} onChange={v => setDraft(p => ({ ...p, type: v }))} />
                                    </div>

                                    {/* Palette */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Palet Warna</label>
                                        <PalettePicker value={draft.palette} onChange={v => setDraft(p => ({ ...p, palette: v }))} />
                                    </div>

                                    {/* Publish */}
                                    <button type="button" onClick={submitAdd}
                                        className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:-translate-y-0.5 transition-all text-sm">
                                        Publish Ke Beranda
                                    </button>
                                </div>

                                {/* Right: Live Preview — white/clean */}
                                <div className="bg-slate-50 p-8 flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-3 mb-5 shrink-0">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 bg-red-400 rounded-full" />
                                            <div className="w-3 h-3 bg-amber-400 rounded-full" />
                                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Live Preview</span>
                                    </div>
                                    <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-[280px]">
                                        {draft.data.length > 0 ? (
                                            <>
                                                {draft.title && (
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 text-center">{draft.title}</p>
                                                )}
                                                <div className="w-full">
                                                    <ChartRenderer chart={draft} height={260} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-slate-300 text-center">
                                                <FileSpreadsheet className="mx-auto mb-3 opacity-30" size={48} />
                                                <p className="text-xs uppercase font-bold tracking-widest opacity-50">Import data untuk preview</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Palette preview strip */}
                                    {draft.palette && (
                                        <div className="flex gap-2 mt-4 justify-center shrink-0">
                                            {(PALETTES[draft.palette] || []).map((c, i) => (
                                                <span key={i} className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ background: c }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══ EDIT MODAL ═════════════════════════════════════ */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                            <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b border-slate-100 shrink-0">
                                <h3 className="text-xl font-black text-slate-900 italic uppercase">Edit Grafik</h3>
                                <button onClick={() => setEditModal(null)} className="p-2 hover:bg-slate-50 rounded-full">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 p-8 space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Judul</label>
                                    <input type="text"
                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800"
                                        value={editModal.title}
                                        onChange={e => setEditModal(p => ({ ...p, title: e.target.value }))} />
                                </div>

                                {/* Chart type */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Tipe Grafik</label>
                                    <ChartTypePicker value={editModal.type} onChange={v => setEditModal(p => ({ ...p, type: v }))} />
                                </div>

                                {/* Palette */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Palet Warna</label>
                                    <PalettePicker value={editModal.palette} onChange={v => setEditModal(p => ({ ...p, palette: v }))} />
                                </div>

                                {/* Mini live preview */}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Preview</p>
                                    <ChartRenderer chart={editModal} height={180} />
                                </div>

                                {/* Data table */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Data Baris</label>
                                    <div className="max-h-[280px] overflow-y-auto pr-1 rounded-2xl border border-slate-100 overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 font-bold text-slate-400 text-[10px] uppercase tracking-widest sticky top-0">
                                                <tr><th className="p-4">Label</th><th className="p-4">Nilai</th><th className="p-4 w-10" /></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {editModal.data.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-2">
                                                            <input className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400"
                                                                value={row.name}
                                                                onChange={e => { const d = [...editModal.data]; d[idx] = { ...d[idx], name: e.target.value }; setEditModal(p => ({ ...p, data: d })); }} />
                                                        </td>
                                                        <td className="p-2">
                                                            <input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-black text-blue-600 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                                                value={row.value}
                                                                onChange={e => { const d = [...editModal.data]; d[idx] = { ...d[idx], value: parseFloat(e.target.value) || 0 }; setEditModal(p => ({ ...p, data: d })); }} />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button onClick={() => setEditModal(p => ({ ...p, data: p.data.filter((_, i) => i !== idx) }))}
                                                                className="text-slate-300 hover:text-red-500 transition-colors">
                                                                <XCircle size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button onClick={() => setEditModal(p => ({ ...p, data: [...p.data, { name: 'Data Baru', value: 0 }] }))}
                                        className="mt-3 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 hover:border-blue-400 transition-all">
                                        + Tambah Baris
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 px-8 py-5 border-t border-slate-100 shrink-0">
                                <button onClick={() => setEditModal(null)} className="flex-1 py-3.5 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                                <button onClick={submitEdit}
                                    className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                    <Save size={14} /> Simpan Perubahan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══ DELETE MODAL ═══════════════════════════════════ */}
            <AnimatePresence>
                {deleteTarget && (
                    <DeleteModal
                        chart={deleteTarget}
                        onCancel={() => setDeleteTarget(null)}
                        onConfirm={() => { save(allCharts.filter(c => c.id !== deleteTarget.id)); setDeleteTarget(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}