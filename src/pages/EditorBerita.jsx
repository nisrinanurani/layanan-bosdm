import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [post, setPost] = useState({
        id: id ? parseInt(id) : Date.now(),
        tipe: 'BERITA',
        judul: '',
        fungsi: 'UMUM',
        gambar: null, // Untuk Cover Berita
        konten: '', // Untuk HTML Quill
        flyer: null, // Untuk file gambar Flyer
        isHero: false,
        waktu: new Date().toISOString()
    });

    useEffect(() => {
        if (!isAdmin) navigate('/BeritaKami');
        if (id) {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            const found = saved.find(b => b.id === parseInt(id));
            if (found) setPost(found);
        }
    }, [id, isAdmin, navigate]);

    // Konfigurasi Toolbar Lengkap (Copy-an dari yang kamu temukan)
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
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPost({ ...post, [field]: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!post.judul) return alert("Mohon isi judul konten!");
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const updated = id ? saved.map(b => b.id === parseInt(id) ? post : b) : [post, ...saved];
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        alert("Konten Berhasil Diunggah!");
        navigate('/BeritaKami');
    };

    return (
        <div className="min-h-screen bg-bosdm-sky pb-20">
            <nav className="border-b bg-bosdm-sky/90 backdrop-blur-md px-8 py-5 sticky top-0 z-50 flex justify-between items-center">
                <button onClick={() => navigate('/berita-kami')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                    <ArrowLeft className="w-4 h-4" /> Batal
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all">
                    Simpan & Publish
                </button>
            </nav>

            <main className="max-w-5xl mx-auto mt-10 px-6">
                {/* PILIHAN TIPE */}
                <div className="flex gap-4 mb-10 bg-bosdm-paper p-2 rounded-3xl w-fit shadow-sm border border-bosdm-navy/20">
                    <button onClick={() => setPost({ ...post, tipe: 'BERITA' })} className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-widest transition-all ${post.tipe === 'BERITA' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-bosdm-sky'}`}>
                        <FileText className="w-4 h-4" /> UNGGAH BERITA
                    </button>
                    <button onClick={() => setPost({ ...post, tipe: 'FLYER' })} className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-widest transition-all ${post.tipe === 'FLYER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-bosdm-sky'}`}>
                        <ImageIcon className="w-4 h-4" /> UNGGAH FLYER
                    </button>
                </div>

                <div className="bg-bosdm-paper rounded-[3.5rem] p-12 shadow-2xl border border-bosdm-sky/20">
                    <input type="text" placeholder="KETIK JUDUL DI SINI..." className="w-full text-5xl font-black mb-10 outline-none uppercase tracking-tighter text-slate-900 placeholder:text-slate-100" value={post.judul} onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })} />

                    {post.tipe === 'BERITA' ? (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Cover Utama Berita</label>
                                <div className="flex items-center gap-4">
                                    <input type="file" onChange={(e) => handleFileUpload(e, 'gambar')} accept="image/*" className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                    {post.gambar && <CheckCircle className="text-green-500 w-5 h-5" />}
                                </div>
                            </div>
                            <div className="editor-container h-[500px] mb-16">
                                <ReactQuill theme="snow" modules={modules} value={post.konten} onChange={(val) => setPost({ ...post, konten: val })} className="h-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 border-4 border-dashed border-bosdm-sky/40 rounded-[3rem] bg-bosdm-sky">
                            {post.flyer ? (
                                <div className="space-y-6">
                                    <img src={post.flyer} className="max-h-[500px] mx-auto rounded-3xl shadow-2xl border-8 border-white" alt="Preview" />
                                    <button onClick={() => setPost({ ...post, flyer: null })} className="text-red-500 font-black text-[10px] uppercase">Hapus & Ganti</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-8 bg-indigo-100 text-indigo-600 rounded-full shadow-inner"><ImageIcon className="w-12 h-12" /></div>
                                    <div>
                                        <input type="file" id="flyer-up" className="hidden" onChange={(e) => handleFileUpload(e, 'flyer')} accept="image/*" />
                                        <label htmlFor="flyer-up" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-indigo-700 transition-all">Pilih File Flyer</label>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Format: JPG, PNG, atau WEBP</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}