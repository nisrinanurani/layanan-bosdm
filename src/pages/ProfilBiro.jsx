import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    ChevronDown, Edit3, Save, X, Plus, ArrowLeft, Trash2,
    GripVertical, Camera, User, Image, MessageCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ===========================
// KONSTANTA & DEFAULT DATA
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
    kepalaFoto: null, // base64
    fungsiList: [
        {
            id: 1,
            title: 'Fungsi Mutasi dan Pengelolaan Jabatan Fungsional',
            deskripsi: 'Melaksanakan urusan mutasi, kenaikan pangkat, pengangkatan, dan pemberhentian jabatan fungsional.',
            tusi: [
                'Penyusunan rencana dan pelaksanaan mutasi pegawai',
                'Pengelolaan kenaikan pangkat dan jabatan fungsional',
                'Penyusunan SK pengangkatan dan pemberhentian'
            ],
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
};

// ===========================
// UTILITAS: localStorage
// ===========================
const loadData = () => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : { ...DEFAULT_DATA };
    } catch { return { ...DEFAULT_DATA }; }
};
const saveData = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

// ===========================
// KOMPONEN: InlineEdit
// ===========================
const InlineEdit = ({ value, onSave, canEdit, label, multiline = false, className = '' }) => {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);
    useEffect(() => setTemp(value), [value]);

    if (editing && canEdit) {
        return (
            <div className="relative">
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">{label}</div>
                {multiline ? (
                    <textarea
                        className="w-full p-3 rounded-xl border-2 border-blue-400 focus:border-blue-600 outline-none transition-all min-h-[120px] text-slate-700 leading-relaxed bg-blue-50/50"
                        value={temp} onChange={e => setTemp(e.target.value)} autoFocus
                    />
                ) : (
                    <input
                        type="text"
                        className="w-full p-3 rounded-xl border-2 border-blue-400 focus:border-blue-600 outline-none transition-all text-slate-700 font-bold bg-blue-50/50"
                        value={temp} onChange={e => setTemp(e.target.value)} autoFocus
                    />
                )}
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => { setEditing(false); setTemp(value); }} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
                    <button onClick={() => { onSave(temp); setEditing(false); }} className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Save className="w-3 h-3" /> Simpan</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`group relative ${className}`}>
            <div className="whitespace-pre-wrap">{value || <span className="text-slate-400 italic">Belum diisi</span>}</div>
            {canEdit && (
                <button
                    onClick={() => setEditing(true)}
                    className="absolute -right-2 -top-2 p-1.5 bg-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 hover:bg-blue-700 z-10"
                    title={`Edit ${label}`}
                >
                    <Edit3 className="w-3 h-3" />
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
        if (file.size > 2 * 1024 * 1024) { alert('Maksimal 2MB!'); return; }
        const reader = new FileReader();
        reader.onload = () => onUpload(reader.result);
        reader.readAsDataURL(file);
    };
    return (
        <div className="relative group cursor-pointer" onClick={() => ref.current.click()}>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {currentSrc ? (
                <img src={currentSrc} alt={label} className={`object-cover ${shape === 'circle' ? 'w-28 h-28 rounded-full' : 'w-full h-48 rounded-2xl'}`} />
            ) : (
                <div className={`bg-slate-200 flex items-center justify-center ${shape === 'circle' ? 'w-28 h-28 rounded-full' : 'w-full h-48 rounded-2xl'}`}>
                    {shape === 'circle' ? <User className="w-10 h-10 text-slate-400" /> : <Image className="w-10 h-10 text-slate-400" />}
                </div>
            )}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
                <Camera className="w-6 h-6 text-white" />
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

    const [data, setData] = useState(DEFAULT_DATA);

    // Simpan ke localStorage setiap kali data berubah
    useEffect(() => { saveData(data); }, [data]);

    // Helper update
    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const updateFungsiList = (newList) => setData(prev => ({ ...prev, fungsiList: newList }));

    // State UI
    const [openCards, setOpenCards] = useState({});
    const toggleCard = (id) => setOpenCards(prev => ({ ...prev, [id]: !prev[id] }));

    // ===========================
    // CRUD FUNGSI
    // ===========================
    const addFungsi = () => {
        const newFungsi = {
            id: Date.now(),
            title: 'Fungsi Baru',
            deskripsi: '',
            unitId: null,
            tusi: ['Tugas baru'],
        };
        updateFungsiList([...data.fungsiList, newFungsi]);
        setOpenCards(prev => ({ ...prev, [newFungsi.id]: true }));
    };

    const deleteFungsi = (id) => {
        if (!confirm('Yakin hapus fungsi ini?')) return;
        updateFungsiList(data.fungsiList.filter(f => f.id !== id));
    };

    const updateFungsiField = (id, field, value) => {
        updateFungsiList(data.fungsiList.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    // CRUD TUSI
    const addTusi = (fungsiId) => {
        updateFungsiList(data.fungsiList.map(f =>
            f.id === fungsiId ? { ...f, tusi: [...f.tusi, 'Tugas baru'] } : f
        ));
    };

    const updateTusi = (fungsiId, idx, value) => {
        updateFungsiList(data.fungsiList.map(f =>
            f.id === fungsiId ? { ...f, tusi: f.tusi.map((t, i) => i === idx ? value : t) } : f
        ));
    };

    const deleteTusi = (fungsiId, idx) => {
        updateFungsiList(data.fungsiList.map(f =>
            f.id === fungsiId ? { ...f, tusi: f.tusi.filter((_, i) => i !== idx) } : f
        ));
    };

    // REORDER
    const moveFungsi = (id, dir) => {
        const list = [...data.fungsiList];
        const idx = list.findIndex(f => f.id === id);
        if ((dir === -1 && idx === 0) || (dir === 1 && idx === list.length - 1)) return;
        [list[idx], list[idx + dir]] = [list[idx + dir], list[idx]];
        updateFungsiList(list);
    };

    // ===========================
    // RENDER
    // ===========================
    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* === NAVBAR === */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">B</div>
                        <span className="font-bold text-lg tracking-tight group-hover:text-blue-600 transition-colors">Portal BOSDM</span>
                    </div>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                </div>
            </nav>

            {/* === HERO SECTION === */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
                {data.heroBg && (
                    <div className="absolute inset-0">
                        <img src={data.heroBg} alt="bg" className="w-full h-full object-cover opacity-20" />
                    </div>
                )}
                <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
                    <InlineEdit
                        value={data.heroTitle}
                        onSave={(v) => update('heroTitle', v)}
                        canEdit={isSuperadmin}
                        label="Judul Hero"
                        className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4"
                    />
                    <InlineEdit
                        value={data.heroSubtitle}
                        onSave={(v) => update('heroSubtitle', v)}
                        canEdit={isSuperadmin}
                        label="Sub Judul Hero"
                        className="text-blue-200 text-lg max-w-2xl"
                    />
                    {isSuperadmin && (
                        <div className="mt-8">
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold cursor-pointer transition-colors border border-white/20">
                                <Image className="w-4 h-4" /> Ganti Background
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () => update('heroBg', reader.result);
                                    reader.readAsDataURL(file);
                                }} />
                            </label>
                        </div>
                    )}
                </div>
            </section>

            <main className="max-w-5xl mx-auto px-6 py-12">

                {/* === SECTION: DESKRIPSI === */}
                <section className="mb-16">
                    <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Tentang BOSDM</h2>
                    <InlineEdit
                        value={data.deskripsi}
                        onSave={(v) => update('deskripsi', v)}
                        canEdit={isSuperadmin}
                        label="Deskripsi BOSDM"
                        multiline
                        className="text-slate-700 text-lg leading-relaxed"
                    />
                </section>

                {/* === SECTION: VISI & MISI === */}
                <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Visi</h2>
                        <InlineEdit
                            value={data.visi}
                            onSave={(v) => update('visi', v)}
                            canEdit={isSuperadmin}
                            label="Visi"
                            multiline
                            className="text-slate-700 leading-relaxed"
                        />
                    </div>
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] mb-4">Misi</h2>
                        <InlineEdit
                            value={data.misi}
                            onSave={(v) => update('misi', v)}
                            canEdit={isSuperadmin}
                            label="Misi"
                            multiline
                            className="text-slate-700 leading-relaxed"
                        />
                    </div>
                </section>

                {/* === SECTION: KEPALA BIRO === */}
                <section className="mb-16">
                    <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-6">Kepala Biro</h2>
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            {isSuperadmin ? (
                                <ImageUploader
                                    currentSrc={data.kepalaFoto}
                                    onUpload={(src) => update('kepalaFoto', src)}
                                    label="Foto Kepala"
                                    shape="circle"
                                />
                            ) : (
                                data.kepalaFoto ? (
                                    <img src={data.kepalaFoto} alt="Kepala Biro" className="w-28 h-28 rounded-full object-cover" />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                                        <User className="w-10 h-10 text-slate-400" />
                                    </div>
                                )
                            )}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <InlineEdit
                                value={data.kepalaNama}
                                onSave={(v) => update('kepalaNama', v)}
                                canEdit={isSuperadmin}
                                label="Nama Kepala"
                                className="text-xl font-extrabold text-slate-900 mb-1"
                            />
                            <InlineEdit
                                value={data.kepalaJabatan}
                                onSave={(v) => update('kepalaJabatan', v)}
                                canEdit={isSuperadmin}
                                label="Jabatan"
                                className="text-slate-500 font-medium"
                            />
                        </div>
                    </div>
                </section>

                {/* === SECTION: FUNGSI-FUNGSI BIRO === */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Fungsi & Tugas</h2>
                        {isSuperadmin && (
                            <button onClick={addFungsi} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95">
                                <Plus className="w-4 h-4" /> Tambah Fungsi Baru
                            </button>
                        )}
                    </div>

                    {data.fungsiList.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p className="font-bold">Belum ada data fungsi.</p>
                            {isSuperadmin && <p className="text-sm mt-1">Klik "Tambah Fungsi Baru" untuk mulai.</p>}
                        </div>
                    )}

                    <Reorder.Group
                        axis="y"
                        values={data.fungsiList}
                        onReorder={(newOrder) => updateFungsiList(newOrder)}
                        className="space-y-4"
                    >
                        {data.fungsiList.map((fungsi, fIdx) => (
                            <Reorder.Item
                                key={fungsi.id}
                                value={fungsi}
                                dragListener={false}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* === HEADER KARTU === */}
                                <div className="px-6 py-5 flex items-center gap-3">

                                    {/* Grip Handle (Superadmin only) */}
                                    {isSuperadmin && (
                                        <div className="flex flex-col gap-0.5 mr-1">
                                            <button
                                                onClick={() => moveFungsi(fungsi.id, -1)}
                                                disabled={fIdx === 0}
                                                className="p-1 text-slate-300 hover:text-blue-600 disabled:opacity-20 transition-colors"
                                                title="Pindah ke atas"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => moveFungsi(fungsi.id, 1)}
                                                disabled={fIdx === data.fungsiList.length - 1}
                                                className="p-1 text-slate-300 hover:text-blue-600 disabled:opacity-20 transition-colors"
                                                title="Pindah ke bawah"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Judul */}
                                    <div className="flex-1 cursor-pointer" onClick={() => toggleCard(fungsi.id)}>
                                        <InlineEdit
                                            value={fungsi.title}
                                            onSave={(v) => updateFungsiField(fungsi.id, 'title', v)}
                                            canEdit={isSuperadmin}
                                            label="Judul Fungsi"
                                            className="font-extrabold text-slate-800 text-lg"
                                        />
                                        {fungsi.deskripsi && !openCards[fungsi.id] && (
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{fungsi.deskripsi}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        {isSuperadmin && (
                                            <button onClick={() => deleteFungsi(fungsi.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => toggleCard(fungsi.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <motion.div animate={{ rotate: openCards[fungsi.id] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown className="w-5 h-5" />
                                            </motion.div>
                                        </button>
                                    </div>
                                </div>

                                {/* === BODY KARTU (Expandable) === */}
                                <AnimatePresence>
                                    {openCards[fungsi.id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 py-6 border-t border-slate-100 space-y-6">

                                                {/* Deskripsi Fungsi */}
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi</h4>
                                                    <InlineEdit
                                                        value={fungsi.deskripsi}
                                                        onSave={(v) => updateFungsiField(fungsi.id, 'deskripsi', v)}
                                                        canEdit={isSuperadmin}
                                                        label="Deskripsi Fungsi"
                                                        multiline
                                                        className="text-slate-600 leading-relaxed"
                                                    />
                                                </div>

                                                {/* Tugas & Fungsi (Tusi) */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tugas & Fungsi (Tusi)</h4>
                                                        {isSuperadmin && (
                                                            <button onClick={() => addTusi(fungsi.id)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors">
                                                                <Plus className="w-3 h-3" /> Tambah
                                                            </button>
                                                        )}
                                                    </div>

                                                    {fungsi.tusi && fungsi.tusi.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {fungsi.tusi.map((item, idx) => (
                                                                <li key={idx} className="flex items-start gap-3 group/tusi">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        {isSuperadmin ? (
                                                                            <TusiItem
                                                                                value={item}
                                                                                onSave={(v) => updateTusi(fungsi.id, idx, v)}
                                                                                onDelete={() => deleteTusi(fungsi.id, idx)}
                                                                            />
                                                                        ) : (
                                                                            <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                                                                        )}
                                                                    </div>
                                                                    {/* Smart Link: Konsultasikan */}
                                                                    {fungsi.unitId && (
                                                                        <button
                                                                            onClick={() => navigate(`/tanya`)}
                                                                            className="opacity-0 group-hover/tusi:opacity-100 flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-all"
                                                                            title="Konsultasikan ke unit ini"
                                                                        >
                                                                            <MessageCircle className="w-3 h-3" /> Konsultasikan
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">Belum ada poin tusi.</p>
                                                    )}
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

            {/* FOOTER */}
            <footer className="bg-slate-950 text-slate-600 text-center py-6 text-sm border-t border-slate-900 mt-20">
                &copy; {new Date().getFullYear()} Biro Organisasi dan SDM - BRIN
            </footer>
        </div>
    );
}

// ===========================
// KOMPONEN: TusiItem (editable bullet point)
// ===========================
function TusiItem({ value, onSave, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);
    useEffect(() => setTemp(value), [value]);

    if (editing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                    className="flex-1 px-3 py-1.5 border-2 border-blue-400 rounded-lg text-sm outline-none focus:border-blue-600 bg-blue-50/50"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') { onSave(temp); setEditing(false); } if (e.key === 'Escape') { setEditing(false); setTemp(value); } }}
                />
                <button onClick={() => { onSave(temp); setEditing(false); }} className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Save className="w-3 h-3" /></button>
                <button onClick={() => { setEditing(false); setTemp(value); }} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group/edit">
            <span className="text-slate-700 text-sm leading-relaxed flex-1">{value}</span>
            <button onClick={() => setEditing(true)} className="opacity-0 group-hover/edit:opacity-100 p-1 text-slate-300 hover:text-blue-600 transition-all"><Edit3 className="w-3 h-3" /></button>
            <button onClick={onDelete} className="opacity-0 group-hover/edit:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
        </div>
    );
}
