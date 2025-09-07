<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';
$d = require_json();

$empid = trim($d['id'] ?? '');
if ($empid==='') fail('ID requerido',400);

$pdo->beginTransaction();
$stmt = $pdo->prepare('SELECT dentro FROM empleados WHERE id = ? FOR UPDATE');
$stmt->execute([$empid]);
$row = $stmt->fetch();
if (!$row){ $pdo->rollBack(); fail('Empleado no existe',404); }
$new = $row['dentro'] ? 0 : 1;
$pdo->prepare('UPDATE empleados SET dentro=? WHERE id=?')->execute([$new, $empid]);

$pdo->prepare('INSERT INTO logs (ts, tipo, detalle) VALUES (NOW(), ?, ?)')->execute(['empleado_'+($new? 'entrada':'salida'), 'ID '+$empid]);
$pdo->commit();
ok(['id'=>$empid, 'dentro'=> (bool)$new]);
