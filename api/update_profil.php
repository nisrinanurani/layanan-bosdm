<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'koneksi.php';

// Menangani Preflight request untuk CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = (int) $_POST['user_id'];
    $nama_depan = mysqli_real_escape_string($conn, $_POST['nama_depan']);
    $nip = mysqli_real_escape_string($conn, $_POST['nip']);

    $foto_query = "";

    // 1. Proses Upload Foto jika ada file yang diunggah tanpa error
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = "uploads/profil/";

        // Buat folder jika belum ada
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Hapus foto lama agar tidak menumpuk di server
        $res_lama = $conn->query("SELECT foto FROM users WHERE id = $user_id");
        $data_lama = $res_lama->fetch_assoc();
        if (!empty($data_lama['foto']) && file_exists($upload_dir . $data_lama['foto'])) {
            unlink($upload_dir . $data_lama['foto']);
        }

        // Simpan foto baru dengan nama unik (timestamp + nama asli)
        $file_name = time() . "_" . basename($_FILES['foto']['name']);
        $target_file = $upload_dir . $file_name;

        if (move_uploaded_file($_FILES['foto']['tmp_name'], $target_file)) {
            $foto_query = ", foto = '$file_name'";
        }
    }

    // 2. Jalankan Query Update
    $query = "UPDATE users SET nama_depan = '$nama_depan', nip = '$nip' $foto_query WHERE id = $user_id";

    if ($conn->query($query)) {
        // 3. Ambil data terbaru untuk dikirim balik ke React (State Sync)
        $res_updated = $conn->query("SELECT * FROM users WHERE id = $user_id");
        $updated = $res_updated->fetch_assoc();

        // Pastikan password tidak ikut terkirim balik demi keamanan
        unset($updated['password']);

        echo json_encode([
            "status" => "success",
            "message" => "Profil berhasil diperbarui",
            "user" => $updated
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Gagal memperbarui database: " . $conn->error
        ]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Method tidak diizinkan"]);
}
?>