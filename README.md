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

## Build di produzione

```bash
npm run build      # genera la cartella dist/
npm run preview    # anteprima locale della build
```

## Struttura del progetto

```
.
├── index.html            # entry HTML
├── vite.config.js        # configurazione Vite
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # bootstrap React
    └── App.jsx           # applicazione (componente principale)
```

## Note

L'intera logica e i dati di gioco risiedono in `src/App.jsx`. Gli stili sono
inseriti inline e iniettati a runtime, quindi non è presente un foglio di
stile separato.
