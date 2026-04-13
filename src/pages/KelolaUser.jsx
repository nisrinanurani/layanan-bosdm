import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Shield, Save, X, ChevronRight, Search,
    CheckCircle2, AlertCircle, Lock, ArrowLeft, RefreshCw,
    Eye, Edit3, Trash2, Settings2, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoBrin from '../assets/logo-brin-decs.png';
import { MODULE_DEFINITIONS, DEFAULT_PERMISSIONS, FULL_PERMISSIONS } from '../lib/permissions';

// ── Komponen Checkbox tunggal ─────────────────────────────
function PermCheckbox({ checked, onChange, label, disabled }) {
    return (
        <label className={`flex items-center gap-2 cursor-pointer group select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <div
                onClick={() => !disabled && onChange(!checked)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0
                    ${checked
                        ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200'
                        : 'bg-white border-slate-300 group-hover:border-blue-400'
                    } ${disabled ? '' : 'cursor-pointer'}`}
            >
                {checked && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            {label && <span className={`text-xs font-bold ${checked ? 'text-blue-700' : 'text-slate-500'}`}>{label}</span>}
        </label>
    );
}

// ── Modal Permission Matrix ───────────────────────────────
function PermissionModal({ user, adminId, onClose, onSaved }) {
    const [perms, setPerms] = useState(() => {
        // Deep copy dari permissions user
        const copy = {};
        for (const mod in DEFAULT_PERMISSIONS) {
            copy[mod] = { ...DEFAULT_PERMISSIONS[mod], ...(user.permissions?.[mod] || {}) };
        }
        return copy;
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const toggle = (module, action) => {
        setPerms(prev => ({
            ...prev,
            [module]: { ...prev[module], [action]: !prev[module][action] }
        }));
    };

    // Set seluruh module ON/OFF
    const toggleModule = (moduleKey, value) => {
        const moduleActions = MODULE_DEFINITIONS.find(m => m.key === moduleKey)?.actions || [];
        const updates = {};
        moduleActions.forEach(a => { updates[a.key] = value; });
        setPerms(prev => ({ ...prev, [moduleKey]: { ...prev[moduleKey], ...updates } }));
    };

    // Cek apakah semua aksi satu modul aktif
    const isModuleFullOn = (moduleKey) => {
        const moduleActions = MODULE_DEFINITIONS.find(m => m.key === moduleKey)?.actions || [];
        return moduleActions.every(a => perms[moduleKey]?.[a.key]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/save_permissions.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: adminId, user_id: user.id, permissions: perms }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                setToast({ type: 'success', msg: 'Permission berhasil disimpan!' });
                setTimeout(() => { onSaved(user.id, perms); onClose(); }, 1200);
            } else {
                setToast({ type: 'error', msg: data.message || 'Gagal menyimpan' });
            }
        } catch {
            setToast({ type: 'error', msg: 'Koneksi ke server gagal' });
        } finally {
            setSaving(false);
        }
    };

    // Action icons
    const actionIcon = (key) => {
        if (key === 'view')   return <Eye className="w-3.5 h-3.5" />;
        if (key === 'edit')   return <Edit3 className="w-3.5 h-3.5" />;
        if (key === 'delete') return <Trash2 className="w-3.5 h-3.5" />;
        return <Settings2 className="w-3.5 h-3.5" />;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

            <motion.div initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-8 pt-7 pb-5 border-b border-slate-100 shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200 mb-1">Kelola Hak Akses</p>
                            <h2 className="text-xl font-black">
                                {user.nama_depan} {user.nama_belakang}
                            </h2>
                            <p className="text-sm text-blue-100 font-medium mt-0.5">NIP: {user.nip} · {user.biro}</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body: Permission Matrix */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-xs text-slate-400 font-medium">
                        Centang izin yang diinginkan per modul. Kolom <strong>Lihat</strong> sebaiknya diaktifkan agar user bisa mengakses halaman.
                    </p>

                    {MODULE_DEFINITIONS.map((mod) => {
                        const fullOn = isModuleFullOn(mod.key);
                        return (
                            <div key={mod.key} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                {/* Modul header */}
                                <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{mod.icon}</span>
                                        <span className="font-black text-sm text-slate-800">{mod.label}</span>
                                    </div>
                                    {/* Toggle semua aksi dalam modul */}
                                    <button
                                        onClick={() => toggleModule(mod.key, !fullOn)}
                                        className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all border ${
                                            fullOn
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'
                                        }`}
                                    >
                                        {fullOn ? 'Nonaktifkan Semua' : 'Aktifkan Semua'}
                                    </button>
                                </div>

                                {/* Checkbox grid */}
                                <div className="flex flex-wrap gap-4 p-4 pl-5">
                                    {mod.actions.map((action) => (
                                        <div key={action.key} className="flex items-center gap-2 min-w-[130px]">
                                            <div className={`p-1 rounded-lg ${
                                                action.key === 'view'   ? 'bg-sky-100 text-sky-600'   :
                                                action.key === 'edit'   ? 'bg-amber-100 text-amber-600' :
                                                action.key === 'delete' ? 'bg-red-100 text-red-500'    :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {actionIcon(action.key)}
                                            </div>
                                            <PermCheckbox
                                                checked={!!perms[mod.key]?.[action.key]}
                                                onChange={(val) => toggle(mod.key, action.key)}
                                                label={action.label}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`mx-6 mb-3 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${
                                toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                        >
                            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm">
                        Batal
                    </button>
                    <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        whileTap={{ scale: 0.97 }}
                        className="flex-[3] py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Menyimpan...' : 'Simpan Hak Akses'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Badge untuk status permission ─────────────────────────
function PermBadge({ permissions }) {
    const activeModules = MODULE_DEFINITIONS.filter(m =>
        Object.values(permissions?.[m.key] || {}).some(Boolean)
    );
    if (activeModules.length === 0) return (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 uppercase">Tanpa Akses</span>
    );
    const total = MODULE_DEFINITIONS.length;
    if (activeModules.length === total) return (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Akses Penuh</span>
    );
    return (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
            {activeModules.length}/{total} Modul
        </span>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function KelolaUser({ user: adminUser }) {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        if (!adminUser?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/get_all_users.php?admin_id=${adminUser.id}`);
            const data = await res.json();
            if (data.status === 'success') {
                setUsers(data.data);
            } else {
                setError(data.message || 'Gagal memuat data');
            }
        } catch {
            setError('Koneksi ke server gagal');
        } finally {
            setLoading(false);
        }
    }, [adminUser?.id]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSaved = (userId, newPerms) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPerms } : u));
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return (
            u.nama_depan?.toLowerCase().includes(q) ||
            u.nama_belakang?.toLowerCase().includes(q) ||
            u.nip?.includes(q) ||
            u.biro?.toLowerCase().includes(q)
        );
    });

    const nonSuperadmins = filtered.filter(u => !u.is_superadmin);
    const superadmins    = filtered.filter(u => u.is_superadmin);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* NAVBAR */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                        <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Kelola Pengguna & Hak Akses</h1>
                    </div>
                    <p className="text-slate-400 text-sm ml-[52px]">
                        Atur izin akses per modul untuk setiap pengguna. Superadmin selalu memiliki akses penuh.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama, NIP, biro..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700 text-sm font-bold">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-sm font-bold">Memuat data pengguna...</p>
                    </div>
                ) : (
                    <>
                        {/* Section: Superadmin */}
                        {superadmins.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Superadmin — Akses Penuh</span>
                                </div>
                                <div className="space-y-2">
                                    {superadmins.map(u => (
                                        <div key={u.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                    <Crown className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{u.nama_depan} {u.nama_belakang}</p>
                                                    <p className="text-xs text-slate-400 font-medium">NIP: {u.nip} · {u.biro}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-200 text-amber-800 uppercase">Master Admin</span>
                                                <Lock className="w-4 h-4 text-amber-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Pegawai */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Pegawai ({nonSuperadmins.length})
                                </span>
                            </div>

                            {nonSuperadmins.length === 0 ? (
                                <div className="text-center py-16 text-slate-300">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-bold">Tidak ada pegawai ditemukan.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                {['No', 'Nama', 'NIP', 'Biro / Unit', 'Status Akses', 'Modul Aktif', 'Aksi'].map(h => (
                                                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {nonSuperadmins.map((u, idx) => {
                                                const activeCount = MODULE_DEFINITIONS.filter(m =>
                                                    Object.values(u.permissions?.[m.key] || {}).some(Boolean)
                                                ).length;

                                                return (
                                                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        className="hover:bg-slate-50/80 transition-colors"
                                                    >
                                                        <td className="px-5 py-4 text-sm text-slate-300 font-bold">{idx + 1}</td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                                    <span className="text-xs font-black text-blue-500">
                                                                        {u.nama_depan?.[0]?.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{u.nama_depan} {u.nama_belakang}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">@{u.username}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-600 font-mono font-medium">{u.nip}</td>
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-bold text-slate-700">{u.biro}</p>
                                                            <p className="text-xs text-slate-400">{u.unit}</p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <PermBadge permissions={u.permissions} />
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {/* Mini module pills */}
                                                            <div className="flex flex-wrap gap-1">
                                                                {MODULE_DEFINITIONS.map(m => {
                                                                    const hasAny = Object.values(u.permissions?.[m.key] || {}).some(Boolean);
                                                                    return hasAny ? (
                                                                        <span key={m.key} title={m.label}
                                                                            className="text-sm" style={{ lineHeight: 1 }}>
                                                                            {m.icon}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                                {activeCount === 0 && <span className="text-[10px] text-slate-300 italic">—</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <button
                                                                onClick={() => setSelectedUser(u)}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                                                            >
                                                                <Shield className="w-3.5 h-3.5" />
                                                                Kelola
                                                                <ChevronRight className="w-3 h-3" />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-medium">{nonSuperadmins.length} pengguna terdaftar</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Permission Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <PermissionModal
                        user={selectedUser}
                        adminId={adminUser?.id}
                        onClose={() => setSelectedUser(null)}
                        onSaved={handleSaved}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
