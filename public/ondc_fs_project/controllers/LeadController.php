<?php

require 'config/database.php'; // FIXED PATH

$data = json_decode(file_get_contents("php://input"), true);

$mobile = $data['mobile_number'] ?? null;

if (!$mobile) {
    echo json_encode(["status" => "error"]);
    exit;
}

$tracking_id = uniqid("TRK_");

$stmt = $conn->prepare("INSERT INTO leads (phone, tracking_id) VALUES (?, ?)");
$stmt->bind_param("ss", $mobile, $tracking_id);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "tracking_id" => $tracking_id
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $conn->error
    ]);
}
$stmt->close();