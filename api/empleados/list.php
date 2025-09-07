<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';

$q = trim($_GET['q'] ?? '');
if ($q !== '') {
  $stmt = $pdo->prepare('SELECT id, nombre, id AS emp_id, piso, dentro, created_at FROM empleados WHERE nombre LIKE ? OR id LIKE ? ORDER BY created_at DESC');
  $like = "%$q%";
  $stmt->execute([$like, $like]);
} else {
  $stmt = $pdo->query('SELECT id, nombre, id AS emp_id, piso, dentro, created_at FROM empleados ORDER BY created_at DESC');
}
$rows = $stmt->fetchAll();
$out = array_map(function($r){
  return ['nombre'=>$r['nombre'], 'id'=>$r['emp_id'], 'piso'=>intval($r['piso']), 'dentro'=>boolval($r['dentro'])];
}, $rows);
ok($out);
