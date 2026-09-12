# Guía de Usuario Oficial: EcoRoute Analytics (100% de Aprovechamiento)

¡Bienvenido a la **Guía de Usuario Oficial de EcoRoute Analytics**!  
Esta plataforma ha sido diseñada para conductores de vehículos eléctricos, planificadores de viajes, administradores de flotas y analistas del sector energético que necesitan información precisa, rápida y estructurada sobre la infraestructura de recarga y estaciones de servicio en carretera.

En este manual encontrarás una explicación paso a paso de cada funcionalidad para que puedas sacarle el **100% del rendimiento** a la aplicación móvil.

---

## 📑 Tabla de Contenidos
1. [Primeros Pasos y Conceptos Básicos](#1-primeros-pasos-y-conceptos-básicos)
2. [Cómo Obtener tu API Key Gratuita de Open Charge Map](#2-cómo-obtener-tu-api-key-gratuita-de-open-charge-map)
3. [Configuración de Credenciales en la Aplicación](#3-configuración-de-credenciales-en-la-aplicación)
4. [Búsqueda y Filtros de Estaciones](#4-búsqueda-y-filtros-de-estaciones)
5. [El Algoritmo de Agrupación (Clustering a 35m)](#5-el-algoritmo-de-agrupación-clustering-a-35m)
6. [Métricas, KPIs y Ranking de Operadores](#6-métricas-kpis-y-ranking-de-operadores)
7. [Gestión y Exploración de la Tabla de Datos](#7-gestión-y-exploración-de-la-tabla-de-datos)
8. [Acciones Rápidas: Coordenadas GPS y Google Maps](#8-acciones-rápidas-coordenadas-gps-y-google-maps)
9. [Exportación Profesional a Excel (.xlsx) y CSV](#9-exportación-profesional-a-excel-xlsx-y-csv)
10. [Modo Demostración y Uso Offline](#10-modo-demostración-y-uso-offline)
11. [Preguntas Frecuentes y Solución de Problemas (FAQ)](#11-preguntas-frecuentes-y-solución-de-problemas-faq)

---

## 1. Primeros Pasos y Conceptos Básicos

**EcoRoute Analytics** opera en dos niveles:
1. **Llamadas a la Red Global**: Se conecta a la base de datos abierta de [Open Charge Map](https://openchargemap.org) para consultar en tiempo real cargadores y estaciones de servicio de todo el mundo.
2. **Motor Analítico Local**: Toda la agrupación espacial de postes, cálculo de potencias, filtrado dinámico y generación de hojas de cálculo de Excel se ejecuta **directamente en el procesador de tu teléfono**. Esto garantiza máxima velocidad y privacidad absoluta (tus datos nunca salen de tu móvil).

---

## 2. Cómo Obtener tu API Key Gratuita de Open Charge Map

Para realizar consultas ilimitadas a la red pública en vivo, necesitas una clave de API personal. Es **100% gratuita** y solo toma 2 minutos obtenerla:

1. Ingresa desde tu navegador web a: **[https://openchargemap.org/site/develop/api](https://openchargemap.org/site/develop/api)**.
2. Si no tienes cuenta, haz clic en **Register** (o *Sign In* si ya estás registrado).
3. Una vez dentro de tu perfil, dirígete a la sección **My Apps & API Keys**.
4. Haz clic en el botón **Register An App / Request API Key**.
5. Rellena los datos básicos:
   - **Application Title:** `EcoRoute Móvil` (o el nombre que prefieras).
   - **Application URL:** Puedes indicar tu sitio web o dejarlo en blanco/`https://openchargemap.org`.
6. Haz clic en **Create Key**.
7. Verás una cadena alfanumérica larga (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef0123456789`). **Copia esa clave**.

---

## 3. Configuración de Credenciales en la Aplicación

Al abrir EcoRoute Analytics en tu dispositivo Android:

1. Localiza la primera tarjeta superior: **Credenciales Open Charge Map**.
2. Pega tu clave en el campo **API Key de Open Charge Map**.
3. **Botón del Ojo:** Pulsa el icono del ojo si deseas verificar que no haya espacios en blanco accidentales al inicio o al final.
4. **Casilla "Recordar API Key en este dispositivo":**
   - Asegúrate de marcar esta casilla si deseas que la app recuerde tu clave para que no tengas que escribirla cada vez que abras la app.
   - La clave se almacena de forma segura en el almacenamiento aislado de la aplicación (`localStorage` local).
5. **Indicador de Estado:**
   - En la esquina superior derecha verás el indicador `API Lista` en verde una vez que la clave esté configurada.

> 💡 **Nota:** Si no dispones de una clave en este momento, no te preocupes: puedes pulsar directamente el botón **Consultar Infraestructura** y la app cargará automáticamente los **datos de demostración precargados** para que pruebes todas las funciones.

---

## 4. Búsqueda y Filtros de Estaciones

En la tarjeta **Parámetros de Búsqueda**, dispones de 4 controles estratégicos:

### A. País
Selecciona el país objetivo en el desplegable:
- 🇪🇸 **España (ES)** (predeterminado)
- 🇫🇷 **Francia (FR)**
- 🇵🇹 **Portugal (PT)**
- 🇩🇪 **Alemania (DE)**
- 🇮🇹 **Italia (IT)**
- 🇬🇧 **Reino Unido (UK)**
- 🇺🇸 **Estados Unidos (US)**
- 🌍 **Todos los Países**

### B. Tipo de Infraestructura
Permite discriminar la tecnología de abastecimiento:
- ⚡ **Solo Puntos de Recarga Eléctrica**: Exclusivo para vehículos eléctricos e híbridos enchufables (filtros de conectores Mennekes, CCS2, CHAdeMO, etc.).
- ⛽ **Solo Gasolineras / Combustible**: Estaciones de servicio tradicionales de carburante (gasolina/diésel).
- 🔄 **Todos los Tipos**: Vista combinada de toda la red de movilidad disponible.

### C. Límite de Estaciones (Hasta 99.999)
- Permite configurar el número máximo de registros a descargar por consulta (valor predeterminado: **99.999**).
- Se ha ampliado el límite anterior de 500 registros para permitir la descarga y análisis de redes completas a escala de todo el país o provincia.

### D. Corredor / Autovía (Opcional)
Permite aislar estaciones situadas en autopistas o autovías concretas:
- Escribe por ejemplo: `A-7`, `AP-7`, `A-3`, `A-6`, etc.
- El motor de filtrado buscará coincidencias en la dirección, comentarios de acceso y títulos de las estaciones.
- Si dejas este campo vacío, la consulta abarcará el país completo seleccionado.

Para iniciar la búsqueda, pulsa el botón verde **Consultar Infraestructura** (con icono de radar).

---

## 5. El Algoritmo de Agrupación (Clustering a 35m)

Una de las innovaciones más importantes de EcoRoute Analytics es su **motor de clustering geoespacial**:

### El Problema
En las bases de datos abiertas, un mismo emplazamiento (por ejemplo, el Supercargador Tesla de un centro comercial o los postes de Iberdrola en un área de servicio) suele estar registrado como 4, 6 u 8 puntos separados (un registro por cada poste o conector). Esto distorsiona las estadísticas y llena las listas de filas duplicadas.

### La Solución de EcoRoute
- Nuestro algoritmo analiza las coordenadas GPS de cada registro recibido.
- Todos los postes que se encuentren a una **distancia residual menor o igual a 35 metros** (o con coordenadas idénticas) se fusionan automáticamente en una **Única Estación Física**.
- **Resultado:**
  - Se unifican todos los conectores disponibles sumando sus cantidades.
  - Se calcula la **potencia máxima (kW)** real instalada en el recinto.
  - Se agrupan los operadores (si hay varios operadores en el mismo punto, aparecen consolidados).
  - La tabla muestra la insignia azul: `Puntos Agrupados: X`.

---

## 6. Métricas, KPIs y Ranking de Operadores

Tras cada consulta, la aplicación actualiza automáticamente dos paneles de inteligencia de datos:

### Panel de 4 KPIs Principales
1. **Total Estaciones**: Número de ubicaciones físicas consolidadas tras aplicar el clustering.
2. **Puntos Agrupados**: Suma total de cargadores y surtidores individuales detectados.
3. **Potencia Máxima**: La mayor potencia de carga individual registrada en los resultados (por ejemplo, cargadores ultrarrápidos de `150 kW`, `250 kW` o `350 kW`).
4. **Operador Principal**: La compañía con mayor cuota de mercado en la consulta realizada.

### Distribución por Operadores
Muestra un gráfico de barras con el porcentaje de presencia de cada operador en la zona:
- **Tesla**, **Iberdrola**, **Endesa X Way**, **Repsol**, **Ionity**, **Wenea**, **EDP**, etc.
- Cada fila muestra el número de ubicaciones y el porcentaje exacto sobre el total.

---

## 7. Gestión y Exploración de la Tabla de Datos

Debajo de las métricas se encuentra la **Tabla Detallada de Estaciones**:

### Buscador en Tiempo Real
En la barra superior de la tabla dispones de un campo de texto con lupa:
- Escribe cualquier término (como `Valencia`, `CCS`, `Tesla`, `Km 302`, `Paterna`).
- La tabla se filtrará **instantáneamente mientras escribes**, sin recargar la página ni consumir llamadas a la API.

### Columnas de la Tabla
1. **#**: Número secuencial del registro.
2. **Operador**: Logotipo e identificación de la compañía explotadora.
3. **Localidad**: Ciudad, municipio o provincia.
4. **Dirección**: Nombre del recinto, vía, salida de autovía o área de descanso.
5. **Latitud / Longitud**: Coordenadas geográficas con precisión decimal.
6. **Tipo / Conectores**: Desglose de tipos de tomas (CCS2, Type 2, CHAdeMO) y potencia máxima en kW con insignia de color.
7. **Acciones**: Botones de interacción rápida.

---

## 8. Acciones Rápidas: Coordenadas GPS y Google Maps

En la columna **Acciones** de cada fila dispones de dos herramientas vitales en carretera:

### 📋 Copiar Coordenadas GPS (Icono de Portapapeles)
- Al pulsar este botón, la latitud y longitud exactas (ej: `39.521800, -0.443100`) se copian de inmediato al portapapeles de tu teléfono.
- Aparecerá una notificación emergente (*toast*): `Coordenadas copiadas`.
- Puedes pegarlas directamente en cualquier aplicación de navegación como Waze, Apple Maps, radares o sistemas integrados del vehículo.

### 🗺️ Ver en Google Maps (Icono de Mapa / Enlace)
- Al pulsar este botón, tu dispositivo Android abrirá automáticamente la aplicación oficial de **Google Maps** centrada en la estación seleccionada con un chincheta exacto.
- Desde allí solo debes pulsar **"Cómo llegar" / "Iniciar"** para comenzar el guiado por voz hasta el cargador.

---

## 9. Exportación Profesional a Excel (.xlsx) y CSV

EcoRoute Analytics integra la potente librería **SheetJS** directamente en el cliente. Puedes generar informes profesionales sin depender de software de escritorio:

### Exportar a Excel (.xlsx) — Botón Verde
- Haz clic en el botón **Exportar Excel**.
- Se generará un libro de trabajo de Microsoft Excel nativo `.xlsx` con:
  - Nombre de archivo contextual automático (ej: `EcoRoute_ES_electric_A-7_2026-09-12.xlsx`).
  - Nombre de pestaña según el tipo: *Electrolineras*, *Gasolineras* o *Estaciones*.
  - Cabecera estilizada con títulos en negrita.
  - Columnas ajustadas con anchos optimizados para lectura inmediata.
  - Enlaces activos a Google Maps integrados en la última columna.
- El archivo se guarda en la carpeta de descargas de tu móvil o se abre en Microsoft Excel / Google Sheets si tienes la app instalada.

### Exportar a CSV — Botón Esquematizado
- Haz clic en **Exportar CSV**.
- Genera un archivo de texto separado por comas estándar con codificación UTF-8, ideal para importar a bases de datos SQL, Pandas en Python, Tableau o Power BI.

---

## 10. Modo Demostración y Uso Offline

¿Estás en una zona montañosa sin cobertura móvil o aún no has solicitado tu API Key?
- La aplicación incluye un **Dataset de Demostración Local de Alta Fidelidad**.
- Contiene cargadores estratégicos en la Autovía A-7 y polígonos industriales (Tesla Supercharger Paterna Bay A y B, postes de alta potencia Iberdrola en Sagunto, estaciones Mennekes y CHAdeMO).
- Si realizas una consulta sin conexión o con clave en blanco, la aplicación activará automáticamente el dataset de muestra, permitiéndote probar la agrupación geoespacial, el copiado de coordenadas y la exportación a Excel en cualquier lugar.

---

## 11. Preguntas Frecuentes y Solución de Problemas (FAQ)

### ¿Por qué la búsqueda no devuelve resultados en mi autovía?
- Asegúrate de probar variaciones comunes del nombre: por ejemplo, escribe `A-7` o prueba sin guion `A7`.
- Si el corredor es muy específico, prueba primero a buscar únicamente por país (dejando el campo corredor vacío) y luego utiliza el buscador de texto integrado en la tabla.

### ¿La aplicación consume mucha batería o datos móviles?
- No. Al no ejecutar servicios de seguimiento GPS en segundo plano ni descargar mapas pesados en la vista previa, el consumo de datos se reduce a unos pocos kilobytes por consulta y el impacto en batería es prácticamente nulo.

### ¿Cómo elimino mi API Key de la memoria del teléfono?
- Simplemente borra el texto en el campo de la API Key, desmarca la casilla "Recordar API Key" y pulsa "Consultar". O bien, borra los datos de la aplicación en *Ajustes de Android > Aplicaciones > EcoRoute Analytics > Almacenamiento*.

### ¿Dónde se guardan los archivos de Excel exportados en Android?
- Los archivos se descargan en la carpeta estándar de **Descargas (Download)** de tu dispositivo Android. Puedes acceder a ellos mediante la app "Archivos" o "Mis Archivos".

---
*Para soporte técnico adicional, sugerencias o dudas de desarrollo, contacta a través de:*  
✉️ **Soporte:** `soporte@ecoroute.app`  
🌐 **Desarrollador:** EcoRoute Analytics Team
