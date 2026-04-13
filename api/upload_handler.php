<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $report_id = (int) $_POST['report_id'];
    $upload_dir = "uploads/";

    if (!is_dir($upload_dir))
        mkdir($upload_dir, 0777, true);

    if (!empty($_FILES['files'])) {
        foreach ($_FILES['files']['tmp_name'] as $key => $tmp_name) {
            $ext = pathinfo($_FILES['files']['name'][$key], PATHINFO_EXTENSION);
            $new_name = "bukti_" . $report_id . "_" . uniqid() . "." . $ext;

            if (move_uploaded_file($tmp_name, $upload_dir . $new_name)) {
                $stmt = $conn->prepare("INSERT INTO lampiran_laporan (report_id, nama_file) VALUES (?, ?)");
                $stmt->bind_param("is", $report_id, $new_name);
                $stmt->execute();
            }
        }
    }
    echo json_encode(["status" => "success"]);
}
?>