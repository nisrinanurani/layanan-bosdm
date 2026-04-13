import { motion } from 'framer-motion';
import { Mail, X, Clock, Bell, Info } from 'lucide-react';

export default function InboxLayanan({ notifications, onClose }) {
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm text-left">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><X /></button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Kotak Masuk</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi & Update Layanan</p>
                    </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                    {notifications.length === 0 ? (
                        <div className="py-20 text-center text-slate-300 font-bold italic uppercase text-xs tracking-widest">Tidak ada pesan baru.</div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className={`p-5 rounded-3xl border transition-all ${n.is_read === 0 ? 'bg-white border-red-100 shadow-lg shadow-red-50/50' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${n.kategori === 'FORUM' ? 'bg-blue-600 text-white' :
                                        n.kategori === 'LAPORAN' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                                        }`}>
                                        {n.kategori || 'SISTEM'}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(n.tanggal).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${n.is_read === 0 ? 'font-black text-slate-800' : 'font-medium text-slate-500'}`}>
                                    {n.pesan}
                                </p>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-6 flex items-center gap-2 text-slate-300 px-2">
                    <Info className="w-3 h-3" />
                    <p className="text-[8px] font-bold uppercase tracking-tighter italic">Notifikasi otomatis dari sistem OSDM</p>
                </div>
            </motion.div>
        </div>
    );
}