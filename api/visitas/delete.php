<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$id = intval($d['id'] ?? 0);
if ($id<=0) fail('ID requerido',400);
$pdo->prepare('DELETE FROM visitas WHERE id=?')->execute([$id]);
ok();
