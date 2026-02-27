import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Tema Quill
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [post, setPost] = useState({
        id: id ? parseInt(id) : Date.now(),
        judul: '',
        fungsi: 'UMUM',
        gambar: null, // Cover Utama
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

    // Konfigurasi Toolbar Quill (Sangat Lengkap)
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }], // Ini untuk Tab/Menjorok
            ['link', 'image'],
            ['clean'] // Tombol hapus format
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
        if (!post.judul || !post.konten || post.konten === '<p><br></p>') {
            return alert("Lengkapi Judul Dan Isi Berita!");
        }

        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const updated = id ? saved.map(b => b.id === parseInt(id) ? post : b) : [post, ...saved];

        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        alert("Berita Berhasil Disimpan!");
        navigate('/BeritaKami');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
            {/* NAVBAR */}
            <nav className="border-b bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
                <button onClick={() => navigate('/BeritaKami')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                    Publish Berita
                </button>
            </nav>

            {/* COVER UTAMA */}
            <div className="relative h-[40vh] bg-slate-900 overflow-hidden">
                {post.gambar ? (
                    <img src={post.gambar} className="w-full h-full object-cover opacity-60" alt="Cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-b-4 border-dashed border-slate-700 text-slate-600">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p className="font-bold uppercase text-[10px]">Pilih Foto Cover Utama</p>
                    </div>
                )}
                <div className="absolute bottom-8 right-8 text-center">
                    <input type="file" onChange={handleCoverFile} className="hidden" id="coverUpload" accept="image/*" />
                    <label htmlFor="coverUpload" className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl cursor-pointer hover:bg-slate-50 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Ganti Cover
                    </label>
                </div>
            </div>

            <main className="max-w-5xl mx-auto -mt-20 relative z-10 px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-14 border border-slate-100">
                    <input
                        type="text"
                        placeholder="KETIK JUDUL BERITA..."
                        className="w-full text-4xl font-black text-slate-900 outline-none mb-8 uppercase tracking-tighter"
                        value={post.judul}
                        onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })}
                    />

                    {/* QUILL EDITOR */}
                    <div className="editor-wrapper min-h-[500px]">
                        <ReactQuill
                            theme="snow"
                            modules={modules}
                            value={post.konten}
                            onChange={(content) => setPost({ ...post, konten: content })}
                            placeholder="Mulai tulis berita kamu di sini..."
                            className="h-full"
                        />
                    </div>
                </div>
            </main>

            {/* CSS CUSTOM UNTUK QUILL */}
            <style>{`
                .ql-editor {
                    min-height: 400px;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #475569;
                    font-family: 'Inter', sans-serif;
                }
                .ql-container.ql-snow {
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 0 0 1.5rem 1.5rem !important;
                }
                .ql-toolbar.ql-snow {
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 1.5rem 1.5rem 0 0 !important;
                    background: #f8fafc !important;
                    padding: 12px !important;
                }
                .ql-editor.ql-blank::before {
                    color: #cbd5e1 !important;
                    font-style: normal !important;
                }
                .ql-editor img {
                    border-radius: 1rem;
                    margin: 20px 0;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
            `}</style>
        </div>
    );
}