<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'koneksi.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $uid = (int) $_GET['user_id'];
    $role = $_GET['role'];
    $query = ($role == 'superadmin')
        ? "SELECT l.*, u.nama_depan FROM laporan_kak l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC"
        : "SELECT * FROM laporan_kak WHERE user_id = $uid ORDER BY created_at DESC";

    $res = $conn->query($query);
    $data = $res->fetch_all(MYSQLI_ASSOC);

    foreach ($data as &$row) {
        $rid = $row['id'];
        $files = $conn->query("SELECT nama_file FROM lampiran_laporan WHERE report_id = $rid");
        $row['attachments'] = $files->fetch_all(MYSQLI_ASSOC);
    }
    echo json_encode($data);
} else if ($method == 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conn->prepare("INSERT INTO laporan_kak (user_id, tipe, nama_terlapor, nip_terlapor, satker_terlapor, subject, deskripsi, incident_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssss", $d['user_id'], $d['tipe'], $d['nama_terlapor'], $d['nip_terlapor'], $d['satker_terlapor'], $d['subject'], $d['deskripsi'], $d['incident_date']);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "report_id" => $conn->insert_id]);
    } else {
        echo json_encode(["status" => "error"]);
    }
} else if ($method == 'PATCH') {
    $d = json_decode(file_get_contents("php://input"), true);
    $report_id = (int) $d['report_id'];
    $stage = $d['stage'];

    $stmt = $conn->prepare("UPDATE laporan_kak SET stage = ?, verdict = ?, official_response = ? WHERE id = ?");
    $stmt->bind_param("sssi", $stage, $d['verdict'], $d['response'], $report_id);

    if ($stmt->execute()) {
        // --- LOGIKA NOTIFIKASI OTOMATIS ---
        $rep_res = $conn->query("SELECT user_id, subject FROM laporan_kak WHERE id = $report_id");
        $reporter = $rep_res->fetch_assoc();
        $uid_pelapor = $reporter['user_id'];
        $subjek = $reporter['subject'];

        $msg = "Status laporan '$subjek' diperbarui menjadi: $stage";
        $stmt_notif = $conn->prepare("INSERT INTO notifikasi (user_id, pesan, kategori) VALUES (?, ?, 'LAPORAN')");
        $stmt_notif->bind_param("is", $uid_pelapor, $msg);
        $stmt_notif->execute();

        echo json_encode(["status" => "success"]);
    }
}
?>