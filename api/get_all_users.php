<?php
// ============================================================
//  get_all_users.php – List semua user + permissions (Superadmin only)
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'koneksi.php';

$admin_id = isset($_GET['admin_id']) ? (int)$_GET['admin_id'] : 0;

// Verifikasi superadmin
$check = $conn->prepare("SELECT is_superadmin FROM users WHERE id = ? LIMIT 1");
$check->bind_param("i", $admin_id);
$check->execute();
$adminResult = $check->get_result()->fetch_assoc();

if (!$adminResult || !(bool)$adminResult['is_superadmin']) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Akses ditolak"]);
    exit;
}

// Default permissions template
$default = [
    "berita"     => ["view" => false, "edit" => false, "delete" => false],
    "dokumen"    => ["view" => false, "edit" => false, "delete" => false, "manage_kategori" => false],
    "grafik"     => ["view" => false, "edit" => false, "delete" => false, "publish" => false],
    "semua_link" => ["view" => false, "edit" => false, "delete" => false, "manage_fungsi" => false],
    "profil"     => ["view" => false, "edit" => false],
    "lapor"      => ["view" => false, "edit" => false],
    "tanya"      => ["view" => false, "edit" => false, "delete" => false],
];

// Ambil semua user kecuali superadmin
$query = "
    SELECT u.id, u.nama_depan, u.nama_belakang, u.nip, u.biro, u.unit, u.username, u.is_superadmin,
           up.permissions
    FROM users u
    LEFT JOIN user_permissions up ON u.id = up.user_id
    ORDER BY u.nama_depan ASC
";

$result = $conn->query($query);
$users = [];

while ($row = $result->fetch_assoc()) {
    $saved = $row['permissions'] ? json_decode($row['permissions'], true) : [];
    // Merge dengan default
    $merged = [];
    foreach ($default as $module => $actions) {
        $merged[$module] = array_merge($actions, $saved[$module] ?? []);
    }
    $users[] = [
        "id"           => (int)$row['id'],
        "nama_depan"   => $row['nama_depan'],
        "nama_belakang"=> $row['nama_belakang'],
        "nip"          => $row['nip'],
        "biro"         => $row['biro'],
        "unit"         => $row['unit'],
        "username"     => $row['username'],
        "is_superadmin"=> (bool)$row['is_superadmin'],
        "permissions"  => $merged,
    ];
}

echo json_encode(["status" => "success", "data" => $users]);
$conn->close();
?>
