<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

// AMBIL SEMUA THREAD + HITUNG JUMLAH KOMEN
if ($method == 'GET') {
    $query = "SELECT ft.*, u.nama_depan, u.nama_belakang,
              (SELECT COUNT(*) FROM forum_comments WHERE thread_id = ft.id) as comment_count
              FROM forum_threads ft 
              JOIN users u ON ft.user_id = u.id 
              ORDER BY ft.created_at DESC";

    $result = $conn->query($query);
    $threads = [];
    while ($row = $result->fetch_assoc()) {
        $threads[] = $row;
    }
    echo json_encode($threads);
}

// BUAT PERTANYAAN BARU
else if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = (int) $data['user_id'];
    $title = mysqli_real_escape_string($conn, $data['title']);
    $content = mysqli_real_escape_string($conn, $data['content']);
    $hashtags = mysqli_real_escape_string($conn, $data['hashtags']);

    $stmt = $conn->prepare("INSERT INTO forum_threads (user_id, title, content, hashtags) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $title, $content, $hashtags);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

// UPDATE LIKE
else if ($method == 'PATCH') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = (int) $data['thread_id'];
    $conn->query("UPDATE forum_threads SET likes = likes + 1 WHERE id = $id");
    echo json_encode(["status" => "success"]);
}
?>