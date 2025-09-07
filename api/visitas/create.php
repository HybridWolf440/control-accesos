<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$nombre = trim($d['nombre'] ?? '');
$empresa = trim($d['empresa'] ?? '');
$anfitrion = trim($d['anfitrion'] ?? '');
$piso = intval($d['piso'] ?? 0);
if ($nombre==='' || $anfitrion==='' || $piso<=0) fail('Datos incompletos',400);

$stmt = $pdo->prepare('INSERT INTO visitas (nombre, empresa, anfitrion, piso, dentro) VALUES (?,?,?,?,1)');
$stmt->execute([$nombre, $empresa, $anfitrion, $piso]);

$id = $pdo->lastInsertId();
$pdo->prepare('INSERT INTO logs (ts, tipo, detalle) VALUES (NOW(), ?, ?)')->execute(['visita_entrada', 'V'+$id]);
ok(['id'=>intval($id)]);
