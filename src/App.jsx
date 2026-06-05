import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// Stili globali inline (App.css integrato)
const _globalStyle = (() => {
  if (typeof document === "undefined") return;
  const id = "dh-global-style";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #f5f0e8;
      font-family: 'Crimson Pro', Georgia, 'Times New Roman', serif;
      color: #1a1208;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track { background: #ede8db; }
    ::-webkit-scrollbar-thumb { background: #c8b89a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #8b6914; }
    ::selection { background: #8b691433; color: #1a1208; }
    input:focus, select:focus, textarea:focus { outline: none; box-shadow: 0 1px 0 #2c1e0f; }
    textarea {
      background: transparent; border: 1px solid #c8b89a; border-radius: 2px;
      color: #1a1208; font-family: 'Crimson Pro', Georgia, serif;
      font-size: 0.92rem; padding: 6px 8px; width: 100%; resize: vertical;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 600px) { body { padding: 0; } }
  `;
  document.head.appendChild(s);
})();

// ============================================================
// DATI UFFICIALI - Daggerheart Manuale Base Italiano v1.4
// ============================================================

const CLASSI = {
  Bardo: {
    domini: ["Grazia", "Codice"],
    evasioneIniziale: 10,
    pfIniziali: 5,
    soglieDanno: { Minore:6, Moderato:12, Grave:19, Critico:27 },
    oggettiClasse: "Un romanzo sentimentale o una lettera mai aperta",
    privilegioSperanza: {
      nome: "Sceneggiata",
      descrizione: "Spendete 3 Speranze per Distrarre temporaneamente un bersaglio a distanza Ravvicinata, infliggendogli penalità −2 alla Difficoltà."
    },
    privilegiClasse: [
      { nome: "Chiamata A Raccolta", descrizione: "Una volta per sessione, descrivete come radunate il gruppo; poi date a voi e a ciascun alleato un Dado A Raccolta (d6 al Lv1, d8 al Lv5). Un PG può spenderlo aggiungendo il risultato a un tiro azione, reazione, danno, oppure cancellando Stress pari al risultato." }
    ],
    sottoclassi: ["Oratore", "Trovatore"]
  },
  Consacrato: {
    domini: ["Splendore", "Valore"],
    evasioneIniziale: 9,
    pfIniziali: 7,
    soglieDanno: { Minore:8, Moderato:16, Grave:25, Critico:35 },
    oggettiClasse: "Alcune offerte votive o un simbolo sacro del proprio dio",
    privilegioSperanza: {
      nome: "Proteggere la Vita",
      descrizione: "Spendete 3 Speranze per annullare la perdita di un Punto Ferita di un alleato entro distanza Ravvicinata."
    },
    privilegiClasse: [
      { nome: "Dado Preghiera", descrizione: "All'inizio di ogni sessione, tirate un numero di d4 pari al tratto da Incantatore della sottoclasse. Questi sono i vostri Dadi Preghiera. Potete spenderli per aiutare voi o un alleato entro distanza Lontana: ridurre danni in arrivo, aggiungere il risultato a un tiro, o guadagnare Speranza pari al risultato." }
    ],
    sottoclassi: ["Emissario Divino", "Sentinella Alata"]
  },
  Druido: {
    domini: ["Saggezza", "Arcano"],
    evasioneIniziale: 10,
    pfIniziali: 6,
    soglieDanno: { Minore:7, Moderato:14, Grave:22, Critico:30 },
    oggettiClasse: "Un piccolo sacchetto di rocce e ossa o uno strano ciondolo trovato nella terra",
    privilegioSperanza: {
      nome: "Evoluzione",
      descrizione: "Spendete 3 Speranze per trasformarvi in Forma Bestiale senza marcare uno Stress. Quando lo fate, aumentate un tratto di +1 finché non annullate la Forma Bestiale."
    },
    privilegiClasse: [
      { nome: "Forma Bestiale", descrizione: "Marcate uno Stress per trasformarvi magicamente in una creatura del vostro rango o inferiore dall'elenco delle Forme Bestiali. Ottenete i privilegi della forma, aggiungete il suo bonus Evasione alla vostra, e usate il tratto specificato per gli attacchi." },
      { nome: "Tocco della Natura", descrizione: "Potete eseguire a volontà effetti innocui e minori che coinvolgono la natura: far crescere un fiore, evocare una folata di vento, accendere della legna." }
    ],
    sottoclassi: ["Custode degli Elementi", "Custode del Rinnovamento"]
  },
  Fuorilegge: {
    domini: ["Mezzanotte", "Grazia"],
    evasioneIniziale: 12,
    pfIniziali: 6,
    soglieDanno: { Minore:7, Moderato:14, Grave:22, Critico:30 },
    oggettiClasse: "Un set di strumenti di contraffazione o un rampino",
    privilegioSperanza: {
      nome: "Schivata del Fuorilegge",
      descrizione: "Spendete 3 Speranze per ottenere bonus +2 all'Evasione fino al successivo attacco riuscito contro di voi. Diversamente, questo bonus dura fino al riposo successivo."
    },
    privilegiClasse: [
      { nome: "Ammantato", descrizione: "Ogni volta che sareste Nascosti, siete invece Ammantati. Quando Ammantati rimanete invisibili se fermi quando un avversario si sposta dove normalmente vi vedrebbe. Perdete Ammantato quando vi spostate nella linea di vista o attaccate." },
      { nome: "Attacco Furtivo", descrizione: "Quando colpite mentre siete Ammantati o mentre un alleato è in Mischia col bersaglio, aggiungete al tiro danni un numero di d6 pari al vostro rango (Lv1→R1, Lv2-4→R2, Lv5-7→R3, Lv8-10→R4)." }
    ],
    sottoclassi: ["Ladro", "Ombra Notturna"]
  },
  Guardiano: {
    domini: ["Valore", "Lama"],
    evasioneIniziale: 9,
    pfIniziali: 7,
    soglieDanno: { Minore:9, Moderato:18, Grave:28, Critico:40 },
    oggettiClasse: "Un dono del tuo mentore o una chiave misteriosa",
    privilegioSperanza: {
      nome: "Baluardo in Prima Linea",
      descrizione: "Spendete 3 Speranze per cancellare 2 Caselle Armatura."
    },
    privilegiClasse: [
      { nome: "Inarrestabile", descrizione: "Una volta per riposo lungo, diventate Inarrestabili. Guadagnate un Dado Inarrestabile (d4 al Lv1, d6 al Lv5). Dopo ogni tiro danni che infligge PF, aumentate il dado di 1. Quando supera il valore massimo o la scena finisce, rimuovetelo. Inarrestabili: riducete la gravità dei danni fisici di una soglia, aggiungete il valore del dado ai danni, non potete essere Trattenuti o Vulnerabili." }
    ],
    sottoclassi: ["Valoroso", "Vendicatore"]
  },
  Guerriero: {
    domini: ["Lama", "Ossa"],
    evasioneIniziale: 11,
    pfIniziali: 6,
    soglieDanno: { Minore:8, Moderato:16, Grave:25, Critico:35 },
    oggettiClasse: "Il disegno di un amante o una pietra per affilare",
    privilegioSperanza: {
      nome: "Nessuna Tregua",
      descrizione: "Spendi 3 Speranze per ottenere bonus +1 ai tiri attacco fino al prossimo riposo."
    },
    privilegiClasse: [
      { nome: "Attacco di Opportunità", descrizione: "Se un avversario entro Mischia tenta di uscirne, effettuate un tiro reazione con un tratto a vostra scelta contro la sua Difficoltà. Successo: non può muoversi, subisce danno dell'arma primaria, o vi muovete con lui (due effetti con successo critico)." },
      { nome: "Addestrato al Combattimento", descrizione: "Ignorate l'impugnatura quando equipaggiate le armi. Quando infliggete danno fisico, ottenete bonus al tiro danni pari al vostro livello." }
    ],
    sottoclassi: ["Chiamata del Coraggio", "Chiamata dello Sterminatore"]
  },
  Mago: {
    domini: ["Codice", "Splendore"],
    evasioneIniziale: 11,
    pfIniziali: 5,
    soglieDanno: { Minore:6, Moderato:12, Grave:19, Critico:27 },
    oggettiClasse: "Un libro che state cercando di tradurre o un piccolo e innocuo animaletto elementale",
    privilegioSperanza: {
      nome: "Non Questa Volta",
      descrizione: "Spendete 3 Speranze per costringere un avversario fino a distanza Lontana a ripetere un tiro attacco o di danno."
    },
    privilegiClasse: [
      { nome: "Prestidigitazione", descrizione: "Potete eseguire effetti magici innocui e di piccola entità a volontà: cambiare il colore di un abito, creare un odore, accendere una candela, far galleggiare un ninnolo, illuminare una stanza o riparare un piccolo oggetto." },
      { nome: "Segni Misteriosi", descrizione: "Scegliete un numero da 1 a 12. Quando tirate quel numero su un Dado Dualità, guadagnate una Speranza o rimuovete uno Stress. Potete cambiare il numero a ogni riposo lungo." }
    ],
    sottoclassi: ["Scuola della Conoscenza", "Scuola della Guerra"]
  },
  Ranger: {
    domini: ["Ossa", "Saggezza"],
    evasioneIniziale: 12,
    pfIniziali: 6,
    soglieDanno: { Minore:7, Moderato:14, Grave:22, Critico:30 },
    oggettiClasse: "Un trofeo della vostra prima uccisione o una bussola apparentemente rotta",
    privilegioSperanza: {
      nome: "Tienili a Bada",
      descrizione: "Quando riuscite a portare a segno un attacco con un'arma, spendete 3 Speranze per usare lo stesso tiro contro altri due avversari alla stessa distanza dell'attacco riuscito."
    },
    privilegiClasse: [
      { nome: "Focus del Ranger", descrizione: "Spendete una Speranza e attaccate un bersaglio. Se l'attacco ha successo, infliggete i normali danni e il bersaglio diventa il vostro Focus. Finché dura: sapete dove si trova, quando gli infliggete danno deve marcare uno Stress, se fallite un attacco potete terminare l'effetto per rilanciare i Dadi Dualità." }
    ],
    sottoclassi: ["Apripista", "Ferale"]
  },
  Stregone: {
    domini: ["Arcano", "Mezzanotte"],
    evasioneIniziale: 10,
    pfIniziali: 6,
    soglieDanno: { Minore:6, Moderato:12, Grave:19, Critico:27 },
    oggettiClasse: "Un globo sussurrante o un cimelio di famiglia",
    privilegioSperanza: {
      nome: "Magia Volatile",
      descrizione: "Spendete 3 Speranze per rilanciare un numero qualsiasi di dadi di danno in un attacco che infligge danni magici."
    },
    privilegiClasse: [
      { nome: "Percezione Arcana", descrizione: "Potete percepire la presenza di persone con il dono della magia e di oggetti incantati a distanza Ravvicinata." },
      { nome: "Illusione Minore", descrizione: "Tiro Incantesimo (10). Se riuscite, create un'illusione visiva minore, non più grande della vostra taglia, entro distanza Ravvicinata. Convincente per chi è a distanza Ravvicinata o maggiore." },
      { nome: "Incanalare il Potere Grezzo", descrizione: "Una volta per riposo lungo, spostate una carta dominio dalla Dotazione alla riserva e scegliete: guadagnare Speranza pari al livello della carta, oppure potenziare un incantesimo con bonus ai danni pari al doppio del livello." }
    ],
    sottoclassi: ["Potere Elementale", "Potere Primordiale"]
  }
};

const SOTTOCLASSI = {
  // BARDO
  "Oratore": {
    classe: "Bardo",
    tratto: "Presenza",
    base: [
      { nome: "Discorso Ispiratore", descrizione: "Una volta per riposo lungo, pronunciate un discorso accorato. Tutti gli alleati entro distanza Lontana rimuovono 2 Stress." },
      { nome: "Cuore di Poeta", descrizione: "Dopo aver effettuato un tiro azione per impressionare, persuadere o offendere qualcuno, potete spendere una Speranza per aggiungere un d4 al tiro." }
    ],
    spec: [
      { nome: "Eloquente", descrizione: "Una volta per sessione, quando incoraggiate un alleato, scegliete: permettergli di trovare un oggetto comune utile, aiutarlo senza spendere Speranza, o assegnargli una mossa di interludio aggiuntiva al prossimo riposo." }
    ],
    maestria: [
      { nome: "Poesia Epica", descrizione: "Il Dado A Raccolta aumenta a d10. Quando Aiutate un Alleato, potete narrare il momento come se steste scrivendo la storia del suo eroismo. Quando lo fate, tirate un d10 come dado vantaggio." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Trovatore": {
    classe: "Bardo",
    tratto: "Presenza",
    base: [
      { nome: "Musico Eccezionale", descrizione: "Vi esibite per gli altri. Ogni canzone eseguibile una sola volta per riposo lungo:\n• Canzone Popolare: voi e alleati a Ravvicinata recuperate 1 PF.\n• Canto Epico: rendete temporaneamente Vulnerabile un bersaglio a Ravvicinata.\n• Ballata: voi e alleati a Ravvicinata guadagnate una Speranza." }
    ],
    spec: [
      { nome: "Maestro", descrizione: "Le vostre canzoni accendono il coraggio. Quando assegnate un Dado A Raccolta a un alleato, questi può guadagnare una Speranza o rimuovere uno Stress." }
    ],
    maestria: [
      { nome: "Virtuoso", descrizione: "Siete tra i più grandi musicisti mai vissuti. Potete eseguire ogni canzone di Musico Eccezionale due volte invece di una per riposo lungo." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // CONSACRATO
  "Emissario Divino": {
    classe: "Consacrato",
    tratto: "Forza",
    base: [
      { nome: "Arma Animata", descrizione: "Quando impugnate un'arma Mischia o Prossima, questa può volare per attaccare un avversario entro Ravvicinata e tornare nelle vostre mani. Potete marcare uno Stress per colpire un altro avversario entro portata con lo stesso tiro." },
      { nome: "Tocco Ristoratore", descrizione: "Una volta per riposo lungo, toccando una creatura potete curare 2 Punti Ferita o rimuovere 2 Stress." }
    ],
    spec: [
      { nome: "Devoto", descrizione: "Quando tirate i Dadi Preghiera, potete tirare un dado aggiuntivo e scartare il risultato più basso. Inoltre, potete usare Tocco Ristoratore due volte invece di una per riposo lungo." }
    ],
    maestria: [
      { nome: "Risonanza Celestiale", descrizione: "Quando tirate i danni per l'Arma Animata, se i risultati dei dadi coincidono, raddoppiate il valore di ogni dado corrispondente. (Es. due 5 contano come due 10.)" }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Sentinella Alata": {
    classe: "Consacrato",
    tratto: "Forza",
    base: [
      { nome: "Ali di Luce", descrizione: "Potete volare. In volo potete: marcare uno Stress per afferrare e trasportare una creatura consenziente della vostra taglia o più piccola; spendere una Speranza per infliggere 1d8 danni extra in un attacco riuscito." }
    ],
    spec: [
      { nome: "Volto Celeste", descrizione: "Il vostro volto soprannaturale incute timore. In volo avete vantaggio sui Tiri Presenza. Quando avete successo con Speranza in un Tiro Presenza, potete rimuovere una Paura dalla riserva del GM invece di guadagnare Speranza." }
    ],
    maestria: [
      { nome: "Ascendente", descrizione: "Guadagnate bonus +4 permanente alla soglia dei danni Gravi." },
      { nome: "Potere degli Dèi", descrizione: "In volo grazie ad Ali di Luce, infliggete 1d12 danni extra invece di 1d8." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // DRUIDO
  "Custode degli Elementi": {
    classe: "Druido",
    tratto: "Istinto",
    base: [
      { nome: "Incarnazione Elementale", descrizione: "Marcate uno Stress per Incanalare un elemento finché non subite un danno Grave o al prossimo riposo:\n• Fuoco: avversario in Mischia che vi infligge danno subisce 1d10 magici.\n• Terra: bonus alle soglie danno pari alla vostra Competenza.\n• Acqua: infliggere danno in Mischia → tutti gli altri avversari entro Prossima marchino uno Stress.\n• Aria: librarvi in aria, vantaggio nei Tiri Agilità." }
    ],
    spec: [
      { nome: "Aura Elementale", descrizione: "Una volta per riposo, mentre Incanalate, ammantarvi di un'aura (bersagli entro Ravvicinata):\n• Fuoco: quando subisce PF deve marcare uno Stress.\n• Terra: alleati +1 alla Forza.\n• Acqua: quando vi infliggono danno, spostate il nemico entro Prossima.\n• Aria: riducete i danni da attacchi non in Mischia di 1d8." }
    ],
    maestria: [
      { nome: "Dominio Elementale", descrizione: "Mentre Incanalate, ottenete il beneficio corrispondente:\n• Fuoco: +1 Competenza per attacchi/incantesimi che infliggono danni.\n• Terra: per ogni PF subito, tirate d6; per ogni 6, riducete di 1 i PF subiti.\n• Acqua: attacco va a segno → marcare Stress per rendere l'attaccante Vulnerabile.\n• Aria: +1 Evasione e potete volare." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Custode del Rinnovamento": {
    classe: "Druido",
    tratto: "Istinto",
    base: [
      { nome: "Illuminazione della Natura", descrizione: "Una volta per riposo lungo, create uno spazio di serenità naturale entro Ravvicinata. Trascorrendo alcuni minuti al suo interno, rimuovete un totale di Stress pari al vostro Istinto, a scelta tra voi e i vostri alleati." },
      { nome: "Rigenerazione", descrizione: "Toccate una creatura e spendete 3 Speranze. La creatura recupera 1d4 Punti Ferita." }
    ],
    spec: [
      { nome: "Onda Rigenerante", descrizione: "Con Rigenerazione potete bersagliare creature entro distanza Prossima." },
      { nome: "Protezione del Guardiano", descrizione: "Una volta per riposo lungo, spendete 2 Speranze per curare 2 PF a 1d4 alleati a distanza Ravvicinata." }
    ],
    maestria: [
      { nome: "Difensore", descrizione: "La vostra trasformazione animale incarna uno spirito protettore. In Forma Bestiale, quando un alleato entro Ravvicinata subisce 2+ PF, potete marcare uno Stress per ridurre di 1 i PF subiti." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // FUORILEGGE
  "Ladro": {
    classe: "Fuorilegge",
    tratto: "Astuzia",
    base: [
      { nome: "Legami", descrizione: "Quando arrivate in una città o luogo importante, descrivete una persona che avete già conosciuto lì. Datele un nome, annotate come può esservi utile, e scegliete un fatto: mi deve un favore (difficile trovarla) / chiederà qualcosa in cambio / è sempre in gran difficoltà / una volta stavamo insieme / non ci siamo lasciati in buoni rapporti." }
    ],
    spec: [
      { nome: "Amici Ovunque", descrizione: "Una volta per sessione, chiamate brevemente un contatto dalla dubbia fama. Scegliete: vi fornisce 1 manciata d'oro, uno strumento unico o oggetto normale; al prossimo tiro azione, +3 al Dado Speranza o Paura; la prossima volta che infliggete danno, attacca a distanza aggiungendo 2d8 ai vostri danni." }
    ],
    maestria: [
      { nome: "Supporto Fidato", descrizione: "Utilizzate Amici Ovunque tre volte per sessione. Opzioni aggiuntive: quando subite PF, può accorrere riducendo di 1 i PF; quando effettuate un Tiro Presenza, vi sostiene e potete tirare un d20 come Dado Speranza." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Ombra Notturna": {
    classe: "Fuorilegge",
    tratto: "Astuzia",
    base: [
      { nome: "Passo d'Ombra", descrizione: "Potete spostarvi da un'ombra a un'altra. Quando vi spostate in un'area di oscurità o nell'ombra di un'altra creatura/oggetto, marcate uno Stress per scomparire e riapparire in un'altra ombra entro distanza Lontana. Quando riapparite, siete Ammantati." }
    ],
    spec: [
      { nome: "Nube di Tenebra", descrizione: "Tiro Incantesimo (15). Se riuscite, create una nube oscura che copre ogni cosa entro Ravvicinata. Chi è dentro non vede fuori e viceversa. Siete Ammantati per ogni avversario a cui la nube blocca la vista." },
      { nome: "Adrenalina", descrizione: "Quando siete Vulnerabili, aggiungete il vostro livello ai tiri dei danni." }
    ],
    maestria: [
      { nome: "Ombra Sfuggente", descrizione: "Bonus +1 permanente all'Evasione. Passo d'Ombra può portarvi fino a distanza Remota." },
      { nome: "Svanire", descrizione: "Marcate uno Stress per diventare Ammantati in qualsiasi momento. Eliminate automaticamente la condizione Trattenuto. Rimanete Ammantati finché non tirate con Paura o al prossimo riposo." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // GUARDIANO
  "Valoroso": {
    classe: "Guardiano",
    tratto: null,
    base: [
      { nome: "Saldo", descrizione: "Guadagnate bonus permanente +1 alle soglie di danno." },
      { nome: "Volontà di Ferro", descrizione: "Quando subite danni fisici, potete marcare un'ulteriore Casella Armatura per ridurne la gravità." }
    ],
    spec: [
      { nome: "Implacabile", descrizione: "Guadagnate bonus +2 permanente alle soglie di danno." },
      { nome: "Compagni d'Arme", descrizione: "Quando un alleato entro Ravvicinata subisce danni, potete marcare una Casella Armatura per ridurne la gravità di una soglia." }
    ],
    maestria: [
      { nome: "Imperturbabile", descrizione: "Guadagnate bonus +3 permanente alle soglie di danno." },
      { nome: "Protettore Fedele", descrizione: "Quando un alleato entro Ravvicinata ha 2 o meno PF e sta per subire un danno, marcate uno Stress per correre al suo fianco e subire il danno al suo posto." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Vendicatore": {
    classe: "Guardiano",
    tratto: null,
    base: [
      { nome: "A Suo Agio", descrizione: "Guadagnate uno Stress aggiuntivo." },
      { nome: "Vendetta", descrizione: "Quando un avversario in Mischia riesce ad attaccarvi, potete marcare 2 Stress per costringere l'attaccante a subire un Punto Ferita." }
    ],
    spec: [
      { nome: "Rappresaglia", descrizione: "Quando un avversario danneggia un alleato entro Mischia, ottenete +1 alla Competenza per il successivo attacco riuscito contro quell'avversario." }
    ],
    maestria: [
      { nome: "Nemesi", descrizione: "Spendete 2 Speranze per Dare Priorità a un avversario fino al prossimo riposo. Quando attaccate l'avversario prioritario, potete scambiare i risultati dei Dadi Speranza e Paura. Un solo avversario prioritario alla volta." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // GUERRIERO
  "Chiamata del Coraggio": {
    classe: "Guerriero",
    tratto: null,
    base: [
      { nome: "Coraggio", descrizione: "Quando fallite un tiro con Paura, guadagnate una Speranza." },
      { nome: "Riti di Battaglia", descrizione: "Una volta per riposo lungo, prima di tentare qualcosa di incredibilmente pericoloso o affrontare un nemico che vi supera, descrivete il rituale che eseguite. Quando lo fate, rimuovete 2 Stress e guadagnate 2 Speranze." }
    ],
    spec: [
      { nome: "Raccogliere la Sfida", descrizione: "Siete vigili di fronte al pericolo crescente. Quando avete 2 o meno Punti Ferita, potete tirare un d20 come Dado Speranza." }
    ],
    maestria: [
      { nome: "Commilitoni", descrizione: "Potete effettuare un Tiro Combinato una volta in più per sessione. Quando un alleato inizia un Tiro Combinato con voi, deve spendere solo 2 Speranze." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Chiamata dello Sterminatore": {
    classe: "Guerriero",
    tratto: null,
    base: [
      { nome: "Sterminatore", descrizione: "Ottenete i Dadi dello Sterminatore. Quando tirate con Speranza, potete mettere un d6 sulla carta invece di guadagnare Speranza (max = Competenza). Quando attaccate o tirate i danni, spendete quanti dadi volete aggiungendo i risultati. Fine sessione: rimuovete dadi non spesi e guadagnate 1 Speranza per dado." }
    ],
    spec: [
      { nome: "Specialista delle Armi", descrizione: "Quando avete successo in un attacco, spendete una Speranza per aggiungere un dado di danno dell'arma secondaria. Una volta per riposo lungo, quando tirate i Dadi dello Sterminatore potete ripetere l'esito di qualsiasi 1." }
    ],
    maestria: [
      { nome: "Addestramento Marziale", descrizione: "Il vostro gruppo accede alla mossa Addestramento Marziale durante il riposo. Voi e ogni alleato che la sceglie guadagnate un d6 di Dado dello Sterminatore, spendibile su un tiro attacco o danno." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // MAGO
  "Scuola della Conoscenza": {
    classe: "Mago",
    tratto: "Conoscenza",
    base: [
      { nome: "Preparato", descrizione: "Prendete una carta dominio aggiuntiva del vostro livello o inferiore da un dominio a cui avete accesso." },
      { nome: "Iniziato", descrizione: "Quando Utilizzate un'Esperienza, potete marcare uno Stress invece di spendere Speranza. Se lo fate, raddoppiate il modificatore dell'Esperienza per quel tiro." }
    ],
    spec: [
      { nome: "Esperto", descrizione: "Prendete una carta dominio aggiuntiva del vostro livello o inferiore da un dominio a cui avete accesso." },
      { nome: "Memoria Perfetta", descrizione: "Una volta per riposo, quando richiamate una carta dominio nella riserva, potete ridurre di 1 il suo Costo di Richiamo." }
    ],
    maestria: [
      { nome: "Brillante", descrizione: "Prendete una carta dominio aggiuntiva del vostro livello o inferiore da un dominio a cui avete accesso." },
      { nome: "Padronanza Affinata", descrizione: "Quando Utilizzate un'Esperienza, tirate un d6. Con 5 o superiore, potete utilizzarla senza spendere Speranza." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Scuola della Guerra": {
    classe: "Mago",
    tratto: "Conoscenza",
    base: [
      { nome: "Magia da Battaglia", descrizione: "Avete concentrato i vostri sforzi per diventare incontrastabili. Guadagnate una casella aggiuntiva di Punti Ferita." },
      { nome: "Affronta la Tua Paura", descrizione: "Quando avete successo con Paura in un tiro di attacco, infliggete 1d10 danni magici addizionali." }
    ],
    spec: [
      { nome: "Evoca Scudo", descrizione: "Potete evocare una barriera protettiva di magia. Finché avete almeno 2 Speranze, aggiungete la vostra Competenza all'Evasione." },
      { nome: "Alimentato dalla Paura", descrizione: "Il danno magico di Affronta la Tua Paura aumenta a 2d10." }
    ],
    maestria: [
      { nome: "Prosperare nel Caos", descrizione: "Quando un attacco va a segno, marcate uno Stress dopo aver tirato i danni per costringere il bersaglio a subire un PF aggiuntivo." },
      { nome: "Non Conoscerai la Paura", descrizione: "Il danno magico di Affronta la Tua Paura aumenta a 3d10." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // RANGER
  "Apripista": {
    classe: "Ranger",
    tratto: "Agilità",
    base: [
      { nome: "Predatore Spietato", descrizione: "Quando effettuate un tiro per i danni, potete marcare uno Stress per ottenere +1 alla Competenza. Inoltre, quando infliggete un danno Grave a un avversario, quest'ultimo deve marcare uno Stress." },
      { nome: "La Via Prosegue", descrizione: "Quando viaggiate verso un luogo già visitato o portate con voi un oggetto già stato lì, potete individuare il percorso più breve e diretto." }
    ],
    spec: [
      { nome: "Predatore Furtivo", descrizione: "Quando il vostro Focus compie un attacco contro di voi, ottenete +2 alla vostra Evasione contro tale attacco." }
    ],
    maestria: [
      { nome: "Predatore Dominante", descrizione: "Prima di attaccare il vostro Focus, potete spendere una Speranza. Se l'attacco ha successo, rimuovete una Paura dalla riserva di Paura del GM." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Ferale": {
    classe: "Ranger",
    tratto: "Agilità",
    base: [
      { nome: "Compagno", descrizione: "Avete un compagno animale a vostra scelta (a discrezione del GM). Rimane al vostro fianco a meno che non gli ordiniate altrimenti. Prendete la scheda del Compagno del Ranger. Quando salite di livello, scegliete anche un'opzione di aumento per il compagno." }
    ],
    spec: [
      { nome: "Addestramento Intensivo", descrizione: "Scegliete un'ulteriore opzione di aumento di livello per il vostro compagno." },
      { nome: "Uniti nella Battaglia", descrizione: "Quando un avversario vi attacca mentre si trova in Mischia con il vostro compagno, guadagnate +2 alla vostra Evasione contro l'attacco." }
    ],
    maestria: [
      { nome: "Addestramento Avanzato", descrizione: "Scegliete due opzioni di aumento di livello aggiuntive per il compagno." },
      { nome: "Amico Fedele", descrizione: "Una volta per riposo lungo, quando il danno marcerebbe l'ultimo Stress del compagno o subireste il vostro ultimo PF ed entrambi siete entro Prossima, voi o il compagno potete accorrere al fianco dell'altro." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  // STREGONE
  "Potere Elementale": {
    classe: "Stregone",
    tratto: "Istinto",
    base: [
      { nome: "Elementalista", descrizione: "Scegliete un elemento: Aria, Acqua, Fulmine, Fuoco, Terra. Potete plasmare quest'elemento generando effetti innocui. Inoltre, spendendo una Speranza e descrivendo come favorisce un tiro azione, ottenete +2 al tiro azione o +3 al tiro per i danni." }
    ],
    spec: [
      { nome: "Scudo della Natura", descrizione: "Quando un tiro attacco contro di voi ha successo, marcate uno Stress e descrivete come usate l'elemento per difendervi. Tirate un d6 e aggiungetelo alla vostra Evasione contro quell'attacco." }
    ],
    maestria: [
      { nome: "Trascendenza", descrizione: "Una volta per riposo lungo, trasformatevi in una manifestazione fisica del vostro elemento. Scegliete due benefici fino al riposo successivo: +4 alla soglia danno Grave, +1 a un tratto a scelta, +1 alla Competenza, +2 all'Evasione." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  },
  "Potere Primordiale": {
    classe: "Stregone",
    tratto: "Istinto",
    base: [
      { nome: "Manipolare la Magia", descrizione: "Dopo aver lanciato un incantesimo o effettuato un attacco magico, potete marcare uno Stress per attivare un effetto: estendere la portata di una categoria, ottenere +2 al risultato del tiro azione, raddoppiare un dado danno a scelta, colpire un altro bersaglio entro portata." }
    ],
    spec: [
      { nome: "Aiuto Incantato", descrizione: "Quando Aiutate un Alleato con un Tiro Incantesimo, tirate un d8 come dado vantaggio. Una volta per riposo lungo, dopo che un alleato ha effettuato un Tiro Incantesimo con il vostro aiuto, potete scambiare i risultati dei suoi Dadi Dualità." }
    ],
    maestria: [
      { nome: "Infusione Arcana", descrizione: "Quando subite danno magico, diventate Infusi. Oppure spendete 2 Speranze per diventare Infusi. Quando attaccate con magia mentre Infusi, rilasciate la condizione per +10 al tiro danno o +3 alla Difficoltà del tiro reazione." }
    ],
    livelloSpec: 4,
    livelloMaestria: 7
  }
};

const ORIGINI = {
  Clank: {
    descrizione: "Esseri meccanici senzienti costruiti con metallo, legno e pietra.",
    tratti: [
      { nome: "Scopo Preciso", descrizione: "Decidete chi vi ha creato e per quale scopo. Scegliete una delle vostre Esperienze allineata con tale finalità e guadagnate bonus +1 permanente a essa." },
      { nome: "Efficiente", descrizione: "Quando effettuate un riposo breve, potete scegliere una mossa di riposo lungo invece di una di riposo breve." }
    ]
  },
  Drakona: {
    descrizione: "Assomigliano a draghi senza ali in forma umanoide, con soffio elementale.",
    tratti: [
      { nome: "Scaglie", descrizione: "Le scaglie fungono da protezione naturale. Quando subite danni Gravi, potete marcare uno Stress per subire 1 PF in meno." },
      { nome: "Soffio Elementale", descrizione: "Scegliete un elemento (elettricità, fuoco, ghiaccio...). Soffiate contro un bersaglio o gruppo entro distanza Prossima come arma basata sull'Istinto che infligge d8 danni magici applicando la vostra Competenza." }
    ]
  },
  Nani: {
    descrizione: "Umanoidi di bassa statura con ossatura quadrata, muscolatura densa e folto pelo corporeo.",
    tratti: [
      { nome: "Pelle Dura", descrizione: "Quando subite un danno Minore, potete marcare 2 Stress invece di subire un Punto Ferita." },
      { nome: "Resistenza Aumentata", descrizione: "Spendete 3 Speranze per dimezzare i danni fisici in arrivo." }
    ]
  },
  Elfi: {
    descrizione: "Umanoidi alti con orecchie a punta e sensi molto acuti.",
    tratti: [
      { nome: "Reazione Istintiva", descrizione: "Marcate uno Stress per ottenere vantaggio in un tiro reazione." },
      { nome: "Dormiveglia", descrizione: "Durante un riposo, potete cadere in trance per scegliere una mossa di interludio aggiuntiva." }
    ]
  },
  Fatati: {
    descrizione: "Creature umanoidi alate con tratti da insetto.",
    tratti: [
      { nome: "Portafortuna", descrizione: "Una volta per sessione, dopo che voi o un alleato consenziente entro Ravvicinata effettuate un tiro azione, potete spendere 3 Speranze per rilanciare i Dadi Dualità." },
      { nome: "Ali", descrizione: "Potete volare. In volo, potete marcare uno Stress dopo che un avversario vi ha attaccato per ottenere +2 alla vostra Evasione contro quell'attacco." }
    ]
  },
  Fauni: {
    descrizione: "Assomigliano a capre, pecore, stambecchi o camosci umanoidi con corna ricurve, pupille quadrate e zoccoli fessi.",
    tratti: [
      { nome: "Balzo Caprino", descrizione: "Potete saltare entro qualsiasi punto a distanza Ravvicinata come se usaste un normale movimento, consentendovi di superare ostacoli, saltare attraverso spazi vuoti o scalare barriere con facilità." },
      { nome: "Calcio", descrizione: "Quando riuscite in un attacco contro un bersaglio in Mischia, potete marcare uno Stress per scalciare via il bersaglio o voi stessi, infliggendo 2d6 danni aggiuntivi e spostando voi o il bersaglio entro distanza Prossima." }
    ]
  },
  Firbolg: {
    descrizione: "Umanoidi dai tratti bovini, con naso largo e orecchie lunghe e cadenti.",
    tratti: [
      { nome: "Carica", descrizione: "Quando riuscite in un Tiro Agilità per spostarvi da distanza Lontana o Remota a Mischia con uno o più bersagli, potete marcare uno Stress per infliggere 1d12 danni fisici a tutti i bersagli entro Mischia." },
      { nome: "Irremovibile", descrizione: "Quando dovreste marcare uno Stress, tirate un d6. Con un risultato di 6, non dovete marcarlo." }
    ]
  },
  Fungril: {
    descrizione: "Assomigliano a funghi umanoidi.",
    tratti: [
      { nome: "Cerchio dei Fungril", descrizione: "Effettuate un Tiro Istinto (12) per comunicare con altri fungril tramite la struttura micellare. In caso di successo, potete comunicare a qualsiasi distanza." },
      { nome: "Connessione con i Morti", descrizione: "Toccando un cadavere morto di recente, potete marcare uno Stress per estrarre dal cadavere un ricordo legato a un'emozione o sensazione specifica a vostra scelta." }
    ]
  },
  Galapa: {
    descrizione: "Assomigliano a tartarughe antropomorfe con grandi gusci a cupola.",
    tratti: [
      { nome: "Guscio", descrizione: "Guadagnate un bonus alle soglie di danno pari alla vostra Competenza." },
      { nome: "Rinchiudersi", descrizione: "Marcate uno Stress per ritrarvi nel guscio. Nel guscio: resistenza ai danni fisici, ma svantaggio ai tiri azione e non potete muovervi." }
    ]
  },
  Giganti: {
    descrizione: "Umanoidi imponenti con spalle larghe, braccia lunghe e da uno a tre occhi.",
    tratti: [
      { nome: "Resistenza", descrizione: "Guadagnate una casella aggiuntiva nei Punti Ferita alla creazione del personaggio." },
      { nome: "Raggiungere", descrizione: "Potete considerare qualsiasi arma, abilità, incantesimo o caratteristica con portata di Mischia come se avesse invece portata Prossima." }
    ]
  },
  Goblin: {
    descrizione: "Piccoli umanoidi riconoscibili per i loro grandi occhi e le ampie orecchie membranose.",
    tratti: [
      { nome: "Piè Fermo", descrizione: "Ignorate qualsiasi svantaggio sui Tiri Agilità." },
      { nome: "Senso del Pericolo", descrizione: "Una volta per riposo, marcate uno Stress per costringere un avversario a ripetere un attacco contro di voi o contro un alleato entro distanza Prossima." }
    ]
  },
  Halfling: {
    descrizione: "Umanoidi di piccole dimensioni, con grandi piedi pelosi e orecchie prominenti e arrotondate.",
    tratti: [
      { nome: "Quadrifoglio", descrizione: "All'inizio di ogni sessione, tutti i membri del gruppo di cui fate parte (voi compresi) ottengono una Speranza." },
      { nome: "Bussola Interna", descrizione: "Quando ottenete un 1 sul Dado Speranza, potete rilanciarlo." }
    ]
  },
  Umani: {
    descrizione: "Riconoscibili per le mani abili, le orecchie arrotondate e una struttura corporea naturalmente resistente.",
    tratti: [
      { nome: "Vigore", descrizione: "Guadagnate una casella Stress aggiuntiva alla creazione del personaggio." },
      { nome: "Versatilità", descrizione: "Quando fallite un tiro che utilizza una delle vostre Esperienze, potete marcare uno Stress per ripetere il tiro." }
    ]
  },
  Infernis: {
    descrizione: "Umanoidi con denti canini affilati, orecchie a punta e corna. Discendenti dei demoni delle Cerchie Infere.",
    tratti: [
      { nome: "Senzapaura", descrizione: "Quando tirate con Paura, potete marcare 2 Stress per trasformarlo in un tiro con Speranza." },
      { nome: "Volto Spaventoso", descrizione: "Avete vantaggio ai tiri per intimidire le creature ostili." }
    ]
  },
  "Katàri": {
    descrizione: "Umanoidi felini con artigli retrattili, pupille a fessura verticale e orecchie alte e triangolari.",
    tratti: [
      { nome: "Istinti Felini", descrizione: "Quando effettuate un Tiro Agilità, potete spendere 2 Speranze per rilanciare il Dado Speranza." },
      { nome: "Artigli Retrattili", descrizione: "Effettuate un Tiro Agilità per graffiare un bersaglio in Mischia. In caso di successo, il bersaglio diventa temporaneamente Vulnerabile." }
    ]
  },
  Orchi: {
    descrizione: "Umanoidi con tratti spigolosi e zanne simili a quelle di un cinghiale.",
    tratti: [
      { nome: "Robusto", descrizione: "Quando vi resta 1 Punto Ferita, gli attacchi nei vostri confronti hanno svantaggio." },
      { nome: "Zanne", descrizione: "Quando riuscite in un attacco contro un bersaglio in Mischia, potete spendere una Speranza per sventrare il bersaglio con le zanne, infliggendo 1d6 danni extra." }
    ]
  },
  Ribbet: {
    descrizione: "Assomigliano a rane antropomorfe con occhi sporgenti e mani e piedi palmati.",
    tratti: [
      { nome: "Anfibio", descrizione: "Potete respirare e muovervi naturalmente sott'acqua." },
      { nome: "Lingualunga", descrizione: "Potete usare la lingua per afferrare oggetti entro distanza Ravvicinata. Marcate uno Stress per usarla come arma Ravvicinata basata su Astuzia che infligge d12 danni fisici applicando la vostra Competenza." }
    ]
  },
  Simiah: {
    descrizione: "Assomigliano a scimmie antropomorfe con arti lunghi e piedi prensili.",
    tratti: [
      { nome: "Scalatore Naturale", descrizione: "Avete vantaggio sui Tiri Agilità che riguardano l'equilibrio e l'arrampicata." },
      { nome: "Scioltezza", descrizione: "Guadagnate bonus +1 permanente all'Evasione alla creazione del personaggio." }
    ]
  }
};

const COMUNITA = {
  "Privilegiata": {
    descrizione: "Abituati a una vita di eleganza, opulenza e prestigio all'interno delle alte sfere della società.",
    tratto: { nome: "Privilegio", descrizione: "Avete vantaggio nei tiri per interagire con la nobiltà, contrattare un prezzo o sfruttare la vostra reputazione per ottenere ciò che volete." }
  },
  "Erudita": {
    descrizione: "Appartenete a una cultura che dà priorità alla conoscenza e alle capacità politiche.",
    tratto: { nome: "Acculturato", descrizione: "Avete vantaggio ai tiri che riguardano la storia, la cultura o l'orientamento politico di un individuo o di una regione." }
  },
  "Austera": {
    descrizione: "Provenite da una cultura che si concentra sulla disciplina o sulla fede.",
    tratto: { nome: "Dedizione", descrizione: "Annotate tre detti o valori che la vostra educazione vi ha trasmesso. Una volta per riposo, quando descrivete come incarnate questi principi attraverso l'azione che state compiendo, potete tirare un d20 come dado Speranza." }
  },
  "Montanara": {
    descrizione: "Chiamate casa le cime rocciose e i dirupi aguzzi delle alte vette.",
    tratto: { nome: "Costanza", descrizione: "Avete vantaggio ai tiri per attraversare scogliere e sporgenze pericolose, orientarvi in ambienti difficili e sfruttare le vostre conoscenze di sopravvivenza." }
  },
  "Marittima": {
    descrizione: "Vivete su o vicino a un grande specchio d'acqua.",
    tratto: { nome: "Sentire la Marea", descrizione: "Quando tirate con Paura, posizionate un gettone sulla carta comunità (max = livello). Prima di un tiro azione, potete spendere un numero qualsiasi di gettoni per ottenere +1 per ogni gettone speso. Fine sessione: rimuovete tutti i gettoni non spesi." }
  },
  "Bassifondi": {
    descrizione: "Appartenete a un gruppo che opera al di fuori della legge: criminali, truffatori e artisti del raggiro.",
    tratto: { nome: "Furfante", descrizione: "Avete vantaggio ai tiri per negoziare con i criminali, per riconoscere le menzogne o per trovare un posto sicuro dove nascondervi." }
  },
  "Sotterranea": {
    descrizione: "Appartenete a una società che si è sviluppata sotto la superficie.",
    tratto: { nome: "Vivere nel Crepuscolo", descrizione: "Quando vi trovate in un'area in penombra o nell'oscurità, avete vantaggio ai tiri per nascondersi, indagare o percepire i dettagli." }
  },
  "Nomade": {
    descrizione: "Avete condotto una vita errante, sperimentando un'ampia varietà di culture.",
    tratto: { nome: "Sacca da Viaggio", descrizione: "Aggiungete una Sacca da Viaggio all'inventario. Una volta per sessione, potete spendere una Speranza per rovistare nella sacca in cerca di un oggetto comune utile per la situazione." }
  },
  "Forestale": {
    descrizione: "Vivete nel profondo dei boschi.",
    tratto: { nome: "Piè Leggero", descrizione: "Il vostro movimento è naturalmente silenzioso. Avete vantaggio ai tiri per muovervi senza essere uditi." }
  }
};

const TRATTI = ["Agilità", "Forza", "Astuzia", "Istinto", "Presenza", "Conoscenza"];
const LIVELLI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Opzioni di avanzamento per rango (Daggerheart v1.1)
// Ogni opzione ha: id, label, desc, caselle (quante volte può essere scelta nel rango)
const AVANZAMENTI_RANGO = {
  2: [ // Rango 2: Lv 2-4
    { id:"tratti",      caselle:2, label:"Bonus +1 a due tratti",      desc:"Scegliete due tratti non marcati, ottenete +1 permanente a ciascuno e marcateli. Non potete aumentarli di nuovo fino al prossimo reset (Lv5)." },
    { id:"pf",          caselle:2, label:"Casella PF permanente",       desc:"Guadagnate una casella Punti Ferita permanente." },
    { id:"stress",      caselle:2, label:"Casella Stress permanente",   desc:"Guadagnate una casella Stress permanente." },
    { id:"esperienze",  caselle:2, label:"Bonus +1 a due Esperienze",   desc:"Scegliete due Esperienze sulla scheda e ottenete +1 permanente a ciascuna." },
    { id:"carta",       caselle:1, label:"Carta dominio aggiuntiva",    desc:"Scegliete una carta dominio di livello ≤ vostro (max Lv4) da un dominio a cui avete accesso." },
    { id:"evasione",    caselle:1, label:"Bonus +1 all'Evasione",       desc:"Guadagnate bonus +1 permanente all'Evasione." },
  ],
  3: [ // Rango 3: Lv 5-7
    { id:"tratti",      caselle:2, label:"Bonus +1 a due tratti",      desc:"Scegliete due tratti non marcati, ottenete +1 permanente a ciascuno e marcateli. Non potete aumentarli di nuovo fino al prossimo reset (Lv8)." },
    { id:"pf",          caselle:2, label:"Casella PF permanente",       desc:"Guadagnate una casella Punti Ferita permanente." },
    { id:"stress",      caselle:2, label:"Casella Stress permanente",   desc:"Guadagnate una casella Stress permanente." },
    { id:"esperienze",  caselle:2, label:"Bonus +1 a due Esperienze",   desc:"Scegliete due Esperienze sulla scheda e ottenete +1 permanente a ciascuna." },
    { id:"carta",       caselle:1, label:"Carta dominio aggiuntiva",    desc:"Scegliete una carta dominio di livello ≤ vostro (max Lv7) da un dominio a cui avete accesso." },
    { id:"evasione",    caselle:1, label:"Bonus +1 all'Evasione",       desc:"Guadagnate bonus +1 permanente all'Evasione." },
    { id:"sottoclasse", caselle:1, label:"Carta migliorata sottoclasse",desc:"Prendete la Specializzazione della vostra sottoclasse. Esclude il multiclasse per questo rango." },
    { id:"competenza",  caselle:2, label:"Aumenta Competenza di +1",   desc:"Annerite un pallino Competenza e aumentate di 1 il numero di dadi danno dell'arma. Richiede di marcare entrambe le caselle (doppia).", doppia:true },
    { id:"multiclasse", caselle:2, label:"Multiclasse",                 desc:"Scegliete una classe aggiuntiva, un suo dominio e ottenete il privilegio di classe base. Richiede di marcare entrambe le caselle (doppia).", doppia:true },
  ],
  4: [ // Rango 4: Lv 8-10
    { id:"tratti",      caselle:2, label:"Bonus +1 a due tratti",      desc:"Scegliete due tratti non marcati, ottenete +1 permanente a ciascuno e marcateli." },
    { id:"pf",          caselle:2, label:"Casella PF permanente",       desc:"Guadagnate una casella Punti Ferita permanente." },
    { id:"stress",      caselle:2, label:"Casella Stress permanente",   desc:"Guadagnate una casella Stress permanente." },
    { id:"esperienze",  caselle:2, label:"Bonus +1 a due Esperienze",   desc:"Scegliete due Esperienze sulla scheda e ottenete +1 permanente a ciascuna." },
    { id:"carta",       caselle:1, label:"Carta dominio aggiuntiva",    desc:"Scegliete una carta dominio di livello ≤ vostro da un dominio a cui avete accesso." },
    { id:"evasione",    caselle:1, label:"Bonus +1 all'Evasione",       desc:"Guadagnate bonus +1 permanente all'Evasione." },
    { id:"sottoclasse", caselle:1, label:"Carta migliorata sottoclasse",desc:"Prendete la Maestria della vostra sottoclasse. Esclude il multiclasse per questo rango." },
    { id:"competenza",  caselle:2, label:"Aumenta Competenza di +1",   desc:"Annerite un pallino Competenza e aumentate di 1 il numero di dadi danno dell'arma. Richiede di marcare entrambe le caselle (doppia).", doppia:true },
    { id:"multiclasse", caselle:2, label:"Multiclasse",                 desc:"Scegliete una classe aggiuntiva, un suo dominio e ottenete il privilegio di classe base. Richiede di marcare entrambe le caselle (doppia).", doppia:true },
  ],
};

const CARTE_DOMINI = {
  Arcano: [
    {n:"Sigillo Runico",l:1,c:0,d:`Possedete un oggetto personale molto importante che può essere infuso di magia protettrice e utilizzato come protezione da voi o da un alleato. Descrivete cos’è e perché è importante. Il possessore della protezione può spendere una Speranza per ridurre i danni subiti di 1d8. Se il risultato del dado è 8, il potere dell’amuleto termina dopo aver ridotto il danno in questo turno. Può essere ricaricato gratuitamente al prossimo riposo.`},
    {n:"Scatenare Il Caos",l:1,c:1,d:`All’inizio di una sessione, mettete su questa carta un numero di gettoni pari al vostro tratto da Incantatore. Effettuate un Tiro Incantesimo contro un bersaglio ﬁno a distanza Lontana e spendete un numero qualsiasi di gettoni per incanalare energia grezza e scagliarla contro di esso. In caso di successo, tirate un numero di d10 pari ai gettoni spesi e inﬂiggete quel danno magico al bersaglio. Marcate uno Stress per rifornire questa carta di gettoni (ﬁno al limite del vostro tratto da Incantatore). Alla ﬁne di ogni sessione, rimuovete i gettoni non spesi.`},
    {n:"Camminare Sui Muri",l:1,c:1,d:`Spendete una Speranza per consentire a una creatura che potete toccare di arrampicarsi su muri e soffitti con la stessa facilità con cui cammina sul terreno. Questo effetto dura ﬁno alla ﬁne della scena o ﬁnché non lanciate nuovamente Camminare sui Muri.`},
    {n:"Tocco Delle Braci",l:2,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza di Mischia. In caso di successo, il bersaglio viene immediatamente avvolto dalle ﬁamme, subisce 1d20+3 danni magici ed è temporaneamente Incendiato. Quando una creatura agisce mentre è Incendiata, subisce 2d6 danni magici aggiuntivi se è ancora Incendiata alla ﬁne della sua azione.`},
    {n:"Occhio Fluttuante",l:2,c:0,d:`Spendete una Speranza per creare una sfera ﬂuttuante che potete muovere ovunque entro distanza Remota. Mentre questo incantesimo è attivo, potete vedere attraverso la sfera come se foste nella sua posizione. Potete passare liberamente dall’usare i vostri sensi al vedere attraverso la sfera. Se la sfera subisce danni o esce dalla portata, l’incantesimo termina.`},
    {n:"Contromagia",l:3,c:2,d:`Potete interrompere un effetto magico in atto effettuando un tiro reazione usando il vostro tratto da Incantatore. In caso di successo, l’effetto si interrompe, qualsiasi conseguenza viene evitata e questa carta viene messa nella riserva.`},
    {n:"Volare",l:3,c:1,d:`Effettuate un Tiro Incantesimo (15). In caso di successo, mettete su questa carta un numero di gettoni pari al valore di Agilità (minimo 1). Quando effettuate un tiro azione in volo, rimuovete un gettone da questa carta. Dopo che l’azione che consuma l’ultimo gettone è stata risolta, scendete a terra direttamente sotto di voi.`},
    {n:"Intermittenza",l:4,c:1,d:`Effettuate un Tiro Incantesimo (12). In caso di successo, spendete una Speranza per teletrasportarvi in un altro punto visibile entro distanza Lontana. Se altri vogliono seguirvi e si trovano entro distanza Prossima, spendete una Speranza aggiuntiva per ciascuna creatura per portarla con voi.`},
    {n:"Deflagrazione Protettrice",l:4,c:2,d:`Effettuate un Tiro Incantesimo contro tutti i bersagli entro distanza di Mischia. I bersagli contro cui avete successo vengono respinti a distanza Lontana e subiscono d8+3 danni magici usando il vostro tratto da Incantatore.`},
    {n:"Fulmine A Catena",l:5,c:1,d:`Marcate 2 Stress per effettuare un Tiro Incantesimo, scatenando un fulmine su tutti i bersagli entro distanza Ravvicinata. I bersagli contro cui avete successo devono effettuare un tiro reazione con Difficoltà pari al risultato del vostro Tiro Incantesimo. I bersagli che falliscono subiscono 2d8+4 danni magici. Anche quegli avversari che non siano già stati bersagliati dal Fulmine a Catena, ma si trovino entro distanza Ravvicinata dai bersagli che hanno subito danni, devono effettuare il tiro reazione o subire 2d8+4 danni magici. L’effetto continua ﬁno a quando non ci sono più avversari nel raggio d’azione.`},
    {n:"Premonizione",l:5,c:2,d:`Potete incanalare l’energia arcana per avere visioni del futuro. Una volta per riposo lungo, immediatamente dopo che il GM ha comunicato le conseguenze di un tiro che avete effettuato, potete annullare la mossa e le conseguenze relative come se non fossero mai avvenute e compiere invece un’altra mossa.`},
    {n:"Passabreccia",l:6,c:2,d:`Effettuate un Tiro Incantesimo (15). In caso di successo, tracciate un simbolo arcano sul terreno dove vi trovate. La prossima volta che lanciate Passabreccia con successo, si apre una breccia nello spazio che vi permette di tornare al punto esatto in cui è stato tracciato il simbolo. La breccia rimane aperta ﬁnché non decidete di chiuderla o lanciate un altro incantesimo. Potete abbandonare l’incantesimo in qualsiasi momento per lanciare nuovamente Passabreccia e tracciare il segno in un nuovo punto.`},
    {n:"Telecinesi",l:6,c:0,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Lontana. In caso di successo, potete sollevarlo e spostarlo ovunque entro una distanza Lontana dalla sua posizione originale. Potete scagliare il bersaglio così sollevato come un proiettile effettuando un nuovo Tiro Incantesimo contro un secondo bersaglio a cui state mirando. In caso di successo, inﬂiggete d12+4 danni ﬁsici al secondo bersaglio usando la vostra Competenza. L’incantesimo poi termina.`},
    {n:"Esplosione Ammantante",l:7,c:2,d:`Quando effettuate con successo un Tiro Incantesimo per lanciare un incantesimo diverso, potete spendere una Speranza per diventare Ammantati. Mentre siete Ammantati, rimanete invisibili se restate fermi ﬁno a quando un avversario si sposta dove normalmente vi vedrebbe. Quando vi muovete nella linea di vista di un avversario o effettuate un attacco, non siete più Ammantati.`},
    {n:"Riflessione Arcana",l:8,c:1,d:`Quando subite danni magici, potete spendere un numero qualsiasi di Speranze per tirare altrettanti d6. Se uno qualsiasi ottiene un 6, l’attacco viene riﬂesso contro il lanciatore, inﬂiggendo invece i danni a lui.`},
    {n:"Aura Di Confusione",l:8,c:2,d:`Effettuate un Tiro Incantesimo (14). In caso di successo, una volta per ogni riposo lungo, create uno strato di illusione sul vostro corpo che rende difficile capire esattamente dove vi troviate. Marcate un numero qualsiasi di Stress per creare altrettanti strati aggiuntivi. Quando un avversario vi attacca, tirate un numero di d6 pari al numero di strati attualmente attivi. Se uno qualsiasi ottiene un risultato pari o superiore a 5, uno strato dell’aura viene distrutto e l’attacco fallisce. Se tutti i risultati sono pari o inferiori a 4, subite il danno e l’incantesimo termina.`},
    {n:"Terremoto",l:9,c:2,d:`Effettuate un Tiro Incantesimo (16). Una volta per riposo, in caso di successo, tutti i bersagli entro distanza Remota che non siano in volo devono effettuare un Tiro Reazione (18). I bersagli che falliscono subiscono 3d10+8 danni ﬁsici e sono temporaneamente Vulnerabili. I bersagli che hanno successo subiscono metà dei danni. Inoltre, quando superate il Tiro Incantesimo, tutto il terreno entro distanza Remota diventa difficile da attraversare e le strutture in tale area potrebbero subire danni o crollare.`},
    {n:"Proiezione Sensoriale",l:9,c:0,d:`Una volta per riposo, effettuate un Tiro Incantesimo (15). In caso di successo, avete una visione che vi permette di vedere e sentire chiaramente qualsiasi luogo in cui siete stati in precedenza, come se vi trovaste lì in quel momento. Potete muovervi liberamente in questa visione e non siete vincolati dalla ﬁsica o dagli impedimenti di un corpo ﬁsico. Questo incantesimo non può essere rilevato con mezzi mondani o magici. L’incantesimo ha ﬁne quando subite danni o lanciate un altro incantesimo.`},
    {n:"Piegare La Realt\u00e0",l:10,c:1,d:`Dopo che voi o un alleato consenziente avete effettuato un tiro, potete spendere 5 Speranze per cambiare il risultato numerico di quel tiro con un risultato a scelta. Il risultato deve essere compreso tra quelli ottenibili in base al tipo di dado lanciato.`},
    {n:"Frattura Celeste",l:10,c:1,d:`Effettuate un Tiro Incantesimo contro tutti gli avversari a distanza Lontana. Marcate un numero qualsiasi di Stress per far piovere frammenti di energia arcana dall’alto. I bersagli contro cui avete successo subiscono 1d20+2 danni magici per ogni Stress marcato.`},
  ],
  Lama: [
    {n:"Rinforzo",l:1,c:1,d:`Quando subite danno Grave, potete marcare uno Stress per ridurne la gravità di una soglia.`},
    {n:"Non \u00c8 Abbastanza",l:1,c:1,d:`Quando tirate i dadi di danno, potete ritirare tutti gli 1 e i 2.`},
    {n:"Turbine",l:1,c:0,d:`Effettuate un attacco contro un bersaglio entro distanza Prossima. In caso di successo, spendete una Speranza per attaccare con lo stesso risultato tutti gli altri bersagli entro distanza Prossima. Tutti gli avversari aggiuntivi contro cui avete successo con questa abilità subiscono metà dei danni.`},
    {n:"Cameratismo",l:2,c:1,d:`Una volta per ogni riposo lungo, quando vi complimentate con qualcuno o discutete di ciò in cui eccelle, entrambi potete ottenere 3 Speranze.`},
    {n:"Spericolato",l:2,c:1,d:`Marcate uno Stress per ottenere vantaggio su un attacco.`},
    {n:"Mischiare Le Carte",l:3,c:1,d:`Una volta per riposo, quando una creatura entro distanza di Mischia sta per inﬂiggervi danno, potete evitare l’attacco e muovervi in sicurezza oltre la distanza di Mischia del nemico.`},
    {n:"Combattente Versatile",l:3,c:1,d:`Potete usare per un arma equipaggiata un tratto del personaggio diverso da quello normalmente indicato. Quando inﬂiggete danno, potete marcare uno Stress per ottenere il risultato massimo in uno dei dadi di danno invece di tirarlo.`},
    {n:"Focus Letale",l:4,c:2,d:`Una volta per riposo, potete puntare un bersaglio a scelta. Fino a quando non attaccate un’altra creatura, sconﬁggete il bersaglio indicato o la battaglia termina, ottenete bonus +1 alla Competenza.`},
    {n:"Armatura Rinforzata",l:4,c:0,d:`Mentre indossate un’armatura, ottenete bonus +2 alla soglia di danno.`},
    {n:"Vantaggio Del Campione",l:5,c:1,d:`Quando ottenete un successo critico con un attacco, potete spendere ﬁno a 3 Speranze e scegliere una delle seguenti opzioni per ogni Speranza spesa: • Guarire un Punto Ferita. • Riparare una Casella Armatura. • Il bersaglio subisce un Punto Ferita aggiuntivo. Non è possibile selezionare la stessa opzione più di una volta.`},
    {n:"Vitalit\u00e0",l:5,c:0,d:`Quando selezionate questa carta, ottenete permanentemente due dei seguenti vantaggi: • Una casella Stress • Una casella Punti Ferita • Bonus +2 alla soglia di danno Quindi mettete questa carta nella riserva in modo permanente.`},
    {n:"Temprato Dalla Battaglia",l:6,c:2,d:`Una volta per riposo lungo, quando dovreste effettuare una Mossa Finale, potete spendere una Speranza per recuperare un Punto Ferita.`},
    {n:"Infuriarsi",l:6,c:1,d:`Prima di effettuare un attacco, potete marcare uno Stress per ottenere un bonus al tiro di danno pari al doppio della Forza. Potete Infuriarvi due volte per attacco.`},
    {n:"Padronanza Della Lama",l:7,c:1,d:`Quando 4 o più carte dominio nella vostra dotazione appartengono al dominio delle Lame, ottenete i seguenti beneﬁci: • Bonus +2 ai tiri attacco • Bonus +4 alla soglia di danno Grave`},
    {n:"Colpo Di Striscio",l:7,c:1,d:`Quando fallite un attacco, potete marcare uno Stress per inﬂiggere danni con l’arma applicando metà della vostra Competenza.`},
    {n:"Grido Di Battaglia",l:8,c:2,d:`Una volta per ogni riposo lungo, mentre caricate verso il pericolo, potete lanciare un grido che ispira gli alleati. Tutti gli alleati che possono sentirlo rimuovono uno Stress e ottengono una Speranza. Inoltre, gli alleati ottengono vantaggio sui tiri attacco ﬁnché voi o un alleato non fallite un tiro con Paura.`},
    {n:"Frenesia",l:8,c:3,d:`Una volta per riposo lungo, potete entrare in uno stato di Frenesia ﬁnché non ci sono più avversari in vista. Mentre siete in Frenesia, non potete marcare le Caselle Armatura e ottenete bonus +10 ai tiri di danno e bonus +8 alla vostra soglia di danno Grave.`},
    {n:"Sangue E Gloria",l:9,c:2,d:`Quando ottenete un successo critico con un attacco con un’arma, ottenete una Speranza aggiuntiva o rimuovete uno Stress aggiuntivo. Inoltre, quando inﬂiggete danni sufficienti a sconﬁggere un nemico, ottenete una Speranza o rimuovete uno Stress.`},
    {n:"Fendente Del Mietitore",l:9,c:3,d:`Una volta per ogni riposo lungo, spendete una Speranza per effettuare un tiro attacco. Il GM vi dice contro quali bersagli entro la portata dell’attacco avreste successo. Scegliete uno di questi bersagli e costringetelo a subire 5 Punti Ferita.`},
    {n:"Mastino Della Guerra",l:10,c:0,d:`Quando effettuate un attacco con successo contro un avversario, potete marcare 4 Stress per costringere il bersaglio a subire un numero di Punti Ferita pari al numero di Punti Ferita che avete attualmente subito invece di tirare per i danni.`},
    {n:"Massacro",l:10,c:3,d:`Quando effettuate con successo un attacco con la vostra arma, non inﬂiggete mai danni inferiori alla soglia di danno Maggiore del bersaglio (il bersaglio subisce sempre un minimo di 2 Punti Ferita). Inoltre, quando una creatura nel raggio d’azione della vostra arma inﬂigge danno a un alleato con un attacco che non vi bersaglia, potete marcare uno Stress per costringerla a effettuare un Tiro Reazione (15). In caso di fallimento, il bersaglio subisce un Punto Ferita.`},
  ],
  Ossa: [
    {n:"Manovre Evasive",l:1,c:0,d:`Una volta per riposo, marcate uno Stress per correre ovunque entro la distanza Lontana senza effettuare un Tiro Agilità. Se terminate questo movimento entro la distanza di Mischia di un avversario ed effettuate immediatamente un attacco nei suoi confronti, ottenete bonus +1 al tiro attacco.`},
    {n:"In Arrivo",l:1,c:1,d:`Quando siete bersaglio di un attacco effettuato da oltre la distanza di Mischia, potete marcare uno Stress per tirare un d4 e ottenere un bonus all’Evasione pari al risultato.`},
    {n:"Intoccabile",l:1,c:1,d:`Ottenete un bonus alla vostra Evasione pari alla metà della vostra Agilità.`},
    {n:"Ferocia",l:2,c:2,d:`Quando inﬂiggete 1 o più Punti Ferita a un avversario, potete spendere 2 Speranze per aumentare la vostra Evasione di un numero pari ai Punti Ferita che gli avete inﬂitto. Questo bonus dura ﬁno al termine del prossimo attacco contro di voi.`},
    {n:"Approccio Strategico",l:2,c:1,d:`Dopo un riposo lungo, mettete su questa carta un numero di gettoni pari alla vostra Conoscenza (minimo 1). La prima volta che vi muovete a distanza Ravvicinata da un avversario ed effettuate un attacco contro di lui, potete spendere un gettone per scegliere una delle seguenti opzioni: • Effettuate l’attacco con vantaggio. • Rimuovete uno Stress di un alleato entro distanza di Mischia dall’avversario. • Aggiungete un d8 al vostro tiro di danno. Quando completate un riposo lungo, rimuovete tutti i gettoni non utilizzati.`},
    {n:"Risolutezza",l:3,c:1,d:`Quando marcate una Casella Armatura per ridurre il danno in arrivo, potete marcare uno Stress per marcare una Casella Armatura aggiuntiva.`},
    {n:"Tattiche",l:3,c:1,d:`Quando Aiutate un Alleato, questi può spendere una Speranza per aggiungere una delle vostre Esperienze al suo tiro insieme al vostro dado vantaggio. Quando effettuate un Tiro Combinato, potete tirare un d20 come Dado Speranza.`},
    {n:"Ritorcere",l:4,c:1,d:`Quando un attacco contro di voi effettuato da una distanza superiore alla distanza di Mischia fallisce, tirate un numero di d6 pari alla vostra Competenza. Se uno qualsiasi dei d6 ottiene un 6, potete marcare uno Stress per ridirigere l’attacco verso un avversario che si trova entro distanza Prossima da voi.`},
    {n:"Conosci Il Tuo Nemico",l:5,c:1,d:`Quando osservate una creatura, potete effettuare un Tiro Istinto contro di essa. In caso di successo, spendete una Speranza e ponete al GM una domanda tra le seguenti opzioni: • I suoi Punti Ferita e Stress rimanenti. • La sua Difficoltà e le sue soglie di danno. • Le sue tattiche e suoi dadi di danno base. • I suoi privilegi ed Esperienze. Inoltre, in caso di successo, potete marcare uno Stress per rimuovere una Paura dalla riserva di Paura del GM.`},
    {n:"Mossa Distintiva",l:5,c:1,d:`Assegnate un nome e descrivete la vostra mossa di combattimento distintiva. Una volta per riposo, quando eseguite questa mossa distintiva come parte di un’azione, potete tirare un d20 come Dado Speranza. In caso di successo, rimuovete uno Stress.`},
    {n:"Botta E Risposta",l:6,c:0,d:`Quando un attacco contro di voi effettuato entro distanza di Mischia fallisce, potete marcare uno Stress e cogliere l’opportunità per inﬂiggere il danno di una delle armi che impugnate all’attaccante.`},
    {n:"Recupero",l:6,c:1,d:`Durante un riposo breve, potete scegliere invece una mossa di interludio di riposo lungo. Potete spendere una Speranza per consentire a un alleato di fare lo stesso.`},
    {n:"Padronanza Delle Ossa",l:7,c:2,d:`Quando 4 o più carte dominio nella vostra dotazione appartengono al dominio delle Ossa, ottenete i seguenti beneﬁci: • Bonus +1 all’Agilità • Una volta per riposo, potete spendere 3 Speranze per far fallire un attacco che vi avrebbe colpito.`},
    {n:"Precisione Crudele",l:7,c:1,d:`Quando effettuate con successo un attacco con un’arma, ottenete un bonus al tiro di danno pari al vostro bonus di Astuzia o Agilità.`},
    {n:"Fendente Frantumatore",l:8,c:3,d:`Quando effettuate un attacco con successo, potete marcare uno Stress per fare in modo che il prossimo attacco con successo contro lo stesso bersaglio inﬂigga 2d12 danni aggiuntivi.`},
    {n:"Adunata",l:8,c:1,d:`Effettuate un Tiro Agilità contro tutti i bersagli entro distanza Ravvicinata. Spendete una Speranza per spostare i bersagli contro cui avete successo, e tutti gli alleati disposti a farlo entro distanza Ravvicinata, in un altro punto entro distanza Ravvicinata.`},
    {n:"Al Limite",l:9,c:1,d:`Quando vi rimangono 2 o meno Punti Ferita, non subite danni Minori.`},
    {n:"Colpo Frammentante",l:9,c:3,d:`Spendete una Speranza e attaccate tutti gli avversari nel raggio d’azione della vostra arma. Una volta per ogni riposo lungo, se ottenete un successo contro uno qualsiasi dei bersagli, sommate il danno inﬂitto, quindi ridistribuitelo a piacere tra i bersagli contro cui avete avuto successo. Quando inﬂiggete danno a un bersaglio, tirate un dado di danno aggiuntivo e sommatelo al danno inﬂitto a quel bersaglio.`},
    {n:"Corsa Di Morte",l:10,c:1,d:`Spendete 3 Speranze per correre in linea retta attraverso il campo di battaglia ﬁno a un punto entro distanza Lontana, attaccando tutti gli avversari entro portata della vostra arma lungo il percorso. Scegliete l’ordine in cui inﬂiggete danno ai bersagli che avete colpito. Per il primo, tirate il danno dell’arma con bonus +1 alla vostra Competenza. Quindi rimuovete un dado dal tiro di danno e inﬂiggete il danno rimanente al bersaglio successivo. Continuate a rimuovere un dado per ogni bersaglio colpito ﬁno a quando non avete più dadi di danno o avversari. Non potete colpire lo stesso avversario più di una volta per attacco.`},
    {n:"Passo Lesto",l:10,c:2,d:`Quando un attacco contro di voi fallisce, rimuovete uno Stress. Se non potete rimuovere uno Stress, ottenete invece una Speranza.`},
  ],
  Codice: [
    {n:"Tomo Di Ava",l:1,c:2,d:`Spinta Magica: Effettuate un Tiro Incantesimo contro un bersaglio entro distanza di Mischia. In caso di successo, il bersaglio viene respinto ﬁno a distanza Lontana e subisce d10+2 danni magici pari alla vostra Competenza. Armatura di Tava: Spendete una Speranza per conferire a un bersaglio che potete toccare bonus +1 al suo Punteggio di Armatura ﬁno al suo prossimo riposo o ﬁno a quando non lanciate nuovamente Armatura di Tava. Spunzone di Ghiaccio: Effettuate un Tiro Incantesimo (12) per evocare una grande punta di ghiaccio entro distanza Lontana. Se la usate come arma, effettuate invece il Tiro Incantesimo contro la Difficoltà del bersaglio. In caso di successo, inﬂiggete d6 danni ﬁsici applicando la vostra Competenza.`},
    {n:"Tomo Di Illiat",l:1,c:2,d:`Torpore: Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Prossima. In caso di successo, il bersaglio è Addormentato ﬁno a quando non subisce danni o il GM spende una Paura nel suo turno per rimuovere questa condizione. Salva Arcana: Una volta per riposo, spendete un numero qualsiasi di Speranze e lanciate proiettili magici che colpiscono un bersaglio entro distanza Ravvicinata. Tirate un numero di d6 pari alle Speranze spese e inﬂiggete il totale come danni magici al bersaglio. Telepatia: Spendete una Speranza per aprire una linea di comunicazione mentale con un bersaglio che potete vedere. Questo legame dura ﬁno al vostro prossimo riposo o ﬁno a quando non lanciate nuovamente Telepatia.`},
    {n:"Tomo Di Tyfar",l:1,c:2,d:`Fiamma Selvaggia: Effettuate un Tiro Incantesimo contro un massimo di tre avversari entro distanza di Mischia. I bersagli contro cui avete successo subiscono 2d6 danni magici e devono marcare uno Stress mentre ﬁamme eruttano dalla vostra mano. Mano Magica: Evocate una mano magica delle stesse dimensioni e forza della vostra che potete comandare entro una distanza Lontana. Foschia Misteriosa: Effettuate un Tiro Incantesimo (13) per evocare temporaneamente una ﬁtta nebbia entro distanza Prossima. La nebbia occulta quest’area e tutto ciò che contiene.`},
    {n:"Tomo Di Sitil",l:2,c:2,d:`Camuffamento: Modiﬁcate magicamente il vostro aspetto e i vostri vestiti per evitare di essere riconosciuti. Gemellare: Spendete 2 Speranze per lanciare questo incantesimo su voi stesso o su un alleato entro distanza Ravvicinata. La prossima volta che il bersaglio effettua un attacco, può colpire un bersaglio aggiuntivo entro la portata contro cui il suo tiro attacco avrebbe avuto successo. Potete mantenere attivo questo incantesimo su una sola creatura alla volta. Illusione: Effettuate un Tiro Incantesimo (14). In caso di successo, create un’illusione visiva non più grande di voi entro distanza Ravvicinata che dura ﬁnché la osservate. Solo chi la osserva entro distanza di Mischia può capirne la natura illusoria.`},
    {n:"Tomo Di Vagras",l:2,c:2,d:`Chiavistello Runico: Effettuate un Tiro Incantesimo (15) su un oggetto che state toccando e che può essere chiuso (come una serratura, uno scrigno o una scatola). Una volta per riposo, in caso di successo, potete chiudere l’oggetto in modo che possa essere aperto solo da creature a vostra scelta. Qualcuno con accesso alla magia e un’ora di tempo per studiare l’incantesimo può aprirlo. Varco Arcano: Quando non avete avversari entro distanza di Mischia, effettuate un Tiro Incantesimo (13). In caso di successo, spendete una Speranza per creare un portale dalla vostra posizione ﬁno a un punto entro distanza Lontana che potete vedere. Il portale si chiude non appena una creatura lo oltrepassa. Svelare: Effettuate un Tiro Incantesimo. Se c’è qualcosa di nascosto con la magia entro distanza Ravvicinata, viene rivelato.`},
    {n:"Tomo Di Korvax",l:3,c:2,d:`Levitazione: Effettuate un Tiro Incantesimo per sollevare temporaneamente in aria un bersaglio che potete vedere e spostarlo entro distanza Ravvicinata dalla sua posizione di partenza. Smentire: Spendete una Speranza per costringere un bersaglio entro distanza di Mischia a effettuare un Tiro Reazione (15). In caso di fallimento, questi dimentica l’ultimo minuto della vostra conversazione. Cerchio Runico: Marcate uno Stress per creare un cerchio magico temporaneo sul terreno dove vi trovate. Tutti gli avversari che si trovano o entrano a distanza di Mischia subiscono 2d12+4 danni magici e vengono respinti indietro a distanza Prossima.`},
    {n:"Tomo Di Norai",l:3,c:2,d:`Laccio Mistico: Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Lontana. In caso di successo, il bersaglio viene temporaneamente Trattenuto e deve marcare uno Stress. Se bersagliate una creatura volante, questo incantesimo la fa atterrare e la Trattiene temporaneamente. Palla di Fuoco: Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Remota. In caso di successo, scagliate una sfera di fuoco verso di esso che esplode all’impatto. Il bersaglio e tutte le creature entro distanza Prossima da esso devono effettuare un Tiro Reazione (13). I bersagli che falliscono subiscono d20+5 danni magici applicando la vostra Competenza. I bersagli che superano il tiro subiscono metà dei danni.`},
    {n:"Tomo Di Exota",l:4,c:3,d:`Ripudiare: Potete interrompere un effetto magico in atto. Effettuate un tiro reazione usando il vostro tratto da Incantatore. Una volta per riposo, in caso di successo, l’effetto si interrompe e tutte le conseguenze vengono evitate. Creare Costrutto: Spendete una Speranza per scegliere un gruppo di oggetti intorno a voi e creare un costrutto animato che obbedisce a comandi di base. Effettuate un Tiro Incantesimo per dargli ordini. Se necessario, condivide la vostra Evasione e i vostri tratti e i suoi attacchi inﬂiggono 2d10+3 danni ﬁsici. Potete mantenere solo un costrutto alla volta e questo si disintegra quando subisce danni.`},
    {n:"Tomo Di Grynn",l:4,c:2,d:`Deﬂessione Arcana: Una volta per ogni riposo lungo, spendete una Speranza per annullare il danno di un attacco che ha come bersaglio voi o un alleato entro distanza Prossima. Cronolucchetto: Scegliete un oggetto entro distanza Lontana. L’oggetto si ferma nel tempo e nello spazio esattamente dove si trova ﬁno al vostro prossimo riposo. Se una creatura cerca di spostarlo, effettuate un Tiro Incantesimo contro di essa per impedirglielo. Muro di Fiamme: Effettuate un Tiro Incantesimo (15). In caso di successo, create un muro di ﬁamme magiche tra due punti entro distanza Lontana. Tutte le creature nel suo percorso devono scegliere da che parte stare e qualsiasi cosa oltrepassi il muro subisce 4d10+3 danni magici.`},
    {n:"Evocare Muraglia",l:5,c:2,d:`Effettuate un Tiro Incantesimo (15). Una volta per riposo, in caso di successo, spendete una Speranza per creare una parete magica temporanea tra due punti entro distanza Lontana. Può essere alta ﬁno a 15 metri e disporsi con qualsiasi angolazione. Le creature o gli oggetti che si trovano sul suo percorso vengono spostati su un lato a vostra scelta. La parete rimane in piedi ﬁno a quando non effettuate un riposo o lanciate nuovamente Evocare Muraglia.`},
    {n:"Teletrasporto",l:5,c:2,d:`Una volta per ogni riposo lungo, potete teletrasportare istantaneamente voi stessi e un numero qualsiasi di bersagli consenzienti entro distanza Ravvicinata in un luogo in cui siete già stati. Scegliete una delle seguenti opzioni, quindi effettuate un Tiro Incantesimo (16): • Se conoscete molto bene il luogo, ottenete bonus +3. • Se avete visitato spesso il luogo, ottenete bonus +1. • Se avete visitato il luogo raramente, non ottenete alcun modiﬁcatore. • Se ci siete stati solo una volta, ottenete penalità −2. Se l’operazione ha esito positivo, apparirete nel punto che intendevate raggiungere. In caso contrario apparirete fuori rotta, a una distanza proporzionata all’entità del fallimento.`},
    {n:"Esilio",l:6,c:0,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Ravvicinata. In caso di successo, tirate un numero di d20 pari al vostro tratto da Incantatore. Il bersaglio deve effettuare un tiro reazione contro una Difficoltà pari al vostro risultato più alto. In caso di successo, il bersaglio marca uno Stress ma non viene esiliato. In caso di fallimento, una volta per riposo, viene invece esiliato da questo regno. Quando i PG tirano con Paura, la Difficoltà ottiene penalità −1 e il bersaglio effettua un secondo tiro reazione. In caso di successo, riesce a tornare dall’esilio.`},
    {n:"Sigillo Del Castigo",l:6,c:2,d:`Contrassegnate un avversario entro distanza Ravvicinata con un sigillo del castigo. Il GM ottiene Paura. Quando l’avversario contrassegnato inﬂigge danno a voi o ai vostri alleati, mettete un d8 su questa carta. Potete porre su questa carta un numero massimo di d8 pari al vostro livello. Quando attaccate con successo l’avversario contrassegnato, tirate i dadi su questa carta e aggiungete il totale al vostro tiro di danno, poi rimuovete i dadi. Questo effetto termina quando l’avversario contrassegnato viene sconﬁtto o quando lanciate nuovamente Sigillo del Castigo.`},
    {n:"Tomo Di Homet",l:7,c:0,d:`Oltrepasso: Effettuate un Tiro Incantesimo (13). Una volta per riposo, in caso di successo, voi e tutte le creature che vi toccano potete oltrepassare un muro o una porta entro distanza Ravvicinata. L’effetto termina quando tutti si trovano dall’altra parte. Portale Dimensionale: Effettuate un Tiro Incantesimo (14). Una volta per ogni riposo lungo, se il tiro ha esito positivo, aprite un portale verso un luogo in un’altra dimensione o piano dell’esistenza in cui siete già stati. Il portale rimane aperto ﬁno al vostro prossimo riposo.`},
    {n:"Padronanza Del Codice",l:7,c:2,d:`Quando 4 o più carte dominio nella vostra dotazione provengono dal dominio del Codice, ottenete i seguenti beneﬁci: • Potete marcare uno Stress per aggiungere la vostra Competenza a un Tiro Incantesimo. • Una volta per riposo, sostituite questa carta con una qualsiasi della vostra riserva senza pagare il suo Costo di Richiamo.`},
    {n:"Tomo Di Vyola",l:8,c:2,d:`Tuffo nella Memoria: Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Lontana. In caso di successo, scrutate nella mente del bersaglio e ponete una domanda al GM. Il GM descrive qualsiasi ricordo del bersaglio pertinente alla risposta. Lucidità Condivisa: Una volta per ogni riposo lungo, spendete una Speranza per scegliere due creature consenzienti. Quando una di esse dovrebbe marcare Stress, possono scegliere chi delle due lo marcherà. Questo incantesimo dura ﬁno al loro prossimo riposo.`},
    {n:"Rifugio Sicuro",l:8,c:3,d:`Quando avete qualche minuto di calma per concentrarvi, potete spendere 2 Speranze per evocare il vostro Rifugio Sicuro, una grande dimora interdimensionale dove voi e i vostri alleati potete rifugiarvi. Quando lo fate, una porta magica appare entro distanza Ravvicinata. Solo le creature di vostra scelta possono varcarla. Una volta dentro, potete rendere invisibile l’ingresso. Voi e chiunque altro all’interno potete sempre uscirne. Una volta usciti, la porta deve essere evocata nuovamente. Quando riposate nel vostro Rifugio Sicuro, potete scegliere una mossa aggiuntiva durante l’interludio.`},
    {n:"Tomo Di Ronin",l:9,c:4,d:`Trasformazione: Effettuate un Tiro Incantesimo (15). In caso di successo, vi trasformate in un oggetto inanimato non più grande del doppio della vostra taglia normale. Potete rimanere in questa forma ﬁnché non subite danni. Spossatezza Eterna: Una volta per riposo lungo, effettuate un Tiro Incantesimo contro un bersaglio entro distanza Ravvicinata. In caso di successo, il bersaglio diventa permanentemente Vulnerabile. Non può liberarsi di questa condizione in alcun modo.`},
    {n:"Onda Disgregatrice",l:9,c:4,d:`Effettuate un Tiro Incantesimo (18). In caso di successo, una volta per ogni riposo lungo, il GM vi dice quali avversari entro distanza Lontana hanno una Difficoltà pari o inferiore a 18. Per ciascuno di quelli che desiderate colpire con l’incantesimo, marcate uno Stress. Essi vengono uccisi e non possono tornare in vita in alcun modo.`},
    {n:"Tomo Di Yarrow",l:10,c:2,d:`Inceppatempo: Effettuate un Tiro Incantesimo (18). In caso di successo, il tempo rallenta temporaneamente ﬁno a fermarsi per tutti quelli che si trovano entro distanza Lontana tranne voi. Riprende il suo normale scorrere la prossima volta che effettuate un tiro azione che ha come bersaglio un’altra creatura. Immunità alla Magia: Spendete 5 Speranze per diventare immune ai danni da magia ﬁno al prossimo riposo.`},
    {n:"Unione Trascendente",l:10,c:1,d:`Una volta per riposo lungo, spendete 5 Speranze per legare con questo incantesimo due o più creature consenzienti. Fino al vostro prossimo riposo, quando una creatura legata da questa unione marcherebbe Stress o subirebbe Punti Ferita, le altre creature così legate possono scegliere chi subisce il danno.`},
  ],
  Grazia: [
    {n:"Astuto Ingannatore",l:1,c:0,d:`Spendete una Speranza per ottenere vantaggio su un tiro per ingannare o raggirare qualcuno con una menzogna.`},
    {n:"Fascinazione",l:1,c:0,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Ravvicinata. In caso di successo, il bersaglio diventa temporaneamente Affascinato. Mentre è Affascinato, l’attenzione del bersaglio è ﬁssa su di voi, restringendo il suo campo visivo e ignorando altri suoni tranne la vostra voce. Una volta per riposo, in caso di successo, potete marcare uno Stress per costringere il bersaglio Affascinato a marcare uno Stress a sua volta.`},
    {n:"Parole Ispiratrici",l:1,c:1,d:`Le vostre parole sono intrise di potere. Dopo un riposo lungo, mettete su questa carta un numero di gettoni pari alla vostra Presenza. Quando parlate con un alleato, potete spendere un gettone da questa carta per dargli uno dei seguenti beneﬁci: • L’alleato rimuove uno Stress. • L’alleato recupera un Punto Ferita. • L’alleato ottiene una Speranza. Quando completate un riposo lungo, rimuovete i gettoni non spesi.`},
    {n:"Nessuna Menzogna",l:2,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Prossima. In caso di successo, il bersaglio non può mentirvi mentre rimane entro distanza Ravvicinata, ma non è obbligato a parlare. Se gli ponete una domanda e lui riﬁuta di rispondere, deve marcare uno Stress e l’effetto termina. Il bersaglio in genere non è consapevole che questo incantesimo sia stato lanciato su di lui ﬁnché non lo inducete a dire la verità.`},
    {n:"Piantagrane",l:2,c:2,d:`Quando schernite o provocate un bersaglio entro distanza Lontana, effettuate un Tiro Presenza contro di lui. Una volta per riposo, se il tiro ha esito positivo, tirate un numero di d4 pari alla vostra Competenza. Il bersaglio deve marcare Stress pari al risultato più alto ottenuto.`},
    {n:"Scintillio Ipnotico",l:3,c:1,d:`Effettuate un Tiro Incantesimo contro tutti gli avversari davanti a voi entro distanza Ravvicinata. Una volta per riposo, in caso di successo, create un’illusione di colori e luci lampeggianti che Stordisce temporaneamente i bersagli contro cui avete successo e li costringe a marcare uno Stress. Mentre sono Storditi, non possono usare reazioni e non possono compiere altre azioni ﬁnché non rimuovono questa condizione.`},
    {n:"Invisibilit\u00e0",l:3,c:1,d:`Effettuate un Tiro Incantesimo (10). In caso di successo, marcate uno Stress e scegliete voi stesso o un alleato entro distanza di Mischia che diventerà Invisibile. Una creatura Invisibile non può essere vista se non con mezzi magici e i tiri attacco contro di essa sono effettuati con svantaggio. Mettete su questa carta un numero di gettoni pari al vostro tratto da Incantatore. Quando la creatura Invisibile effettua un’azione, spendete un gettone da questa carta. Dopo che l’azione che consuma l’ultimo gettone è stata risolta, l’effetto termina. Potete usare Invisibilità su una sola creatura alla volta.`},
    {n:"Parole Di Conforto",l:4,c:1,d:`Durante un riposo breve, quando vi prendete del tempo per confortare un altro personaggio mentre usate la mossa di interludio Curare Ferite su di lui, curate un Punto Ferita aggiuntivo. Quando lo fate, anche voi recuperate 2 Punti Ferita.`},
    {n:"Attraverso I Tuoi Occhi",l:4,c:1,d:`Scegliete un bersaglio entro distanza Remota. Potete vedere attraverso i suoi occhi e sentire attraverso le sue orecchie. Potete passare liberamente dall’uso dei vostri sensi a quelli del bersaglio ﬁno a quando non lanciate un altro incantesimo o ﬁno al prossimo riposo.`},
    {n:"Lettura Della Mente",l:5,c:2,d:`Potete sbirciare nella mente altrui. Spendete una Speranza per leggere i pensieri vaghi e superﬁciali di un bersaglio entro distanza Lontana. Effettuate un Tiro Incantesimo contro il bersaglio per scavare più a fondo e trovare pensieri più nascosti. Con un tiro Paura, il bersaglio potrebbe, a discrezione del GM, rendersi conto che state leggendo la sua mente.`},
    {n:"Voce Della Discordia",l:5,c:1,d:`Sussurrate parole di discordia a un avversario entro distanza di Mischia ed effettuate un Tiro Incantesimo (13). In caso di successo, il bersaglio deve marcare uno Stress e attaccare un altro avversario invece che voi o i vostri alleati. Una volta terminato l’attacco, il bersaglio si rende conto di ciò che è successo. La prossima volta che lanciate Voce della Discordia su di lui, subite penalità –5 al Tiro Incantesimo.`},
    {n:"Insuperabile",l:6,c:2,d:`Quando subite 1 o più Punti Ferita da un attacco, potete marcare uno Stress per collocare un numero di gettoni pari al numero di Punti Ferita subiti su questa carta. Al vostro prossimo attacco riuscito, ottenete bonus +5 al tiro di danno per ogni gettone su questa carta, poi rimuovete tutti i gettoni.`},
    {n:"Carisma Infinito",l:7,c:1,d:`Dopo aver effettuato un tiro azione per persuadere, mentire o ottenere favori, potete spendere una Speranza per ripetere il tiro del Dado Speranza o Paura.`},
    {n:"Proiezione Astrale",l:8,c:0,d:`Una volta per ogni riposo lungo, marcate uno Stress per creare una copia proiettata di voi stessi che può apparire in qualsiasi luogo voi siate stati in precedenza. Potete vedere e sentire attraverso la copia come se foste al suo posto e inﬂuenzare il mondo come se vi trovaste in quel luogo. Una creatura che esamina la copia può capire che si tratta di un fenomeno magico. Questo effetto dura ﬁno al vostro prossimo riposo o ﬁno a quando la copia subisce danni.`},
    {n:"Affascinare Le Masse",l:8,c:3,d:`Effettuate un Tiro Incantesimo contro tutti i bersagli entro distanza Lontana. I bersagli contro cui avete successo diventano temporaneamente Affascinati. Mentre sono Affascinati, l’attenzione di un bersaglio è ﬁssa su di voi, restringendo il suo campo visivo e ignorando qualsiasi suono tranne la vostra voce. Marcate uno Stress per costringere tutti i bersagli Affascinati a marcare uno Stress, terminando questo incantesimo.`},
    {n:"Imitazione",l:9,c:3,d:`Una volta per riposo lungo, questa carta può imitare i privilegi di un’altra carta dominio di livello 8 o inferiore nella dotazione di un altro giocatore. Spendete Speranza pari alla metà del livello della carta per utilizzarla. L’effetto dura ﬁno al prossimo riposo o ﬁno a quando il proprietario della carta non la mette nella sua riserva.`},
    {n:"Segreti Del Mestiere",l:9,c:0,d:`Ottenete bonus +2 permanente a due Esperienze o bonus +3 permanente a una Esperienza. Spostate questa carta nella riserva permanentemente.`},
    {n:"Famigerato",l:10,c:0,d:`La gente sa chi siete e conosce le vostre imprese, e vi tratta conseguentemente. Quando sfruttate la vostra notorietà, potete marcare uno Stress prima di tirare per ottenere bonus +10 al risultato. Il cibo e le bevande sono sempre gratis ovunque andiate, e tutto ciò che acquistate ha un prezzo ridotto di una borsa d’oro (ﬁno a un minimo di una manciata). Questa carta non conta ai ﬁni del limite massimo di 5 carte dominio nella tua dotazione e non può essere messa nella riserva.`},
  ],
  Mezzanotte: [
    {n:"Rapidit\u00e0 Di Mano",l:1,c:0,d:`Avete vantaggio sui tiri azione per scassinare serrature non magiche, disinnescare trappole non magiche o rubare oggetti da un bersaglio (sia con furtività che con la forza).`},
    {n:"Pioggia Di Lame",l:1,c:1,d:`Spendete una Speranza per effettuare un Tiro Incantesimo ed evocare coltelli da lancio che colpiscono tutti i bersagli entro distanza Prossima. I bersagli contro cui avete successo subiscono d8+2 danni magici applicando la Competenza. Se un bersaglio colpito è Vulnerabile, subisce 1d8 danni aggiuntivi.`},
    {n:"Travestimento Perfetto",l:1,c:0,d:`Quando avete qualche minuto per prepararvi, potete marcare uno Stress per assumere le sembianze di qualsiasi umanoide che riuscite a immaginare chiaramente. Mentre siete travestiti, avete vantaggio sui Tiri Presenza per evitare di essere scoperti. Mettete su questa scheda un numero di gettoni pari al vostro tratto da Incantatore. Quando compiete un’azione mentre siete travestiti, spendete un gettone da questa scheda. Dopo che l’azione che consuma l’ultimo gettone è stata risolta, il travestimento svanisce.`},
    {n:"Spirito Di Mezzanotte",l:2,c:1,d:`Spendete una Speranza per evocare uno spirito di dimensioni umanoidi che può muoversi o trasportare oggetti ﬁno al prossimo riposo. Potete anche ordinargli di attaccare un avversario. Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Remota. In caso di successo, lo spirito si sposta a distanza di Mischia con quel bersaglio. Tirate un numero di d6 pari al vostro tratto da Incantatore e inﬂiggete lo stesso numero di danni magici al bersaglio. Lo spirito poi si dissipa. Potete controllare solo uno spirito alla volta.`},
    {n:"Strangolare",l:3,c:1,d:`Quando vi posizionate dietro una creatura delle vostre dimensioni, potete marcare uno Stress per afferrarle la gola, rendendola temporaneamente Vulnerabile. Quando una creatura attacca un bersaglio Vulnerabile in questo modo, inﬂigge 2d6 danni aggiuntivi.`},
    {n:"Velo Notturno",l:3,c:1,d:`Effettuate un Tiro Incantesimo (13). In caso di successo, create una cortina temporanea di oscurità tra due punti entro distanza Lontana. Solo voi potete vedere attraverso questa oscurità. Siete considerati Nascosti agli avversari dall’altra parte del velo e avete vantaggio sugli attacchi che effettuate attraverso l’oscurità. Il velo rimane ﬁno a quando non lanciate un altro incantesimo.`},
    {n:"Perizia Furtiva",l:4,c:0,d:`Quando tirate con Paura mentre tentate di muovervi inosservati in un’area pericolosa, potete marcare uno Stress per tirare invece con Speranza. Se anche un alleato entro distanza Ravvicinata si sta muovendo furtivamente e ottiene un tiro con Paura, potete marcare uno Stress per cambiare il suo risultato in un tiro con Speranza.`},
    {n:"Punto Debole",l:4,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Prossima. In caso di successo, spendete una Speranza per evocare un glifo oscuro sul suo corpo che espone i suoi punti deboli, riducendo temporaneamente la Difficoltà del bersaglio di un valore pari alla vostra Conoscenza (minimo 1).`},
    {n:"Silenzio",l:5,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Ravvicinata. In caso di successo, spendete una Speranza per evocare una magia soppressiva attorno al bersaglio che avvolge tutto ciò che si trova a distanza Prossima da esso e lo segue mentre si muove. Il bersaglio e tutto ciò che si trova nell’area è Silenziato ﬁno a quando il GM non spende un Paura nel proprio turno per rimuovere questa condizione, voi lanciate nuovamente Silenzio o subite un danno Maggiore. Mentre è Silenziato, il bersaglio non può fare rumore né lanciare incantesimi.`},
    {n:"Ritirata Fantasma",l:5,c:2,d:`Spendete una Speranza per lanciare Ritirata Fantasma nel punto in cui vi trovate. Spendete un’altra Speranza in qualsiasi momento prima del prossimo riposo per scomparire da dove vi trovate e riapparire nel punto scelto quando avete attivato Ritirata Fantasma. Poi l’incantesimo termina.`},
    {n:"Oscuri Bisbigli",l:6,c:0,d:`Potete parlare nella mente di qualsiasi persona con cui abbiate stabilito un contatto ﬁsico. Una volta aperto un contatto telepatico, può rispondervi nella vostra mente. Inoltre, potete marcare uno Stress per effettuare un Tiro Incantesimo contro di essa. In caso di successo, potete porre al GM una delle seguenti domande e ricevere una risposta: • Dove si trova? • Cosa sta facendo? • Di cosa ha paura? • Cosa ama di più al mondo?`},
    {n:"Travestimento Di Massa",l:6,c:0,d:`Quando avete qualche minuto di silenzio per concentrarvi, potete marcare uno Stress per cambiare l’aspetto di tutte le creature consenzienti entro distanza Ravvicinata. Le loro nuove forme devono condividere una struttura corporea e dimensioni generali e possono essere sia qualcuno o qualcosa che avete già visto prima o essere completamente inventate. Una creatura travestita ha vantaggio sui Tiri Presenza per evitare di essere scoperta. Attivate un Conto alla rovescia (8). Il tempo scorre come conseguenza delle valutazioni del GM. Raggiunto lo 0, il travestimento svanisce.`},
    {n:"Schivata Evanescente",l:7,c:1,d:`Quando un attacco contro di voi che inﬂiggerebbe danno ﬁsico fallisce, potete spendere una Speranza per sparire nell’ombra, diventando Nascosti e teletrasportandovi in un punto entro distanza Ravvicinata dall’attaccante. Rimanete Nascosti ﬁno alla vostra prossima azione.`},
    {n:"Caccia Notturna",l:8,c:2,d:`La vostra abilità cresce con il buio. Mentre siete in penombra o nell’oscurità, ottenete bonus +1 all’Evasione ed effettuate tiri attacco con vantaggio.`},
    {n:"Carica Magica",l:8,c:1,d:`Quando subite danni magici, mettete gettoni pari al numero di Punti Ferita subiti su questa carta, ﬁno a un massimo pari al vostro tratto da Incantatore. Quando colpite un bersaglio, potete spendere un numero qualsiasi di gettoni per aggiungere un d6 al tiro di danno per ogni gettone speso.`},
    {n:"Terrore Notturno",l:9,c:2,d:`Una volta per riposo lungo, un qualsiasi numero di bersagli a vostra scelta entro distanza Prossima vi percepirà come un essere orrendo e demoniaco. I bersagli devono superare un Tiro Reazione (16) o essere temporaneamente Terrorizzati. Mentre sono Terrorizzati, sono Vulnerabili. Sottraete al GM un valore di Paura pari al numero di bersagli Terrorizzati (ﬁno al valore di Paura nella riserva del GM). Lanciate un numero di d6 pari alla Paura rubata e inﬂiggete il danno totale a ciascun bersaglio Terrorizzato. Scartate la Paura rubata.`},
    {n:"Rintocco Del Crepuscolo",l:9,c:1,d:`Scegliete un bersaglio entro distanza Lontana. Quando superate un tiro azione contro di esso che non causa danno, mettete un gettone su questa carta. Quando inﬂiggete danno a questo bersaglio, spendete un numero qualsiasi di gettoni per aggiungere un d12 al tiro di danno per ogni gettone speso. Potete attivare il Rintocco del Crepuscolo su una sola creatura alla volta. Quando scegliete un nuovo bersaglio o riposate, rimuovete tutti i gettoni non spesi.`},
    {n:"Eclissi",l:10,c:2,d:`Effettuate un Tiro Incantesimo (16). In caso di successo, una volta per ogni riposo lungo, immergete nell’oscurità un’intera area entro distanza Lontana in cui solo voi e i vostri alleati possono vedere. I Tiri Attacco hanno svantaggio quando prendono di mira voi o un alleato all’interno dell’area oscurata. Inoltre, quando voi o un alleato effettuate un tiro con Speranza contro un avversario all’interno dell’area oscurata, il bersaglio deve marcare uno Stress. Questo incantesimo dura ﬁno a quando il GM non spende un Paura nel proprio turno per annullarlo o subite un danno Grave.`},
    {n:"Spettro Nel Buio",l:10,c:1,d:`Marcate uno Stress per diventare Spettrali ﬁno a quando non effettuate un tiro azione contro un’altra creatura. Mentre siete Spettrali, siete immuni ai danni ﬁsici, potete ﬂuttuare e oltrepassare oggetti solidi. Le altre creature possono comunque vedervi mentre siete in questa forma.`},
  ],
  Saggezza: [
    {n:"Segugio Infallibile",l:1,c:0,d:`Quando seguite le tracce di una creatura speciﬁca o di un gruppo di creature basandovi sui segni del loro passaggio, potete spendere qualsiasi numero di Speranze e porre al GM altrettante domande dalla lista seguente. • In che direzione sono andati? • Quanto tempo fa hanno oltrepassato questo luogo? • Cosa stavano facendo in questo luogo? • Quanti erano? Quando incontrate creature che avete seguito in questo modo, ottenete bonus +1 all’Evasione contro di loro.`},
    {n:"Lingua Della Natura",l:1,c:0,d:`Potete parlare la lingua del mondo naturale. Quando volete parlare con le piante e gli animali intorno a voi, effettuate un Tiro Istinto (12). In caso di successo, vi daranno le informazioni che conoscono. Con un tiro Paura, la loro conoscenza potrebbe essere limitata o avere un costo. Inoltre, prima di effettuare un Tiro Incantesimo mentre vi trovate in un ambiente naturale, potete spendere una Speranza per ottenere bonus +2 al tiro.`},
    {n:"Rovi Maligni",l:1,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Lontana. In caso di successo, radici e rampicanti si estendono dal terreno, inﬂiggendo 1d8+1 danni ﬁsici e Trattenendo temporaneamente il bersaglio. Inoltre, in caso di successo, potete spendere una Speranza per Trattenere temporaneamente un altro avversario entro distanza Prossima dal primo bersaglio.`},
    {n:"Evoca Sciame",l:2,c:1,d:`Scarabei Corazzati di Tekaira: Marcate uno Stress per evocare scarabei corazzati che vi circondano. Quando subite il prossimo danno, riducetene la gravità di una soglia. Potete spendere una Speranza per mantenere evocati gli scarabei dopo aver subito il danno. Lucciole Fiammanti: Effettuate un Tiro Incantesimo contro tutti gli avversari entro distanza Ravvicinata. Spendete una Speranza per inﬂiggere 2d8+3 danni magici ai bersagli contro cui avete avuto successo.`},
    {n:"Famiglio Della Natura",l:2,c:1,d:`Spendete una Speranza per evocare un piccolo spirito della natura o una creatura della foresta ﬁno al prossimo riposo, ﬁno a quando non lanciate nuovamente Famiglio della Natura o il famiglio viene bersagliato da un attacco. Se spendete una Speranza aggiuntiva, potete evocare un famiglio volante. Potete comunicare con esso, effettuare un Tiro Incantesimo per assegnargli semplici compiti e marcare uno Stress per vedere attraverso i suoi occhi. Quando inﬂiggete danno a un avversario entro distanza di Mischia dal famiglio, aggiungete un d6 al tiro di danno.`},
    {n:"Dardo Corrosivo",l:3,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Lontana. In caso di successo, inﬂiggete d6+4 danni magici applicando la vostra Competenza. Inoltre, marcate 2 o più Stress per renderlo permanentemente Ustionato. Un bersaglio Ustionato subisce penalità –1 alla sua Difficoltà per ogni 2 Stress che avete speso. Questa condizione è cumulabile.`},
    {n:"Stelo Torreggiante",l:3,c:1,d:`Una volta per riposo, potete evocare uno stelo spesso e contorto entro distanza Ravvicinata che può essere facilmente scalato. La sua altezza può raggiungere una distanza Lontana. Marcate uno Stress per usare questo incantesimo come un attacco. Effettuate un Tiro Incantesimo contro un avversario o un gruppo di avversari entro distanza Ravvicinata. Lo stelo solleva in aria i bersagli contro cui avete successo per poi farli cadere, inﬂiggendo d8 danni ﬁsici applicando la vostra Competenza.`},
    {n:"Stretta Letale",l:4,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Ravvicinata e scegliete una delle seguenti opzioni: • Attirate il bersaglio a distanza di Mischia o vi avvicinate a lui a distanza di Mischia. • Soffocate il bersaglio e lo costringete a marcare 2 Stress. • Tutti gli avversari tra voi e il bersaglio devono superare un Tiro Reazione (13) o essere colpiti dai rampicanti, subendo 3d6+2 danni ﬁsici. In caso di successo, dalle vostre mani si estendono dei rampicanti che causano l’effetto scelto e Trattengono temporaneamente il bersaglio.`},
    {n:"Prato Del Risanamento",l:4,c:2,d:`Una volta per riposo lungo, potete evocare un campo di piante curative intorno a voi. Ovunque entro distanza Ravvicinata la natura esplode di vita, permettendo a voi e a tutti gli alleati nell’area di recuperare un Punto Ferita. Spendete 2 Speranze per aumentare il recupero a 2 Punti Ferita.`},
    {n:"Pelle Di Spine",l:5,c:1,d:`Una volta per riposo, spendete una Speranza per far germogliare spine su tutto il vostro corpo. Mettete su questa carta un numero di gettoni pari al vostro tratto da Incantatore. Quando subite danni, potete spendere un numero qualsiasi di gettoni per tirare lo stesso numero di d6. Sommate i risultati e diminuite i danni subiti del totale. Se siete entro distanza di Mischia dall’attaccante, inﬂiggete il totale come danni all’attaccante. Quando riposate, rimuovete tutti i gettoni non spesi.`},
    {n:"Fortezza Della Selva",l:5,c:1,d:`Effettuate un Tiro Incantesimo (13). In caso di successo, spendete 2 Speranze per far crescere una barricata naturale a forma di cupola che può riparare voi e un alleato. All’interno della cupola, una creatura non può essere bersagliata da attacchi né può attaccare. Gli attacchi contro la cupola hanno automaticamente successo. La cupola ha le seguenti soglie di danno e puoi subire ﬁno a 3 Punti Ferita prima di cedere. Mettete dei gettoni su questa carta per rappresentare i Punti Ferita subiti. danno minore       15        danno maggiore          30             dan gra Marcate 1 PF           Marcate 2 PF                    Marca`},
    {n:"Evoca Destrieri",l:6,c:0,d:`Spendete un numero qualsiasi di Speranze per evocare altrettanti destrieri magici (come cavalli, cammelli o elefanti) che voi e i vostri alleati potete cavalcare ﬁno al vostro prossimo riposo lungo o ﬁno a quando i destrieri subiscono danni. I destrieri raddoppiano la vostra velocità di movimento su terra e, quando siete in pericolo, vi consentono di muovervi entro distanza Lontana senza dover tirare. Le creature che cavalcano un destriero no ve subiscono penalità –2 ai tiri attacco e bonus +2 ai tiri di danno. te 3 PF`},
    {n:"Foraggiare",l:6,c:1,d:`Come mossa aggiuntiva durante l’interludio, potete tirare un d6 per vedere cosa riuscite a trovare. Collaborate con il GM per descriverlo e aggiungerlo all’inventario come scorta. Il vostro personaggio può trasportare ﬁno a cinque scorte di questo tipo alla volta. Esito   Consumabile          Effetto 1     Un cibo unico        Rimuovete 2 Stress 2      Una bella reliquia   Ottenete 2 Speranze 3      Una runa arcana      +2 al Tiro Incantesimo 4      Una ﬁala curativa    Curate 2 Punti Ferita Un portafortuna Ripetete 5                                    qualsiasi tiro di dado 6     Scegliete una delle opzioni sopra.`},
    {n:"Impeto Selvaggio",l:7,c:2,d:`Una volta per riposo lungo, marcate uno Stress per incanalare il mondo naturale che vi circonda e potenziarvi. Descrivete come cambia il vostro aspetto, quindi mettete un d6 su questa scheda con il valore 1 rivolto verso l’alto. Mentre il Dado Impeto Selvaggio è attivo, aggiungete il suo valore a ogni tiro azione che effettuate. Dopo aver aggiunto il suo valore a un tiro, aumentate il valore del Dado Impeto Selvaggio di uno. Quando il valore del dado supera 6 o riposate, questa forma svanisce e dovete marcare uno Stress aggiuntivo.`},
    {n:"Spiriti Della Foresta",l:8,c:2,d:`Effettuate un Tiro Incantesimo (13). In caso di successo, spendete un numero qualsiasi di Speranze per creare un numero uguale di piccoli spiriti della foresta che appaiono in punti a vostra scelta entro distanza Lontana, fornendo i seguenti beneﬁci: • I vostri alleati ottengono bonus +3 ai tiri attacco contro avversari entro distanza di Mischia da uno spirito. • Un alleato che marca una Casella Armatura mentre si trova entro distanza di Mischia da uno spirito può marcare una Casella Armatura aggiuntiva. Uno spirito svanisce dopo aver concesso un beneﬁcio o subito danni.`},
    {n:"Barriera Di Rinnovamento",l:8,c:1,d:`Effettuate un Tiro Incantesimo (15). Una volta per riposo, in caso di successo, create una barriera di energia protettrice attorno a voi ﬁno a distanza Prossima. Voi e tutti gli alleati all’interno della barriera quando l’incantesimo viene lanciato recuperate 1d4 Punti Ferita. Mentre la barriera è attiva, voi e tutti gli alleati al suo interno avete resistenza ai danni ﬁsici provenienti dall’esterno. Quando vi muovete, la barriera vi segue.`},
    {n:"Santuario Della Natura",l:9,c:2,d:`Dopo un riposo lungo, mettete su questa carta un numero di gettoni pari al numero di carte del dominio della Saggezza nella vostra dotazione e nella vostra riserva. Quando dovreste effettuare un Tiro Incantesimo, potete spendere un numero qualsiasi di gettoni dopo il tiro per ottenere bonus +1 per ogni gettone speso. Quando ottenete un successo critico su un Tiro Incantesimo per un incantesimo del dominio della Saggezza, ottenete un gettone. Quando completate un riposo lungo, rimuovete tutti i gettoni non spesi.`},
    {n:"Dominio Vegetale",l:9,c:1,d:`Effettuate un Tiro Incantesimo (18). In caso di successo, una volta per ogni riposo lungo, rimodellate la vegetazione circostante entro distanza Lontana. Ad esempio, potete far crescere alberi all’istante, liberare un sentiero da ﬁtti rampicanti o creare un muro di radici.`},
    {n:"Forza Della Natura",l:10,c:2,d:`Marcate uno Stress per trasformarvi in un gigantesco spirito della natura, ottenendo i seguenti beneﬁci: • Quando riuscite in un tiro attacco o Incantesimo, ottenete bonus +10 al tiro di danno. • Quando inﬂiggete abbastanza danni da sconﬁggere una creatura entro distanza Ravvicinata, la assorbite e riparate una Casella Armatura. • Non potete essere Trattenuti. Prima di effettuare un tiro azione, dovete spendere una Speranza. Se non potete, tornate alla vostra normale forma.`},
    {n:"Tempesta",l:10,c:2,d:`Scegliete un tipo di precipitazione tra le seguenti ed effettuate un Tiro Incantesimo contro tutti i bersagli entro distanza Lontana. I bersagli contro cui avete successo ne subiscono gli effetti ﬁnché il GM non spende un Paura nel proprio turno per terminare questo incantesimo. • Tormenta di Neve: Inﬂiggete 2d20+8 danni magici e i bersagli sono temporaneamente Vulnerabili. • Uragano: Inﬂiggete 3d10+10 danni magici e scegliete una direzione in cui soffia il vento. I bersagli non possono muoversi controvento. • Tempesta di Sabbia: Inﬂiggete 5d6+9 danni magici. Gli attacchi effettuati oltre distanza di Mischia hanno svantaggio.`},
  ],
  Splendore: [
    {n:"Dardo Tracciante",l:1,c:1,d:`Effettuate un Tiro Incantesimo contro un bersaglio entro distanza Lontana. In caso di successo, spendete una Speranza per lanciare un raggio di luce scintillante verso il bersaglio, inﬂiggendo d8+2 danni magici applicando la vostra Competenza. Il bersaglio diventa temporaneamente Vulnerabile e brilla intensamente ﬁno a quando questa condizione non viene rimossa.`},
    {n:"Tocco Risanatore",l:1,c:1,d:`Ponete le mani su una creatura incanalando magia curativa per chiudere le sue ferite. Quando avete qualche minuto per concentrarvi, potete spendere 2 Speranze per curare un Punto Ferita o rimuovere uno Stress al bersaglio della magia. Una volta per riposo lungo, quando impiegate questo tempo per imparare qualcosa di nuovo sul bersaglio o rivelare qualcosa di voi, potete invece curare 2 Punti Ferita o rimuovere 2 Stress.`},
    {n:"Rassicurare",l:1,c:0,d:`Una volta per riposo, dopo che un alleato ha tentato un tiro azione ma prima che le conseguenze abbiano effetto, potete offrire assistenza o parole di incoraggiamento. Quando lo fate, il vostro alleato può ripetere il tiro di dado.`},
    {n:"Ultime Parole",l:2,c:1,d:`Potete infondere una stilla di vita in un cadavere per parlare con esso. Effettuate un Tiro Incantesimo (13). In caso di successo con Speranza, il cadavere risponde ﬁno a tre domande. In caso di successo con Paura, il cadavere risponde a una domanda. Il cadavere risponde in modo veritiero, ma non può fornire informazioni che non conosceva in vita. In caso di fallimento, o una volta che il cadavere ha ﬁnito di rispondere, il corpo si trasforma in polvere.`},
    {n:"Mani Guaritrici",l:2,c:1,d:`Effettuate un Tiro Incantesimo (13) e scegliete come bersaglio un’altra creatura entro distanza di Mischia. In caso di successo, marcate uno Stress per curare 2 Punti Ferita o rimuovere 2 Stress dal bersaglio. In caso di fallimento, marcate uno Stress per curare un Punto Ferita o rimuovere uno Stress dal bersaglio. Non potete curare nuovamente lo stesso bersaglio ﬁno al vostro prossimo riposo lungo.`},
    {n:"Rinvigorire",l:3,c:2,d:`Una volta per riposo, quando riuscite in un attacco contro un avversario, potete rimuovere 3 Stress o curare un Punto Ferita. In caso di successo con Speranza, rimuovete anche 3 Stress o curate un Punto Ferita a un alleato entro distanza Ravvicinata.`},
    {n:"Voce Della Ragione",l:3,c:1,d:`Parlate con potere e autorità senza pari. Avete vantaggio sui tiri azione per placare situazioni violente o convincere qualcuno a seguire il vostro esempio. Inoltre, trovate nuova forza nei momenti di difficoltà. Quando tutte le vostre caselle Stress sono marcate, ottenete bonus +1 alla Competenza per i tiri di danno.`},
    {n:"Divinazione",l:4,c:1,d:`Una volta per riposo lungo, spendete 3 Speranze per entrare in contatto con forze ultraterrene e porre una domanda a cui sia possibile rispondere con “sì” o “no” su un evento, una persona, un luogo o una situazione nel prossimo futuro. Per un istante, il presente svanisce e scorgete la risposta davanti a voi.`},
    {n:"Salvaguardia",l:4,c:1,d:`Spendete 3 Speranze e scegliete un alleato entro distanza Ravvicinata. Questi viene contrassegnato con un sigillo protettivo luminoso. Quando l’alleato dovrebbe compiere una mossa ﬁnale, cura invece un Punto Ferita. Questo effetto termina quando evita al bersaglio una mossa ﬁnale, quando lanciate Salvaguardia su un altro bersaglio o quando completate un riposo lungo.`},
    {n:"Plasmare",l:5,c:1,d:`Spendete una Speranza per plasmare una quantità di materiale naturale che state toccando (come pietra, ghiaccio o legno) in base alle vostre esigenze. L’area e la massa inﬂuenzata non può essere più grande di voi. Ad esempio, potete forgiare uno strumento rudimentale o creare una porta. Potete inﬂuenzare solo il materiale che si trova entro distanza Ravvicinata dal punto che state toccando.`},
    {n:"Castigo",l:5,c:2,d:`Una volta per riposo, spendete 3 Speranze per invocare un tremendo castigo. Quando attaccate con successo con un’arma, raddoppiate il risultato del vostro tiro di danno. Questo attacco inﬂigge danni magici indipendentemente dal tipo di danno dell’arma.`},
    {n:"Ristorare",l:6,c:2,d:`Dopo un riposo lungo, mettete su questa carta un numero di gettoni pari al vostro tratto da Incantatore. Toccate una creatura e spendete un numero qualsiasi di gettoni per curare 2 Punti Ferita o rimuovere 2 Stress per ogni gettone speso. Potete anche spendere un gettone da questa carta quando toccate una creatura per rimuovere la condizione Vulnerabile o curare un disturbo ﬁsico o magico (il GM potrebbe richiedere gettoni aggiuntivi a seconda della gravità del disturbo). Quando completate un riposo lungo, eliminate tutti i gettoni non spesi.`},
    {n:"Aura Di Protezione",l:6,c:2,d:`Effettuate un Tiro Incantesimo (16). Una volta per ogni riposo lungo, se il tiro ha esito positivo, scegliete un punto entro distanza Lontana e create un’aura di protezione visibile per tutti gli alleati entro distanza Prossima da quel punto. Quando lo fate, mettete un d6 su questa carta con il valore 1 rivolto verso l’alto. Quando un alleato in questa zona subisce danni, li riduce del valore del dado. Aumentate quindi il valore del dado di uno. Quando il valore del dado supera 6, questo effetto termina.`},
    {n:"Colpo Risanante",l:7,c:1,d:`Quando inﬂiggete danno a un avversario, potete spendere 2 Speranze per curare un Punto Ferita a un alleato entro distanza Ravvicinata.`},
    {n:"Scudo Magico",l:8,c:2,d:`Marcate uno Stress per lanciare un’aura protettrice su un bersaglio entro distanza Prossima. Quando il bersaglio marca una Casella Armatura, riducete la gravità dell’attacco di una soglia aggiuntiva. Se l’effetto dell’incantesimo fa sì che una creatura in procinto di subire danno non subisca invece nessun Punto Ferita, l’effetto termina. Potete mantenere lo Scudo Magico su una sola creatura alla volta.`},
    {n:"Bagliore Solare",l:8,c:2,d:`Effettuate un Tiro Incantesimo per scagliare potenti raggi di luce solare ustionante contro tutti gli avversari davanti a voi entro distanza Lontana. In caso di successo, spendete un numero qualsiasi di Speranze e costringete tutti i bersagli contro cui avete avuto successo a effettuare un Tiro Reazione (14). I bersagli che superano il tiro subiscono 3d20+3 danni magici. I bersagli che falliscono subiscono 4d20+5 danni magici e sono temporaneamente Storditi. Mentre sono Storditi, non possono usare reazioni né compiere altre azioni ﬁnché non superano questa condizione.`},
    {n:"Aura Soverchiante",l:9,c:2,d:`Effettuate un Tiro Incantesimo (15) per potenziare magicamente la vostra aura. In caso di successo, spendete 2 Speranze per rendere la vostra Presenza pari al vostro tratto da Incantatore ﬁno al prossimo riposo lungo. Mentre questo incantesimo è attivo, un avversario deve marcare uno Stress quando vi prende di mira con un attacco.`},
    {n:"Bagliore Di Salvezza",l:9,c:2,d:`Effettuate un Tiro Incantesimo (16). In caso di successo, marcate un numero qualsiasi di Stress per avere effetto sugli alleati disposti in linea entro distanza Lontana. Potete curare Punti Ferita ai bersagli pari al numero di Stress marcati, dividendo l’ammontare tra i bersagli come preferite.`},
    {n:"Ravvivare",l:10,c:3,d:`Quando voi o un alleato entro distanza Ravvicinata avete usato un privilegio che ha un limite di esaurimento (come una volta per riposo o una volta per sessione), potete spendere qualsiasi numero di Speranze e tirare altrettanti d6. Se almeno un dado ottiene un 6, il privilegio può essere usato di nuovo.`},
    {n:"Resurrezione",l:10,c:2,d:`Effettuate un Tiro Incantesimo (20). In caso di successo, riportate in vita una creatura morta da non più di 100 anni. Quindi tirate un d6. Se ottenete un risultato pari o inferiore a 5, spostate questa carta nella vostra riserva permanentemente. In caso di fallimento, non potrete lanciare Resurrezione per una settimana.`},
  ],
  Valore: [
    {n:"A Petto Nudo",l:1,c:0,d:`Quando scegliete di non indossare un’armatura, avete un Punteggio di Armatura base pari a 3 + la vostra Forza e utilizzate i seguenti valori come soglie di danno base: • Rango 1: 9/19 • Rango 2: 11/24 • Rango 3: 13/31 • Rango 4: 15/38`},
    {n:"Spinta Energica",l:1,c:0,d:`Effettuate un attacco con la vostra arma primaria contro un bersaglio entro distanza di Mischia. In caso di successo, inﬂiggete danno e respingete il bersaglio ﬁno a distanza Ravvicinata. In caso di successo con Speranza, aggiungete un d6 al tiro di danno. Inoltre, potete spendere una Speranza per rendere il bersaglio temporaneamente Vulnerabile.`},
    {n:"Sono Il Tuo Scudo",l:1,c:1,d:`Quando un alleato a distanza Prossima sta per subire danni, potete marcare uno Stress per frapporvi e diventare il bersaglio dell’attacco. Quando subite danni da questo attacco, potete marcare un numero qualsiasi di Caselle Armatura.`},
    {n:"A Peso Morto",l:2,c:1,d:`Usate tutta la forza del vostro corpo in combattimento. In un attacco riuscito con un’arma da Mischia, ottenete un bonus al tiro di danno pari alla vostra Forza.`},
    {n:"Audacia",l:2,c:0,d:`Quando effettuate un Tiro Presenza, potete spendere una Speranza per aggiungere la vostra Forza al tiro. Inoltre, una volta per riposo, quando otterreste una condizione, potete descrivere come la vostra audacia vi aiuta e non subire tale condizione.`},
    {n:"Ispirazione Tempestiva",l:3,c:1,d:`Una volta per riposo, quando ottenete un successo critico in un attacco, tutti gli alleati entro distanza Prossima possono rimuovere uno Stress o ottenere una Speranza.`},
    {n:"Conta Su Di Me",l:3,c:1,d:`Una volta per riposo lungo, quando consolate o ispirate un alleato che ha fallito un tiro azione, entrambi potete rimuovere 2 Stress.`},
    {n:"Provocazione",l:4,c:1,d:`Descrivete come provocate un bersaglio entro distanza Ravvicinata, poi effettuate un Tiro Presenza contro di lui. In caso di successo, il bersaglio deve marcare uno Stress e, la prossima volta che il GM lo rende protagonista, deve attaccarvi subendo svantaggio.`},
    {n:"Bastione",l:4,c:2,d:`Quando un alleato entro distanza Ravvicinata fallisce un tiro, potete spendere 2 Speranze per consentirgli di ritirare il suo Dado Speranza o Paura.`},
    {n:"Armaiolo",l:5,c:1,d:`Mentre indossate un’armatura, ottenete bonus +1 al Punteggio di Armatura. Durante un riposo, quando scegliete di riparare la vostra armatura con una mossa di interludio, anche i vostri alleati riparano una Casella Armatura.`},
    {n:"Colpo Trascinante",l:5,c:1,d:`Una volta per riposo, quando ottenete successo critico in un attacco, voi e tutti gli alleati che possono vedervi o sentirvi possono curare un Punto Ferita o rimuovere 1d4 Stress.`},
    {n:"Ineluttabile",l:6,c:1,d:`Quando fallite un tiro azione, il vostro prossimo tiro azione ha vantaggio.`},
    {n:"Solo Un Graffio",l:7,c:1,d:`Quando subite danno, potete marcare uno Stress per ridurre la gravità di una soglia. Quando lo fate, tirate un d6. Con un risultato pari o inferiore a 3, mettete questa carta nella riserva.`},
    {n:"A Tutta Forza",l:8,c:1,d:`Una volta per riposo lungo, marcate 3 Stress per spingere il vostro corpo al limite. Ottenete bonus +2 a tutti i tratti del vostro personaggio ﬁno al prossimo riposo.`},
    {n:"Schianto Tellurico",l:8,c:2,d:`Spendete 2 Speranze per colpire il terreno dove vi trovate ed effettuate un Tiro Forza contro tutti i bersagli entro distanza Prossima. I bersagli contro cui avete successo vengono respinti a distanza Lontana e devono effettuare un Tiro Reazione (17). I bersagli che falliscono subiscono 4d10+8 danni. I bersagli che hanno successo subiscono metà dei danni.`},
    {n:"Serrare I Ranghi",l:9,c:1,d:`Descrivete la posizione difensiva che assumete e spendete una Speranza. Se un avversario si muove entro distanza Prossima, viene attirato a distanza di Mischia e Trattenuto. Questa condizione dura ﬁno a quando non vi muovete o fallite un tiro con Paura, oppure se il GM spende 2 punti Paura nel suo turno per annullarla.`},
    {n:"Indistruttibile",l:10,c:4,d:`Quando subite il vostro ultimo Punto Ferita, invece di effettuare la mossa ﬁnale potete tirare un d6 e curare un numero di Punti Ferita pari al risultato. Quindi mettete questa carta nella riserva.`},
    {n:"Corazza Inviolabile",l:10,c:1,d:`Quando dovreste marcare una Casella Armatura, tirate un numero di d6 pari alla vostra Competenza. Se un dado qualsiasi ottiene un 6, riducete la gravità del danno di una soglia senza marcare una Casella Armatura.`},
  ],
};



// ============================================================
// ARMI - Daggerheart SRD v1.0 ufficiale (tutti i Tier)
// t=tier(1-4), c=P/S (primaria/secondaria), n=nome, p=portata,
// r=tratto, d=dado, b=bonus, m=magica(bool), h=mani(1|2), f=feature
// Tier→Livello: T1=1-4, T2=5-7, T3=8-9, T4=10
// ============================================================
const ARMI = [
  // ── TIER 1 PRIMARIE ───────────────────────────────────────
  {t:1,c:"P",n:"Ascia da Guerra",        p:"Mischia",     r:"Forza",      d:"d10",b:3, m:false,h:"2"},
  {t:1,c:"P",n:"Alabarda",               p:"Prossima",    r:"Forza",      d:"d10",b:2, m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:1,c:"P",n:"Anelli Lucenti",         p:"Prossima",    r:"Agilità",    d:"d10",b:2, m:true, h:"2"},
  {t:1,c:"P",n:"Arco Corto",             p:"Lontana",     r:"Agilità",    d:"d6", b:3, m:false,h:"2"},
  {t:1,c:"P",n:"Arco Lungo",             p:"Remota",      r:"Agilità",    d:"d8", b:3, m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:1,c:"P",n:"Ascia Sacra",            p:"Mischia",     r:"Forza",      d:"d8", b:1, m:true, h:"1"},
  {t:1,c:"P",n:"Bacchetta",              p:"Lontana",     r:"Conoscenza", d:"d6", b:1, m:true, h:"1"},
  {t:1,c:"P",n:"Balestra",               p:"Lontana",     r:"Astuzia",    d:"d6", b:1, m:false,h:"1"},
  {t:1,c:"P",n:"Bastone",                p:"Mischia",     r:"Istinto",    d:"d10",b:3, m:false,h:"2"},
  {t:1,c:"P",n:"Bastone Corto",          p:"Ravvicinata", r:"Istinto",    d:"d8", b:1, m:true, h:"1"},
  {t:1,c:"P",n:"Bastone Doppio",         p:"Lontana",     r:"Istinto",    d:"d6", b:3, m:true, h:"2"},
  {t:1,c:"P",n:"Fioretto",               p:"Mischia",     r:"Presenza",   d:"d8", b:0, m:false,h:"1", f:"Rapido: marca Stress per colpire secondo bersaglio"},
  {t:1,c:"P",n:"Grande Bastone",         p:"Remota",      r:"Conoscenza", d:"d6", b:0, m:true, h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:1,c:"P",n:"Grande Spada",           p:"Mischia",     r:"Forza",      d:"d10",b:3, m:false,h:"2", f:"Massiccia: -1 Evasione, dado extra scarta più basso"},
  {t:1,c:"P",n:"Guanti Arcani",          p:"Mischia",     r:"Forza",      d:"d10",b:3, m:true, h:"2"},
  {t:1,c:"P",n:"Lama Ritornante",        p:"Ravvicinata", r:"Astuzia",    d:"d8", b:0, m:true, h:"1", f:"Ritorno: torna in mano dopo il lancio"},
  {t:1,c:"P",n:"Lancia",                 p:"Prossima",    r:"Astuzia",    d:"d8", b:3, m:false,h:"2"},
  {t:1,c:"P",n:"Martello da Guerra",     p:"Mischia",     r:"Forza",      d:"d12",b:3, m:false,h:"2", f:"Pesante: -1 Evasione"},
  {t:1,c:"P",n:"Mazza",                  p:"Mischia",     r:"Forza",      d:"d8", b:1, m:false,h:"1"},
  {t:1,c:"P",n:"Pugnale",                p:"Mischia",     r:"Astuzia",    d:"d8", b:1, m:false,h:"1"},
  {t:1,c:"P",n:"Rune Manuali",           p:"Prossima",    r:"Istinto",    d:"d10",b:0, m:true, h:"1"},
  {t:1,c:"P",n:"Sciabola",               p:"Mischia",     r:"Presenza",   d:"d8", b:1, m:false,h:"1"},
  {t:1,c:"P",n:"Scettro",                p:"Lontana",     r:"Presenza",   d:"d6", b:0, m:true, h:"2", f:"Versatile: anche Presenza/Mischia/d8"},
  {t:1,c:"P",n:"Spada Larga",            p:"Mischia",     r:"Agilità",    d:"d8", b:0, m:false,h:"1", f:"Affidabile: +1 ai tiri attacco"},
  {t:1,c:"P",n:"Spadone",                p:"Mischia",     r:"Agilità",    d:"d10",b:3, m:false,h:"2"},
  // ── TIER 1 SECONDARIE ─────────────────────────────────────
  {t:1,c:"S",n:"Balestra a Mano",        p:"Lontana",     r:"Astuzia",    d:"d6", b:1, m:false,h:"1"},
  {t:1,c:"S",n:"Frusta",                 p:"Prossima",    r:"Presenza",   d:"d6", b:0, m:false,h:"1", f:"Allarmante: sposta avversari a Ravvicinata"},
  {t:1,c:"S",n:"Pugnale Piccolo",        p:"Mischia",     r:"Astuzia",    d:"d8", b:0, m:false,h:"1", f:"Abbinata: +2 danni arma primaria in Mischia"},
  {t:1,c:"S",n:"Rampino",                p:"Ravvicinata", r:"Astuzia",    d:"d6", b:0, m:false,h:"1", f:"Agganciato: tira il bersaglio entro Mischia"},
  {t:1,c:"S",n:"Scudo a Torre",          p:"Mischia",     r:"Forza",      d:"d6", b:0, m:false,h:"1", f:"Barriera: +2 Armatura; -1 Evasione"},
  {t:1,c:"S",n:"Scudo Rotondo",          p:"Mischia",     r:"Forza",      d:"d4", b:0, m:false,h:"1", f:"Protettivo: +1 Punteggio Armatura"},
  {t:1,c:"S",n:"Spada Corta",            p:"Mischia",     r:"Agilità",    d:"d8", b:0, m:false,h:"1", f:"Abbinata: +2 danni arma primaria in Mischia"},
  // ── TIER 2 PRIMARIE ───────────────────────────────────────
  {t:2,c:"P",n:"Archibugio",             p:"Ravvicinata", r:"Astuzia",    d:"d8", b:6, m:false,h:"2", f:"Ricarica: dopo attacco tira d6, con 1 devi ricaricare"},
  {t:2,c:"P",n:"Arco Corto Migl.",       p:"Lontana",     r:"Agilità",    d:"d6", b:6, m:false,h:"2"},
  {t:2,c:"P",n:"Arco Lungo Migl.",       p:"Remota",      r:"Agilità",    d:"d8", b:6, m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:2,c:"P",n:"Arco dei Capelli Fini",  p:"Remota",      r:"Agilità",    d:"d6", b:5, m:false,h:"2", f:"Affidabile: +1 ai tiri attacco"},
  {t:2,c:"P",n:"Arco Antico",            p:"Lontana",     r:"Istinto",    d:"d6", b:4, m:true, h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:2,c:"P",n:"Arco Potente",           p:"Lontana",     r:"Forza",      d:"d6", b:6, m:false,h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:2,c:"P",n:"Alabarda Migl.",         p:"Prossima",    r:"Forza",      d:"d10",b:5, m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:2,c:"P",n:"Anelli Lucenti Migl.",   p:"Prossima",    r:"Agilità",    d:"d10",b:5, m:true, h:"2"},
  {t:2,c:"P",n:"Ascia da Guerra Migl.",  p:"Mischia",     r:"Forza",      d:"d10",b:6, m:false,h:"2"},
  {t:2,c:"P",n:"Ascia Sacra Migl.",      p:"Mischia",     r:"Forza",      d:"d8", b:4, m:true, h:"1"},
  {t:2,c:"P",n:"Bacchetta Migl.",        p:"Lontana",     r:"Conoscenza", d:"d6", b:4, m:true, h:"1"},
  {t:2,c:"P",n:"Balestra Migl.",         p:"Lontana",     r:"Astuzia",    d:"d6", b:4, m:false,h:"1"},
  {t:2,c:"P",n:"Bastone Doppio Migl.",   p:"Lontana",     r:"Istinto",    d:"d6", b:6, m:true, h:"2"},
  {t:2,c:"P",n:"Bastone Corto Migl.",    p:"Ravvicinata", r:"Istinto",    d:"d8", b:4, m:true, h:"1"},
  {t:2,c:"P",n:"Bastone Migl.",          p:"Mischia",     r:"Istinto",    d:"d10",b:6, m:false,h:"2"},
  {t:2,c:"P",n:"Fioretto Migl.",         p:"Mischia",     r:"Presenza",   d:"d8", b:3, m:false,h:"1", f:"Rapido: marca Stress per colpire secondo bersaglio"},
  {t:2,c:"P",n:"Falcione Dorato",        p:"Mischia",     r:"Forza",      d:"d10",b:4, m:false,h:"1", f:"Potente: dado danno extra, scarta il più basso"},
  {t:2,c:"P",n:"Falce da Guerra",        p:"Prossima",    r:"Astuzia",    d:"d8", b:5, m:false,h:"2", f:"Affidabile: +1 ai tiri attacco"},
  {t:2,c:"P",n:"Frusta Affilata",        p:"Prossima",    r:"Agilità",    d:"d8", b:3, m:false,h:"1", f:"Rapido: marca Stress per colpire secondo bersaglio"},
  {t:2,c:"P",n:"Grande Bastone Migl.",   p:"Remota",      r:"Conoscenza", d:"d6", b:3, m:true, h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:2,c:"P",n:"Grande Spada Migl.",     p:"Mischia",     r:"Forza",      d:"d10",b:6, m:false,h:"2", f:"Massiccia: -1 Evasione, dado extra scarta più basso"},
  {t:2,c:"P",n:"Guanti Arcani Migl.",    p:"Mischia",     r:"Forza",      d:"d10",b:6, m:true, h:"2"},
  {t:2,c:"P",n:"Lama dell'Ego",          p:"Mischia",     r:"Agilità",    d:"d12",b:4, m:true, h:"1", f:"Pomposo: richiede Presenza ≤0"},
  {t:2,c:"P",n:"Lame a Pugno",           p:"Mischia",     r:"Forza",      d:"d10",b:6, m:false,h:"1", f:"Brutale: al massimo dado tira uno extra"},
  {t:2,c:"P",n:"Lama Ritornante Migl.",  p:"Ravvicinata", r:"Astuzia",    d:"d8", b:3, m:true, h:"1", f:"Ritorno: torna in mano dopo il lancio"},
  {t:2,c:"P",n:"Lancia Migl.",           p:"Prossima",    r:"Astuzia",    d:"d8", b:6, m:false,h:"2"},
  {t:2,c:"P",n:"Martello di Exota",      p:"Mischia",     r:"Istinto",    d:"d8", b:6, m:true, h:"2", f:"Eruttivo: avversari a Prossima tirano reazione (14) o subiscono metà danno"},
  {t:2,c:"P",n:"Martello da Guerra Migl.",p:"Mischia",    r:"Forza",      d:"d12",b:6, m:false,h:"2", f:"Pesante: -1 Evasione"},
  {t:2,c:"P",n:"Mazza Migl.",            p:"Mischia",     r:"Forza",      d:"d8", b:4, m:false,h:"1"},
  {t:2,c:"P",n:"Pugnale Divorante",      p:"Mischia",     r:"Astuzia",    d:"d8", b:4, m:true, h:"1", f:"Spaventoso: l'obiettivo marca Stress al successo"},
  {t:2,c:"P",n:"Pugnale Migl.",          p:"Mischia",     r:"Astuzia",    d:"d8", b:4, m:false,h:"1"},
  {t:2,c:"P",n:"Rune Manuali Migl.",     p:"Prossima",    r:"Istinto",    d:"d10",b:3, m:true, h:"1"},
  {t:2,c:"P",n:"Scettro di Elias",       p:"Lontana",     r:"Presenza",   d:"d6", b:3, m:true, h:"1", f:"Rinvigorente: al successo tira d4, con 4 rimuovi Stress"},
  {t:2,c:"P",n:"Scettro Migl.",          p:"Lontana",     r:"Presenza",   d:"d6", b:3, m:true, h:"2", f:"Versatile: anche Presenza/Mischia/d8+3"},
  {t:2,c:"P",n:"Sciabola Migl.",         p:"Mischia",     r:"Presenza",   d:"d8", b:4, m:false,h:"1"},
  {t:2,c:"P",n:"Spada da Incantatore",   p:"Mischia",     r:"Forza",      d:"d10",b:4, m:true, h:"2", f:"Versatile: anche Conoscenza/Lontana/d6+3"},
  {t:2,c:"P",n:"Spada Larga Migl.",      p:"Mischia",     r:"Agilità",    d:"d8", b:3, m:false,h:"1", f:"Affidabile: +1 ai tiri attacco"},
  {t:2,c:"P",n:"Spadone Migl.",          p:"Mischia",     r:"Agilità",    d:"d10",b:6, m:false,h:"2"},
  {t:2,c:"P",n:"Bastone del Custode",    p:"Lontana",     r:"Conoscenza", d:"d6", b:4, m:true, h:"2", f:"Affidabile: +1 ai tiri attacco"},
  {t:2,c:"P",n:"Yutari Bloodbow",        p:"Lontana",     r:"Astuzia",    d:"d6", b:4, m:true, h:"2", f:"Brutale: al massimo dado tira uno extra"},
  // ── TIER 2 SECONDARIE ─────────────────────────────────────
  {t:2,c:"S",n:"Ascia Ritornante",       p:"Ravvicinata", r:"Agilità",    d:"d6", b:4, m:false,h:"1", f:"Ritorno: torna in mano dopo il lancio"},
  {t:2,c:"S",n:"Balestra a Mano Migl.",  p:"Lontana",     r:"Astuzia",    d:"d6", b:3, m:false,h:"1"},
  {t:2,c:"S",n:"Frusta Migl.",           p:"Prossima",    r:"Presenza",   d:"d6", b:2, m:false,h:"1", f:"Allarmante: sposta avversari a Ravvicinata"},
  {t:2,c:"S",n:"Pugnale da Parata",      p:"Mischia",     r:"Astuzia",    d:"d6", b:2, m:false,h:"1", f:"Parata: scarta dadi danno pari ai tuoi"},
  {t:2,c:"S",n:"Pugnale Piccolo Migl.",  p:"Mischia",     r:"Astuzia",    d:"d8", b:2, m:false,h:"1", f:"Abbinata: +3 danni arma primaria in Mischia"},
  {t:2,c:"S",n:"Rampino Migl.",          p:"Ravvicinata", r:"Astuzia",    d:"d6", b:2, m:false,h:"1", f:"Agganciato: tira il bersaglio entro Mischia"},
  {t:2,c:"S",n:"Scudo a Torre Migl.",    p:"Mischia",     r:"Forza",      d:"d6", b:2, m:false,h:"1", f:"Barriera: +3 Armatura; -1 Evasione"},
  {t:2,c:"S",n:"Scudo Chiodato",         p:"Mischia",     r:"Forza",      d:"d6", b:2, m:false,h:"1", f:"Doppio Uso: +1 Armatura; +1 danni arma primaria"},
  {t:2,c:"S",n:"Scudo Rotondo Migl.",    p:"Mischia",     r:"Forza",      d:"d4", b:2, m:false,h:"1", f:"Protettivo: +2 Punteggio Armatura"},
  {t:2,c:"S",n:"Spada Corta Migl.",      p:"Mischia",     r:"Agilità",    d:"d8", b:2, m:false,h:"1", f:"Abbinata: +3 danni arma primaria in Mischia"},
  // ── TIER 3 PRIMARIE ───────────────────────────────────────
  {t:3,c:"P",n:"Alabarda Av.",           p:"Prossima",    r:"Forza",      d:"d10",b:8, m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:3,c:"P",n:"Anelli Lucenti Av.",     p:"Prossima",    r:"Agilità",    d:"d10",b:8, m:true, h:"2"},
  {t:3,c:"P",n:"Arco Corto Av.",         p:"Lontana",     r:"Agilità",    d:"d6", b:9, m:false,h:"2"},
  {t:3,c:"P",n:"Arco Lungo Av.",         p:"Remota",      r:"Agilità",    d:"d8", b:9, m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:3,c:"P",n:"Ascia da Guerra Av.",    p:"Mischia",     r:"Forza",      d:"d10",b:9, m:false,h:"2"},
  {t:3,c:"P",n:"Ascia di Fortunis",      p:"Mischia",     r:"Forza",      d:"d10",b:8, m:true, h:"2", f:"Fortunato: al fallimento marca Stress per ritirare"},
  {t:3,c:"P",n:"Ascia Sacra Av.",        p:"Mischia",     r:"Forza",      d:"d8", b:7, m:true, h:"1"},
  {t:3,c:"P",n:"Bacchetta Av.",          p:"Lontana",     r:"Conoscenza", d:"d6", b:7, m:true, h:"1"},
  {t:3,c:"P",n:"Balestra Av.",           p:"Lontana",     r:"Astuzia",    d:"d6", b:7, m:false,h:"1"},
  {t:3,c:"P",n:"Balestra a Polvere",     p:"Lontana",     r:"Astuzia",    d:"d6", b:8, m:false,h:"1", f:"Ricarica: dopo attacco tira d6, con 1 devi ricaricare"},
  {t:3,c:"P",n:"Bastone Av.",            p:"Mischia",     r:"Istinto",    d:"d10",b:9, m:false,h:"2"},
  {t:3,c:"P",n:"Bastone Corto Av.",      p:"Ravvicinata", r:"Istinto",    d:"d8", b:7, m:true, h:"1"},
  {t:3,c:"P",n:"Bastone Doppio Av.",     p:"Lontana",     r:"Istinto",    d:"d6", b:9, m:true, h:"2"},
  {t:3,c:"P",n:"Arco Dorato",            p:"Lontana",     r:"Astuzia",    d:"d6", b:7, m:true, h:"2", f:"Auto-Corr.: con 1 sul dado fa 6 invece"},
  {t:3,c:"P",n:"Doppio Flagello",        p:"Prossima",    r:"Agilità",    d:"d10",b:8, m:false,h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:3,c:"P",n:"Fioretto Av.",           p:"Mischia",     r:"Presenza",   d:"d8", b:6, m:false,h:"1", f:"Rapido: marca Stress per colpire secondo bersaglio"},
  {t:3,c:"P",n:"Fucile di Ilmari",       p:"Remota",      r:"Astuzia",    d:"d6", b:6, m:true, h:"1", f:"Ricarica: dopo attacco tira d6, con 1 devi ricaricare"},
  {t:3,c:"P",n:"Ghostblade",             p:"Mischia",     r:"Presenza",   d:"d10",b:7, m:false,h:"1", f:"Ultraterrena: scegli se infliggere fisico o magico"},
  {t:3,c:"P",n:"Grande Bastone Av.",     p:"Remota",      r:"Conoscenza", d:"d6", b:6, m:true, h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:3,c:"P",n:"Grande Spada Av.",       p:"Mischia",     r:"Forza",      d:"d10",b:9, m:false,h:"2", f:"Massiccia: -1 Evasione, dado extra scarta più basso"},
  {t:3,c:"P",n:"Guanti Arcani Av.",      p:"Mischia",     r:"Forza",      d:"d10",b:9, m:true, h:"2"},
  {t:3,c:"P",n:"Labrys",                 p:"Mischia",     r:"Forza",      d:"d10",b:7, m:false,h:"2", f:"Protettivo: +1 Armatura"},
  {t:3,c:"P",n:"Lama Guizzante",         p:"Mischia",     r:"Agilità",    d:"d8", b:5, m:false,h:"1", f:"Affilante: bonus ai danni pari ad Agilità"},
  {t:3,c:"P",n:"Lama Ritornante Av.",    p:"Ravvicinata", r:"Astuzia",    d:"d8", b:6, m:true, h:"1", f:"Ritorno: torna in mano dopo il lancio"},
  {t:3,c:"P",n:"Lancia Av.",             p:"Prossima",    r:"Astuzia",    d:"d8", b:9, m:false,h:"2"},
  {t:3,c:"P",n:"Lame Av.",               p:"Prossima",    r:"Astuzia",    d:"d10",b:7, m:false,h:"2", f:"Brutale: al massimo dado tira uno extra"},
  {t:3,c:"P",n:"Martello da Guerra Av.", p:"Mischia",     r:"Forza",      d:"d12",b:9, m:false,h:"2", f:"Pesante: -1 Evasione"},
  {t:3,c:"P",n:"Martello dell'Ira",      p:"Mischia",     r:"Forza",      d:"d10",b:7, m:false,h:"2", f:"Devastante: marca Stress per usare d20 come dado danno"},
  {t:3,c:"P",n:"Mazza Av.",              p:"Mischia",     r:"Forza",      d:"d8", b:7, m:false,h:"1"},
  {t:3,c:"P",n:"Orbe Magico",            p:"Lontana",     r:"Conoscenza", d:"d6", b:7, m:true, h:"1", f:"Potente: dado danno extra, scarta il più basso"},
  {t:3,c:"P",n:"Pendant di Widgast",     p:"Ravvicinata", r:"Conoscenza", d:"d10",b:5, m:true, h:"1", f:"Temporale: scegli bersaglio dopo il tiro attacco"},
  {t:3,c:"P",n:"Pugnale Av.",            p:"Mischia",     r:"Astuzia",    d:"d8", b:7, m:false,h:"1"},
  {t:3,c:"P",n:"Rune di Rovina",         p:"Prossima",    r:"Conoscenza", d:"d20",b:4, m:true, h:"1", f:"Dolorosa: ogni attacco riuscito marca Stress"},
  {t:3,c:"P",n:"Rune Manuali Av.",       p:"Prossima",    r:"Istinto",    d:"d10",b:6, m:true, h:"1"},
  {t:3,c:"P",n:"Sabre Retraibile",       p:"Mischia",     r:"Presenza",   d:"d10",b:7, m:false,h:"1", f:"Retraibile: la lama si nasconde nell'elsa"},
  {t:3,c:"P",n:"Sciabola Av.",           p:"Mischia",     r:"Presenza",   d:"d8", b:7, m:false,h:"1"},
  {t:3,c:"P",n:"Sciabola Meridian",      p:"Mischia",     r:"Presenza",   d:"d10",b:5, m:false,h:"1", f:"Duello: vantaggio se nessun altro a Ravvicinata dal bersaglio"},
  {t:3,c:"P",n:"Scettro Av.",            p:"Lontana",     r:"Presenza",   d:"d6", b:6, m:true, h:"2", f:"Versatile: anche Presenza/Mischia/d8+4"},
  {t:3,c:"P",n:"Spada Larga Av.",        p:"Mischia",     r:"Agilità",    d:"d8", b:6, m:false,h:"1", f:"Affidabile: +1 ai tiri attacco"},
  {t:3,c:"P",n:"Spadone Av.",            p:"Mischia",     r:"Agilità",    d:"d10",b:9, m:false,h:"2"},
  // ── TIER 3 SECONDARIE ─────────────────────────────────────
  {t:3,c:"S",n:"Balestra a Mano Av.",    p:"Lontana",     r:"Astuzia",    d:"d6", b:5, m:false,h:"1"},
  {t:3,c:"S",n:"Buckler",                p:"Mischia",     r:"Agilità",    d:"d4", b:4, m:false,h:"1", f:"Deflettente: marca Armatura per +Evasione pari agli slot Armatura"},
  {t:3,c:"S",n:"Fionda",                 p:"Prossima",    r:"Astuzia",    d:"d6", b:4, m:false,h:"1", f:"Versatile: anche Finezza/Ravvicinata/d8+4"},
  {t:3,c:"S",n:"Frusta Av.",             p:"Prossima",    r:"Presenza",   d:"d6", b:4, m:false,h:"1", f:"Allarmante: sposta avversari a Ravvicinata"},
  {t:3,c:"S",n:"Guanto Potenziato",      p:"Ravvicinata", r:"Conoscenza", d:"d6", b:4, m:false,h:"1", f:"Caricato: marca Stress per +1 Competenza su attacco primario"},
  {t:3,c:"S",n:"Pugnale Piccolo Av.",    p:"Mischia",     r:"Astuzia",    d:"d8", b:4, m:false,h:"1", f:"Abbinata: +4 danni arma primaria in Mischia"},
  {t:3,c:"S",n:"Rampino Av.",            p:"Ravvicinata", r:"Astuzia",    d:"d6", b:4, m:false,h:"1", f:"Agganciato: tira il bersaglio entro Mischia"},
  {t:3,c:"S",n:"Scudo a Torre Av.",      p:"Mischia",     r:"Forza",      d:"d6", b:4, m:false,h:"1", f:"Barriera: +4 Armatura; -1 Evasione"},
  {t:3,c:"S",n:"Scudo Rotondo Av.",      p:"Mischia",     r:"Forza",      d:"d4", b:4, m:false,h:"1", f:"Protettivo: +3 Punteggio Armatura"},
  {t:3,c:"S",n:"Spada Corta Av.",        p:"Mischia",     r:"Agilità",    d:"d8", b:4, m:false,h:"1", f:"Abbinata: +4 danni arma primaria in Mischia"},
  // ── TIER 4 PRIMARIE ───────────────────────────────────────
  {t:4,c:"P",n:"Alabarda Leg.",          p:"Prossima",    r:"Forza",      d:"d10",b:11,m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:4,c:"P",n:"Anelli Lucenti Leg.",    p:"Prossima",    r:"Agilità",    d:"d10",b:11,m:true, h:"1"},
  {t:4,c:"P",n:"Arco Aantari",           p:"Lontana",     r:"Astuzia",    d:"d6", b:11,m:false,h:"2", f:"Affidabile: +1 ai tiri attacco"},
  {t:4,c:"P",n:"Arco Corto Leg.",        p:"Lontana",     r:"Agilità",    d:"d6", b:12,m:false,h:"2"},
  {t:4,c:"P",n:"Arco Lungo Leg.",        p:"Remota",      r:"Agilità",    d:"d8", b:12,m:false,h:"2", f:"Ingombrante: -1 Astuzia"},
  {t:4,c:"P",n:"Arco Thistlebow",        p:"Lontana",     r:"Istinto",    d:"d6", b:13,m:true, h:"2", f:"Affidabile: +1 ai tiri attacco"},
  {t:4,c:"P",n:"Ascia da Guerra Leg.",   p:"Mischia",     r:"Forza",      d:"d10",b:12,m:false,h:"2"},
  {t:4,c:"P",n:"Ascia Sacra Leg.",       p:"Mischia",     r:"Forza",      d:"d8", b:10,m:true, h:"1"},
  {t:4,c:"P",n:"Ascia Sledge",           p:"Mischia",     r:"Forza",      d:"d12",b:13,m:false,h:"2", f:"Distruttiva: -1 Agilità; avversari a Prossima marcano Stress"},
  {t:4,c:"P",n:"Bacchetta di Essek",     p:"Lontana",     r:"Conoscenza", d:"d8", b:13,m:true, h:"1", f:"Temporale: scegli bersaglio dopo il tiro attacco"},
  {t:4,c:"P",n:"Bacchetta Leg.",         p:"Lontana",     r:"Conoscenza", d:"d6", b:10,m:true, h:"1"},
  {t:4,c:"P",n:"Bastone Corto Leg.",     p:"Ravvicinata", r:"Istinto",    d:"d8", b:10,m:true, h:"1"},
  {t:4,c:"P",n:"Bastone Doppio Leg.",    p:"Lontana",     r:"Istinto",    d:"d8", b:12,m:true, h:"2"},
  {t:4,c:"P",n:"Bloodstaff",             p:"Lontana",     r:"Istinto",    d:"d20",b:7, m:true, h:"2", f:"Dolorosa: ogni attacco riuscito marca Stress"},
  {t:4,c:"P",n:"Fioretto Leg.",          p:"Mischia",     r:"Presenza",   d:"d8", b:9, m:false,h:"1", f:"Rapido: marca Stress per colpire secondo bersaglio"},
  {t:4,c:"P",n:"Grande Bastone Leg.",    p:"Remota",      r:"Conoscenza", d:"d6", b:9, m:true, h:"2", f:"Potente: dado danno extra, scarta il più basso"},
  {t:4,c:"P",n:"Grande Spada Leg.",      p:"Mischia",     r:"Forza",      d:"d10",b:12,m:false,h:"2", f:"Massiccia: -1 Evasione, dado extra scarta più basso"},
  {t:4,c:"P",n:"Guanti Arcani Leg.",     p:"Mischia",     r:"Forza",      d:"d10",b:12,m:true, h:"2"},
  {t:4,c:"P",n:"Guanti di Fusione",      p:"Remota",      r:"Conoscenza", d:"d6", b:9, m:true, h:"2", f:"Legato: bonus ai danni pari al tuo livello"},
  {t:4,c:"P",n:"Guanti Sifone",          p:"Mischia",     r:"Presenza",   d:"d10",b:9, m:true, h:"2", f:"Rubavita: con 6 su d6 recupera PF o Stress"},
  {t:4,c:"P",n:"Guanto d'Impatto",       p:"Mischia",     r:"Forza",      d:"d10",b:11,m:false,h:"1", f:"Percussivo: spendi Speranza per respingere a Lontana"},
  {t:4,c:"P",n:"Lame Galleggianti",      p:"Ravvicinata", r:"Istinto",    d:"d8", b:9, m:true, h:"1", f:"Potente: dado danno extra, scarta il più basso"},
  {t:4,c:"P",n:"Lame Vorticanti",        p:"Lontana",     r:"Agilità",    d:"d6", b:11,m:false,h:"2", f:"Rimbalzo: marca Stress per colpire più bersagli"},
  {t:4,c:"P",n:"Lama Ritornante Leg.",   p:"Ravvicinata", r:"Astuzia",    d:"d8", b:9, m:true, h:"1", f:"Ritorno: torna in mano dopo il lancio"},
  {t:4,c:"P",n:"Lancia Leg.",            p:"Prossima",    r:"Astuzia",    d:"d8", b:12,m:false,h:"2"},
  {t:4,c:"P",n:"Martello da Guerra Leg.",p:"Mischia",     r:"Forza",      d:"d12",b:12,m:false,h:"2", f:"Pesante: -1 Evasione"},
  {t:4,c:"P",n:"Mazza Leg.",             p:"Mischia",     r:"Forza",      d:"d8", b:10,m:false,h:"1"},
  {t:4,c:"P",n:"Pistola a Mano",         p:"Remota",      r:"Astuzia",    d:"d6", b:12,m:false,h:"1", f:"Ricarica: dopo attacco tira d6, con 1 devi ricaricare"},
  {t:4,c:"P",n:"Pistola Magus",          p:"Remota",      r:"Astuzia",    d:"d6", b:13,m:true, h:"1", f:"Ricarica: dopo attacco tira d6, con 1 devi ricaricare"},
  {t:4,c:"P",n:"Polearm Estesa",         p:"Prossima",    r:"Astuzia",    d:"d8", b:10,m:false,h:"2", f:"Lunga: colpisce tutti in linea entro portata"},
  {t:4,c:"P",n:"Pugnale Leg.",           p:"Mischia",     r:"Astuzia",    d:"d8", b:10,m:false,h:"1"},
  {t:4,c:"P",n:"Pugnale Ricurvo",        p:"Mischia",     r:"Astuzia",    d:"d8", b:9, m:false,h:"1", f:"Seghettato: con 1 sul dado fa 8 invece"},
  {t:4,c:"P",n:"Rune Manuali Leg.",      p:"Prossima",    r:"Istinto",    d:"d10",b:9, m:true, h:"1"},
  {t:4,c:"P",n:"Sciabola Leg.",          p:"Mischia",     r:"Presenza",   d:"d8", b:10,m:false,h:"1"},
  {t:4,c:"P",n:"Scettro Leg.",           p:"Lontana",     r:"Presenza",   d:"d6", b:9, m:true, h:"2", f:"Versatile: anche Presenza/Mischia/d8+6"},
  {t:4,c:"P",n:"Spada a Doppio Taglio",  p:"Mischia",     r:"Agilità",    d:"d10",b:9, m:false,h:"2", f:"Rapido: marca Stress per colpire secondo bersaglio"},
  {t:4,c:"P",n:"Spada Larga Leg.",       p:"Mischia",     r:"Agilità",    d:"d8", b:9, m:false,h:"1", f:"Affidabile: +1 ai tiri attacco"},
  {t:4,c:"P",n:"Spada Luce e Fiamme",    p:"Mischia",     r:"Forza",      d:"d10",b:11,m:true, h:"2", f:"Calda: taglia attraverso materiale solido"},
  {t:4,c:"P",n:"Spadone Leg.",           p:"Mischia",     r:"Agilità",    d:"d10",b:12,m:false,h:"2"},
  // ── TIER 4 SECONDARIE ─────────────────────────────────────
  {t:4,c:"S",n:"Artiglio a Nocche",      p:"Mischia",     r:"Forza",      d:"d6", b:8, m:false,h:"1", f:"Doppio Attacco: colpisce altro bersaglio in Mischia con arma prim."},
  {t:4,c:"S",n:"Balestra a Mano Leg.",   p:"Lontana",     r:"Astuzia",    d:"d6", b:7, m:false,h:"1"},
  {t:4,c:"S",n:"Frammento Mirino",       p:"Prossima",    r:"Istinto",    d:"d4", b:0, m:false,h:"1", f:"Mira Fissa: prossimo attacco arma primaria ha successo automatico"},
  {t:4,c:"S",n:"Frusta Leg.",            p:"Prossima",    r:"Presenza",   d:"d6", b:6, m:false,h:"1", f:"Allarmante: sposta avversari a Ravvicinata"},
  {t:4,c:"S",n:"Pugnale Piccolo Leg.",   p:"Mischia",     r:"Astuzia",    d:"d8", b:6, m:false,h:"1", f:"Abbinata: +5 danni arma primaria in Mischia"},
  {t:4,c:"S",n:"Rampino Leg.",           p:"Ravvicinata", r:"Astuzia",    d:"d6", b:6, m:false,h:"1", f:"Agganciato: tira il bersaglio entro Mischia"},
  {t:4,c:"S",n:"Scudo Coraggioso",       p:"Mischia",     r:"Agilità",    d:"d4", b:6, m:false,h:"1", f:"Riparo: marca Armatura riduce danno anche per alleati vicini"},
  {t:4,c:"S",n:"Scudo a Torre Leg.",     p:"Mischia",     r:"Forza",      d:"d6", b:6, m:false,h:"1", f:"Barriera: +5 Armatura; -1 Evasione"},
  {t:4,c:"S",n:"Scudo Rotondo Leg.",     p:"Mischia",     r:"Forza",      d:"d4", b:6, m:false,h:"1", f:"Protettivo: +4 Punteggio Armatura"},
  {t:4,c:"S",n:"Spada Corta Leg.",       p:"Mischia",     r:"Agilità",    d:"d8", b:6, m:false,h:"1", f:"Abbinata: +5 danni arma primaria in Mischia"},
  // ── PERSONALIZZATA ────────────────────────────────────────
  {t:1,c:"P",n:"Personalizzata",         p:"",            r:"",           d:"",   b:0, m:false,h:"1", custom:true},
];

const TIER_DA_LIVELLO = (lv) => lv <= 4 ? 1 : lv <= 7 ? 2 : lv <= 9 ? 3 : 4;
const RANGO_DA_LIVELLO = (lv) => lv <= 1 ? 1 : lv <= 4 ? 2 : lv <= 7 ? 3 : 4;

// ============================================================
// FORME BESTIALI - Daggerheart SRD v1.0 ufficiale (Druido)
// r=rango(1-4), tratto=bonus tratto, ev=bonus evasione
// atk={portata, tratto, dado, bonus}, vantaggi=[], abilita=[]
// ============================================================
const FORME_BESTIALI = [
  // ── RANGO 1 ──────────────────────────────────────────────
  { r:1, nome:"Esploratore Scattante", esempi:"Donnola, Topo, Volpe",
    tratto:"Agilità +1", ev:2,
    atk:{ p:"Mischia", t:"Agilità", d:"d4", b:0 },
    vantaggi:["ingannare","localizzare","sgattaiolare"],
    abilita:[
      { n:"Agilità", d:"Il movimento è silenzioso; spendi una Speranza per muoverti fino a Lontana senza tirare." },
      { n:"Fragile", d:"Quando subisci un danno Maggiore o superiore, abbandoni la Forma Bestiale." },
    ]
  },
  { r:1, nome:"Erbivoro Rapido", esempi:"Capra, Cervo, Gazzella",
    tratto:"Agilità +1", ev:3,
    atk:{ p:"Mischia", t:"Agilità", d:"d6", b:0 },
    vantaggi:["saltare","sgattaiolare","scattare"],
    abilita:[
      { n:"Preda Sfuggente", d:"Quando un attacco avrebbe successo, marca uno Stress e tira d4: aggiungilo alla tua Evasione contro quell'attacco." },
      { n:"Fragile", d:"Quando subisci un danno Maggiore o superiore, abbandoni la Forma Bestiale." },
    ]
  },
  { r:1, nome:"Esploratore Acquatico", esempi:"Anguilla, Pesce, Polpo",
    tratto:"Agilità +1", ev:2,
    atk:{ p:"Mischia", t:"Agilità", d:"d4", b:0 },
    vantaggi:["orientarsi","sgattaiolare","nuotare"],
    abilita:[
      { n:"Acquatico", d:"Puoi respirare e muoverti naturalmente sott'acqua." },
      { n:"Fragile", d:"Quando subisci un danno Maggiore o superiore, abbandoni la Forma Bestiale." },
    ]
  },
  { r:1, nome:"Animale Domestico", esempi:"Cane, Coniglio, Gatto",
    tratto:"Istinto +1", ev:2,
    atk:{ p:"Mischia", t:"Istinto", d:"d6", b:0 },
    vantaggi:["arrampicarsi","localizzare","proteggere"],
    abilita:[
      { n:"Compagno", d:"Quando aiuti un alleato, tira d8 come dado vantaggio." },
      { n:"Fragile", d:"Quando subisci un danno Maggiore o superiore, abbandoni la Forma Bestiale." },
    ]
  },
  // ── RANGO 2 ──────────────────────────────────────────────
  { r:2, nome:"Sentinella Corazzata", esempi:"Armadillo, Pangolino, Tartaruga",
    tratto:"Forza +1", ev:1,
    atk:{ p:"Mischia", t:"Forza", d:"d8", b:2 },
    vantaggi:["scavare","localizzare","proteggere"],
    abilita:[
      { n:"Guscio Corazzato", d:"Resistenza ai danni fisici. Marca una Casella Armatura per ritirarti nel guscio: i danni fisici si riducono del Punteggio Armatura, ma non puoi compiere azioni." },
      { n:"Palla di Cannone", d:"Marca uno Stress: un alleato ti scaglia contro un avversario a Ravvicinata (tiro con Agilità/Forza). In caso di successo: d12+2 danni fisici. Spendi una Speranza per colpire un secondo bersaglio a Prossima (metà danno)." },
    ]
  },
  { r:2, nome:"Corridore Potente", esempi:"Cammello, Cavallo, Zebra",
    tratto:"Agilità +1", ev:2,
    atk:{ p:"Mischia", t:"Agilità", d:"d8", b:1 },
    vantaggi:["saltare","orientarsi","scattare"],
    abilita:[
      { n:"Animale da Sella", d:"Puoi trasportare fino a due alleati consenzienti quando ti muovi." },
      { n:"Travolgere", d:"Marca uno Stress: muoviti in linea retta fino a Ravvicinata e attacca tutti i bersagli in Mischia dalla linea. Successo: d8+1 fisici (Competenza) e temporaneamente Vulnerabili." },
    ]
  },
  { r:2, nome:"Predatore Felino", esempi:"Ghepardo, Leone, Pantera",
    tratto:"Istinto +1", ev:3,
    atk:{ p:"Mischia", t:"Istinto", d:"d8", b:6 },
    vantaggi:["attaccare","scalare","sgattaiolare"],
    abilita:[
      { n:"Fuga", d:"Spendi una Speranza per spostarti fino a Lontana senza tirare." },
      { n:"Bloccare la Fuga", d:"Marca uno Stress per entrare in Mischia con un bersaglio e attaccarlo. Successo: +2 alla Competenza per quell'attacco e il bersaglio marca uno Stress." },
    ]
  },
  { r:2, nome:"Bestia Possente", esempi:"Alce, Orso, Toro",
    tratto:"Forza +1", ev:3,
    atk:{ p:"Mischia", t:"Forza", d:"d10", b:4 },
    vantaggi:["orientarsi","proteggere","spaventare"],
    abilita:[
      { n:"Furia Belluina", d:"Quando tiri 1 su un dado danno, tira d10 e aggiungilo. Puoi anche marcare uno Stress prima di un attacco per +1 Competenza." },
      { n:"Pelle Coriacea", d:"+2 a tutte le soglie di danno." },
    ]
  },
  { r:2, nome:"Serpe Scattante", esempi:"Cobra, Serpente a Sonagli, Vipera",
    tratto:"Astuzia +1", ev:2,
    atk:{ p:"Prossima", t:"Astuzia", d:"d8", b:4 },
    vantaggi:["arrampicarsi","ingannare","scattare"],
    abilita:[
      { n:"Colpo Velenoso", d:"Attacca qualsiasi numero di bersagli a Prossima. Successo: ogni bersaglio è temporaneamente Avvelenato (1d10 danni fisici diretti ogni volta che agisce)." },
      { n:"Sibilo Minaccioso", d:"Marca uno Stress per costringere i bersagli in Mischia ad arretrare a Prossima." },
    ]
  },
  { r:2, nome:"Bestia Alata", esempi:"Corvo, Falco, Gufo",
    tratto:"Astuzia +1", ev:3,
    atk:{ p:"Mischia", t:"Astuzia", d:"d4", b:2 },
    vantaggi:["ingannare","individuare","spaventare"],
    abilita:[
      { n:"Vista a Volo d'Uccello", d:"Puoi volare a volontà. Una volta per riposo, poni al GM una domanda sul paesaggio senza tirare. Il primo tiro che sfrutta quelle info ottiene vantaggio." },
      { n:"Ossa Cave", d:"-2 alle soglie di danno." },
    ]
  },
  // ── RANGO 3 ──────────────────────────────────────────────
  { r:3, nome:"Grande Predatore", esempi:"Lupo Terribile, Tigre dai Denti a Sciabola, Velociraptor",
    tratto:"Forza +2", ev:2,
    atk:{ p:"Mischia", t:"Forza", d:"d12", b:8 },
    vantaggi:["attaccare","furtività","scattare"],
    abilita:[
      { n:"Animale da Sella", d:"Puoi trasportare fino a due alleati consenzienti quando ti muovi." },
      { n:"Mazzata Feroce", d:"Quando riesci in un attacco, spendi una Speranza per rendere il bersaglio temporaneamente Vulnerabile e ottenere +1 Competenza per quell'attacco." },
    ]
  },
  { r:3, nome:"Lucertola Possente", esempi:"Alligatore, Coccodrillo, Mostro di Gila",
    tratto:"Istinto +2", ev:1,
    atk:{ p:"Mischia", t:"Istinto", d:"d10", b:7 },
    vantaggi:["attaccare","muoversi furtivamente","inseguire"],
    abilita:[
      { n:"Difesa Fisica", d:"+3 alle soglie di danno." },
      { n:"Azzannare", d:"Quando riesci in un attacco in Mischia, spendi una Speranza per rendere l'avversario temporaneamente Trattenuto e Vulnerabile." },
    ]
  },
  { r:3, nome:"Grande Bestia Alata", esempi:"Aquila Gigante, Falco",
    tratto:"Astuzia +2", ev:3,
    atk:{ p:"Mischia", t:"Astuzia", d:"d8", b:6 },
    vantaggi:["ingannare","distrarre","individuare"],
    abilita:[
      { n:"Vista a Volo d'Uccello", d:"Puoi volare a volontà. Una volta per riposo, poni al GM una domanda sul paesaggio senza tirare. Il primo tiro con quelle info ottiene vantaggio." },
      { n:"Animale da Sella", d:"Puoi trasportare fino a due alleati consenzienti quando ti muovi." },
    ]
  },
  { r:3, nome:"Predatore Acquatico", esempi:"Delfino, Orca, Squalo",
    tratto:"Agilità +2", ev:4,
    atk:{ p:"Mischia", t:"Agilità", d:"d10", b:6 },
    vantaggi:["attaccare","nuotare","inseguire"],
    abilita:[
      { n:"Acquatico", d:"Puoi respirare e muoverti naturalmente sott'acqua." },
      { n:"Mazzata Feroce", d:"Quando riesci in un attacco, spendi una Speranza per rendere il bersaglio Vulnerabile e ottenere +1 Competenza per quell'attacco." },
    ]
  },
  { r:3, nome:"Bestia Leggendaria", esempi:"Versione potenziata di una forma di Rango 1",
    tratto:"Tratto forma base +1", ev:"+2 (sulla forma base)",
    atk:{ p:"—", t:"—", d:"—", b:0 },
    vantaggi:[],
    abilita:[
      { n:"Evoluto", d:"Scegli una Forma Bestiale di Rango 1. Ottieni tutti i suoi tratti e privilegi più: +6 ai tiri di danno, +1 al tratto usato, +2 all'Evasione." },
    ]
  },
  { r:3, nome:"Ibrido Leggendario", esempi:"Grifone, Sfinge",
    tratto:"Forza +2", ev:3,
    atk:{ p:"Mischia", t:"Forza", d:"d10", b:8 },
    vantaggi:[],
    abilita:[
      { n:"Privilegio dell'Ibrido", d:"Per trasformarti, marca uno Stress aggiuntivo. Scegli due forme di Rango 1–2: ottieni 4 vantaggi e 2 privilegi tra le due forme." },
    ]
  },
  // ── RANGO 4 ──────────────────────────────────────────────
  { r:4, nome:"Mastodonse Colossale", esempi:"Elefante, Mammut, Rinoceronte",
    tratto:"Forza +3", ev:1,
    atk:{ p:"Mischia", t:"Forza", d:"d12", b:12 },
    vantaggi:["individuare","proteggere","spaventare","scattare"],
    abilita:[
      { n:"Animale da Sella", d:"Puoi trasportare fino a quattro alleati consenzienti." },
      { n:"Demolire", d:"Spendi una Speranza: muoviti in linea retta fino a Lontana e attacca tutti i bersagli in Mischia dalla linea. Successo: d8+10 fisici (Competenza) e temporaneamente Vulnerabili." },
      { n:"Imperturbabile", d:"+2 a tutte le soglie di danno." },
    ]
  },
  { r:4, nome:"Signore dei Cieli", esempi:"Drago, Pterodattilo, Roc, Viverna",
    tratto:"Astuzia +3", ev:4,
    atk:{ p:"Mischia", t:"Astuzia", d:"d10", b:11 },
    vantaggi:["attaccare","ingannare","localizzare","orientarsi"],
    abilita:[
      { n:"Animale da Sella", d:"Puoi trasportare fino a tre alleati consenzienti." },
      { n:"Rapace Letale", d:"Puoi volare a piacimento e muoverti fino a Lontana come azione. Se ti muovi in linea retta fino a Mischia da un bersaglio (da almeno Ravvicinata) e attacchi nella stessa azione, ripeti tutti i dadi danno con risultato inferiore alla tua Competenza." },
    ]
  },
  { r:4, nome:"Lucertola Terribile", esempi:"Brachiosauro, Tirannosauro",
    tratto:"Forza +3", ev:2,
    atk:{ p:"Mischia", t:"Forza", d:"d12", b:10 },
    vantaggi:["attaccare","ingannare","spaventare","inseguire"],
    abilita:[
      { n:"Colpi Devastanti", d:"Quando infliggi un danno Grave in Mischia, puoi marcare uno Stress per infliggere un Punto Ferita aggiuntivo." },
      { n:"Passo Massiccio", d:"Puoi muoverti fino a Lontana senza tirare. Ignori il terreno accidentato grazie alla tua taglia." },
    ]
  },
  { r:4, nome:"Bestia Acquatica Epica", esempi:"Balena, Calamaro Gigante",
    tratto:"Agilità +3", ev:3,
    atk:{ p:"Mischia", t:"Agilità", d:"d10", b:10 },
    vantaggi:["localizzare","proteggere","spaventare","inseguire"],
    abilita:[
      { n:"Signore dell'Oceano", d:"Respiri sott'acqua. Quando riesci in un attacco in Mischia, il bersaglio è temporaneamente Trattenuto." },
      { n:"Inflessibile", d:"Quando usi una Casella Armatura, tira d6: con 5+ riduci la gravità senza usare la Casella Armatura." },
    ]
  },
  { r:4, nome:"Bestia Mitica", esempi:"Versione potenziata di una forma di Rango 1 o 2",
    tratto:"Tratto forma base +2", ev:"+3 (sulla forma base)",
    atk:{ p:"—", t:"—", d:"—", b:0 },
    vantaggi:[],
    abilita:[
      { n:"Evoluto", d:"Scegli una Forma Bestiale di Rango 1 o 2. Ottieni tutti i suoi tratti e privilegi più: +9 ai tiri di danno, +2 al tratto, +3 all'Evasione, il dado danno aumenta di una taglia." },
    ]
  },
  { r:4, nome:"Ibrido Mitico", esempi:"Chimera, Coccatrice, Manticora",
    tratto:"Forza +3", ev:2,
    atk:{ p:"Mischia", t:"Forza", d:"d12", b:10 },
    vantaggi:[],
    abilita:[
      { n:"Privilegio dell'Ibrido", d:"Per trasformarti, marca 2 Stress aggiuntivi. Scegli due forme di Rango 1–3: ottieni 4 vantaggi e 2 privilegi tra le forme scelte più un numero di d6 pari al tuo rango come bonus danni." },
    ]
  },
];

// ============================================================
// ARMATURE - Daggerheart SRD v1.0 ufficiale (tutti i Tier)
// t=tier, n=nome, mj=base Moderato, sv=base Grave, sc=slot armatura, f=feature
// Soglie finali: Moderato = mj + livello | Grave = sv + livello
// Senz'armatura: Moderato = livello | Grave = livello × 2
// ============================================================
const ARMATURE = [
  // ── TIER 1 ───────────────────────────────────────────────
  { t:1, n:"Senza armatura",       mj:0,  sv:0,  sc:0, f:"" },
  { t:1, n:"Gambeson",             mj:5,  sv:11, sc:3, f:"Flessibile: +1 Evasione" },
  { t:1, n:"Armatura di Cuoio",    mj:6,  sv:13, sc:3, f:"" },
  { t:1, n:"Cotta di Maglia",      mj:7,  sv:15, sc:4, f:"Pesante: -1 Evasione" },
  { t:1, n:"Armatura Completa",    mj:8,  sv:17, sc:4, f:"Molto Pesante: -2 Evasione; -1 Agilità" },
  // ── TIER 2 ───────────────────────────────────────────────
  { t:2, n:"Gambeson Migl.",       mj:7,  sv:16, sc:4, f:"Flessibile: +1 Evasione" },
  { t:2, n:"Cuoio Migl.",          mj:9,  sv:20, sc:4, f:"" },
  { t:2, n:"Cotta Elundrian",      mj:9,  sv:21, sc:4, f:"Warded: riduce danno magico del Punteggio Armatura" },
  { t:2, n:"Harrowbone",           mj:9,  sv:21, sc:4, f:"Resiliente: prima dell'ultima Casella tira d6, con 6 riduci senza marcare" },
  { t:2, n:"Pettorale Irontree",   mj:9,  sv:20, sc:4, f:"Rinforzato: all'ultima Casella +2 soglie finché non ripari" },
  { t:2, n:"Armatura Runetan",     mj:9,  sv:20, sc:4, f:"Sfuggente: marca Casella per dare svantaggio all'attacco" },
  { t:2, n:"Tyris Soft",           mj:8,  sv:18, sc:5, f:"Silenziosa: +2 ai tiri per muoversi silenziosamente" },
  { t:2, n:"Rosewild",             mj:11, sv:23, sc:5, f:"Speranzosa: puoi marcare una Casella Armatura invece di spendere Speranza" },
  { t:2, n:"Cotta Migl.",          mj:11, sv:24, sc:5, f:"Pesante: -1 Evasione" },
  { t:2, n:"Armatura Completa Migl.",mj:13,sv:28,sc:5, f:"Molto Pesante: -2 Evasione; -1 Agilità" },
  // ── TIER 3 ───────────────────────────────────────────────
  { t:3, n:"Gambeson Av.",         mj:9,  sv:23, sc:5, f:"Flessibile: +1 Evasione" },
  { t:3, n:"Cuoio Av.",            mj:11, sv:27, sc:5, f:"" },
  { t:3, n:"Cotta Av.",            mj:13, sv:31, sc:6, f:"Pesante: -1 Evasione" },
  { t:3, n:"Armatura Completa Av.",mj:15, sv:35, sc:6, f:"Molto Pesante: -2 Evasione; -1 Agilità" },
  { t:3, n:"Bellamie Fine",        mj:11, sv:27, sc:5, f:"Dorata: +1 Presenza" },
  { t:3, n:"Bladefare",            mj:16, sv:39, sc:6, f:"Fisica: non puoi marcare Caselle per ridurre danno magico" },
  { t:3, n:"Scaglie di Drago",     mj:11, sv:27, sc:5, f:"Impenetrabile: una volta per riposo breve, marca Stress invece dell'ultimo PF" },
  { t:3, n:"Mantello di Monett",   mj:16, sv:39, sc:6, f:"Magica: non puoi marcare Caselle per ridurre danno fisico" },
  { t:3, n:"Rune di Fortificazione",mj:17,sv:43, sc:6, f:"Dolorosa: ogni Casella marcata marca anche uno Stress" },
  { t:3, n:"Corazza Chiodata",     mj:10, sv:25, sc:5, f:"Affilata: attacco riuscito in Mischia +d4 al danno" },
  // ── TIER 4 ───────────────────────────────────────────────
  { t:4, n:"Gambeson Leg.",        mj:11, sv:32, sc:6, f:"Flessibile: +1 Evasione" },
  { t:4, n:"Cuoio Leg.",           mj:13, sv:36, sc:6, f:"" },
  { t:4, n:"Cotta Leg.",           mj:15, sv:40, sc:7, f:"Pesante: -1 Evasione" },
  { t:4, n:"Armatura Completa Leg.",mj:17,sv:44, sc:7, f:"Molto Pesante: -2 Evasione; -1 Agilità" },
  { t:4, n:"Canalizzante",         mj:13, sv:36, sc:5, f:"Canalizzante: +1 ai Tiri Incantesimo" },
  { t:4, n:"Dunamis Silkchain",    mj:13, sv:36, sc:7, f:"Rallentamento: marca Casella per +d4 Evasione contro attacco in arrivo" },
  { t:4, n:"Tessuto di Braci",     mj:13, sv:36, sc:6, f:"Ardente: avversario in Mischia che attacca marca uno Stress" },
  { t:4, n:"Armatura Fortezza",    mj:15, sv:40, sc:4, f:"Fortezza: marca Casella riduce severità di due soglie" },
  { t:4, n:"Cotta del Salvatore",  mj:18, sv:48, sc:8, f:"Difficile: -1 a tutti i tratti e Evasione" },
  { t:4, n:"Veritas Opal",         mj:13, sv:36, sc:6, f:"Cerca Verità: brilla quando qualcuno mente entro Ravvicinata" },
];

const PORTATE = ["Mischia","Prossima","Ravvicinata","Lontana","Remota"];
const TRATTI_ARMA = ["Agilità","Forza","Astuzia","Istinto","Presenza","Conoscenza"];
const DADI_DANNO = ["d4","d6","d8","d10","d12","d20"];
const TIPI_DANNO = ["fisico","magico"];

// ============================================================
// COMPONENTI UI
// ============================================================

const TEMA_CHIARO = {
  sfondo:      "#f5f0e8",
  carta:       "#faf7f0",
  cartaChiara: "#ede8db",
  bordo:       "#c8b89a",
  bordoOro:    "#2c1e0f",
  testo:       "#1a1208",
  testoBase:   "#1a1208",
  testoSec:    "#6b5a45",
  oro:         "#8b6914",
  oroChiaro:   "#5c3d0a",
  ink:         "#1a1208",
  rosso:       "#7a1f1f",
  verde:       "#1f5c30",
  tabAttivo:   "#ede8db",
};

const TEMA_SCURO = {
  sfondo:      "#1a1410",
  carta:       "#231c14",
  cartaChiara: "#2d2318",
  bordo:       "#5c4a32",
  bordoOro:    "#c8a96e",
  testo:       "#e8d5a0",
  testoBase:   "#e8d5a0",
  testoSec:    "#a08060",
  oro:         "#c8a050",
  oroChiaro:   "#e8d5a0",
  ink:         "#f0e0b0",
  rosso:       "#c04040",
  verde:       "#50a070",
  tabAttivo:   "#2d2318",
};

const makeStili = (COLORI) => ({
  app: {
    minHeight: "100vh",
    background: COLORI.sfondo,
    fontFamily: "'Crimson Pro', Georgia, 'Times New Roman', serif",
    color: COLORI.testo,
    padding: "12px 16px",
    maxWidth: "960px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "14px", borderBottom: `2px solid ${COLORI.bordoOro}`, paddingBottom: "10px" },
  titolo: { fontSize: "2rem", color: COLORI.ink, margin: 0, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: "bold" },
  sottotitolo: { color: COLORI.testoSec, fontSize: "0.78rem", letterSpacing: "0.22em", marginTop: "4px", textTransform: "uppercase" },
  input: {
    background: "transparent", border: "none", borderBottom: `1px solid ${COLORI.bordo}`,
    borderRadius: "0", color: COLORI.ink, padding: "3px 4px",
    fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "0.95rem",
    width: "100%", boxSizing: "border-box", outline: "none",
  },
  select: {
    background: COLORI.carta, border: `1px solid ${COLORI.bordo}`, borderRadius: "2px",
    color: COLORI.ink, padding: "4px 6px", fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: "0.92rem", width: "100%", boxSizing: "border-box", cursor: "pointer",
  },
  label: {
    fontSize: "0.56rem", color: COLORI.testoSec, letterSpacing: "0.18em",
    marginBottom: "2px", display: "block", textTransform: "uppercase", fontWeight: "bold",
  },
  campo: { marginBottom: "8px" },
  pulsante: {
    background: COLORI.bordoOro, color: COLORI.carta, border: "none", borderRadius: "2px",
    padding: "6px 14px", cursor: "pointer", fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "0.06em", transition: "opacity 0.15s",
  },
  pulsanteRosso: {
    background: COLORI.rosso, color: "#faf7f0", border: "none", borderRadius: "2px",
    padding: "5px 11px", cursor: "pointer", fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "0.8rem",
  },
  btnSmall: {
    background: "transparent", border: `1px solid ${COLORI.bordo}`, borderRadius: "2px",
    color: COLORI.testoSec, padding: "2px 7px", cursor: "pointer",
    fontSize: "0.72rem", fontFamily: "'Crimson Pro', Georgia, serif",
  },
  secHeader: (color) => ({
    background: color || COLORI.cartaChiara, color: COLORI.ink,
    borderTop: `2px solid ${COLORI.bordoOro}`, borderBottom: `2px solid ${COLORI.bordoOro}`,
    padding: "3px 16px", fontSize: "0.62rem", fontWeight: "bold",
    letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "center",
    display: "block", margin: "10px 0 8px", userSelect: "none",
  }),
  sectionHeader: {
    fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase",
    color: COLORI.testoSec, marginBottom: "5px", marginTop: "10px",
    borderBottom: `1px solid ${COLORI.bordo}`, paddingBottom: "2px", fontWeight: "bold",
  },
  carta: { background: COLORI.carta, border: `1px solid ${COLORI.bordo}`, borderRadius: "3px", padding: "10px" },
  cartaTitolo: {
    fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase",
    color: COLORI.testoSec, marginBottom: "8px",
    borderBottom: `1px solid ${COLORI.bordo}`, paddingBottom: "3px", fontWeight: "bold",
  },
  tab: { display: "flex", borderBottom: `2px solid ${COLORI.bordoOro}`, marginBottom: "12px", gap: "0px" },
  tabBtn: (attivo) => ({
    background: attivo ? COLORI.cartaChiara : "transparent",
    color: attivo ? COLORI.ink : COLORI.testoSec,
    border: `1px solid ${attivo ? COLORI.bordoOro : COLORI.bordo}`,
    borderBottom: attivo ? `2px solid ${COLORI.carta}` : "none",
    borderRadius: "3px 3px 0 0", padding: "5px 13px", cursor: "pointer",
    fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "0.78rem",
    letterSpacing: "0.1em", textTransform: "uppercase",
    fontWeight: attivo ? "bold" : "normal", transition: "all 0.12s",
    marginBottom: attivo ? "-2px" : "0",
  }),
  pfBox: (pieno) => ({
    width: "16px", height: "16px",
    background: pieno ? COLORI.ink : "transparent",
    border: `1.5px solid ${COLORI.ink}`,
    cursor: "pointer", display: "inline-block", margin: "2px",
    transition: "background 0.1s", borderRadius: "1px",
  }),
  stressBox: (pieno) => ({
    width: "16px", height: "16px",
    background: pieno ? COLORI.rosso : "transparent",
    border: `1.5px solid ${COLORI.rosso}`,
    cursor: "pointer", display: "inline-block", margin: "2px",
    transition: "background 0.1s", borderRadius: "1px",
  }),
  armBox: (pieno) => ({
    width: "14px", height: "16px",
    background: pieno ? COLORI.ink : "transparent",
    border: `1.5px solid ${COLORI.ink}`,
    borderRadius: "2px 2px 40% 40% / 2px 2px 30% 30%",
    cursor: "pointer", display: "inline-block", margin: "2px", transition: "background 0.1s",
  }),
  tagOro: {
    background: `${COLORI.oro}18`, border: `1px solid ${COLORI.oro}`, borderRadius: "2px",
    padding: "1px 7px", fontSize: "0.7rem", color: COLORI.oro, display: "inline-block", margin: "2px",
  },
  badge: { background: COLORI.cartaChiara, border: `1px solid ${COLORI.bordo}`, borderRadius: "3px", padding: "5px 9px", fontSize: "0.85rem", marginBottom: "5px" },
  badgeOro: { background: `${COLORI.oro}12`, border: `1px solid ${COLORI.bordoOro}`, borderRadius: "3px", padding: "5px 9px", fontSize: "0.85rem", marginBottom: "5px" },
  abilita: { background: COLORI.carta, border: `1px solid ${COLORI.bordo}`, borderRadius: "3px", padding: "9px", marginBottom: "7px", cursor: "pointer", transition: "border-color 0.12s" },
  abilitaTitolo: { color: COLORI.ink, fontSize: "0.92rem", fontWeight: "bold", marginBottom: "3px" },
  abilitaDesc: { color: COLORI.testoSec, fontSize: "0.8rem", lineHeight: "1.5", whiteSpace: "pre-line" },
  divider: { borderColor: COLORI.bordo, margin: "8px 0" },
  stat: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
  statBox: { background: COLORI.cartaChiara, border: `1px solid ${COLORI.bordo}`, borderRadius: "3px", padding: "7px", textAlign: "center" },
  statVal: { fontSize: "1.5rem", color: COLORI.ink, fontWeight: "bold", lineHeight: 1 },
  statLabel: { fontSize: "0.56rem", color: COLORI.testoSec, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "3px", fontWeight: "bold" },
  popup: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  popupBox: {
    background: COLORI.carta, border: `2px solid ${COLORI.bordoOro}`, borderRadius: "4px",
    padding: "22px", maxWidth: "520px", width: "92%", maxHeight: "80vh", overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  },
  griglia: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "14px", alignItems: "start" },
  colSinistra: { display: "flex", flexDirection: "column", gap: "10px" },
});

// ============================================================
// MOSTRI - Daggerheart Manuale Base Italiano (estratti dal PDF)
// ============================================================
// ============================================================
// APP PRINCIPALE
// ============================================================

const STORAGE_KEY = "dh_personaggi";

// Salvataggio su localStorage (funziona nell'APK e nel browser)
// Rilevamento ambiente
const isElectron = () => typeof window !== 'undefined' && !!window.electronAPI;

// Salvataggio — usa Electron file system se disponibile, altrimenti localStorage
const salvaSuStorage = async (lista) => {
  if (isElectron()) {
    try { await window.electronAPI.saveData(lista); return; } catch {}
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    try { await window.storage?.set(STORAGE_KEY, JSON.stringify(lista)); } catch {}
  }
};

// Caricamento — usa Electron file system se disponibile, altrimenti localStorage
const caricaDaStorage = async () => {
  if (isElectron()) {
    try {
      const data = await window.electronAPI.loadData();
      if (data) return data;
    } catch {}
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const nuovoPG = () => ({
  id: Date.now(),
  nome: "Nuovo Personaggio",
  livello: 1,
  classe: "",
  sottoclasse: "",
  retaggio: "",
  comunita: "",
  tratti: { Agilità: 1, Forza: 1, Astuzia: 1, Istinto: 1, Presenza: 1, Conoscenza: 1 },
  evasione: 0,
  pf: { max: 0, attuali: 0 },
  stress: { max: 6, attuali: 0 },
  armatura: { max: 3, attuali: 0 },
  speranza: 0,
  paura: 0,
  competenza: 1,
  esperienze: [],
  avanzamenti: {
    // caselle[rango][opzione] = array di bool (quante caselle marcate)
    caselle: { r2:{}, r3:{}, r4:{} },
    // tappe automatiche già applicate
    tappe: { lv2:false, lv5:false, lv8:false },
    // tratti marcati (bloccati fino al prossimo reset)
    trattiMarcati: [],
  },
  note: "",
  inventario: "",
  carteDotazione: [],
  carteRiserva: [],
  carteGettoni: {},
  armaturaEquip: { n:"Senza armatura", mj:0, sv:0, sc:0, f:"" },
  armaPrimaria:  { n:"", p:"", r:"", d:"", b:0, m:false, h:"1", f:"", t:1, c:"P", custom:false },
  armaSecondaria: { n:"", p:"", r:"", d:"", b:0, m:false, h:"1", f:"", t:1, c:"S", custom:false },
  compagno: {
    nome: "",
    evasione: 10,
    stress: { max: 3, attuali: 0 },
    esperienze: [{ desc: "", bonus: 2 }, { desc: "", bonus: 2 }],
    attacco: { portata: "Mischia", dado: "d6" },
    potenziamenti: [],
    note: "",
  },
  tabAttiva: "info",
  bonusAttivi: {}, // toggle: frenesia, incarnazioneTerra, cacciaNotturn, dominioAria
});

// ─────────────────────────────────────────────────────────────────────────────
// CALCOLO BONUS STATISTICHE DA ABILITÀ, CARTE E ARMI
// Restituisce delta rispetto ai valori base del personaggio.
// ─────────────────────────────────────────────────────────────────────────────
const calcolaBonusStatistiche = (pg) => {
  const lv   = pg.livello    || 1;
  const comp = pg.competenza || 1;
  const agi  = pg.tratti?.Agilità || 0;
  const arm  = pg.armaturaEquip || { n:"Senza armatura", mj:0, sv:0, sc:0, f:"" };
  const haArmatura = arm.sc > 0;
  const dot  = pg.carteDotazione || []; // array di stringhe (nomi carte)
  const ba   = pg.bonusAttivi   || {};
  const sotto = SOTTOCLASSI[pg.sottoclasse] || null;
  const orig  = ORIGINI[pg.retaggio]        || null;

  let ev = 0, mod = 0, gra = 0, slot = 0;
  // Lista voci bonus per il tooltip/riepilogo
  const voci = [];

  const add = (label, dEv=0, dMod=0, dGra=0, dSlot=0) => {
    ev += dEv; mod += dMod; gra += dGra; slot += dSlot;
    voci.push({ label, dEv, dMod, dGra, dSlot });
  };

  // ── 1. PRIVILEGI SOTTOCLASSE ────────────────────────────────────────────
  if (sotto) {
    const checkPriv = (lista, soglia) => {
      if (lv < soglia) return;
      for (const p of lista) {
        switch (p.nome) {
          case "Saldo":          add("Saldo (sottoclasse)",         0, 1, 1); break;
          case "Implacabile":    add("Implacabile (sottoclasse)",   0, 2, 2); break;
          case "Imperturbabile": add("Imperturbabile (sottoclasse)",0, 3, 3); break;
          case "Ascendente":     add("Ascendente (sottoclasse)",    0, 0, 4); break;
          case "Ombra Sfuggente":add("Ombra Sfuggente (sottoclasse)",1,0, 0); break;
          case "Evoca Scudo":
            if ((pg.speranza || 0) >= 2)
              add(`Evoca Scudo (+${comp} Ev, Speranza≥2)`, comp, 0, 0);
            break;
          default: break;
        }
      }
    };
    checkPriv(sotto.base    || [], 1);
    checkPriv(sotto.spec    || [], sotto.livelloSpec    || 4);
    checkPriv(sotto.maestria|| [], sotto.livelloMaestria|| 7);
  }

  // ── 2. TRATTO RETAGGIO (ORIGINI) ────────────────────────────────────────
  if (orig) {
    for (const t of (orig.tratti || [])) {
      if (t.nome === "Guscio")     add(`Guscio (${pg.retaggio})`, 0, comp, comp);
      if (t.nome === "Scioltezza") add(`Scioltezza (${pg.retaggio})`, 1, 0, 0);
    }
  }

  // ── 3. CARTE DOMINIO IN DOTAZIONE (passive) ─────────────────────────────
  if (dot.includes("Intoccabile")) {
    const b = Math.floor(agi / 2);
    if (b > 0) add(`Intoccabile (+${b} Ev)`, b, 0, 0);
  }
  if (dot.includes("Armatura Rinforzata") && haArmatura)
    add("Armatura Rinforzata (+2 soglie)", 0, 2, 2);

  // Padronanza della Lama: attiva se 4+ carte del dominio Lame in dotazione
  if (dot.includes("Padronanza Della Lama")) {
    const lame = (CARTE_DOMINI["Lama"] || []).map(c => c.n);
    const cnt  = dot.filter(n => lame.includes(n)).length;
    if (cnt >= 4) add(`Padronanza della Lama (${cnt} Lame, +4 Grave)`, 0, 0, 4);
  }

  // ── 4. FEATURE ARMA ────────────────────────────────────────────────────
  for (const arma of [pg.armaPrimaria, pg.armaSecondaria]) {
    if (!arma?.f || !arma.n) continue;
    const f = arma.f;
    // Barriera: +N Armatura; -1 Evasione  (Scudi a Torre)
    const m = f.match(/Barriera:\s*\+(\d+)\s*Armatura/);
    if (m) add(`${arma.n}: Barriera (+${m[1]} slot, -1 Ev)`, -1, 0, 0, parseInt(m[1]));
    // Pesante / Massiccia: -1 Evasione
    if (/Pesante:|Massiccia:/.test(f) && f.includes("-1 Evasione"))
      add(`${arma.n}: -1 Ev (${/Pesante/.test(f)?"Pesante":"Massiccia"})`, -1, 0, 0);
  }

  // ── 5. FEATURE ARMATURA ─────────────────────────────────────────────────
  if (arm.f && arm.f.includes("+1 Evasione"))
    add(`${arm.n}: +1 Ev (Flessibile)`, 1, 0, 0);

  // ── 6. TOGGLE (attivati manualmente dal giocatore) ──────────────────────
  if (ba.frenesia)           add("Frenesia (+8 Grave, no Armatura)", 0, 0, 8);
  if (ba.incarnazioneTerra)  add(`Incarn. Elementale Terra (+${comp} soglie)`, 0, comp, comp);
  if (ba.cacciaNotturn)      add("Caccia Notturna (+1 Ev)", 1, 0, 0);
  if (ba.dominioAria)        add("Dominio Elementale Aria (+1 Ev)", 1, 0, 0);

  return { ev, mod, gra, slot, voci, ba };
};

// Toggle disponibili per il personaggio (solo quelli applicabili)
const toggleDisponibili = (pg) => {
  const dot   = pg.carteDotazione || [];
  const sotto = SOTTOCLASSI[pg.sottoclasse] || null;
  const lv    = pg.livello || 1;
  const res   = [];

  const hasPriv = (nome) => {
    if (!sotto) return false;
    const all = [
      ...(sotto.base     || []),
      ...((lv >= (sotto.livelloSpec    || 4)) ? sotto.spec     || [] : []),
      ...((lv >= (sotto.livelloMaestria|| 7)) ? sotto.maestria || [] : []),
    ];
    return all.some(p => p.nome === nome);
  };

  if (dot.includes("Frenesia"))
    res.push({ key:"frenesia",          label:"Frenesia", note:"+8 Grave, Armatura bloccata" });
  if (hasPriv("Incarnazione Elementale") || dot.includes("Incarnazione Elementale"))
    res.push({ key:"incarnazioneTerra", label:"Incarn. Terra", note:"+Comp soglie" });
  if (dot.includes("Caccia Notturna"))
    res.push({ key:"cacciaNotturn",     label:"Caccia Notturna", note:"+1 Ev" });
  if (hasPriv("Dominio Elementale") || dot.includes("Dominio Elementale"))
    res.push({ key:"dominioAria",       label:"Dom. Elem. Aria", note:"+1 Ev" });

  return res;
};




// ============================================================
// COMPONENTE TAB GIOCATORI (dentro sezione DM)
// ============================================================
export default function App() {
  const [modalita, setModalita] = useState("pg");
  const [personaggi, setPersonaggi] = useState([]);
  const [pgSel, setPgSel] = useState(null);
  const [popup, setPopup] = useState(null);
  const [confermElimina, setConfermElimina] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 600);
  const [temaScuro, setTemaScuro] = useState(() => {
    try { return localStorage.getItem("dh_tema") === "scuro"; } catch { return false; }
  });
  const COLORI = temaScuro ? TEMA_SCURO : TEMA_CHIARO;
  const stili = makeStili(COLORI);
  const [toastSalvato, setToastSalvato] = useState(false);
  const [showAvanzamento, setShowAvanzamento] = useState(false);

  // ── MODALITÀ SERVER (LAN) ─────────────────────────────────────
  // Rilevamento URL: ?player = modalità giocatore  |  ?dm=PASSWORD = modalità DM
  const _urlP     = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const SERVER_ROLE = _urlP.has("dm") ? "dm" : _urlP.has("player") ? "player" : null;
  const DM_SECRET_URL = _urlP.get("dm") || "";

  // ID persistente del giocatore (salvato nel browser)
  const PLAYER_ID = useMemo(() => {
    if (SERVER_ROLE !== "player") return null;
    try {
      let id = localStorage.getItem("dh_pid");
      if (!id) { id = "pg_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("dh_pid", id); }
      return id;
    } catch { return "pg_" + Math.random().toString(36).slice(2, 10); }
  }, []);

  const [wsOk,  setWsOk]  = useState(false);
  const [wsErr, setWsErr] = useState(null);
  const [announce, setAnnounce] = useState(null); // messaggio DM → tutti
  const wsRef = useRef(null);

  // Connessione WebSocket (solo se URL contiene ?player o ?dm=...)
  useEffect(() => {
    if (!SERVER_ROLE) return;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsOk(true); setWsErr(null);
      ws.send(JSON.stringify({
        type:     "join",
        role:     SERVER_ROLE === "dm" ? "dm" : "player",
        secret:   DM_SECRET_URL,
        playerId: PLAYER_ID,
        nome:     SERVER_ROLE === "player"
          ? (localStorage.getItem("dh_nome_giocatore") || "Giocatore")
          : "DM",
      }));
    };

    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }

      if (m.type === "error") {
        setWsErr(m.msg);
        setCaricamento(false);
        return;
      }

      if (m.type === "init") {
        if (m.role === "dm") {
          setPersonaggi(m.characters || []);
          setPgSel(m.characters?.[0]?.id || null);
          setModalita("dm");
          try { localStorage.setItem("dh_modalita", "dm"); } catch {}
        } else {
          // Giocatore: riceve solo il suo personaggio (o nessuno → crea nuovo)
          if (m.character) {
            setPersonaggi([m.character]);
            setPgSel(m.character.id);
          } else {
            setPersonaggi([]);
            setPgSel(null);
          }
          setModalita("pg");
          try { localStorage.setItem("dh_modalita", "pg"); } catch {}
        }
        setCaricamento(false);
        if (window.__dhReady) window.__dhReady();
        return;
      }

      // Aggiornamento scheda da server (altro giocatore o DM)
      if (m.type === "char_update") {
        setPersonaggi(prev => {
          const idx = prev.findIndex(c => c.id === m.char.id);
          if (idx >= 0) { const n = [...prev]; n[idx] = m.char; return n; }
          // DM riceve nuovi personaggi; giocatore ignora schede altrui
          if (SERVER_ROLE === "dm") return [...prev, m.char];
          return prev;
        });
        return;
      }

      // Eliminazione scheda (solo DM la riceve)
      if (m.type === "char_delete") {
        if (SERVER_ROLE === "dm") {
          setPersonaggi(prev => prev.filter(c => c.id !== m.id));
        }
        return;
      }

      // Giocatore connesso/disconnesso (avviso nel pannello DM)
      if (m.type === "player_connected" || m.type === "player_disconnected") {
        // gestito nel tab Giocatori del DM tramite lo stato normale
        return;
      }

      // Annuncio del DM → toast per tutti i giocatori
      if (m.type === "announce") {
        setAnnounce(m.testo);
        setTimeout(() => setAnnounce(null), 5000);
        return;
      }
    };

    ws.onerror = () => setWsErr("Impossibile connettersi al server.");
    ws.onclose = () => { setWsOk(false); };

    // Ping keepalive ogni 25s
    const pingInterval = setInterval(() => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: "ping" }));
    }, 25000);

    return () => { clearInterval(pingInterval); ws.close(); };
  }, []);

  // Funzione per inviare una scheda al server
  const wsSendChar = useCallback((lista) => {
    if (!wsRef.current || wsRef.current.readyState !== 1 || !SERVER_ROLE) return;
    const toSync = SERVER_ROLE === "player"
      ? lista.filter(c => c.id === PLAYER_ID)
      : lista;
    toSync.forEach(c => wsRef.current.send(JSON.stringify({ type: "update_char", char: c })));
  }, [SERVER_ROLE, PLAYER_ID]);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Sincronizza tema con body background e localStorage
  useEffect(() => {
    try { localStorage.setItem("dh_tema", temaScuro ? "scuro" : "chiaro"); } catch {}
    document.body.style.background = temaScuro ? TEMA_SCURO.sfondo : TEMA_CHIARO.sfondo;
    document.body.style.color      = temaScuro ? TEMA_SCURO.testo  : TEMA_CHIARO.testo;
  }, [temaScuro]);

  // Carica personaggi da localStorage (o fallback window.storage)
  useEffect(() => {
    (async () => {
      try {
        const lista = await caricaDaStorage();
        if (lista && lista.length > 0) {
          setPersonaggi(lista);
          setPgSel(lista[0].id);
        }
      } catch {}
      setCaricamento(false);
    })();
  }, []);

  const mostraToast = useCallback(() => {
    setToastSalvato(true);
    setTimeout(() => setToastSalvato(false), 1500);
  }, []);

  const salva = useCallback(async (lista) => {
    setPersonaggi(lista);
    await salvaSuStorage(lista);
    wsSendChar(lista);
    mostraToast();
  }, [mostraToast, wsSendChar]);

  const aggiorna = useCallback((campo, valore) => {
    setPersonaggi(prev => {
      const nuova = prev.map(pg => pg.id === pgSel ? { ...pg, [campo]: valore } : pg);
      salvaSuStorage(nuova);
      wsSendChar(nuova);
      return nuova;
    });
  }, [pgSel, wsSendChar]);

  const aggiornaProf = useCallback((campo, sotto, valore) => {
    setPersonaggi(prev => {
      const nuova = prev.map(pg => pg.id === pgSel ? { ...pg, [campo]: { ...pg[campo], [sotto]: valore } } : pg);
      salvaSuStorage(nuova);
      wsSendChar(nuova);
      return nuova;
    });
  }, [pgSel, wsSendChar]);

  const pg = personaggi.find(p => p.id === pgSel);

  const creaPersonaggio = () => {
    // In modalità server player, il personaggio ha sempre l'ID del browser
    const nuovo = SERVER_ROLE === "player"
      ? { ...nuovoPG(), id: PLAYER_ID }
      : nuovoPG();
    // Se esiste già una scheda con lo stesso ID (player che ricreda), la sostituisce
    const lista = SERVER_ROLE === "player"
      ? [...personaggi.filter(p => p.id !== PLAYER_ID), nuovo]
      : [...personaggi, nuovo];
    salva(lista);
    setPgSel(nuovo.id);
  };

  const eliminaPersonaggio = (id) => {
    const lista = personaggi.filter(p => p.id !== id);
    salva(lista);
    if (pgSel === id) setPgSel(lista[0]?.id || null);
    setConfermElimina(null);
  };

  const onClasseChange = (classe) => {
    const dati = CLASSI[classe];
    if (!dati) { aggiorna("classe", classe); return; }
    setPersonaggi(prev => {
      const nuova = prev.map(p => p.id !== pgSel ? p : {
        ...p,
        classe,
        sottoclasse: "",
        evasione: dati.evasioneIniziale + (p.tratti?.Agilità || 0),
        pf: { ...p.pf, max: dati.pfIniziali }
      });
      salvaSuStorage(nuova);
      return nuova;
    });
  };

  if (caricamento) {
    return (
      <div style={{ ...stili.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={stili.titolo}>⚔ Daggerheart ⚔</div>
          {wsErr ? (
            <div style={{ color:"#cc5555", marginTop:"20px", fontSize:"0.9rem", maxWidth:"300px" }}>
              <div style={{ fontSize:"1.5rem", marginBottom:"8px" }}>⚠</div>
              {wsErr}<br/>
              <span style={{ fontSize:"0.75rem", color:COLORI.testoSec }}>Verifica che il server sia avviato e ricarica la pagina.</span>
            </div>
          ) : (
            <div style={{ color: COLORI.testoSec, marginTop: "20px" }}>
              {SERVER_ROLE ? "Connessione al server…" : "Caricamento..."}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div style={stili.app}>
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <div style={stili.header}>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"8px", gap:"8px" }}>
            <button onClick={()=>{ setModalita("selezione"); try{localStorage.setItem("dh_modalita","selezione");}catch{} }}
              style={{ background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"20px",
                color:COLORI.testoSec, cursor:"pointer", fontSize:"0.82rem", padding:"4px 12px" }}>
              ← Cambio modalità
            </button>
            <button onClick={() => setTemaScuro(t => !t)}
              style={{ background: temaScuro ? COLORI.cartaChiara : COLORI.bordoOro, border:`1px solid ${COLORI.bordo}`, borderRadius:"20px", color: temaScuro ? COLORI.ink : COLORI.carta, cursor:"pointer", fontSize:"0.9rem", padding:"4px 12px", transition:"all 0.2s" }}>
              {temaScuro ? "☀ Chiaro" : "🌙 Scuro"}
            </button>
          </div>
          <div style={stili.titolo}>⚔ Daggerheart ⚔</div>
          <div style={stili.sottotitolo}>Scheda Personaggio · Italiano v1.5</div>
        </div>
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <div style={{ color: COLORI.testoSec, marginBottom: "16px", fontSize: "1.1rem" }}>
            {SERVER_ROLE === "player" ? "Benvenuto! Crea la tua scheda personaggio." : "Nessun personaggio creato."}
          </div>
          {SERVER_ROLE === "player" && wsOk && (
            <div style={{ fontSize:"0.75rem", color:"#66cc66", marginBottom:"24px" }}>● Connesso al server</div>
          )}
          <button style={stili.pulsante} onClick={creaPersonaggio}>✦ Crea la tua scheda</button>
        </div>
      </div>
    );
  }

  const classeDati = CLASSI[pg.classe];
  const sottoclasseDati = SOTTOCLASSI[pg.sottoclasse];
  const bs  = calcolaBonusStatistiche(pg);   // bonus statistiche calcolati
  const tog = toggleDisponibili(pg);          // toggle disponibili per questo pg

  return (
    <div style={stili.app}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px", borderBottom:`2px solid ${COLORI.bordoOro}`, paddingBottom:"10px" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:"12px", flexWrap:"wrap" }}>
          <div style={{ fontSize:"1.5rem", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase", color:COLORI.oroChiaro }}>⚔ Daggerheart</div>
          <div style={{ fontSize:"0.68rem", color:COLORI.testoSec, letterSpacing:"0.2em", textTransform:"uppercase" }}>Scheda PG · ITA v1.5</div>
          {SERVER_ROLE && (
            <span style={{
              fontSize:"0.6rem", letterSpacing:"0.1em",
              padding:"2px 8px", borderRadius:"20px",
              background: wsOk ? "#2a4a2a" : "#4a2a2a",
              color: wsOk ? "#66cc66" : "#cc6666",
              border: `1px solid ${wsOk ? "#3a6a3a" : "#6a3a3a"}`,
            }}>
              {wsOk ? "● online" : "○ offline"}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                <button onClick={() => setTemaScuro(t => !t)}
          title={temaScuro ? "Passa al tema chiaro" : "Passa al tema scuro"}
          style={{
            background: temaScuro ? COLORI.cartaChiara : COLORI.bordoOro,
            border: `1px solid ${COLORI.bordo}`,
            borderRadius: "20px",
            color: temaScuro ? COLORI.ink : COLORI.carta,
            cursor: "pointer",
            fontSize: "1rem",
            padding: "4px 12px",
            lineHeight: 1,
            transition: "all 0.2s",
          }}>
          {temaScuro ? "☀ Chiaro" : "🌙 Scuro"}
        </button>
        </div>
      </div>

      {/* Navigazione personaggi */}
      <div style={{ marginBottom: "16px" }}>
        {/* Barra azioni */}
        {/* Barra azioni nascosta in modalità server player */}
        {SERVER_ROLE !== "player" && <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button style={{ ...stili.pulsante, background: COLORI.verde, color: COLORI.testo, fontSize: "0.8rem", padding: "6px 14px" }} onClick={creaPersonaggio}>+ Nuovo PG</button>
          <button style={{ ...stili.pulsante, background: COLORI.cartaChiara, color: COLORI.testoSec, fontSize: "0.8rem", padding: "6px 14px", border: `1px solid ${COLORI.bordo}` }}
            onClick={async () => {
              const json = JSON.stringify(personaggi, null, 2);
              if (isElectron()) {
                await window.electronAPI.exportJSON(json);
              } else {
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "daggerheart-personaggi.json"; a.click();
                URL.revokeObjectURL(url);
              }
            }}>⬇ Esporta JSON</button>
          <button style={{ ...stili.pulsante, background: COLORI.cartaChiara, color: COLORI.testoSec, fontSize: "0.8rem", padding: "6px 14px", border: `1px solid ${COLORI.bordo}` }}
            onClick={async () => {
              if (isElectron()) {
                const result = await window.electronAPI.importJSON();
                if (result.ok) {
                  setPersonaggi(result.data);
                  setPgSel(result.data[0]?.id || null);
                  await salvaSuStorage(result.data);
                }
              } else {
                setShowImport(true); setImportText(""); setImportError("");
              }
            }}>⬆ Importa JSON</button>
          {/* Pulsante salva manuale */}
          <button
            style={{ ...stili.pulsante, fontSize: "0.8rem", padding: "6px 14px",
              background: toastSalvato ? COLORI.verde : COLORI.bordoOro,
              color: COLORI.sfondo, fontWeight: "bold", transition: "background 0.3s" }}
            onClick={async () => { await salvaSuStorage(personaggi); mostraToast(); }}>
            {toastSalvato ? "✓ Salvato!" : "💾 Salva"}
          </button>
          {pgSel && <button style={{ ...stili.pulsanteRosso, marginLeft: "auto", fontSize: "0.8rem", padding: "6px 12px" }} onClick={() => setConfermElimina(pgSel)}>🗑 Elimina PG</button>}
        </div>}
        {/* Toast salvataggio automatico */}
        {toastSalvato && (
          <div style={{ position:"fixed", bottom:"24px", right:"20px", background:COLORI.verde, color:"#fff",
            padding:"10px 20px", borderRadius:"8px", fontSize:"0.85rem", fontWeight:"bold",
            boxShadow:"0 4px 16px #0008", zIndex:9999, pointerEvents:"none",
            animation:"fadeIn 0.2s ease" }}>
            ✓ Salvato
          </div>
        )}
        {/* Card personaggi — nascoste in modalità server player (ha solo 1 pg) */}
        {SERVER_ROLE !== "player" && <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {personaggi.map(p => {
            const attivo = p.id === pgSel;
            const pfPerc = p.pf?.max > 0 ? (p.pf.attuali / p.pf.max) : 0;
            const stressPerc = p.stress?.max > 0 ? (p.stress.attuali / p.stress.max) : 0;
            const pfColor = pfPerc > 0.5 ? "#4a9a4a" : pfPerc > 0.25 ? "#9a8a20" : "#9a3030";
            const stressColor = stressPerc < 0.5 ? "#4a6a9a" : stressPerc < 0.75 ? "#9a7a20" : "#9a3030";
            return (
              <div key={p.id} onClick={() => setPgSel(p.id)}
                style={{ background: attivo ? COLORI.cartaChiara : COLORI.carta,
                  border: `2px solid ${attivo ? COLORI.bordoOro : COLORI.bordo}`,
                  borderRadius: "6px", padding: "10px 14px", cursor: "pointer",
                  minWidth: isMobile?"120px":"140px", transition: "all 0.2s",
                  boxShadow: attivo ? "0 2px 8px #00000030" : "none" }}>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: attivo ? COLORI.oroChiaro : COLORI.testo, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                  {p.nome || "—"}
                </div>
                {p.classe ? (
                  <div style={{ fontSize: "0.68rem", color: COLORI.testoSec, marginBottom: "6px" }}>
                    {p.classe} · Lv{p.livello}
                    {p.sottoclasse ? ` · ${p.sottoclasse}` : ""}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.68rem", color: COLORI.testoSec, marginBottom: "6px", fontStyle: "italic" }}>Nessuna classe</div>
                )}
                {/* Barre PF e Stress */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "0.58rem", color: COLORI.testoSec, width: "26px", textAlign: "right" }}>PF</span>
                    <div style={{ flex: 1, height: "5px", background: COLORI.bordo, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pfPerc * 100}%`, height: "100%", background: pfColor, borderRadius: "3px", transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: "0.6rem", color: pfColor, minWidth: "24px" }}>{p.pf?.attuali ?? 0}/{p.pf?.max ?? 0}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "0.58rem", color: COLORI.testoSec, width: "26px", textAlign: "right" }}>Str</span>
                    <div style={{ flex: 1, height: "5px", background: COLORI.bordo, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${stressPerc * 100}%`, height: "100%", background: stressColor, borderRadius: "3px", transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: "0.6rem", color: stressColor, minWidth: "24px" }}>{p.stress?.attuali ?? 0}/{p.stress?.max ?? 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
      </div>

      {/* Popup import JSON */}
      {showImport && (
        <div style={stili.popup} onClick={() => setShowImport(false)}>
          <div style={stili.popupBox} onClick={e => e.stopPropagation()}>
            <div style={{ color: COLORI.oroChiaro, fontSize: "1.2rem", fontWeight: "bold", marginBottom: "12px" }}>⬆ Importa Personaggi JSON</div>
            <div style={{ color: COLORI.testoSec, fontSize: "0.82rem", marginBottom: "12px" }}>
              Incolla il contenuto di un file JSON esportato precedentemente. I personaggi importati verranno <strong style={{ color: COLORI.rosso }}>aggiunti</strong> a quelli esistenti.
            </div>
            <textarea
              style={{ ...stili.input, minHeight: "160px", fontSize: "0.75rem", fontFamily: "monospace", resize: "vertical", marginBottom: "8px" }}
              placeholder='[{"nome": "...", "classe": "...", ...}]'
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError(""); }}
            />
            {importError && <div style={{ color: "#ee5555", fontSize: "0.8rem", marginBottom: "8px" }}>⚠ {importError}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={stili.pulsante} onClick={() => {
                try {
                  const parsed = JSON.parse(importText);
                  const arr = Array.isArray(parsed) ? parsed : [parsed];
                  const withIds = arr.map(p => ({ ...nuovoPG(), ...p, id: Date.now() + Math.random() }));
                  const nuova = [...personaggi, ...withIds];
                  setPersonaggi(nuova);
                  salvaSuStorage(nuova);
                  setPgSel(withIds[0].id);
                  setShowImport(false);
                } catch(e) {
                  setImportError("JSON non valido: " + e.message);
                }
              }}>Importa</button>
              <button style={stili.pulsanteRosso} onClick={() => setShowImport(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup conferma eliminazione */}
      {confermElimina && (
        <div style={stili.popup} onClick={() => setConfermElimina(null)}>
          <div style={stili.popupBox} onClick={e => e.stopPropagation()}>
            <div style={{ color: COLORI.oroChiaro, fontSize: "1.2rem", marginBottom: "12px" }}>Eliminare il personaggio?</div>
            <div style={{ color: COLORI.testoSec, marginBottom: "20px" }}>Questa azione non può essere annullata.</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button style={stili.pulsanteRosso} onClick={() => eliminaPersonaggio(confermElimina)}>Elimina</button>
              <button style={stili.pulsante} onClick={() => setConfermElimina(null)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup abilità */}
      {/* ── MODAL SALI DI LIVELLO ─────────────────────── */}
      {showAvanzamento && pg && (() => {
        const lv       = pg.livello || 1;
        const nuovoLv  = lv + 1;
        const rango    = RANGO_DA_LIVELLO(nuovoLv);
        const rangoKey = `r${rango}`;
        const opzioni  = AVANZAMENTI_RANGO[rango] || [];
        const av       = pg.avanzamenti || { caselle:{r2:{},r3:{},r4:{}}, tappe:{lv2:false,lv5:false,lv8:false}, trattiMarcati:[] };
        const caselle  = av.caselle?.[rangoKey] || {};

        // Conta caselle già usate in questo rango (per il limite 2 per livello)
        // Ogni level-up permette 2 scelte. Le scelte sono accumulate per rango.
        // Teniamo traccia in av.scelteLivello[lv] = [id1, id2]
        const scelteLiv = av.scelteLivello?.[nuovoLv] || [];
        const scelte2   = scelteLiv.length; // quante opzioni già scelte per questo livello

        const isTappa = [2, 5, 8].includes(nuovoLv);
        const tappaKey = `lv${nuovoLv}`;
        const tappaFatta = av.tappe?.[tappaKey];

        const TRATTI_LISTA = ["Agilità","Forza","Astuzia","Istinto","Presenza","Conoscenza"];

        // Caselle usate per un'opzione in questo rango
        const caselleUsate = (id) => (caselle[id] || 0);
        const caselleMax   = (id) => (opzioni.find(o => o.id === id)?.caselle || 0);
        const opzionePiena = (id) => caselleUsate(id) >= caselleMax(id);
        const opzioneScelta = (id) => scelteLiv.includes(id);

        // Stato locale per la scelta corrente (tratti da aumentare se si sceglie "tratti")
        // Usiamo un approccio semplice: selezione immediata

        const applicaScelta = (id) => {
          const op = opzioni.find(o => o.id === id);
          // Le opzioni "doppia" (Competenza, Multiclasse) consumano entrambe
          // le scelte del livello e marcano 2 caselle in un colpo solo.
          const costo = op?.doppia ? 2 : 1;
          if (scelte2 + costo > 2) return;
          if (caselleUsate(id) + costo > caselleMax(id)) return;

          const nuoveScelte  = op?.doppia ? [...scelteLiv, id, id] : [...scelteLiv, id];
          const nuoveCaselle = { ...caselle, [id]: (caselle[id]||0)+costo };

          let updates = {};
          let competenzaDelta = 0;

          // Applica effetto immediato
          if (id === "pf")         updates.pf = { ...pg.pf, max: (pg.pf?.max||0)+1 };
          if (id === "stress")     updates.stress = { ...pg.stress, max: (pg.stress?.max||0)+1 };
          if (id === "evasione")   updates.evasione = (pg.evasione||0)+1;
          if (id === "competenza") competenzaDelta += 1; // l'opzione concede +1 Competenza

          const nuoviAv = {
            ...av,
            caselle: { ...(av.caselle||{}), [rangoKey]: nuoveCaselle },
            scelteLivello: { ...(av.scelteLivello||{}), [nuovoLv]: nuoveScelte },
          };

          // Se ha scelto 2 opzioni → sali di livello automaticamente
          const completato = nuoveScelte.length >= 2;
          if (completato) {
            // Applica tappa se necessario
            if (isTappa && !tappaFatta) {
              competenzaDelta += 1;
              // Tappa del Cammino: +1 Esperienza (mod +2) sulla scheda.
              updates.esperienze = [...(pg.esperienze || []), { desc: "", bonus: 2 }];
              nuoviAv.tappe = { ...(av.tappe||{}), [tappaKey]: true };
              if ([5, 8].includes(nuovoLv)) {
                nuoviAv.trattiMarcati = [];
              }
            }
            updates.livello = nuovoLv;
          }
          updates.avanzamenti = nuoviAv;
          if (competenzaDelta !== 0) updates.competenza = (pg.competenza||1) + competenzaDelta;

          // Applica tutti gli aggiornamenti
          const nuovoPg = { ...pg, ...updates };
          const nuoviPg = personaggi.map(p => p.id === nuovoPg.id ? nuovoPg : p);
          setPersonaggi(nuoviPg);
          salvaSuStorage(nuoviPg);
          wsSendChar(nuoviPg);

          if (completato) setShowAvanzamento(false);
        };

        const annullaScelta = (id) => {
          const op = opzioni.find(o => o.id === id);
          const costo = op?.doppia ? 2 : 1;
          const nuoveScelte  = scelteLiv.filter(s => s !== id);
          const nuoveCaselle = { ...caselle, [id]: Math.max(0,(caselle[id]||costo)-costo) };

          let updates = {};
          if (id === "pf")         updates.pf = { ...pg.pf, max: Math.max(0,(pg.pf?.max||0)-1) };
          if (id === "stress")     updates.stress = { ...pg.stress, max: Math.max(0,(pg.stress?.max||0)-1) };
          if (id === "evasione")   updates.evasione = Math.max(0,(pg.evasione||0)-1);
          if (id === "competenza") updates.competenza = Math.max(1,(pg.competenza||1)-1);

          const nuoviAv = {
            ...av,
            caselle: { ...(av.caselle||{}), [rangoKey]: nuoveCaselle },
            scelteLivello: { ...(av.scelteLivello||{}), [nuovoLv]: nuoveScelte },
          };
          const nuovoPg = { ...pg, ...updates, avanzamenti: nuoviAv };
          const nuoviPg = personaggi.map(p => p.id === nuovoPg.id ? nuovoPg : p);
          setPersonaggi(nuoviPg);
          salvaSuStorage(nuoviPg);
          wsSendChar(nuoviPg);
        };

        return (
          <div style={stili.popup} onClick={() => setShowAvanzamento(false)}>
            <div style={{ ...stili.popupBox, maxWidth:"540px", width:"96vw", maxHeight:"88vh",
              overflowY:"auto", padding:"0" }} onClick={e => e.stopPropagation()}>

              {/* Header modal */}
              <div style={{ background:COLORI.bordoOro, padding:"14px 18px", borderRadius:"4px 4px 0 0" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ color:COLORI.carta, fontSize:"1rem", fontWeight:"bold", letterSpacing:"0.05em" }}>
                      Sali al Livello {nuovoLv}
                    </div>
                    <div style={{ color:`${COLORI.carta}99`, fontSize:"0.68rem", marginTop:"2px" }}>
                      Rango {rango} · {["","Lv1","Lv2–4","Lv5–7","Lv8–10"][rango]}
                    </div>
                  </div>
                  <button onClick={() => setShowAvanzamento(false)}
                    style={{ background:"transparent", border:"none", color:COLORI.carta, fontSize:"1.2rem", cursor:"pointer", padding:"4px 8px" }}>✕</button>
                </div>
              </div>

              <div style={{ padding:"16px 18px" }}>

                {/* Tappa automatica */}
                {isTappa && (
                  <div style={{ background:`${COLORI.oro}15`, border:`1.5px solid ${COLORI.oro}50`, borderRadius:"4px", padding:"10px 12px", marginBottom:"14px" }}>
                    <div style={{ fontSize:"0.7rem", fontWeight:"bold", color:COLORI.oro, marginBottom:"6px", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      ✦ Tappa del Cammino — Automatica
                    </div>
                    <div style={{ fontSize:"0.72rem", color:COLORI.testoSec, lineHeight:1.5 }}>
                      {tappaFatta
                        ? <span style={{color:COLORI.verde}}>✓ Già applicata</span>
                        : <>
                            Guadagni <strong style={{color:COLORI.ink}}>+1 Esperienza</strong> (mod +2) e <strong style={{color:COLORI.ink}}>+1 Competenza</strong> permanente.
                            {[5,8].includes(nuovoLv) && <span> Tutti i tratti marcati vengono <strong style={{color:COLORI.ink}}>resettati</strong>.</span>}
                            <br/><span style={{fontSize:"0.65rem", color:COLORI.testoSec}}>(Verrà applicata automaticamente al completamento.)</span>
                          </>
                      }
                    </div>
                  </div>
                )}

                {/* Aumento soglie danno */}
                <div style={{ background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"3px", padding:"8px 12px", marginBottom:"14px", fontSize:"0.72rem", color:COLORI.testoSec }}>
                  <strong style={{color:COLORI.ink}}>Automatico:</strong> Le soglie di danno aumentano di +1 (livello viene aggiunto sempre alle soglie).
                  Scegli anche <strong style={{color:COLORI.ink}}>1 nuova carta dominio</strong> dalla tab Domini.
                </div>

                {/* Scegli 2 opzioni */}
                <div style={{ fontSize:"0.72rem", fontWeight:"bold", color:COLORI.ink, marginBottom:"10px" }}>
                  Scegli 2 opzioni ({scelte2}/2 selezionate):
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"16px" }}>
                  {opzioni.map(op => {
                    const usate = caselleUsate(op.id);
                    const max   = caselleMax(op.id);
                    const piena = opzionePiena(op.id);
                    const scelta = opzioneScelta(op.id);
                    const bloccata = !scelta && scelte2 >= 2;
                    // Un'opzione già scelta resta cliccabile (per annullarla) anche se "piena".
                    const disabile = (piena && !scelta) || bloccata;

                    return (
                      <div key={op.id} style={{
                        border:`1.5px solid ${scelta ? COLORI.bordoOro : piena ? COLORI.bordo+"80" : COLORI.bordo}`,
                        borderRadius:"3px",
                        background: scelta ? `${COLORI.oro}12` : piena ? `${COLORI.bordo}20` : COLORI.carta,
                        padding:"8px 10px",
                        opacity: piena && !scelta ? 0.5 : 1,
                        cursor: disabile ? "default" : "pointer",
                        display:"flex", alignItems:"flex-start", gap:"8px",
                      }}
                        onClick={() => !disabile && (scelta ? annullaScelta(op.id) : applicaScelta(op.id))}
                      >
                        {/* Caselle checkbox */}
                        <div style={{ display:"flex", gap:"3px", flexShrink:0, marginTop:"2px" }}>
                          {Array.from({length:max}).map((_,i) => (
                            <div key={i} style={{
                              width:"12px", height:"12px", borderRadius:"2px",
                              border:`1.5px solid ${COLORI.bordoOro}`,
                              background: i < usate ? COLORI.bordoOro : "transparent",
                            }}/>
                          ))}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"0.75rem", fontWeight:"bold", color: scelta ? COLORI.bordoOro : COLORI.ink, marginBottom:"2px" }}>
                            {scelta ? "✓ " : ""}{op.label}
                            {op.doppia && <span style={{ fontSize:"0.6rem", color:COLORI.testoSec, fontWeight:"normal" }}> (doppia)</span>}
                          </div>
                          <div style={{ fontSize:"0.65rem", color:COLORI.testoSec, lineHeight:1.4 }}>{op.desc}</div>
                          {piena && <div style={{ fontSize:"0.62rem", color:COLORI.bordo, marginTop:"2px" }}>Tutte le caselle di questo rango sono state marcate.</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Storico scelte rango */}
                {Object.keys(av.scelteLivello||{}).filter(l => RANGO_DA_LIVELLO(parseInt(l)) === rango && parseInt(l) <= lv).length > 0 && (
                  <div style={{ borderTop:`1px solid ${COLORI.bordo}`, paddingTop:"10px" }}>
                    <div style={{ fontSize:"0.62rem", color:COLORI.testoSec, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"6px" }}>
                      Scelte precedenti (Rango {rango})
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                      {Object.entries(av.scelteLivello||{})
                        .filter(([l]) => RANGO_DA_LIVELLO(parseInt(l)) === rango && parseInt(l) <= lv)
                        .flatMap(([l, ids]) => ids.map(id => ({ lv:l, id })))
                        .map(({lv:ll, id}, i) => (
                          <span key={i} style={{ fontSize:"0.62rem", background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"2px", padding:"1px 5px", color:COLORI.testoSec }}>
                            Lv{ll}: {opzioni.find(o=>o.id===id)?.label || id}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}

                <div style={{ display:"flex", gap:"8px", marginTop:"14px" }}>
                  <button onClick={() => setShowAvanzamento(false)}
                    style={{ ...stili.btnSmall, flex:1, padding:"7px", textAlign:"center" }}>
                    Annulla
                  </button>
                  {scelte2 >= 2 && (
                    <div style={{ flex:2, background:COLORI.verde, color:"#fff", borderRadius:"2px", padding:"7px", textAlign:"center", fontSize:"0.75rem", fontWeight:"bold" }}>
                      ✓ Avanzamento completato — Lv{nuovoLv}!
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {popup && (
        <div style={stili.popup} onClick={() => setPopup(null)}>
          <div style={stili.popupBox} onClick={e => e.stopPropagation()}>
            <div style={{ color: COLORI.oroChiaro, fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>{popup.nome}</div>
            {popup.categoria && <div style={stili.tagOro}>{popup.categoria}</div>}
            <div style={{ color: COLORI.testo, fontSize: "0.95rem", lineHeight: "1.7", marginTop: "12px", whiteSpace: "pre-line" }}>{popup.descrizione}</div>
            <button style={{ ...stili.pulsante, marginTop: "20px", width: "100%" }} onClick={() => setPopup(null)}>Chiudi</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
           SCHEDA PRINCIPALE — layout ispirato all'originale
           ══════════════════════════════════════════════ */}

      {/* ── BANNER CLASSE + IDENTITÀ ───────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "auto 1fr auto", gap:"0", border:`2px solid ${COLORI.bordoOro}`, borderRadius:"6px", overflow:"hidden", marginBottom:"12px" }}>
        {/* Blocco classe (nero) */}
        <div style={{ background:COLORI.cartaChiara, color:COLORI.oroChiaro, padding:"10px 14px", minWidth:isMobile?"0":"140px", borderRight:isMobile?"none":`1px solid ${COLORI.bordo}`, borderBottom:isMobile?`1px solid ${COLORI.bordo}`:"none", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <div style={{ fontSize:"1.6rem", fontWeight:"bold", letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1.1 }}>
            {pg.classe || "—"}
          </div>
          {classeDati && (
            <div style={{ fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#aaa", marginTop:"4px" }}>
              {classeDati.domini.join(" & ")}
            </div>
          )}
        </div>
        {/* Campi identità */}
        <div style={{ background:COLORI.carta, padding:"10px 14px", display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr", gap:"6px 12px", alignContent:"center" }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={stili.label}>Nome</label>
            <input style={{ ...stili.input, fontSize:"1.1rem", fontWeight:"600" }} value={pg.nome} onChange={e => aggiorna("nome", e.target.value)} />
          </div>
          <div>
            <label style={stili.label}>Retaggio</label>
            <select style={stili.select} value={pg.retaggio} onChange={e => aggiorna("retaggio", e.target.value)}>
              <option value="">—</option>
              {Object.keys(ORIGINI).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={stili.label}>Comunità</label>
            <select style={stili.select} value={pg.comunita} onChange={e => aggiorna("comunita", e.target.value)}>
              <option value="">—</option>
              {Object.keys(COMUNITA).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: isMobile?"1/-1":"1/-1", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
            <div>
              <label style={stili.label}>Classe</label>
              <select style={stili.select} value={pg.classe} onChange={e => onClasseChange(e.target.value)}>
                <option value="">—</option>
                {Object.keys(CLASSI).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={stili.label}>Sottoclasse</label>
              <select style={stili.select} value={pg.sottoclasse} onChange={e => aggiorna("sottoclasse", e.target.value)} disabled={!pg.classe}>
                <option value="">—</option>
                {(CLASSI[pg.classe]?.sottoclassi || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        {/* Livello badge */}
        <div style={{ background:COLORI.cartaChiara, borderLeft:isMobile?"none":`2px solid ${COLORI.bordo}`, borderTop:isMobile?`2px solid ${COLORI.bordo}`:"none", padding:"10px 16px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minWidth:isMobile?"0":"70px", gap:"6px" }}>
          <label style={{ ...stili.label, textAlign:"center" }}>Livello</label>
          <select style={{ ...stili.select, width:"56px", textAlign:"center", fontSize:"1.5rem", fontWeight:"bold", padding:"2px 4px" }}
            value={pg.livello} onChange={e => aggiorna("livello", parseInt(e.target.value))}>
            {LIVELLI.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {(pg.livello||1) < 10 && (
            <button onClick={() => setShowAvanzamento(true)}
              style={{ fontSize:"0.55rem", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase",
                padding:"3px 8px", background:COLORI.bordoOro, color:COLORI.carta,
                border:"none", borderRadius:"2px", cursor:"pointer", whiteSpace:"nowrap" }}>
              ⬆ Sali di Livello
            </button>
          )}
        </div>
      </div>

      {/* ── RIGA TRATTI ─────────────────────────────────── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"14px", alignItems:"flex-start" }}>

        {/* ── Evasione — scudo SVG ─────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width: isMobile?"72px":"80px", flexShrink:0 }}>
          <div style={{ position:"relative", width:"72px", cursor:"default" }}>
            {/* Scudo SVG grande */}
            <svg viewBox="0 0 72 80" width="72" height="80" xmlns="http://www.w3.org/2000/svg">
              {/* Ombra/bordo esterno */}
              <path d="M4 4 H68 V52 Q68 72 36 78 Q4 72 4 52 Z" fill="#ede8db" stroke="#2c1e0f" strokeWidth="3" strokeLinejoin="round"/>
              {/* Interno scudo */}
              <path d="M9 9 H63 V51 Q63 68 36 74 Q9 68 9 51 Z" fill="#faf7f0" stroke="#2c1e0f" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            {/* Valore evasione sovrapposto */}
            <div style={{ position:"absolute", top:"10px", left:0, width:"100%", textAlign:"center" }}>
              {/* Totale in grande */}
              <div style={{ fontSize:"2.2rem", fontWeight:"bold", color:COLORI.ink,
                lineHeight:1, fontFamily:"'Crimson Pro',Georgia,serif" }}>
                {pg.evasione + bs.ev}
              </div>
              {/* Base + bonus in piccolo */}
              <div style={{ fontSize:"0.56rem", color:COLORI.testoSec, lineHeight:1.2, marginTop:"2px" }}>
                {bs.ev !== 0
                  ? <><span
                      style={{ cursor:"text" }}
                      onClick={() => {
                        const v = prompt("Valore base Evasione:", pg.evasione);
                        if (v !== null && !isNaN(parseInt(v))) aggiorna("evasione", parseInt(v));
                      }}>
                      {pg.evasione}
                    </span>
                    <span style={{ color: bs.ev>0 ? COLORI.verde : COLORI.rosso }}>
                      {" "}{bs.ev>0?"+":""}{bs.ev}
                    </span></>
                  : <span style={{ cursor:"text" }}
                      onClick={() => {
                        const v = prompt("Valore base Evasione:", pg.evasione);
                        if (v !== null && !isNaN(parseInt(v))) aggiorna("evasione", parseInt(v));
                      }}>
                      base {pg.evasione}
                    </span>
                }
              </div>
            </div>
          </div>
          {/* Etichetta + nota */}
          <div style={{ background:COLORI.bordoOro, color:COLORI.carta, fontSize:"0.52rem",
            fontWeight:"bold", letterSpacing:"0.18em", textTransform:"uppercase",
            padding:"2px 8px", borderRadius:"0 0 2px 2px", marginTop:"-4px", textAlign:"center",
            width:"72px", boxSizing:"border-box" }}>
            Evasione
          </div>
          <div style={{ fontSize:"0.5rem", color:COLORI.testoSec, marginTop:"3px", textAlign:"center" }}>
            Inizia a 10
          </div>
          <div style={{ display:"flex", gap:"4px", marginTop:"4px", justifyContent:"center" }}>
            <button onClick={() => aggiorna("evasione", (pg.evasione||0) - 1)}
              style={{ width:"20px", height:"20px", borderRadius:"50%", border:`1px solid ${COLORI.bordo}`,
                background:"transparent", color:COLORI.testoSec, cursor:"pointer", fontSize:"1rem",
                lineHeight:1, padding:0, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Crimson Pro',Georgia,serif" }}>−</button>
            <button onClick={() => aggiorna("evasione", (pg.evasione||0) + 1)}
              style={{ width:"20px", height:"20px", borderRadius:"50%", border:`1px solid ${COLORI.bordo}`,
                background:"transparent", color:COLORI.testoSec, cursor:"pointer", fontSize:"1rem",
                lineHeight:1, padding:0, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Crimson Pro',Georgia,serif" }}>+</button>
          </div>
        </div>

        {/* ── Armatura — scudo con mini-scudetti ──────────────── */}
        {(() => {
          const slotBase  = pg.armatura.max || 0;
          const slotBonus = bs.slot;
          const slotTot   = slotBase + slotBonus;
          const bloccata  = !!(pg.bonusAttivi?.frenesia);
          return (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:isMobile?"86px":"94px", flexShrink:0 }}>
              <div style={{ position:"relative", width:"86px", cursor:"default" }}>
                {/* Scudo SVG armatura (leggermente più largo) */}
                <svg viewBox="0 0 86 90" width="86" height="90" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4 H82 V60 Q82 82 43 88 Q4 82 4 60 Z"
                    fill="#ede8db"
                    stroke={bloccata ? "#c8b89a" : "#2c1e0f"}
                    strokeWidth="3" strokeLinejoin="round"/>
                  <path d="M10 10 H76 V59 Q76 78 43 84 Q10 78 10 59 Z"
                    fill="#faf7f0"
                    stroke={bloccata ? "#c8b89a" : "#2c1e0f"}
                    strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                {/* Griglia mini-scudetti sovrapposta */}
                <div style={{ position:"absolute", top:"10px", left:"50%", transform:"translateX(-50%)",
                  display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"3px",
                  width:"62px" }}>
                  {Array.from({ length: Math.max(slotTot,1) }, (_,i) => {
                    const pieno   = i < pg.armatura.attuali;
                    const isBonus = i >= slotBase;
                    return (
                      <svg key={i}
                        viewBox="0 0 18 20" width="18" height="20"
                        style={{ cursor: bloccata?"not-allowed":"pointer", opacity: bloccata?0.4:1, display:"block" }}
                        onClick={() => {
                          if (bloccata) return;
                          aggiornaProf("armatura","attuali", pieno ? pg.armatura.attuali-1 : pg.armatura.attuali+1);
                        }}
                      >
                        <path d="M1 1 H17 V13 Q17 19 9 19.5 Q1 19 1 13 Z"
                          fill={pieno ? (isBonus?"#3a5fa0":COLORI.ink) : "transparent"}
                          stroke={isBonus?"#3a5fa0":COLORI.ink}
                          strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    );
                  })}
                  {slotTot === 0 && <div style={{ gridColumn:"1/-1", fontSize:"0.55rem", color:COLORI.testoSec, textAlign:"center" }}>—</div>}
                </div>
                {/* Contatore */}
                <div style={{ position:"absolute", bottom:"10px", left:0, width:"100%",
                  textAlign:"center", fontSize:"0.58rem", color: bloccata?COLORI.testoSec:COLORI.ink, fontWeight:"bold" }}>
                  {pg.armatura.attuali}/{slotTot}
                  {slotBonus>0 && <span style={{ color:"#3a5fa0" }}> +{slotBonus}</span>}
                  {bloccata && <span style={{ color:COLORI.rosso }}> ✕</span>}
                </div>
              </div>
              <div style={{ background: bloccata?COLORI.bordo:COLORI.bordoOro, color:COLORI.carta,
                fontSize:"0.52rem", fontWeight:"bold", letterSpacing:"0.18em", textTransform:"uppercase",
                padding:"2px 8px", borderRadius:"0 0 2px 2px", marginTop:"-4px",
                textAlign:"center", width:"86px", boxSizing:"border-box" }}>
                Armatura{bloccata?" ✕":""}
              </div>
            </div>
          );
        })()}

        {/* ── 6 Tratti — forma a banner/pentagono ─────────────── */}
        {TRATTI.map(t => {
          const val = pg.tratti[t] || 0;
          const subskills = {
            "Agilità":    ["Scattare","Saltare","Destreggiarsi"],
            "Forza":      ["Sollevare","Colpire","Afferrare"],
            "Astuzia":    ["Mantenere S.F.","Nascondersi","Usare Strumento"],
            "Istinto":    ["Percepire","Intuire","Orientarsi"],
            "Presenza":   ["Affascinare","Esibirsi","Ingannare"],
            "Conoscenza": ["Ricordare","Analizzare","Comprendere"],
          }[t] || [];

          return (
            <div key={t} style={{ flex: isMobile?"0 0 calc(33.3% - 4px)":"1 1 0", minWidth:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
              {/* Banner pentagono: header + corpo + punta in basso */}
              <div style={{ width:"100%", maxWidth:"90px" }}>

                {/* Header nome tratto */}
                <div style={{
                  background: COLORI.bordoOro,
                  color: COLORI.carta,
                  textAlign: "center",
                  fontSize: "0.56rem",
                  fontWeight: "bold",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  padding: "4px 4px 3px",
                  borderRadius: "3px 3px 0 0",
                  border: `2px solid ${COLORI.bordoOro}`,
                  borderBottom: "none",
                  userSelect: "none",
                }}>
                  {t}
                </div>

                {/* Corpo rettangolare con cerchio valore */}
                <div style={{
                  background: COLORI.carta,
                  border: `2px solid ${COLORI.bordoOro}`,
                  borderTop: "none",
                  borderBottom: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "6px 4px 4px",
                }}>
                  {/* Cerchio grande per il valore */}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={val}
                    onChange={e => aggiorna("tratti", { ...pg.tratti, [t]: parseInt(e.target.value)||0 })}
                    style={{
                      width: "56px", textAlign: "center",
                      fontSize: "1.5rem", fontWeight: "bold",
                      border: "none", background: "transparent",
                      color: COLORI.ink, outline: "none",
                      fontFamily: "'Crimson Pro',Georgia,serif",
                      padding: "4px 0",
                    }}
                  />
                  {/* +/- buttons */}
                  <div style={{ display:"flex", gap:"3px", marginTop:"3px" }}>
                    <button onClick={() => aggiorna("tratti",{...pg.tratti,[t]:(pg.tratti[t]||0)-1})}
                      style={{ width:"18px",height:"18px",borderRadius:"50%",border:`1px solid ${COLORI.bordo}`,
                        background:"transparent",color:COLORI.testoSec,cursor:"pointer",fontSize:"0.9rem",
                        lineHeight:1,padding:0,display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'Crimson Pro',Georgia,serif" }}>−</button>
                    <button onClick={() => aggiorna("tratti",{...pg.tratti,[t]:(pg.tratti[t]||0)+1})}
                      style={{ width:"18px",height:"18px",borderRadius:"50%",border:`1px solid ${COLORI.bordo}`,
                        background:"transparent",color:COLORI.testoSec,cursor:"pointer",fontSize:"0.9rem",
                        lineHeight:1,padding:0,display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'Crimson Pro',Georgia,serif" }}>+</button>
                  </div>
                </div>

                {/* Punta triangolare in basso (simula il pentagono) */}
                <div style={{ width:"100%", height:"18px", lineHeight:0 }}>
                  <svg viewBox="0 0 90 18" width="100%" height="18" xmlns="http://www.w3.org/2000/svg"
                    style={{ display:"block" }}>
                    <polyline points="0,0 45,16 90,0"
                      fill="none" stroke={COLORI.bordoOro} strokeWidth="2" strokeLinejoin="round"/>
                    <polygon points="2,0 45,15 88,0"
                      fill={COLORI.carta}/>
                  </svg>
                </div>

                {/* Sub-skills sotto */}
                <div style={{
                  textAlign: "center",
                  borderLeft: `1px dashed ${COLORI.bordo}`,
                  borderRight: `1px dashed ${COLORI.bordo}`,
                  borderBottom: `1px dashed ${COLORI.bordo}`,
                  padding: "4px 5px 6px",
                  background: COLORI.sfondo,
                }}>
                  {subskills.map(s => (
                    <div key={s} style={{ fontSize:"0.46rem", color:COLORI.testoSec, lineHeight:1.5,
                      wordBreak:"break-word", hyphens:"auto" }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

{/* ── BONUS ATTIVI / TOGGLE ───────────────────────── */}
      {(() => {
        // Mostra anche i bonus passivi in vigore + toggle per quelli situazionali
        const haQualcosa = tog.length > 0 || bs.voci.length > 0;
        if (!haQualcosa) return null;
        return (
          <div style={{ background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"8px 12px", marginBottom:"12px", display:"flex", flexWrap:"wrap", gap:"8px", alignItems:"center" }}>
            <span style={{ fontSize:"0.58rem", letterSpacing:"0.15em", textTransform:"uppercase", color:COLORI.testoSec, fontWeight:"bold", flexShrink:0 }}>Bonus attivi:</span>

            {/* Bonus passivi (sola lettura) */}
            {bs.voci.filter(v => {
              // Escludi i toggle che sono già mostrati come button
              const togKeys = tog.map(t => t.key);
              const isToggle = togKeys.some(k => v.label.toLowerCase().includes(k.toLowerCase().replace("_","")));
              // Mostra solo se davvero attivo (non toggle)
              const isToggleLabel = ["frenesia","incarnazioneTerra","cacciaNotturn","dominioAria"].some(k =>
                v.label.toLowerCase().includes(k.toLowerCase().slice(0,7))
              );
              return !isToggleLabel;
            }).map((v, i) => (
              <span key={i} title={`Ev:${v.dEv>0?"+":""}${v.dEv||0} | Mod:${v.dMod>0?"+":""}${v.dMod||0} | Grave:${v.dGra>0?"+":""}${v.dGra||0} | Slot:${v.dSlot>0?"+":""}${v.dSlot||0}`}
                style={{ fontSize:"0.62rem", background:`${COLORI.bordoOro}22`, border:`1px solid ${COLORI.bordoOro}60`, borderRadius:"3px", padding:"2px 8px", color:COLORI.oroChiaro, cursor:"help" }}>
                ✦ {v.label}
              </span>
            ))}

            {/* Toggle situazionali */}
            {tog.map(t => {
              const attivo = !!(pg.bonusAttivi?.[t.key]);
              return (
                <button key={t.key}
                  title={t.note}
                  onClick={() => aggiorna("bonusAttivi", { ...pg.bonusAttivi, [t.key]: !attivo })}
                  style={{
                    fontSize:"0.62rem", borderRadius:"4px", padding:"3px 10px", cursor:"pointer",
                    background: attivo ? COLORI.bordoOro : "transparent",
                    color:      attivo ? COLORI.sfondo   : COLORI.testoSec,
                    border:     `1px solid ${attivo ? COLORI.bordoOro : COLORI.bordo}`,
                    fontWeight: attivo ? "bold" : "normal",
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    transition: "all 0.15s",
                  }}>
                  {attivo ? "◉" : "○"} {t.label}
                </button>
              );
            })}

            {/* Riepilogo delta complessivo */}
            {(bs.ev !== 0 || bs.mod !== 0 || bs.gra !== 0 || bs.slot !== 0) && (
              <span style={{ marginLeft:"auto", fontSize:"0.6rem", color:COLORI.testoSec }}>
                {bs.ev   !== 0 && <span style={{ color: bs.ev>0?"#6fc96f":"#e06060" }}>  Ev {bs.ev>0?"+":""}{bs.ev}</span>}
                {bs.mod  !== 0 && <span style={{ color: bs.mod>0?"#6fc96f":"#e06060" }}  >  Mod {bs.mod>0?"+":""}{bs.mod}</span>}
                {bs.gra  !== 0 && <span style={{ color: bs.gra>0?"#6fc96f":"#e06060" }}  >  Grave {bs.gra>0?"+":""}{bs.gra}</span>}
                {bs.slot !== 0 && <span style={{ color: bs.slot>0?"#5080d0":"#e06060" }} >  Slot {bs.slot>0?"+":""}{bs.slot}</span>}
              </span>
            )}
          </div>
        );
      })()}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"300px 1fr", gap:"12px", alignItems:"start" }}>
        {/* ═══ COLONNA SINISTRA ═══════════════════════════ */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>

          {/* ─ DANNI & SALUTE ─ */}
          <div style={{ textAlign:"center", marginBottom:"8px" }}>
            <div style={stili.secHeader()}>Danni &amp; Salute</div>
          </div>
          <div style={{ background:COLORI.carta, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"10px" }}>
            {/* Soglie danno */}
            {(() => {
              const lv  = pg.livello || 1;
              const arm = pg.armaturaEquip || { n:"Senza armatura", mj:0, sv:0, sc:0, f:"" };
              const isSenza    = arm.mj === 0 && arm.sv === 0;
              const baseMin    = isSenza ? 0 : arm.mj + lv;   // Moderata base
              const baseGra    = isSenza ? lv : arm.sv + lv;  // Grave base
              // Aggiungiamo solo bs.mod a Moderata e bs.gra a Grave
              // (le abilità in genere danno +N a "soglie" = entrambe, o solo Grave)
              // Calcoliamo quanta parte di bs.mod/gra va separata
              const bonusMod   = bs.mod;
              const bonusGra   = bs.gra;
              const totMod     = baseMin + bonusMod;
              const totGra     = baseGra + bonusGra;

              const CellaSoglia = ({ label, baseArm, lv, bonus, totVal, colore, isLast }) => (
                <div style={{ background:COLORI.cartaChiara, textAlign:"center", padding:"6px 4px", borderRight: isLast ? "none" : `1px solid ${COLORI.bordo}` }}>
                  <div style={{ fontSize:"0.56rem", fontWeight:"bold", letterSpacing:"0.12em", textTransform:"uppercase", color:COLORI.testo }}>{label}</div>
                  {baseArm !== null ? (
                    <>
                      <div style={{ fontSize:"1rem", fontWeight:"bold", color: colore }}>{totVal}</div>
                      <div style={{ fontSize:"0.52rem", color:COLORI.testoSec }}>
                        {baseArm}{lv > 0 ? `+${lv}` : ""}{bonus !== 0 ? <span style={{ color: bonus > 0 ? "#6fc96f" : "#e06060" }}>{bonus > 0 ? `+${bonus}` : bonus}</span> : ""}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize:"0.52rem", color:COLORI.testoSec, marginTop:"4px" }}>Mark 1 HP</div>
                  )}
                </div>
              );

              return (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0", marginBottom:"10px", border:`1px solid ${COLORI.bordo}`, borderRadius:"4px", overflow:"hidden" }}>
                  <CellaSoglia label="Minore"   baseArm={null}    lv={0}  bonus={0}        totVal={0}      colore={COLORI.testo}  isLast={false} />
                  <CellaSoglia label="Moderato" baseArm={isSenza ? 0 : arm.mj} lv={lv} bonus={bonusMod} totVal={totMod} colore={COLORI.testo}  isLast={false} />
                  <CellaSoglia label="Grave"    baseArm={isSenza ? 0 : arm.sv} lv={lv} bonus={bonusGra} totVal={totGra} colore={COLORI.rosso}  isLast={true}  />
                </div>
              );
            })()}
            {/* HP */}
            <div style={{ marginBottom:"8px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px" }}>
                <span style={{ fontSize:"0.65rem", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase" }}>HP</span>
                <span style={{ fontSize:"0.72rem", color:COLORI.testoSec }}>{pg.pf.attuali}/{pg.pf.max}</span>
              </div>
              <div style={{ display:"flex", gap:"2px", flexWrap:"wrap" }}>
                {Array.from({ length: pg.pf.max || 0 }, (_, i) => (
                  <span key={i} style={stili.pfBox(i < pg.pf.attuali)}
                    onClick={() => aggiornaProf("pf", "attuali", i < pg.pf.attuali ? pg.pf.attuali - 1 : pg.pf.attuali + 1)} />
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:"4px", marginTop:"5px" }}>
                <div><label style={stili.label}>Max</label><input style={stili.input} type="text"
                    inputMode="numeric" min="0" value={pg.pf.max} onChange={e => aggiornaProf("pf","max",parseInt(e.target.value)||0)} /></div>
                <div><label style={stili.label}>Attuali</label><input style={stili.input} type="text"
                    inputMode="numeric" min="0" value={pg.pf.attuali} onChange={e => aggiornaProf("pf","attuali",parseInt(e.target.value)||0)} /></div>
              </div>
            </div>
            {/* Stress */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px" }}>
                <span style={{ fontSize:"0.65rem", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase" }}>Stress</span>
                <span style={{ fontSize:"0.72rem", color:COLORI.rosso }}>{pg.stress.attuali}/{pg.stress.max}</span>
              </div>
              <div style={{ display:"flex", gap:"2px", flexWrap:"wrap" }}>
                {Array.from({ length: pg.stress.max }, (_, i) => (
                  <span key={i} style={stili.stressBox(i < pg.stress.attuali)}
                    onClick={() => aggiornaProf("stress", "attuali", i < pg.stress.attuali ? pg.stress.attuali - 1 : pg.stress.attuali + 1)} />
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:"4px", marginTop:"5px" }}>
                <div><label style={stili.label}>Max</label><input style={stili.input} type="text"
                    inputMode="numeric" min="0" value={pg.stress.max} onChange={e => aggiornaProf("stress","max",parseInt(e.target.value)||0)} /></div>
                <div><label style={stili.label}>Attuali</label><input style={stili.input} type="text"
                    inputMode="numeric" min="0" value={pg.stress.attuali} onChange={e => aggiornaProf("stress","attuali",parseInt(e.target.value)||0)} /></div>
              </div>
            </div>
          </div>

          {/* ─ SPERANZA ─ */}
          <div style={{ textAlign:"center", marginBottom:"8px" }}>
            <div style={stili.secHeader()}>Speranza</div>
          </div>
          <div style={{ background:COLORI.carta, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"10px" }}>
            <div style={{ fontSize:"0.68rem", color:COLORI.testoSec, fontStyle:"italic", textAlign:"center", marginBottom:"8px" }}>
              Spendi una Speranza per usare un'Esperienza o aiutare un alleato.
            </div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"center", marginBottom:"8px" }}>
              {Array.from({ length: 6 }, (_, i) => {
                const pieno = i < (pg.speranza || 0);
                return (
                  <span key={i}
                    style={{ fontSize:"1.4rem", cursor:"pointer", color: pieno ? COLORI.oroChiaro : COLORI.bordo, transition:"color 0.12s", userSelect:"none" }}
                    onClick={() => aggiorna("speranza", i < pg.speranza ? pg.speranza - 1 : Math.min(6, pg.speranza + 1))}>
                    ♦
                  </span>
                );
              })}
            </div>
            <div style={{ textAlign:"center" }}>
              <label style={stili.label}>Valore</label>
              <input style={{ ...stili.input, textAlign:"center", width:"80px", display:"inline-block" }} type="text"
                    inputMode="numeric" min="0" value={pg.speranza} onChange={e => aggiorna("speranza", parseInt(e.target.value)||0)} />
            </div>
          </div>

          {/* ─ ARMI ATTIVE ─ */}
          <div style={{ textAlign:"center", marginBottom:"8px" }}>
            <div style={stili.secHeader()}>Armi Attive</div>
          </div>
          <div style={{ background:COLORI.carta, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"10px" }}>
            {/* Competenza */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
              <span style={{ fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", color:COLORI.testoSec }}>Competenza</span>
              <div style={{ display:"flex", gap:"3px" }}>
                {[1,2,3,4,5,6].map(n => (
                  <span key={n} style={{ width:"18px", height:"18px", borderRadius:"50%", border:`1.5px solid ${COLORI.bordoOro}`, background: n <= pg.competenza ? COLORI.bordoOro : "transparent", cursor:"pointer", display:"inline-block", transition:"background 0.12s" }}
                    onClick={() => aggiorna("competenza", n <= pg.competenza ? pg.competenza - 1 : n)} />
                ))}
              </div>
              <span style={{ fontSize:"0.8rem", fontWeight:"bold" }}>+{pg.competenza}</span>
            </div>
            {/* Armi */}
            {["armaPrimaria","armaSecondaria"].map(slot => {
              const isPrimaria = slot === "armaPrimaria";
              const arma = pg[slot] || { n:"", p:"", r:"", d:"", b:0, m:false, h:"1", f:"", t:1, c:isPrimaria?"P":"S", custom:false };
              const aggiornArma = (campo, val) => aggiorna(slot, { ...arma, [campo]: val });
              const selezionaArma = (nomeArma) => {
                if (!nomeArma) { aggiorna(slot, { n:"", p:"", r:"", d:"", b:0, m:false, h:"1", f:"", t:1, c:isPrimaria?"P":"S", custom:false }); return; }
                if (nomeArma === "__custom__") { aggiorna(slot, { ...arma, n:"", custom:true }); return; }
                const trovata = ARMI.find(a => a.n === nomeArma && !a.custom);
                if (trovata) aggiorna(slot, { ...trovata, custom:false });
              };
              const tierCorrente = TIER_DA_LIVELLO(pg.livello || 1);
              const armiDisp = ARMI.filter(a => !a.custom && a.t === tierCorrente && a.c === (isPrimaria ? "P" : "S"));
              const dadoLabel = arma.d ? (arma.b > 0 ? `${arma.d}+${arma.b}` : arma.d) : "—";
              const dannoColor = arma.m ? "#6060cc" : COLORI.ink;
              return (
                <div key={slot} style={{ marginBottom:"10px", paddingBottom:"10px", borderBottom: slot==="armaPrimaria" ? `1px solid ${COLORI.bordo}` : "none" }}>
                  <div style={{ fontSize:"0.6rem", fontWeight:"bold", letterSpacing:"0.14em", textTransform:"uppercase", color:COLORI.ink, marginBottom:"5px", display:"flex", alignItems:"center", gap:"8px" }}>
                    {isPrimaria ? "Primaria" : "Secondaria"}
                    {arma.n && <span style={{ fontWeight:"normal", color:COLORI.testoSec }}>· {arma.n}</span>}
                  </div>
                  <select style={{ ...stili.select, fontSize:"0.82rem", marginBottom:"5px" }}
                    value={arma.custom ? "__custom__" : (arma.n || "")}
                    onChange={e => selezionaArma(e.target.value)}>
                    <option value="">— nessuna —</option>
                    {armiDisp.map(a => <option key={a.n} value={a.n}>{a.n}{a.m ? " ✦" : ""}</option>)}
                    <option value="__custom__">✏ Personalizzata…</option>
                  </select>
                  {!arma.custom && arma.n && arma.d && (
                    <div style={{ display:"flex", gap:"6px", alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ background:COLORI.bordoOro, color:COLORI.sfondo, borderRadius:"3px", padding:"2px 10px", fontSize:"0.82rem", fontWeight:"bold" }}>🎲 {dadoLabel}</span>
                      <span style={{ fontSize:"0.7rem", color:COLORI.testoSec }}>{arma.m?"magico":"fisico"} · {arma.p} · {arma.r}</span>
                      {arma.f && <span style={{ fontSize:"0.7rem", color:"#5a4a9a" }}>✦ {arma.f}</span>}
                    </div>
                  )}
                  {arma.custom && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px" }}>
                      <div style={{ gridColumn:"1/-1" }}><label style={stili.label}>Nome</label><input style={stili.input} value={arma.n||""} onChange={e=>aggiornArma("n",e.target.value)} /></div>
                      <div><label style={stili.label}>Portata</label><select style={stili.select} value={arma.p||""} onChange={e=>aggiornArma("p",e.target.value)}><option value="">—</option>{PORTATE.map(p=><option key={p}>{p}</option>)}</select></div>
                      <div><label style={stili.label}>Tratto</label><select style={stili.select} value={arma.r||""} onChange={e=>aggiornArma("r",e.target.value)}><option value="">—</option>{TRATTI_ARMA.map(t=><option key={t}>{t}</option>)}</select></div>
                      <div><label style={stili.label}>Dado</label><select style={stili.select} value={arma.d||""} onChange={e=>aggiornArma("d",e.target.value)}><option value="">—</option>{DADI_DANNO.map(d=><option key={d}>{d}</option>)}</select></div>
                      <div><label style={stili.label}>Bonus</label><input style={stili.input} type="text"
                    inputMode="numeric" min="0" value={arma.b||0} onChange={e=>aggiornArma("b",parseInt(e.target.value)||0)} /></div>
                      <div style={{ gridColumn:"1/-1" }}><label style={stili.label}>Tipo</label><select style={stili.select} value={arma.m?"magico":"fisico"} onChange={e=>aggiornArma("m",e.target.value==="magico")}>{TIPI_DANNO.map(t=><option key={t}>{t}</option>)}</select></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─ ARMATURA ATTIVA ─ */}
          <div style={{ textAlign:"center", marginBottom:"8px" }}>
            <div style={stili.secHeader()}>Armatura Attiva</div>
          </div>
          <div style={{ background:COLORI.carta, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"10px" }}>
            {(() => {
              const lv = pg.livello || 1;
              const tier = TIER_DA_LIVELLO(lv);
              const armaturaAttuale = pg.armaturaEquip || { n:"Senza armatura", mj:0, sv:0, sc:0, f:"" };
              // "Senza armatura" (Tier 1) è sempre disponibile, in aggiunta alle armature del tier corrente.
              const senzaArmatura = ARMATURE.find(a => a.n === "Senza armatura");
              const armaturaFiltrate = [
                ...(senzaArmatura ? [senzaArmatura] : []),
                ...ARMATURE.filter(a => a.t === tier && a.n !== "Senza armatura"),
              ];
              return (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"6px", marginBottom:"6px", fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", color:COLORI.testoSec, borderBottom:`1px solid ${COLORI.bordo}`, paddingBottom:"4px" }}>
                    <span>Nome</span><span>Soglie Base</span><span>Slot</span>
                  </div>
                  <select style={{ ...stili.select, marginBottom:"4px" }}
                    value={armaturaAttuale.n}
                    onChange={e => {
                      const trovata = ARMATURE.find(a => a.n === e.target.value);
                      if (!trovata) return;
                      setPersonaggi(prev => {
                        const nuova = prev.map(p => p.id === pgSel ? {
                          ...p,
                          armaturaEquip: trovata,
                          armatura: { ...p.armatura, max: trovata.sc, attuali: Math.min(p.armatura?.attuali||0, trovata.sc) },
                        } : p);
                        salvaSuStorage(nuova);
                        wsSendChar(nuova);
                        return nuova;
                      });
                    }}>
                    {armaturaFiltrate.map(a => (
                      <option key={a.n} value={a.n}>{a.n} | {a.mj+lv}/{a.sv+lv} | {a.sc} slot</option>
                    ))}
                  </select>
                  {armaturaAttuale.f && <div style={{ fontSize:"0.7rem", color:"#5a4a9a", marginTop:"3px" }}>✦ {armaturaAttuale.f}</div>}
                </>
              );
            })()}
          </div>

          {/* ─ ESPERIENZE ─ */}
          <div style={{ textAlign:"center", marginBottom:"8px" }}>
            <div style={stili.secHeader()}>Esperienze</div>
          </div>
          <div style={{ background:COLORI.carta, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"10px" }}>
            {(pg.esperienze || []).map((e, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"5px", marginBottom:"5px", alignItems:"center" }}>
                <input style={stili.input} placeholder={`Esperienza ${i+1}`} value={e.desc||""} onChange={ev => {
                  const arr=[...(pg.esperienze||[])]; arr[i]={...e,desc:ev.target.value}; aggiorna("esperienze",arr);
                }} />
                <input style={{ ...stili.input, width:"52px", textAlign:"center" }} type="text"
                    inputMode="numeric" value={e.bonus||0} onChange={ev => {
                  const arr=[...(pg.esperienze||[])]; arr[i]={...e,bonus:parseInt(ev.target.value)||0}; aggiorna("esperienze",arr);
                }} />
                <button style={{ ...stili.btnSmall, color:COLORI.rosso }} onClick={() => {
                  const arr=[...(pg.esperienze||[])]; arr.splice(i,1); aggiorna("esperienze",arr);
                }}>✕</button>
              </div>
            ))}
            <button style={{ ...stili.btnSmall, width:"100%", marginTop:"4px" }} onClick={() => aggiorna("esperienze", [...(pg.esperienze||[]), {desc:"",bonus:2}])}>+ Aggiungi Esperienza</button>
          </div>

          {/* ─ ORO ─ */}
          <div style={{ textAlign:"center", marginBottom:"8px" }}>
            <div style={stili.secHeader()}>Oro</div>
          </div>
          <div style={{ background:COLORI.carta, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"10px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
              {["Manciate","Sacche","Forzieri"].map(tipo => (
                <div key={tipo} style={{ textAlign:"center" }}>
                  <label style={stili.label}>{tipo}</label>
                  <input style={{ ...stili.input, textAlign:"center" }} type="text"
                    inputMode="numeric" min="0"
                    value={(pg.oro||{})[tipo.toLowerCase()]||0}
                    onChange={e => aggiorna("oro", { ...(pg.oro||{}), [tipo.toLowerCase()]: parseInt(e.target.value)||0 })} />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLONNA DESTRA */}
        <div>
          <div style={stili.carta}>
            {/* Tab */}
            <div style={stili.tab}>
              {["info", "domini",
                ...(pg.classe === "Druido" ? ["bestie"] : []),
                ...(pg.classe === "Ranger" ? ["compagno"] : []),
                "note"].map(t => (
                <button key={t} style={stili.tabBtn(pg.tabAttiva === t)} onClick={() => aggiorna("tabAttiva", t)}>
                  {{ info: "ℹ Classe", domini: "✦ Domini", bestie: "🐺 Bestie", compagno: "🐾 Compagno", note: "📜 Note" }[t]}
                </button>
              ))}
            </div>

            {/* TAB INFO */}
            {pg.tabAttiva === "info" && classeDati && (
              <div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {classeDati.domini.map(d => <span key={d} style={stili.tagOro}>✦ {d}</span>)}
                  <span style={{ ...stili.tagOro, borderColor: "#50aa70", color: "#90dd90", background: "#1a4a2a50" }}>Ev. {classeDati.evasioneIniziale}</span>
                  <span style={{ ...stili.tagOro, borderColor: "#aa5050", color: "#ee8888", background: "#4a1a1a50" }}>PF {classeDati.pfIniziali}</span>
                </div>
                <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginBottom: "16px", fontStyle: "italic" }}>
                  {classeDati.oggettiClasse}
                </div>

                {/* Privilegio Speranza */}
                <div style={stili.sectionHeader}>Privilegio della Speranza</div>
                <div style={{ ...stili.badgeOro, cursor: "pointer" }}
                  onClick={() => setPopup({ nome: classeDati.privilegioSperanza.nome, descrizione: classeDati.privilegioSperanza.descrizione, categoria: "Privilegio Speranza" })}>
                  <span style={{ color: COLORI.oroChiaro, fontWeight: "bold" }}>⭐ {classeDati.privilegioSperanza.nome}</span>
                  <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "4px" }}>{classeDati.privilegioSperanza.descrizione.substring(0, 80)}...</div>
                </div>

                {/* Privilegi Classe */}
                <div style={stili.sectionHeader}>Privilegi di Classe</div>
                {classeDati.privilegiClasse.map(p => (
                  <div key={p.nome} style={{ ...stili.badge, cursor: "pointer" }}
                    onClick={() => setPopup({ nome: p.nome, descrizione: p.descrizione, categoria: "Privilegio di Classe" })}>
                    <span style={{ color: COLORI.testo, fontWeight: "bold" }}>⚙ {p.nome}</span>
                    <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "2px" }}>{p.descrizione.substring(0, 80)}...</div>
                  </div>
                ))}

                {/* Sottoclasse */}
                {sottoclasseDati && <>
                  <div style={stili.sectionHeader}>Sottoclasse: {pg.sottoclasse}
                    {sottoclasseDati.tratto && <span style={{ ...stili.tagOro, marginLeft: "8px" }}>Incantatore: {sottoclasseDati.tratto}</span>}
                  </div>

                  <div style={{ marginBottom: "4px", color: COLORI.testoSec, fontSize: "0.75rem", letterSpacing: "0.1em" }}>PRIVILEGIO BASE (Lv1)</div>
                  {sottoclasseDati.base.map(p => (
                    <div key={p.nome} style={{ ...stili.badge, cursor: "pointer" }}
                      onClick={() => setPopup({ nome: p.nome, descrizione: p.descrizione, categoria: "Privilegio Base Sottoclasse" })}>
                      <span style={{ color: COLORI.testo, fontWeight: "bold" }}>▸ {p.nome}</span>
                      <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "2px" }}>{p.descrizione.substring(0, 80)}...</div>
                    </div>
                  ))}

                  {pg.livello >= sottoclasseDati.livelloSpec && <>
                    <div style={{ marginTop: "10px", marginBottom: "4px", color: COLORI.testoSec, fontSize: "0.75rem", letterSpacing: "0.1em" }}>SPECIALIZZAZIONE (Lv{sottoclasseDati.livelloSpec})</div>
                    {sottoclasseDati.spec.map(p => (
                      <div key={p.nome} style={{ ...stili.badge, cursor: "pointer", borderColor: COLORI.bordoOro }}
                        onClick={() => setPopup({ nome: p.nome, descrizione: p.descrizione, categoria: "Specializzazione" })}>
                        <span style={{ color: COLORI.oro, fontWeight: "bold" }}>◆ {p.nome}</span>
                        <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "2px" }}>{p.descrizione.substring(0, 80)}...</div>
                      </div>
                    ))}
                  </>}

                  {pg.livello >= sottoclasseDati.livelloMaestria && <>
                    <div style={{ marginTop: "10px", marginBottom: "4px", color: COLORI.oro, fontSize: "0.75rem", letterSpacing: "0.1em" }}>✦ MAESTRIA (Lv{sottoclasseDati.livelloMaestria})</div>
                    {sottoclasseDati.maestria.map(p => (
                      <div key={p.nome} style={{ ...stili.badgeOro, cursor: "pointer" }}
                        onClick={() => setPopup({ nome: p.nome, descrizione: p.descrizione, categoria: "Maestria" })}>
                        <span style={{ color: COLORI.oro, fontWeight: "bold" }}>✦ {p.nome}</span>
                        <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "2px" }}>{p.descrizione.substring(0, 80)}...</div>
                      </div>
                    ))}
                  </>}

                  {pg.livello < sottoclasseDati.livelloSpec && (
                    <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", fontStyle: "italic", marginTop: "8px" }}>
                      Specializzazione disponibile al livello {sottoclasseDati.livelloSpec}
                    </div>
                  )}
                  {pg.livello < sottoclasseDati.livelloMaestria && pg.livello >= sottoclasseDati.livelloSpec && (
                    <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", fontStyle: "italic", marginTop: "8px" }}>
                      Maestria disponibile al livello {sottoclasseDati.livelloMaestria}
                    </div>
                  )}
                </>}
                {/* Retaggio e Comunità */}
                {(pg.retaggio && ORIGINI[pg.retaggio]) || (pg.comunita && COMUNITA[pg.comunita]) ? <>
                  <div style={{ borderTop: `1px solid ${COLORI.bordo}`, marginTop: "16px", paddingTop: "12px" }}>
                    {pg.retaggio && ORIGINI[pg.retaggio] && <>
                      <div style={stili.sectionHeader}>Retaggio: {pg.retaggio}</div>
                      <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", fontStyle: "italic", marginBottom: "8px" }}>{ORIGINI[pg.retaggio].descrizione}</div>
                      {ORIGINI[pg.retaggio].tratti.map(t => (
                        <div key={t.nome} style={{ ...stili.badge, cursor: "pointer" }}
                          onClick={() => setPopup({ nome: t.nome, descrizione: t.descrizione, categoria: `Retaggio: ${pg.retaggio}` })}>
                          <span style={{ color: COLORI.testo, fontWeight: "bold" }}>◈ {t.nome}</span>
                          <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "2px" }}>{t.descrizione.substring(0, 90)}...</div>
                        </div>
                      ))}
                    </>}
                    {pg.comunita && COMUNITA[pg.comunita] && <>
                      <div style={stili.sectionHeader}>Comunità: {pg.comunita}</div>
                      <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", fontStyle: "italic", marginBottom: "8px" }}>{COMUNITA[pg.comunita].descrizione}</div>
                      <div style={{ ...stili.badge, cursor: "pointer" }}
                        onClick={() => setPopup({ nome: COMUNITA[pg.comunita].tratto.nome, descrizione: COMUNITA[pg.comunita].tratto.descrizione, categoria: `Comunità: ${pg.comunita}` })}>
                        <span style={{ color: COLORI.testo, fontWeight: "bold" }}>◈ {COMUNITA[pg.comunita].tratto.nome}</span>
                        <div style={{ color: COLORI.testoSec, fontSize: "0.8rem", marginTop: "2px" }}>{COMUNITA[pg.comunita].tratto.descrizione.substring(0, 90)}...</div>
                      </div>
                      {/* Contatore gettoni comunità (es. Marittima) */}
                      {COMUNITA[pg.comunita].tratto.descrizione.includes("gettone") && (() => {
                        const keyG = `comunita_${pg.comunita}`;
                        const tot = (pg.carteGettoni || {})[keyG] || 0;
                        const maxG = pg.livello || 1;
                        const setG = (v) => {
                          const nuovi = { ...(pg.carteGettoni || {}), [keyG]: Math.max(0, Math.min(maxG, v)) };
                          aggiorna("carteGettoni", nuovi);
                        };
                        return (
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"6px", padding:"5px 8px", background: COLORI.cartaChiara, borderRadius:"4px", border: `1px solid ${COLORI.bordo}` }}>
                            <span style={{ fontSize:"0.68rem", color: COLORI.testoSec, letterSpacing:"0.08em" }}>🪙 Gettoni</span>
                            <div style={{ display:"flex", gap:"3px" }}>
                              {Array.from({ length: maxG }, (_, i) => (
                                <div key={i}
                                  style={{ width:"16px", height:"16px", borderRadius:"50%", cursor:"pointer",
                                    background: i < tot ? COLORI.oro : "transparent",
                                    border: `1.5px solid ${i < tot ? COLORI.oro : COLORI.bordo}`,
                                    transition:"background 0.15s" }}
                                  onClick={() => setG(i < tot ? i : i + 1)} />
                              ))}
                            </div>
                            <span style={{ fontSize:"0.75rem", color: COLORI.oro, fontWeight:"bold" }}>{tot}/{maxG}</span>
                            <button style={{ ...stili.btnSmall, color: COLORI.oro, borderColor:"#204040" }} onClick={() => setG(tot + 1)}>+</button>
                            <button style={{ ...stili.btnSmall, color:"#888", borderColor:"#204040" }} onClick={() => setG(tot - 1)}>−</button>
                            <button style={{ ...stili.btnSmall, fontSize:"0.62rem", color: COLORI.testoSec, borderColor: COLORI.bordo }} onClick={() => setG(0)} title="Azzera">✕</button>
                          </div>
                        );
                      })()}
                    </>}
                  </div>
                </> : null}
              </div>
            )}
            {pg.tabAttiva === "info" && !classeDati && (
              <div style={{ color: COLORI.testoSec, textAlign: "center", padding: "40px" }}>Seleziona una classe per vedere le informazioni.</div>
            )}

            {/* TAB DOMINI */}
            {pg.tabAttiva === "domini" && (
              <div>
                {classeDati ? (() => {
                  const domini = classeDati.domini;
                  const pgLv = pg.livello || 1;
                  const dotazione = pg.carteDotazione || [];
                  const riserva = pg.carteRiserva || [];
                  const gettoni = pg.carteGettoni || {};
                  const setGettoni = (nomeCarta, valore) => {
                    const nuoviGettoni = { ...gettoni, [nomeCarta]: Math.max(0, valore) };
                    setPersonaggi(prev => {
                      const nuova = prev.map(p => p.id === pgSel ? { ...p, carteGettoni: nuoviGettoni } : p);
                      salvaSuStorage(nuova);
                      return nuova;
                    });
                  };
                  const haGettoni = (desc) => desc && desc.includes("gettoni");

                  const toggleCarta = (nomeCarta) => {
                    const inDot = dotazione.includes(nomeCarta);
                    const inRis = riserva.includes(nomeCarta);
                    let newDot = [...dotazione];
                    let newRis = [...riserva];
                    if (inDot) {
                      newDot = newDot.filter(c => c !== nomeCarta);
                    } else if (inRis) {
                      // already in riserva, do nothing (managed separately)
                      return;
                    } else {
                      // Blocca se dotazione piena (max 5)
                      if (newDot.length >= 5) return;
                      newDot = [...newDot, nomeCarta];
                    }
                    setPersonaggi(prev => {
                      const nuova = prev.map(p => p.id === pgSel ? { ...p, carteDotazione: newDot, carteRiserva: newRis } : p);
                      salvaSuStorage(nuova);
                      return nuova;
                    });
                  };

                  const resetRiserva = () => {
                    setPersonaggi(prev => {
                      const nuova = prev.map(p => p.id === pgSel ? {
                        ...p,
                        carteDotazione: [...(p.carteDotazione || []), ...(p.carteRiserva || [])],
                        carteRiserva: []
                      } : p);
                      salvaSuStorage(nuova);
                      return nuova;
                    });
                  };

                  // Raggruppa le carte per livello
                  const cartePerLivello = {};
                  for (const dom of domini) {
                    for (const carta of (CARTE_DOMINI[dom] || [])) {
                      if (carta.l <= pgLv) {
                        if (!cartePerLivello[carta.l]) cartePerLivello[carta.l] = {};
                        if (!cartePerLivello[carta.l][dom]) cartePerLivello[carta.l][dom] = [];
                        cartePerLivello[carta.l][dom].push(carta);
                      }
                    }
                  }

                  const stileChip = (nome) => {
                    const inDot = dotazione.includes(nome);
                    const inRis = riserva.includes(nome);
                    const dotPiena = !inDot && !inRis && dotazione.length >= 5;
                    return {
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      margin: "3px", padding: "4px 10px", borderRadius: "4px",
                      fontSize: "0.78rem", cursor: dotPiena ? "not-allowed" : "pointer", userSelect: "none",
                      border: `1px solid ${inDot ? COLORI.bordoOro : inRis ? COLORI.bordo : dotPiena ? COLORI.bordo : COLORI.bordo}`,
                      background: inDot ? `${COLORI.bordoOro}30` : inRis ? `${COLORI.bordo}60` : dotPiena ? `${COLORI.rosso}20` : "transparent",
                      color: inDot ? COLORI.oro : inRis ? COLORI.testoSec : dotPiena ? COLORI.rosso : COLORI.testoSec,
                      textDecoration: inRis ? "line-through" : "none",
                      opacity: dotPiena ? 0.5 : 1,
                      transition: "all 0.15s",
                    };
                  };

                  const costoLabel = (c) => c > 0 ? `${"◆".repeat(c)}` : "◇";

                  return (
                    <>
                      {/* Header */}
                      {(() => {
                        const maxDot = 5;
                        const maxRis = pgLv >= 5 ? 5 : null; // dal lv5 la riserva ha limite 5
                        const dotPiena = dotazione.length >= maxDot;
                        const risPiena = maxRis !== null && riserva.length >= maxRis;
                        const SlotBar = ({ count, max, label, coloreFull, coloreBar }) => (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.65rem", color: COLORI.testoSec, minWidth: "54px" }}>{label}</span>
                            <div style={{ display: "flex", gap: "3px" }}>
                              {Array.from({ length: max }, (_, i) => (
                                <div key={i} style={{
                                  width: "14px", height: "14px", borderRadius: "3px",
                                  background: i < count ? coloreBar : "transparent",
                                  border: `1.5px solid ${i < count ? coloreBar : COLORI.bordo}`,
                                  transition: "background 0.2s"
                                }} />
                              ))}
                            </div>
                            <span style={{ fontSize: "0.65rem", color: count >= max ? coloreFull : COLORI.testoSec, fontWeight: count >= max ? "bold" : "normal" }}>
                              {count}/{max}{count >= max ? " ⚠" : ""}
                            </span>
                          </div>
                        );
                        return (
                          <div style={{ marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                              <div>
                                {domini.map(d => <span key={d} style={stili.tagOro}>✦ {d}</span>)}
                                <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: COLORI.testoSec }}>· Lv {pgLv}</span>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {riserva.length > 0 && (
                                  <button style={{ ...stili.pulsante, fontSize: "0.7rem", padding: "3px 8px" }} onClick={resetRiserva}>
                                    ↺ Richiama
                                  </button>
                                )}
                              </div>
                            </div>
                            {/* Slot bar Dotazione */}
                            <SlotBar count={dotazione.length} max={maxDot}
                              label="Dotazione:" coloreBar={dotPiena ? "#aa2222" : COLORI.oro} coloreFull={COLORI.rosso} />
                            {/* Slot bar Riserva (solo dal lv5) */}
                            {maxRis !== null ? (
                              <div style={{ marginTop: "5px" }}>
                                <SlotBar count={riserva.length} max={maxRis}
                                  label="Riserva:" coloreBar={risPiena ? "#aa2222" : COLORI.testoSec} coloreFull={COLORI.rosso} />
                              </div>
                            ) : riserva.length > 0 ? (
                              <div style={{ marginTop: "4px", fontSize: "0.65rem", color: COLORI.testoSec }}>
                                Riserva: <strong style={{ color: "#777" }}>{riserva.length}</strong>
                                <span style={{ marginLeft: "6px", color: COLORI.testoSec }}>· dal Lv 5 il limite sarà 5 slot</span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}

                      <div style={{ fontSize: "0.68rem", color: COLORI.testoSec, marginBottom: "12px" }}>
                        Click chip → aggiungi/rimuovi da <span style={{ color: COLORI.oro }}>Dotazione</span> · Le carte in <span style={{ color: "#666" }}>Riserva</span> sono sbarrate · ◆ = costo richiamo
                      </div>

                      {/* Carte raggruppate per livello */}
                      {Object.keys(cartePerLivello).sort((a,b) => +a - +b).map(lv => (
                        <div key={lv} style={{ marginBottom: "14px" }}>
                          <div style={{
                            fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
                            color: COLORI.oro, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px"
                          }}>
                            <span style={{ background: COLORI.bordoOro, color: COLORI.sfondo, borderRadius: "3px", padding: "1px 6px", fontWeight: "bold" }}>
                              LV {lv}
                            </span>
                            {domini.filter(d => cartePerLivello[lv][d]).map(d => (
                              <span key={d} style={{ color: COLORI.testoSec }}>· {d}</span>
                            ))}
                          </div>
                          <div>
                            {domini.flatMap(dom => (cartePerLivello[lv][dom] || []).map(carta => (
                              <span
                                key={carta.n}
                                style={stileChip(carta.n)}
                                onClick={() => toggleCarta(carta.n)}
                                title={`${dom} · Lv${carta.l} · Richiamo: ${carta.c === 0 ? "gratuito" : carta.c + " gettoni"}`}
                              >
                                <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>{costoLabel(carta.c)}</span>
                                {carta.n}
                              </span>
                            )))}
                          </div>
                        </div>
                      ))}

                      {Object.keys(cartePerLivello).length === 0 && (
                        <div style={{ color: COLORI.testoSec, textAlign: "center", padding: "20px" }}>
                          Nessuna carta disponibile per il livello attuale.
                        </div>
                      )}

                      {/* Lookup rapido: mappa nome → dati carta per popup */}
                      {(() => {
                        const tutteLeCarteDati = {};
                        for (const dom of domini) {
                          for (const carta of (CARTE_DOMINI[dom] || [])) {
                            tutteLeCarteDati[carta.n] = { ...carta, dominio: dom };
                          }
                        }

                        const mostraEffetto = (nome) => {
                          const c = tutteLeCarteDati[nome];
                          if (!c) return;
                          setPopup({
                            nome: c.n,
                            descrizione: c.d || "(nessuna descrizione disponibile)",
                            categoria: `${c.dominio} · Lv${c.l} · Richiamo: ${c.c === 0 ? "gratuito" : `${c.c} gettoni`}`
                          });
                        };

                        const mandaInRiserva = (nome) => {
                          const newDot = dotazione.filter(c => c !== nome);
                          const newRis = [...riserva, nome];
                          setPersonaggi(prev => {
                            const nuova = prev.map(p => p.id === pgSel ? { ...p, carteDotazione: newDot, carteRiserva: newRis } : p);
                            salvaSuStorage(nuova);
                            return nuova;
                          });
                        };

                        const rimuoviDaRiserva = (nome) => {
                          const newRis = riserva.filter(c => c !== nome);
                          const newDot = [...dotazione, nome];
                          setPersonaggi(prev => {
                            const nuova = prev.map(p => p.id === pgSel ? { ...p, carteDotazione: newDot, carteRiserva: newRis } : p);
                            salvaSuStorage(nuova);
                            return nuova;
                          });
                        };

                        const eliminaCarta = (nome) => {
                          const newRis = riserva.filter(c => c !== nome);
                          setPersonaggi(prev => {
                            const nuova = prev.map(p => p.id === pgSel ? { ...p, carteRiserva: newRis } : p);
                            salvaSuStorage(nuova);
                            return nuova;
                          });
                        };

                        return (
                          <>
                            {/* Dotazione Attiva */}
                            {dotazione.length > 0 && (
                              <div style={{ marginTop: "16px", borderTop: `1px solid ${COLORI.bordo}`, paddingTop: "12px" }}>
                                <div style={stili.sectionHeader}>📋 Dotazione Attiva ({dotazione.length})</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {dotazione.map(nome => {
                                    const c = tutteLeCarteDati[nome];
                                    // Grimori del Codice: parsing delle singole spell dal Tomo
                                    const isTomo = c && c.dominio === "Codice" && nome.startsWith("Tomo");
                                    const parsaSpell = (desc) => {
                                      if (!desc) return [];
                                      // Ogni spell inizia con "NomeSpell:" — split su pattern "Parola Parola: " o "Parola: "
                                      const parti = desc.split(/(?=(?:[A-ZÀÈÌÒÙÁÉÍÓÚ][a-zàèìòùáéíóú]+(?:\s+[A-ZÀÈÌÒÙÁÉÍÓÚ][a-zàèìòùáéíóú]+)*\s*:))/);
                                      return parti.map(p => p.trim()).filter(Boolean).map(p => {
                                        const colonIdx = p.indexOf(":");
                                        if (colonIdx < 0) return { nome: "", desc: p };
                                        return { nome: p.substring(0, colonIdx).trim(), desc: p.substring(colonIdx + 1).trim() };
                                      }).filter(s => s.nome);
                                    };
                                    const spell = isTomo ? parsaSpell(c.d) : [];
                                    return (
                                      <div key={nome} style={{
                                        background: isTomo ? "#1a1a2e" : COLORI.cartaChiara,
                                        border: `1px solid ${isTomo ? "#5060aa" : COLORI.bordoOro + "60"}`,
                                        borderRadius: "6px", padding: "8px 12px",
                                      }}>
                                        {/* Intestazione carta */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: isTomo ? "8px" : "3px" }}>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                              <span
                                                style={{ color: isTomo ? "#aabbff" : COLORI.oroChiaro, fontWeight: "bold", fontSize: "0.9rem", cursor: "pointer" }}
                                                onClick={() => mostraEffetto(nome)}
                                              >
                                                {isTomo ? "📖 " : ""}{nome}
                                              </span>
                                              {c && (
                                                <span style={{ fontSize: "0.65rem", color: COLORI.testoSec }}>
                                                  Lv{c.l} · {c.c === 0 ? "◇" : "◆".repeat(c.c)} · {c.dominio}
                                                </span>
                                              )}
                                            </div>
                                            {!isTomo && c && c.d && (
                                              <div
                                                style={{ color: COLORI.testoSec, fontSize: "0.78rem", marginTop: "3px", lineHeight: "1.4", cursor: "pointer" }}
                                                onClick={() => mostraEffetto(nome)}
                                              >
                                                {c.d.length > 120 ? c.d.substring(0, 120) + "…" : c.d}
                                              </div>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => mandaInRiserva(nome)}
                                            style={{ background: "transparent", border: `1px solid ${COLORI.bordo}`, borderRadius: "4px", color: COLORI.testoSec, cursor: "pointer", fontSize: "0.7rem", padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
                                            title="Manda in riserva"
                                          >
                                            → Riserva
                                          </button>
                                        </div>
                                        {/* Grimorio: spell espanse */}
                                        {isTomo && spell.map((s, si) => (
                                          <div key={si} style={{
                                            background: "#12122a",
                                            border: `1px solid #6060aa`,
                                            borderRadius: "5px", padding: "7px 10px", marginBottom: "5px"
                                          }}>
                                            <div style={{ color: "#8899ff", fontWeight: "bold", fontSize: "0.82rem", marginBottom: "3px" }}>✦ {s.nome}</div>
                                            <div style={{ color: COLORI.testoSec, fontSize: "0.74rem", lineHeight: "1.5" }}>{s.desc}</div>
                                          </div>
                                        ))}
                                        {/* Contatore gettoni per carte che li richiedono */}
                                        {!isTomo && haGettoni(c?.d) && (() => {
                                          const tot = gettoni[nome] || 0;
                                          return (
                                            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"6px", padding:"5px 8px", background:"#1a1a10", borderRadius:"4px", border:`1px solid #4a4a20` }}>
                                              <span style={{ fontSize:"0.68rem", color:"#aaa880", letterSpacing:"0.08em" }}>🪙 Gettoni</span>
                                              <div style={{ display:"flex", gap:"3px", flexWrap:"wrap" }}>
                                                {Array.from({ length: Math.max(tot, 8) }, (_, i) => (
                                                  <div key={i}
                                                    style={{ width:"16px", height:"16px", borderRadius:"50%", cursor:"pointer",
                                                      background: i < tot ? COLORI.oro : "transparent",
                                                      border: `1.5px solid ${i < tot ? COLORI.oro : COLORI.bordo}`,
                                                      transition:"background 0.15s" }}
                                                    onClick={() => setGettoni(nome, i < tot ? i : i + 1)} />
                                                ))}
                                              </div>
                                              <span style={{ fontSize:"0.75rem", color: COLORI.oro, fontWeight:"bold", minWidth:"18px" }}>{tot}</span>
                                              <button style={{ ...stili.btnSmall, color: COLORI.oro, borderColor: COLORI.bordo }}
                                                onClick={() => setGettoni(nome, tot + 1)}>+</button>
                                              <button style={{ ...stili.btnSmall, color:"#888", borderColor:"#4a4a20" }}
                                                onClick={() => setGettoni(nome, tot - 1)}>−</button>
                                              <button style={{ ...stili.btnSmall, fontSize:"0.62rem", color:"#666", borderColor:"#3a3a10" }}
                                                onClick={() => setGettoni(nome, 0)} title="Azzera">✕</button>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Riserva */}
                            {riserva.length > 0 && (
                              <div style={{ marginTop: "14px", borderTop: `1px solid ${COLORI.bordo}`, paddingTop: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                  <div style={{ ...stili.sectionHeader, margin: 0 }}>🗄 Riserva ({riserva.length})</div>
                                  <button style={{ ...stili.pulsante, fontSize: "0.7rem", padding: "3px 10px" }} onClick={resetRiserva}>
                                    ↺ Richiama tutto
                                  </button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  {riserva.map(nome => {
                                    const c = tutteLeCarteDati[nome];
                                    return (
                                      <div key={nome} style={{
                                        background: "#22201a",
                                        border: `1px solid #3a3020`,
                                        borderRadius: "5px", padding: "6px 10px",
                                        display: "flex", alignItems: "center", gap: "8px", opacity: 0.75
                                      }}>
                                        <span
                                          style={{ flex: 1, color: "#777", fontSize: "0.85rem", textDecoration: "line-through", cursor: "pointer" }}
                                          onClick={() => mostraEffetto(nome)}
                                        >
                                          {nome}
                                          {c && <span style={{ fontSize: "0.65rem", marginLeft: "6px" }}>Lv{c.l}</span>}
                                        </span>
                                        <button
                                          onClick={() => rimuoviDaRiserva(nome)}
                                          style={{ background: "transparent", border: `1px solid #555`, borderRadius: "3px", color: "#888", cursor: "pointer", fontSize: "0.65rem", padding: "2px 6px" }}
                                          title="Riporta in dotazione"
                                        >
                                          ↑ Dotazione
                                        </button>
                                        <button
                                          onClick={() => eliminaCarta(nome)}
                                          style={{ background: "transparent", border: "none", color: COLORI.testoSec, cursor: "pointer", fontSize: "0.75rem", padding: "2px 4px" }}
                                          title="Rimuovi carta"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  );
                })() : (
                  <div style={{ color: COLORI.testoSec, textAlign: "center", padding: "40px" }}>Seleziona una classe per vedere i domini disponibili.</div>
                )}
              </div>
            )}

            {/* TAB BESTIE - solo Druido */}
            {pg.tabAttiva === "bestie" && (
              <div>
                {(() => {
                  const lv = pg.livello || 1;
                  const rangoCorrente = RANGO_DA_LIVELLO(lv);
                  const rangoLabel = ["","Rango 1 (Lv 1)","Rango 2 (Lv 2–4)","Rango 3 (Lv 5–7)","Rango 4 (Lv 8–10)"][rangoCorrente];
                  const formeDisp = FORME_BESTIALI.filter(f => f.r <= rangoCorrente);
                  const perRango = [1,2,3,4].map(r => ({ r, forme: formeDisp.filter(f => f.r === r) })).filter(g => g.forme.length > 0);
                  // ranghi aperti: di default solo il rango corrente
                  const ranghiAperti = pg.bestieRanghiAperti ?? [rangoCorrente];
                  const toggleRango = (r) => {
                    const nuovi = ranghiAperti.includes(r)
                      ? ranghiAperti.filter(x => x !== r)
                      : [...ranghiAperti, r];
                    aggiorna("bestieRanghiAperti", nuovi);
                  };
                  return (
                    <>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
                        <div style={{ fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color:COLORI.oro }}>Forme Bestiali Disponibili</div>
                        <span style={{ ...stili.tagOro, fontSize:"0.7rem" }}>🐾 {rangoLabel}</span>
                      </div>
                      {perRango.map(({ r, forme }) => {
                        const aperto = ranghiAperti.includes(r);
                        const èCorrente = r === rangoCorrente;
                        return (
                          <div key={r} style={{ marginBottom:"10px" }}>
                            {/* Header rango cliccabile */}
                            <div
                              onClick={() => toggleRango(r)}
                              style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                cursor:"pointer", userSelect:"none",
                                background: èCorrente ? `${COLORI.bordoOro}22` : COLORI.carta,
                                border:`1px solid ${èCorrente ? COLORI.bordoOro : COLORI.bordo}`,
                                borderRadius: aperto ? "6px 6px 0 0" : "6px",
                                padding:"8px 12px" }}>
                              <span style={{ fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase",
                                color: èCorrente ? COLORI.oroChiaro : COLORI.testoSec, fontWeight: èCorrente ? "bold" : "normal" }}>
                                Rango {r}{èCorrente ? " ★" : ""} · {forme.length} forme
                              </span>
                              <span style={{ fontSize:"0.8rem", color:COLORI.testoSec }}>{aperto ? "▲" : "▼"}</span>
                            </div>
                            {/* Forme del rango */}
                            {aperto && (
                              <div style={{ border: `1px solid ${COLORI.bordo}`, borderTop:"none", borderRadius:"0 0 6px 6px", padding:"8px" }}>
                                {forme.map(f => {
                                  const atkLabel = f.atk.d && f.atk.d !== "—"
                                    ? (f.atk.b > 0 ? `${f.atk.d}+${f.atk.b}` : f.atk.d)
                                    : null;
                                  return (
                                    <div key={f.nome} style={{ background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"8px" }}>
                                      {/* Nome + esempi */}
                                      <div style={{ fontWeight:"bold", color:COLORI.testoBase, fontSize:"0.9rem" }}>{f.nome}</div>
                                      <div style={{ fontSize:"0.68rem", color:COLORI.testoSec, fontStyle:"italic", marginBottom:"6px" }}>{f.esempi}</div>
                                      {/* Stats: tratto, evasione, attacco — sotto nome */}
                                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
                                        <span style={{ ...stili.tagOro, fontSize:"0.68rem" }}>{f.tratto}</span>
                                        <span style={{ background: COLORI.cartaChiara, border: `1px solid ${COLORI.bordo}`, borderRadius:"4px", padding:"2px 8px", fontSize:"0.65rem", color: COLORI.ink }}>Ev. +{f.ev}</span>
                                        {atkLabel && (
                                          <span style={{ background: `${COLORI.oro}18`, border: `1px solid ${COLORI.oro}50`, borderRadius:"4px", padding:"2px 8px", fontSize:"0.68rem", color:COLORI.oroChiaro, fontWeight:"bold" }}>
                                            ⚔ {atkLabel} · {f.atk.p} · {f.atk.t}
                                          </span>
                                        )}
                                      </div>
                                      {/* Vantaggi */}
                                      {f.vantaggi.length > 0 && (
                                        <div style={{ marginBottom:"6px" }}>
                                          <span style={{ fontSize:"0.62rem", color:COLORI.testoSec, textTransform:"uppercase", letterSpacing:"0.1em" }}>Vantaggio: </span>
                                          <span style={{ fontSize:"0.72rem", color: "#90cc90" }}>{f.vantaggi.join(", ")}</span>
                                        </div>
                                      )}
                                      {/* Abilità */}
                                      {f.abilita.map(a => (
                                        <div key={a.n} style={{ marginBottom:"4px" }}>
                                          <span style={{ fontSize:"0.72rem", color: COLORI.ink, fontWeight:"bold" }}>{a.n}: </span>
                                          <span style={{ fontSize:"0.72rem", color:COLORI.testoSec }}>{a.d}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}

            {/* TAB COMPAGNO - solo Ranger */}
            {pg.tabAttiva === "compagno" && (
              <div>
                {(() => {
                  const cmp = pg.compagno || {};
                  const aggCmp = (campo, val) => aggiorna("compagno", { ...cmp, [campo]: val });
                  const stressMax = cmp.stress?.max ?? 3;
                  const stressAtt = cmp.stress?.attuali ?? 0;
                  const POTENZIAMENTI_LIST = [
                    { id:"intelligente", n:"Intelligente", d:"+1 permanente a un'Esperienza a scelta del compagno" },
                    { id:"luce",         n:"Luce nell'Oscurità", d:"Conta come una Speranza aggiuntiva per il tuo personaggio" },
                    { id:"conforto",     n:"Conforto", d:"Una volta per riposo: prenderti cura del compagno → guadagni 1 Speranza o entrambi eliminate 1 Stress" },
                    { id:"corazzato",    n:"Corazzato", d:"Quando il compagno subisce danni, puoi usare una tua Casella Armatura invece del suo Stress" },
                    { id:"feroce",       n:"Feroce", d:"Aumenta di una categoria il dado danno (d6→d8…) o la portata (Mischia→Prossima…) del compagno" },
                    { id:"resistente",   n:"Resistente", d:"Il compagno guadagna uno Stress aggiuntivo" },
                    { id:"legame",       n:"Legame", d:"Quando sei all'ultimo PF, il compagno accorre e tira d6 per ogni suo Stress non marcato. Con almeno un 6 puoi recuperare l'ultimo PF" },
                    { id:"consapevole",  n:"Consapevole", d:"+2 all'Evasione permanente del compagno" },
                  ];
                  const potScelti = cmp.potenziamenti || [];
                  return (
                    <>
                      <div style={{ fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color:COLORI.oro, marginBottom:"12px" }}>🐾 Scheda del Compagno</div>

                      {/* Nome e tipo */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"12px" }}>
                        <div>
                          <label style={stili.label}>Nome</label>
                          <input style={stili.input} placeholder="Nome del compagno" value={cmp.nome||""} onChange={e => aggCmp("nome", e.target.value)} />
                        </div>
                        <div>
                          <label style={stili.label}>Tipo di animale</label>
                          <input style={stili.input} placeholder="Es. lupo, falco…" value={cmp.tipo||""} onChange={e => aggCmp("tipo", e.target.value)} />
                        </div>
                      </div>

                      {/* Evasione + Stress */}
                      <div style={{ background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"12px" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"16px", alignItems:"center" }}>
                          {/* Evasione */}
                          <div style={{ textAlign:"center" }}>
                            <input style={{ ...stili.input, width:"64px", textAlign:"center", fontSize:"1.4rem", fontWeight:"bold", color:COLORI.oroChiaro }} type="text"
                    inputMode="numeric"
                              value={cmp.evasione ?? 10} onChange={e => aggCmp("evasione", parseInt(e.target.value)||10)} />
                            <div style={{ fontSize:"0.6rem", color:COLORI.testoSec, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:"2px" }}>Evasione</div>
                          </div>
                          {/* Stress */}
                          <div>
                            <div style={{ fontSize:"0.62rem", color:COLORI.testoSec, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>Stress</div>
                            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center" }}>
                              {Array.from({ length: stressMax }, (_, i) => (
                                <span key={i}
                                  style={{ width:"22px", height:"22px", borderRadius:"50%", border:`2px solid ${i < stressAtt ? "#cc4444" : COLORI.bordo}`,
                                    background: i < stressAtt ? "#cc444440" : "transparent", cursor:"pointer", display:"inline-block" }}
                                  onClick={() => aggCmp("stress", { ...cmp.stress, attuali: i < stressAtt ? stressAtt-1 : stressAtt+1 })} />
                              ))}
                              <span style={{ fontSize:"0.65rem", color:COLORI.testoSec }}>
                                {stressAtt}/{stressMax}
                              </span>
                              <button style={{ ...stili.btnSmall, marginLeft:"4px" }}
                                onClick={() => aggCmp("stress", { ...cmp.stress, max: Math.max(1, stressMax-1) })}>−</button>
                              <button style={stili.btnSmall}
                                onClick={() => aggCmp("stress", { ...cmp.stress, max: stressMax+1 })}>+</button>
                            </div>
                            <div style={{ fontSize:"0.6rem", color:"#cc8866", marginTop:"4px" }}>
                              All'ultimo Stress → esce di scena fino al prossimo riposo
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Esperienze */}
                      <div style={{ marginBottom:"12px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                          <div style={{ fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:COLORI.oro }}>Esperienze</div>
                          <button style={stili.btnSmall} onClick={() => {
                            const esp = [...(cmp.esperienze||[]), { desc:"", bonus:2 }];
                            aggCmp("esperienze", esp);
                          }}>+ Aggiungi</button>
                        </div>
                        {(cmp.esperienze||[]).map((e, i) => (
                          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"6px", marginBottom:"6px", alignItems:"center" }}>
                            <input style={stili.input} placeholder={`Esperienza ${i+1} (es. Agile, Scout…)`} value={e.desc}
                              onChange={ev => {
                                const arr = [...(cmp.esperienze||[])]; arr[i]={...e, desc:ev.target.value}; aggCmp("esperienze", arr);
                              }} />
                            <input style={{ ...stili.input, width:"56px", textAlign:"center" }} type="text"
                    inputMode="numeric" value={e.bonus}
                              onChange={ev => {
                                const arr = [...(cmp.esperienze||[])]; arr[i]={...e, bonus:parseInt(ev.target.value)||0}; aggCmp("esperienze", arr);
                              }} />
                            <button style={{ ...stili.btnSmall, color:"#cc4444" }}
                              onClick={() => { const arr=[...(cmp.esperienze||[])]; arr.splice(i,1); aggCmp("esperienze", arr); }}>✕</button>
                          </div>
                        ))}
                      </div>

                      {/* Attacco */}
                      <div style={{ background:COLORI.cartaChiara, border:`1px solid ${COLORI.bordo}`, borderRadius:"6px", padding:"10px", marginBottom:"12px" }}>
                        <div style={{ fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:COLORI.oro, marginBottom:"8px" }}>⚔ Attacco e Danni</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:"8px", alignItems:"end" }}>
                          <div>
                            <label style={stili.label}>Portata</label>
                            <select style={stili.select} value={cmp.attacco?.portata||"Mischia"}
                              onChange={e => aggCmp("attacco", { ...cmp.attacco, portata: e.target.value })}>
                              {["Mischia","Prossima","Ravvicinata","Lontana"].map(p => <option key={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={stili.label}>Dado</label>
                            <select style={stili.select} value={cmp.attacco?.dado||"d6"}
                              onChange={e => aggCmp("attacco", { ...cmp.attacco, dado: e.target.value })}>
                              {["d4","d6","d8","d10","d12"].map(d => <option key={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={stili.label}>Descrizione attacco</label>
                            <input style={stili.input} placeholder="Es. morso, artigli…" value={cmp.attacco?.desc||""}
                              onChange={e => aggCmp("attacco", { ...cmp.attacco, desc: e.target.value })} />
                          </div>
                        </div>
                        <div style={{ fontSize:"0.68rem", color:COLORI.testoSec, marginTop:"6px" }}>
                          Usa la tua Competenza + dado del compagno. Il compagno eredita i tuoi bonus (es. Focus del Ranger).
                        </div>
                      </div>

                      {/* Potenziamenti */}
                      <div style={{ marginBottom:"12px" }}>
                        <div style={{ fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:COLORI.oro, marginBottom:"6px" }}>
                          Potenziamenti di Livello
                        </div>
                        {POTENZIAMENTI_LIST.map(p => {
                          const scelto = potScelti.includes(p.id);
                          return (
                            <div key={p.id}
                              style={{ display:"flex", gap:"8px", alignItems:"flex-start", marginBottom:"6px", padding:"8px",
                                background: scelto ? "#1a3a1a50" : COLORI.cartaChiara,
                                border:`1px solid ${scelto ? "#3a7a3a" : COLORI.bordo}`, borderRadius:"6px", cursor:"pointer" }}
                              onClick={() => {
                                const arr = scelto ? potScelti.filter(x => x !== p.id) : [...potScelti, p.id];
                                aggCmp("potenziamenti", arr);
                              }}>
                              <span style={{ fontSize:"1rem", lineHeight:"1.2", flexShrink:0 }}>{scelto ? "✅" : "☐"}</span>
                              <div>
                                <div style={{ fontSize:"0.75rem", fontWeight:"bold", color: scelto ? "#90dd90" : COLORI.testoBase }}>{p.n}</div>
                                <div style={{ fontSize:"0.68rem", color:COLORI.testoSec }}>{p.d}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Note */}
                      <div>
                        <label style={stili.label}>Note sul compagno</label>
                        <textarea style={{ ...stili.input, minHeight:"80px", resize:"vertical" }}
                          placeholder="Carattere, storia, abilità speciali…"
                          value={cmp.note||""} onChange={e => aggCmp("note", e.target.value)} />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* MODAL AVANZAMENTO */}
            {pg.tabAttiva === "note" && (
              <div>
                <div style={stili.sectionHeader}>Inventario</div>
                <textarea style={{ ...stili.input, minHeight: "100px", resize: "vertical" }}
                  placeholder="Oggetti, equipaggiamento..."
                  value={pg.inventario || ""}
                  onChange={e => aggiorna("inventario", e.target.value)} />
                <div style={stili.sectionHeader}>Note Personali</div>
                <textarea style={{ ...stili.input, minHeight: "150px", resize: "vertical" }}
                  placeholder="Note, background, legami, obiettivi..."
                  value={pg.note || ""}
                  onChange={e => aggiorna("note", e.target.value)} />
                <div style={{ marginTop: "16px" }}>
                  <div style={stili.sectionHeader}>Oggetto di Classe</div>
                  {classeDati && <div style={{ color: COLORI.testoSec, fontSize: "0.85rem", fontStyle: "italic" }}>{classeDati.oggettiClasse}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Annuncio DM → toast */}
      {announce && (
        <div style={{
          position:"fixed", bottom:"20px", left:"50%", transform:"translateX(-50%)",
          background:COLORI.bordoOro, color:COLORI.carta,
          padding:"12px 24px", borderRadius:"8px",
          boxShadow:"0 4px 20px #0008",
          fontSize:"0.95rem", zIndex:2000,
          fontFamily:"'Crimson Pro',Georgia,serif",
          maxWidth:"90vw", textAlign:"center",
          animation:"fadeIn 0.3s ease",
        }}>
          📢 {announce}
        </div>
      )}
    </div>
  );
}
