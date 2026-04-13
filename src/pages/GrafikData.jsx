import { useState, useEffect, useMemo } from 'react';
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

            <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0"><Info size={14} /></div>
                <p className="text-[10px] text-blue-600 leading-relaxed">
                    Gunalan template ini <strong>tanpa mengubah nama header</strong>. Kolom A = <code className="bg-blue-100 px-1 rounded">Label</code>, Kolom B = <code className="bg-blue-100 px-1 rounded">Nilai</code>.
                </p>
            </div>

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
    const [step, setStep] = useState(1);
    const match = captcha.trim() === chart.title.trim();
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden text-left">
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
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-red-400 transition-all text-sm font-medium mb-5"
                        />
                        <div className="flex gap-3">
                            <button onClick={onCancel} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">Batal</button>
                            <button onClick={() => match && onConfirm()} disabled={!match}
                                className="flex-1 py-3 bg-red-600 text-white font-black rounded-2xl transition-all text-sm disabled:opacity-30 hover:bg-red-700 shadow-lg shadow-red-100">
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
export default function GrafikData({ permissions }) {
    const navigate = useNavigate();

    const canEdit    = !!(permissions?.grafik?.edit);
    const canDelete  = !!(permissions?.grafik?.delete);
    const canPublish = !!(permissions?.grafik?.publish);
    const isAdmin    = canEdit || canDelete || canPublish;

    const [allCharts, setAllCharts] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [cardStatus, setCardStatus] = useState({});
    const [draft, setDraft] = useState({ title: '', type: 'bar', palette: 'ocean', data: [] });
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Fetch dari MySQL
    useEffect(() => {
        const fetchCharts = async () => {
            try {
                const res = await fetch('/api/grafik/get.php');
                const result = await res.json();
                if (result.status === 'success') setAllCharts(result.data);
                else setApiError('Gagal memuat data grafik');
            } catch {
                setApiError('Koneksi server gagal');
            } finally {
                setLoading(false);
            }
        };
        fetchCharts();
    }, []);

    // Helper: simpan chart ke API
    const saveChartToApi = async (chartData) => {
        try {
            const res = await fetch('/api/grafik/save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chartData),
            });
            return await res.json();
        } catch { return { status: 'error', message: 'Koneksi gagal' }; }
    };

    const resetAdd = () => { setIsAddOpen(false); setDraft({ title: '', type: 'bar', palette: 'ocean', data: [] }); };

    // Toggle publish via API
    const togglePublish = async (id) => {
        const res = await fetch('/api/grafik/toggle_publish.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        const result = await res.json();
        if (result.status === 'success') {
            setAllCharts(prev => prev.map(c => c.id === id ? { ...c, published: !!result.published } : c));
        }
    };

    const cardImport = async (chartId, e) => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        const setStatus = (msg) => {
            setCardStatus(p => ({ ...p, [chartId]: msg }));
            setTimeout(() => setCardStatus(p => { const n = { ...p }; delete n[chartId]; return n; }), 4000);
        };
        const chart = allCharts.find(c => c.id === chartId);
        parseExcel(
            file,
            async rows => {
                const updated = { ...chart, data: rows };
                const result = await saveChartToApi(updated);
                if (result.status === 'success') {
                    setAllCharts(prev => prev.map(c => c.id === chartId ? updated : c));
                    setStatus(`success:${rows.length} baris diperbarui`);
                } else { setStatus('error:Gagal menyimpan ke server'); }
            },
            msg => setStatus(`error:${msg}`)
        );
    };

    const submitAdd = async () => {
        if (!draft.title.trim() || !draft.data.length) return alert('Lengkapi judul dan data!');
        const newChart = { ...draft, id: Date.now(), published: false, createdAt: new Date().toISOString() };
        const result = await saveChartToApi(newChart);
        if (result.status === 'success') { setAllCharts(prev => [newChart, ...prev]); resetAdd(); }
        else alert('Gagal menyimpan grafik: ' + result.message);
    };

    const submitEdit = async () => {
        const result = await saveChartToApi(editModal);
        if (result.status === 'success') { setAllCharts(prev => prev.map(c => c.id === editModal.id ? editModal : c)); }
        setEditModal(null);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-left">
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md text-left">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 lg:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Grafik Kepegawaian</h1>
                        <p className="text-slate-400 text-sm mt-1">{allCharts.length} grafik tersedia</p>
                    </div>

                    {/* Tombol Tambah: hanya jika canEdit */}
                    {canEdit && (
                        <button onClick={() => setIsAddOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-wider text-xs">
                            <Plus size={18} /> Tambah Grafik Baru
                        </button>
                    )}
                </div>

                {allCharts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                        <BarChart2 size={56} strokeWidth={1} className="mb-4" />
                        <p className="font-black uppercase tracking-widest text-sm">Belum ada grafik tersedia</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allCharts.map(chart => (
                        <motion.div key={chart.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col overflow-hidden">

                            <div className="px-6 pt-5 pb-3 flex justify-between items-center text-left">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">{chart.type} chart</p>
                                    <h3 className="font-black text-sm text-slate-800 truncate max-w-[180px]">{chart.title}</h3>
                                </div>

                                {/* Tombol aksi kartu: granular per permission */}
                                {(canEdit || canDelete) && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {canEdit && (
                                        <label title="Perbarui via Excel" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer">
                                            <FileSpreadsheet size={14} />
                                            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={e => cardImport(chart.id, e)} />
                                        </label>
                                        )}
                                        {canEdit && <button onClick={() => setEditModal({ ...chart })} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit3 size={14} /></button>}
                                        {canDelete && <button onClick={() => setDeleteTarget(chart)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button>}
                                    </div>
                                )}
                            </div>

                            <div className="px-4 pb-4 bg-white"><ChartRenderer chart={chart} height={220} /></div>

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

                            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-50 flex justify-between items-center mt-auto">
                                <div className="flex gap-1">
                                    {(PALETTES[chart.palette] || []).slice(0, 5).map((c, i) => (
                                        <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: c }} />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Publish toggle: hanya jika canPublish */}
                                    {canPublish && (
                                        <PublishToggle published={chart.published} onClick={() => togglePublish(chart.id)} />
                                    )}
                                    <button onClick={() => downloadChartAsExcel(chart)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"><Download size={14} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* MODAL CONFIGURATOR (Hanya jika canEdit) */}
            <AnimatePresence>
                {canEdit && isAddOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col text-left">
                            <div className="flex justify-between items-center px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Visual Configurator</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Buat & preview grafik sebelum dipublikasi</p>
                                </div>
                                <button onClick={resetAdd} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>
                            <div className="grid lg:grid-cols-2 gap-0 overflow-hidden flex-1">
                                <div className="overflow-y-auto p-8 space-y-6 border-r border-slate-100">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Judul Grafik</label>
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" placeholder="Contoh: Rekap Status Pegawai" value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} />
                                    </div>
                                    <ExcelUploadZone onData={rows => setDraft(p => ({ ...p, data: rows }))} rowCount={draft.data.length} />
                                    <ChartTypePicker value={draft.type} onChange={v => setDraft(p => ({ ...p, type: v }))} />
                                    <PalettePicker value={draft.palette} onChange={v => setDraft(p => ({ ...p, palette: v }))} />
                                    <button onClick={submitAdd} className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:-translate-y-0.5 transition-all text-sm">Publish Ke Beranda</button>
                                </div>
                                <div className="bg-slate-50 p-8 flex flex-col justify-center items-center overflow-hidden">
                                    <div className="w-full bg-white p-6 rounded-3xl shadow-sm min-h-[350px] flex flex-col justify-center items-center">
                                        {draft.data.length > 0 ? (
                                            <>
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">{draft.title || 'Preview Grafik'}</p>
                                                <ChartRenderer chart={draft} height={260} />
                                            </>
                                        ) : (
                                            <div className="text-slate-300 text-center">
                                                <FileSpreadsheet className="mx-auto mb-3 opacity-30" size={48} />
                                                <p className="text-xs uppercase font-bold tracking-widest opacity-50 text-center">Import data untuk preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL EDIT (Lengkap dengan tabel baris) */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left">
                            <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b shrink-0">
                                <h3 className="text-xl font-black text-slate-900 italic uppercase">Edit Grafik & Data</h3>
                                <button onClick={() => setEditModal(null)} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-4 h-4 text-slate-500" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Judul</label>
                                        <input type="text" className="w-full bg-slate-50 border px-4 py-3 rounded-2xl font-bold" value={editModal.title} onChange={e => setEditModal(p => ({ ...p, title: e.target.value }))} />
                                    </div>
                                    <ChartTypePicker value={editModal.type} onChange={v => setEditModal(p => ({ ...p, type: v }))} />
                                    <PalettePicker value={editModal.palette} onChange={v => setEditModal(p => ({ ...p, palette: v }))} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block">Edit Baris Data</label>
                                    <div className="border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-50 font-bold uppercase text-slate-400 text-[9px] sticky top-0">
                                                <tr><th className="p-3">Label</th><th className="p-3">Nilai</th><th className="p-3" /></tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {editModal.data.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-2"><input className="w-full p-2 bg-slate-50 rounded-lg outline-none" value={row.name} onChange={e => { const d = [...editModal.data]; d[idx].name = e.target.value; setEditModal({ ...editModal, data: d }); }} /></td>
                                                        <td className="p-2"><input type="number" className="w-full p-2 bg-slate-50 rounded-lg outline-none font-black text-blue-600" value={row.value} onChange={e => { const d = [...editModal.data]; d[idx].value = parseFloat(e.target.value) || 0; setEditModal({ ...editModal, data: d }); }} /></td>
                                                        <td className="p-2"><button onClick={() => setEditModal({ ...editModal, data: editModal.data.filter((_, i) => i !== idx) })} className="text-red-400"><XCircle size={16} /></button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button onClick={() => setEditModal({ ...editModal, data: [...editModal.data, { name: 'Baru', value: 0 }] })} className="w-full py-2 border-2 border-dashed rounded-xl text-[10px] font-black text-slate-400 uppercase">+ Tambah Baris</button>
                                </div>
                            </div>
                            <div className="p-6 border-t flex gap-4">
                                <button onClick={() => setEditModal(null)} className="flex-1 py-3 font-bold text-slate-400">Batal</button>
                                <button onClick={submitEdit} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black">Simpan</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DELETE */}
            <AnimatePresence>
                {deleteTarget && (
                    <DeleteModal
                        chart={deleteTarget}
                        onCancel={() => setDeleteTarget(null)}
                        onConfirm={async () => {
                            const res = await fetch('/api/grafik/delete.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: deleteTarget.id }),
                            });
                            const result = await res.json();
                            if (result.status === 'success') {
                                setAllCharts(prev => prev.filter(c => c.id !== deleteTarget.id));
                            } else { alert('Gagal menghapus: ' + result.message); }
                            setDeleteTarget(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}