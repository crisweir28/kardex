function requireAuth(req, res, next) {
  if (!req.session || !req.session.alumnoId) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión primero.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere admin.' });
  }
  next();
}

function requireDocente(req, res, next) {
  if (!req.session || !req.session.docenteId) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere sesión de docente.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireDocente };