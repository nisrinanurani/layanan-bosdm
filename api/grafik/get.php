<?php
// ============================================================
//  api/grafik/get.php — Ambil semua data grafik
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$result = $conn->query("SELECT * FROM grafik_data ORDER BY created_at DESC");
$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['data']    = json_decode($row['data_json'], true);
    $row['config']  = json_decode($row['config_json'], true);
    $row['published'] = (bool) $row['published'];
    unset($row['data_json'], $row['config_json']);
    $rows[] = $row;
}
echo json_encode(["status" => "success", "data" => $rows]);
$conn->close();
?>
