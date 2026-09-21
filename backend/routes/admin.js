const express        = require('express');
const bcrypt         = require('bcryptjs');
const pool           = require('../db/conection');
const { requireAdmin } = require('../middleware/auth');
const router         = express.Router();

// Todas las rutas de este archivo requieren admin
router.use(requireAdmin);

// ─── ALUMNOS ──────────────────────────────────────────────────────────────────

router.get('/alumnos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_alumnos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alumnos.' });
  }
});

router.post('/alumnos', async (req, res) => {
  const { matricula, nombre, apellidos, carrera, password } = req.body;
  if (!matricula || !nombre || !apellidos || !password)
    return res.status(400).json({ error: 'Faltan campos requeridos.' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('CALL sp_crear_alumno(?, ?, ?, ?, ?)',
      [matricula, nombre, apellidos, carrera || null, hash]);
    res.status(201).json({ mensaje: `Alumno ${matricula} creado correctamente.` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: `La matrícula ${matricula} ya existe.` });
    res.status(500).json({ error: 'Error al crear alumno.' });
  }
});

router.delete('/alumnos/:id', async (req, res) => {
  try {
    await pool.query('CALL sp_eliminar_alumno(?)', [req.params.id]);
    res.json({ mensaje: 'Alumno eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar alumno.' });
  }
});

// ─── MATERIAS ─────────────────────────────────────────────────────────────────

router.get('/materias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_materias');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materias.' });
  }
});

router.post('/materias', async (req, res) => {
  const { clave, nombre, creditos } = req.body;
  if (!clave || !nombre || !creditos)
    return res.status(400).json({ error: 'Faltan campos: clave, nombre, creditos.' });

  try {
    await pool.query('CALL sp_crear_materia(?, ?, ?)', [clave, nombre, creditos]);
    res.status(201).json({ mensaje: `Materia ${clave} creada correctamente.` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: `La clave ${clave} ya existe.` });
    res.status(500).json({ error: 'Error al crear materia.' });
  }
});

// GET /api/admin/materias_docente
router.get('/materias_docente', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_materia_docente');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asignaciones.' });
  }
});

// ─── SEMESTRES ────────────────────────────────────────────────────────────────

router.get('/semestres', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_semestres');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener semestres.' });
  }
});

router.post('/semestres', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre)
    return res.status(400).json({ error: 'El campo nombre es requerido.' });

  try {
    await pool.query('CALL sp_crear_semestre(?)', [nombre]);
    res.status(201).json({ mensaje: `Semestre ${nombre} creado correctamente.` });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear semestre.' });
  }
});

// ─── CALIFICACIONES ───────────────────────────────────────────────────────────

router.post('/calificaciones', async (req, res) => {
  const { matricula, clave_materia, semestre, calificacion } = req.body;
  if (!matricula || !clave_materia || !semestre || calificacion === undefined)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    await pool.query('CALL sp_asignar_calificacion(?, ?, ?, ?)',
      [matricula, clave_materia, semestre, calificacion]);
    res.status(201).json({ mensaje: 'Calificación asignada correctamente.' });
  } catch (err) {
    const msg = err.sqlMessage || '';
    if (msg.includes('no encontrado') || msg.includes('no encontrada'))
      return res.status(404).json({ error: msg });
    res.status(500).json({ error: 'Error al asignar calificación.' });
  }
});

router.put('/calificaciones', async (req, res) => {
  const { matricula, clave_materia, semestre, calificacion } = req.body;
  if (!matricula || !clave_materia || !semestre || calificacion === undefined)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    await pool.query('CALL sp_editar_calificacion(?, ?, ?, ?)',
      [matricula, clave_materia, semestre, calificacion]);
    res.json({ mensaje: 'Calificación actualizada correctamente.' });
  } catch (err) {
    const msg = err.sqlMessage || '';
    if (msg.includes('no encontrad'))
      return res.status(404).json({ error: msg });
    res.status(500).json({ error: 'Error al editar calificación.' });
  }
});

router.delete('/calificaciones', async (req, res) => {
  const { matricula, clave_materia, semestre } = req.body;
  if (!matricula || !clave_materia || !semestre)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    await pool.query('CALL sp_eliminar_calificacion(?, ?, ?)',
      [matricula, clave_materia, semestre]);
    res.json({ mensaje: 'Calificación eliminada correctamente.' });
  } catch (err) {
    const msg = err.sqlMessage || '';
    if (msg.includes('no encontrad'))
      return res.status(404).json({ error: msg });
    res.status(500).json({ error: 'Error al eliminar calificación.' });
  }
});

// ─── BULK CALIFICACIONES ──────────────────────────────────────────────────────

router.post('/calificaciones/bulk', async (req, res) => {
  const { matricula, calificaciones } = req.body;
  if (!matricula || !Array.isArray(calificaciones) || calificaciones.length === 0)
    return res.status(400).json({ error: 'Faltan campos: matricula, calificaciones[].' });

  const errores  = [];
  const exitosos = [];

  for (const item of calificaciones) {
    const { clave_materia, semestre, calificacion } = item;
    try {
      await pool.query('CALL sp_asignar_calificacion(?, ?, ?, ?)',
        [matricula, clave_materia, semestre, calificacion]);
      exitosos.push(clave_materia);
    } catch (err) {
      errores.push(err.sqlMessage || `Error en ${clave_materia}`);
    }
  }

  res.status(201).json({
    mensaje: `${exitosos.length} calificación(es) asignadas correctamente.`,
    exitosos,
    errores
  });
});

// ─── CARRERAS ─────────────────────────────────────────────────────────────────

router.get('/carreras', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_carreras');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carreras.' });
  }
});

router.post('/carreras', async (req, res) => {
  const { clave, nombre, facultad } = req.body;
  if (!clave || !nombre || !facultad)
    return res.status(400).json({ error: 'Faltan campos: clave, nombre, facultad.' });

  try {
    await pool.query('CALL sp_crear_carrera(?, ?, ?)', [clave, nombre, facultad]);
    res.status(201).json({ mensaje: `Carrera ${clave} creada correctamente.` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: `La clave ${clave} ya existe.` });
    res.status(500).json({ error: 'Error al crear carrera.' });
  }
});

router.put('/carreras/:id', async (req, res) => {
  const { clave, nombre, facultad } = req.body;
  try {
    await pool.query('CALL sp_actualizar_carrera(?, ?, ?, ?)',
      [req.params.id, clave || null, nombre || null, facultad || null]);
    res.json({ mensaje: 'Carrera actualizada correctamente.' });
  } catch (err) {
    const msg = err.sqlMessage || '';
    if (msg.includes('no encontrada'))
      return res.status(404).json({ error: msg });
    res.status(500).json({ error: 'Error al actualizar carrera.' });
  }
});

router.delete('/carreras/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM carreras WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Carrera no encontrada.' });
    res.json({ mensaje: 'Carrera eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar carrera.' });
  }
});

// ─── DOCENTES ─────────────────────────────────────────────────────────────────

router.get('/docentes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_docentes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener docentes.' });
  }
});

router.post('/docentes', async (req, res) => {
  const { matricula, nombre, apellidos, email } = req.body;
  if (!matricula || !nombre || !apellidos || !email)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    await pool.query('CALL sp_crear_docente(?, ?, ?, ?)',
      [matricula, nombre, apellidos, email]);
    res.status(201).json({ mensaje: `Docente ${matricula} creado correctamente.` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'La matrícula o email ya existe.' });
    res.status(500).json({ error: 'Error al crear docente.' });
  }
});

router.delete('/docentes/:id', async (req, res) => {
  try {
    await pool.query('CALL sp_eliminar_docente(?)', [req.params.id]);
    res.json({ mensaje: 'Docente eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar docente.' });
  }
});

router.post('/docentes/asignar', async (req, res) => {
  const { matricula_docente, clave_materia, semestre } = req.body;
  if (!matricula_docente || !clave_materia || !semestre)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    await pool.query('CALL sp_asignar_docente(?, ?, ?)',
      [matricula_docente, clave_materia, semestre]);
    res.status(201).json({ mensaje: `Docente asignado a ${clave_materia} en ${semestre}.` });
  } catch (err) {
    const msg = err.sqlMessage || '';
    if (msg.includes('no encontrad'))
      return res.status(404).json({ error: msg });
    res.status(500).json({ error: 'Error al asignar docente.' });
  }
});

// ─── SQL rutas ─────────────────────────────────────────────────────────────────

const db = require('../db/conection');

// SQL Sandbox - solo en desarrollo
router.post('/query', requireAdmin, async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'Query requerida' });

  // Bloquear comandos peligrosos
  const bloqueados = /DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE/i;
  if (bloqueados.test(sql)) {
    return res.status(403).json({ error: 'Comando no permitido en sandbox' });
  }

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;