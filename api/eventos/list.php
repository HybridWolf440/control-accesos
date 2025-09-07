<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';

$stmt = $pdo->query('SELECT id, nombre, fecha, piso FROM eventos ORDER BY fecha DESC, id DESC');
$rows = $stmt->fetchAll();
$out = array_map(function($e){
  return ['id'=>intval($e['id']), 'nombre'=>$e['nombre'], 'fecha'=>$e['fecha'], 'piso'=>intval($e['piso'])];
}, $rows);
ok($out);
