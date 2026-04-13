<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
$id = (int)($input['id'] ?? 0);
if (!$id) { echo json_encode(["status"=>"error","message"=>"ID tidak valid"]); exit; }

// Ambil nilai is_hero saat ini
$r = $conn->query("SELECT is_hero FROM berita WHERE id=$id");
if (!$r || $r->num_rows === 0) { echo json_encode(["status"=>"error","message"=>"Berita tidak ditemukan"]); exit; }
$current = (int)$r->fetch_assoc()['is_hero'];

// Cek batas 10 hero
if (!$current) {
    $count = $conn->query("SELECT COUNT(*) as c FROM berita WHERE is_hero=1")->fetch_assoc()['c'];
    if ($count >= 10) { echo json_encode(["status"=>"error","message"=>"Maksimal 10 konten beranda"]); exit; }
}

$new_val = $current ? 0 : 1;
$conn->query("UPDATE berita SET is_hero=$new_val WHERE id=$id");
echo json_encode(["status"=>"success","is_hero"=>$new_val]);
$conn->close();
?>
