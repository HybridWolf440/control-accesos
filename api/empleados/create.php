<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$nombre = trim($d['nombre'] ?? '');
$empid = trim($d['id'] ?? '');
$piso = intval($d['piso'] ?? 0);
if ($nombre==='' || $empid==='' || $piso<=0) fail('Datos incompletos',400);

$stmt = $pdo->prepare('SELECT id FROM empleados WHERE id = ?');
$stmt->execute([$empid]);
if ($stmt->fetch()) fail('ID ya existe', 409);

$stmt = $pdo->prepare('INSERT INTO empleados (id, nombre, piso, dentro) VALUES (?, ?, ?, 0)');
$stmt->execute([$empid, $nombre, $piso]);
ok(['id'=>$empid]);
