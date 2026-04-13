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
$title      = $conn->real_escape_string($input['title'] ?? '');
$type       = $conn->real_escape_string($input['type'] ?? 'bar');
$data_json  = $conn->real_escape_string(json_encode($input['data'] ?? []));
$config_json= $conn->real_escape_string(json_encode($input['config'] ?? []));
$published  = isset($input['published']) ? (int)$input['published'] : 0;
$created_by = (int)($input['created_by'] ?? 0);

$sql = "INSERT INTO grafik_data (id, title, type, data_json, config_json, published, created_by)
        VALUES ($id, '$title', '$type', '$data_json', '$config_json', $published, " . ($created_by ?: 'NULL') . ")
        ON DUPLICATE KEY UPDATE
            title='$title', type='$type', data_json='$data_json',
            config_json='$config_json', published=$published, updated_at=NOW()";

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success","message"=>"Grafik disimpan","id"=>$id]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
