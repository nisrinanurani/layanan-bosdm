<?php
// ============================================================
//  register_final.php – Registrasi + Notif Otomatis
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'koneksi.php';

$input = file_get_contents("php://input");
$formData = json_decode($input, true);

if ($formData) {
    $nama_depan = $formData['nama_depan'];
    $nama_belakang = $formData['nama_belakang'];
    $nip = $formData['nip'];
    $biro = $formData['biro'];
    $unit = $formData['unit'];
    $password = password_hash($formData['password'], PASSWORD_DEFAULT);

    // 1. Cek apakah NIP sudah ada
    $check = $conn->prepare("SELECT id FROM users WHERE nip = ?");
    $check->bind_param("s", $nip);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "NIP ini sudah terdaftar!"]);
        exit;
    }

    // 2. Buat Username Otomatis
    $clean_name = strtolower(str_replace(' ', '', $nama_depan));
    $last_four_nip = substr($nip, -4);
    $generated_username = $clean_name . $last_four_nip;

    // 3. Simpan User ke Database
    $query = "INSERT INTO users (nama_depan, nama_belakang, nip, biro, unit, username, password, is_superadmin) VALUES (?, ?, ?, ?, ?, ?, ?, 0)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssssss", $nama_depan, $nama_belakang, $nip, $biro, $unit, $generated_username, $password);

    if ($stmt->execute()) {
        // Ambil ID user yang baru saja masuk
        $new_user_id = $conn->insert_id;

        // 4. OTOMATIS TAMBAH NOTIFIKASI WELCOME
        $pesan_welcome = "Selamat datang di Portal BOSDM, " . $nama_depan . "! Silakan lengkapi profil dan jelajahi layanan kami.";
        $kategori = "umum";

        $stmt_notif = $conn->prepare("INSERT INTO notifikasi (user_id, pesan, kategori, is_read) VALUES (?, ?, ?, 0)");
        $stmt_notif->bind_param("iss", $new_user_id, $pesan_welcome, $kategori);
        $stmt_notif->execute();

        echo json_encode([
            "status" => "success",
            "message" => "Pendaftaran berhasil!",
            "username" => $generated_username
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan data."]);
    }
}
?>