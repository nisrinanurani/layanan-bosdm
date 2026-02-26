import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Image as ImageIcon,
    Bold, Italic, Underline, List, Heading2, Type
} from 'lucide-react';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [post, setPost] = useState({
        id: id ? parseInt(id) : Date.now(),
        judul: '',
        fungsi: 'UMUM',
        gambar: null,
        konten: '',
        waktu: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!isAdmin) navigate('/berita-kami');
        if (id) {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            const found = saved.find(b => b.id === parseInt(id));
            if (found) {
                setPost(found);
                if (editorRef.current) editorRef.current.innerHTML = found.konten;
            }
        }
    }, [id, isAdmin, navigate]);

    // === MS WORD STYLE COMMANDS ===
    const execCmd = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPost({ ...post, gambar: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const html = editorRef.current.innerHTML;
        if (!post.judul || html === "") return alert("Lengkapi judul dan isi berita!");

        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const newPost = { ...post, konten: html };
        const updated = id ? saved.map(b => b.id === parseInt(id) ? newPost : b) : [newPost, ...saved];

        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        navigate('/berita-kami');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* NAVBAR */}
            <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
                <button onClick={() => navigate('/berita-kami')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg">
                    Publish Berita
                </button>
            </nav>

            {/* HEADER PHOTO (STYLE PROFIL BIRO) */}
            <div className="relative h-[45vh] bg-slate-900 group">
                {post.gambar ? (
                    <img src={post.gambar} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-b-4 border-dashed border-slate-700 text-slate-600">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p className="font-bold uppercase text-[10px]">Belum ada background</p>
                    </div>
                )}
                <div className="absolute bottom-8 right-8">
                    <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
                    <button onClick={() => fileInputRef.current.click()} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Pilih Dari Galeri
                    </button>
                </div>
            </div>

            {/* CONTENT EDITOR */}
            <main className="max-w-4xl mx-auto -mt-24 relative z-10 px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-slate-100">
                    <input
                        type="text"
                        placeholder="KETIK JUDUL BERITA..."
                        className="w-full text-5xl font-black text-slate-900 outline-none mb-10 uppercase tracking-tighter placeholder:text-slate-100"
                        value={post.judul}
                        onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })}
                    />

                    {/* TOOLBAR ALA MS WORD (CONTOH GAMBAR) */}
                    <div className="flex flex-wrap items-center gap-2 mb-6 p-2 bg-slate-50 rounded-2xl border border-slate-100 sticky top-24 z-20">
                        <button onClick={() => execCmd('formatBlock', 'h2')} className="p-3 hover:bg-white rounded-xl text-slate-500 shadow-sm transition-all" title="Heading"><Heading2 className="w-4 h-4" /></button>
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        <button onClick={() => execCmd('bold')} className="p-3 hover:bg-white rounded-xl text-slate-500 shadow-sm font-bold" title="Bold"><Bold className="w-4 h-4" /></button>
                        <button onClick={() => execCmd('italic')} className="p-3 hover:bg-white rounded-xl text-slate-500 shadow-sm" title="Italic"><Italic className="w-4 h-4" /></button>
                        <button onClick={() => execCmd('underline')} className="p-3 hover:bg-white rounded-xl text-slate-500 shadow-sm" title="Underline"><Underline className="w-4 h-4" /></button>
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        <button onClick={() => execCmd('insertUnorderedList')} className="p-3 hover:bg-white rounded-xl text-slate-500 shadow-sm" title="List"><List className="w-4 h-4" /></button>
                    </div>

                    {/* WRITING AREA */}
                    <div
                        ref={editorRef}
                        contentEditable="true"
                        className="w-full text-lg font-medium text-slate-600 min-h-[500px] outline-none leading-relaxed p-4"
                        placeholder="Tuliskan isi berita di sini..."
                    ></div>
                </div>
            </main>
        </div>
    );
}