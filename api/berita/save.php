<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) { echo json_encode(["status"=>"error","message"=>"Data tidak valid"]); exit; }

$id      = $input['id'] ?? time() * 1000;
$judul   = $conn->real_escape_string($input['judul'] ?? '');
$tipe    = $input['tipe'] === 'FLYER' ? 'FLYER' : 'BERITA';
$konten  = $conn->real_escape_string($input['konten'] ?? '');
$gambar  = $conn->real_escape_string($input['gambar'] ?? '');
$flyer   = $conn->real_escape_string($input['flyer'] ?? '');
$waktu   = $conn->real_escape_string($input['waktu'] ?? date('Y-m-d H:i:s'));
$is_hero = isset($input['isHero']) ? (int)$input['isHero'] : 0;
$created_by = (int)($input['created_by'] ?? 0);

$sql = "INSERT INTO berita (id, judul, tipe, konten, gambar, flyer, waktu, is_hero, created_by)
        VALUES ($id, '$judul', '$tipe', '$konten', '$gambar', '$flyer', '$waktu', $is_hero, " . ($created_by ?: 'NULL') . ")
        ON DUPLICATE KEY UPDATE
            judul='$judul', tipe='$tipe', konten='$konten',
            gambar='$gambar', flyer='$flyer', waktu='$waktu', is_hero=$is_hero";

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success","message"=>"Berita disimpan","id"=>$id]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
