<?php
// Config de base de datos: ajusta a tus credenciales
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'control_accesos';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';   // <- en XAMPP root va sin contraseña

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

try {
  $pdo = new PDO(
    "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
    $DB_USER, $DB_PASS,
    [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC ]
  );
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false, 'error'=>'DB connection failed', 'detail'=>$e->getMessage()]);
  exit;
}
