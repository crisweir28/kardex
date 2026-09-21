async function getKardex() {
  return await api('GET', '/kardex');
}

function renderKardex(data) {
  const { alumno, promedio_general, total_creditos, semestres } = data;

  let semestresHTML = '';
  for (const sem of semestres) {
    let materiasHTML = sem.materias.map(m => `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-2 px-4 text-sm font-mono">${m.clave}</td>
        <td class="py-2 px-4 text-sm">${m.materia}</td>
        <td class="py-2 px-4 text-sm text-center">${m.creditos}</td>
        <td class="py-2 px-4 text-sm text-center font-bold">${m.calificacion}</td>
        <td class="py-2 px-4 text-sm text-center">
          <span class="px-2 py-1 rounded-full text-xs font-semibold ${m.estatus === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
            ${m.estatus}
          </span>
        </td>
        <td class="py-2 px-4 text-sm text-gray-500">${m.docente || '—'}</td>
      </tr>
    `).join('');

    semestresHTML += `
      <div class="bg-white rounded-xl shadow mb-4">
        <div class="flex justify-between items-center px-6 py-3 bg-indigo-50 rounded-t-xl">
          <h3 class="font-bold text-indigo-700">📅 ${sem.semestre}</h3>
          <span class="text-sm text-indigo-500">Promedio: <strong>${sem.promedio_semestre}</strong></span>
        </div>
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase border-b">
              <th class="py-2 px-4">Clave</th>
              <th class="py-2 px-4">Materia</th>
              <th class="py-2 px-4 text-center">Créditos</th>
              <th class="py-2 px-4 text-center">Calif.</th>
              <th class="py-2 px-4 text-center">Estatus</th>
              <th class="py-2 px-4">Docente</th>
            </tr>
          </thead>
          <tbody>${materiasHTML}</tbody>
        </table>
      </div>
    `;
  }

  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-gray-100">
      <!-- Navbar -->
      <nav class="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 class="text-xl font-bold">📋 Sistema Kardex</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm">${alumno.nombre} ${alumno.apellidos}</span>
          <button onclick="logout()" class="bg-white text-indigo-700 text-sm px-3 py-1 rounded-lg hover:bg-indigo-50">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div class="max-w-5xl mx-auto p-6">
        <!-- Info alumno -->
        <div class="bg-white rounded-xl shadow p-6 mb-6 flex flex-wrap gap-6">
          <div>
            <p class="text-xs text-gray-500 uppercase">Matrícula</p>
            <p class="font-bold text-lg">${alumno.matricula}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Carrera</p>
            <p class="font-bold text-lg">${alumno.carrera || '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Promedio General</p>
            <p class="font-bold text-lg text-indigo-600">${promedio_general}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Créditos Totales</p>
            <p class="font-bold text-lg text-indigo-600">${total_creditos}</p>
          </div>
        </div>

        <!-- Semestres -->
        ${semestresHTML}
      </div>
    </div>
  `;
}