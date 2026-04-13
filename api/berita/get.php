<?php
// ============================================================
//  api/berita/get.php — Ambil semua data berita
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$result = $conn->query("SELECT * FROM berita ORDER BY waktu DESC");
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode(["status" => "success", "data" => $rows]);
$conn->close();
?>
