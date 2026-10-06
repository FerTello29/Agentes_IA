function obtenerSesiones() {
  const ss = obtenerLibro_();
  const hoja = ss.getSheetByName(HOJAS.SESIONES);

  if (!hoja || hoja.getLastRow() < 2) {
    return [];
  }

  const datos = hoja
    .getRange(2, 1, hoja.getLastRow() - 1, 5)
    .getValues();

  const zona = Session.getScriptTimeZone();

  return datos.map(fila => ({
    id: fila[0],
    numero: fila[1],
    fecha: fila[2] instanceof Date
      ? Utilities.formatDate(fila[2], zona, 'yyyy-MM-dd')
      : fila[2],
    tema: fila[3],
    estado: fila[4]
  }));
}

function obtenerParticipantes(idSesion) {
  if (!idSesion) {
    throw new Error('Debes seleccionar una sesión.');
  }

  const ss = obtenerLibro_();
  const hojaParticipantes = ss.getSheetByName(HOJAS.PARTICIPANTES);
  const hojaAsistencias = ss.getSheetByName(HOJAS.ASISTENCIAS);

  const participantes = hojaParticipantes.getLastRow() < 2
    ? []
    : hojaParticipantes
        .getRange(2, 1, hojaParticipantes.getLastRow() - 1, 4)
        .getValues();

  const asistencias = hojaAsistencias.getLastRow() < 2
    ? []
    : hojaAsistencias
        .getRange(2, 1, hojaAsistencias.getLastRow() - 1, 4)
        .getValues();

  const estadoPorParticipante = new Map();

  asistencias.forEach(fila => {
    if (fila[0] === idSesion) {
      estadoPorParticipante.set(fila[1], fila[2]);
    }
  });

  return participantes
    .filter(fila => fila[3] === true)
    .map(fila => ({
      id: fila[0],
      nombre: fila[1],
      correo: fila[2],
      estado: estadoPorParticipante.get(fila[0]) || ESTADO_PREDETERMINADO
    }));
}

function guardarAsistencia(idSesion, participantes) {
  if (!idSesion) {
    throw new Error('Debes seleccionar una sesión.');
  }

  if (!Array.isArray(participantes) || participantes.length === 0) {
    throw new Error('No se recibieron participantes.');
  }

  const invalido = participantes.find(p => !ESTADOS.includes(p.estado));
  if (invalido) {
    throw new Error(`Estado no válido para ${invalido.id}: ${invalido.estado}`);
  }

  // Evita que dos guardados simultáneos se sobrescriban entre sí,
  // ya que la hoja se limpia y se reescribe completa.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Otro usuario está guardando. Intenta de nuevo en unos segundos.');
  }

  try {
    const ss = obtenerLibro_();
    const hoja = ss.getSheetByName(HOJAS.ASISTENCIAS);

    const existentes = hoja.getLastRow() < 2
      ? []
      : hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).getValues();

    const indice = new Map();

    existentes.forEach((fila, i) => {
      indice.set(`${fila[0]}|${fila[1]}`, i);
    });

    const ahora = new Date();

    participantes.forEach(p => {
      const clave = `${idSesion}|${p.id}`;
      const registro = [
        idSesion,
        p.id,
        p.estado,
        ahora
      ];

      if (indice.has(clave)) {
        existentes[indice.get(clave)] = registro;
      } else {
        indice.set(clave, existentes.length);
        existentes.push(registro);
      }
    });

    if (hoja.getLastRow() > 1) {
      hoja.getRange(2, 1, hoja.getLastRow() - 1, 4).clearContent();
    }

    if (existentes.length > 0) {
      hoja.getRange(2, 1, existentes.length, 4).setValues(existentes);
      hoja.getRange(2, 4, existentes.length, 1)
        .setNumberFormat('yyyy-mm-dd hh:mm:ss');
    }

    marcarSesionRegistrada_(idSesion);
  } finally {
    lock.releaseLock();
  }

  const conteo = {};
  ESTADOS.forEach(estado => {
    conteo[estado] = participantes.filter(p => p.estado === estado).length;
  });

  return {
    ok: true,
    idSesion,
    conteo,
    total: participantes.length
  };
}

function marcarSesionRegistrada_(idSesion) {
  const ss = obtenerLibro_();
  const hoja = ss.getSheetByName(HOJAS.SESIONES);

  if (!hoja || hoja.getLastRow() < 2) return;

  const datos = hoja
    .getRange(2, 1, hoja.getLastRow() - 1, 5)
    .getValues();

  const posicion = datos.findIndex(fila => fila[0] === idSesion);

  if (posicion >= 0) {
    hoja.getRange(posicion + 2, 5).setValue('REGISTRADA');
  }
}
