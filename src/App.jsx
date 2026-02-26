import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import NewsHero from './components/NewsHero';
import PublicStats from './components/PublicStats';
import BottomCTA from './components/BottomCTA';
import LoginModal from './components/LoginModal';
import NewsDetail from './pages/NewsDetail';
import Dashboard from './pages/Dashboard';
import ProfilBiro from './pages/ProfilBiro';
import TanyaKami from './pages/TanyaKami';
import SemuaLink from './pages/SemuaLink';
import BeritaKami from './pages/BeritaKami';
import EditorBerita from './pages/EditorBerita';

function LandingPage({ onOpenLogin }) {
  return (
    <div className="bg-slate-50 min-h-screen">
      <NewsHero />
      <PublicStats />
      <BottomCTA onOpenLogin={onOpenLogin} onOpenRegister={onOpenLogin} />
      <footer className="bg-slate-950 text-slate-600 text-center py-6 text-sm border-t border-slate-900">
        &copy; {new Date().getFullYear()} Biro Organisasi dan SDM - BRIN
      </footer>
    </div>
  );
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // State Login Simulasi
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('pegawai');

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserRole('pegawai');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <LandingPage onOpenLogin={() => setIsLoginOpen(true)} />
            ) : (
              <Dashboard userRole={userRole} onLogout={handleLogout} />
            )
          }
        />
        <Route path="/berita/:id" element={<NewsDetail />} />

        {/* RUTE PROFIL BIRO */}
        <Route
          path="/profil"
          element={
            isLoggedIn ? (
              <ProfilBiro userRole={userRole} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* RUTE TANYA KAMI */}
        <Route
          path="/tanya"
          element={
            isLoggedIn ? (
              <TanyaKami userRole={userRole} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* RUTE SEMUA LINK */}
        <Route
          path="/semua-link"
          element={
            isLoggedIn ? (
              <SemuaLink userRole={userRole} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* RUTE BERITA KAMI */}
        <Route
          path="/berita-kami"
          element={
            isLoggedIn ? (
              <BeritaKami userRole={userRole} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* RUTE EDITOR BERITA */}
        <Route
          path="/berita-kami/editor"
          element={
            isLoggedIn ? (
              <EditorBerita userRole={userRole} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/berita-kami/editor/:id"
          element={
            isLoggedIn ? (
              <EditorBerita userRole={userRole} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </Router>
  );
}

export default App;
