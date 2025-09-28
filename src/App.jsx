import React, { useEffect, useMemo, useState } from "react";

// App Allenamenti Calcio a Casa — tutto in un singolo file React
// Requisiti: nessun backend. Salvataggio su localStorage. Solo palla.
// Lingua: Italiano

// Utili
const ruoli11 = [
  "Portiere",
  "Terzino Destro",
  "Difensore Centrale",
  "Terzino Sinistro",
  "Esterno Destro",
  "Mezzala Destra",
  "Regista/Mediano",
  "Mezzala Sinistra",
  "Esterno Sinistro",
  "Seconda Punta/Trequartista",
  "Centravanti",
];

const ruoli5 = [
  "Portiere",
  "Difensore/Fisso",
  "Laterale",
  "Universale",
  "Pivot",
];

const initialProfile = {
  nome: "",
  cognome: "",
  dataNascita: "",
  altezza: "",
  peso: "",
  ruolo11: "",
  ruolo5: "",
  squadra: "",
};

const STORAGE_KEY = "allenamenti-casa-profile-v1";
const PLAN_KEY = "allenamenti-casa-plan-v1";

// Libreria di esercizi SOLO PALLA in spazi ridotti (casa/cortile/garage)
// Ogni esercizio ha: id, titolo, descrizione, durata consigliata, focus, difficoltà
const DRILLS = [
  {
    id: "ball-mastery-1",
    titolo: "Ball Mastery Base",
    descrizione:
      "Tocchi rapidi destro/sinistro sul posto, punta-interno/esterno, suola avanti/indietro.",
    durata: 8,
    focus: ["tecnica", "controllo"],
    difficolta: 1,
  },
  {
    id: "ball-mastery-2",
    titolo: "Tocchi con Suola & Finte",
    descrizione:
      "Scivolate di suola laterali, finte semplici (step-over singolo), cambi direzione stretti.",
    durata: 8,
    focus: ["tecnica", "dribbling"],
    difficolta: 2,
  },
  {
    id: "juggling",
    titolo: "Palleggi Progressivi",
    descrizione:
      "Palleggi alternando piedi, cosce, testa se possibile. Serie a obiettivo.",
    durata: 10,
    focus: ["coordinazione", "primo controllo"],
    difficolta: 2,
  },
  {
    id: "wall-pass",
    titolo: "Passaggi contro il muro",
    descrizione:
      "Passaggi a una/due tocchi contro una parete (o mobile robusto), controllo orientato.",
    durata: 12,
    focus: ["passaggio", "primo controllo"],
    difficolta: 2,
  },
  {
    id: "tight-dribble",
    titolo: "Dribbling in spazio ridotto",
    descrizione:
      "Slalom tra 4-6 oggetti (libri/bottiglie) a 50-80cm, cambi di ritmo e finta corpo.",
    durata: 10,
    focus: ["dribbling", "agilità"],
    difficolta: 2,
  },
  {
    id: "turns",
    titolo: "Giri & Protezione palla",
    descrizione:
      "Ricezione immaginaria, protezione con corpo, giri (Cruyff, esterno, suola) e ripartenza.",
    durata: 8,
    focus: ["tecnica", "forza specifica"],
    difficolta: 2,
  },
  {
    id: "finishing-no-goal",
    titolo: "Finalizzazione senza porta",
    descrizione:
      "Controllo + tiro simulato verso un bersaglio a terra/parete (precisione sul target).",
    durata: 6,
    focus: ["tiro", "coordinazione"],
    difficolta: 1,
  },
  {
    id: "keeper-footwork",
    titolo: "Portiere: footwork + presa simulata",
    descrizione:
      "Passetti laterali, affondi controllati, lanci palla in alto e presa al petto.",
    durata: 8,
    focus: ["portiere", "coordinazione"],
    difficolta: 2,
  },
  {
    id: "conditioning-ball",
    titolo: "Condizionamento con palla",
    descrizione: "30\" lavoro / 30\" pausa di guida palla veloce, stop, cambio direzione.",

    durata: 8,
    focus: ["resistenza", "ritmo"],
    difficolta: 2,
  },
  {
    id: "mobility",
    titolo: "Mobilità con palla",
    descrizione:
      "Circonduzioni caviglia con palla, affondi leggeri con controllo palla, mobilità anca.",
    durata: 6,
    focus: ["mobilità", "prevenzione"],
    difficolta: 1,
  },
];

// Suggerimenti per ruolo
const ROLE_FOCUS = {
  Portiere: ["portiere", "passaggio", "coordinazione"],
  "Terzino Destro": ["passaggio", "dribbling", "resistenza"],
  "Terzino Sinistro": ["passaggio", "dribbling", "resistenza"],
  "Difensore Centrale": ["passaggio", "primo controllo", "forza specifica"],
  "Esterno Destro": ["dribbling", "tiro", "ritmo"],
  "Esterno Sinistro": ["dribbling", "tiro", "ritmo"],
  "Mezzala Destra": ["tecnica", "resistenza", "passaggio"],
  "Mezzala Sinistra": ["tecnica", "resistenza", "passaggio"],
  "Regista/Mediano": ["passaggio", "primo controllo", "tecnica"],
  "Seconda Punta/Trequartista": ["dribbling", "tiro", "primo controllo"],
  Centravanti: ["tiro", "protezione palla", "primo controllo"],
  // Calcio a 5
  "Difensore/Fisso": ["passaggio", "protezione palla", "primo controllo"],
  Laterale: ["dribbling", "passaggio", "ritmo"],
  Universale: ["tecnica", "resistenza", "primo controllo"],
  Pivot: ["protezione palla", "tiro", "passaggio"],
};

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function secondsToMMSS(total) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function AppAllenamentiCasa() {
  const [profile, setProfile] = useState(initialProfile);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null); // {drillId, remainingSec}

  // Carica da localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved));
      const savedPlan = localStorage.getItem(PLAN_KEY);
      if (savedPlan) setPlan(JSON.parse(savedPlan));
    } catch {}
  }, []);

  // Salva profilo
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Salva piano
  useEffect(() => {
    try {
      if (plan) localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    } catch {}
  }, [plan]);

  const age = useMemo(() => {
    if (!profile.dataNascita) return null;
    const dob = new Date(profile.dataNascita);
    if (isNaN(dob.getTime())) return null;
    const diff = Date.now() - dob.getTime();
    const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    return years;
  }, [profile.dataNascita]);

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function validateProfile(p) {
    const errors = [];
    if (!p.nome) errors.push("Nome obbligatorio");
    if (!p.cognome) errors.push("Cognome obbligatorio");
    if (!p.dataNascita) errors.push("Data di nascita obbligatoria");
    if (!p.altezza) errors.push("Altezza obbligatoria");
    if (!p.peso) errors.push("Peso obbligatorio");
    return errors;
  }

  function pickDrillsByFocus(focusArray, count = 4) {
    // Scegli esercizi che matchano il focus
    const pool = DRILLS.filter((d) =>
      d.focus.some((f) => focusArray.some((x) => f.includes(x) || x.includes(f)))
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  function baseWarmUp() {
    return [
      {
        id: "warmup-1",
        titolo: "Riscaldamento tecnico",
        descrizione:
          "Guida palla leggera + mobilità (caviglie/anche) con palla. Ritmo basso.",
        durata: 6,
      },
    ];
  }

  function baseCoolDown() {
    return [
      {
        id: "cooldown-1",
        titolo: "Defaticamento & mobilità",
        descrizione: "Respirazione, mobilità con palla, stretching dolce.",
        durata: 5,
      },
    ];
  }

  function generatePlan() {
    const errs = validateProfile(profile);
    if (errs.length) {
      alert("Completa i campi: \n- " + errs.join("\n- "));
      return;
    }

    setLoading(true);
    // Logica semplice: 4 sessioni/settimana x ~35-45' ciascuna
    const ruoloFocus11 = ROLE_FOCUS[profile.ruolo11] || [];
    const ruoloFocus5 = ROLE_FOCUS[profile.ruolo5] || [];

    // Priorità: se è Portiere in uno dei due, includi esercizio specifico
    const isGK = profile.ruolo11 === "Portiere" || profile.ruolo5 === "Portiere";

    const mainFocus = [...new Set([...ruoloFocus11, ...ruoloFocus5])];
    if (mainFocus.length === 0) mainFocus.push("tecnica", "primo controllo");

    const sessioni = [];
    for (let i = 1; i <= 4; i++) {
      let drills = pickDrillsByFocus(mainFocus, 3);
      // Aggiungi condizionamento e ball mastery sempre
      const mastery = DRILLS.find((d) => d.id === "ball-mastery-1");
      const cond = DRILLS.find((d) => d.id === "conditioning-ball");
      drills = [mastery, ...drills.filter(Boolean)];
      if (isGK) {
        const gk = DRILLS.find((d) => d.id === "keeper-footwork");
        if (gk && !drills.find((x) => x.id === gk.id)) drills.push(gk);
      }
      if (cond && !drills.find((x) => x.id === cond.id)) drills.push(cond);

      // Durata target in base all'età
      const target = age && age < 13 ? 30 : 40; // minuti
      const totalMain = drills.reduce((s, d) => s + d.durata, 0);
      // Se supera target, riduci gli ultimi esercizi
      let over = totalMain - target + 10; // +10' per warmup/cooldown
      const normalized = drills.map((d) => ({ ...d }));
      if (over > 0) {
        for (let k = normalized.length - 1; k >= 0 && over > 0; k--) {
          const cut = Math.min(3, normalized[k].durata - 5);
          if (cut > 0) {
            normalized[k].durata -= cut;
            over -= cut;
          }
        }
      }

      sessioni.push({
        nome: `Sessione ${i}`,
        warmup: baseWarmUp(),
        main: normalized,
        cooldown: baseCoolDown(),
      });
    }

    const nuovoPiano = {
      creatoIl: new Date().toISOString(),
      giocatore: profile,
      frequenzaSettimanale: 4,
      sessioni,
      note:
        "Esegui 4 sessioni a settimana. Recupero 24-48h tra sessioni intense. Tutto con sola palla. Adatta spazi e sicurezze di casa.",
    };

    setPlan(nuovoPiano);
    setLoading(false);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ profile, plan }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `piano-allenamento-${profile.nome || "giocatore"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetAll() {
    if (!confirm("Sicuro di cancellare profilo e piano?")) return;
    setProfile(initialProfile);
    setPlan(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PLAN_KEY);
  }

  // Timer semplice per singolo esercizio
  useEffect(() => {
    if (!activeTimer) return;
    const t = setInterval(() => {
      setActiveTimer((cur) => {
        if (!cur) return null;
        if (cur.remainingSec <= 1) return null;
        return { ...cur, remainingSec: cur.remainingSec - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeTimer]);

  function startTimer(drill) {
    setActiveTimer({ drillId: drill.id, remainingSec: drill.durata * 60 });
  }

  function stopTimer() {
    setActiveTimer(null);
  }

  function printPlan() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Allenamenti Calcio a Casa (solo palla)</h1>
          <div className="flex gap-2">
            <button
              onClick={generatePlan}
              className="px-3 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700"
            >
              Genera Piano
            </button>
            <button
              onClick={exportJSON}
              className="px-3 py-2 rounded-2xl bg-slate-900 text-white shadow hover:bg-slate-800"
            >
              Esporta JSON
            </button>
            <button
              onClick={printPlan}
              className="px-3 py-2 rounded-2xl border shadow hover:bg-slate-100"
            >
              Stampa
            </button>
            <button
              onClick={resetAll}
              className="px-3 py-2 rounded-2xl border shadow hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6 print:block">
        {/* Colonna profilo */}
        <section className="bg-white rounded-2xl shadow p-4 print:shadow-none print:border mb-4">
          <h2 className="text-xl font-semibold mb-3">Profilo giocatore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Nome</label>
              <input
                name="nome"
                value={profile.nome}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-xl border"
                placeholder="Es. Marco"
              />
            </div>
            <div>
              <label className="text-sm">Cognome</label>
              <input
                name="cognome"
                value={profile.cognome}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-xl border"
                placeholder="Es. Rossi"
              />
            </div>
            <div>
              <label className="text-sm">Data di nascita</label>
              <input
                type="date"
                name="dataNascita"
                value={profile.dataNascita}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-xl border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Altezza (cm)</label>
                <input
                  name="altezza"
                  type="number"
                  min="100"
                  max="230"
                  value={profile.altezza}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border"
                  placeholder="Es. 175"
                />
              </div>
              <div>
                <label className="text-sm">Peso (kg)</label>
                <input
                  name="peso"
                  type="number"
                  min="30"
                  max="200"
                  value={profile.peso}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border"
                  placeholder="Es. 68"
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Ruolo (Calcio a 11)</label>
              <select
                name="ruolo11"
                value={profile.ruolo11}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-xl border"
              >
                <option value="">Seleziona…</option>
                {ruoli11.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Ruolo (Calcio a 5)</label>
              <select
                name="ruolo5"
                value={profile.ruolo5}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-xl border"
              >
                <option value="">Seleziona…</option>
                {ruoli5.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Squadra</label>
              <input
                name="squadra"
                value={profile.squadra}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-xl border"
                placeholder="Es. ASD Città"
              />
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Età stimata: <b>{age ?? "—"}</b> anni
          </div>
        </section>

        {/* Colonna piano */}
        <section className="bg-white rounded-2xl shadow p-4 print:shadow-none print:border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Piano personalizzato</h2>
            {loading && <span className="text-sm">Generazione…</span>}
          </div>

          {!plan ? (
            <p className="text-slate-600 mt-2">
              Compila il profilo e premi <b>Genera Piano</b> per creare 4 sessioni
              settimanali (30–40'). Tutti gli esercizi richiedono solo la palla e
              poco spazio.
            </p>
          ) : (
            <div className="mt-3 space-y-6">
              <div className="text-sm text-slate-600">
                Creato il {new Date(plan.creatoIl).toLocaleString()} • Frequenza:{" "}
                <b>{plan.frequenzaSettimanale}×/settimana</b>
              </div>

              {plan.sessioni.map((s, idx) => (
                <div key={idx} className="rounded-2xl border p-3">
                  <h3 className="font-semibold text-lg mb-2">{s.nome}</h3>

                  <Blocchi titolo="Riscaldamento" lista={s.warmup} activeTimer={activeTimer} startTimer={startTimer} stopTimer={stopTimer} />
                  <Blocchi titolo="Parte Principale" lista={s.main} activeTimer={activeTimer} startTimer={startTimer} stopTimer={stopTimer} />
                  <Blocchi titolo="Defaticamento" lista={s.cooldown} activeTimer={activeTimer} startTimer={startTimer} stopTimer={stopTimer} />
                </div>
              ))}

              <div className="text-sm text-slate-700">
                <b>Note:</b> {plan.note}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto p-4 text-center text-xs text-slate-500">
        Realizzato per allenamenti individuali a casa. Mantieni l'area libera da ostacoli.
      </footer>

      {/* Barra timer */}
      {activeTimer && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">Timer</div>
          <div className="px-2 py-1 rounded bg-slate-700">
            {secondsToMMSS(activeTimer.remainingSec)}
          </div>
          <button onClick={stopTimer} className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-600">
            Stop
          </button>
        </div>
      )}
    </div>
  );
}

function Blocchi({ titolo, lista, activeTimer, startTimer, stopTimer }) {
  const total = (lista || []).reduce((s, d) => s + (d.durata || 0), 0);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium mb-2">{titolo} ({total}' circa)</h4>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {(lista || []).map((d) => (
          <div key={d.id} className="border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{d.titolo}</div>
              <span className="text-xs text-slate-600">{d.durata}'</span>
            </div>
            {d.focus && (
              <div className="mt-1 text-xs text-slate-500">
                Focus: {Array.isArray(d.focus) ? d.focus.join(", ") : d.focus}
              </div>
            )}
            <p className="text-sm mt-2 text-slate-700">{d.descrizione}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => startTimer(d)}
                className={
                  ["px-3 py-1 rounded-xl border",
                   activeTimer?.drillId === d.id ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-slate-100"
                  ].join(" ")
                }
              >
                {activeTimer?.drillId === d.id ? "In corso…" : "Avvia timer"}
              </button>
              {activeTimer?.drillId === d.id && (
                <button onClick={stopTimer} className="px-3 py-1 rounded-xl border hover:bg-slate-100">
                  Termina
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
