<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
$action   = $input['action'] ?? 'add';
$nama     = $conn->real_escape_string(trim($input['nama'] ?? ''));
$old_nama = $conn->real_escape_string(trim($input['old_nama'] ?? ''));
$warna    = $conn->real_escape_string($input['warna'] ?? 'blue');

if (!$nama) { echo json_encode(["status"=>"error","message"=>"Nama tidak boleh kosong"]); exit; }

if ($action === 'add') {
    $sql = "INSERT IGNORE INTO fungsi_link (nama, warna) VALUES ('$nama', '$warna')";
} elseif ($action === 'edit') {
    // Update link yang pakai fungsi ini juga
    $conn->query("UPDATE semua_link SET fungsi='$nama' WHERE fungsi='$old_nama'");
    $sql = "UPDATE fungsi_link SET nama='$nama', warna='$warna' WHERE nama='$old_nama'";
} elseif ($action === 'delete') {
    $conn->query("UPDATE semua_link SET fungsi='' WHERE fungsi='$nama'");
    $sql = "DELETE FROM fungsi_link WHERE nama='$nama'";
} else {
    echo json_encode(["status"=>"error","message"=>"Action tidak valid"]); exit;
}

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success"]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
