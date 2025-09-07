<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$empid = trim($d['id'] ?? '');
if ($empid==='') fail('ID requerido',400);
$pdo->prepare('DELETE FROM empleados WHERE id=?')->execute([$empid]);
ok();
