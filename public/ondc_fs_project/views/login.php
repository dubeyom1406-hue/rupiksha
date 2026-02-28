<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $storedUsername = "admin";
    $storedHashedPassword = '$2y$10$qxNlLeQETLzGR2zP5RPP1.Lk9O/WBftKNgP38T71wpl0BEqNLnJqa';

    if ($username === $storedUsername &&
        password_verify($password, $storedHashedPassword)) {

        $_SESSION['admin_logged_in'] = true;
        header("Location: ?route=admin_dashboard");
        exit;
    } else {
        $error = "Invalid credentials";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Admin Login</title>
<style>
body { font-family: Arial; padding:40px; background:#f4f6f9; }
form {
    background:white;
    padding:30px;
    width:300px;
    margin:auto;
    box-shadow:0 5px 15px rgba(0,0,0,0.1);
}
input { width:100%; padding:10px; margin-bottom:10px; }
button {
    padding:10px;
    width:100%;
    background:#2c3e50;
    color:white;
    border:none;
}
.error { color:red; text-align:center; }
</style>
</head>
<body>

<form method="POST">
<h3>Admin Login</h3>

<?php if(isset($error)) : ?>
    <div class="error"><?= $error ?></div>
<?php endif; ?>

<input type="text" name="username" placeholder="Username" required>
<input type="password" name="password" placeholder="Password" required>
<button type="submit">Login</button>

</form>

</body>
</html>