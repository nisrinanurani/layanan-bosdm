import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    ChevronDown, Edit3, Save, X, Plus, ArrowLeft, Trash2,
    Camera, User, Image, MessageCircle, ArrowUp, ArrowDown, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'profil_biro_cms';

// Data default dengan Visi & Misi terbaru sesuai instruksi Anda
const DEFAULT_DATA = {
    heroTitle: 'BOSDM BRIN',
    heroSubtitle: 'Mengenal lebih dekat Visi, Misi, dan Fungsi Biro Organisasi dan Sumber Daya Manusia BRIN',
    heroBg: null,
    deskripsi: 'Biro Organisasi dan Sumber Daya Manusia mempunyai tugas melaksanakan koordinasi penataan organisasi dan tata laksana, pelaksanaan reformasi birokrasi, dan pengelolaan sumber daya manusia di lingkungan BRIN.\n\nBiro Organisasi dan Sumber Daya Manusia mempunyai tugas melaksanakan koordinasi :\n1. penataan organisasi dan tata laksana\n2. pelaksanaan reformasi birokrasi\n3. pengelolaan sumber daya manusia di lingkungan BRIN.\n4. pengembangan karier dan mutasi;\n5. pelaksanaan penilaian kinerja; dan\n6. pelaksanaan fungsi lain yang diberikan oleh Sekretaris Utama.',
    visi: 'Terwujudnya Badan Riset dan Inovasi Nasional yang andal, profesional, inovatif, dan berintegritas dalam pelayanan kepada Presiden dan Wakil Presiden untuk mewujudkan visi dan misi Presiden dan Wakil Presiden: Indonesia Maju yang Berdaulat, Mandiri, dan Berkepribadian berlandaskan Gotong Royong.',
    misi: '1. Memberikan dukungan teknis dan administrasi serta analisis yang cepat, akurat, dan responsif, kepada Presiden dan Wakil Presiden dalam menyelenggarakan penelitian, pengembangan, pengkajian, dan penerapan serta invensi dan inovasi, penyelenggaraan ketenaganukliran, penyelenggaraan keantariksaan secara nasional yang terintegrasi serta melakukan monitoring pengendalian dan evaluasi terhadap pelaksanaan tugas dan fungsi Badan Riset dan Inovasi Daerah; dan\n2. Menyelenggarakan pelayanan yang efektif dan efisien di bidang pengawasan, administrasi umum, informasi, dan hubungan kelembagaan.',
    kepalaNama: 'Dr. Nama Kepala Biro, M.A.',
    kepalaJabatan: 'Kepala Biro Organisasi dan SDM',
    kepalaFoto: null,
    fungsiList: [
        {
            id: 1,
            title: 'Fungsi Mutasi dan Pengelolaan Jabatan Fungsional',
            deskripsi: 'Melaksanakan urusan mutasi, kenaikan pangkat, pengangkatan, dan pemberhentian jabatan fungsional.',
            tusi: ['Penyusunan rencana dan pelaksanaan mutasi pegawai', 'Pengelolaan kenaikan pangkat dan jabatan fungsional'],
            unitId: 'mutasi'
        },
        {
            id: 2,
            title: 'Fungsi Penilaian Kompetensi',
            deskripsi: 'Melaksanakan asesmen, ujian dinas, dan pemetaan kompetensi pegawai.',
            tusi: [
                'Pelaksanaan asesmen kompetensi pegawai',
                'Penyelenggaraan ujian dinas dan ujian penyesuaian',
                'Pemetaan kompetensi dan talent management'
            ],
        },
        {
            id: 3,
            title: 'Fungsi Pengelolaan Data dan Informasi SDM',
            deskripsi: 'Mengelola data pegawai, aplikasi internal, dan statistik kepegawaian.',
            tusi: [
                'Pengelolaan database dan informasi kepegawaian',
                'Pengembangan sistem informasi SDM',
                'Penyusunan laporan statistik kepegawaian'
            ],
        }
    ]
    ]
};

// Logika Load & Save Data
const loadData = () => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : { ...DEFAULT_DATA };
    } catch { return { ...DEFAULT_DATA }; }
};

export default function ProfilBiro({ userRole }) {
    const navigate = useNavigate();
    const isSuperadmin = userRole === 'superadmin';
    const [data, setData] = useState(loadData);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(data)); }, [data]);

    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const [openCards, setOpenCards] = useState({});

    return (
        <div className="min-h-screen bg-white font-sans text-[#0D47A1]" onMouseMove={handleMouseMove}>

            {/* 1. HERO SECTION WITH MOUSE TRACKING MESH */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-[#FFFFFF]">
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none transition-transform duration-300"
                    style={{
                        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, #E3F2FD 0%, transparent 50%)`
                    }}
                />
                <div className="relative z-10 text-center px-6">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-4 italic"
                    >
                        {data.heroTitle}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto"
                    >
                        {data.heroSubtitle}
                    </motion.p>
                </div>
            </section>

            {/* 2. ABOUT SECTION (FADE-IN & SCALE-UP) */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-2xl shadow-blue-100/50"
                >
                    <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6">Tentang BOSDM</h2>
                    <InlineEdit
                        value={data.deskripsi}
                        onSave={(v) => update('deskripsi', v)}
                        canEdit={isSuperadmin}
                        multiline
                        className="text-xl leading-relaxed text-slate-700"
                    />
                </motion.div>
            </section>

            {/* 3. VISI & MISI (SPLIT VIEW & STAGGERED) */}
            <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-[#0D47A1] text-white p-16 flex flex-col justify-center"
                >
                    <h2 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">Visi</h2>
                    <InlineEdit value={data.visi} onSave={(v) => update('visi', v)} canEdit={isSuperadmin} multiline className="text-2xl font-light leading-snug" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-[#E3F2FD] text-[#0D47A1] p-16 flex flex-col justify-center"
                >
                    <h2 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">Misi</h2>
                    <div className="space-y-4 text-lg">
                        {data.misi.split('\n').map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="border-b border-blue-200 pb-4 last:border-0"
                            >
                                <InlineEdit value={m} onSave={(v) => {
                                    const lines = data.misi.split('\n');
                                    lines[i] = v;
                                    update('misi', lines.join('\n'));
                                }} canEdit={isSuperadmin} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* 4. LEADERSHIP (FLOATING PHOTO) */}
            <section className="max-w-5xl mx-auto px-6 py-32 text-center">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-8 flex justify-center"
                >
                    <div className="w-40 h-40 rounded-full bg-slate-200 border-8 border-white shadow-xl overflow-hidden flex items-center justify-center">
                        {data.kepalaFoto ? <img src={data.kepalaFoto} className="w-full h-full object-cover" /> : <User size={60} className="text-slate-400" />}
                    </div>
                </motion.div>
                <InlineEdit value={data.kepalaNama} onSave={(v) => update('kepalaNama', v)} canEdit={isSuperadmin} className="text-3xl font-bold" />
                <InlineEdit value={data.kepalaJabatan} onSave={(v) => update('kepalaJabatan', v)} canEdit={isSuperadmin} className="text-slate-500 text-lg mt-2" />
            </section>

            {/* 5. FUNGSI UTAMA (GRID & HOVER) */}
            <section className="max-w-6xl mx-auto px-6 py-20 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.fungsiList.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10, backgroundColor: "#E3F2FD" }}
                            className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
                            onClick={() => setOpenCards(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
                        >
                            <h3 className="font-bold text-xl mb-4 text-[#0D47A1]">{f.title}</h3>
                            <AnimatePresence>
                                {openCards[f.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-slate-600 text-sm mb-4">{f.deskripsi}</p>
                                        <ul className="space-y-2">
                                            {f.tusi.map((t, idx) => (
                                                <li key={idx} className="text-xs flex items-center gap-2 group-hover:scale-105 transition-transform origin-left">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// Sub-komponen InlineEdit tetap sama logikanya namun dengan styling teks yang disesuaikan
function InlineEdit({ value, onSave, canEdit, multiline, className }) {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);
    if (editing && canEdit) {
        return (
            <div className="w-full">
                {multiline ? (
                    <textarea className="w-full bg-white/10 p-2 border border-blue-400 rounded focus:outline-none" value={temp} onChange={e => setTemp(e.target.value)} autoFocus />
                ) : (
                    <input className="w-full bg-white/10 p-2 border border-blue-400 rounded focus:outline-none" value={temp} onChange={e => setTemp(e.target.value)} autoFocus />
                )}
                <div className="flex gap-2 mt-2">
                    <button onClick={() => { onSave(temp); setEditing(false) }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Simpan</button>
                    <button onClick={() => setEditing(false)} className="text-xs opacity-50">Batal</button>
                </div>
            </div>
        );
    }
    return (
        <div className={`relative group ${className}`}>
            <div className="whitespace-pre-wrap">{value}</div>
            {canEdit && (
                <button onClick={() => setEditing(true)} className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 p-1 bg-blue-600 rounded-full text-white transition-opacity">
                    <Edit3 size={12} />
                </button>
            )}
        </div>
    );
}