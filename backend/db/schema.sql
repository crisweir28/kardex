CREATE DATABASE IF NOT EXISTS kardex_db;
USE kardex_db;

CREATE TABLE alumnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  carrera VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE semestres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL  -- Ej: "2024-1", "2024-2"
);

CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  creditos INT NOT NULL DEFAULT 6
);

CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  materia_id INT NOT NULL,
  semestre_id INT NOT NULL,
  calificacion DECIMAL(4,1) NOT NULL,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  FOREIGN KEY (materia_id) REFERENCES materias(id),
  FOREIGN KEY (semestre_id) REFERENCES semestres(id)
);

-- ─── Datos de ejemplo ─────────────────────────────────────────────────────────
INSERT INTO semestres (nombre) VALUES ('2023-1'), ('2023-2'), ('2024-1');

INSERT INTO materias (clave, nombre, creditos) VALUES
  ('MAT101', 'Cálculo Diferencial', 8),
  ('PRG101', 'Fundamentos de Programación', 6),
  ('FIS101', 'Física I', 6),
  ('MAT201', 'Cálculo Integral', 8),
  ('PRG201', 'Programación Orientada a Objetos', 6);

-- Alumno de prueba: matrícula A001, password: 1234
-- (el hash de "1234" con bcrypt, rondas 10)
INSERT INTO alumnos (matricula, nombre, apellidos, carrera, password_hash) VALUES
  ('A001', 'Juan', 'Pérez García', 'Ingeniería en Sistemas',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkMEKo.OyDO');

INSERT INTO calificaciones (alumno_id, materia_id, semestre_id, calificacion) VALUES
  (1, 1, 1, 9.5),
  (1, 2, 1, 8.0),
  (1, 3, 1, 7.5),
  (1, 4, 2, 10.0),
  (1, 5, 2, 6.0);