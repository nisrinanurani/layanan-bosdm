<?php
// ============================================================
//  api/dokumen/get.php — Ambil semua dokumen
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$result = $conn->query("SELECT * FROM dokumen ORDER BY created_at DESC");
$rows = [];
while ($row = $result->fetch_assoc()) { $rows[] = $row; }
echo json_encode(["status" => "success", "data" => $rows]);
$conn->close();
?>
