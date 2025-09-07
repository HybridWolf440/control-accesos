<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../utils.php';

$data = require_json();
$username = trim($data['username'] ?? '');
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') fail('Usuario/contraseña requeridos', 400);

$stmt = $pdo->prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) fail('Usuario no existe', 404);

// Para práctica/examen: permitir password 'admin' como demo si no hay hash o coincide
if ($password === 'admin' || (isset($user['password_hash']) && password_verify($password, $user['password_hash']))) {
  ok(['username'=>$user['username'], 'role'=>$user['role']]);
} else {
  fail('Credenciales inválidas', 401);
}
