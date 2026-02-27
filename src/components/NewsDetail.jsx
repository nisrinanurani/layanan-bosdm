import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';

export default function NewsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [berita, setBerita] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
        const found = saved.find(b => b.id === parseInt(id));
        if (found) {
            setBerita(found);
            window.scrollTo(0, 0); // Scroll ke atas otomatis saat buka berita
        }
    }, [id]);

    if (!berita) {
        return (
            <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">
                Konten tidak ditemukan...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* NAVBAR KEMBALI */}
            <nav className="max-w-4xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate('/BeritaKami')}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Pusat Konten
                </button>
            </nav>

            <main className="max-w-4xl mx-auto px-6">
                {/* HEADER KONTEN */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${berita.tipe === 'BERITA' ? 'bg-blue-600' : 'bg-indigo-600'
                            }`}>
                            {berita.tipe}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {new Date(berita.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] uppercase tracking-tighter mb-10">
                        {berita.judul}
                    </h1>

                    {/* COVER UTAMA (Khusus Berita) */}
                    {berita.tipe === 'BERITA' && berita.gambar && (
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 mb-16">
                            <img src={berita.gambar} className="w-full h-auto" alt="Cover Berita" />
                        </div>
                    )}
                </header>

                {/* ISI KONTEN */}
                <article className="max-w-3xl mx-auto">
                    {berita.tipe === 'BERITA' ? (
                        /* RENDER HASIL QUILL */
                        <div
                            className="quill-render text-slate-600 text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: berita.konten }}
                        />
                    ) : (
                        /* RENDER FLYER (GAMBAR FULL) */
                        <div className="space-y-8">
                            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                                <img src={berita.flyer} className="w-full h-auto" alt="Flyer" />
                            </div>
                            <p className="text-center text-slate-400 font-medium italic text-sm">
                                *Gambar di atas adalah konten Flyer resmi BOSDM.
                            </p>
                        </div>
                    )}
                </article>
            </main>

            {/* CSS KHUSUS UNTUK RENDER QUILL */}
            <style>{`
                .quill-render {
                    word-break: break-word;
                }
                .quill-render h1, .quill-render h2, .quill-render h3 {
                    color: #0f172a;
                    font-weight: 900;
                    text-transform: uppercase;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }
                .quill-render p { margin-bottom: 1.5rem; }
                .quill-render strong { color: #1e293b; font-weight: 800; }
                
                /* Alignment dari Toolbar */
                .quill-render .ql-align-center { text-align: center; }
                .quill-render .ql-align-right { text-align: right; }
                .quill-render .ql-align-justify { text-align: justify; }

                /* Indentasi (Tab) */
                .quill-render .ql-indent-1 { padding-left: 3rem; }
                .quill-render .ql-indent-2 { padding-left: 6rem; }

                /* Image di tengah teks */
                .quill-render img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 2rem;
                    margin: 2.5rem 0;
                    display: block;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                }

                /* Blockquote */
                .quill-render blockquote {
                    border-left: 6px solid #3b82f6;
                    background: #eff6ff;
                    padding: 2rem;
                    border-radius: 0 2rem 2rem 0;
                    font-style: italic;
                    margin: 2rem 0;
                }

                /* List Styling */
                .quill-render ul, .quill-render ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .quill-render ul { list-style-type: disc; }
                .quill-render ol { list-style-type: decimal; }
            `}</style>
        </div>
    );
}