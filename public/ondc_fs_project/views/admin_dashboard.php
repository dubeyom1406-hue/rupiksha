<?php
if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: ?route=login");
    exit;
}

$result = $conn->query("
    SELECT l.name, l.phone, la.reference_id, la.status,
           la.offer_amount, la.lender_name,
           la.interest_rate, la.updated_at
    FROM loan_applications la
    JOIN leads l ON la.lead_id = l.id
    ORDER BY la.id DESC
");

$stats = [
    'total' => 0,
    'approved' => 0,
    'pending' => 0,
    'rejected' => 0
];

$dataRows = [];

while($row = $result->fetch_assoc()) {
    $stats['total']++;
    $status = strtolower($row['status']);

    if ($status === 'approved') $stats['approved']++;
    if ($status === 'pending') $stats['pending']++;
    if ($status === 'rejected') $stats['rejected']++;

    $dataRows[] = $row;
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Admin Dashboard</title>
<style>
body {
    font-family: Arial;
    background: #f4f6f9;
    padding: 30px;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.cards {
    display: flex;
    gap: 15px;
    margin: 20px 0;
}
.card {
    flex: 1;
    padding: 20px;
    border-radius: 10px;
    color: white;
    font-weight: bold;
    text-align: center;
}
.total { background: #3498db; }
.approved { background: #2ecc71; }
.pending { background: #f39c12; }
.rejected { background: #e74c3c; }

table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}
th, td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: center;
}
th {
    background: #2c3e50;
    color: white;
}
.status-approved { color: #2ecc71; font-weight: bold; }
.status-rejected { color: #e74c3c; font-weight: bold; }
.status-pending { color: #f39c12; font-weight: bold; }
.logout {
    text-decoration: none;
    background: #2c3e50;
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
}
</style>
</head>
<body>

<div class="header">
<h2>Loan Dashboard</h2>
<a class="logout" href="?route=logout">Logout</a>
</div>

<div class="cards">
<div class="card total">Total<br><?= $stats['total'] ?></div>
<div class="card approved">Approved<br><?= $stats['approved'] ?></div>
<div class="card pending">Pending<br><?= $stats['pending'] ?></div>
<div class="card rejected">Rejected<br><?= $stats['rejected'] ?></div>
</div>

<table>
<tr>
<th>Name</th>
<th>Phone</th>
<th>Reference</th>
<th>Status</th>
<th>Offer</th>
<th>Lender</th>
<th>Interest</th>
<th>Updated</th>
</tr>

<?php foreach($dataRows as $row) :
$statusClass = "status-" . strtolower($row['status']);
?>
<tr>
<td><?= htmlspecialchars($row['name']) ?></td>
<td><?= htmlspecialchars($row['phone']) ?></td>
<td><?= htmlspecialchars($row['reference_id']) ?></td>
<td class="<?= $statusClass ?>"><?= strtoupper($row['status']) ?></td>
<td><?= $row['offer_amount'] ? '₹'.$row['offer_amount'] : '-' ?></td>
<td><?= $row['lender_name'] ?? '-' ?></td>
<td><?= $row['interest_rate'] ?? '-' ?></td>
<td><?= $row['updated_at'] ?></td>
</tr>
<?php endforeach; ?>

</table>

</body>
</html>