<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';

$fecha = $_GET['fecha'] ?? date('Y-m-d');
$out = [];
for ($p=1; $p<=5; $p++){
  // Cuenta dentro por piso (empleados + visitas) al momento actual (simplificado)
  $stmt = $pdo->prepare('SELECT COUNT(*) c FROM empleados WHERE dentro=1 AND piso=?');
  $stmt->execute([$p]); $c1 = intval($stmt->fetch()['c']);
  $stmt = $pdo->prepare('SELECT COUNT(*) c FROM visitas WHERE dentro=1 AND piso=?');
  $stmt->execute([$p]); $c2 = intval($stmt->fetch()['c']);
  $out[] = ['Piso'=>$p, 'Personas'=>$c1+$c2];
}
ok($out);
