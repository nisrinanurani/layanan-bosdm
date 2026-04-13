import { useState, useEffect, useMemo } from 'react';
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
import AdminLaporAction from './pages/AdminLaporAction';
import KelolaUser from './pages/KelolaUser';

// Fitur Baru Modal
import EditProfil from './pages/EditProfil';
import InboxLayanan from './pages/InboxLayanan';

// RBAC
import { buildPermissions } from './lib/permissions';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // --- STATE MODAL GLOBAL ---
  const [isEditProfilOpen, setIsEditProfilOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Inisialisasi state dari localStorage
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_data');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Sinkronisasi state ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user_data');
    }
  }, [isLoggedIn, userData]);

  // --- TAMBAHAN: LOGIKA REFRESH DATA USER DARI DATABASE ---
  // Agar ketika user refresh halaman, data NIP/Biro/Unit terbaru langsung ditarik dari SQL
  useEffect(() => {
    if (isLoggedIn && userData?.id) {
      const refreshUser = async () => {
        try {
          const res = await fetch(`/api/get_user_info.php?user_id=${userData.id}`);
          const result = await res.json();
          if (result.status === 'success') {
            setUserData(result.data);
          }
        } catch (e) {
          console.error("Gagal refresh data profil");
        }
      };
      refreshUser();
    }
  }, [isLoggedIn]);

  // --- LOGIKA POLLING NOTIFIKASI (Sesuai get_notifikasi.php kamu) ---
  useEffect(() => {
    if (isLoggedIn && userData) {
      const fetchNotif = async () => {
        try {
          const res = await fetch(`/api/get_notifikasi.php?user_id=${userData.id}`);
          const result = await res.json();
          // Mengikuti struktur PHP: { status: "success", data: [...] }
          if (result.status === "success") {
            setNotifications(result.data);
          }
        } catch (e) {
          console.error("Gagal sinkron inbox:", e);
        }
      };

      fetchNotif(); // Ambil saat pertama kali login
      const interval = setInterval(fetchNotif, 30000); // Polling setiap 30 detik
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, userData]);

  // Build permissions dari userData (memoized agar tidak re-render setiap saat)
  const userPermissions = useMemo(() => buildPermissions(userData), [userData]);

  const handleLoginSuccess = (data) => {
    setUserData(data);
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi?")) {
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.clear(); // Hapus semua jejak login
    }
  };

  return (
    <Router>
      <Routes>
        {/* HALAMAN UTAMA / LANDING */}
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

        {/* DASHBOARD - Ditambahkan props untuk modal & notif */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard
                user={userData}
                onLogout={handleLogout}
                onOpenEditProfil={() => setIsEditProfilOpen(true)}
                onOpenInbox={() => setIsInboxOpen(true)}
                notifCount={notifications.filter(n => n.is_read === 0).length}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* BERITA */}
        <Route path="/berita/:id" element={<NewsDetail />} />
        <Route path="/berita-kami" element={isLoggedIn ? <BeritaKami permissions={userPermissions} /> : <Navigate to="/" replace />} />

        {/* PROTECTED ROUTES (Harus Login) */}
        <Route path="/profil" element={isLoggedIn ? <ProfilBiro permissions={userPermissions} /> : <Navigate to="/" replace />} />
        <Route path="/tanya" element={isLoggedIn ? <TanyaKami user={userData} permissions={userPermissions} /> : <Navigate to="/" replace />} />
        <Route path="/semua-link" element={isLoggedIn ? <SemuaLink permissions={userPermissions} /> : <Navigate to="/" replace />} />
        <Route path="/dokumen-kami" element={isLoggedIn ? <DokumenKami permissions={userPermissions} /> : <Navigate to="/" replace />} />
        <Route path="/grafik-data" element={isLoggedIn ? <GrafikData permissions={userPermissions} /> : <Navigate to="/" replace />} />

        {/* KHUSUS ADMIN / PERMISSION */}
        <Route
          path="/berita-kami/editor"
          element={isLoggedIn && userPermissions.berita?.edit ? <EditorBerita permissions={userPermissions} /> : <Navigate to="/berita-kami" replace />}
        />
        <Route
          path="/admin-lapor"
          element={isLoggedIn && userPermissions.lapor?.view ? <AdminLaporAction permissions={userPermissions} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/kelola-user"
          element={isLoggedIn && userData?.is_superadmin ? <KelolaUser user={userData} /> : <Navigate to="/" replace />}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* MODALS AUTH */}
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

      {/* MODAL EDIT PROFIL (GLOBAL) */}
      {isEditProfilOpen && (
        <EditProfil
          user={userData}
          onUpdate={(updated) => setUserData(updated)}
          onClose={() => setIsEditProfilOpen(false)}
        />
      )}

      {/* MODAL INBOX LAYANAN (GLOBAL) */}
      {isInboxOpen && (
        <InboxLayanan
          notifications={notifications}
          onClose={() => setIsInboxOpen(false)}
        />
      )}
    </Router>
  );
}

export default App;