function mostrarMensaje(id, exito, texto) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `mt-2 text-sm px-3 py-2 rounded-lg ${exito ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
  el.textContent = texto;
  setTimeout(() => el.textContent = '', 3000);
}

function mostrarError(id, texto) {
  mostrarMensaje(id, false, texto);
}

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-200">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <h1 class="text-2xl font-bold text-center text-indigo-700 mb-2">Sistema Kardex</h1>
        <p class="text-center text-gray-400 text-sm mb-6">Inicia sesión para continuar</p>

        <div class="flex gap-2 mb-6">
          <button onclick="setRol('alumno')" id="btn-alumno"
            class="flex-1 py-2 rounded-lg text-sm font-semibold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
            Alumno
          </button>
          <button onclick="setRol('docente')" id="btn-docente"
            class="flex-1 py-2 rounded-lg text-sm font-semibold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition">
            Docente
          </button>
          <button onclick="setRol('admin')" id="btn-admin"
            class="flex-1 py-2 rounded-lg text-sm font-semibold border-2 border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white transition">
            Admin
          </button>
        </div>

        <div id="login-form">
          <div class="space-y-3">
            <input id="login-user" placeholder="Matrícula" class="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <input id="login-pass" type="password" placeholder="Contraseña" class="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <button onclick="doLogin()" class="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
              Entrar
            </button>
            <div id="login-msg"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  setRol('alumno');

  // ─── ENTER para hacer login ───────────────────────────────────────────────
  setTimeout(() => {
    document.getElementById('login-pass').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
    document.getElementById('login-user').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  }, 100);
}

let rolActual = 'alumno';

function setRol(rol) {
  rolActual = rol;
  const colores = { alumno: 'indigo', docente: 'emerald', admin: 'slate' };
  const placeholder = rol === 'admin' ? 'Usuario' : 'Matrícula';
  document.getElementById('login-user').placeholder = placeholder;

  ['alumno','docente','admin'].forEach(r => {
    const btn = document.getElementById(`btn-${r}`);
    const c   = colores[r];
    btn.className = `flex-1 py-2 rounded-lg text-sm font-semibold border-2 border-${c}-600 text-${c}-600 hover:bg-${c}-600 hover:text-white transition`;
  });

  const c   = colores[rol];
  const btn = document.getElementById(`btn-${rol}`);
  btn.className = `flex-1 py-2 rounded-lg text-sm font-semibold border-2 border-${c}-600 bg-${c}-600 text-white transition`;
}

async function doLogin() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;

  if (!user || !pass) return mostrarMensaje('login-msg', false, 'Completa todos los campos.');

  let result;

  if (rolActual === 'alumno') {
    result = await loginAlumno(user, pass);
    if (result.status === 200) {
      const kardex = await getKardex();
      if (kardex.status === 200) renderKardex(kardex.data);
      return;
    }
  } else if (rolActual === 'docente') {
    result = await loginDocente(user, pass);
    if (result.status === 200) {
      renderDocente(result.data.docente);
      return;
    }
  } else if (rolActual === 'admin') {
    result = await loginAdmin(user, pass);
    if (result.status === 200) {
      renderAdmin(result.data.usuario);
      return;
    }
  }

  mostrarMensaje('login-msg', false, result.data.error);
}

// Arrancar
renderLogin();
