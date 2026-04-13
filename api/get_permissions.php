<?php
// ============================================================
//  get_permissions.php – Ambil Permission RBAC per User
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'koneksi.php';

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if ($user_id <= 0) {
    echo json_encode(["status" => "error", "message" => "ID tidak valid"]);
    exit;
}

// Default permissions (semua false)
$default = [
    "berita"     => ["view" => false, "edit" => false, "delete" => false],
    "dokumen"    => ["view" => false, "edit" => false, "delete" => false, "manage_kategori" => false],
    "grafik"     => ["view" => false, "edit" => false, "delete" => false, "publish" => false],
    "semua_link" => ["view" => false, "edit" => false, "delete" => false, "manage_fungsi" => false],
    "profil"     => ["view" => false, "edit" => false],
    "lapor"      => ["view" => false, "edit" => false],
    "tanya"      => ["view" => false, "edit" => false, "delete" => false],
];

// Full permissions (superadmin)
$full = [
    "berita"     => ["view" => true, "edit" => true, "delete" => true],
    "dokumen"    => ["view" => true, "edit" => true, "delete" => true, "manage_kategori" => true],
    "grafik"     => ["view" => true, "edit" => true, "delete" => true, "publish" => true],
    "semua_link" => ["view" => true, "edit" => true, "delete" => true, "manage_fungsi" => true],
    "profil"     => ["view" => true, "edit" => true],
    "lapor"      => ["view" => true, "edit" => true],
    "tanya"      => ["view" => true, "edit" => true, "delete" => true],
];

// Cek apakah superadmin
$stmt = $conn->prepare("SELECT is_superadmin FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
    exit;
}

$user = $result->fetch_assoc();

// Superadmin → full access
if ((bool)$user['is_superadmin']) {
    echo json_encode(["status" => "success", "permissions" => $full, "is_superadmin" => true]);
    exit;
}

// Cek tabel user_permissions
$stmt2 = $conn->prepare("SELECT permissions FROM user_permissions WHERE user_id = ? LIMIT 1");
$stmt2->bind_param("i", $user_id);
$stmt2->execute();
$result2 = $stmt2->get_result();

if ($result2->num_rows === 0) {
    // Belum ada record → default (semua false)
    echo json_encode(["status" => "success", "permissions" => $default, "is_superadmin" => false]);
    exit;
}

$row = $result2->fetch_assoc();
$saved = json_decode($row['permissions'], true);

// Merge dengan default agar field baru tidak hilang
$merged = [];
foreach ($default as $module => $actions) {
    $merged[$module] = array_merge($actions, $saved[$module] ?? []);
}

echo json_encode(["status" => "success", "permissions" => $merged, "is_superadmin" => false]);

$conn->close();
?>
