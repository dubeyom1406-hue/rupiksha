<?php
require_once 'LoanController.php';
require_once '../config/database.php';

$controller = new LoanController();
$phone = $_GET['phone'] ?? '';

if (!$phone) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Phone number required"]);
    exit;
}

$data = $controller->getLoanByPhone($phone);

if (!$data) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "No record found"]);
    exit;
}

header('Content-Type: application/json');
echo json_encode(["status" => "success", "data" => $data]);
exit;