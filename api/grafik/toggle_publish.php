<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
$id = $input['id'] ?? 0;
if (!$id) { echo json_encode(["status"=>"error","message"=>"ID tidak valid"]); exit; }

$r = $conn->query("SELECT published FROM grafik_data WHERE id=$id");
if (!$r || $r->num_rows === 0) { echo json_encode(["status"=>"error","message"=>"Grafik tidak ditemukan"]); exit; }
$current = (int)$r->fetch_assoc()['published'];
$new_val = $current ? 0 : 1;
$conn->query("UPDATE grafik_data SET published=$new_val, updated_at=NOW() WHERE id=$id");
echo json_encode(["status"=>"success","published"=>$new_val]);
$conn->close();
?>
