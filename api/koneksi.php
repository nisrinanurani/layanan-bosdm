<?php
// ============================================================
//  koneksi.php  –  Koneksi Database MySQL + Header CORS
//  Hosting : InfinityFree
//  Letakkan di : /htdocs/api/koneksi.php
// ============================================================

// --- CORS Headers ---
// Izinkan akses dari frontend Vercel (atau domain mana pun)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Tangani preflight OPTIONS request agar browser tidak diblokir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Informasi Koneksi Database ---
define('DB_HOST', 'sql313.infinityfree.com');
define('DB_USER', 'if0_41510707');          // Username cPanel InfinityFree
define('DB_PASS', 'Bosdm123');  // Ganti dengan password database Anda
define('DB_NAME', 'if0_41510707_db_brin');

// --- Buat Koneksi MySQLi ---
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Cek koneksi
if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi database gagal: " . $conn->connect_error
    ]);
    exit();
}

// Atur encoding UTF-8 agar karakter Indonesia tampil benar
$conn->set_charset("utf8mb4");
