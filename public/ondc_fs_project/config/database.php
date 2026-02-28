<?php
error_reporting(0);
ini_set('display_errors', 0);
$host = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "ondc_fs_db";
$port = 4306;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

/* Prevent function redeclare */
if (!function_exists('logError')) {
    function logError($message) {
        $logFile = __DIR__ . '/../logs/app.log';
        $date = date("Y-m-d H:i:s");
        file_put_contents($logFile, "[$date] $message\n", FILE_APPEND);
    }
}