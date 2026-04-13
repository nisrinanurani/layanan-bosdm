-- ============================================================
--  MIGRATION: Semua tabel konten BOSDM
--  Jalankan di phpMyAdmin → database if0_41510707_db_brin
--  Tanggal: 2026-04-13
-- ============================================================

-- 1. TABEL BERITA
-- ============================================================
CREATE TABLE IF NOT EXISTS berita (
  id BIGINT NOT NULL,
  judul VARCHAR(500) NOT NULL,
  tipe ENUM('BERITA', 'FLYER') DEFAULT 'BERITA',
  konten LONGTEXT,
  gambar TEXT,
  flyer TEXT,
  waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_hero TINYINT(1) DEFAULT 0,
  created_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL DOKUMEN
-- ============================================================
CREATE TABLE IF NOT EXISTS dokumen (
  id BIGINT NOT NULL,
  judul VARCHAR(500) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  link TEXT NOT NULL,
  created_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dokumen_kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert kategori default (hanya jika belum ada)
INSERT IGNORE INTO dokumen_kategori (nama) VALUES
  ('PERATURAN'), ('PANDUAN'), ('TEMPLATE'), ('SOP'), ('LAPORAN');

-- 3. TABEL GRAFIK DATA
-- ============================================================
CREATE TABLE IF NOT EXISTS grafik_data (
  id BIGINT NOT NULL,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) DEFAULT 'bar',
  data_json LONGTEXT NOT NULL,
  config_json TEXT,
  published TINYINT(1) DEFAULT 0,
  created_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL LINK & FUNGSI
-- ============================================================
CREATE TABLE IF NOT EXISTS semua_link (
  id BIGINT NOT NULL,
  nama VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  fungsi VARCHAR(100) DEFAULT '',
  icon VARCHAR(50) DEFAULT 'Link',
  created_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fungsi_link (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  warna VARCHAR(50) DEFAULT 'blue',
  UNIQUE KEY uq_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL PROFIL BIRO (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS profil_biro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL,
  value_text LONGTEXT,
  updated_by INT DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_key (section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABEL USER PERMISSIONS (dari implementasi RBAC sebelumnya)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  permissions TEXT NOT NULL DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  SELESAI. Semua tabel siap digunakan.
-- ============================================================
