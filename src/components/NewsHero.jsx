import { useNavigate } from 'react-router-dom';

export default function NewsHero() {
    const navigate = useNavigate();
    const allData = JSON.parse(localStorage.getItem('data_berita_bosdm') || '[]');
    const heroContent = allData.filter(i => i.isHero).slice(0, 10);

    return (
        <section className="bg-brand-gray-50 py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-6 mb-12">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-brand-dark italic">Sorotan Utama</h2>
                    <div className="h-[2px] flex-1 bg-brand-gray-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {heroContent.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/berita/${item.id}`)}
                            className="bg-white group relative h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl cursor-pointer"
                        >
                            <img
                                src={item.tipe === 'BERITA' ? item.gambar : item.flyer}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent flex flex-col justify-end p-10">
                                <span className="w-fit bg-brand-primary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase mb-4 tracking-widest shadow-lg">
                                    {item.tipe}
                                </span>
                                <h3 className="text-white font-black text-2xl uppercase leading-tight tracking-tighter line-clamp-2">
                                    {item.judul}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}