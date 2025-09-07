<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$id = intval($d['id'] ?? 0);
if ($id<=0) fail('ID requerido',400);

$pdo->beginTransaction();
$stmt = $pdo->prepare('SELECT dentro FROM visitas WHERE id = ? FOR UPDATE');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row){ $pdo->rollBack(); fail('Visita no existe',404); }
$new = $row['dentro'] ? 0 : 1;
$pdo->prepare('UPDATE visitas SET dentro=? WHERE id=?')->execute([$new, $id]);
$pdo->prepare('INSERT INTO logs (ts, tipo, detalle) VALUES (NOW(), ?, ?)')->execute([$new? 'visita_entrada':'visita_salida', 'V'+$id]);
$pdo->commit();
ok(['id'=>intval($id), 'dentro'=> (bool)$new]);
