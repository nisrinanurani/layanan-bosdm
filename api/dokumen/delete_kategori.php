<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
$nama = strtoupper(trim($conn->real_escape_string($input['nama'] ?? '')));
if (!$nama) { echo json_encode(["status"=>"error","message"=>"Nama tidak valid"]); exit; }

$conn->query("DELETE FROM dokumen_kategori WHERE nama='$nama'");
echo json_encode(["status"=>"success"]);
$conn->close();
?>
