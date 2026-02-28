<?php
$key = bin2hex(random_bytes(32));
echo "<h2>Your Secret Key:</h2>";
echo "<textarea style='width:100%;height:100px;'>$key</textarea>";