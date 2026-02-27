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
        tipe: 'BERITA', judul: '', fungsi: 'UMUM',
        gambar: null, konten: '', flyer: null,
        isHero: false, waktu: new Date().toISOString()
    });

    useEffect(() => {
        if (!isAdmin) navigate('/BeritaKami');
        if (id) {
            const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
            const found = saved.find(b => b.id === parseInt(id));
            if (found) setPost(found);
        }
    }, [id, isAdmin, navigate]);

    const modules = {
        toolbar: [
            [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
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
        alert("Konten Berhasil Disimpan!");
        navigate('/BeritaKami');
    };

    return (
        <div className="min-h-screen bg-brand-gray-50 pb-20">
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-gray-200 px-8 py-4 flex justify-between items-center">
                <button onClick={() => navigate('/BeritaKami')} className="flex items-center gap-2 text-brand-gray-600 font-bold text-xs uppercase tracking-widest hover:text-brand-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Batal
                </button>
                <button onClick={handleSave} className="bg-brand-primary text-white px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-brand-blue-700 transition-all">
                    Simpan & Publish
                </button>
            </nav>

            <main className="max-w-5xl mx-auto mt-10 px-6">
                <div className="flex gap-4 mb-8 bg-brand-gray-200 p-1.5 rounded-2xl w-fit">
                    <button onClick={() => setPost({ ...post, tipe: 'BERITA' })} className={`px-6 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all ${post.tipe === 'BERITA' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-gray-500'}`}>
                        <FileText className="w-4 h-4" /> UNGGAH BERITA
                    </button>
                    <button onClick={() => setPost({ ...post, tipe: 'FLYER' })} className={`px-6 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all ${post.tipe === 'FLYER' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-gray-500'}`}>
                        <ImageIcon className="w-4 h-4" /> UNGGAH FLYER
                    </button>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-brand-gray-100">
                    <input type="text" placeholder="JUDUL KONTEN..." className="w-full text-4xl font-black mb-10 outline-none uppercase tracking-tighter text-brand-dark placeholder:text-brand-gray-200" value={post.judul} onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })} />

                    {post.tipe === 'BERITA' ? (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-gray-400 mb-3 tracking-widest">Cover Utama Berita</label>
                                <input type="file" onChange={(e) => handleFileUpload(e, 'gambar')} accept="image/*" className="text-xs text-brand-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand-blue-50 file:text-brand-primary cursor-pointer" />
                            </div>
                            <div className="h-[500px] mb-16">
                                <ReactQuill theme="snow" modules={modules} value={post.konten} onChange={(val) => setPost({ ...post, konten: val })} className="h-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 border-4 border-dashed border-brand-gray-100 rounded-[3rem] bg-brand-gray-50/50">
                            {post.flyer ? (
                                <div className="space-y-6">
                                    <img src={post.flyer} className="max-h-[500px] mx-auto rounded-3xl shadow-lg border-4 border-white" alt="Preview" />
                                    <button onClick={() => setPost({ ...post, flyer: null })} className="text-brand-red font-black text-[10px] uppercase">Ganti Flyer</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-8 bg-brand-blue-50 text-brand-primary rounded-full shadow-inner"><ImageIcon className="w-12 h-12" /></div>
                                    <input type="file" id="flyer-up" className="hidden" onChange={(e) => handleFileUpload(e, 'flyer')} accept="image/*" />
                                    <label htmlFor="flyer-up" className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-brand-blue-800 transition-all">Pilih File Flyer</label>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}