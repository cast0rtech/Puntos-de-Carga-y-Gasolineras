const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#090d16',
    title: 'EcoRoute Analytics - Infraestructura de Recarga y Repostaje',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false, // Prevents white flash during startup
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  // Load application HTML entry point
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window smoothly once DOM is rendered
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links (e.g. Google Maps or external documentation) in the OS default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (url !== currentUrl && (url.startsWith('http:') || url.startsWith('https:'))) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Build native application menu in Spanish
  buildApplicationMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function buildApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: 'Acerca de EcoRoute Analytics' },
        { type: 'separator' },
        { role: 'services', label: 'Servicios' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar EcoRoute' },
        { role: 'hideOthers', label: 'Ocultar otros' },
        { role: 'unhide', label: 'Mostrar todo' },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' }
      ]
    }] : []),
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar Datos',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        {
          label: 'Recarga Forzada',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: isMac ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edición',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'resetZoom', label: 'Tamaño original (100%)' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Disminuir zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Alternar Pantalla Completa' },
        {
          label: 'Herramientas de Desarrollador',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Repositorio GitHub',
          click: () => {
            shell.openExternal('https://github.com');
          }
        },
        {
          label: 'Open Charge Map API',
          click: () => {
            shell.openExternal('https://openchargemap.org/site/develop/api');
          }
        },
        {
          label: 'OpenStreetMap Overpass API',
          click: () => {
            shell.openExternal('https://wiki.openstreetmap.org/wiki/Overpass_API');
          }
        },
        { type: 'separator' },
        {
          label: 'Acerca de EcoRoute Analytics',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de EcoRoute Analytics',
              message: 'EcoRoute Analytics v1.0.0',
              detail: 'Plataforma de análisis de infraestructura de recarga para vehículos eléctricos (Open Charge Map) y estaciones de servicio tradicionales (OpenStreetMap Overpass API).\n\nDiseñado para ejecución local e instalación corporativa en sistemas Windows.',
              buttons: ['Aceptar'],
              icon: path.join(__dirname, 'assets', 'icon.png')
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Ensure single application instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
