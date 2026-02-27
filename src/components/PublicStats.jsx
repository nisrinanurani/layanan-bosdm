import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Users, TrendingUp, GraduationCap } from 'lucide-react';

// Background Image
import gedungBrin from '../assets/gedung-brin-thamrin.png';

/* ══════════════════════════════════════════════════════
   PROFESSIONAL DASHBOARD — PublicStats
   Clean · Data-Driven · High Readability
   ══════════════════════════════════════════════════════ */

/* ── Colors ─────────────────────────────────────────── */
const COLORS = {
    primary: '#1e3a8a',       // Biru Resmi
    accent: '#3b82f6',        // Biru Aksen
    text: '#0f172a',          // slate-900
    textMuted: '#64748b',     // slate-500
    border: '#e2e8f0',        // slate-200
    cardBg: '#EEF5FF',
    trackBg: '#f1f5f9',       // slate-100 — bar track
};

/* ── Base Data ──────────────────────────────────────── */
const BASE_STATUS = [
    { name: 'PNS', value: 820, color: COLORS.primary },
    { name: 'PPNPN', value: 430, color: COLORS.accent },
];

const BASE_EDUCATION = [
    { level: 'S3', jumlah: 95 },
    { level: 'S2', jumlah: 310 },
    { level: 'S1', jumlah: 480 },
    { level: 'D3/D4', jumlah: 185 },
    { level: 'SMA', jumlah: 180 },
];

const TOTAL = BASE_STATUS.reduce((s, d) => s + d.value, 0);
const MAX_EDUCATION = Math.max(...BASE_EDUCATION.map((d) => d.jumlah));

/* ── FairyDust Particle System (Canvas) ─────────────── */
function FairyDust({ inView }) {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animFrameRef = useRef(null);

    useEffect(() => {
        if (!inView) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        const count = 35;
        particlesRef.current = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            size: Math.random() * 5 + 2,
            speedY: -(Math.random() * 0.4 + 0.15),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.008,
            twinklePhase: Math.random() * Math.PI * 2,
            hue: Math.random() > 0.5 ? 210 : 230,
        }));

        const animate = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;

            particlesRef.current.forEach((p) => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.twinklePhase += p.twinkleSpeed;
                const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;
                const alpha = p.opacity * (0.3 + twinkle * 0.7);

                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
                gradient.addColorStop(0, `hsla(${p.hue}, 80%, 85%, ${alpha})`);
                gradient.addColorStop(0.3, `hsla(${p.hue}, 70%, 75%, ${alpha * 0.5})`);
                gradient.addColorStop(1, `hsla(${p.hue}, 60%, 60%, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `hsla(${p.hue}, 90%, 95%, ${alpha * 0.9})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
            });

            animFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [inView]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        />
    );
}

/* ── Animated Counter ───────────────────────────────── */
function AnimatedCounter({ target, duration = 2000, inView }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return <span>{count.toLocaleString('id-ID')}</span>;
}

/* ── Donut Center Label (renders inside SVG) ────────── */
const DonutCenterLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: '28px', fontWeight: 800, fill: COLORS.text, letterSpacing: '-0.02em' }}>
                {TOTAL.toLocaleString('id-ID')}
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: '13px', fontWeight: 600, fill: COLORS.textMuted }}>
                Total Pegawai
            </text>
        </g>
    );
};

/* ── Custom Pie Label (Percentage on slices) ────────── */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            fontSize={14} fontWeight="700">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/* ── Tooltip (Clean Professional) ───────────────────── */
const tooltipStyle = {
    borderRadius: '10px',
    border: `1px solid ${COLORS.border}`,
    background: COLORS.cardBg,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '10px 16px',
    color: COLORS.text,
};

/* ── Framer Motion Variants ─────────────────────────── */
const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 80, damping: 16 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 60, damping: 18, mass: 0.9, delay: 0.2 },
    },
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function PublicStats() {
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, margin: '-80px' });
    const [activeIndex, setActiveIndex] = useState(-1);
    const [hoveredBarIndex, setHoveredBarIndex] = useState(-1);

    const onPieEnter = useCallback((_, index) => setActiveIndex(index), []);
    const onPieLeave = useCallback(() => setActiveIndex(-1), []);

    return (
        <section
            id="public-stats"
            ref={sectionRef}
            className="relative py-28 md:py-40 overflow-hidden"
        >
            {/* ===== Transition Gradient dari HeroSection ===== */}
            <div className="absolute top-0 left-0 right-0 h-32 z-[3] bg-gradient-to-b from-[#E0F2FE] to-transparent pointer-events-none" />

            {/* ===== Background: Foto Gedung BRIN ===== */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${gedungBrin})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* ===== Overlay ===== */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/60" />

            {/* ===== FairyDust Particles ===== */}
            <FairyDust inView={inView} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ===== Section Header ===== */}
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="text-center mb-12"
                >
                    <motion.span
                        variants={itemVariants}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white/80 bg-white/10 rounded-full border border-white/15 uppercase tracking-widest mb-4 backdrop-blur-sm"
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Data Publik
                    </motion.span>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight"
                    >
                        Statistik{' '}
                        <span className="bg-gradient-to-r from-blue-300 to-sky-200 bg-clip-text text-transparent">
                            Kepegawaian
                        </span>
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        className="mt-3 text-2xl text-white/70 font-medium max-w-xl mx-auto"
                    >
                        Informasi terkini mengenai sumber daya manusia di lingkungan Badan Riset dan Informasi Nasional.
                    </motion.p>
                </motion.div>

                {/* ===== Professional White Card ===== */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="rounded-2xl bg-bosdm-paper border border-bosdm-sky/40"
                    style={{
                        boxShadow: '0 4px 20px rgba(151, 210, 227, 0.39), 0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                        {/* ─── Kolom 1: Total Pegawai ─── */}
                        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-base font-semibold text-slate-500 tracking-tight">Total Pegawai</p>
                            </div>

                            <p className="text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                                <AnimatedCounter target={TOTAL} inView={inView} />
                            </p>

                            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full w-fit mb-6 border border-emerald-100">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +3.2% dari tahun lalu
                            </div>

                            {/* Mini breakdown */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                {BASE_STATUS.map((d) => (
                                    <div
                                        key={d.name}
                                        className="text-center p-3 rounded-xl bg-bosdm-sky border border-bosdm-navy/20"
                                    >
                                        <p className="text-2xl font-bold tracking-tight" style={{ color: d.color }}>
                                            {d.value.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs font-medium text-slate-400 mt-0.5">{d.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── Kolom 2: Donut Chart ─── */}
                        <div className="md:col-span-4 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-base font-bold text-slate-900 tracking-tight">Status Kepegawaian</p>
                            </div>

                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={BASE_STATUS}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={3}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        animationBegin={0}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                        isAnimationActive={true}
                                        onMouseEnter={onPieEnter}
                                        onMouseLeave={onPieLeave}
                                        stroke="none"
                                    >
                                        {BASE_STATUS.map((entry, i) => (
                                            <Cell
                                                key={`pie-${i}`}
                                                fill={entry.color}
                                                style={{
                                                    transform: activeIndex === i ? 'scale(1.06)' : 'scale(1)',
                                                    transformOrigin: 'center',
                                                    transition: 'all 0.3s ease',
                                                    opacity: activeIndex === -1 ? 1 : activeIndex === i ? 1 : 0.35,
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                    {/* Center Label */}
                                    <Pie
                                        data={[{ value: 1 }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={0}
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        <Cell fill="transparent" />
                                    </Pie>
                                    <text
                                        x="50%" y="46%" textAnchor="middle" dominantBaseline="central"
                                        style={{ fontSize: '28px', fontWeight: 800, fill: COLORS.text, letterSpacing: '-0.02em' }}
                                    >
                                        {TOTAL.toLocaleString('id-ID')}
                                    </text>
                                    <text
                                        x="50%" y="55%" textAnchor="middle" dominantBaseline="central"
                                        style={{ fontSize: '12px', fontWeight: 600, fill: COLORS.textMuted }}
                                    >
                                        Total Pegawai
                                    </text>
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        formatter={(value, name) => [`${value.toLocaleString('id-ID')} orang`, name]}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                                        iconType="circle"
                                        formatter={(value) => (
                                            <span style={{ color: COLORS.textMuted }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ─── Kolom 3: Bar Chart with Track ─── */}
                        <div className="md:col-span-5 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-base font-bold text-slate-900 tracking-tight">Sebaran Pendidikan</p>
                            </div>

                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={BASE_EDUCATION}
                                    barSize={36}
                                    barGap={0}
                                    onMouseLeave={() => setHoveredBarIndex(-1)}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                                    <XAxis
                                        dataKey="level"
                                        tick={{ fontSize: 12, fill: COLORS.textMuted, fontWeight: 600 }}
                                        axisLine={{ stroke: COLORS.border }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: COLORS.textMuted, opacity: 0.7 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={35}
                                    />
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        formatter={(value) => [`${value} orang`, 'Jumlah']}
                                        cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                                    />
                                    {/* Actual Data Bar */}
                                    <Bar
                                        dataKey="jumlah"
                                        radius={[6, 6, 0, 0]}
                                        animationBegin={0}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                        isAnimationActive={true}
                                        onMouseEnter={(_, index) => setHoveredBarIndex(index)}
                                        onMouseLeave={() => setHoveredBarIndex(-1)}
                                    >
                                        {BASE_EDUCATION.map((_, i) => (
                                            <Cell
                                                key={`bar-${i}`}
                                                fill={hoveredBarIndex === i ? COLORS.accent : COLORS.primary}
                                                style={{
                                                    opacity: hoveredBarIndex === -1 ? 1 : hoveredBarIndex === i ? 1 : 0.35,
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}
