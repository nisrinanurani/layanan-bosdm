<?php
// ============================================================
//  get_notifikasi.php – Ambil Notifikasi Berdasarkan User ID
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'koneksi.php';

// Ambil user_id dari parameter URL (?user_id=xx)
$user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;

if ($user_id <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "User ID tidak valid."
    ]);
    exit;
}

try {
    // Ambil semua notifikasi untuk user tersebut, urutkan dari yang terbaru
    $query = "SELECT id, pesan, kategori, is_read, tanggal 
              FROM notifikasi 
              WHERE user_id = ? 
              ORDER BY tanggal DESC 
              LIMIT 50";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $notifikasi = [];
    while ($row = $result->fetch_assoc()) {
        // Pastikan is_read jadi integer dan tanggal diformat jika perlu
        $row['id'] = (int) $row['id'];
        $row['is_read'] = (int) $row['is_read'];
        $notifikasi[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $notifikasi
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan server: " . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();