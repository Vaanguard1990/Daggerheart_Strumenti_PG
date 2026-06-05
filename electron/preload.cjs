// Bridge sicuro fra renderer e processo principale.
// Espone window.electronAPI usato da src/App.jsx.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveData: (lista) => ipcRenderer.invoke("save-data", lista),
  loadData: () => ipcRenderer.invoke("load-data"),
  exportJSON: (json) => ipcRenderer.invoke("export-json", json),
  importJSON: () => ipcRenderer.invoke("import-json"),
});
