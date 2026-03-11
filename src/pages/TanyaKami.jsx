import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Shield, ArrowLeft } from 'lucide-react';
import logoBrin from '../assets/logo-brin-decs.png';

import ForumList from './ForumList';
import ForumDetail from './ForumDetail';
import LaporKak from './LaporKak';

export default function TanyaKami({ userRole }) {
    const navigate = useNavigate();
    const isAdmin = ['superadmin', 'admin'].includes(userRole);

    const [activeModule, setActiveModule] = useState('forum'); // 'forum' | 'lapor'
    const [selectedThread, setSelectedThread] = useState(null); // for Forum navigation

    const handleSelectThread = (thread) => setSelectedThread(thread);
    const handleBackFromThread = () => setSelectedThread(null);

    const handleModuleSwitch = (mod) => {
        setActiveModule(mod);
        setSelectedThread(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* ===== TOP NAVBAR ===== */}
            <nav className="border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logoBrin} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </div>

                    {/* Floating Pill Navigation */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shadow-inner">
                        <button
                            onClick={() => handleModuleSwitch('forum')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeModule === 'forum'
                                ? 'bg-white text-blue-600 shadow-md shadow-blue-50'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <MessageSquare className={`w-4 h-4 ${activeModule === 'forum' ? 'text-blue-600' : 'text-slate-400'}`} />
                            Ngobrol Yuk!
                        </button>
                        <button
                            onClick={() => handleModuleSwitch('lapor')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeModule === 'lapor'
                                ? 'bg-white text-red-600 shadow-md shadow-red-50'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Shield className={`w-4 h-4 ${activeModule === 'lapor' ? 'text-red-600' : 'text-slate-400'}`} />
                            Lapor KAK!
                        </button>
                    </div>

                    {/* Right side: Kembali + indicator */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${activeModule === 'forum' ? 'bg-blue-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-xs font-bold text-slate-400">
                                {activeModule === 'forum' ? (isAdmin ? 'Moderator' : 'Pengguna') : (isAdmin ? 'Admin' : 'Pelapor')}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </button>
                    </div>
                </div>

                {/* Active module accent bar */}
                <motion.div
                    layoutId="module-accent"
                    className={`h-0.5 ${activeModule === 'forum' ? 'bg-blue-600' : 'bg-red-600'}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            </nav>

            {/* ===== MAIN CONTENT ===== */}
            <main className="pt-10">
                <AnimatePresence mode="wait">
                    {activeModule === 'forum' ? (
                        <motion.div
                            key="forum-module"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AnimatePresence mode="wait">
                                {selectedThread ? (
                                    <motion.div
                                        key={`thread-${selectedThread.id}`}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ForumDetail
                                            thread={selectedThread}
                                            onBack={handleBackFromThread}
                                            userRole={userRole}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="forum-list"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ForumList
                                            onSelectThread={handleSelectThread}
                                            userRole={userRole}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="lapor-module"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Semua role menggunakan LaporKak — admin dan pegawai */}
                            <LaporKak userRole={userRole} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}