const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url'); // Yeh zaroori hai production paths ke liye

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    // Icon ka path build ke baad aksar public folder se bahar nikal jata hai
    icon: path.join(__dirname, 'dist/wapexp.jpeg'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // Production mein file path ko "format" karna behtar hota hai
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Debugging: Agar build ke baad white screen aaye to ise uncomment karein
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});