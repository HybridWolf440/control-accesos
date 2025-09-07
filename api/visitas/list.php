<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';

$stmt = $pdo->query('SELECT id, nombre, empresa, anfitrion, piso, dentro, created_at FROM visitas ORDER BY created_at DESC');
$rows = $stmt->fetchAll();
$out = array_map(function($v){
  return ['id'=>intval($v['id']), 'nombre'=>$v['nombre'], 'empresa'=>$v['empresa'], 'anfitrion'=>$v['anfitrion'], 'piso'=>intval($v['piso']), 'dentro'=>boolval($v['dentro'])];
}, $rows);
ok($out);
