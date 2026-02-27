import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
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
        if (!isAdmin) navigate('/BeritaKami');
        if (id) {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            const found = saved.find(b => b.id === parseInt(id));
            if (found) setPost(found);
        }
    }, [id, isAdmin, navigate]);

    // KONFIGURASI TOOLBAR LENGKAP (SESUAI CODE YANG KAMU TEMUKAN)
    const modules = {
        toolbar: [
            [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image', 'video', 'formula'],
            ['clean']
        ],
    };

    const handleCoverFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPost({ ...post, gambar: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!post.judul || !post.konten || post.konten === '<p><br></p>') return alert("Isi judul dan konten!");
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const updated = id ? saved.map(b => b.id === parseInt(id) ? post : b) : [post, ...saved];
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        navigate('/BeritaKami');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
                <button onClick={() => navigate('/BeritaKami')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                    Publish Berita
                </button>
            </nav>

            <div className="relative h-[35vh] bg-slate-900 overflow-hidden">
                {post.gambar && <img src={post.gambar} className="w-full h-full object-cover opacity-50" />}
                <div className="absolute inset-0 flex items-center justify-center">
                    <input type="file" onChange={handleCoverFile} className="hidden" id="cover" accept="image/*" />
                    <label htmlFor="cover" className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer border border-white/30">
                        {post.gambar ? 'Ganti Cover' : 'Pilih Cover Utama'}
                    </label>
                </div>
            </div>

            <main className="max-w-6xl mx-auto -mt-16 relative z-10 px-6">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
                    <input
                        type="text"
                        placeholder="JUDUL BERITA..."
                        className="w-full text-4xl font-black text-slate-900 outline-none mb-6 uppercase tracking-tighter"
                        value={post.judul}
                        onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })}
                    />

                    {/* RENDER REACT-QUILL DENGAN MODULES LENGKAP */}
                    <div className="editor-container">
                        <ReactQuill
                            theme="snow"
                            value={post.konten}
                            onChange={(val) => setPost({ ...post, konten: val })}
                            modules={modules}
                            placeholder="Tulis berita secara epik di sini..."
                        />
                    </div>
                </div>
            </main>

            <style>{`
                .editor-container .ql-editor { min-height: 500px; font-size: 1.1rem; color: #334155; }
                .editor-container .ql-toolbar.ql-snow { border-radius: 1rem 1rem 0 0; background: #f8fafc; border-color: #e2e8f0; }
                .editor-container .ql-container.ql-snow { border-radius: 0 0 1rem 1rem; border-color: #e2e8f0; }
            `}</style>
        </div>
    );
}