<?php
// ============================================================
//  login.php – Autentikasi Pengguna (VERSI FIX)
// ============================================================

// 1. Header untuk Keamanan & Akses (Wajib ada!)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Menangani request Pre-flight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'koneksi.php';

// 2. Hanya terima metode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan."]);
    exit();
}

// 3. Ambil & decode body JSON
$input = json_decode(file_get_contents("php://input"), true);
if ($input === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Format JSON tidak valid."]);
    exit();
}

$username = trim($input['username'] ?? '');
$password_raw = $input['password'] ?? '';

// 4. QUERY FIX: Kita ambil nama_depan & nama_belakang (BUKAN nama_lengkap)
$stmt = $conn->prepare(
    "SELECT id, username, nama_depan, nama_belakang, nip, biro, unit, password, is_superadmin 
     FROM users 
     WHERE username = ? 
     LIMIT 1"
);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Username tidak ditemukan."]);
    exit();
}

$user = $result->fetch_assoc();

// 5. Verifikasi password hash
if (!password_verify($password_raw, $user['password'])) {
    echo json_encode(["status" => "error", "message" => "Password salah."]);
    exit();
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

// Ambil permissions berdasarkan role
$permissions = $default_perm;
if ((bool) $user['is_superadmin']) {
    $permissions = $full_perm;
} else {
    $user_id_val = (int) $user['id'];
    $perm_stmt = $conn->prepare("SELECT permissions FROM user_permissions WHERE user_id = ? LIMIT 1");
    $perm_stmt->bind_param("i", $user_id_val);
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

// 6. Login berhasil – Gabungkan nama untuk dikirim ke Dashboard
echo json_encode([
    "status" => "success",
    "message" => "Login berhasil.",
    "user" => [
        "id"           => (int) $user['id'],
        "username"     => $user['username'],
        "nama_depan"   => $user['nama_depan'],
        "nama"         => $user['nama_depan'] . ' ' . $user['nama_belakang'],
        "nip"          => $user['nip'],
        "biro"         => $user['biro'],
        "unit"         => $user['unit'],
        "is_superadmin"=> (bool) $user['is_superadmin'],
        "permissions"  => $permissions
    ]
]);

$stmt->close();
$conn->close();