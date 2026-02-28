<?php

$hash = '$2y$10$qxNlLeQETLzGR2zP5RPP1.Lk9O/WBftKNgP38T71wpl0BEqNLnJqa';

var_dump(password_verify("admin123", $hash));