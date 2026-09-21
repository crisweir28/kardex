async function cargarSelects() {
  const [{ data: materias }, { data: semestres }, { data: docentes }] = await Promise.all([
    api('GET', '/admin/materias'),
    api('GET', '/admin/semestres'),
    api('GET', '/admin/docentes')
  ]);
  return { materias, semestres, docentes };
}

function renderAdmin(usuario) {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 class="text-xl font-bold">⚙️ Panel Admin</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm">${usuario}</span>
          <button onclick="logout()" class="bg-white text-slate-800 text-sm px-3 py-1 rounded-lg hover:bg-slate-100">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div class="max-w-6xl mx-auto p-6">
        <!-- Tabs -->
        <div class="flex gap-2 mb-6 flex-wrap">
          ${['alumnos','materias','semestres','carreras','docentes','calificaciones'].map(t => `
            <button onclick="adminTab('${t}')"
              id="tab-${t}"
              class="px-4 py-2 rounded-lg text-sm font-semibold bg-white shadow hover:bg-slate-800 hover:text-white transition">
              ${t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          `).join('')}
        </div>
        <div id="admin-content"></div>
      </div>
    </div>
  `;
  adminTab('alumnos');
}

function adminTab(tab) {
  document.querySelectorAll('[id^="tab-"]').forEach(b => b.classList.remove('bg-slate-800','text-white'));
  document.getElementById(`tab-${tab}`)?.classList.add('bg-slate-800','text-white');

  const fns = {
    alumnos:        adminAlumnos,
    materias:       adminMaterias,
    semestres:      adminSemestres,
    carreras:       adminCarreras,
    docentes:       adminDocentes,
    calificaciones: adminCalificaciones
  };
  fns[tab]?.();
}


// ─── ALUMNOS ──────────────────────────────────────────────────────────────────
async function adminAlumnos() {
  const { data } = await api('GET', '/admin/alumnos');
  const filas = data.map(a => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2 px-4 font-mono text-sm">${a.matricula}</td>
      <td class="py-2 px-4 text-sm">${a.nombre} ${a.apellidos}</td>
      <td class="py-2 px-4 text-sm">${a.carrera || '—'}</td>
      <td class="py-2 px-4 text-sm text-center">
        <button onclick="adminEliminar('/admin/alumnos/${a.id}','alumno ${a.matricula}')"
          class="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('admin-content').innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow">
        <div class="px-6 py-3 border-b font-bold">👨‍🎓 Alumnos</div>
        <table class="w-full">
          <thead><tr class="text-xs text-gray-500 uppercase border-b text-left">
            <th class="py-2 px-4">Matrícula</th>
            <th class="py-2 px-4">Nombre</th>
            <th class="py-2 px-4">Carrera</th>
            <th class="py-2 px-4"></th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">➕ Nuevo Alumno</h3>
        <div class="space-y-3">
          <input id="a-mat" placeholder="Matrícula" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="a-nom" placeholder="Nombre" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="a-ape" placeholder="Apellidos" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="a-car" placeholder="Carrera" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="a-pas" type="password" placeholder="Contraseña" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminCrearAlumno()" class="w-full bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
            Crear Alumno
          </button>
          <div id="a-msg"></div>
        </div>
      </div>
    </div>
  `;
}

async function adminCrearAlumno() {
  const body = {
    matricula:  document.getElementById('a-mat').value,
    nombre:     document.getElementById('a-nom').value,
    apellidos:  document.getElementById('a-ape').value,
    carrera:    document.getElementById('a-car').value,
    password:   document.getElementById('a-pas').value
  };
  const { status, data } = await api('POST', '/admin/alumnos', body);
  mostrarMensaje('a-msg', status === 201, data.mensaje || data.error);
  if (status === 201) adminTab('alumnos');
}

// ─── MATERIAS ─────────────────────────────────────────────────────────────────
async function adminMaterias() {
  const { data } = await api('GET', '/admin/materias');
  const filas = data.map(m => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2 px-4 font-mono text-sm">${m.clave}</td>
      <td class="py-2 px-4 text-sm">${m.nombre}</td>
      <td class="py-2 px-4 text-sm text-center">${m.creditos}</td>
      <td class="py-2 px-4 text-sm text-center">
        <button onclick="adminEliminar('/admin/materias/${m.id}','materia ${m.clave}')"
          class="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('admin-content').innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow">
        <div class="px-6 py-3 border-b font-bold">📚 Materias</div>
        <table class="w-full">
          <thead><tr class="text-xs text-gray-500 uppercase border-b text-left">
            <th class="py-2 px-4">Clave</th><th class="py-2 px-4">Nombre</th>
            <th class="py-2 px-4 text-center">Créditos</th><th class="py-2 px-4"></th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">➕ Nueva Materia</h3>
        <div class="space-y-3">
          <input id="m-cla" placeholder="Clave (ej: MAT101)" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="m-nom" placeholder="Nombre" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="m-cre" type="number" placeholder="Créditos" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminCrearMateria()" class="w-full bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
            Crear Materia
          </button>
          <div id="m-msg"></div>
        </div>
      </div>
    </div>
  `;
}

async function adminCrearMateria() {
  const body = {
    clave:    document.getElementById('m-cla').value,
    nombre:   document.getElementById('m-nom').value,
    creditos: parseInt(document.getElementById('m-cre').value)
  };
  const { status, data } = await api('POST', '/admin/materias', body);
  mostrarMensaje('m-msg', status === 201, data.mensaje || data.error);
  if (status === 201) adminTab('materias');
}

// ─── SEMESTRES ────────────────────────────────────────────────────────────────
async function adminSemestres() {
  const { data } = await api('GET', '/admin/semestres');
  const items = data.map(s => `
    <div class="flex justify-between items-center border-b py-2 px-4 text-sm">
      <span>${s.nombre}</span>
    </div>
  `).join('');

  document.getElementById('admin-content').innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow">
        <div class="px-6 py-3 border-b font-bold">📅 Semestres</div>
        ${items}
      </div>
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">➕ Nuevo Semestre</h3>
        <div class="space-y-3">
          <input id="s-nom" placeholder="Nombre (ej: 2024-2)" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminCrearSemestre()" class="w-full bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
            Crear Semestre
          </button>
          <div id="s-msg"></div>
        </div>
      </div>
    </div>
  `;
}

async function adminCrearSemestre() {
  const { status, data } = await api('POST', '/admin/semestres', { nombre: document.getElementById('s-nom').value });
  mostrarMensaje('s-msg', status === 201, data.mensaje || data.error);
  if (status === 201) adminTab('semestres');
}

// ─── CARRERAS ─────────────────────────────────────────────────────────────────
async function adminCarreras() {
  const { data } = await api('GET', '/admin/carreras');
  const filas = data.map(c => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2 px-4 font-mono text-sm">${c.clave}</td>
      <td class="py-2 px-4 text-sm">${c.nombre}</td>
      <td class="py-2 px-4 text-sm">${c.facultad}</td>
      <td class="py-2 px-4 text-sm text-center">
        <button onclick="adminEliminar('/admin/carreras/${c.id}','carrera ${c.clave}')"
          class="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('admin-content').innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow">
        <div class="px-6 py-3 border-b font-bold">🎓 Carreras</div>
        <table class="w-full">
          <thead><tr class="text-xs text-gray-500 uppercase border-b text-left">
            <th class="py-2 px-4">Clave</th><th class="py-2 px-4">Nombre</th>
            <th class="py-2 px-4">Facultad</th><th class="py-2 px-4"></th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">➕ Nueva Carrera</h3>
        <div class="space-y-3">
          <input id="c-cla" placeholder="Clave (ej: ISC)" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="c-nom" placeholder="Nombre" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="c-fac" placeholder="Facultad" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminCrearCarrera()" class="w-full bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
            Crear Carrera
          </button>
          <div id="c-msg"></div>
        </div>
      </div>
    </div>
  `;
}

async function adminCrearCarrera() {
  const body = {
    clave:    document.getElementById('c-cla').value,
    nombre:   document.getElementById('c-nom').value,
    facultad: document.getElementById('c-fac').value
  };
  const { status, data } = await api('POST', '/admin/carreras', body);
  mostrarMensaje('c-msg', status === 201, data.mensaje || data.error);
  if (status === 201) adminTab('carreras');
}

// ─── DOCENTES ─────────────────────────────────────────────────────────────────
async function adminDocentes() {
  const { data } = await api('GET', '/admin/docentes');
  const { data: asignaciones } = await api('GET', '/admin/materias_docente');
  const { materias, semestres } = await cargarSelects();

  const opsMaterias = materias.map(m =>
    `<option value="${m.clave}">${m.clave} - ${m.nombre}</option>`
  ).join('');

  const opsSemestres = semestres.map(s =>
    `<option value="${s.nombre}">${s.nombre}</option>`
  ).join('');

  const opsDocentes = data.map(d =>
    `<option value="${d.matricula}">${d.matricula} - ${d.nombre} ${d.apellidos}</option>`
  ).join('');

  const filas = data.map(d => {
    const mats = asignaciones
      ? asignaciones.filter(a => a.matricula_docente === d.matricula)
                    .map(a => `<span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full mr-1">${a.clave_materia} (${a.semestre})</span>`)
                    .join('')
      : '';
    return `
      <tr class="border-b hover:bg-gray-50 align-top">
        <td class="py-2 px-4 font-mono text-sm">${d.matricula}</td>
        <td class="py-2 px-4 text-sm">${d.nombre} ${d.apellidos}</td>
        <td class="py-2 px-4 text-sm">${d.email}</td>
        <td class="py-2 px-4 text-sm">${mats || '<span class="text-gray-400 text-xs">Sin asignar</span>'}</td>
        <td class="py-2 px-4 text-sm text-center">
          <button onclick="adminEliminar('/admin/docentes/${d.id}','docente ${d.matricula}')"
            class="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('admin-content').innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow overflow-x-auto">
        <div class="px-6 py-3 border-b font-bold">👨‍🏫 Docentes</div>
        <table class="w-full">
          <thead><tr class="text-xs text-gray-500 uppercase border-b text-left">
            <th class="py-2 px-4">Matrícula</th>
            <th class="py-2 px-4">Nombre</th>
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Materias</th>
            <th class="py-2 px-4"></th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">➕ Nuevo Docente</h3>
        <div class="space-y-3">
          <input id="d-mat" placeholder="Matrícula" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="d-nom" placeholder="Nombre" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="d-ape" placeholder="Apellidos" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="d-ema" placeholder="Email" class="w-full border rounded-lg px-3 py-2 text-sm">
          <input id="d-pas" type="password" placeholder="Contraseña" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminCrearDocente()" class="w-full bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
            Crear Docente
          </button>
          <div id="d-msg"></div>
        </div>
        <hr class="my-4">
        <h3 class="font-bold mb-4">🔗 Asignar Docente a Materia</h3>
        <div class="space-y-3">
          <select id="da-mat" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona docente --</option>
            ${opsDocentes}
          </select>
          <select id="da-cla" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona materia --</option>
            ${opsMaterias}
          </select>
          <select id="da-sem" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona semestre --</option>
            ${opsSemestres}
          </select>
          <button onclick="adminAsignarDocente()" class="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">
            Asignar
          </button>
          <div id="da-msg"></div>
        </div>
      </div>
    </div>
  `;
}

async function adminCrearDocente() {
  const body = {
    matricula: document.getElementById('d-mat').value,
    nombre:    document.getElementById('d-nom').value,
    apellidos: document.getElementById('d-ape').value,
    email:     document.getElementById('d-ema').value,
    password:  document.getElementById('d-pas').value
  };
  const { status, data } = await api('POST', '/admin/docentes', body);
  mostrarMensaje('d-msg', status === 201, data.mensaje || data.error);
  if (status === 201) adminTab('docentes');
}

async function adminAsignarDocente() {
  const body = {
    matricula_docente: document.getElementById('da-mat').value,
    clave_materia:     document.getElementById('da-cla').value,
    semestre:          document.getElementById('da-sem').value
  };
  const { status, data } = await api('POST', '/admin/docentes/asignar', body);
  mostrarMensaje('da-msg', status === 201, data.mensaje || data.error);
}

// ─── CALIFICACIONES ───────────────────────────────────────────────────────────
async function adminCalificaciones() {
  const { materias, semestres } = await cargarSelects();

  const opsMaterias = materias.map(m =>
    `<option value="${m.clave}">${m.clave} - ${m.nombre}</option>`
  ).join('');

  const opsSemestres = semestres.map(s =>
    `<option value="${s.nombre}">${s.nombre}</option>`
  ).join('');

  document.getElementById('admin-content').innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">📝 Asignar Calificación</h3>
        <div class="space-y-3">
          <input id="cal-mat" placeholder="Matrícula alumno" class="w-full border rounded-lg px-3 py-2 text-sm">
          <select id="cal-cla" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona materia --</option>
            ${opsMaterias}
          </select>
          <select id="cal-sem" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona semestre --</option>
            ${opsSemestres}
          </select>
          <input id="cal-cal" type="number" min="0" max="10" step="0.1" placeholder="Calificación" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminAsignarCalif()" class="w-full bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
            Asignar
          </button>
          <div id="cal-msg"></div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-bold mb-4">✏️ Editar Calificación</h3>
        <div class="space-y-3">
          <input id="ced-mat" placeholder="Matrícula alumno" class="w-full border rounded-lg px-3 py-2 text-sm">
          <select id="ced-cla" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona materia --</option>
            ${opsMaterias}
          </select>
          <select id="ced-sem" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">-- Selecciona semestre --</option>
            ${opsSemestres}
          </select>
          <input id="ced-cal" type="number" min="0" max="10" step="0.1" placeholder="Nueva calificación" class="w-full border rounded-lg px-3 py-2 text-sm">
          <button onclick="adminEditarCalif()" class="w-full bg-amber-500 text-white py-2 rounded-lg text-sm hover:bg-amber-600">
            Actualizar
          </button>
          <div id="ced-msg"></div>
        </div>
      </div>
    </div>
  `;
}

async function adminAsignarCalif() {
  const body = {
    matricula:     document.getElementById('cal-mat').value,
    clave_materia: document.getElementById('cal-cla').value,
    semestre:      document.getElementById('cal-sem').value,
    calificacion:  parseFloat(document.getElementById('cal-cal').value)
  };
  const { status, data } = await api('POST', '/admin/calificaciones', body);
  mostrarMensaje('cal-msg', status === 201, data.mensaje || data.error);
}

async function adminEditarCalif() {
  const body = {
    matricula:     document.getElementById('ced-mat').value,
    clave_materia: document.getElementById('ced-cla').value,
    semestre:      document.getElementById('ced-sem').value,
    calificacion:  parseFloat(document.getElementById('ced-cal').value)
  };
  const { status, data } = await api('PUT', '/admin/calificaciones', body);
  mostrarMensaje('ced-msg', status === 200, data.mensaje || data.error);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function adminEliminar(path, label) {
  if (!confirm(`¿Eliminar ${label}?`)) return;
  const { status, data } = await api('DELETE', path);
  if (status === 200) adminTab(path.split('/')[2]);
  else alert(data.error);
}