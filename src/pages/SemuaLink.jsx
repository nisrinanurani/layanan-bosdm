import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, ExternalLink, Link as LinkIcon } from 'lucide-react';

export default function SemuaLink({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);
    const [links, setLinks] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('data_links_bosdm') || '[]');
        setLinks(saved);
    }, []);

    return (
        <div className="min-h-screen bg-brand-gray-50 p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Kumpulan Link</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mt-2">Manajemen Tusi Layanan BOSDM</p>
                    </div>
                    {isAdmin && (
                        <button className="bg-brand-dark text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-primary transition-all shadow-xl shadow-brand-blue-100">
                            <Plus className="w-4 h-4" /> Tambah Link Baru
                        </button>
                    )}
                </header>

                <div className="bg-white border border-brand-gray-200 rounded-[3rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-gray-50/50 border-b border-brand-gray-100 font-black text-[10px] uppercase tracking-widest text-brand-gray-400">
                                <th className="p-6">Judul Link</th>
                                <th className="p-6">URL / Alamat</th>
                                <th className="p-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray-50">
                            {links.map((link) => (
                                <tr key={link.id} className="hover:bg-brand-blue-50/30 transition-all">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-blue-50 text-brand-primary rounded-lg">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-black text-brand-dark uppercase text-xs">{link.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-medium text-brand-gray-400 truncate block max-w-xs">{link.url}</span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex justify-center gap-4">
                                            <a href={link.url} target="_blank" rel="noreferrer" className="text-brand-primary font-black text-[10px] uppercase hover:underline">Buka</a>
                                            {isAdmin && (
                                                <>
                                                    <button className="text-amber-500 font-black text-[10px] uppercase hover:underline">Edit</button>
                                                    <button className="text-red-400 font-black text-[10px] uppercase hover:underline">Hapus</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}