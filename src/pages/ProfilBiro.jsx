import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    ChevronDown, Edit3, Save, X, Plus, ArrowLeft, Trash2,
    GripVertical, Camera, User, Image, MessageCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ===========================
// 1. KONSTANTA & DEFAULT DATA (DI LUAR)
// ===========================
const LS_KEY = 'profil_biro_cms';

const DEFAULT_DATA = {
    heroTitle: 'Profil Biro Organisasi dan Sumber Daya Manusia',
    heroSubtitle: 'Mengenal lebih dekat Visi, Misi, dan Fungsi Biro Organisasi dan Sumber Daya Manusia BRIN.',
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
            tusi: ['Penyusunan rencana dan pelaksanaan mutasi pegawai', 'Pengelolaan kenaikan pangkat dan jabatan fungsional', 'Penyusunan SK pengangkatan dan pemberhentian'],
        }
    ]
};

// ===========================
// 2. UTILITAS (DI LUAR)
// ===========================
const loadData = () => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : { ...DEFAULT_DATA };
    } catch { return { ...DEFAULT_DATA }; }
};
const saveData = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

// ===========================
// 3. KOMPONEN UTAMA
// ===========================
export default function ProfilBiro({ userRole }) {
    const navigate = useNavigate();
    const isSuperadmin = userRole === 'superadmin';
    const [data, setData] = useState(loadData);
    const [openCards, setOpenCards] = useState({});

    // --- BARIS PEMBERSIH (HANYA SEKALI PAKAI) ---
    useEffect(() => {
        localStorage.removeItem(LS_KEY);
    }, []);

    useEffect(() => { saveData(data); }, [data]);

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const updateFungsiList = (newList) => setData(prev => ({ ...prev, fungsiList: newList }));
    const toggleCard = (id) => setOpenCards(prev => ({ ...prev, [id]: !prev[id] }));

    const updateFungsiField = (id, field, value) => {
        updateFungsiList(data.fungsiList.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const addTusi = (fungsiId) => {
        updateFungsiList(data.fungsiList.map(f => f.id === fungsiId ? { ...f, tusi: [...f.tusi, 'Tugas baru'] } : f));
    };

    const updateTusi = (fungsiId, idx, value) => {
        updateFungsiList(data.fungsiList.map(f => f.id === fungsiId ? { ...f, tusi: f.tusi.map((t, i) => i === idx ? value : t) } : f));
    };

    const deleteTusi = (fungsiId, idx) => {
        updateFungsiList(data.fungsiList.map(f => f.id === fungsiId ? { ...f, tusi: f.tusi.filter((_, i) => i !== idx) } : f));
    };

    const moveFungsi = (id, dir) => {
        const list = [...data.fungsiList];
        const idx = list.findIndex(f => f.id === id);
        if ((dir === -1 && idx === 0) || (dir === 1 && idx === list.length - 1)) return;
        [list[idx], list[idx + dir]] = [list[idx + dir], list[idx]];
        updateFungsiList(list);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Nav, Hero, dan Section lainnya... */}
            <nav className="border-b border-slate-200 px-6 py-4 bg-white/95 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="font-bold text-lg cursor-pointer" onClick={() => navigate('/')}>Portal BOSDM</div>
                    <button onClick={() => navigate('/')} className="text-sm font-semibold flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Kembali</button>
                </div>
            </nav>

            <section className="bg-slate-900 text-white py-20 px-6 text-center">
                <InlineEdit value={data.heroTitle} onSave={(v) => update('heroTitle', v)} canEdit={isSuperadmin} label="Judul Hero" className="text-4xl font-black mb-4" />
                <InlineEdit value={data.heroSubtitle} onSave={(v) => update('heroSubtitle', v)} canEdit={isSuperadmin} label="Sub Judul" className="text-blue-200" />
            </section>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <section className="mb-16">
                    <h2 className="text-blue-600 font-bold mb-4 uppercase tracking-widest text-xs">Tentang BOSDM</h2>
                    <InlineEdit value={data.deskripsi} onSave={(v) => update('deskripsi', v)} canEdit={isSuperadmin} multiline className="text-lg text-slate-700 leading-relaxed" />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-emerald-600 font-bold mb-4 text-xs uppercase">Visi</h2>
                        <InlineEdit value={data.visi} onSave={(v) => update('visi', v)} canEdit={isSuperadmin} multiline className="text-slate-700" />
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-purple-600 font-bold mb-4 text-xs uppercase">Misi</h2>
                        <InlineEdit value={data.misi} onSave={(v) => update('misi', v)} canEdit={isSuperadmin} multiline className="text-slate-700" />
                    </div>
                </section>

                {/* Bagian Fungsi List */}
                <section>
                    <h2 className="text-red-600 font-bold mb-8 text-xs uppercase">Fungsi & Tugas</h2>
                    <div className="space-y-4">
                        {data.fungsiList.map((fungsi, fIdx) => (
                            <div key={fungsi.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <InlineEdit value={fungsi.title} onSave={(v) => updateFungsiField(fungsi.id, 'title', v)} canEdit={isSuperadmin} className="font-bold text-lg" />
                                    <div className="flex gap-2">
                                        {isSuperadmin && (
                                            <>
                                                <button onClick={() => moveFungsi(fungsi.id, -1)} disabled={fIdx === 0}><ArrowUp className="w-4 h-4 text-slate-400" /></button>
                                                <button onClick={() => moveFungsi(fungsi.id, 1)} disabled={fIdx === data.fungsiList.length - 1}><ArrowDown className="w-4 h-4 text-slate-400" /></button>
                                            </>
                                        )}
                                        <button onClick={() => toggleCard(fungsi.id)}><ChevronDown className={`w-5 h-5 transition-transform ${openCards[fungsi.id] ? 'rotate-180' : ''}`} /></button>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {openCards[fungsi.id] && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                            <p className="text-slate-500 text-sm mb-4">{fungsi.deskripsi}</p>
                                            <ul className="space-y-2">
                                                {fungsi.tusi.map((t, tIdx) => (
                                                    <li key={tIdx} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                                                        <TusiItem value={t} onSave={(v) => updateTusi(fungsi.id, tIdx, v)} onDelete={() => deleteTusi(fungsi.id, tIdx)} isSuperadmin={isSuperadmin} />
                                                    </li>
                                                ))}
                                            </ul>
                                            {isSuperadmin && <button onClick={() => addTusi(fungsi.id)} className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Tambah Poin</button>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

// ===========================
// 4. SUB-KOMPONEN (DI LUAR)
// ===========================
function InlineEdit({ value, onSave, canEdit, label, multiline = false, className = '' }) {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);
    useEffect(() => setTemp(value), [value]);

    if (editing && canEdit) {
        return (
            <div className="relative w-full">
                {multiline ? (
                    <textarea className="w-full p-2 border-2 border-blue-400 rounded-lg outline-none min-h-[100px]" value={temp} onChange={e => setTemp(e.target.value)} autoFocus />
                ) : (
                    <input className="w-full p-2 border-2 border-blue-400 rounded-lg outline-none" value={temp} onChange={e => setTemp(e.target.value)} autoFocus />
                )}
                <div className="flex gap-2 mt-2 justify-end">
                    <button onClick={() => setEditing(false)} className="text-xs text-slate-400">Batal</button>
                    <button onClick={() => { onSave(temp); setEditing(false); }} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">Simpan</button>
                </div>
            </div>
        );
    }
    return (
        <div className={`group relative ${className}`}>
            <div className="whitespace-pre-wrap">{value}</div>
            {canEdit && <button onClick={() => setEditing(true)} className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 p-1 bg-blue-600 text-white rounded-full transition-all"><Edit3 className="w-3 h-3" /></button>}
        </div>
    );
}

function TusiItem({ value, onSave, onDelete, isSuperadmin }) {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);
    if (editing && isSuperadmin) {
        return (
            <div className="flex items-center gap-2 flex-1">
                <input className="flex-1 border-b-2 border-blue-400 outline-none text-sm" value={temp} onChange={e => setTemp(e.target.value)} autoFocus />
                <button onClick={() => { onSave(temp); setEditing(false); }}><Save className="w-3 h-3 text-blue-600" /></button>
            </div>
        );
    }
    return (
        <div className="flex-1 flex justify-between items-center group/item">
            <span className="text-sm text-slate-700">{value}</span>
            {isSuperadmin && (
                <div className="opacity-0 group-hover/item:opacity-100 flex gap-2">
                    <button onClick={() => setEditing(true)}><Edit3 className="w-3 h-3 text-slate-400" /></button>
                    <button onClick={onDelete}><Trash2 className="w-3 h-3 text-red-400" /></button>
                </div>
            )}
        </div>
    );
}