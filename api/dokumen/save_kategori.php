<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
$action   = $input['action'] ?? 'add'; // add | edit | delete_all
$nama     = strtoupper(trim($conn->real_escape_string($input['nama'] ?? '')));
$old_nama = strtoupper(trim($conn->real_escape_string($input['old_nama'] ?? '')));

if (!$nama) { echo json_encode(["status"=>"error","message"=>"Nama tidak boleh kosong"]); exit; }

if ($action === 'add') {
    $sql = "INSERT IGNORE INTO dokumen_kategori (nama) VALUES ('$nama')";
} elseif ($action === 'edit') {
    // Cascade update dokumen
    $conn->query("UPDATE dokumen SET kategori='$nama' WHERE kategori='$old_nama'");
    $sql = "UPDATE dokumen_kategori SET nama='$nama' WHERE nama='$old_nama'";
} else {
    echo json_encode(["status"=>"error","message"=>"Action tidak dikenal"]); exit;
}

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success"]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
