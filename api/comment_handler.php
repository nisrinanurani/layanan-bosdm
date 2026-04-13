<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'koneksi.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $thread_id = (int) $_GET['thread_id'];
    $query = "SELECT fc.*, u.nama_depan, u.nama_belakang 
              FROM forum_comments fc 
              JOIN users u ON fc.user_id = u.id 
              WHERE fc.thread_id = ? 
              ORDER BY fc.created_at ASC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $thread_id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
} else if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $thread_id = (int) $data['thread_id'];
    $user_id = (int) $data['user_id'];
    $comment = mysqli_real_escape_string($conn, $data['comment']);
    $parent_id = isset($data['parent_id']) ? (int) $data['parent_id'] : null;

    $stmt = $conn->prepare("INSERT INTO forum_comments (thread_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iisi", $thread_id, $user_id, $comment, $parent_id);

    if ($stmt->execute()) {
        // --- LOGIKA NOTIFIKASI OTOMATIS ---
        $owner_res = $conn->query("SELECT user_id, title FROM forum_threads WHERE id = $thread_id");
        $owner = $owner_res->fetch_assoc();
        $owner_id = $owner['user_id'];
        $judul = $owner['title'];

        if ($user_id != $owner_id) {
            $msg = "Seseorang membalas diskusi kamu: '$judul'";
            $stmt_notif = $conn->prepare("INSERT INTO notifikasi (user_id, pesan, kategori) VALUES (?, ?, 'FORUM')");
            $stmt_notif->bind_param("is", $owner_id, $msg);
            $stmt_notif->execute();
        }

        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}
?>