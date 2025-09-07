<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$nombre = trim($d['nombre'] ?? '');
$fecha = trim($d['fecha'] ?? '');
$piso = intval($d['piso'] ?? 0);
if ($nombre==='' || $fecha==='' || $piso<=0) fail('Datos incompletos',400);

$stmt = $pdo->prepare('INSERT INTO eventos (nombre, fecha, piso) VALUES (?,?,?)');
$stmt->execute([$nombre, $fecha, $piso]);
$id = $pdo->lastInsertId();
ok(['id'=>intval($id)]);
