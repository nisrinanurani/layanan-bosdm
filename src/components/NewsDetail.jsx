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
            <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center font-black uppercase text-brand-gray-400 tracking-widest">
                Konten tidak ditemukan...
            </div>
        );
    }

    return (
        /* BACKGROUND UTAMA: Pakai abu-abu sangat muda kebiruan (Eye-Care) */
        <div className="min-h-screen bg-brand-gray-50 pb-20 font-sans">

            {/* NAVBAR KEMBALI */}
            <nav className="max-w-5xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate('/BeritaKami')}
                    className="flex items-center gap-2 text-brand-gray-400 hover:text-brand-primary font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Pusat Konten
                </button>
            </nav>

            <main className="max-w-5xl mx-auto px-6">
                {/* HEADER KONTEN */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${berita.tipe === 'BERITA' ? 'bg-brand-primary' : 'bg-indigo-600 shadow-lg shadow-indigo-100'
                            }`}>
                            {berita.tipe}
                        </span>
                        <div className="flex items-center gap-2 text-brand-gray-400 font-bold text-[9px] uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {new Date(berita.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-brand-dark leading-[1.1] uppercase tracking-tighter mb-10">
                        {berita.judul}
                    </h1>
                </header>

                {/* AREA ARTIKEL: Dibungkus Card Putih Bersih */}
                <article className="bg-white rounded-[3.5rem] p-8 md:p-16 shadow-xl shadow-brand-blue-100/20 border border-white">

                    {berita.tipe === 'BERITA' ? (
                        <>
                            {/* COVER BERITA */}
                            {berita.gambar && (
                                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
                                    <img src={berita.gambar} className="w-full h-auto" alt="Cover Berita" />
                                </div>
                            )}

                            {/* RENDER HASIL QUILL */}
                            <div
                                className="quill-render text-brand-gray-600 text-lg leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: berita.konten }}
                            />
                        </>
                    ) : (
                        /* RENDER FLYER (GAMBAR FULL) */
                        <div className="space-y-10">
                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-brand-gray-50">
                                <img src={berita.flyer} className="w-full h-auto" alt="Flyer" />
                            </div>
                            <div className="bg-brand-blue-50 p-6 rounded-2xl border border-brand-blue-100 text-center">
                                <p className="text-brand-primary font-black uppercase text-[10px] tracking-widest">
                                    Informasi Publik Resmi BOSDM
                                </p>
                            </div>
                        </div>
                    )}
                </article>
            </main>

            {/* CSS UNTUK RENDER QUILL - DISESUAIKAN DENGAN PALET BARU */}
            <style>{`
                .quill-render {
                    word-break: break-word;
                }
                .quill-render h1, .quill-render h2, .quill-render h3 {
                    color: #0F172A;
                    font-weight: 900;
                    text-transform: uppercase;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }
                .quill-render p { margin-bottom: 1.5rem; }
                .quill-render strong { color: #1E293B; font-weight: 800; }
                
                .quill-render .ql-align-center { text-align: center; }
                .quill-render .ql-align-right { text-align: right; }
                .quill-render .ql-align-justify { text-align: justify; }

                .quill-render .ql-indent-1 { padding-left: 2rem; }
                .quill-render .ql-indent-2 { padding-left: 4rem; }

                .quill-render img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 2rem;
                    margin: 3rem 0;
                    display: block;
                    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1);
                }

                .quill-render blockquote {
                    border-left: 6px solid #1D4ED8;
                    background: #F0F6FF;
                    padding: 2.5rem;
                    border-radius: 0 2.5rem 2.5rem 0;
                    font-style: italic;
                    margin: 2.5rem 0;
                    color: #475569;
                }

                .quill-render ul, .quill-render ol {
                    padding-left: 1.5rem;
                    margin-bottom: 2rem;
                }
                .quill-render ul { list-style-type: disc; }
                .quill-render ol { list-style-type: decimal; }
            `}</style>
        </div>
    );
}