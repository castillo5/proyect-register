-- Inicialización de base de datos para el proyecto de empleados

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS postobon_01;

-- Usar la base de datos
USE postobon_01;

-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Lastname VARCHAR(100) NOT NULL,
    Lastname2 VARCHAR(100),
    Email VARCHAR(150) UNIQUE,
    Charge VARCHAR(100),
    City VARCHAR(100),
    Salary DECIMAL(10,2),
    Age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear usuario específico para la aplicación (opcional, más seguro)
-- CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'app_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON postobon_01.* TO 'app_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verificar que la tabla se creó correctamente
DESCRIBE employees;
