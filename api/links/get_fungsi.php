<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once '../koneksi.php';

$result = $conn->query("SELECT nama, warna FROM fungsi_link ORDER BY id ASC");
$rows = [];
while ($row = $result->fetch_assoc()) { $rows[] = $row; }
echo json_encode(["status"=>"success","data"=>$rows]);
$conn->close();
?>
