<?php
// ============================================================
//  api/profil/get.php — Ambil semua section profil biro
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$result = $conn->query("SELECT section_key, value_text FROM profil_biro");
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[$row['section_key']] = $row['value_text'];
}
echo json_encode(["status" => "success", "data" => $data]);
$conn->close();
?>
