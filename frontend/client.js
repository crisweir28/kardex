const readline = require('readline');

// ─── HTTP CLIENT CON COOKIES ──────────────────────────────────────────────────
const nodeFetch     = require('../backend/node_modules/node-fetch');
const { CookieJar } = require('../backend/node_modules/tough-cookie');
const fetchCookie = require('../backend/node_modules/fetch-cookie');

const jar   = new CookieJar();
const fetch = fetchCookie.default
  ? fetchCookie.default(nodeFetch, jar)
  : fetchCookie(nodeFetch, jar);

const BASE = 'http://localhost:3000/api';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}



function cls() { console.clear(); }

function titulo(t) {
  console.log('\n' + '='.repeat(50));
  console.log(`  ${t}`);
  console.log('='.repeat(50));
}

function tabla(rows) {
  if (!rows || rows.length === 0) { console.log('  (sin resultados)'); return; }
  console.table(rows);
}

async function pausar() {
  await ask('\nPresiona ENTER para continuar...');
}

// ─── MENÚ PRINCIPAL ───────────────────────────────────────────────────────────
async function menuPrincipal() {
  while (true) {
    cls();
    titulo('SISTEMA KARDEX');
    console.log('  1. Entrar como Alumno');
    console.log('  2. Entrar como Docente');
    console.log('  3. Entrar como Admin');
    console.log('  0. Salir');

    const op = await ask('\n  Opción: ');
    if (op === '1') await loginAlumno();
    else if (op === '2') await loginDocente();
    else if (op === '3') await loginAdmin();
    else if (op === '0') { console.log('\n  ¡Hasta luego!\n'); rl.close(); process.exit(0); }
  }
}

// ─── LOGIN ALUMNO ─────────────────────────────────────────────────────────────
async function loginAlumno() {
  cls();
  titulo('LOGIN ALUMNO');
  const matricula = await ask('  Matrícula: ');
  const password  = await ask('  Contraseña: ');

  const { status, data } = await api('POST', '/auth/login', { matricula, password });
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }

  console.log(`\n  ✅ Bienvenido, ${data.alumno.nombre} ${data.alumno.apellidos}`);
  await menuAlumno();
}

async function menuAlumno() {
  while (true) {
    cls();
    titulo('MENÚ ALUMNO');
    console.log('  1. Ver mi kardex');
    console.log('  0. Cerrar sesión');

    const op = await ask('\n  Opción: ');
    if (op === '1') await verKardex();
    else if (op === '0') { await api('POST', '/auth/logout'); return; }
  }
}

async function verKardex() {
  cls();
  titulo('MI KARDEX');
  const { status, data } = await api('GET', '/kardex');
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }

  console.log(`\n  Alumno  : ${data.alumno.nombre} ${data.alumno.apellidos}`);
  console.log(`  Matrícula: ${data.alumno.matricula}`);
  console.log(`  Carrera  : ${data.alumno.carrera}`);
  console.log(`  Promedio : ${data.promedio_general}`);
  console.log(`  Créditos : ${data.total_creditos}`);

  for (const sem of data.semestres) {
    console.log(`\n  📅 ${sem.semestre}  (promedio: ${sem.promedio_semestre})`);
    console.log('  ' + '-'.repeat(70));
    for (const m of sem.materias) {
      const est = m.estatus === 'Aprobado' ? '✅' : '❌';
      console.log(`  ${est} [${m.clave}] ${m.materia.padEnd(35)} ${String(m.calificacion).padStart(4)}  (${m.creditos} cr)`);
      if (m.docente) console.log(`       👨‍🏫 ${m.docente}  ${m.email_docente || ''}`);
    }
  }
  await pausar();
}

// ─── LOGIN DOCENTE ────────────────────────────────────────────────────────────
async function loginDocente() {
  cls();
  titulo('LOGIN DOCENTE');
  const matricula = await ask('  Matrícula: ');
  const password  = await ask('  Contraseña: ');

  const { status, data } = await api('POST', '/auth/docente/login', { matricula, password });
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }

  console.log(`\n  ✅ Bienvenido, ${data.docente.nombre} ${data.docente.apellidos}`);
  await menuDocente();
}

async function menuDocente() {
  while (true) {
    cls();
    titulo('MENÚ DOCENTE');
    console.log('  1. Ver mis materias');
    console.log('  2. Ver alumnos de una materia');
    console.log('  3. Capturar calificación');
    console.log('  4. Editar calificación');
    console.log('  5. Cambiar contraseña');
    console.log('  0. Cerrar sesión');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await docenteMaterias();
    else if (op === '2') await docenteAlumnos();
    else if (op === '3') await docenteCapturar();
    else if (op === '4') await docenteEditar();
    else if (op === '5') await docentePassword();
    else if (op === '0') { await api('POST', '/auth/logout'); return; }
  }
}

async function docenteMaterias() {
  cls();
  titulo('MIS MATERIAS');
  const { status, data } = await api('GET', '/docente/materias');
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }
  tabla(data);
  await pausar();
}

async function docenteAlumnos() {
  cls();
  titulo('ALUMNOS DE MATERIA');
  const clave_materia = await ask('  Clave materia: ');
  const semestre      = await ask('  Semestre (ej: 2024-1): ');

  const { status, data } = await api('GET', `/docente/alumnos?clave_materia=${clave_materia}&semestre=${semestre}`);
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }

  console.log(`\n  Materia: ${data.materia}  |  Semestre: ${data.semestre}\n`);
  tabla(data.alumnos);
  await pausar();
}

async function docenteCapturar() {
  cls();
  titulo('CAPTURAR CALIFICACIÓN');
  const matricula     = await ask('  Matrícula alumno: ');
  const clave_materia = await ask('  Clave materia: ');
  const semestre      = await ask('  Semestre: ');
  const calificacion  = parseFloat(await ask('  Calificación: '));

  const { status, data } = await api('POST', '/docente/calificaciones',
    { matricula, clave_materia, semestre, calificacion });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function docenteEditar() {
  cls();
  titulo('EDITAR CALIFICACIÓN');
  const matricula     = await ask('  Matrícula alumno: ');
  const clave_materia = await ask('  Clave materia: ');
  const semestre      = await ask('  Semestre: ');
  const calificacion  = parseFloat(await ask('  Nueva calificación: '));

  const { status, data } = await api('PUT', '/docente/calificaciones',
    { matricula, clave_materia, semestre, calificacion });
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function docentePassword() {
  cls();
  titulo('CAMBIAR CONTRASEÑA');
  const password_actual = await ask('  Contraseña actual: ');
  const password_nuevo  = await ask('  Nueva contraseña: ');

  const { status, data } = await api('PUT', '/docente/password', { password_actual, password_nuevo });
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
async function loginAdmin() {
  cls();
  titulo('LOGIN ADMIN');
  const usuario  = await ask('  Usuario: ');
  const password = await ask('  Contraseña: ');

  const { status, data } = await api('POST', '/auth/admin/login', { usuario, password });
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }

  console.log(`\n  ✅ Bienvenido, ${data.usuario}`);
  await menuAdmin();
}

async function menuAdmin() {
  while (true) {
    cls();
    titulo('MENÚ ADMIN');
    console.log('  1. Alumnos');
    console.log('  2. Materias');
    console.log('  3. Semestres');
    console.log('  4. Carreras');
    console.log('  5. Docentes');
    console.log('  6. Calificaciones');
    console.log('  0. Cerrar sesión');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await menuAlumnos();
    else if (op === '2') await menuMaterias();
    else if (op === '3') await menuSemestres();
    else if (op === '4') await menuCarreras();
    else if (op === '5') await menuDocentes();
    else if (op === '6') await menuCalificaciones();
    else if (op === '0') { await api('POST', '/auth/logout'); return; }
  }
}

// ─── ADMIN: ALUMNOS ───────────────────────────────────────────────────────────
async function menuAlumnos() {
  while (true) {
    cls();
    titulo('ADMIN › ALUMNOS');
    console.log('  1. Listar');
    console.log('  2. Crear');
    console.log('  3. Eliminar');
    console.log('  4. Cambiar contraseña');
    console.log('  0. Volver');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await adminListar('/admin/alumnos', 'ALUMNOS');
    else if (op === '2') await adminCrearAlumno();
    else if (op === '3') await adminEliminar('/admin/alumnos', 'id alumno');
    else if (op === '4') await adminPasswordAlumno();
    else if (op === '0') return;
  }
}

async function adminCrearAlumno() {
  cls();
  titulo('CREAR ALUMNO');
  const matricula  = await ask('  Matrícula: ');
  const nombre     = await ask('  Nombre: ');
  const apellidos  = await ask('  Apellidos: ');
  const carrera    = await ask('  Carrera: ');
  const password   = await ask('  Contraseña: ');

  const { status, data } = await api('POST', '/admin/alumnos',
    { matricula, nombre, apellidos, carrera, password });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function adminPasswordAlumno() {
  cls();
  titulo('CAMBIAR CONTRASEÑA ALUMNO');
  const matricula = await ask('  Matrícula: ');
  const password  = await ask('  Nueva contraseña: ');

  const { status, data } = await api('PUT', `/admin/alumnos/${matricula}/password`, { password });
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── ADMIN: MATERIAS ──────────────────────────────────────────────────────────
async function menuMaterias() {
  while (true) {
    cls();
    titulo('ADMIN › MATERIAS');
    console.log('  1. Listar');
    console.log('  2. Crear');
    console.log('  3. Eliminar');
    console.log('  0. Volver');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await adminListar('/admin/materias', 'MATERIAS');
    else if (op === '2') await adminCrearMateria();
    else if (op === '3') await adminEliminar('/admin/materias', 'id materia');
    else if (op === '0') return;
  }
}

async function adminCrearMateria() {
  cls();
  titulo('CREAR MATERIA');
  const clave    = await ask('  Clave: ');
  const nombre   = await ask('  Nombre: ');
  const creditos = parseInt(await ask('  Créditos: '));

  const { status, data } = await api('POST', '/admin/materias', { clave, nombre, creditos });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── ADMIN: SEMESTRES ─────────────────────────────────────────────────────────
async function menuSemestres() {
  while (true) {
    cls();
    titulo('ADMIN › SEMESTRES');
    console.log('  1. Listar');
    console.log('  2. Crear');
    console.log('  0. Volver');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await adminListar('/admin/semestres', 'SEMESTRES');
    else if (op === '2') await adminCrearSemestre();
    else if (op === '0') return;
  }
}

async function adminCrearSemestre() {
  cls();
  titulo('CREAR SEMESTRE');
  const nombre = await ask('  Nombre (ej: 2024-2): ');

  const { status, data } = await api('POST', '/admin/semestres', { nombre });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── ADMIN: CARRERAS ──────────────────────────────────────────────────────────
async function menuCarreras() {
  while (true) {
    cls();
    titulo('ADMIN › CARRERAS');
    console.log('  1. Listar');
    console.log('  2. Crear');
    console.log('  3. Editar');
    console.log('  4. Eliminar');
    console.log('  0. Volver');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await adminListar('/admin/carreras', 'CARRERAS');
    else if (op === '2') await adminCrearCarrera();
    else if (op === '3') await adminEditarCarrera();
    else if (op === '4') await adminEliminar('/admin/carreras', 'id carrera');
    else if (op === '0') return;
  }
}

async function adminCrearCarrera() {
  cls();
  titulo('CREAR CARRERA');
  const clave    = await ask('  Clave: ');
  const nombre   = await ask('  Nombre: ');
  const facultad = await ask('  Facultad: ');

  const { status, data } = await api('POST', '/admin/carreras', { clave, nombre, facultad });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function adminEditarCarrera() {
  cls();
  titulo('EDITAR CARRERA');
  const id       = await ask('  ID carrera: ');
  const clave    = await ask('  Nueva clave (ENTER para omitir): ');
  const nombre   = await ask('  Nuevo nombre (ENTER para omitir): ');
  const facultad = await ask('  Nueva facultad (ENTER para omitir): ');

  const body = {};
  if (clave)    body.clave    = clave;
  if (nombre)   body.nombre   = nombre;
  if (facultad) body.facultad = facultad;

  const { status, data } = await api('PUT', `/admin/carreras/${id}`, body);
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── ADMIN: DOCENTES ──────────────────────────────────────────────────────────
async function menuDocentes() {
  while (true) {
    cls();
    titulo('ADMIN › DOCENTES');
    console.log('  1. Listar');
    console.log('  2. Crear');
    console.log('  3. Eliminar');
    console.log('  4. Asignar a materia');
    console.log('  0. Volver');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await adminListar('/admin/docentes', 'DOCENTES');
    else if (op === '2') await adminCrearDocente();
    else if (op === '3') await adminEliminar('/admin/docentes', 'id docente');
    else if (op === '4') await adminAsignarDocente();
    else if (op === '0') return;
  }
}

async function adminCrearDocente() {
  cls();
  titulo('CREAR DOCENTE');
  const matricula = await ask('  Matrícula: ');
  const nombre    = await ask('  Nombre: ');
  const apellidos = await ask('  Apellidos: ');
  const email     = await ask('  Email: ');
  const password  = await ask('  Contraseña: ');

  const { status, data } = await api('POST', '/admin/docentes',
    { matricula, nombre, apellidos, email, password });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function adminAsignarDocente() {
  cls();
  titulo('ASIGNAR DOCENTE A MATERIA');
  const matricula_docente = await ask('  Matrícula docente: ');
  const clave_materia     = await ask('  Clave materia: ');
  const semestre          = await ask('  Semestre: ');

  const { status, data } = await api('POST', '/admin/docentes/asignar',
    { matricula_docente, clave_materia, semestre });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── ADMIN: CALIFICACIONES ────────────────────────────────────────────────────
async function menuCalificaciones() {
  while (true) {
    cls();
    titulo('ADMIN › CALIFICACIONES');
    console.log('  1. Asignar una');
    console.log('  2. Asignar varias (bulk)');
    console.log('  3. Editar');
    console.log('  4. Eliminar');
    console.log('  0. Volver');

    const op = await ask('\n  Opción: ');
    if      (op === '1') await adminAsignarCalif();
    else if (op === '2') await adminBulkCalif();
    else if (op === '3') await adminEditarCalif();
    else if (op === '4') await adminEliminarCalif();
    else if (op === '0') return;
  }
}

async function adminAsignarCalif() {
  cls();
  titulo('ASIGNAR CALIFICACIÓN');
  const matricula     = await ask('  Matrícula alumno: ');
  const clave_materia = await ask('  Clave materia: ');
  const semestre      = await ask('  Semestre: ');
  const calificacion  = parseFloat(await ask('  Calificación: '));

  const { status, data } = await api('POST', '/admin/calificaciones',
    { matricula, clave_materia, semestre, calificacion });
  console.log(status === 201 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function adminBulkCalif() {
  cls();
  titulo('ASIGNAR VARIAS CALIFICACIONES');
  const matricula = await ask('  Matrícula alumno: ');
  const calificaciones = [];
  let continuar = true;

  while (continuar) {
    const clave_materia = await ask('  Clave materia: ');
    const semestre      = await ask('  Semestre: ');
    const calificacion  = parseFloat(await ask('  Calificación: '));
    calificaciones.push({ clave_materia, semestre, calificacion });
    const mas = await ask('  ¿Agregar otra? (s/n): ');
    continuar = mas.toLowerCase() === 's';
  }

  const { status, data } = await api('POST', '/admin/calificaciones/bulk',
    { matricula, calificaciones });
  if (status === 201) {
    console.log(`\n  ✅ ${data.mensaje}`);
    if (data.errores.length > 0)
      console.log(`  ⚠️  Errores: ${data.errores.join(', ')}`);
  } else {
    console.log(`\n  ❌ ${data.error}`);
  }
  await pausar();
}

async function adminEditarCalif() {
  cls();
  titulo('EDITAR CALIFICACIÓN');
  const matricula     = await ask('  Matrícula alumno: ');
  const clave_materia = await ask('  Clave materia: ');
  const semestre      = await ask('  Semestre: ');
  const calificacion  = parseFloat(await ask('  Nueva calificación: '));

  const { status, data } = await api('PUT', '/admin/calificaciones',
    { matricula, clave_materia, semestre, calificacion });
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

async function adminEliminarCalif() {
  cls();
  titulo('ELIMINAR CALIFICACIÓN');
  const matricula     = await ask('  Matrícula alumno: ');
  const clave_materia = await ask('  Clave materia: ');
  const semestre      = await ask('  Semestre: ');

  const { status, data } = await api('DELETE', '/admin/calificaciones',
    { matricula, clave_materia, semestre });
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── HELPERS GENÉRICOS ────────────────────────────────────────────────────────
async function adminListar(path, titulo_) {
  cls();
  titulo(titulo_);
  const { status, data } = await api('GET', path);
  if (status !== 200) { console.log(`\n  ❌ ${data.error}`); await pausar(); return; }
  tabla(data);
  await pausar();
}

async function adminEliminar(path, label) {
  cls();
  titulo(`ELIMINAR`);
  const id = await ask(`  ${label}: `);
  const confirmar = await ask(`  ¿Confirmar eliminar id ${id}? (s/n): `);
  if (confirmar.toLowerCase() !== 's') { console.log('\n  Cancelado.'); await pausar(); return; }

  const { status, data } = await api('DELETE', `${path}/${id}`);
  console.log(status === 200 ? `\n  ✅ ${data.mensaje}` : `\n  ❌ ${data.error}`);
  await pausar();
}

// ─── ARRANCAR ─────────────────────────────────────────────────────────────────
menuPrincipal();