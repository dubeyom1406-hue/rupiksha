<?php
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require_once 'config/database.php';

$route = $_GET['route'] ?? '';

switch($route) {

    case 'apply_loan':
        require 'views/apply_loan.php';
    break;

    case 'loan_status':
        require 'views/loan_status.php';
    break;

    case 'loan_sdk':
        require 'views/loan_sdk.php';
    break;

    case 'admin_dashboard':
        require 'views/admin_dashboard.php';
    break;

    case 'login':
        require 'views/login.php';
    break;

    case 'logout':
        session_destroy();
        header("Location: ?route=login");
        exit;
    break;

    default:
        require 'views/apply_loan.php';
    break;
}