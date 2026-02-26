import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

import logoBrin from '../assets/logo-brin-decs.png';

export default function EditorBerita({ userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [post, setPost] = useState({
        id: id ? parseInt(id) : Date.now(),
        judul: '',
        fungsi: 'UMUM',
        gambar: '',
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

    const handleSave = () => {
        if (!post.judul || !post.konten) return alert("JUDUL DAN KONTEN WAJIB DIISI!");
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const updated = id ? saved.map(b => b.id === parseInt(id) ? post : b) : [post, ...saved];
        localStorage.setItem('data_berita_bosdm', JSON.stringify(updated));
        navigate('/BeritaKami');
    };

    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/BeritaKami')}><ArrowLeft /></button>
                    <span className="font-black text-xs uppercase tracking-widest text-slate-400">Editor Berita</span>
                </div>
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg shadow-blue-100">Publish Berita</button>
            </nav>

            <div className="relative h-[40vh] bg-slate-900 overflow-hidden">
                {post.gambar && <img src={post.gambar} className="w-full h-full object-cover opacity-50" />}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 text-center">URL Background Foto</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" value={post.gambar} onChange={(e) => setPost({ ...post, gambar: e.target.value })} />
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto -mt-20 relative z-10 px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 min-h-[600px]">
                    <textarea
                        placeholder="KETIK JUDUL BERITA..."
                        className="w-full text-4xl font-black text-slate-900 outline-none resize-none mb-6 uppercase tracking-tighter"
                        rows="2"
                        value={post.judul}
                        onChange={(e) => setPost({ ...post, judul: e.target.value.toUpperCase() })}
                    />
                    <div className="h-px w-full bg-slate-100 mb-6"></div>
                    <textarea
                        placeholder="Tuliskan isi berita di sini..."
                        className="w-full text-lg font-medium text-slate-600 outline-none min-h-[400px] resize-none leading-relaxed"
                        value={post.konten}
                        onChange={(e) => setPost({ ...post, konten: e.target.value })}
                    />
                </div>
            </main>
        </div>
    );
}