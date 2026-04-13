import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, X, User } from 'lucide-react';

export default function EditProfil({ user, onUpdate, onClose }) {
    // State form disesuaikan dengan data yang ada di user
    const [form, setForm] = useState({
        nama_depan: user?.nama_depan || '',
        nip: user?.nip || ''
    });

    // Preview foto profil
    const [preview, setPreview] = useState(user?.foto ? `/api/uploads/profil/${user.foto}` : null);
    const [file, setFile] = useState(null);
    const fileRef = useRef();

    const handlePhotoChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleSave = async () => {
        // Validasi sederhana
        if (!form.nama_depan.trim()) return alert("Nama tidak boleh kosong");

        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('nama_depan', form.nama_depan);
        formData.append('nip', form.nip);
        if (file) formData.append('foto', file);

        try {
            const res = await fetch('/api/update_profil.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (result.status === 'success') {
                // result.user harus berisi data user terbaru dari PHP
                onUpdate(result.user);
                alert("Profil berhasil diperbarui!");
                onClose();
            } else {
                alert("Gagal memperbarui profil: " + result.message);
            }
        } catch (error) {
            console.error("Error update profil:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        }
    };

    return (
        // Z-INDEX ditingkatkan ke 999 agar pasti muncul di depan Dashboard
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm text-left">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
                {/* Tombol Close */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
                >
                    <X />
                </button>

                <h2 className="text-xl font-black uppercase italic mb-8 tracking-tighter text-slate-900">
                    Pengaturan Profil
                </h2>

                {/* Bagian Foto Profil */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => fileRef.current.click()}
                    >
                        <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" alt="Profile Preview" />
                            ) : (
                                <User className="w-12 h-12 text-slate-300" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-blue-600/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <Camera className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileRef}
                        hidden
                        onChange={handlePhotoChange}
                        accept="image/*"
                    />
                    <p className="text-[10px] font-black text-blue-600 uppercase mt-3 tracking-widest">
                        Klik foto untuk ganti
                    </p>
                </div>

                {/* Input Fields */}
                <div className="space-y-4 mb-8">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">
                            Nama Depan
                        </label>
                        <input
                            className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                            value={form.nama_depan}
                            onChange={e => setForm({ ...form, nama_depan: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">
                            NIP Pegawai
                        </label>
                        <input
                            className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                            value={form.nip}
                            onChange={e => setForm({ ...form, nip: e.target.value })}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Save className="w-4 h-4" /> Simpan Perubahan
                </button>
            </motion.div>
        </div>
    );
}