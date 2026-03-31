import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import NewsDetail from './pages/NewsDetail';
import Dashboard from './pages/Dashboard';
import ProfilBiro from './pages/ProfilBiro';
import TanyaKami from './pages/TanyaKami';
import SemuaLink from './pages/SemuaLink';
import BeritaKami from './pages/BeritaKami';
import EditorBerita from './pages/EditorBerita';
import DokumenKami from './pages/DokumenKami';
import GrafikData from './pages/GrafikData';




function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Persistence: Cek status login dari memori browser
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'pegawai';
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('userRole', userRole);
  }, [isLoggedIn, userRole]);

  const handleLoginSuccess = (userData) => {
    const role = userData.is_superadmin ? 'superadmin' : 'pegawai';
    setUserRole(role);
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi?")) {
      setIsLoggedIn(false);
      setUserRole('pegawai');
      localStorage.clear();
    }
  };

  return (
    <Router>
      <Routes>
        {/* HALAMAN UTAMA (LANDING) */}
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <LandingPage
                onOpenLogin={() => setIsLoginOpen(true)}
                onOpenRegister={() => setIsRegisterOpen(true)}
              />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* DASHBOARD INTERNAL */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard userRole={userRole} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* AKSES PUBLIK (BISA DIBUKA TANPA LOGIN) */}
        <Route path="/berita/:id" element={<NewsDetail />} />
        <Route path="/berita-kami" element={<BeritaKami userRole={isLoggedIn ? userRole : 'pegawai'} />} />

        {/* RUTE TERPROTEKSI (HARUS LOGIN) */}
        <Route
          path="/profil"
          element={isLoggedIn ? <ProfilBiro userRole={userRole} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/tanya"
          element={isLoggedIn ? <TanyaKami userRole={userRole} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/semua-link"
          element={isLoggedIn ? <SemuaLink userRole={userRole} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/dokumen-kami"
          element={isLoggedIn ? <DokumenKami userRole={userRole} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/grafik-data"
          element={isLoggedIn ? <GrafikData userRole={userRole} /> : <Navigate to="/" replace />}
        />
        {/* RUTE EDITOR (KHUSUS ADMIN/SUPERADMIN) */}
        <Route
          path="/berita-kami/editor"
          element={
            isLoggedIn && (userRole === 'admin' || userRole === 'superadmin') ? (
              <EditorBerita userRole={userRole} />
            ) : (
              <Navigate to="/berita-kami" replace />
            )
          }
        />
        <Route
          path="/berita-kami/editor/:id"
          element={
            isLoggedIn && (userRole === 'admin' || userRole === 'superadmin') ? (
              <EditorBerita userRole={userRole} />
            ) : (
              <Navigate to="/berita-kami" replace />
            )
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
      />
    </Router>
  );
}

export default App;