@echo off
chcp 65001 >nul
title EcoRoute Analytics - Lanzador de Escritorio

echo ========================================================
echo       EcoRoute Analytics - Aplicacion de Escritorio
echo ========================================================
echo.

set APP_DIR=%~dp0
cd /d "%APP_DIR%"

:: 1. Comprobar si existe el ejecutable portable compilado
if exist "dist\EcoRoute Analytics Portable 1.0.0.exe" (
    echo [OK] Iniciando ejecutable portable nativo...
    start "" "dist\EcoRoute Analytics Portable 1.0.0.exe"
    exit /b 0
)

if exist "dist\win-arm64-unpacked\EcoRoute Analytics.exe" (
    echo [OK] Iniciando aplicacion de escritorio nativa...
    start "" "dist\win-arm64-unpacked\EcoRoute Analytics.exe"
    exit /b 0
)

if exist "dist\EcoRoute Analytics.exe" (
    echo [OK] Iniciando ejecutable nativo...
    start "" "dist\EcoRoute Analytics.exe"
    exit /b 0
)

:: 2. Comprobar si Electron esta instalado en node_modules
if exist "node_modules\electron\dist\electron.exe" (
    echo [OK] Iniciando aplicacion con Electron en ventana nativa...
    start "" "node_modules\electron\dist\electron.exe" .
    exit /b 0
)

:: 3. Intentar arrancar con npm.cmd si node esta disponible
where npm.cmd >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    if exist "package.json" (
        echo [INFO] Iniciando via Electron (npm.cmd start)...
        call npm.cmd start
        exit /b 0
    )
)

:: 4. Modo de reserva instantaneo: Modo Aplicacion Independiente con Microsoft Edge
echo [INFO] Iniciando en modo ventana de aplicacion de escritorio...
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE_PATH% (
    set EDGE_PATH="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app="file:///%APP_DIR%index.html" --window-size=1366,860
) else (
    start "" "%APP_DIR%index.html"
)

exit /b 0
