import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    ArrowLeft, Plus, Trash2, X, FileSpreadsheet, BarChart2,
    LineChart as LineIcon, PieChart as PieIcon, Edit3, Save, Download, XCircle, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ── Configuration & Palettes ────────────────────────── */
const PALETTES = {
    ocean: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    sunset: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
    forest: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    lavender: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
};

export default function GrafikData({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = userRole === 'superadmin';

    // State Utama
    const [allCharts, setAllCharts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State Form
    const [newChart, setNewChart] = useState({ title: "", type: "bar", palette: "ocean", data: [] });
    const [editingChart, setEditingChart] = useState(null);

    // 1. Load Data
    useEffect(() => {
        if (!isAdmin) navigate('/'); // Proteksi rute
        const saved = localStorage.getItem('bosdm_dynamic_charts');
        if (saved) setAllCharts(JSON.parse(saved));
    }, [isAdmin, navigate]);

    // 2. Save Data
    const saveToStorage = (updated) => {
        setAllCharts(updated);
        localStorage.setItem('bosdm_dynamic_charts', JSON.stringify(updated));
    };

    // 3. Import Excel Logic
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Mapping otomatis untuk header "Status Pegawai" & "Total"
            const formatted = data.map(item => ({
                name: item["Status Pegawai"] || item["name"] || "Data",
                value: parseFloat(item["Total"]) || parseFloat(item["value"]) || 0
            })).filter(i => i.name !== undefined);

            setNewChart(prev => ({ ...prev, data: formatted }));
        };
        reader.readAsBinaryString(file);
    };

    // 4. Download PDF
    const downloadPDF = async (id, title) => {
        const element = document.getElementById(`preview-${id}`);
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.text(title, 10, 10);
        pdf.addImage(imgData, 'PNG', 10, 20, 190, 100);
        pdf.save(`${title}.pdf`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-sm mb-2 transition-all">
                            <ArrowLeft size={16} /> DASHBOARD
                        </button>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Pengelola Visualisasi</h1>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-wider text-xs"
                    >
                        <Plus size={18} /> Tambah Grafik Baru
                    </button>
                </div>

                {/* Grid Visualisasi */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allCharts.map((chart) => (
                        <div key={chart.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] truncate mr-4">{chart.title}</h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingChart({ ...chart }); setIsEditModalOpen(true); }} className="p-2 text-blue-500 hover:bg-white rounded-full"><Edit3 size={14} /></button>
                                    <button onClick={() => saveToStorage(allCharts.filter(c => c.id !== chart.id))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                            </div>

                            <div id={`preview-${chart.id}`} className="p-8 h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chart.type === 'pie' ? (
                                        <PieChart>
                                            <Pie data={chart.data} innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                                                {chart.data.map((_, i) => <Cell key={i} fill={PALETTES[chart.palette][i % 5]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    ) : (
                                        <BarChart data={chart.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" hide />
                                            <Tooltip />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                                                {chart.data.map((_, i) => <Cell key={i} fill={PALETTES[chart.palette][i % 5]} />)}
                                            </Bar>
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>

                            <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center mt-auto">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{chart.type} chart • {chart.data.length} items</span>
                                <button onClick={() => downloadPDF(chart.id, chart.title)} className="text-slate-400 hover:text-blue-600 transition-colors"><Download size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL TAMBAH WIZARD */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Visual Configurator</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10 overflow-y-auto pr-2">
                            {/* Left: Settings */}
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Judul Grafik</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Contoh: Rekap Status Pegawai"
                                        value={newChart.title}
                                        onChange={e => setNewChart({ ...newChart, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <label className="col-span-2 text-[10px] font-black uppercase text-slate-400 ml-2 block">Impor Data</label>
                                    <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                                        <FileSpreadsheet className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-blue-600">Pilih File Excel</span>
                                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                                    </label>
                                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Data Terdeteksi</span>
                                        <span className="text-lg font-black text-slate-700">{newChart.data.length} <span className="text-xs font-normal text-slate-400">Baris</span></span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-3 block">Tipe Visual & Palet</label>
                                    <div className="flex gap-2 mb-4">
                                        {['bar', 'pie', 'line'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setNewChart({ ...newChart, type: t })}
                                                className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${newChart.type === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                                            >
                                                {t === 'bar' ? <BarChart2 size={16} /> : t === 'pie' ? <PieIcon size={16} /> : <LineIcon size={16} />}
                                                <span className="text-[9px] font-black uppercase">{t}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(PALETTES).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setNewChart({ ...newChart, palette: p })}
                                                className={`px-4 py-2 rounded-full border-2 text-[10px] font-bold capitalize transition-all ${newChart.palette === p ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!newChart.title || newChart.data.length === 0) return alert("Lengkapi judul dan data!");
                                        saveToStorage([...allCharts, { ...newChart, id: Date.now() }]);
                                        setIsAddModalOpen(false);
                                        setNewChart({ title: "", type: "bar", palette: "ocean", data: [] });
                                    }}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:translate-y-[-2px] transition-all"
                                >
                                    Publish Ke Beranda
                                </button>
                            </div>

                            {/* Right: Preview */}
                            <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 tracking-[0.3em] mb-6 uppercase">Live Preview</span>
                                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                                    {newChart.data.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            {newChart.type === 'pie' ? (
                                                <PieChart>
                                                    <Pie data={newChart.data} innerRadius={60} outerRadius={90} dataKey="value">
                                                        {newChart.data.map((_, i) => <Cell key={i} fill={PALETTES[newChart.palette][i % 5]} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            ) : (
                                                <BarChart data={newChart.data}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#64748b' }} />
                                                    <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                        {newChart.data.map((_, i) => <Cell key={i} fill={PALETTES[newChart.palette][i % 5]} />)}
                                                    </Bar>
                                                </BarChart>
                                            )}
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-slate-600 text-center">
                                            <FileSpreadsheet className="mx-auto mb-3 opacity-20" size={48} />
                                            <p className="text-xs uppercase font-bold tracking-widest opacity-40">Menunggu Import Data...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDIT DATA MANUAL */}
            {isEditModalOpen && editingChart && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h3 className="text-xl font-black uppercase italic">Koreksi Data Manual</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><X /></button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto mb-8 pr-2">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 font-bold text-slate-400 text-[10px] uppercase tracking-widest sticky top-0">
                                    <tr><th className="p-4">Kategori</th><th className="p-4">Angka</th><th className="p-4 w-10"></th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {editingChart.data.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="p-2"><input className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={row.name} onChange={e => { const d = [...editingChart.data]; d[idx].name = e.target.value; setEditingChart({ ...editingChart, data: d }); }} /></td>
                                            <td className="p-2"><input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-black text-blue-600" value={row.value} onChange={e => { const d = [...editingChart.data]; d[idx].value = parseFloat(e.target.value) || 0; setEditingChart({ ...editingChart, data: d }); }} /></td>
                                            <td className="p-2 text-center"><button onClick={() => { const d = editingChart.data.filter((_, i) => i !== idx); setEditingChart({ ...editingChart, data: d }); }} className="text-slate-300 hover:text-red-500"><XCircle size={18} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setEditingChart({ ...editingChart, data: [...editingChart.data, { name: "Data Baru", value: 0 }] })} className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 hover:border-blue-600 transition-all">+ Baris Baru</button>
                            <button onClick={() => { saveToStorage(allCharts.map(c => c.id === editingChart.id ? editingChart : c)); setIsEditModalOpen(false); }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Save size={14} /> Simpan Perubahan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}