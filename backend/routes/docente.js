const express            = require('express');
const bcrypt             = require('bcryptjs');
const pool               = require('../db/conection');
const { requireDocente } = require('../middleware/auth');
const router             = express.Router();

router.use(requireDocente);

// GET /api/docente/materias
router.get('/materias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT clave_materia, materia, semestre
      FROM vista_materia_docente
      WHERE docente_id = ?
      ORDER BY semestre, materia
    `, [req.session.docenteId]);
    res.json(rows);
  } catch (err) {
    console.error('ERROR MATERIAS DOCENTE:', err); // ← agrega esto
    res.status(500).json({ error: 'Error al obtener materias.' });
  }
});

// GET /api/docente/alumnos?clave_materia=MAT101&semestre=2024-1
router.get('/alumnos', async (req, res) => {
  const { clave_materia, semestre } = req.query;
  if (!clave_materia || !semestre)
    return res.status(400).json({ error: 'Faltan parámetros: clave_materia, semestre.' });

  try {
    // Verificar que la materia le pertenece al docente
    const [[asignacion]] = await pool.query(`
      SELECT materia_id FROM vista_materia_docente
      WHERE docente_id = ? AND clave_materia = ? AND semestre = ?
    `, [req.session.docenteId, clave_materia, semestre]);

    if (!asignacion)
      return res.status(403).json({ error: 'No tienes asignada esa materia en ese semestre.' });

    const [alumnos] = await pool.query(`
      SELECT matricula, alumno_nombre AS nombre, alumno_apellidos AS apellidos,
             calificacion, estatus
      FROM vista_calificaciones
      WHERE clave_materia = ? AND semestre = ?
      ORDER BY alumno_apellidos
    `, [clave_materia, semestre]);

    res.json({ materia: clave_materia, semestre, alumnos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alumnos.' });
  }
});

// POST /api/docente/calificaciones
router.post('/calificaciones', async (req, res) => {
  const { matricula, clave_materia, semestre, calificacion } = req.body;
  if (!matricula || !clave_materia || !semestre || calificacion === undefined)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    const [[asignacion]] = await pool.query(`
      SELECT materia_id FROM vista_materia_docente
      WHERE docente_id = ? AND clave_materia = ? AND semestre = ?
    `, [req.session.docenteId, clave_materia, semestre]);

    if (!asignacion)
      return res.status(403).json({ error: 'No tienes asignada esa materia en ese semestre.' });

    await pool.query('CALL sp_asignar_calificacion(?, ?, ?, ?)',
      [matricula, clave_materia, semestre, calificacion]);
    res.status(201).json({ mensaje: 'Calificación capturada correctamente.' });
  } catch (err) {
    const msg = err.sqlMessage || '';
    if (msg.includes('no encontrad'))
      return res.status(404).json({ error: msg });
    res.status(500).json({ error: 'Error al capturar calificación.' });
  }
});

// PUT /api/docente/calificaciones
router.put('/calificaciones', async (req, res) => {
  const { matricula, clave_materia, semestre, calificacion } = req.body;
  if (!matricula || !clave_materia || !semestre || calificacion === undefined)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    const [[asignacion]] = await pool.query(`
      SELECT materia_id FROM vista_materia_docente
      WHERE docente_id = ? AND clave_materia = ? AND semestre = ?
    `, [req.session.docenteId, clave_materia, semestre]);

    if (!asignacion)
      return res.status(403).json({ error: 'No tienes asignada esa materia en ese semestre.' });

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

// PUT /api/docente/password
router.put('/password', async (req, res) => {
  const { password_actual, password_nuevo } = req.body;
  if (!password_actual || !password_nuevo)
    return res.status(400).json({ error: 'Faltan campos: password_actual, password_nuevo.' });

  try {
    const [[docente]] = await pool.query(
      'SELECT password_hash FROM docentes WHERE id = ?', [req.session.docenteId]
    );
    const valida = await bcrypt.compare(password_actual, docente.password_hash);
    if (!valida)
      return res.status(401).json({ error: 'Contraseña actual incorrecta.' });

    const hash = await bcrypt.hash(password_nuevo, 10);
    await pool.query('UPDATE docentes SET password_hash = ? WHERE id = ?',
      [hash, req.session.docenteId]);
    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar contraseña.' });
  }
});

module.exports = router;