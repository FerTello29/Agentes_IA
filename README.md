<div align="center">

# 📋 Control de asistencia

**Web App responsive para registrar la asistencia de 30 participantes durante 10 sesiones**
con Google Apps Script, Google Sheets, clasp y Git/GitHub, desarrollada con apoyo de un agente de IA.

[![Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-7c3aed?style=for-the-badge&logo=githubpages&logoColor=white)](https://fertello29.github.io/Agentes_IA/)
[![Web App](https://img.shields.io/badge/Web%20App-Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://script.google.com/a/macros/pachuca.tecnm.mx/s/AKfycbwdjFBxO8HbOjvZw4nwINGt7QG8xXkoJSs2Psue3R40qbUFSPxmVjYFG9r-QXfyo10/exec)
[![Versión](https://img.shields.io/badge/versión-v1.0-c026d3?style=for-the-badge)](https://github.com/FerTello29/Agentes_IA/releases/tag/v1.0)

</div>

---

## 👤 Datos del alumno

| | |
|---|---|
| **Alumno** | Fernando Rosales |
| **Carrera** | Ingeniería en Tecnologías de la Información y Comunicaciones (ITICS) |
| **Semestre** | 8.º semestre |
| **Materia** | Inteligencia Artificial aplicada a las TIC |
| **Práctica** | 2.1 Agentes de IA en las TIC — Desarrollo asistido por IA de una Web App con Google Apps Script, Git y clasp |
| **Institución** | Instituto Tecnológico de Pachuca · TecNM |

## 🔗 Enlaces

| Recurso | Enlace |
|---|---|
| Página del proyecto y demo (GitHub Pages) | https://fertello29.github.io/Agentes_IA/ |
| Demo interactiva con datos de ejemplo | https://fertello29.github.io/Agentes_IA/demo.html |
| Web App en producción (`/exec`) | https://script.google.com/a/macros/pachuca.tecnm.mx/s/AKfycbwdjFBxO8HbOjvZw4nwINGt7QG8xXkoJSs2Psue3R40qbUFSPxmVjYFG9r-QXfyo10/exec |
| Repositorio | https://github.com/FerTello29/Agentes_IA |

> La Web App de producción guarda en Google Sheets y requiere una cuenta `@pachuca.tecnm.mx`.
> La demo de GitHub Pages usa la misma interfaz con un backend simulado que guarda en el navegador.

## ✨ Características

- **Cuatro estados por participante:** ✅ Asistió · ❌ Faltó · 📄 Justificante · ⛔ Suspensión de clases.
- **Selector de 10 sesiones** deslizable, con fecha y estado; abre automáticamente la sesión de hoy.
- **Marcar a todos** con un toque, por ejemplo para registrar una suspensión de clases completa.
- **Búsqueda instantánea** por nombre, ID o correo.
- **Resumen en vivo:** contadores por estado, barra de distribución y anillo con el porcentaje de asistencia.
- **Cambios sin guardar** marcados en cada tarjeta y en la barra de guardado, con aviso antes de cambiar de sesión.
- **Mobile-first:** controles de 44 px o más, barra de guardado fija, modo oscuro automático; 1 columna en teléfono, 2–3 en escritorio.
- **Sin duplicados:** cada combinación `id_sesion + id_participante` se actualiza en lugar de insertarse de nuevo.
- **Guardado seguro:** `LockService` evita que dos guardados simultáneos se sobrescriban.
- **Autoinicialización:** si las hojas no existen, se crean en el primer acceso.

## 🏗️ Arquitectura

```
Agente de IA ──crea/modifica──▶ Visual Studio Code
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
              Git / GitHub                      clasp
          (control de versiones)                  │
                                                  ▼
                                         Google Apps Script
                                                  │ SpreadsheetApp
                                                  ▼
                                            Google Sheets
                                                  ▲
                                                  │ google.script.run
                                               Web App ◀── Dispositivo móvil
```

- **Node.js** solo se usa para instalar y ejecutar `clasp`; no hospeda la aplicación.
- **clasp** sincroniza los archivos locales con Apps Script (`clasp pull` / `clasp push`).
- **Git/GitHub** guarda el historial del código (`git pull` / `git push`).

## 🧰 Tecnologías

| Herramienta | Uso |
|---|---|
| Google Apps Script (V8) | Backend y publicación de la Web App |
| Google Sheets | Base de datos (`BD_Control_Asistencia`) |
| HTML, CSS, JavaScript | Interfaz mobile-first |
| Node.js + npm | Instalación de clasp |
| clasp | Sincronización local ↔ Apps Script |
| Git + GitHub | Control de versiones |
| GitHub Pages | Página del proyecto y demo |
| Visual Studio Code + agente de IA | Desarrollo asistido |

## 📁 Estructura del proyecto

```
control_asistencia/
├── .clasp.json          # Enlace con el proyecto remoto de Apps Script
├── .claspignore         # Excluye docs/ y tools/ del clasp push
├── appsscript.json      # Manifiesto (zona horaria, V8, configuración de Web App)
├── Code.gs              # doGet(): entrada de la Web App
├── Config.gs            # SPREADSHEET_ID, nombres de hojas y estados válidos
├── Setup.gs             # prepararBaseDatos(): crea hojas y datos iniciales
├── Asistencia.gs        # Lectura de sesiones/participantes y guardado de asistencia
├── index.html           # Interfaz de usuario
├── docs/                # GitHub Pages
│   ├── index.html       # Página de presentación del proyecto
│   ├── demo.html        # Demo generada a partir de index.html
│   └── mock.js          # Backend simulado para la demo
├── tools/
│   └── generar-demo.js  # Genera docs/demo.html
├── README.md
└── .gitignore
```

## 🗃️ Modelo de datos (Google Sheets)

**Participantes** — clave: `id_participante`

| id_participante | nombre | correo | activo |
|---|---|---|---|
| P01 … P30 | Participante 01 … | participante01@ejemplo.com … | TRUE |

**Sesiones** — clave: `id_sesion`

| id_sesion | numero | fecha | tema | estado |
|---|---|---|---|---|
| S01 … S10 | 1 … 10 | semanal desde la inicialización | Sesión 1 … | PENDIENTE / REGISTRADA |

**Asistencias** — clave compuesta: `id_sesion + id_participante`

| id_sesion | id_participante | estado | hora_registro |
|---|---|---|---|
| S01 | P01 | PRESENTE / AUSENTE / JUSTIFICADO / SUSPENSION | yyyy-mm-dd hh:mm:ss |

| Valor en la hoja | Etiqueta en la app |
|---|---|
| PRESENTE | Asistió |
| AUSENTE | Faltó |
| JUSTIFICADO | Justificante |
| SUSPENSION | Suspensión de clases |

## ⚙️ Funciones del backend

| Función | Archivo | Descripción |
|---|---|---|
| `doGet()` | Code.gs | Devuelve `index.html` con título y meta viewport |
| `prepararBaseDatos()` | Setup.gs | Crea las 3 hojas y carga P01–P30 y S01–S10 sin duplicar |
| `obtenerSesiones()` | Asistencia.gs | Lista las sesiones `{id, numero, fecha, tema, estado}`; inicializa la base si falta |
| `obtenerParticipantes(idSesion)` | Asistencia.gs | Participantes activos con su `estado` en la sesión (AUSENTE si aún no se registra) |
| `guardarAsistencia(idSesion, participantes)` | Asistencia.gs | Valida el estado, inserta o actualiza la asistencia y marca la sesión como REGISTRADA |

## 🚀 Instalación

Requisitos: Visual Studio Code, Node.js LTS (20 o posterior), Git y una cuenta de Google.

```bash
node --version
npm --version
git --version

npm install -g @google/clasp@latest
clasp --version
```

## 🔧 Configuración

1. Crea en Google Drive la hoja `BD_Control_Asistencia` y copia su ID (el valor entre `/d/` y `/edit`).
2. Crea un proyecto independiente de Apps Script `WebApp_Control_Asistencia` y copia su **Script ID**.
3. Activa **Google Apps Script API** en https://script.google.com/home/usersettings.
4. Clona y enlaza:

```bash
clasp login
git clone https://github.com/FerTello29/Agentes_IA.git control_asistencia
cd control_asistencia
```

5. En `.clasp.json` coloca tu `scriptId` y en `Config.gs` tu `SPREADSHEET_ID`.

## 🔄 Sincronización

```bash
clasp push          # VS Code → Apps Script
clasp pull          # Apps Script → VS Code
clasp open-script   # Abre el proyecto remoto en el navegador

git status
git diff
git add .
git commit -m "Descripción del cambio"
git push origin main
```

> `clasp pull/push` sincroniza con Apps Script; `git pull/push` sincroniza con GitHub.

## 🌐 Publicación

1. `clasp push`.
2. Abre la Web App o ejecuta `prepararBaseDatos()` y concede los permisos.
3. Prueba la implementación `/dev` (**Implementar → Implementaciones de prueba**).
4. Publica una versión de producción:

```bash
clasp create-deployment --description "v1.x"
clasp list-deployments
```

Para actualizar la demo de GitHub Pages después de modificar `index.html`:

```bash
node tools/generar-demo.js
```

## 📱 Uso

1. Abre la Web App desde el teléfono o la computadora.
2. Elige una sesión en la parte superior (S1–S10).
3. Para cada participante toca **Asistió**, **Faltó**, **Justificante** o **Suspensión**, o usa los botones **Todos**.
4. Revisa el resumen y el porcentaje de asistencia.
5. Pulsa **Guardar asistencia**; aparecerá una confirmación con el total por estado.

## 🤖 Uso del agente de IA

El código se desarrolló con apoyo de un agente de IA en Visual Studio Code. Cada cambio propuesto se revisó con `git diff` antes de aceptarlo y se registró en commits separados. Durante la revisión se añadieron:

- Bloqueo con `LockService` al guardar, para evitar sobrescrituras simultáneas.
- Validación de los estados permitidos en el servidor.
- Construcción del DOM con `textContent` para evitar inyección de HTML.
- `.claspignore` para no subir a Apps Script los archivos de GitHub Pages.

## 🔒 Seguridad

- `.clasprc.json` (credenciales de clasp) está excluido por `.gitignore` y nunca se publica.
- No se publican tokens, contraseñas ni archivos `.env`.
- La Web App se ejecuta como el propietario y solo admite cuentas del dominio institucional.

---

<div align="center">

**Fernando Rosales** · ITICS · 8.º semestre · Inteligencia Artificial aplicada a las TIC

</div>
