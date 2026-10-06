const SPREADSHEET_ID = '1U6Df-P8R9M4DF2rYRqvAO6cvhVfj1TV2XNeMSaJbjbg';

const HOJAS = Object.freeze({
  PARTICIPANTES: 'Participantes',
  SESIONES: 'Sesiones',
  ASISTENCIAS: 'Asistencias'
});

const ESTADOS = Object.freeze(['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'SUSPENSION']);

const ESTADO_PREDETERMINADO = 'AUSENTE';

function obtenerLibro_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.includes('PEGA_AQUI')) {
    throw new Error('Configura SPREADSHEET_ID en Config.gs antes de ejecutar la aplicación.');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}
