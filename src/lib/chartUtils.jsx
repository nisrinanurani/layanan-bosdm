/**
 * chartUtils.jsx
 * Shared utilities for GrafikData & PublicStats.
 * — PALETTES, TEMPLATE_HEADERS, downloadTemplate, CustomTooltip, ChartRenderer
 */
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

/* ── Template ──────────────────────────────────────────── */
export const TEMPLATE_HEADERS = ['Label', 'Nilai'];

export const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
        TEMPLATE_HEADERS,
        ['Contoh Kategori A', 100],
        ['Contoh Kategori B', 200],
        ['Contoh Kategori C', 150],
        ['Contoh Kategori D', 80],
    ]);
    ws['!cols'] = [{ wch: 32 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Grafik');
    XLSX.writeFile(wb, 'Template_GrafikData_BOSDM.xlsx');
};

/* ── Download chart data as Excel ──────────────────────── */
export const downloadChartAsExcel = (chart) => {
    const rows = [TEMPLATE_HEADERS, ...chart.data.map(d => [d.name, d.value])];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 32 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Grafik');
    XLSX.writeFile(wb, `${chart.title || 'Grafik'}_Data.xlsx`);
};

/* ── Multi-color Palettes ──────────────────────────────── */
export const PALETTES = {
    ocean:    ['#1e3a8a', '#3b82f6', '#60a5fa', '#0ea5e9', '#38bdf8', '#0284c7'],
    sunset:   ['#dc2626', '#ea580c', '#f97316', '#eab308', '#f59e0b', '#d97706'],
    forest:   ['#065f46', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    lavender: ['#7c3aed', '#a78bfa', '#6ee7b7', '#818cf8', '#f472b6', '#c4b5fd'],
    rose:     ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    slate:    ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
};

/* ── Custom Tooltip ────────────────────────────────────── */
export function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xl px-4 py-2.5 min-w-[130px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {label || payload[0]?.name}
            </p>
            <p className="text-xl font-black text-slate-900">
                {payload[0]?.value?.toLocaleString('id-ID')}
            </p>
        </div>
    );
}

/* ── ChartRenderer ─────────────────────────────────────── */
export function ChartRenderer({ chart, height = 240 }) {
    const colors = PALETTES[chart.palette] || PALETTES.ocean;
    const animProps = {
        isAnimationActive: true,
        animationDuration: 900,
        animationEasing: 'ease-out',
    };

    const chartType = (chart.type || 'bar').toLowerCase();

    return (
        <div className="w-full bg-white" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                    <PieChart>
                        <Pie
                            data={chart.data}
                            innerRadius={height * 0.17}
                            outerRadius={height * 0.33}
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={3}
                            {...animProps}
                            animationBegin={0}
                        >
                            {chart.data.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={colors[i % colors.length]}
                                    stroke="white"
                                    strokeWidth={2}
                                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                ) : chartType === 'line' ? (
                    <LineChart data={chart.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false} tickLine={false} width={38}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={colors[0]}
                            strokeWidth={3}
                            dot={{ r: 5, fill: colors[0], stroke: 'white', strokeWidth: 2 }}
                            activeDot={{ r: 8, fill: colors[1] ?? colors[0], stroke: 'white', strokeWidth: 2 }}
                            {...animProps}
                        />
                    </LineChart>
                ) : (
                    /* bar — default */
                    <BarChart data={chart.data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false} tickLine={false} width={38}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52} {...animProps}>
                            {chart.data.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={colors[i % colors.length]}
                                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
