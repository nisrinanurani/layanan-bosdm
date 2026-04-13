<?php
// ============================================================
//  send_help.php  –  Kirim Aduan / Pesan Bantuan
//  Letakkan di : /htdocs/api/send_help.php
// ============================================================

header('Content-Type: application/json');
require_once 'koneksi.php';

// ----------------------------------------------------------
// 1. Hanya terima metode POST
// ----------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan. Gunakan POST."]);
    exit();
}

// ----------------------------------------------------------
// 2. Ambil & decode body JSON
// ----------------------------------------------------------
$input = json_decode(file_get_contents("php://input"), true);

if ($input === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Format JSON tidak valid."]);
    exit();
}

// ----------------------------------------------------------
// 3. Validasi field wajib
// ----------------------------------------------------------
$nama_lengkap = trim($input['nama_lengkap'] ?? '');
$pesan        = trim($input['pesan']        ?? '');

if ($nama_lengkap === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Field 'nama_lengkap' tidak boleh kosong."]);
    exit();
}

if ($pesan === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Field 'pesan' tidak boleh kosong."]);
    exit();
}

// ----------------------------------------------------------
// 4. Simpan aduan ke tabel `aduan` dengan status default 'pending'
//    Struktur tabel yang diasumsikan:
//    aduan(id INT AUTO_INCREMENT PK,
//          nama_lengkap VARCHAR,
//          pesan TEXT,
//          status ENUM('pending','proses','selesai') DEFAULT 'pending',
//          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
// ----------------------------------------------------------
$status_default = 'pending';

$stmt = $conn->prepare(
    "INSERT INTO aduan (nama_lengkap, pesan, status) VALUES (?, ?, ?)"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Prepare statement gagal: " . $conn->error
    ]);
    exit();
}

$stmt->bind_param("sss", $nama_lengkap, $pesan, $status_default);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal menyimpan aduan: " . $stmt->error
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$inserted_id = $stmt->insert_id;
$stmt->close();
$conn->close();

// ----------------------------------------------------------
// 5. Respon sukses
// ----------------------------------------------------------
http_response_code(201);
echo json_encode([
    "status"  => "success",
    "message" => "Aduan berhasil dikirim. Tim kami akan segera menghubungi Anda.",
    "data"    => [
        "id"           => (int) $inserted_id,
        "nama_lengkap" => $nama_lengkap,
        "status"       => $status_default
    ]
]);
