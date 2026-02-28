<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');

if (!preg_match("/^[a-zA-Z ]+$/", $name)) {
    $error = "Name should contain only letters.";
} 
elseif (!preg_match("/^[0-9]{10}$/", $phone)) {
    $error = "Phone number must be exactly 10 digits.";
}

    if (!$name || !$phone) {
        $error = "All fields are required.";
    } else {

        $tracking_id = 'TRK_' . uniqid();

        $stmt = $conn->prepare("INSERT INTO leads (name, phone, tracking_id, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("sss", $name, $phone, $tracking_id);
        $stmt->execute();
        $lead_id = $stmt->insert_id;

        $stmt2 = $conn->prepare("INSERT INTO loan_applications (lead_id, status, created_at) VALUES (?, 'initiated', NOW())");
        $stmt2->bind_param("i", $lead_id);
        $stmt2->execute();

        $success = "Application Submitted Successfully!";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Apply Loan</title>
<style>
body {
    font-family: Arial;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
.card {
    background: white;
    padding: 40px;
    width: 400px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
h2 {
    text-align: center;
    margin-bottom: 20px;
}
input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border-radius: 6px;
    border: 1px solid #ccc;
}
button {
    width: 100%;
    padding: 12px;
    background: #2a5298;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
}
.success { color: green; text-align: center; }
.error { color: red; text-align: center; }
</style>
</head>
<body>

<div class="card">
<h2>Loan Application</h2>

<?php if(isset($error)) : ?>
<div class="error"><?= $error ?></div>
<?php endif; ?>

<?php if(isset($success)) : ?>
<div class="success"><?= $success ?></div>
<?php endif; ?>

<form method="POST">
<input type="text" name="name" placeholder="Full Name" required>
<input type="text" name="phone" placeholder="Mobile Number" required>
<button type="submit">Apply Now</button>
</form>

</div>

</body>
</html>