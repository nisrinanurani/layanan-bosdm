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

if ($conn->query("DELETE FROM grafik_data WHERE id=$id")) {
    echo json_encode(["status"=>"success","message"=>"Grafik dihapus"]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
