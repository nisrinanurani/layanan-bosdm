<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
require_once 'koneksi.php';

$user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;

if ($user_id <= 0) {
    echo json_encode(["status" => "error", "message" => "ID tidak valid"]);
    exit;
}

// Default permissions
$default_perm = [
    "berita"     => ["view" => false, "edit" => false, "delete" => false],
    "dokumen"    => ["view" => false, "edit" => false, "delete" => false, "manage_kategori" => false],
    "grafik"     => ["view" => false, "edit" => false, "delete" => false, "publish" => false],
    "semua_link" => ["view" => false, "edit" => false, "delete" => false, "manage_fungsi" => false],
    "profil"     => ["view" => false, "edit" => false],
    "lapor"      => ["view" => false, "edit" => false],
    "tanya"      => ["view" => false, "edit" => false, "delete" => false],
];
$full_perm = [
    "berita"     => ["view" => true, "edit" => true, "delete" => true],
    "dokumen"    => ["view" => true, "edit" => true, "delete" => true, "manage_kategori" => true],
    "grafik"     => ["view" => true, "edit" => true, "delete" => true, "publish" => true],
    "semua_link" => ["view" => true, "edit" => true, "delete" => true, "manage_fungsi" => true],
    "profil"     => ["view" => true, "edit" => true],
    "lapor"      => ["view" => true, "edit" => true],
    "tanya"      => ["view" => true, "edit" => true, "delete" => true],
];

// Ambil data user lengkap termasuk is_superadmin
$query = "SELECT id, username, nama_depan, nama_belakang, nama_lengkap_input, nip, biro, unit, is_superadmin, foto
          FROM users
          WHERE id = $user_id";

$res = $conn->query($query);

if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    
    // Tentukan permissions
    $permissions = $default_perm;
    if ((bool)$row['is_superadmin']) {
        $permissions = $full_perm;
    } else {
        $perm_stmt = $conn->prepare("SELECT permissions FROM user_permissions WHERE user_id = ? LIMIT 1");
        $perm_stmt->bind_param("i", $user_id);
        $perm_stmt->execute();
        $perm_result = $perm_stmt->get_result();
        if ($perm_result->num_rows > 0) {
            $perm_row = $perm_result->fetch_assoc();
            $saved_perm = json_decode($perm_row['permissions'], true) ?: [];
            foreach ($default_perm as $module => $actions) {
                $permissions[$module] = array_merge($actions, $saved_perm[$module] ?? []);
            }
        }
        $perm_stmt->close();
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "id"                 => (int)$row['id'],
            "username"           => $row['username'],
            "nama_depan"         => $row['nama_depan'],
            "nama_belakang"      => $row['nama_belakang'],
            "nama_lengkap_input" => $row['nama_lengkap_input'],
            "nip"                => $row['nip'],
            "biro"               => $row['biro'],
            "unit"               => $row['unit'],
            "foto"               => $row['foto'],
            "is_superadmin"      => (bool)$row['is_superadmin'],
            "permissions"        => $permissions,
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
}
?>