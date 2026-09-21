async function loginAlumno(matricula, password) {
  return await api('POST', '/auth/login', { matricula, password });
}

async function loginDocente(matricula, password) {
  return await api('POST', '/auth/docente/login', { matricula, password });
}

async function loginAdmin(usuario, password) {
  return await api('POST', '/auth/admin/login', { usuario, password });
}

async function logout() {
  await api('POST', '/auth/logout');
  renderLogin();
}