import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

// Same dummy data as NewsHero for consistency
const newsData = [
    {
        id: 1,
        title: 'BRIN Buka Seleksi Terbuka Jabatan Pimpinan Tinggi Pratama Tahun 2026',
        date: '15 Februari 2026',
        author: 'Humas BRIN',
        description: 'Biro Organisasi dan SDM BRIN mengumumkan pembukaan seleksi terbuka untuk mengisi 12 posisi Jabatan Pimpinan Tinggi Pratama di lingkungan BRIN.',
        content: `Badan Riset dan Inovasi Nasional (BRIN) melalui Biro Organisasi dan Sumber Daya Manusia resmi membuka seleksi terbuka untuk mengisi 12 posisi Jabatan Pimpinan Tinggi Pratama (JPT Pratama) di lingkungan BRIN tahun 2026.

Seleksi ini merupakan bagian dari upaya BRIN untuk menempatkan talenta terbaik bangsa dalam posisi strategis guna mendukung percepatan riset dan inovasi nasional.

Persyaratan umum meliputi:
• Berstatus sebagai PNS aktif
• Memiliki kualifikasi pendidikan minimal S2
• Memiliki pengalaman jabatan dalam bidang terkait minimal 5 tahun
• Memiliki kompetensi manajerial dan teknis yang relevan

Pendaftaran dibuka mulai 1 Maret hingga 15 Maret 2026 melalui portal resmi BRIN. Seluruh proses seleksi akan dilaksanakan secara transparan dan akuntabel sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.

Untuk informasi lebih lanjut, silakan menghubungi Biro OSDM BRIN melalui email sdm@brin.go.id atau telepon (021) 123-4567.`,
        gradient: 'from-blue-600 to-indigo-700',
    },
    {
        id: 2,
        title: 'Workshop Pengembangan Kompetensi ASN Berbasis Digital',
        date: '12 Februari 2026',
        author: 'Bidang Pengembangan SDM',
        description: 'Dalam rangka transformasi digital, BRIN menyelenggarakan workshop intensif pengembangan kompetensi ASN di bidang data science dan artificial intelligence.',
        content: `BRIN menyelenggarakan Workshop Pengembangan Kompetensi ASN Berbasis Digital yang berlangsung selama 5 hari di Kawasan Sains dan Teknologi (KST) Soekarno, Cibinong.

Workshop ini diikuti oleh 150 ASN dari berbagai unit kerja di lingkungan BRIN dengan fokus pada pengembangan kompetensi di bidang data science, artificial intelligence, dan machine learning.

Materi yang disampaikan meliputi:
• Dasar-dasar Python untuk Data Science
• Pengenalan Machine Learning dan AI
• Visualisasi Data dengan Tools Modern
• Implementasi AI dalam Proses Bisnis Pemerintahan

Kegiatan ini merupakan bagian dari program transformasi digital BRIN yang bertujuan meningkatkan kapasitas SDM dalam menghadapi era revolusi industri 4.0.`,
        gradient: 'from-emerald-600 to-teal-700',
    },
    {
        id: 3,
        title: 'Hasil Evaluasi Kinerja Pegawai Semester II Tahun 2025',
        date: '8 Februari 2026',
        author: 'Bidang Evaluasi Kinerja',
        description: 'Biro OSDM telah merilis hasil evaluasi kinerja pegawai semester II tahun 2025. Sebanyak 89% pegawai mencapai target kinerja yang ditetapkan.',
        content: `Biro Organisasi dan Sumber Daya Manusia BRIN telah menyelesaikan proses evaluasi kinerja pegawai untuk periode semester II tahun 2025.

Hasil evaluasi menunjukkan capaian yang positif:
• 89% pegawai mencapai atau melampaui target kinerja
• 7% pegawai mencapai sebagian target kinerja
• 4% pegawai memerlukan pembinaan lebih lanjut

Evaluasi dilakukan berdasarkan Sasaran Kinerja Pegawai (SKP) yang telah disepakati pada awal periode. Penilaian mencakup aspek kuantitas, kualitas, waktu, dan biaya dari setiap target yang ditetapkan.

Bagi pegawai dengan capaian kinerja tinggi, akan diberikan penghargaan berupa kesempatan pengembangan kompetensi prioritas dan pertimbangan dalam promosi jabatan.`,
        gradient: 'from-violet-600 to-purple-700',
    },
    {
        id: 4,
        title: 'Kebijakan Baru: Fleksibilitas Kerja Hybrid untuk Peneliti BRIN',
        date: '5 Februari 2026',
        author: 'Sekretariat BRIN',
        description: 'BRIN resmi menerapkan kebijakan kerja hybrid bagi peneliti, memungkinkan kombinasi kerja dari kantor dan jarak jauh untuk meningkatkan produktivitas riset.',
        content: `Kebijakan kerja hybrid untuk peneliti BRIN telah resmi berlaku mulai 1 Februari 2026 berdasarkan Keputusan Kepala BRIN.

Ketentuan utama kebijakan ini meliputi:
• Peneliti dapat bekerja dari jarak jauh maksimal 3 hari per minggu
• Wajib hadir di kantor/laboratorium minimal 2 hari per minggu
• Jadwal hybrid harus mendapat persetujuan atasan langsung
• Produktivitas riset tetap menjadi indikator utama penilaian

Kebijakan ini diterapkan sebagai respons terhadap hasil survei internal yang menunjukkan bahwa 72% peneliti BRIN merasa lebih produktif dengan pola kerja fleksibel.

Monitoring dan evaluasi kebijakan akan dilakukan setiap 3 bulan untuk memastikan efektivitas implementasi.`,
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        id: 5,
        title: 'Penerimaan CPNS BRIN Tahun 2026: Informasi Lengkap',
        date: '1 Februari 2026',
        author: 'Bidang Rekrutmen',
        description: 'BRIN membuka 500 formasi CPNS tahun 2026 untuk berbagai bidang keahlian. Pendaftaran dibuka mulai 1 Maret melalui portal SSCASN.',
        content: `Badan Riset dan Inovasi Nasional (BRIN) membuka kesempatan bagi putra-putri terbaik bangsa untuk bergabung melalui seleksi Calon Pegawai Negeri Sipil (CPNS) tahun 2026.

Rincian formasi yang dibuka:
• Peneliti: 200 formasi (berbagai bidang ilmu)
• Perekayasa: 100 formasi
• Analis Kebijakan: 50 formasi
• Pranata Komputer: 80 formasi
• Jabatan Fungsional Umum: 70 formasi

Persyaratan umum:
• WNI berusia 18-35 tahun
• Pendidikan minimal S1/D4 untuk jabatan fungsional
• IPK minimal 3.00 dari skala 4.00
• Sehat jasmani dan rohani

Pendaftaran dilakukan secara online melalui portal SSCASN (sscasn.bkn.go.id) mulai 1 Maret 2026.

Informasi lebih lanjut dapat dilihat di website resmi BRIN atau menghubungi helpdesk rekrutmen di rekrutmen@brin.go.id.`,
        gradient: 'from-rose-500 to-pink-600',
    },
];

export default function NewsDetail() {
    const { id } = useParams();
    const news = newsData.find((n) => n.id === parseInt(id));

    if (!news) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
                    <p className="text-slate-500 mb-6">Berita tidak ditemukan</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Banner */}
            <div className={`bg-gradient-to-br ${news.gradient} py-16 sm:py-20`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-6">
                        {news.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {news.date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {news.author}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10">
                    {/* Lead */}
                    <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                        {news.description}
                    </p>

                    <div className="w-full h-px bg-slate-100 mb-6" />

                    {/* Full Content */}
                    <div className="prose prose-slate max-w-none">
                        {news.content.split('\n\n').map((paragraph, idx) => (
                            <p key={idx} className="text-slate-600 leading-relaxed mb-4">
                                {paragraph.split('\n').map((line, lineIdx) => (
                                    <span key={lineIdx}>
                                        {line}
                                        {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        ))}
                    </div>

                    {/* Share */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm text-slate-400">Dipublikasikan oleh {news.author}</span>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="h-16" />
        </div>
    );
}
