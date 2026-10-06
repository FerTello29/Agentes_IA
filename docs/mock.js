// Backend simulado para la demo de GitHub Pages.
// Reemplaza google.script.run con datos de ejemplo guardados en localStorage,
// imitando las funciones de Asistencia.gs.
(function () {
  const CLAVE = 'demo-control-asistencia';
  const ESTADOS = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'SUSPENSION'];
  const LATENCIA = 450;

  function datosIniciales() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - 14);

    const sesiones = Array.from({ length: 10 }, (_, i) => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i * 7);
      const iso = fecha.getFullYear() + '-' +
        String(fecha.getMonth() + 1).padStart(2, '0') + '-' +
        String(fecha.getDate()).padStart(2, '0');
      return {
        id: 'S' + String(i + 1).padStart(2, '0'),
        numero: i + 1,
        fecha: iso,
        tema: 'Sesión ' + (i + 1),
        estado: i < 2 ? 'REGISTRADA' : 'PENDIENTE'
      };
    });

    const participantes = Array.from({ length: 30 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return { id: 'P' + n, nombre: 'Participante ' + n, correo: 'participante' + n + '@ejemplo.com' };
    });

    // Las dos primeras sesiones ya tienen asistencia de ejemplo.
    const asistencias = {};
    ['S01', 'S02'].forEach((s, k) => {
      participantes.forEach((p, i) => {
        const r = (i * 7 + k * 3) % 30;
        asistencias[s + '|' + p.id] = r < 24 ? 'PRESENTE' : r < 27 ? 'AUSENTE' : 'JUSTIFICADO';
      });
    });

    return { sesiones, participantes, asistencias };
  }

  function leer() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE));
      if (guardado && guardado.sesiones) return guardado;
    } catch (e) { /* sin almacenamiento disponible */ }
    return datosIniciales();
  }

  function escribir(db) {
    try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) { /* ignorar */ }
  }

  let db = leer();

  const api = {
    obtenerSesiones() {
      return db.sesiones.map(s => Object.assign({}, s));
    },

    obtenerParticipantes(idSesion) {
      if (!idSesion) throw new Error('Debes seleccionar una sesión.');
      return db.participantes.map(p => Object.assign({}, p, {
        estado: db.asistencias[idSesion + '|' + p.id] || 'AUSENTE'
      }));
    },

    guardarAsistencia(idSesion, participantes) {
      if (!idSesion) throw new Error('Debes seleccionar una sesión.');
      const conteo = {};
      ESTADOS.forEach(e => { conteo[e] = 0; });
      participantes.forEach(p => {
        if (!ESTADOS.includes(p.estado)) throw new Error('Estado no válido para ' + p.id);
        db.asistencias[idSesion + '|' + p.id] = p.estado;
        conteo[p.estado]++;
      });
      const sesion = db.sesiones.find(s => s.id === idSesion);
      if (sesion) sesion.estado = 'REGISTRADA';
      escribir(db);
      return { ok: true, idSesion, conteo, total: participantes.length };
    }
  };

  function crearRunner() {
    let exito = function () {};
    let fallo = function () {};
    const runner = {
      withSuccessHandler(f) { exito = f; return runner; },
      withFailureHandler(f) { fallo = f; return runner; }
    };
    Object.keys(api).forEach(nombre => {
      runner[nombre] = function () {
        const args = JSON.parse(JSON.stringify(Array.from(arguments)));
        setTimeout(() => {
          try { exito(api[nombre].apply(null, args)); } catch (e) { fallo(e); }
        }, LATENCIA);
      };
    });
    return runner;
  }

  window.google = { script: { get run() { return crearRunner(); } } };

  window.reiniciarDemo = function () {
    try { localStorage.removeItem(CLAVE); } catch (e) { /* ignorar */ }
    db = datosIniciales();
  };
})();
