import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Percorsi relativi: utile per il deploy statico e per l'eventuale
  // impacchettamento in Electron (il codice usa window.electronAPI).
  base: "./",
});
