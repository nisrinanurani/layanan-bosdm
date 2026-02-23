import NewsHero from './NewsHero';
import PublicStats from './PublicStats';
import BottomCTA from './BottomCTA';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function LandingPage({ onOpenLogin, onOpenRegister }) {
    return (
        <div className="min-h-screen">
            <NewsHero />
            <PublicStats />
            <BottomCTA onOpenLogin={onOpenLogin} onOpenRegister={onOpenRegister} />

            {/* Footer */}
            <footer className="bg-brand-dark text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-blue-700 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Biro Organisasi dan Sumber Daya Manusia</p>
                                    <p className="text-xs text-brand-gray-400">
                                        Badan Riset dan Inovasi Nasional
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-brand-gray-400 leading-relaxed">
                                Melayani dengan transparan, cepat, dan akuntabel untuk mendukung
                                ekosistem riset dan inovasi nasional.
                            </p>
                        </div>


                        {/* Contact */}
                        <div>
                            <h4 className="text-sm font-bold mb-4 text-brand-gray-300">Kontak</h4>
                            <ul className="space-y-2.5">
                                <li className="flex items-center gap-2 text-sm text-brand-gray-400">
                                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                                    Gedung B.J. Habibie, Jl. M.H. Thamrin No. 8,Jakarta Pusat 10340
                                </li>
                                <li className="flex items-center gap-2 text-sm text-brand-gray-400">
                                    <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                                    sdm@brin.go.id
                                </li>
                                <li className="flex items-center gap-2 text-sm text-brand-gray-400">
                                    <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                                    (021) 123-4567
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-brand-gray-500">
                            © 2026 Biro Organisasi dan Sumber Daya Manusia — BRIN. Hak cipta dilindungi.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
