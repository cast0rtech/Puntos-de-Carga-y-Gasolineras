# EcoRoute Analytics ⚡⛽

<p align="center">
  <img src="assets/icon.png" alt="EcoRoute Analytics Logo" width="180" style="border-radius: 50%; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
</p>

<p align="center">
  <strong>Plataforma integral de análisis, visualización y exportación de infraestructura de recarga para vehículos eléctricos y estaciones de servicio de combustible.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20(x64%20%7C%20ARM64)-blue?style=for-the-badge&logo=windows" alt="Windows Platform">
  <img src="https://img.shields.io/badge/Electron-33.x-47848F?style=for-the-badge&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Style-Dark%20Glassmorphism-10B981?style=for-the-badge" alt="Glassmorphism">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## 📌 Descripción del Proyecto

**EcoRoute Analytics** es una aplicación multiplataforma (Web y Escritorio para Windows) diseñada para analizar, clasificar y auditar la infraestructura energética vial. Integra datos en tiempo real de **Open Charge Map** para movilidad eléctrica y de **OpenStreetMap (Overpass API)** para gasolineras convencionales, implementando algoritmos de clustering espacial, filtrado dinámico por autovía, cálculo de cuotas de mercado por operador y exportación avanzada a formatos abiertos.

Disponible tanto como **aplicación web autónoma** como en forma de **aplicación de escritorio nativa para Windows**, con instalador corporativo multiusuario (`Setup.exe`) y versión portable sin instalación (`Portable.exe`).

---

## ✨ Características Principales

### 1. ⚡ Movilidad Eléctrica & Clustering Espacial Inteligente
- Conexión en vivo con la API v3 de **Open Charge Map** con capacidad masiva ampliada de hasta **99.999 estaciones**.
- **Algoritmo de Agrupamiento Geográfico de Alto Rendimiento (Spatial Grid Hash + Haversine)**:
  - Complejidad reducida a $O(N)$ mediante indexación por cuadrícula espacial, permitiendo procesar decenas de miles de registros en milisegundos sin congelar la interfaz.
  - Fusión de puntos de recarga con coordenadas idénticas o distancia residual $\le 35\text{ metros}$ en una **estación física unificada**.
  - Recálculo dinámico de **centroides geográficos** $(\overline{\text{lat}}, \overline{\text{lon}})$.
  - Agregación total de conectores operativos y detección automática de la **potencia pico de carga (kW)** disponible.
  - Normalización inteligente de operadores (Tesla, Iberdrola, Endesa, Repsol, Ionity, etc.).

### 2. ⛽ Estaciones de Servicio Tradicionales (OpenStreetMap)
- Extracción de datos en tiempo real vía **Overpass API** de OSM (`node["amenity"="fuel"]`) con límite ampliado a **99.999 estaciones** y timeout adaptativo de 90 segundos.
- Omisión precisa de clustering: cada nodo de OSM representa una estación física independiente.
- Detección de marcas comerciales, direcciones normalizadas y catálogo de carburantes disponibles (Gasolina 95/98, Diésel, GLP, GNC, AdBlue).

### 3. 🛣️ Parámetros de Búsqueda y Filtrado Inteligente
- **Límite configurable de estaciones** desde la interfaz: desde 1 hasta **99.999 estaciones**.
- Motor de búsqueda por corredor/autovía con **delimitación estricta de límites de palabra (`word boundaries`)**:
  - Distingue con precisión entre autovías principales y ramales (ej. `A-7` no genera falsos positivos con `A-70`).
  - Soporta búsquedas con guión, sin guión (`A7` = `A-7`), radiales (`M-30`, `M-40`, `M-50`) y carreteras nacionales (`N-340`, `N-II`).

### 4. 📊 Analítica y Cuotas de Mercado en Tiempo Real
- **Tarjetas KPI dinámicas**: Total de estaciones físicas, marcas únicas operativas, operador líder y vía activa.
- **Gráfico interactivo de barras**: Desglose visual del market share (%) y número de estaciones por operador para los resultados filtrados.
- **Renderizado Fluido**: Visualización ágil de las primeras 1.000 estaciones en DOM manteniendo el total de los 99.999 registros disponibles para filtros y exportaciones.

### 5. 💾 Exportación Profesional de Datos
- **Nombramiento Dinámico**:
  $$\texttt{estaciones\_\{país\}\_\{tipo\}\_\{vía\}\_\{fecha\}.\{ext\}}$$
  *(ej. `estaciones_ES_electricas_A-7_2026-09-12.csv`, `estaciones_ES_gasolineras_AP-7_2026-09-12.xlsx`)*.
- **Exportación CSV (Blob Nativo)**: Incorpora **BOM UTF-8 (`\uFEFF`)** para compatibilidad nativa inmediata con Microsoft Excel en español (sin caracteres corruptos en tildes).
- **Exportación Excel (`.xlsx`) con SheetJS**: Hojas formateadas semánticamente (*Electrolineras* o *Gasolineras*) con anchos de columna visuales preconfigurados.
- Enlaces directos de navegación rápida a **Google Maps** por coordenadas geográficas.

---

## 🖥️ Versión de Escritorio para Windows

La aplicación incluye soporte completo de empaquetado nativo mediante **Electron** y **electron-builder**:

| Binario / Lanzador | Ubicación | Descripción |
| :--- | :--- | :--- |
| **Instalador para Todos los Usuarios** | `dist/EcoRoute Analytics Setup 1.0.0.exe` | Instalador NSIS corporativo a nivel de máquina (`C:\Program Files\EcoRoute Analytics`) con accesos directos globales en el menú inicio y escritorio de todos los usuarios. |
| **Ejecutable Portable** | `dist/EcoRoute Analytics Portable 1.0.0.exe` | Ejecutable autónomo sin instalación. Doble clic y listo para funcionar sin permisos de administrador. |
| **Lanzador Rápido** | `ejecutar-app.bat` | Script de arranque rápido que detecta y lanza automáticamente el binario o entorno disponible. |
| **Instalador Asistido** | `instalar-para-todos-los-usuarios.bat` | Script de automatización con elevación de privilegios de administrador (UAC). |

---

## 🛠️ Tecnologías Empleadas

- **Frontend**: HTML5 Semántico, Vanilla CSS3 (Variables CSS, Dark Glassmorphism, Micro-animaciones).
- **Tipografía e Iconografía**: Google Fonts (*Outfit* & *Inter*), FontAwesome 6 Free.
- **Motor de Datos**: Vanilla JavaScript moderno (ES6+ Modules, Fetch API, Blobs).
- **Librerías de Terceros**: [SheetJS / XLSX](https://sheetjs.com/) para exportación a hojas de cálculo.
- **Desktop Runtime**: [Electron 33](https://www.electronjs.org/) + [electron-builder 25](https://www.electron.build/).
- **Fuentes de Datos**:
  - [Open Charge Map API](https://openchargemap.org/site/develop/api) (Infraestructura EV).
  - [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) (Estaciones de servicio).

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v18 o superior recomendado).
- Gestor de paquetes `npm`.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/cast0rtech/Puntos-de-Carga-y-Gasolineras.git
cd Puntos-de-Carga-y-Gasolineras
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar en Modo Desarrollo (Escritorio)
```bash
npm start
```
*O simplemente abre `index.html` en cualquier navegador web moderno.*

### 4. Compilar los Ejecutables de Windows
```bash
# Generar tanto el Instalador NSIS como el Ejecutable Portable
npm run dist:all

# Generar solo el instalador para todos los usuarios
npm run dist:installer

# Generar solo el ejecutable portable
npm run dist:portable
```
Los archivos `.exe` generados se ubicarán en la carpeta `dist/`.

---

## 🔑 Configuración de API Keys

1. **Open Charge Map**:
   - Obtén una API Key gratuita en [openchargemap.org](https://openchargemap.org/site/develop/api).
   - Introdúcela en la tarjeta superior de la aplicación y pulsa **Guardar**.
   - Puedes marcar la casilla *Recordar API Key* para que se almacene cifrada en el `localStorage` de tu equipo.
2. **OpenStreetMap (Overpass API)**:
   - No requiere registro ni API Key. Las consultas son públicas y abiertas.

---

## 📂 Estructura del Repositorio

```text
├── assets/
│   ├── icon.png                 # Icono oficial de la aplicación (PNG 1024x1024)
│   └── icon_256.png             # Icono escalado para compatibilidad con Windows
├── dist/                        # Binarios compilados (.exe) [excluido en git]
├── index.html                   # Interfaz de usuario y maquetación semántica
├── styles.css                   # Sistema de diseño, temas y componentes visuales
├── app.js                       # Núcleo de lógica: clustering, APIs, filtros y exportación
├── main.js                      # Proceso principal de Electron (BrowserWindow, menú nativo)
├── package.json                 # Metadatos del proyecto y configuración de electron-builder
├── ejecutar-app.bat             # Lanzador rápido para Windows
├── instalar-para-todos-los-usuarios.bat # Script de instalación global multiusuario
└── .gitignore                   # Exclusiones para git (node_modules, dist, logs)
```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.

---

<p align="center">
  Desarrollado con ❤️ para impulsar la transición energética y la transparencia de datos viales.
</p>
