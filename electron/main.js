const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "Hardi Store",
    icon: path.join(__dirname, '../Hardi_Store_BIG.ico'), // Load the icon from root
    backgroundColor: '#02040a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple local storage apps
    },
    autoHideMenuBar: true, // Hides the top menu bar (File, Edit, etc)
  });

  // In production, load the built html file
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // In development, load from Vite server
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Optional: Open DevTools
  }
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