<?php
// allow turning on verbose error reporting with ?debug=1
$debug = isset($_GET['debug']) && $_GET['debug'] === '1';
if ($debug) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
}

$phone = trim($_GET['phone'] ?? '');

if ($phone === '') {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Track Application | ONDC Financial</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Outfit', sans-serif; background-color: #f8fafc; }
            .premium-card { background: white; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
            .accent-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
            .input-focus:focus { ring: 2px; ring-color: #6366f1; border-color: #6366f1; }
        </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-4">
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
            <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div class="max-w-md w-full premium-card rounded-[2.5rem] p-10 relative z-10">
            <div class="flex justify-center mb-8">
                <div class="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center shadow-lg shadow-indigo-200">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
            </div>
            
            <div class="text-center mb-10">
                <h1 class="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Track Your Loan</h1>
                <p class="text-slate-500 text-sm leading-relaxed px-4">See your application progress in real-time. Just enter your registered mobile number below.</p>
            </div>

            <form method="get" action="?route=loan_status" class="space-y-5">
                <input type="hidden" name="route" value="loan_status" />
                <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input type="text" name="phone" placeholder="Enter 10-digit number" required maxlength="10"
                           class="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium">
                </div>
                <button type="submit" class="w-full h-14 accent-gradient text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-200">
                    Check Status
                </button>
            </form>

            <div class="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-6 opacity-60">
                <img src="https://img.icons8.com/color/48/visa.png" class="h-5 grayscale hover:grayscale-0 transition-all" alt="visa">
                <img src="https://img.icons8.com/color/48/mastercard.png" class="h-5 grayscale hover:grayscale-0 transition-all" alt="mastercard">
                <img src="https://img.icons8.com/color/48/pci-compliant.png" class="h-5 grayscale hover:grayscale-0 transition-all" alt="pci">
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Logic section stays same as functional
$stmt = $conn->prepare("
    SELECT l.phone, la.reference_id, la.status, 
           la.offer_amount, la.lender_name, 
           la.interest_rate, la.updated_at
    FROM loan_applications la
    JOIN leads l ON la.lead_id = l.id
    WHERE l.phone = ?
    ORDER BY la.id DESC LIMIT 1
");

$stmt->bind_param("s", $phone);
$stmt->execute();
$data = $stmt->get_result()->fetch_assoc();

if (!$data) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Not Found | ONDC FS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body class="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-['Outfit']">
        <div class="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl text-center">
            <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">!</div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">Record Not Found</h2>
            <p class="text-slate-500 mb-8">We couldn't find any active loan application for <strong><?= htmlspecialchars($phone) ?></strong>.</p>
            <a href="?route=loan_status" class="inline-block py-4 px-10 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">Go Back</a>
        </div>
    </body>
    </html>
    <?php
    exit;
}

$status = strtoupper($data['status'] ?? 'UNKNOWN');
$statusTheme = 'bg-slate-100 text-slate-600';
$statusIcon = '🕒';

if ($status === 'APPROVED') { $statusTheme = 'bg-emerald-100 text-emerald-700'; $statusIcon = '✅'; }
elseif ($status === 'REJECTED') { $statusTheme = 'bg-rose-100 text-rose-700'; $statusIcon = '❌'; }
elseif (in_array($status, ['PENDING', 'INITIATED', 'PROCESSING'])) { $statusTheme = 'bg-indigo-100 text-indigo-700'; $statusIcon = '⚡'; }

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status | ONDC FS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #f8fafc; }
        .premium-card { background: white; border: 1px solid rgba(0,0,0,0.03); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.05); }
        .detail-card { background: #fdfdfd; border: 1px solid rgba(0,0,0,0.04); }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-lg w-full premium-card rounded-[3rem] p-10 md:p-14 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-12 -mt-12"></div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Application <span class="text-indigo-600">Status</span></h1>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Ref ID: <?= $data['reference_id'] ?: 'TBD' ?></p>
            </div>
            <div class="<?= $statusTheme ?> px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 whitespace-nowrap shadow-sm">
                <span><?= $statusIcon ?></span>
                <?= $status ?>
            </div>
        </div>

        <div class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
                <div class="detail-card p-6 rounded-[2rem]">
                    <p class="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Customer</p>
                    <p class="text-slate-900 font-bold">Verified User</p>
                    <p class="text-slate-500 text-sm"><?= htmlspecialchars($data['phone']) ?></p>
                </div>
                <div class="detail-card p-6 rounded-[2rem]">
                    <p class="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Last Update</p>
                    <p class="text-slate-900 font-bold"><?= date("M d", strtotime($data['updated_at'])) ?></p>
                    <p class="text-slate-500 text-sm"><?= date("h:i A", strtotime($data['updated_at'])) ?></p>
                </div>
            </div>

            <?php if($data['offer_amount']) : ?>
                <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div class="relative z-10">
                        <div class="flex items-center gap-2 mb-6">
                            <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs">🏦</div>
                            <span class="text-indigo-300 text-xs font-bold uppercase tracking-widest"><?= $data['lender_name'] ?></span>
                        </div>
                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Approved Loan</p>
                                <p class="text-4xl font-bold">₹<?= number_format($data['offer_amount']) ?></p>
                            </div>
                            <div class="text-right">
                                <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">ROI (p.a)</p>
                                <p class="text-2xl font-bold text-indigo-400"><?= $data['interest_rate'] ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <div class="detail-card p-8 rounded-[2.5rem] border-dashed border-2 flex flex-col items-center text-center">
                    <div class="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-xl mb-4">⌛</div>
                    <p class="text-slate-900 font-bold">Awaiting Lender Quote</p>
                    <p class="text-slate-400 text-xs mt-1">We've shared your request with multiple ONDC partner banks.</p>
                </div>
            <?php endif; ?>
        </div>

        <div class="mt-12 flex flex-col items-center gap-6">
            <a href="?route=loan_status" class="py-4 px-10 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z"/></svg>
                Track Another
            </a>
            <div class="flex items-center gap-2">
                <div class="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Secure real-time sync with ONDC</span>
            </div>
        </div>
    </div>
</body>
</html>