import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Image as ImageIcon,
    Bold, Italic, List, Heading2, Type
} from 'lucide-react';

// --- IMPORT LOGO ---
import logoBrin from '../assets/logo-brin-decs.png';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const textAreaRef = useRef(null);
    const fileInputRef = useRef(null);
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [post, setPost] = useState({
        id: id ? parseInt(id) : Date.now(),
        judul: '',
        fungsi: 'UMUM',
        gambar: null, // Sekarang menyimpan data base64/file
        konten: '',
        waktu: new Date().toISOString().split('T')[0]
    });

    // === PROTEKSI & LOAD DATA ===
    useEffect(() => {
        if (!isAdmin) navigate('/berita-kami');
        if (id) {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            const found = saved.find(b => b.id === parseInt(id));
            if (found) setPost(found);
        }
    }, [id, isAdmin, navigate]);

    // === FUNGSI RICH TEXT (INSERT TAGS) ===
    const applyFormat = (type) => {
        const textarea = textAreaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = post.konten;
        const selectedText = text.substring(start, end);

        let formatted = "";
        switch (type) {
            case 'bold': formatted = `**${selectedText}**`; break;
            case 'italic': formatted = `*${selectedText}*`; break;
            case 'list': formatted = `\n- ${selectedText}`; break;
            case 'heading': formatted = `\n## ${selectedText}`; break;
            default: formatted = selectedText;
        }

        const newKonten = text.substring(0, start) + formatted + text.substring(end);
        setPost({ ...post, konten: newKonten });
        textarea.focus();
    };

    // === HANDLE PILIH FOTO DARI GALERI ===
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPost({ ...post, gambar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!post.judul || !post.konten) return alert("JUDUL DAN KONTEN WAJIB DIISI!");
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const updated = id ? saved.map(b => b.id === parseInt(id) ? post : b) : [post, ...saved];
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        alert("BERITA BERHASIL DIPUBLIKASI!");
        navigate('/berita-kami');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* NAVBAR (SAMA DENGAN PROFIL BIRO) */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/berita-kami')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Editor Berita</span>
                    </div>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                        Publish Berita
                    </button>
                </div>
            </nav>

            {/* HEADER COVER (GAYA PROFIL BIRO) */}
            <div className="relative h-[40vh] bg-slate-900 group">
                {post.gambar ? (
                    <img src={post.gambar} alt="Cover" className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-b-4 border-dashed border-slate-700">
                        <ImageIcon className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="font-bold text-slate-600 uppercase text-[10px]">Belum Ada Foto Background</p>
                    </div>
                )}

                {/* Tombol Pilih Foto Galeri */}
                <div className="absolute bottom-6 right-6">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/40 transition-all flex items-center gap-2"
                    >
                        <ImageIcon className="w-4 h-4" /> Pilih Foto Galeri
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-4xl mx-auto -mt-20 relative z-10 px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-slate-100">

                    {/* Meta Info */}
                    <div className="flex gap-4 mb-8">
                        <select
                            className="bg-blue-50 text-blue-600 font-bold text-[10px] uppercase px-4 py-2 rounded-xl border border-blue-100 outline-none"
                            value={post.fungsi}
                            onChange={(e) => setPost({ ...post, fungsi: e.target.value })}
                        >
                            <option value="UMUM">FUNGSI UMUM</option>
                            <option value="MUTASI">FUNGSI MUTASI</option>
                            <option value="PENILAIAN KOMPETENSI">PENILAIAN KOMPETENSI</option>
                        </select>
                        <input
                            type="date"
                            className="text-[10px] font-bold text-slate-400 outline-none"
                            value={post.waktu}
                            onChange={(e) => setPost({ ...post, waktu: e.target.value })}
                        />
                    </div>

                    {/* Judul Editor */}
                    <textarea
                        placeholder="KETIK JUDUL BERITA..."
                        className="w-full text-4xl font-black text-slate-900 placeholder:text-slate-100 outline-none resize-none mb-10 uppercase leading-tight tracking-tighter"
                        rows="2"
                        value={post.judul}
                        onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })}
                    />

                    {/* RICH TEXT TOOLBAR */}
                    <div className="flex items-center gap-1 mb-6 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                        <button onClick={() => applyFormat('heading')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all" title="Heading"><Heading2 className="w-4 h-4" /></button>
                        <button onClick={() => applyFormat('bold')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all" title="Bold"><Bold className="w-4 h-4" /></button>
                        <button onClick={() => applyFormat('italic')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all" title="Italic"><Italic className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <button onClick={() => applyFormat('list')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all" title="List"><List className="w-4 h-4" /></button>
                    </div>

                    <div className="h-px w-full bg-slate-100 mb-10"></div>

                    {/* Area Konten */}
                    <div className="flex items-start gap-4">
                        <textarea
                            ref={textAreaRef}
                            placeholder="Tuliskan isi berita di sini..."
                            className="w-full text-lg font-medium text-slate-600 placeholder:text-slate-200 outline-none min-h-[500px] resize-none leading-relaxed"
                            value={post.konten}
                            onChange={(e) => setPost({ ...post, konten: e.target.value })}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}