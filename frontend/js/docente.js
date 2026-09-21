function renderDocente(docente) {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 class="text-xl font-bold">👨‍🏫 Panel Docente</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm">${docente.nombre} ${docente.apellidos}</span>
          <button onclick="logout()" class="bg-white text-emerald-700 text-sm px-3 py-1 rounded-lg hover:bg-emerald-50">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div class="max-w-5xl mx-auto p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button onclick="docenteVerMaterias()" class="bg-white rounded-xl shadow p-4 hover:bg-emerald-50 text-left">
            <p class="text-2xl mb-1">📚</p>
            <p class="font-semibold text-sm">Mis Materias</p>
          </button>
          <button onclick="docenteVerAlumnos()" class="bg-white rounded-xl shadow p-4 hover:bg-emerald-50 text-left">
            <p class="text-2xl mb-1">👨‍🎓</p>
            <p class="font-semibold text-sm">Ver Alumnos</p>
          </button>
          <button onclick="docenteFormCalif('capturar')" class="bg-white rounded-xl shadow p-4 hover:bg-emerald-50 text-left">
            <p class="text-2xl mb-1">📝</p>
            <p class="font-semibold text-sm">Capturar Calif.</p>
          </button>
          <button onclick="docenteFormCalif('editar')" class="bg-white rounded-xl shadow p-4 hover:bg-emerald-50 text-left">
            <p class="text-2xl mb-1">✏️</p>
            <p class="font-semibold text-sm">Editar Calif.</p>
          </button>
        </div>
        <div id="docente-content"></div>
      </div>
    </div>
  `;
}

async function docenteVerMaterias() {
  const { status, data } = await api('GET', '/docente/materias');
  if (status !== 200) return mostrarError('docente-content', data.error);

const filas = data.map(m => `
  <tr class="border-b hover:bg-gray-50">
    <td class="py-2 px-4 font-mono text-sm">${m.clave_materia}</td>
    <td class="py-2 px-4 text-sm">${m.materia}</td>
    <td class="py-2 px-4 text-sm text-center">${m.semestre}</td>
  </tr>
`).join('');

  document.getElementById('docente-content').innerHTML = `
  <div class="bg-white rounded-xl shadow">
    <div class="px-6 py-3 border-b font-bold text-emerald-700">📚 Mis Materias</div>
    <table class="w-full">
      <thead>
        <tr class="text-xs text-gray-500 uppercase border-b text-left">
          <th class="py-2 px-4">Clave</th>
          <th class="py-2 px-4">Materia</th>
          <th class="py-2 px-4 text-center">Semestre</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  </div>
`;
}

async function docenteVerAlumnos() {
 // Cargar las materias del docente para el dropdown
  const { data: materias } = await api('GET', '/docente/materias');

  // Obtener semestres únicos de sus materias
  const semestres = [...new Set(materias.map(m => m.semestre))].sort();

  const opsMaterias = materias.map(m =>
    `<option value="${m.clave_materia}">${m.clave_materia} - ${m.materia}</option>`
  ).join('');

  const opsSemestres = semestres.map(s =>
    `<option value="${s}">${s}</option>`
  ).join('');

  document.getElementById('docente-content').innerHTML = `
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="font-bold text-emerald-700 mb-4">👨‍🎓 Ver Alumnos</h3>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="text-xs text-gray-500 uppercase">Materia</label>
          <select id="d-clave" class="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white">
            <option value="">-- Selecciona materia --</option>
            ${opsMaterias}
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Semestre</label>
          <select id="d-semestre" class="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white">
            <option value="">-- Selecciona semestre --</option>
            ${opsSemestres}
          </select>
        </div>
      </div>
      <button onclick="docenteCargarAlumnos()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
        Buscar
      </button>
      <div id="tabla-alumnos" class="mt-4"></div>
    </div>
  `;
}

async function docenteCargarAlumnos() {
  const clave    = document.getElementById('d-clave').value;
  const semestre = document.getElementById('d-semestre').value;
  const { status, data } = await api('GET', `/docente/alumnos?clave_materia=${clave}&semestre=${semestre}`);
  if (status !== 200) return mostrarError('tabla-alumnos', data.error);

  const filas = data.alumnos.map(a => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2 px-4 font-mono text-sm">${a.matricula}</td>
      <td class="py-2 px-4 text-sm">${a.nombre} ${a.apellidos}</td>
      <td class="py-2 px-4 text-sm text-center font-bold">${a.calificacion}</td>
      <td class="py-2 px-4 text-sm text-center">
        <span class="px-2 py-1 rounded-full text-xs ${a.estatus === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
          ${a.estatus}
        </span>
      </td>
    </tr>
  `).join('');

  document.getElementById('tabla-alumnos').innerHTML = `
    <table class="w-full mt-2">
      <thead>
        <tr class="text-xs text-gray-500 uppercase border-b text-left">
          <th class="py-2 px-4">Matrícula</th>
          <th class="py-2 px-4">Alumno</th>
          <th class="py-2 px-4 text-center">Calificación</th>
          <th class="py-2 px-4 text-center">Estatus</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

async function docenteFormCalif(tipo) {
  const esEditar = tipo === 'editar';
  const { data: materias } = await api('GET', '/docente/materias');
  const semestres = [...new Set(materias.map(m => m.semestre))].sort();

  const opsMaterias = materias.map(m =>
    `<option value="${m.clave_materia}">${m.clave_materia} - ${m.materia}</option>`
  ).join('');

  const opsSemestres = semestres.map(s =>
    `<option value="${s}">${s}</option>`
  ).join('');

  document.getElementById('docente-content').innerHTML = `
    <div class="bg-white rounded-xl shadow p-6 max-w-md">
      <h3 class="font-bold text-emerald-700 mb-4">${esEditar ? '✏️ Editar' : '📝 Capturar'} Calificación</h3>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 uppercase">Matrícula Alumno</label>
          <input id="cf-matricula" class="w-full border rounded-lg px-3 py-2 mt-1 text-sm" placeholder="A001">
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Materia</label>
          <select id="cf-clave" class="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white">
            <option value="">-- Selecciona materia --</option>
            ${opsMaterias}
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Semestre</label>
          <select id="cf-semestre" class="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white">
            <option value="">-- Selecciona semestre --</option>
            ${opsSemestres}
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 uppercase">Calificación</label>
          <input id="cf-calificacion" type="number" min="0" max="10" step="0.1" 
            class="w-full border rounded-lg px-3 py-2 mt-1 text-sm">
        </div>
        <button onclick="docenteEnviarCalif('${tipo}')" 
          class="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">
          ${esEditar ? 'Actualizar' : 'Guardar'}
        </button>
        <div id="cf-msg"></div>
      </div>
    </div>
  `;
}

async function docenteEnviarCalif(tipo) {
  const body = {
    matricula:     document.getElementById('cf-matricula').value,
    clave_materia: document.getElementById('cf-clave').value,
    semestre:      document.getElementById('cf-semestre').value,
    calificacion:  parseFloat(document.getElementById('cf-calificacion').value)
  };
  const method = tipo === 'editar' ? 'PUT' : 'POST';
  const { status, data } = await api(method, '/docente/calificaciones', body);
  mostrarMensaje('cf-msg', status === 200 || status === 201, data.mensaje || data.error);
}