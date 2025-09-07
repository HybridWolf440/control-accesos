-- Schema para control_accesos
CREATE DATABASE IF NOT EXISTS control_accesos CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE control_accesos;

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NULL,
  role ENUM('admin','recepcion','seguridad','rh') NOT NULL DEFAULT 'recepcion',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Empleados
CREATE TABLE IF NOT EXISTS empleados (
  auto INT AUTO_INCREMENT PRIMARY KEY,
  id VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  piso INT NOT NULL,
  dentro TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitas
CREATE TABLE IF NOT EXISTS visitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  empresa VARCHAR(120) DEFAULT '',
  anfitrion VARCHAR(120) NOT NULL,
  piso INT NOT NULL,
  dentro TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  fecha DATE NOT NULL,
  piso INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo VARCHAR(64) NOT NULL,
  detalle VARCHAR(255) NOT NULL
);

-- Datos demo
INSERT IGNORE INTO users (username, password_hash, role) VALUES
('admin', NULL, 'admin'),
('recepcion', NULL, 'recepcion'),
('seguridad', NULL, 'seguridad'),
('rh', NULL, 'rh');
