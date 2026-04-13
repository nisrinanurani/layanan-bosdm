<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$host = 'sql313.infinityfree.com';
$user = 'if0_41510707';
$pass = 'Bosdm123';
$db = 'if0_41510707_db_brin';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "DB GAGAL: " . $conn->connect_error,
        "host" => $host,
        "user" => $user,
        "db" => $db
    ]);
} else {
    echo json_encode([
        "status" => "success",
        "message" => "Koneksi database BERHASIL!",
        "server" => $conn->server_info
    ]);
    $conn->close();
}
