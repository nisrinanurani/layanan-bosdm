<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) { echo json_encode(["status"=>"error","message"=>"Data tidak valid"]); exit; }

$id         = $input['id'] ?? (time() * 1000 + rand(0,999));
$judul      = $conn->real_escape_string($input['judul'] ?? '');
$kategori   = $conn->real_escape_string($input['kategori'] ?? '');
$deskripsi  = $conn->real_escape_string($input['deskripsi'] ?? '');
$link       = $conn->real_escape_string($input['link'] ?? '');
$created_by = (int)($input['created_by'] ?? 0);

$sql = "INSERT INTO dokumen (id, judul, kategori, deskripsi, link, created_by)
        VALUES ($id, '$judul', '$kategori', '$deskripsi', '$link', " . ($created_by ?: 'NULL') . ")
        ON DUPLICATE KEY UPDATE
            judul='$judul', kategori='$kategori', deskripsi='$deskripsi', link='$link'";

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success","message"=>"Dokumen disimpan","id"=>$id]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
