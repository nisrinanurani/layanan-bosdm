import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Image as ImageIcon,
    Bold, Italic, Underline, List, Heading2, PlusSquare
} from 'lucide-react';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const coverInputRef = useRef(null); // Input untuk foto cover atas
    const inlineInputRef = useRef(null); // Input untuk foto di tengah teks
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [post, setPost] = useState({
        id: id ? parseInt(id) : Date.now(),
        judul: '',
        fungsi: 'UMUM',
        gambar: null, // Foto Cover Utama
        konten: '',
        waktu: new Date().toISOString().split('T')[0]
    });

    const [activeState, setActiveState] = useState({
        bold: false, italic: false, underline: false, heading: false, list: false
    });

    useEffect(() => {
        if (!isAdmin) navigate('/BeritaKami');
        if (id) {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            const found = saved.find(b => b.id === parseInt(id));
            if (found) {
                setPost(found);
                if (editorRef.current) editorRef.current.innerHTML = found.konten;
            }
        }
    }, [id, isAdmin, navigate]);

    const checkActiveState = () => {
        setActiveState({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            heading: document.queryCommandValue('formatBlock') === 'h2',
            list: document.queryCommandState('insertUnorderedList')
        });
    };

    const execCmd = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
        checkActiveState();
        editorRef.current.focus();
    };

    // === HANDLE FOTO COVER ATAS ===
    const handleCoverFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPost({ ...post, gambar: reader.result });
            reader.readAsDataURL(file);
        }
    };

    // === HANDLE SISIPKAN FOTO DI TENGAH TEKS (MULTIPLE) ===
    const handleInlineImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Sisipkan gambar tepat di posisi kursor (caret)
                const imgTag = `<img src="${reader.result}" class="w-full rounded-2xl my-6 shadow-md" alt="Berita Image" />`;
                document.execCommand('insertHTML', false, imgTag + '<br/>');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const html = editorRef.current.innerHTML;
        if (!post.judul || html === "" || html === "<br>") return alert("Lengkapi judul dan isi berita!");

        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const newPost = { ...post, konten: html };
        const updated = id ? saved.map(b => b.id === parseInt(id) ? newPost : b) : [newPost, ...saved];

        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        alert("BERITA BERHASIL DISIMPAN!");
        navigate('/BeritaKami');
    };

    const btnActiveStyle = "bg-blue-600 text-white shadow-inner scale-95";
    const btnInactiveStyle = "bg-white text-slate-500 hover:bg-slate-50 shadow-sm";

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
            {/* NAVBAR */}
            <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
                <button onClick={() => navigate('/BeritaKami')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tighter">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                    Publish Berita
                </button>
            </nav>

            {/* HEADER COVER */}
            <div className="relative h-[45vh] bg-slate-900 overflow-hidden">
                {post.gambar ? (
                    <img src={post.gambar} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-b-4 border-dashed border-slate-700 text-slate-600">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p className="font-bold uppercase text-[10px]">Pilih Foto Cover Utama</p>
                    </div>
                )}
                <div className="absolute bottom-8 right-8">
                    <input type="file" ref={coverInputRef} onChange={handleCoverFile} className="hidden" accept="image/*" />
                    <button onClick={() => coverInputRef.current.click()} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Ganti Cover
                    </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto -mt-24 relative z-10 px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-slate-100">
                    <input
                        type="text"
                        placeholder="KETIK JUDUL BERITA..."
                        className="w-full text-5xl font-black text-slate-900 outline-none mb-10 uppercase tracking-tighter placeholder:text-slate-100"
                        value={post.judul}
                        onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })}
                    />

                    {/* TOOLBAR PROFESIONAL */}
                    <div className="flex flex-wrap items-center gap-2 mb-6 p-2 bg-slate-100/50 rounded-2xl border border-slate-100 sticky top-24 z-20 backdrop-blur-md">
                        <button onClick={() => execCmd('formatBlock', activeState.heading ? 'p' : 'h2')} className={`p-3 rounded-xl transition-all ${activeState.heading ? btnActiveStyle : btnInactiveStyle}`}><Heading2 className="w-4 h-4" /></button>
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        <button onClick={() => execCmd('bold')} className={`p-3 rounded-xl transition-all ${activeState.bold ? btnActiveStyle : btnInactiveStyle}`}><Bold className="w-4 h-4" /></button>
                        <button onClick={() => execCmd('italic')} className={`p-3 rounded-xl transition-all ${activeState.italic ? btnActiveStyle : btnInactiveStyle}`}><Italic className="w-4 h-4" /></button>
                        <button onClick={() => execCmd('underline')} className={`p-3 rounded-xl transition-all ${activeState.underline ? btnActiveStyle : btnInactiveStyle}`}><Underline className="w-4 h-4" /></button>
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        <button onClick={() => execCmd('insertUnorderedList')} className={`p-3 rounded-xl transition-all ${activeState.list ? btnActiveStyle : btnInactiveStyle}`}><List className="w-4 h-4" /></button>

                        <div className="w-px h-5 bg-slate-200 mx-1"></div>

                        {/* TOMBOL SISIPKAN FOTO DALAM TEKS */}
                        <input type="file" ref={inlineInputRef} onChange={handleInlineImage} className="hidden" accept="image/*" />
                        <button
                            onClick={() => inlineInputRef.current.click()}
                            className="p-3 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                        >
                            <PlusSquare className="w-4 h-4" /> Sisipkan Foto
                        </button>
                    </div>

                    {/* AREA KETIK */}
                    <div
                        ref={editorRef}
                        contentEditable="true"
                        onKeyUp={checkActiveState}
                        onMouseUp={checkActiveState}
                        placeholder="Mulai tulis berita kamu di sini..."
                        className="w-full text-lg font-medium text-slate-600 min-h-[500px] outline-none leading-relaxed p-4 prose max-w-none"
                    ></div>
                </div>
            </main>
        </div>
    );
} 