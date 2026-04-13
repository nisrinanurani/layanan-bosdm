<?php
// ============================================================
//  kirim_pertanyaan.php – Simpan Tanya Kami & Forum
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'koneksi.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if ($data) {
    $user_id = $data['user_id'];
    $subjek = $data['subjek'];
    $pesan = $data['pesan'];
    $kategori = $data['kategori']; // 'tanya_kami' atau 'forum_umum'

    // 1. Simpan ke tabel pertanyaan
    $query = "INSERT INTO pertanyaan (user_id, subjek, pesan, kategori) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("isss", $user_id, $subjek, $pesan, $kategori);

    if ($stmt->execute()) {
        $last_id = $conn->insert_id;

        // 2. Kirim Notifikasi Otomatis ke User sebagai konfirmasi
        $msg_notif = "Pertanyaan Anda: '" . substr($subjek, 0, 30) . "...' telah diterima. Mohon tunggu jawaban admin.";
        $stmt_notif = $conn->prepare("INSERT INTO notifikasi (user_id, pesan, kategori) VALUES (?, ?, 'tanya_kami')");
        $stmt_notif->bind_param("is", $user_id, $msg_notif);
        $stmt_notif->execute();

        echo json_encode(["status" => "success", "message" => "Pesan berhasil terkirim!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal mengirim pesan."]);
    }
}
?>