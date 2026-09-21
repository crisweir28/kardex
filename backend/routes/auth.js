const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../db/conection');
const router  = express.Router();

// ─── LOGIN ALUMNO ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { matricula, password } = req.body;
  if (!matricula || !password)
    return res.status(400).json({ error: 'Matrícula y contraseña son requeridas.' });

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellidos, carrera, password_hash FROM alumnos WHERE matricula = ?',
      [matricula]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Matrícula o contraseña incorrectos.' });

    const alumno = rows[0];
    const valida = await bcrypt.compare(password, alumno.password_hash);
    if (!valida)
      return res.status(401).json({ error: 'Matrícula o contraseña incorrectos.' });

    req.session.alumnoId  = alumno.id;
    req.session.matricula = matricula;

    res.json({
      mensaje: 'Login exitoso',
      alumno: { nombre: alumno.nombre, 
                apellidos: alumno.apellidos, 
                carrera: alumno.carrera, 
                matricula }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password)
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });

  try {
    const [rows] = await pool.query(
      'SELECT id, usuario, password_hash FROM admins WHERE usuario = ?',
      [usuario]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

    const admin  = rows[0];
    const valida = await bcrypt.compare(password, admin.password_hash);
    if (!valida)
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

    req.session.adminId  = admin.id;
    req.session.usuario  = admin.usuario;

    res.json({ mensaje: 'Login admin exitoso', usuario: admin.usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── LOGIN DOCENTE ────────────────────────────────────────────────────────────
router.post('/docente/login', async (req, res) => {
  const { matricula, password } = req.body;
  if (!matricula || !password)
    return res.status(400).json({ error: 'Matrícula y contraseña son requeridas.' });

  try {
    const [rows] = await pool.query(
      'SELECT id, matricula, nombre, apellidos, email, password_hash FROM docentes WHERE matricula = ?',
      [matricula]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Matrícula o contraseña incorrectos.' });

    const docente = rows[0];
    const valida  = await bcrypt.compare(password, docente.password_hash);
    if (!valida)
      return res.status(401).json({ error: 'Matrícula o contraseña incorrectos.' });

    req.session.docenteId = docente.id;
    req.session.matricula = docente.matricula;

    res.json({
      mensaje: 'Login docente exitoso',
      docente: {
        matricula: docente.matricula,
        nombre:    docente.nombre,
        apellidos: docente.apellidos,
        email:     docente.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'No se pudo cerrar sesión.' });
    res.json({ mensaje: 'Sesión cerrada correctamente.' });
  });
});

module.exports = router;