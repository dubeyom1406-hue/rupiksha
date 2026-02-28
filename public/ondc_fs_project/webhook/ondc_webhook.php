<?php
require_once '../config/database.php';
$secretKey = "b49fe7cd4bf35a9c7ca6c540ffd485290a04f51abc2619a70d51c6ec73bec35d";

// if accessed via browser or non-POST, show a friendly description
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Webhook Documentation | ONDC Financial</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Outfit', sans-serif; background-color: #f8fafc; }
            .premium-card { background: white; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
            .accent-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
            pre { background: #0f172a !important; color: #e2e8f0 !important; }
        </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-6">
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[50%] -right-[10%] w-[70%] h-[70%] bg-indigo-50 rounded-full blur-[120px] opacity-40"></div>
            <div class="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-50 rounded-full blur-[120px] opacity-40"></div>
        </div>

        <div class="max-w-3xl w-full premium-card rounded-[3rem] p-10 md:p-14 relative z-10">
            <div class="flex items-center gap-5 mb-10">
                <div class="w-14 h-14 rounded-2xl accent-gradient flex items-center justify-center shadow-lg shadow-indigo-200">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Developer <span class="text-indigo-600">Portal</span></h1>
                    <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Webhook Endpoint Configuration</p>
                </div>
            </div>

            <div class="space-y-8">
                <div class="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] leading-relaxed text-slate-600">
                    This endpoint is designed to receive real-time loan application updates from the ONDC network. 
                    All incoming requests must be <span class="text-indigo-600 font-bold uppercase text-xs px-2 py-1 bg-indigo-50 rounded-lg">HTTP POST</span> with valid JSON payloads and security headers.
                </div>

                <div class="space-y-4">
                    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        Security Authentication
                    </h2>
                    <div class="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-bold text-slate-400">HEADER:</span>
                            <code class="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-mono">X-API-KEY</code>
                        </div>
                        <div class="flex items-center gap-2 flex-grow max-w-xs md:max-w-none">
                            <span class="text-xs font-bold text-slate-400">SECRET:</span>
                            <code class="truncate text-xs text-indigo-600 font-mono font-bold"><?= $secretKey ?></code>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                        Integration Sandbox (cURL)
                    </h2>
                    <pre class="p-8 rounded-[2rem] overflow-x-auto text-sm font-mono shadow-2xl">
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: <?= $secretKey ?>" \
  -d '{
    "tracking_id": "TRK_67be017831d8e",
    "referenceId": "REF_HDFC_9921",
    "status": "approved",
    "amount": "150000",
    "lender_name": "HDFC Bank",
    "interest_rate": "10.5%"
  }' \
  <?= (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]" ?></pre>
                </div>

                <div class="pt-10 border-t border-slate-100 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gateway Status: Active</span>
                    </div>
                    <a href="?route=admin_dashboard" class="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-all flex items-center gap-2">
                        Go to Dashboard
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
    </body>
    </html>
    <?php
    exit;
}

$incomingKey = $_SERVER['HTTP_X_API_KEY'] ?? '';

if ($incomingKey !== $secretKey) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}

header("Content-Type: application/json");

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Log raw webhook
logError("Webhook Received: " . $input);

if (!$data) {
    logError("Invalid JSON received");
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

$trackingId = $data['tracking_id'] ?? null;
$referenceId = $data['referenceId'] ?? null;
$status = $data['status'] ?? null;
$offerAmount = $data['amount'] ?? null;
$lenderName = $data['lender_name'] ?? null;
$interestRate = $data['interest_rate'] ?? null;

if (!$trackingId) {
    logError("Tracking ID missing");
    echo json_encode(["status" => "error", "message" => "Tracking ID missing"]);
    exit;
}

// Find lead
$stmt = $conn->prepare("SELECT id FROM leads WHERE tracking_id = ?");
$stmt->bind_param("s", $trackingId);
$stmt->execute();
$result = $stmt->get_result();
$lead = $result->fetch_assoc();

if (!$lead) {
    logError("Lead not found for tracking ID: " . $trackingId);
    echo json_encode(["status" => "error", "message" => "Lead not found"]);
    exit;
}

$leadId = $lead['id'];

// Update loan application
$stmt2 = $conn->prepare("
    UPDATE loan_applications 
    SET reference_id = ?, 
        status = ?, 
        offer_amount = ?, 
        lender_name = ?, 
        interest_rate = ?, 
        webhook_response = ?, 
        updated_at = NOW()
    WHERE lead_id = ?
");

$webhookResponse = json_encode($data);

$stmt2->bind_param(
    "ssssssi",
    $referenceId,
    $status,
    $offerAmount,
    $lenderName,
    $interestRate,
    $webhookResponse,
    $leadId
);

$stmt2->execute();

logError("Loan updated for tracking ID: " . $trackingId);

echo json_encode(["status" => "success", "message" => "Loan updated successfully"]);