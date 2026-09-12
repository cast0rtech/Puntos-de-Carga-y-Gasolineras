@echo off
chcp 65001 >nul
title Instalador EcoRoute Analytics - Para Todos los Usuarios

echo ======================================================================
echo    EcoRoute Analytics - Instalacion Global (Para Todos los Usuarios)
echo ======================================================================
echo.

:: Verificar permisos de Administrador
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Se requieren permisos de Administrador para configurar la app
    echo         para todos los perfiles de usuario del PC.
    echo.
    echo Solicitando elevacion de privilegios...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b 0
)

set APP_DIR=%~dp0

:: Si existe el instalador Setup oficial compilado por electron-builder, lanzarlo directamente
if exist "%APP_DIR%dist\EcoRoute Analytics Setup 1.0.0.exe" (
    echo [OK] Se ha detectado el instalador profesional de Windows (NSIS).
    echo      Iniciando instalador corporativo multiusuario...
    start "" "%APP_DIR%dist\EcoRoute Analytics Setup 1.0.0.exe"
    exit /b 0
)

set TARGET_DIR=%ProgramFiles%\EcoRoute Analytics
set PUBLIC_DESKTOP=%PUBLIC%\Desktop
set PUBLIC_START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs

echo [1/3] Preparando directorio corporativo en %TARGET_DIR%...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\assets" mkdir "%TARGET_DIR%\assets"

copy /Y "%APP_DIR%index.html" "%TARGET_DIR%\" >nul
copy /Y "%APP_DIR%styles.css" "%TARGET_DIR%\" >nul
copy /Y "%APP_DIR%app.js" "%TARGET_DIR%\" >nul
copy /Y "%APP_DIR%ejecutar-app.bat" "%TARGET_DIR%\" >nul
if exist "%APP_DIR%assets\icon.png" copy /Y "%APP_DIR%assets\icon.png" "%TARGET_DIR%\assets\" >nul

echo [2/3] Creando accesos directos para TODOS los usuarios del sistema...

:: Crear acceso directo en el Escritorio Publico (visible para todos los usuarios)
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%PUBLIC_DESKTOP%\EcoRoute Analytics.lnk'); $Shortcut.TargetPath = '%TARGET_DIR%\ejecutar-app.bat'; $Shortcut.WorkingDirectory = '%TARGET_DIR%'; if (Test-Path '%TARGET_DIR%\assets\icon.png') { $Shortcut.IconLocation = '%TARGET_DIR%\assets\icon.png' }; $Shortcut.Description = 'EcoRoute Analytics - Analisis de Infraestructura de Recarga'; $Shortcut.Save()"

:: Crear acceso directo en el Menu de Inicio Publico (visible para todos los usuarios)
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%PUBLIC_START_MENU%\EcoRoute Analytics.lnk'); $Shortcut.TargetPath = '%TARGET_DIR%\ejecutar-app.bat'; $Shortcut.WorkingDirectory = '%TARGET_DIR%'; if (Test-Path '%TARGET_DIR%\assets\icon.png') { $Shortcut.IconLocation = '%TARGET_DIR%\assets\icon.png' }; $Shortcut.Description = 'EcoRoute Analytics - Analisis de Infraestructura de Recarga'; $Shortcut.Save()"

echo [3/3] Instalacion finalizada con exito.
echo.
echo ======================================================================
echo  La aplicacion ha quedado instalada para TODOS LOS USUARIOS en:
echo  Carpeta: %TARGET_DIR%
echo  Acceso directo Escritorio: %PUBLIC_DESKTOP%\EcoRoute Analytics.lnk
echo  Acceso directo Menu Inicio: %PUBLIC_START_MENU%\EcoRoute Analytics.lnk
echo ======================================================================
echo.
pause
