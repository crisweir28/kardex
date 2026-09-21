const express = require('express');
const session = require('express-session');
const path    = require('path');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const kardexRoutes  = require('./routes/kardex');
const adminRoutes   = require('./routes/admin');
const docenteRoutes = require('./routes/docente');

const app = express();

app.use(express.json());

app.use(session({
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge:   1000 * 60 * 30
  }
}));

app.use('/api/auth',    authRoutes);
app.use('/api/kardex',  kardexRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/docente', docenteRoutes);

app.use(express.static(path.join(__dirname, '../frontend')));  // ← sirve el front

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));