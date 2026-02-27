import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Link as LinkIcon } from 'lucide-react';

export default function SemuaLink() {
    const navigate = useNavigate();
    const links = [
        { title: "Portal Utama BRIN", url: "https://brin.go.id", desc: "Akses ke informasi riset nasional" },
        { title: "E-Office", url: "#", desc: "Sistem persuratan digital" },
        { title: "Layanan SDM", url: "#", desc: "Kelola data kepegawaian Anda" }
    ];

    return (
        <div className="min-h-screen bg-brand-gray-50 p-8 md:p-12">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-gray-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-brand-primary">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>

                <div className="mb-12">
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Kumpulan Link</h1>
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.3em] mt-2">Akses Cepat Layanan BOSDM</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {links.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noreferrer"
                            className="group bg-white p-8 rounded-[2.5rem] border border-brand-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-brand-blue-50 text-brand-primary rounded-lg">
                                        <LinkIcon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-black text-brand-dark uppercase text-sm tracking-tight group-hover:text-brand-primary">{link.title}</h3>
                                </div>
                                <p className="text-xs text-brand-gray-500 font-medium">{link.desc}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-brand-gray-200 group-hover:text-brand-primary" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}