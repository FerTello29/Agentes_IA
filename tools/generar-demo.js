// Genera docs/demo.html a partir de index.html para publicarlo en GitHub Pages.
// Uso: node tools/generar-demo.js
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');

// En Apps Script la meta viewport la agrega doGet(); en la demo va en el HTML.
html = html.replace(
  '<meta charset="UTF-8">',
  '<meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '  <title>Demo · Control de asistencia</title>'
);

// El backend simulado debe cargarse antes del script de la aplicación.
html = html.replace(/\n(\s*)<script>/, '\n$1<script src="mock.js"></script>\n$1<script>');

html = '<!-- Archivo generado por tools/generar-demo.js. No editar a mano. -->\n' + html;

fs.writeFileSync(path.join(raiz, 'docs', 'demo.html'), html);
console.log('docs/demo.html generado');
