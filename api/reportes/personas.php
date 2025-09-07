<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';

$desde = $_GET['desde'] ?? date('Y-m-d');
$hasta = $_GET['hasta'] ?? date('Y-m-d');
$stmt = $pdo->prepare('SELECT ts, tipo, detalle FROM logs WHERE DATE(ts) BETWEEN ? AND ? ORDER BY ts DESC');
$stmt->execute([$desde, $hasta]);
$rows = $stmt->fetchAll();
$out = array_map(function($r){
  $ts = $r['ts'];
  return ['Fecha'=>substr($ts,0,10), 'Hora'=>substr($ts,11,8), 'Tipo'=>$r['tipo'], 'Detalle'=>$r['detalle']];
}, $rows);
ok($out);
