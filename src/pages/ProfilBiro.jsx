import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    ChevronDown, Edit3, Save, X, Plus, ArrowLeft, Trash2,
    Camera, User, Image, MessageCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoBrin from '../assets/logo-brin-decs.png';

// ===========================
// KONSTANTA & DEFAULT DATA
// ===========================
const LS_KEY = 'profil_biro_cms';

const DEFAULT_DATA = {
    heroTitle: 'Profil Biro Organisasi dan Sumber Daya Manusia',
    heroSubtitle: 'Mengenal lebih dekat Visi, Misi, dan Fungsi Biro Organisasi dan Sumber Daya Manusia BRIN.',
    heroBg: null,
    deskripsi: 'Biro Organisasi dan Sumber Daya Manusia mempunyai tugas melaksanakan koordinasi penataan organisasi dan tata laksana, pelaksanaan reformasi birokrasi, dan pengelolaan sumber daya manusia di lingkungan BRIN.',
    visi: 'Terwujudnya Badan Riset dan Inovasi Nasional yang andal, profesional, inovatif, dan berintegritas.',
    misi: '1. Memberikan dukungan teknis dan administrasi yang cepat, akurat, dan responsif.\n2. Menyelenggarakan pelayanan yang efektif dan efisien.',
    kepalaNama: 'Dr. Nama Kepala Biro, M.A.',
    kepalaJabatan: 'Kepala Biro Organisasi dan SDM',
    kepalaFoto: null,
    fungsiList: [
        { id: 1, title: 'Fungsi Mutasi', deskripsi: 'Urusan mutasi dan kenaikan pangkat.', tusi: ['Penyusunan rencana mutasi'] }
    ]
};

const loadData = () => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : { ...DEFAULT_DATA };
    } catch { return { ...DEFAULT_DATA }; }
};
const saveData = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

// ===========================
// KOMPONEN: InlineEdit (UI Updated)
// ===========================
const InlineEdit = ({ value, onSave, canEdit, label, multiline = false, className = '' }) => {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);
    useEffect(() => setTemp(value), [value]);

    if (editing && canEdit) {
        return (
            <div className="relative z-20">
                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">{label}</div>
                {multiline ? (
                    <textarea
                        className="w-full p-4 rounded-2xl border-2 border-brand-blue-200 focus:border-brand-primary outline-none transition-all min-h-[150px] text-brand-gray-600 leading-relaxed bg-brand-blue-50/30"
                        value={temp} onChange={e => setTemp(e.target.value)} autoFocus
                    />
                ) : (
                    <input
                        type="text"
                        className="w-full p-4 rounded-2xl border-2 border-brand-blue-200 focus:border-brand-primary outline-none transition-all text-brand-dark font-bold bg-brand-blue-50/30"
                        value={temp} onChange={e => setTemp(e.target.value)} autoFocus
                    />
                )}
                <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => { setEditing(false); setTemp(value); }} className="px-4 py-2 text-xs font-bold text-brand-gray-400 hover:bg-brand-gray-100 rounded-xl transition-all">Batal</button>
                    <button onClick={() => { onSave(temp); setEditing(false); }} className="px-5 py-2 text-xs font-black bg-brand-primary text-white rounded-xl hover:bg-brand-blue-800 flex items-center gap-2 shadow-lg shadow-brand-blue-100"><Save className="w-3.5 h-3.5" /> Simpan</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`group relative ${className}`}>
            <div className="whitespace-pre-wrap">{value || <span className="text-brand-gray-300 italic">Belum diisi</span>}</div>
            {canEdit && (
                <button
                    onClick={() => setEditing(true)}
                    className="absolute -right-4 -top-4 p-2 bg-brand-primary text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 hover:bg-brand-blue-800 z-10"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// ===========================
// KOMPONEN: ImageUploader
// ===========================
const ImageUploader = ({ currentSrc, onUpload, label, shape = 'rect' }) => {
    const ref = useRef();
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onUpload(reader.result);
        reader.readAsDataURL(file);
    };
    return (
        <div className="relative group cursor-pointer" onClick={() => ref.current.click()}>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {currentSrc ? (
                <img src={currentSrc} alt={label} className={`object-cover shadow-inner ${shape === 'circle' ? 'w-32 h-32 rounded-full border-4 border-white' : 'w-full h-48 rounded-3xl'}`} />
            ) : (
                <div className={`bg-brand-gray-100 flex items-center justify-center ${shape === 'circle' ? 'w-32 h-32 rounded-full' : 'w-full h-48 rounded-3xl'}`}>
                    <Camera className="w-8 h-8 text-brand-gray-300" />
                </div>
            )}
            <div className={`absolute inset-0 bg-brand-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${shape === 'circle' ? 'rounded-full' : 'rounded-3xl'}`}>
                <Edit3 className="w-6 h-6 text-white" />
            </div>
        </div>
    );
};

// ===========================
// KOMPONEN UTAMA
// ===========================
export default function ProfilBiro({ userRole }) {
    const navigate = useNavigate();
    const isSuperadmin = userRole === 'superadmin';
    const [data, setData] = useState(loadData());

    useEffect(() => { saveData(data); }, [data]);

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const [openCards, setOpenCards] = useState({});
    const toggleCard = (id) => setOpenCards(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="min-h-screen bg-brand-gray-50 font-sans text-brand-dark pb-20">
            {/* NAVBAR */}
            <nav className="border-b border-brand-gray-200 px-6 py-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/Dashboard')}>
                        <img src={logoBrin} alt="Logo BRIN" className="h-10 w-auto object-contain" />
                    </div>
                    <button onClick={() => navigate('/Dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gray-400 hover:text-brand-primary transition-all">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative bg-brand-dark text-white overflow-hidden shadow-2xl">
                {data.heroBg && <img src={data.heroBg} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="hero-bg" />}
                <div className="relative max-w-5xl mx-auto px-8 py-24 md:py-32">
                    <InlineEdit value={data.heroTitle} onSave={(v) => update('heroTitle', v)} canEdit={isSuperadmin} label="Judul" className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none" />
                    <InlineEdit value={data.heroSubtitle} onSave={(v) => update('heroSubtitle', v)} canEdit={isSuperadmin} label="Subtitle" className="text-brand-blue-100 text-lg max-w-2xl font-medium" />
                    {isSuperadmin && (
                        <div className="mt-10">
                            <label className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer border border-white/20 transition-all flex w-fit items-center gap-2">
                                <Image className="w-4 h-4" /> Ganti Cover Hero
                                <input type="file" className="hidden" onChange={(e) => {
                                    const reader = new FileReader();
                                    reader.onload = () => update('heroBg', reader.result);
                                    reader.readAsDataURL(e.target.files[0]);
                                }} />
                            </label>
                        </div>
                    )}
                </div>
            </section>

            <main className="max-w-5xl mx-auto px-6 -mt-12 relative z-10">
                {/* DESKRIPSI */}
                <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-brand-gray-100 mb-10">
                    <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-6">Mengenal BOSDM</h2>
                    <InlineEdit value={data.deskripsi} onSave={(v) => update('deskripsi', v)} canEdit={isSuperadmin} label="Deskripsi Utama" multiline className="text-brand-gray-600 text-xl leading-relaxed font-medium" />
                </div>

                {/* VISI MISI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-brand-blue-50 rounded-[2.5rem] p-10 border border-brand-blue-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Visi</h2>
                        <InlineEdit value={data.visi} onSave={(v) => update('visi', v)} canEdit={isSuperadmin} label="Visi" multiline className="text-brand-gray-600 font-bold leading-relaxed" />
                    </div>
                    <div className="bg-brand-gray-100 rounded-[2.5rem] p-10 border border-brand-gray-200 shadow-sm">
                        <h2 className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest mb-4">Misi</h2>
                        <InlineEdit value={data.misi} onSave={(v) => update('misi', v)} canEdit={isSuperadmin} label="Misi" multiline className="text-brand-gray-600 font-bold leading-relaxed" />
                    </div>
                </div>

                {/* KEPALA BIRO */}
                <div className="bg-brand-dark text-white rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 mb-16 shadow-2xl">
                    <div className="flex-shrink-0">
                        {isSuperadmin ? (
                            <ImageUploader currentSrc={data.kepalaFoto} onUpload={(src) => update('kepalaFoto', src)} label="Foto Kepala" shape="circle" />
                        ) : (
                            <img src={data.kepalaFoto || "https://via.placeholder.com/150"} className="w-32 h-32 rounded-full object-cover border-4 border-white/20" alt="Kepala Biro" />
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <InlineEdit value={data.kepalaNama} onSave={(v) => update('kepalaNama', v)} canEdit={isSuperadmin} label="Nama" className="text-2xl font-black uppercase tracking-tight mb-1" />
                        <InlineEdit value={data.kepalaJabatan} onSave={(v) => update('kepalaJabatan', v)} canEdit={isSuperadmin} label="Jabatan" className="text-brand-blue-200 font-bold text-sm uppercase tracking-widest" />
                    </div>
                </div>

                {/* Bagian Fungsi & Tugas tetap menggunakan Reorder Group dengan penyesuaian warna bosdm-card */}
                {/* === SECTION: FUNGSI-FUNGSI BIRO === */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Fungsi & Tugas</h2>
                            <div className="h-px w-20 bg-brand-blue-200"></div>
                        </div>
                        {isSuperadmin && (
                            <button
                                onClick={() => {
                                    const newFungsi = {
                                        id: Date.now(),
                                        title: 'FUNGSI BARU',
                                        deskripsi: '',
                                        tusi: ['Tugas baru'],
                                    };
                                    setData(prev => ({ ...prev, fungsiList: [...prev.fungsiList, newFungsi] }));
                                    setOpenCards(prev => ({ ...prev, [newFungsi.id]: true }));
                                }}
                                className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-blue-800 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-brand-blue-100"
                            >
                                <Plus className="w-4 h-4" /> Tambah Fungsi
                            </button>
                        )}
                    </div>

                    <Reorder.Group
                        axis="y"
                        values={data.fungsiList}
                        onReorder={(newOrder) => setData(prev => ({ ...prev, fungsiList: newOrder }))}
                        className="space-y-6"
                    >
                        {data.fungsiList.map((fungsi, fIdx) => (
                            <Reorder.Item
                                key={fungsi.id}
                                value={fungsi}
                                dragListener={false}
                                className="bg-white rounded-[2.5rem] border border-brand-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                            >
                                {/* HEADER KARTU */}
                                <div className="px-8 py-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        {isSuperadmin && (
                                            <div className="flex flex-col gap-1 text-brand-gray-200">
                                                <button onClick={() => {
                                                    const list = [...data.fungsiList];
                                                    if (fIdx > 0) {
                                                        [list[fIdx], list[fIdx - 1]] = [list[fIdx - 1], list[fIdx]];
                                                        setData(prev => ({ ...prev, fungsiList: list }));
                                                    }
                                                }} className="hover:text-brand-primary"><ArrowUp className="w-4 h-4" /></button>
                                                <button onClick={() => {
                                                    const list = [...data.fungsiList];
                                                    if (fIdx < list.length - 1) {
                                                        [list[fIdx], list[fIdx + 1]] = [list[fIdx + 1], list[fIdx]];
                                                        setData(prev => ({ ...prev, fungsiList: list }));
                                                    }
                                                }} className="hover:text-brand-primary"><ArrowDown className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                        <div className="cursor-pointer flex-1" onClick={() => toggleCard(fungsi.id)}>
                                            <InlineEdit
                                                value={fungsi.title}
                                                onSave={(v) => {
                                                    const newList = data.fungsiList.map(f => f.id === fungsi.id ? { ...f, title: v } : f);
                                                    setData(prev => ({ ...prev, fungsiList: newList }));
                                                }}
                                                canEdit={isSuperadmin}
                                                label="Nama Fungsi"
                                                className="font-black text-brand-dark text-lg uppercase tracking-tight"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isSuperadmin && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Hapus fungsi ini?')) {
                                                        setData(prev => ({ ...prev, fungsiList: prev.fungsiList.filter(f => f.id !== fungsi.id) }));
                                                    }
                                                }}
                                                className="p-2 text-brand-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button onClick={() => toggleCard(fungsi.id)} className="p-2 bg-brand-gray-50 text-brand-primary rounded-xl">
                                            <motion.div animate={{ rotate: openCards[fungsi.id] ? 180 : 0 }}>
                                                <ChevronDown className="w-5 h-5" />
                                            </motion.div>
                                        </button>
                                    </div>
                                </div>

                                {/* BODY KARTU */}
                                <AnimatePresence>
                                    {openCards[fungsi.id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-brand-gray-50"
                                        >
                                            <div className="p-8 space-y-8 bg-brand-gray-50/30">
                                                <div>
                                                    <h4 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">Deskripsi Fungsi</h4>
                                                    <InlineEdit
                                                        value={fungsi.deskripsi}
                                                        onSave={(v) => {
                                                            const newList = data.fungsiList.map(f => f.id === fungsi.id ? { ...f, deskripsi: v } : f);
                                                            setData(prev => ({ ...prev, fungsiList: newList }));
                                                        }}
                                                        canEdit={isSuperadmin}
                                                        label="Deskripsi"
                                                        multiline
                                                        className="text-brand-gray-600 font-medium leading-relaxed"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Tugas & Fungsi (Tusi)</h4>
                                                        {isSuperadmin && (
                                                            <button
                                                                onClick={() => {
                                                                    const newList = data.fungsiList.map(f => f.id === fungsi.id ? { ...f, tusi: [...f.tusi, 'Tugas baru'] } : f);
                                                                    setData(prev => ({ ...prev, fungsiList: newList }));
                                                                }}
                                                                className="text-[10px] font-black text-brand-primary bg-white px-3 py-1 rounded-lg border border-brand-blue-100 hover:bg-brand-primary hover:text-white transition-all"
                                                            >
                                                                + Tambah Poin
                                                            </button>
                                                        )}
                                                    </div>
                                                    <ul className="space-y-3">
                                                        {fungsi.tusi.map((t, tIdx) => (
                                                            <li key={tIdx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-brand-gray-100 group/tusi">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2" />
                                                                <div className="flex-1">
                                                                    {isSuperadmin ? (
                                                                        <TusiItem
                                                                            value={t}
                                                                            onSave={(v) => {
                                                                                const newList = data.fungsiList.map(f => {
                                                                                    if (f.id === fungsi.id) {
                                                                                        const newTusi = [...f.tusi];
                                                                                        newTusi[tIdx] = v;
                                                                                        return { ...f, tusi: newTusi };
                                                                                    }
                                                                                    return f;
                                                                                });
                                                                                setData(prev => ({ ...prev, fungsiList: newList }));
                                                                            }}
                                                                            onDelete={() => {
                                                                                const newList = data.fungsiList.map(f => {
                                                                                    if (f.id === fungsi.id) {
                                                                                        return { ...f, tusi: f.tusi.filter((_, i) => i !== tIdx) };
                                                                                    }
                                                                                    return f;
                                                                                });
                                                                                setData(prev => ({ ...prev, fungsiList: newList }));
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-sm font-bold text-brand-gray-600">{t}</span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </section>
            </main>
        </div>
    );
}