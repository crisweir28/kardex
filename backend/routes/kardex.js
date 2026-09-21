const express      = require('express');
const pool         = require('../db/conection');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const alumnoId = req.session.alumnoId;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM vista_kardex WHERE alumno_id = ? ORDER BY semestre_id, materia`,
      [alumnoId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'No se encontró información del alumno.' });
    }

    // Info del alumno (viene en todas las filas)
    const { matricula, nombre, apellidos, carrera } = rows[0];

    // Agrupar por semestre
    const semestresMap = {};
    let totalCreditos  = 0;
    let totalPonderado = 0;

    for (const row of rows) {
      if (!semestresMap[row.semestre]) {
        semestresMap[row.semestre] = {
          semestre: row.semestre,
          materias: [],
          promedio_semestre: 0
        };
      }

      semestresMap[row.semestre].materias.push({
        clave:        row.clave_materia,
        materia:      row.materia,
        creditos:     row.creditos,
        calificacion: parseFloat(row.calificacion),
        estatus:      row.estatus
      });

      totalCreditos  += row.creditos;
      totalPonderado += row.calificacion * row.creditos;
    }

    // Promedio por semestre
    for (const key in semestresMap) {
      const mats = semestresMap[key].materias;
      const suma = mats.reduce((acc, m) => acc + m.calificacion, 0);
      semestresMap[key].promedio_semestre = parseFloat((suma / mats.length).toFixed(2));
    }

    const promedioGeneral = totalCreditos > 0
      ? parseFloat((totalPonderado / totalCreditos).toFixed(2))
      : 0;

    res.json({
      alumno: { matricula, nombre, apellidos, carrera },
      promedio_general: promedioGeneral,
      total_creditos:   totalCreditos,
      semestres:        Object.values(semestresMap)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el kardex.' });
  }
});

module.exports = router;