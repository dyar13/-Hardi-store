const { app, BrowserWindow } = require('electron');
const path = require('path');

// Disable hardware acceleration to prevent GPU freezes on some systems
app.disableHardwareAcceleration();

// Set garbage collection to run more frequently
if (global.gc) {
  setInterval(() => global.gc(), 15000); // Run GC every 15 seconds
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "Hardi Store",
    icon: path.join(__dirname, './HARDI_STORE_DESKTOP.ico'),
    backgroundColor: '#02040a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: undefined,
      v8CacheOptions: 'bypassHeatCheck'
    },
    autoHideMenuBar: true,
    show: false // Don't show until ready
  });

  // Clear cache on startup
  mainWindow.webContents.session.clearCache();
  mainWindow.webContents.session.clearStorageData({
    storages: ['localstorage', 'sessionstorage']
  });

  // Load the app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Optimize memory usage
  mainWindow.webContents.on('render-process-gone', () => {
    mainWindow = null;
  });
}

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

// Enable V8 code caching
if (mainWindow && mainWindow.webContents) {
  mainWindow.webContents.session.enableNetworkEmulation({
    offline: false,
    downloadThroughput: 10 * 1024 * 1024 / 8,
    uploadThroughput: 10 * 1024 * 1024 / 8
  });
}
