<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$id = intval($d['id'] ?? 0);
if ($id<=0) fail('ID requerido',400);
$pdo->prepare('DELETE FROM eventos WHERE id=?')->execute([$id]);
ok();
