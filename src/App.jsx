import { useEffect, useMemo, useState } from "react";

/**
 * Calcio Trainer — VERSIONE 1 (senza video)
 * - Form iniziale dati personali
 * - Scelta durata allenamento e giorni/settimana
 * - Percorso giornaliero diverso, sempre con 2–3 riscaldamenti all’inizio
 * - 30 esercizi totali (DrillCard, descrizioni più grandi)
 * - Timer con Pausa/Continua/Prossimo
 * - Persistenza in localStorage
 *
 * Tema: blu
 */

const STORAGE_KEYS = {
  profile: "ct_profile",
  settings: "ct_settings",
  lastPlan: "ct_last_plan",
};

// -------------------- DATI ESERCIZI (30 TOTALI) --------------------
/**
 * Ogni esercizio:
 * {
 *   id: "slug-unico",
 *   titolo: "...",
 *   descrizione: "...",
 *   durataMin: number,   // durata consigliata per unità
 *   focus: ["tecnica", "agilità", ...],
 *   categoria: "warmup" | "tecnica" | "agilità" | "condizionamento" | "passaggi" | "finalizzazione" | "controllo" | "mobilità"
 *   difficolta: 1..5
 * }
 */

const DRILLS = [
  // ---- Warmup (8) ----
  {
    id: "warmup-mobilita-anca",
    titolo: "Mobilità anche e caviglie",
    descrizione:
      "Circuito di mobilità articolare: anche, caviglie, ginocchia e bacino. Movimenti controllati, senza palla.",
    durataMin: 2,
    focus: ["mobilità", "prevenzione"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-andature",
    titolo: "Andature tecniche senza palla",
    descrizione:
      "Skip, calciata, corsa laterale, incrociati. Aumenta leggermente l’intensità verso la fine.",
    durataMin: 2,
    focus: ["attivazione", "coordinazione"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-tocchi-leggeri",
    titolo: "Tocchi leggeri a piedi alterni",
    descrizione:
      "Tocchi rapidi con la suola alternando i piedi, postura bassa e palla sempre sotto controllo.",
    durataMin: 2,
    focus: ["attivazione", "controllo"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-conduzione-facile",
    titolo: "Conduzione facile avanti/indietro",
    descrizione:
      "Conduzione morbida 8–10 metri e ritorno. Intensità crescente, tocchi piccoli e testa alta.",
    durataMin: 2,
    focus: ["attivazione", "tecnica"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-aperture-anche",
    titolo: "Aperture anche + circonduzioni",
    descrizione:
      "Aperture e chiusure dell’anca camminando; poi circonduzioni braccia. Respirazione regolare.",
    durataMin: 1,
    focus: ["mobilità"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-rimbalzi",
    titolo: "Rimbalzi palla e reattività",
    descrizione:
      "Fai rimbalzare la palla e blocca con pianta/collo piede, reattività su primo controllo.",
    durataMin: 2,
    focus: ["reattività", "controllo"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-slalom-largo",
    titolo: "Slalom largo (immaginario)",
    descrizione:
      "Serpentina larga con cambi di direzione dolci. Non forzare, obiettivo riscaldamento.",
    durataMin: 2,
    focus: ["attivazione", "agilità"],
    categoria: "warmup",
    difficolta: 1,
  },
  {
    id: "warmup-passi-laterali-palla",
    titolo: "Passi laterali con palla",
    descrizione:
      "Palla davanti al corpo, piccoli passi laterali e tocchi dolci per risvegliare caviglie e core.",
    durataMin: 1,
    focus: ["attivazione", "stabilità"],
    categoria: "warmup",
    difficolta: 1,
  },

  // ---- Tecnica/Controllo (10) ----
  {
    id: "tecnica-guida-veloce",
    titolo: "Guida palla veloce",
    descrizione:
      "Guida avanti/indietro alla massima velocità controllata. Tocchi corti, orientamento del corpo.",
    durataMin: 2,
    focus: ["tecnica", "resistenza"],
    categoria: "tecnica",
    difficolta: 2,
  },
  {
    id: "tecnica-stop-cambio-90",
    titolo: "Stop + cambio direzione (90°)",
    descrizione:
      "Stop secco e ripartenza a 90°. Alterna interno/esterno piede e lato destro/sinistro.",
    durataMin: 2,
    focus: ["tecnica", "agilità"],
    categoria: "tecnica",
    difficolta: 2,
  },
  {
    id: "tecnica-stop-cambio-180",
    titolo: "Stop + inversione (180°)",
    descrizione:
      "Fermata completa e inversione a 180° (Cruyff o suola). Appoggia bene il piede d’appoggio.",
    durataMin: 2,
    focus: ["controllo", "tecnica"],
    categoria: "tecnica",
    difficolta: 3,
  },
  {
    id: "tecnica-palleggio-misto",
    titolo: "Palleggio tecnico misto",
    descrizione:
      "Piedi, cosce, testa. Serie continue cercando fluidità e ritmo, senza far cadere la palla.",
    durataMin: 2,
    focus: ["coordinazione", "tocchi"],
    categoria: "controllo",
    difficolta: 3,
  },
  {
    id: "tecnica-interno-esterno",
    titolo: "Interno/Esterno in corsa",
    descrizione:
      "Sequenze di tocchi interno–esterno con entrambi i piedi, aumenta la velocità progressivamente.",
    durataMin: 2,
    focus: ["dribbling", "controllo"],
    categoria: "tecnica",
    difficolta: 3,
  },
  {
    id: "tecnica-rulli-suola",
    titolo: "Rulli di suola",
    descrizione:
      "Rotola la palla sotto la suola da destra a sinistra e viceversa, poi avanti/indietro.",
    durataMin: 2,
    focus: ["controllo", "stabilità"],
    categoria: "controllo",
    difficolta: 2,
  },
  {
    id: "tecnica-fintee-corpo",
    titolo: "Finte di corpo",
    descrizione:
      "Finta spalla/anca e ripartenza sul lato opposto. Accelera dopo la finta per creare separazione.",
    durataMin: 2,
    focus: ["dribbling", "agilità"],
    categoria: "tecnica",
    difficolta: 3,
  },
  {
    id: "tecnica-colpi-collo-interno",
    titolo: "Colpi collo & interno",
    descrizione:
      "Tocchi alternati collo piede e interno, palla sempre in movimento e vicino al corpo.",
    durataMin: 2,
    focus: ["controllo", "tecnica"],
    categoria: "controllo",
    difficolta: 2,
  },
  {
    id: "tecnica-ruleta",
    titolo: "Ruleta/Zidane spin",
    descrizione:
      "Giro a 360° con suole alternate. Mantieni baricentro basso e proteggi la palla col corpo.",
    durataMin: 2,
    focus: ["protezione", "tecnica"],
    categoria: "tecnica",
    difficolta: 3,
  },
  {
    id: "tecnica-heel-toe",
    titolo: "Heel-to-toe & toe-taps",
    descrizione:
      "Sequenze tallone–punta con variazioni, poi toe taps veloci mantenendo controllo.",
    durataMin: 2,
    focus: ["ritmo", "coordinazione"],
    categoria: "tecnica",
    difficolta: 2,
  },

  // ---- Agilità/Slalom (6) ----
  {
    id: "agilita-slalom-stretto",
    titolo: "Slalom stretto (immaginario)",
    descrizione:
      "Serpentina stretta a tocchi piccoli, testa alta. Cambi di direzione rapidi.",
    durataMin: 2,
    focus: ["agilità", "dribbling"],
    categoria: "agilità",
    difficolta: 2,
  },
  {
    id: "agilita-slalom-a-otto",
    titolo: "Slalom a 8",
    descrizione:
      "Disegna un 8 immaginario e conduci palla seguendone le curve, alternando piede guida.",
    durataMin: 2,
    focus: ["coordinazione", "controllo"],
    categoria: "agilità",
    difficolta: 2,
  },
  {
    id: "agilita-cambi-lampo",
    titolo: "Cambi direzione lampo",
    descrizione:
      "Sequenze brevi di cambi (interno, esterno, suola). Esplosività sulla ripartenza.",
    durataMin: 2,
    focus: ["reattività", "agilità"],
    categoria: "agilità",
    difficolta: 3,
  },
  {
    id: "agilita-station-hop",
    titolo: "Station hop + tocco",
    descrizione:
      "Salti brevi su piedi pari/alternati (linea immaginaria), poi tocco palla. Ritmo crescente.",
    durataMin: 2,
    focus: ["reattività", "stabilità"],
    categoria: "agilità",
    difficolta: 2,
  },
  {
    id: "agilita-pivot",
    titolo: "Pivot e uscita",
    descrizione:
      "Giri veloci sul perno con il piede guida e uscita con accelerazione breve.",
    durataMin: 2,
    focus: ["agilità", "orientamento"],
    categoria: "agilità",
    difficolta: 3,
  },
  {
    id: "agilita-ladder-immaginaria",
    titolo: "Ladder immaginaria + palla",
    descrizione:
      "Piedi veloci su ‘scaletta’ immaginaria, poi conduzione rapida 5 m e ritorno.",
    durataMin: 2,
    focus: ["piedi veloci", "ritmo"],
    categoria: "agilità",
    difficolta: 2,
  },

  // ---- Condizionamento/Resistenza (4) ----
  {
    id: "condiz-interval-dribble",
    titolo: "Interval dribble",
    descrizione:
      "30\" forte / 15\" facile di guida palla. Respira e mantieni qualità del primo tocco.",
    durataMin: 2,
    focus: ["resistenza", "ritmo"],
    categoria: "condizionamento",
    difficolta: 3,
  },
  {
    id: "condiz-scatti-con-palla",
    titolo: "Scatti brevi con palla",
    descrizione:
      "5–6 scatti da 10–15 m con rientro al passo. Controllo sul primo tocco e spinta.",
    durataMin: 2,
    focus: ["velocità", "resistenza"],
    categoria: "condizionamento",
    difficolta: 3,
  },
  {
    id: "condiz-box-to-box",
    titolo: "Box-to-box corto",
    descrizione:
      "Corsa avanti/indietro 8–10 m con palla, gira sempre col controllo orientato.",
    durataMin: 2,
    focus: ["resistenza", "controllo"],
    categoria: "condizionamento",
    difficolta: 3,
  },
  {
    id: "condiz-ritmo-variabile",
    titolo: "Ritmo variabile",
    descrizione:
      "1′ ritmo medio, 30″ sprint con palla, 30″ easy. Ripeti senza perdere qualità.",
    durataMin: 2,
    focus: ["resistenza", "gestione ritmo"],
    categoria: "condizionamento",
    difficolta: 3,
  },

  // ---- Passaggi/Finalizzazione/Controllo avanzato (2+4) ----
  {
    id: "passaggi-contromuro-interno",
    titolo: "Passaggi contro muro (interno)",
    descrizione:
      "Colpisci di interno piede contro una parete sicura, controllo orientato di rientro.",
    durataMin: 2,
    focus: ["passaggi", "primo controllo"],
    categoria: "passaggi",
    difficolta: 2,
  },
  {
    id: "passaggi-contromuro-collo",
    titolo: "Passaggi contro muro (collo)",
    descrizione:
      "Collo piede a media intensità, mira costante. Il rientro dev’essere controllato.",
    durataMin: 2,
    focus: ["passaggi", "precisione"],
    categoria: "passaggi",
    difficolta: 3,
  },
  {
    id: "finaliz-mezzo-volo",
    titolo: "Mezzo volo su rimbalzo",
    descrizione:
      "Alza leggermente la palla e colpisci di collo: tecnica e controllo dopo l’impatto.",
    durataMin: 2,
    focus: ["finalizzazione", "coordinazione"],
    categoria: "finalizzazione",
    difficolta: 3,
  },
  {
    id: "finaliz-stop-tiro",
    titolo: "Stop orientato + tiro (simulato)",
    descrizione:
      "Stop orientato e finta di tiro (o passaggio forte su muro). Chiudi il gesto con equilibrio.",
    durataMin: 2,
    focus: ["finalizzazione", "controllo"],
    categoria: "finalizzazione",
    difficolta: 3,
  },
  {
    id: "controllo-aereo",
    titolo: "Controllo aereo e guida",
    descrizione:
      "Alza la palla, controlla con coscia/petto e guida immediata a terra.",
    durataMin: 2,
    focus: ["primo controllo", "tecnica"],
    categoria: "controllo",
    difficolta: 3,
  },
  {
    id: "controllo-orientato-corto",
    titolo: "Controllo orientato corto",
    descrizione:
      "Ricevi e orienta in 1–2 tocchi, girando sul piede d’appoggio. Varia angoli.",
    durataMin: 2,
    focus: ["primo controllo", "orientamento"],
    categoria: "controllo",
    difficolta: 2,
  },
];

// -------------------- UTILS: RANDOM CON SEED GIORNALIERO --------------------

const todayKey = () => {
  const d = new Date();
  // Usa solo la data locale per cambiare ogni giorno
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

// Mulberry32 PRNG
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToInt(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function shuffleWithSeed(arr, seed) {
  const a = [...arr];
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomWithSeed(arr, n, seed) {
  return shuffleWithSeed(arr, seed).slice(0, n);
}

// -------------------- GENERAZIONE PERCORSO GIORNALIERO --------------------

/**
 * Genera un percorso che:
 * - inizia con 2–3 warmup (random) in base al seed giornaliero
 * - riempie il resto con esercizi casuali diversificati
 * - mira a raggiungere "durataTargetMin" (può sforare max +1 min)
 */
function generaPercorsoGiornaliero({ durataTargetMin, profiloNome = "" }) {
  const baseSeed = hashStringToInt(`${todayKey()}_${profiloNome}`);
  const rnd = mulberry32(baseSeed);

  const tutti = [...DRILLS];
  const warmups = tutti.filter((d) => d.categoria === "warmup");
  const nonWarmups = tutti.filter((d) => d.categoria !== "warmup");

  // 2 o 3 warmup all’inizio
  const warmupCount = 2 + Math.floor(rnd() * 2); // 2 o 3
  const warmSel = pickRandomWithSeed(warmups, warmupCount, baseSeed ^ 0xabc123);

  const percorso = [...warmSel];
  let minuti = warmSel.reduce((acc, d) => acc + d.durataMin, 0);

  // Riempimento con diversità categorie
  const shuffled = shuffleWithSeed(nonWarmups, baseSeed ^ 0x777);
  const usedIds = new Set(percorso.map((d) => d.id));
  let idx = 0;

  while (minuti < durataTargetMin && idx < shuffled.length) {
    const cand = shuffled[idx++];
    if (usedIds.has(cand.id)) continue;
    // evita troppi consecutivi stessa categoria (se possibile)
    const last = percorso[percorso.length - 1];
    if (last && last.categoria === cand.categoria && rnd() < 0.35) continue;

    percorso.push(cand);
    usedIds.add(cand.id);
    minuti += cand.durataMin;

    // stop se sfora di 1 minuto
    if (minuti >= durataTargetMin + 1) break;
  }

  return { lista: percorso, minutiTotali: minuti, warmupCount };
}

// -------------------- COMPONENTI UI --------------------

const Label = ({ children }) => (
  <label className="text-sm font-medium text-blue-800">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-blue-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
);

const Select = (props) => (
  <select
    {...props}
    className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
);

const Section = ({ title, children, right }) => (
  <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 md:p-6 mb-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-xl md:text-2xl font-bold text-blue-700">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

// Card esercizio
const DrillCard = ({ item, index, compact = false }) => (
  <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-4 md:p-5">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg md:text-xl font-semibold text-blue-700">
        {index != null && <span className="mr-2 text-blue-500">{index + 1}.</span>}
        {item.titolo}
      </h3>
      <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
        {item.durataMin}′
      </span>
    </div>

    <p className="mt-2 text-gray-800 text-[1.05rem] leading-relaxed">{item.descrizione}</p>

    {!compact && (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          {item.categoria}
        </span>
        {item.focus.map((f) => (
          <span
            key={f}
            className="text-xs md:text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
          >
            {f}
          </span>
        ))}
        <span className="ml-auto text-xs text-gray-500">Diff.: {item.difficolta}/5</span>
      </div>
    )}
  </div>
);

// -------------------- APP --------------------

export default function App() {
  // Profilo
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    return raw ? JSON.parse(raw) : null;
  });

  // Impostazioni percorso
  const [settings, setSettings] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return (
      (raw && JSON.parse(raw)) || {
        durataMinuti: 20,
        giorniSettimana: 3,
      }
    );
  });

  // Stato allenamento
  const [plan, setPlan] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.lastPlan);
    return raw ? JSON.parse(raw) : null;
  });

  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  // ---------- HANDLERS PROFILO ----------
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(data));
    setProfile(data);
  };

  const resetProfile = () => {
    localStorage.removeItem(STORAGE_KEYS.profile);
    setProfile(null);
  };

  // ---------- GENERA PERCORSO GIORNALIERO ----------
  const generaOggi = () => {
    const durata = Number(settings.durataMinuti) || 20;
    const nome = profile?.nomeCompleto || "";
    const res = generaPercorsoGiornaliero({ durataTargetMin: durata, profiloNome: nome });
    const payload = {
      key: todayKey(),
      durataMinuti: durata,
      giorniSettimana: Number(settings.giorniSettimana) || 3,
      items: res.lista,
      minutiTotali: res.minutiTotali,
      warmupCount: res.warmupCount,
    };
    localStorage.setItem(STORAGE_KEYS.lastPlan, JSON.stringify(payload));
    setPlan(payload);
  };

  // auto-rigenera se il piano è vecchio
  useEffect(() => {
    if (!profile) return;
    if (!plan || plan.key !== todayKey() || plan.durataMinuti !== settings.durataMinuti) {
      generaOggi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, settings.durataMinuti]);

  // ---------- TIMER ----------
  const sec = (m) => Math.max(1, Math.round(m * 60));
  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const startWorkout = () => {
    if (!plan?.items?.length) return;
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setSecondsLeft(sec(plan.items[0].durataMin));
    setRunning(true);
  };

  const togglePause = () => setRunning((r) => !r);

  const nextDrill = () => {
    if (!plan) return;
    const next = current + 1;
    if (next < plan.items.length) {
      setCurrent(next);
      setSecondsLeft(sec(plan.items[next].durataMin));
      setRunning(true);
    } else {
      setRunning(false);
      setFinished(true);
    }
  };

  const stopWorkout = () => {
    setStarted(false);
    setRunning(false);
    setFinished(false);
    setCurrent(0);
    setSecondsLeft(0);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimeout(nextDrill, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, current]);

  const drill = useMemo(() => plan?.items?.[current], [plan, current]);
  const progress = useMemo(() => {
    const total = drill ? sec(drill.durataMin) : 0;
    return total ? Math.max(0, Math.min(100, ((total - secondsLeft) / total) * 100)) : 0;
  }, [drill, secondsLeft]);

  // -------------------- UI --------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/75 backdrop-blur border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-700">
            Calcio Trainer
          </h1>

          {profile && (
            <button
              onClick={resetProfile}
              className="px-3 py-2 text-xs md:text-sm rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              title="Reimposta profilo"
            >
              Cambia profilo
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* --- FORM PROFILO --- */}
        {!profile && (
          <Section title="Crea il tuo profilo">
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSaveProfile}>
              <div>
                <Label>Nome e cognome</Label>
                <Input name="nomeCompleto" required placeholder="Es. Mario Rossi" />
              </div>

              <div>
                <Label>Data di nascita</Label>
                <Input type="date" name="dataNascita" required />
              </div>

              <div>
                <Label>Altezza (cm)</Label>
                <Input type="number" name="altezza" min="120" max="220" step="1" required />
              </div>

              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" name="peso" min="30" max="150" step="0.1" required />
              </div>

              <div>
                <Label>Ruolo (calcio a 11)</Label>
                <Input name="ruolo11" placeholder="Es. Centrocampista" />
              </div>

              <div>
                <Label>Ruolo (calcio a 5)</Label>
                <Input name="ruolo5" placeholder="Es. Laterale" />
              </div>

              <div className="md:col-span-2">
                <Label>Squadra</Label>
                <Input name="squadra" placeholder="Es. Polisportiva X" />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <div className="flex gap-3">
                  <div>
                    <Label>Durata allenamento</Label>
                    <Select
                      value={settings.durataMinuti}
                      onChange={(e) =>
                        setSettings((s) => {
                          const ns = { ...s, durataMinuti: Number(e.target.value) };
                          localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(ns));
                          return ns;
                        })
                      }
                    >
                      {[10, 15, 20, 25, 30, 35, 40].map((m) => (
                        <option key={m} value={m}>
                          {m} minuti
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Giorni a settimana</Label>
                    <Select
                      value={settings.giorniSettimana}
                      onChange={(e) =>
                        setSettings((s) => {
                          const ns = { ...s, giorniSettimana: Number(e.target.value) };
                          localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(ns));
                          return ns;
                        })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                        <option key={g} value={g}>
                          {g} giorni
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <button
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                  type="submit"
                >
                  Salva e continua
                </button>
              </div>
            </form>
          </Section>
        )}

        {/* --- PERCORSO DEL GIORNO + LISTA ESERCIZI --- */}
        {profile && (
          <>
            <Section
              title="Il mio percorso di oggi"
              right={
                <button
                  onClick={generaOggi}
                  className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
                  title="Rigenera percorso (cambia con la giornata)"
                >
                  Rigenera
                </button>
              }
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div>
                  <Label>Durata allenamento</Label>
                  <Select
                    value={settings.durataMinuti}
                    onChange={(e) =>
                      setSettings((s) => {
                        const ns = { ...s, durataMinuti: Number(e.target.value) };
                        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(ns));
                        return ns;
                      })
                    }
                  >
                    {[10, 15, 20, 25, 30, 35, 40].map((m) => (
                      <option key={m} value={m}>
                        {m} minuti
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Giorni a settimana</Label>
                  <Select
                    value={settings.giorniSettimana}
                    onChange={(e) =>
                      setSettings((s) => {
                        const ns = { ...s, giorniSettimana: Number(e.target.value) };
                        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(ns));
                        return ns;
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                      <option key={g} value={g}>
                        {g} giorni
                      </option>
                    ))}
                  </Select>
                </div>

                <button
                  onClick={generaOggi}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                >
                  Genera percorso di oggi
                </button>
              </div>

              {!plan ? (
                <p className="text-gray-700">
                  Premi <span className="font-semibold">“Genera percorso di oggi”</span> per creare
                  il tuo allenamento quotidiano. Inizia sempre con 2–3 riscaldamenti.
                </p>
              ) : (
                <>
                  <p className="text-gray-700 mb-3">
                    Durata target:{" "}
                    <span className="font-semibold">{settings.durataMinuti}′</span> • Totale
                    stimato: <span className="font-semibold">{plan.minutiTotali}′</span> •
                    Riscaldamento:{" "}
                    <span className="font-semibold">{plan.warmupCount} esercizi</span>
                  </p>
                  <div className="space-y-3">
                    {plan.items.map((d, i) => (
                      <DrillCard key={d.id} item={d} index={i} />
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={startWorkout}
                      disabled={!plan?.items?.length}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow disabled:opacity-50"
                    >
                      Inizia allenamento
                    </button>
                    <button
                      onClick={generaOggi}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200"
                    >
                      Cambia percorso
                    </button>
                  </div>
                </>
              )}
            </Section>

            <Section title="Tutti gli esercizi della piattaforma">
              <div className="grid md:grid-cols-2 gap-4">
                {DRILLS.map((d) => (
                  <DrillCard key={d.id} item={d} />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* --- ALLENAMENTO IN CORSO --- */}
        {started && !finished && plan && drill && (
          <Section title="Allenamento in corso">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-bold text-blue-700">
                {current + 1}/{plan.items.length} • {drill.titolo}
              </h3>
              <span className="text-sm text-gray-600">Durata: {drill.durataMin}′</span>
            </div>

            <div className="mt-3">
              <DrillCard item={drill} compact />
            </div>

            <div className="mt-4 bg-white rounded-2xl shadow border border-blue-100 p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-blue-700">
                  {formatTime(secondsLeft)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={togglePause}
                    className="px-3 md:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                  >
                    {running ? "Pausa" : "Continua"}
                  </button>
                  <button
                    onClick={nextDrill}
                    className="px-3 md:px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200"
                  >
                    Prossimo
                  </button>
                </div>
              </div>

              {/* Barra progresso */}
              <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Avanzamento */}
              <div className="mt-3 flex gap-2">
                {plan.items.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i === current ? "bg-blue-700" : "bg-blue-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* --- FINE ALLENAMENTO --- */}
        {finished && (
          <Section title="Allenamento completato! 💪">
            <p className="text-gray-700">
              Ottimo lavoro! Puoi rigenerare il percorso di oggi o tornare alla lista.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={startWorkout}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
              >
                Ripeti
              </button>
              <button
                onClick={() => {
                  stopWorkout();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200"
              >
                Torna alla lista
              </button>
            </div>
          </Section>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Calcio Trainer — PWA
      </footer>
    </div>
  );
}
