import { useNavigate } from 'react-router-dom';

export default function NewsHero() {
    const navigate = useNavigate();
    const allData = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
    // Ambil maksimal 10 yang ditandai Hero
    const heroContent = allData.filter(i => i.isHero).slice(0, 10);

    return (
        <section className="px-8 py-20 max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Sorotan Utama</h2>
                <div className="h-[2px] flex-1 bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {heroContent.length > 0 ? (
                    heroContent.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/berita/${item.id}`)}
                            className="group relative h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl cursor-pointer bg-slate-900"
                        >
                            <img
                                src={item.tipe === 'BERITA' ? item.gambar : item.flyer}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                alt={item.judul}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-10 flex flex-col justify-end">
                                <span className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black text-white mb-4 uppercase tracking-[0.2em] ${item.tipe === 'BERITA' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                                    {item.tipe}
                                </span>
                                <h3 className="text-white font-black text-2xl uppercase leading-tight tracking-tighter line-clamp-2">
                                    {item.judul}
                                </h3>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-[3.5rem]">
                        <p className="text-slate-300 font-black uppercase text-xs tracking-[0.4em]">Tidak Ada Konten Unggulan</p>
                    </div>
                )}
            </div>
        </section>
    );
}