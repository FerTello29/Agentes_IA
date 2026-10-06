# Control de asistencia — Google Apps Script

Web App responsive para controlar la asistencia de **30 participantes** durante **10 sesiones**. Usa Google Sheets como almacenamiento, Google Apps Script como backend y una interfaz HTML/CSS/JavaScript pensada primero para el teléfono.

Práctica 2.1 — *Agentes de IA en las TIC: desarrollo asistido por IA de una Web App con Google Apps Script, Git y clasp.*

## Arquitectura

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
- **clasp** sincroniza los archivos locales con el proyecto de Apps Script (`clasp pull` / `clasp push`).
- **Git/GitHub** guarda el historial del código (`git pull` / `git push`).
- La Web App se ejecuta en los servidores de Google y lee/escribe en Google Sheets.

## Tecnologías

| Herramienta | Uso |
|---|---|
| Google Apps Script (V8) | Backend y publicación de la Web App |
| Google Sheets | Base de datos (`BD_Control_Asistencia`) |
| HTML, CSS, JavaScript | Interfaz mobile-first |
| Node.js + npm | Instalación de clasp |
| clasp | Sincronización local ↔ Apps Script |
| Git + GitHub | Control de versiones |
| Visual Studio Code + agente de IA | Desarrollo asistido |

## Estructura del proyecto

```
control_asistencia/
├── .clasp.json        # Enlace con el proyecto remoto (lo crea clasp clone)
├── appsscript.json    # Manifiesto de Apps Script
├── Code.gs            # doGet(): entrada de la Web App
├── Config.gs          # SPREADSHEET_ID, nombres de hojas y apertura del libro
├── Setup.gs           # prepararBaseDatos(): crea hojas y datos iniciales
├── Asistencia.gs      # Lectura de sesiones/participantes y guardado de asistencia
├── index.html         # Interfaz de usuario
├── README.md
└── .gitignore
```

## Modelo de datos (Google Sheets)

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
| S01 | P01 | PRESENTE / AUSENTE | yyyy-mm-dd hh:mm:ss |

Al guardar de nuevo una sesión, los registros existentes se **actualizan**; nunca se duplica un participante dentro de la misma sesión.

## Funciones del backend

| Función | Archivo | Descripción |
|---|---|---|
| `doGet()` | Code.gs | Devuelve `index.html` con título y meta viewport |
| `prepararBaseDatos()` | Setup.gs | Crea las 3 hojas y carga P01–P30 y S01–S10 sin duplicar |
| `obtenerSesiones()` | Asistencia.gs | Lista las sesiones `{id, numero, fecha, tema, estado}` |
| `obtenerParticipantes(idSesion)` | Asistencia.gs | Participantes activos con su estado `presente` en la sesión |
| `guardarAsistencia(idSesion, participantes)` | Asistencia.gs | Inserta o actualiza la asistencia y marca la sesión como REGISTRADA |

`guardarAsistencia` usa `LockService` para que dos guardados simultáneos no se sobrescriban.

## Instalación

Requisitos: Visual Studio Code, Node.js LTS (20 o posterior), Git y una cuenta de Google.

```bash
node --version
npm --version
git --version

npm install -g @google/clasp@latest
clasp --version
```

## Configuración

1. En Google Drive crea la hoja de cálculo `BD_Control_Asistencia` y copia su ID (el valor entre `/d/` y `/edit` en la URL).
2. Crea un proyecto independiente de Apps Script llamado `WebApp_Control_Asistencia` y copia su **Script ID** (Configuración del proyecto).
3. Activa **Google Apps Script API** en https://script.google.com/home/usersettings.
4. Autoriza clasp y enlaza el proyecto:

```bash
clasp login
git clone https://github.com/FerTello29/Agentes_IA.git control_asistencia
cd control_asistencia
```

Crea `.clasp.json` con tu Script ID:

```json
{ "scriptId": "TU_SCRIPT_ID", "rootDir": "" }
```

5. En `Config.gs` reemplaza `PEGA_AQUI_EL_ID_DE_BD_CONTROL_ASISTENCIA` por el ID de la hoja de cálculo.

## Sincronización

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

## Puesta en operación

1. Configura `SPREADSHEET_ID` en `Config.gs`.
2. `clasp push`.
3. `clasp open-script`.
4. Ejecuta manualmente `prepararBaseDatos()` y concede los permisos.
5. Verifica en Google Sheets las hojas Participantes (30), Sesiones (10) y Asistencias.
6. **Implementar → Implementaciones de prueba → Aplicación web** y abre la URL `/dev`.
7. Selecciona una sesión, marca asistencia, guarda y revisa la hoja Asistencias.
8. Guarda de nuevo la misma sesión y confirma que siguen existiendo solo 30 registros.
9. **Implementar → Nueva implementación → Aplicación web** (ejecutar como propietario) y guarda la URL `/exec`.

Después de cambiar el código, `clasp push` actualiza `/dev`, pero la URL `/exec` solo cambia al crear una nueva versión en **Implementar → Gestionar implementaciones**.

## Uso de la Web App

1. Abre la URL de la Web App desde el teléfono o la computadora.
2. Elige una sesión en el selector.
3. Marca la casilla de cada participante presente (o usa **Marcar todos** / **Desmarcar todos**).
4. Revisa el contador `Presentes: N / 30`.
5. Pulsa **Guardar asistencia**; aparecerá un mensaje con el número de presentes y ausentes.

## Uso del agente de IA

El código se desarrolló con apoyo de un agente de IA en Visual Studio Code. Cada cambio propuesto se revisó con `git diff` antes de aceptarlo y se registró en commits separados. Durante la revisión se añadió un bloqueo (`LockService`) al guardado y se escapó el `id` del participante en la interfaz.

## Seguridad

- `.clasprc.json` (credenciales de clasp) está excluido por `.gitignore` y nunca debe subirse.
- No se publican tokens, contraseñas ni archivos `.env`.
