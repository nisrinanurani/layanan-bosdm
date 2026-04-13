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
$nama       = $conn->real_escape_string($input['nama'] ?? '');
$url        = $conn->real_escape_string($input['url'] ?? '');
$fungsi     = $conn->real_escape_string($input['fungsi'] ?? '');
$icon       = $conn->real_escape_string($input['icon'] ?? 'Link');
$created_by = (int)($input['created_by'] ?? 0);

$sql = "INSERT INTO semua_link (id, nama, url, fungsi, icon, created_by)
        VALUES ($id, '$nama', '$url', '$fungsi', '$icon', " . ($created_by ?: 'NULL') . ")
        ON DUPLICATE KEY UPDATE
            nama='$nama', url='$url', fungsi='$fungsi', icon='$icon'";

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success","message"=>"Link disimpan","id"=>$id]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
