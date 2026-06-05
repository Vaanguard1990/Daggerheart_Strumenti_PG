# Daggerheart — Strumenti PG

Strumento web per la creazione e gestione dei personaggi di **Daggerheart**
(basato sul Manuale Base in italiano, v1.4).

Applicazione React (single-file) costruita con [Vite](https://vite.dev/).

## Caratteristiche

- Dati ufficiali integrati: Classi, Sottoclassi, Origini, Comunità, Carte dei
  Domini, Armi, Armature e Forme Bestiali.
- Calcolo automatico di statistiche, soglie di danno e avanzamenti per
  livello / rango / tier.
- Tema chiaro e scuro.
- Salvataggio locale dei personaggi (`localStorage`).
- Predisposizione per l'esecuzione come app desktop tramite Electron
  (`window.electronAPI`).

## Requisiti

- [Node.js](https://nodejs.org/) 18+ (consigliato 20+)

## Avvio in sviluppo

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato in console (di norma `http://localhost:5173`).

## Build di produzione (web)

```bash
npm run build      # genera la cartella dist/
npm run preview    # anteprima locale della build
```

## App desktop (Electron)

L'app può essere eseguita e impacchettata come applicazione desktop. La
persistenza dei personaggi e l'import/export JSON usano il file system tramite
`window.electronAPI`.

```bash
npm run electron:dev        # avvia Vite + Electron in sviluppo
npm run electron:build:win  # genera l'eseguibile Windows (.exe) in release/
```

### Eseguibile Windows tramite GitHub Actions

Il workflow [`.github/workflows/build-windows.yml`](.github/workflows/build-windows.yml)
compila l'`.exe` su un runner Windows:

- **Manuale:** GitHub → *Actions* → *Build Windows EXE* → *Run workflow*. Gli
  `.exe` (installer NSIS e versione portable) sono scaricabili dagli *Artifacts*.
- **Su tag:** un push di un tag `v*` (es. `v0.1.0`) pubblica automaticamente una
  *Release* con gli eseguibili allegati.

## Struttura del progetto

```
.
├── index.html            # entry HTML
├── vite.config.js        # configurazione Vite
├── public/
│   └── favicon.svg
├── electron/
│   ├── main.cjs          # processo principale Electron (finestra, IPC, storage)
│   └── preload.cjs       # bridge sicuro → window.electronAPI
├── .github/workflows/
│   └── build-windows.yml # CI: compila l'eseguibile Windows
└── src/
    ├── main.jsx          # bootstrap React
    └── App.jsx           # applicazione (componente principale)
```

## Note

L'intera logica e i dati di gioco risiedono in `src/App.jsx`. Gli stili sono
inseriti inline e iniettati a runtime, quindi non è presente un foglio di
stile separato.
