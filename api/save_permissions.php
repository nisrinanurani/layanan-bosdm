<?php
// ============================================================
//  save_permissions.php – Simpan Permission RBAC per User
//  Hanya bisa diakses oleh Superadmin
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan"]);
    exit;
}

require_once 'koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["status" => "error", "message" => "Data tidak valid"]);
    exit;
}

$admin_id    = (int)($input['admin_id'] ?? 0);
$target_id   = (int)($input['user_id'] ?? 0);
$permissions = $input['permissions'] ?? null;

if ($admin_id <= 0 || $target_id <= 0 || !$permissions) {
    echo json_encode(["status" => "error", "message" => "Parameter tidak lengkap"]);
    exit;
}

// Verifikasi bahwa admin_id adalah superadmin
$check = $conn->prepare("SELECT is_superadmin FROM users WHERE id = ? LIMIT 1");
$check->bind_param("i", $admin_id);
$check->execute();
$adminResult = $check->get_result()->fetch_assoc();

if (!$adminResult || !(bool)$adminResult['is_superadmin']) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Akses ditolak. Hanya Superadmin."]);
    exit;
}

// Tidak bisa mengubah permission superadmin lain
$targetCheck = $conn->prepare("SELECT is_superadmin FROM users WHERE id = ? LIMIT 1");
$targetCheck->bind_param("i", $target_id);
$targetCheck->execute();
$targetResult = $targetCheck->get_result()->fetch_assoc();

if (!$targetResult) {
    echo json_encode(["status" => "error", "message" => "User target tidak ditemukan"]);
    exit;
}
if ((bool)$targetResult['is_superadmin']) {
    echo json_encode(["status" => "error", "message" => "Tidak bisa mengubah permission Superadmin"]);
    exit;
}

$json = json_encode($permissions);

// UPSERT
$stmt = $conn->prepare("
    INSERT INTO user_permissions (user_id, permissions)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE permissions = VALUES(permissions), updated_at = NOW()
");
$stmt->bind_param("is", $target_id, $json);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Permissions berhasil disimpan"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menyimpan: " . $conn->error]);
}

$conn->close();
?>
