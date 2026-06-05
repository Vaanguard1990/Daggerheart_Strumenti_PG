// Processo principale di Electron (CommonJS — il package usa "type":"module").
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

// File di salvataggio dei personaggi nella cartella dati utente dell'app.
const dataFile = () => path.join(app.getPath("userData"), "daggerheart-personaggi.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 860,
    minWidth: 360,
    backgroundColor: "#f5f0e8",
    title: "Daggerheart — Strumenti PG",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.removeMenu();

  // In sviluppo carica il dev server Vite, in produzione il bundle statico.
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

// ── IPC: persistenza e import/export ─────────────────────────────────────────
ipcMain.handle("save-data", (_event, lista) => {
  try {
    fs.writeFileSync(dataFile(), JSON.stringify(lista, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("load-data", () => {
  try {
    return JSON.parse(fs.readFileSync(dataFile(), "utf-8"));
  } catch {
    return null;
  }
});

ipcMain.handle("export-json", async (_event, json) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: "daggerheart-personaggi.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || !filePath) return false;
  try {
    fs.writeFileSync(filePath, json, "utf-8");
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("import-json", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || !filePaths || !filePaths[0]) return { ok: false };
  try {
    const data = JSON.parse(fs.readFileSync(filePaths[0], "utf-8"));
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
