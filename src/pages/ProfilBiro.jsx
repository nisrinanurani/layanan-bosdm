import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit3, Save, X, Plus, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// --- KOMPONEN BANTUAN 1: Editable Text Section ---
const EditableSection = ({ title, value, onSave, isSuperadmin, placeholder, isTextArea = true }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const [saving, setSaving] = useState(false);

    // Sync tempValue when value prop changes (after fetch)
    useEffect(() => { setTempValue(value); }, [value]);

    const handleSave = async () => {
        setSaving(true);
        await onSave(tempValue);
        setSaving(false);
        setIsEditing(false);
    };

    if (isEditing && isSuperadmin) {
        return (
            <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
                {isTextArea ? (
                    <textarea
                        className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[120px] text-slate-700 leading-relaxed font-sans"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder={placeholder}
                        autoFocus
                    />
                ) : (
                    <input
                        type="text"
                        className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-700 font-sans font-bold text-lg"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder={placeholder}
                        autoFocus
                    />
                )}
                <div className="flex justify-end gap-2 mt-4">
                    {value && (
                        <button onClick={() => { setIsEditing(false); setTempValue(value); }} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors">Batal</button>
                    )}
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors disabled:bg-slate-400">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 group relative">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
            <div className="prose prose-slate max-w-none">
                <p className="text-slate-800 text-lg leading-relaxed font-sans whitespace-pre-wrap">
                    {value || <span className="text-slate-400 italic">Belum ada data.</span>}
                </p>
            </div>
            {isSuperadmin && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Edit3 className="w-3.5 h-3.5" /> Edit {title}
                </button>
            )}
        </div>
    );
};

// --- KOMPONEN UTAMA HALAMAN ---
export default function ProfilBiro({ userRole }) {
    const navigate = useNavigate();
    const isSuperadmin = ['superadmin', 'admin'].includes(userRole);

    // STATE
    const [loading, setLoading] = useState(true);
    const [dataProfil, setDataProfil] = useState({
        deskripsi: "",
        visi: "",
        misi: "",
        ketua: ""
    });
    const [fungsiList, setFungsiList] = useState([]);

    // === FETCH DATA DARI SUPABASE ===
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch profil_biro (singleton row id=1)
                const { data: profil } = await supabase
                    .from('profil_biro')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (profil) {
                    setDataProfil({
                        deskripsi: profil.deskripsi || '',
                        visi: profil.visi || '',
                        misi: profil.misi || '',
                        ketua: profil.ketua || ''
                    });
                }

                // Fetch fungsi_biro
                const { data: fungsiData } = await supabase
                    .from('fungsi_biro')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (fungsiData) {
                    setFungsiList(fungsiData.map(f => ({
                        ...f,
                        isOpen: false,
                        isEditingTitle: false
                    })));
                }
            } catch (err) {
                console.error("Gagal memuat data profil:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // === HANDLER: Update field di profil_biro ===
    const updateField = async (field, value) => {
        setDataProfil(prev => ({ ...prev, [field]: value }));

        const { error } = await supabase
            .from('profil_biro')
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq('id', 1);

        if (error) {
            console.error(`Gagal simpan ${field}:`, error);
            alert(`Gagal menyimpan ${field}!`);
        }
    };

    // === HANDLER: Toggle accordion ===
    const toggleFungsi = (id) => {
        setFungsiList(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
    };

    // === HANDLER: Update fungsi field (title/content) ===
    const updateFungsi = async (id, field, value) => {
        // Update local state dulu
        setFungsiList(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));

        // Simpan ke Supabase hanya untuk field yang relevan
        if (['title', 'content'].includes(field)) {
            const { error } = await supabase
                .from('fungsi_biro')
                .update({ [field]: value })
                .eq('id', id);

            if (error) {
                console.error(`Gagal update fungsi:`, error);
                alert("Gagal menyimpan perubahan!");
            }
        }
    };

    // === HANDLER: Tambah fungsi baru ===
    const addFungsi = async () => {
        const maxOrder = fungsiList.length > 0
            ? Math.max(...fungsiList.map(f => f.sort_order || 0))
            : 0;

        const { data, error } = await supabase
            .from('fungsi_biro')
            .insert({ title: 'Fungsi Baru', content: '', sort_order: maxOrder + 1 })
            .select()
            .single();

        if (error) {
            console.error("Gagal tambah fungsi:", error);
            alert("Gagal menambah fungsi baru!");
            return;
        }

        setFungsiList(prev => [...prev, { ...data, isOpen: true, isEditingTitle: true }]);
    };

    // === HANDLER: Hapus fungsi ===
    const deleteFungsi = async (id) => {
        if (!confirm('Yakin ingin menghapus fungsi ini?')) return;

        const { error } = await supabase
            .from('fungsi_biro')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Gagal hapus fungsi:", error);
            alert("Gagal menghapus fungsi!");
            return;
        }

        setFungsiList(prev => prev.filter(f => f.id !== id));
    };

    // === LOADING STATE ===
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Memuat data profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* === NAVBAR === */}
            <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                        title="Kembali ke Beranda"
                    >
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">B</div>
                        <span className="font-bold text-lg tracking-tight group-hover:text-blue-600 transition-colors">Portal BOSDM</span>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
                    </button>
                </div>
            </nav>

            {/* === KONTEN UTAMA === */}
            <main className="max-w-3xl mx-auto px-6 py-12">

                <div className="mb-12 border-b border-slate-100 pb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Profil dan Mengenal Kami
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Mengenal lebih dekat Visi, Misi, dan Fungsi Biro Organisasi dan Sumber Daya Manusia.
                    </p>
                </div>

                <EditableSection
                    title="Biro Organisasi dan Sumber Daya Manusia"
                    value={dataProfil.deskripsi}
                    onSave={(val) => updateField('deskripsi', val)}
                    isSuperadmin={isSuperadmin}
                    placeholder="Masukkan deskripsi umum tentang Biro OSDM..."
                />

                <EditableSection
                    title="Visi"
                    value={dataProfil.visi}
                    onSave={(val) => updateField('visi', val)}
                    isSuperadmin={isSuperadmin}
                    placeholder="Masukkan Visi..."
                />

                <EditableSection
                    title="Misi"
                    value={dataProfil.misi}
                    onSave={(val) => updateField('misi', val)}
                    isSuperadmin={isSuperadmin}
                    placeholder="Masukkan Misi..."
                />

                <EditableSection
                    title="Ketua Biro"
                    value={dataProfil.ketua}
                    onSave={(val) => updateField('ketua', val)}
                    isSuperadmin={isSuperadmin}
                    placeholder="Nama Ketua Biro beserta Gelar..."
                    isTextArea={false}
                />

                {/* === SECTION DROPDOWN FUNGSI === */}
                <div className="mt-16 pt-10 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fungsi-Fungsi di Biro</h2>
                        {isSuperadmin && (
                            <button onClick={addFungsi} className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                                <Plus className="w-4 h-4" /> Tambah Fungsi
                            </button>
                        )}
                    </div>

                    {fungsiList.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <p className="font-medium">Belum ada data fungsi.</p>
                            {isSuperadmin && <p className="text-sm mt-1">Klik "Tambah Fungsi" untuk mulai.</p>}
                        </div>
                    )}

                    <div className="space-y-4">
                        {fungsiList.map((fungsi) => (
                            <div key={fungsi.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">

                                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => !fungsi.isEditingTitle && toggleFungsi(fungsi.id)}>

                                    <div className="flex-1">
                                        {fungsi.isEditingTitle && isSuperadmin ? (
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={fungsi.title}
                                                    onChange={(e) => setFungsiList(prev => prev.map(f => f.id === fungsi.id ? { ...f, title: e.target.value } : f))}
                                                    className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm font-bold w-1/2 focus:ring-2 focus:ring-blue-200 outline-none"
                                                    autoFocus
                                                />
                                                <button onClick={() => updateFungsi(fungsi.id, 'title', fungsi.title).then(() => updateFungsi(fungsi.id, 'isEditingTitle', false))} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Save className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-extrabold text-slate-800">{fungsi.title}</h4>
                                                {isSuperadmin && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setFungsiList(prev => prev.map(f => f.id === fungsi.id ? { ...f, isEditingTitle: true } : f)); }}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {isSuperadmin && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteFungsi(fungsi.id); }}
                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                title="Hapus fungsi"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div className="text-slate-400">
                                            {fungsi.isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {fungsi.isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 py-6 border-t border-slate-100"
                                        >
                                            <EditableSection
                                                title={`Penjelasan ${fungsi.title}`}
                                                value={fungsi.content}
                                                onSave={(val) => updateFungsi(fungsi.id, 'content', val)}
                                                isSuperadmin={isSuperadmin}
                                                placeholder={`Masukkan rincian tugas dan fungsi dari ${fungsi.title}...`}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
