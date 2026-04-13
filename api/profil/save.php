<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$input = json_decode(file_get_contents("php://input"), true);
$section_key = $conn->real_escape_string($input['section_key'] ?? '');
$value_text  = $conn->real_escape_string($input['value_text'] ?? '');
$updated_by  = (int)($input['updated_by'] ?? 0);

if (!$section_key) { echo json_encode(["status"=>"error","message"=>"Key tidak valid"]); exit; }

$sql = "INSERT INTO profil_biro (section_key, value_text, updated_by)
        VALUES ('$section_key', '$value_text', " . ($updated_by ?: 'NULL') . ")
        ON DUPLICATE KEY UPDATE value_text='$value_text', updated_by=" . ($updated_by ?: 'NULL') . ", updated_at=NOW()";

if ($conn->query($sql)) {
    echo json_encode(["status"=>"success"]);
} else {
    echo json_encode(["status"=>"error","message"=>$conn->error]);
}
$conn->close();
?>
