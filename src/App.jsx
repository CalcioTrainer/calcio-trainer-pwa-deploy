import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * =========================================================
 *  App.jsx — versione finale
 *  - HOME: Search in alto → "Percorso di oggi" → lista allenamenti (uno sotto l'altro)
 *  - Percorso di oggi: FACOLTATIVO; se mancano dati → alert; altrimenti allenamento personalizzato singolo
 *  - Click allenamento: popup scelta durata → schermata con cronometro Start/Pausa/Stop
 *  - Area Personale: tutti i dati modificabili; Ruolo/Durata/Frequenza FACOLTATIVI
 *  - Menu ≡ invariato; Feedback via mailto:appcalcio1@gmail.com
 * =========================================================
 */

/* ==============================
   Local Storage helpers
============================== */
const LS_KEY = "aoo_app_user";
function loadUser() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveUser(user) {
  localStorage.setItem(LS_KEY, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(LS_KEY);
}

/* ==============================
   Tema & Costanti
============================== */
const COLORS = {
  brand: "#25a244",
  brandDark: "#1b6e1f",
  bg: "#f8fdf8",
  text: "#0f172a",
  muted: "#6b7280",
  card: "#ffffff",
  border: "#e5e7eb",
};

const ROLES_11 = [
  "Portiere",
  "Terzino",
  "Difensore centrale",
  "Centrocampista centrale",
  "Ala",
  "Trequartista",
  "Attaccante",
];
const ROLES_5 = ["Portiere", "Difensore", "Laterale", "Pivot", "Universale"];

/* ===== Allenamenti (base) per sezione ===== */
const WORKOUT_SECTIONS = [
  {
    key: "riscaldamento",
    label: "Riscaldamento",
    items: [
      { id: 1, name: "Corsa leggera", base: 10 },
      { id: 2, name: "Mobilità articolare", base: 8 },
      { id: 3, name: "Attivazione dinamica", base: 7 },
      { id: 4, name: "Skip + calciata", base: 6 },
      { id: 5, name: "Aperture anche", base: 6 },
    ],
  },
  {
    key: "tecnica",
    label: "Tecnica",
    items: [
      { id: 11, name: "Conduzione a zig-zag", base: 12 },
      { id: 12, name: "Passaggi di prima", base: 10 },
      { id: 13, name: "Controllo orientato", base: 10 },
      { id: 14, name: "Stop + tiro rapido", base: 10 },
      { id: 15, name: "Palla al palloncino (tecnica piede)", base: 8 },
      { id: 16, name: "1-2 con compagno", base: 10 },
      { id: 17, name: "Finta + conduzione", base: 10 },
      { id: 18, name: "Rondos 4v2", base: 12 },
      { id: 19, name: "Tecnica di guida palla", base: 10 },
      { id: 20, name: "Domino passaggi a muro", base: 8 },
    ],
  },
  {
    key: "resistenza",
    label: "Resistenza",
    items: [
      { id: 21, name: "Intermittente 10x(30\"/30\")", base: 10 },
      { id: 22, name: "Navette 10-20-30", base: 12 },
      { id: 23, name: "Corsa continua", base: 15 },
      { id: 24, name: "Ripetute 6x200m", base: 12 },
      { id: 25, name: "Corsa progressiva", base: 12 },
      { id: 26, name: "Potenziamento aerobico con palla", base: 12 },
      { id: 27, name: "Fartlek breve", base: 12 },
    ],
  },
  {
    key: "tiro",
    label: "Tiro",
    items: [
      { id: 31, name: "Tiro su scarico dal limite", base: 12 },
      { id: 32, name: "1v1 + conclusione", base: 10 },
      { id: 33, name: "Cross + inserimento", base: 10 },
      { id: 34, name: "Tiro di prima su cross", base: 10 },
      { id: 35, name: "Tiro a giro", base: 8 },
      { id: 36, name: "Finalizzazione in area", base: 10 },
    ],
  },
  {
    key: "forza",
    label: "Forza/Velocità",
    items: [
      { id: 41, name: "Scatti 10x20m", base: 8 },
      { id: 42, name: "Balzi pliometrici", base: 8 },
      { id: 43, name: "Skip alto + sprint", base: 8 },
      { id: 44, name: "Circuito core (plank/side)", base: 10 },
      { id: 45, name: "Affondi + squat a corpo libero", base: 10 },
      { id: 46, name: "Andature tecniche con sprint", base: 8 },
    ],
  },
  {
    key: "defaticamento",
    label: "Defaticamento",
    items: [
      { id: 51, name: "Corsa blanda", base: 5 },
      { id: 52, name: "Stretching globale", base: 8 },
      { id: 53, name: "Respirazione + mobilità", base: 5 },
      { id: 54, name: "Camminata + scarico", base: 6 },
      { id: 55, name: "Stretching inferiori", base: 7 },
    ],
  },
];

/* ===== Costruisco una lista unica di ~50 allenamenti ===== */
function buildAllWorkouts() {
  const base = WORKOUT_SECTIONS.flatMap((s) =>
    s.items.map((it) => ({ ...it, section: s.key, sectionLabel: s.label }))
  );
  // Se meno di 50, riempio con varianti numerate
  let all = [...base];
  let id = 100;
  const names = [
    "Conduzione serpentina",
    "Passaggi lunghi",
    "Gioco di posizione 5v2",
    "Torello 6v3",
    "Finalizzazione su palla filtrante",
    "Duelli 1v1 laterali",
    "Duelli 2v2 in corsa",
    "Cambio passo + tiro",
    "Pressing coordinato",
    "Uscita palla dal basso",
    "Coperture difensive",
    "Transizioni rapide",
    "Rimessa laterale tattica",
    "Passeggiata attiva",
    "Equilibrio su bosu",
  ];
  while (all.length < 50) {
    const name = names[(all.length - base.length) % names.length];
    all.push({
      id: id++,
      name: `${name} ${Math.ceil((all.length - base.length + 1) / names.length)}`,
      base: 9,
      section: "extra",
      sectionLabel: "Extra",
    });
  }
  return all.slice(0, 50);
}
const ALL_WORKOUTS = buildAllWorkouts();

/* ==============================
   App
============================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login"); // login | home | workouts | area | percorso | workout
  const [menuOpen, setMenuOpen] = useState(false);

  // Stato per allenamento attivo e durata scelta
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [activeDuration, setActiveDuration] = useState(null);
  const [durationPickerFor, setDurationPickerFor] = useState(null); // workout per il popup

  // Carica utente (se presente) e vai in HOME
  useEffect(() => {
    const u = loadUser();
    if (u) {
      setUser(u);
      setScreen("home");
    }
  }, []);

  useEffect(() => {
    if (user) saveUser(user);
  }, [user]);

  const goHome = () => setScreen("home");
  const goArea = () => setScreen("area");
  const goWorkouts = () => setScreen("workouts");

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setScreen("login");
    setMenuOpen(false);
  };

  const Header = ({ title }) => (
    <div style={styles.header} onClick={() => menuOpen && setMenuOpen(false)}>
      <div style={styles.headerLeft}>⚽ {title}</div>
      {user && (
        <div style={styles.headerRight}>
          <button
            aria-label="Menu"
            title="Menu"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            style={styles.hamburger}
          >
            <span style={styles.burgerLine} />
            <span style={styles.burgerLine} />
            <span style={styles.burgerLine} />
          </button>
          {menuOpen && (
            <MenuPopup
              onClose={() => setMenuOpen(false)}
              onArea={() => {
                setMenuOpen(false);
                goArea();
              }}
              onHome={() => {
                setMenuOpen(false);
                goHome();
              }}
              onWorkouts={() => {
                setMenuOpen(false);
                goWorkouts();
              }}
              onLogout={handleLogout}
            />
          )}
        </div>
      )}
    </div>
  );

  // Navigazione principale
  return (
    <div style={styles.app}>
      {screen === "login" && (
        <>
          <Header title="Benvenuto" />
          <div style={styles.container}>
            <Auth
              onLogin={(u) => {
                setUser(u);
                setScreen("home");
              }}
            />
          </div>
        </>
      )}

      {screen === "home" && (
        <>
          <Header title={`Benvenuto${user?.name ? ` ${user.name}` : ""}!`} />
          <div style={styles.container}>
            <HomeScreenNew
              user={user}
              onAreaPersonale={goArea}
              onPercorso={() => {
                // Percorso FACOLTATIVO: se mancano dati → alert e rimango in HOME
                const hasSomeData =
                  (user?.role11 || user?.role5 || null) ||
                  user?.preferredDuration ||
                  user?.preferredFrequency;
                if (!hasSomeData) {
                  alert(
                    "Per generare il tuo percorso personalizzato, completa i dati nell’Area Personale (ruolo / durata / frequenza). Oppure continua ad allenarti liberamente dalla lista!"
                  );
                  return;
                }
                setScreen("percorso");
              }}
              onStartWorkout={(w) => setDurationPickerFor(w)}
            />
            <Footer onLogout={handleLogout} />
          </div>
        </>
      )}

      {screen === "workouts" && (
        <>
          <Header title="Allenamenti" />
          <div style={styles.container}>
            <WorkoutsList
              workouts={ALL_WORKOUTS}
              onStart={(w) => setDurationPickerFor(w)}
            />
            <Footer onLogout={handleLogout} />
          </div>
        </>
      )}

      {screen === "area" && (
        <>
          <Header title="Area Personale" />
          <div style={styles.container}>
            <PersonalArea
              user={user}
              onSave={(updated) => setUser(updated)}
            />
            <Footer onLogout={handleLogout} />
          </div>
        </>
      )}

      {screen === "percorso" && (
        <>
          <Header title="Percorso di oggi" />
          <div style={styles.container}>
            <PercorsoOggi
              user={user}
              onStart={(w) => setDurationPickerFor(w)}
              onBack={goHome}
            />
          </div>
        </>
      )}

      {screen === "workout" && activeWorkout && (
        <>
          <Header title="Allenamento in corso" />
          <div style={styles.container}>
            <WorkoutRunner
              workout={activeWorkout}
              minutes={activeDuration}
              onExit={() => {
                setActiveWorkout(null);
                setActiveDuration(null);
                setScreen("home");
              }}
            />
          </div>
        </>
      )}

      {/* Popup selezione durata */}
      {durationPickerFor && (
        <DurationPicker
          onClose={() => setDurationPickerFor(null)}
          onChoose={(mins) => {
            setActiveWorkout(durationPickerFor);
            setActiveDuration(mins);
            setDurationPickerFor(null);
            setScreen("workout");
          }}
        />
      )}
    </div>
  );
}

/* ==============================
   HOME nuova (search + percorso + lista unica)
============================== */
function HomeScreenNew({ user, onPercorso, onStartWorkout }) {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_WORKOUTS;
    return ALL_WORKOUTS.filter((w) => w.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div style={styles.card}>
      {/* Search */}
      <input
        type="text"
        placeholder="Cerca allenamento per nome…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ ...styles.input, width: "100%", marginBottom: 10 }}
      />

      {/* Percorso di oggi (facoltativo) */}
      <button style={styles.buttonPrimary} onClick={onPercorso}>
        Percorso di oggi
      </button>

      {/* Lista unica (uno sotto l'altro) */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((it) => (
          <WorkoutRow key={it.id} item={it} onStart={() => onStartWorkout(it)} />
        ))}
        {list.length === 0 && (
          <div style={{ color: COLORS.muted, marginTop: 8 }}>Nessun allenamento trovato.</div>
        )}
      </div>

      {/* Link rapido area personale */}
      <div style={{ marginTop: 12 }}>
        <span style={{ color: COLORS.muted, fontSize: 13 }}>
          Vuoi personalizzare il percorso?
        </span>{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Apri il menu ≡ in alto a destra → Area Personale");
          }}
          style={{ color: COLORS.brand, textDecoration: "underline" }}
        >
          Vai in Area Personale
        </a>
      </div>
    </div>
  );
}

/* ==============================
   Percorso di oggi (singolo, personalizzato se possibile)
============================== */
function PercorsoOggi({ user, onStart, onBack }) {
  const plan = useMemo(() => generatePersonalizedSession(user), [user]);
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={styles.title}>Allenamento di oggi</h3>
        <button style={styles.buttonTertiary} onClick={onBack}>
          Torna alla Home
        </button>
      </div>

      <div style={{ color: COLORS.muted, marginBottom: 10 }}>
        {plan.subtitle}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plan.blocks.map((b, i) => (
          <div key={i} style={styles.workoutCard}>
            <div>
              <div style={{ fontWeight: 600 }}>{b.name}</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>{b.minutes} min</div>
            </div>
            <button
              style={styles.buttonSecondarySmall}
              onClick={() => onStart({ id: 1000 + i, name: b.name })}
            >
              Avvia
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function generatePersonalizedSession(user) {
  // Scelgo priorità ruolo: 11 poi 5
  const role = user?.role11 || user?.role5 || null;
  const prefDur = Number(user?.preferredDuration) || 45; // default se non presente
  // Creo una seduta singola in blocchi
  let focus = "generale";
  if (role) {
    if (["Attaccante", "Ala", "Pivot"].includes(role)) focus = "finalizzazione";
    else if (["Difensore", "Terzino", "Difensore centrale"].includes(role)) focus = "difesa";
    else if (["Centrocampista centrale", "Universale", "Trequartista"].includes(role)) focus = "costruzione";
    else if (role === "Portiere") focus = "portiere";
  }

  // Ripartizione minuti semplice
  const total = prefDur;
  const blocks = [];
  const push = (name, m) => blocks.push({ name, minutes: m });

  const warm = Math.max(8, Math.round(total * 0.2));
  const cool = Math.max(5, Math.round(total * 0.15));
  let core = Math.max(10, total - warm - cool);

  push("Riscaldamento", warm);

  if (focus === "finalizzazione") {
    push("1v1 + conclusione", Math.round(core * 0.5));
    push("Tiro su scarico", Math.round(core * 0.5));
  } else if (focus === "difesa") {
    push("Coperture + scivolamenti", Math.round(core * 0.5));
    push("Duelli difensivi", Math.round(core * 0.5));
  } else if (focus === "costruzione") {
    push("Rondos 4v2", Math.round(core * 0.5));
    push("Uscita palla dal basso", Math.round(core * 0.5));
  } else if (focus === "portiere") {
    push("Balzi + riflessi", Math.round(core * 0.5));
    push("Presa alta + rilanci", Math.round(core * 0.5));
  } else {
    push("Tecnica con palla", Math.round(core * 0.5));
    push("Resistenza specifica", Math.round(core * 0.5));
  }

  push("Defaticamento + stretching", cool);

  return {
    subtitle: `Seduta ${
      role ? `per ruolo: ${role}` : "generale"
    } • Durata consigliata: ${total} min`,
    blocks,
  };
}

/* ==============================
   Lista Allenamenti (usata in /workouts)
============================== */
function WorkoutsList({ workouts, onStart }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return workouts;
    return workouts.filter((w) => w.name.toLowerCase().includes(s));
  }, [q, workouts]);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Allenamenti</h3>
      <input
        type="text"
        placeholder="Cerca…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ ...styles.input, width: "100%", marginTop: 8, marginBottom: 10 }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((w) => (
          <WorkoutRow key={w.id} item={w} onStart={() => onStart(w)} />
        ))}
      </div>
    </div>
  );
}

function WorkoutRow({ item, onStart }) {
  return (
    <div style={styles.workoutCard}>
      <div>
        <div style={{ fontWeight: 600 }}>{item.name}</div>
        <div style={{ color: COLORS.muted, fontSize: 13 }}>
          Seleziona la durata quando avvii
        </div>
      </div>
      <button style={styles.buttonSecondarySmall} onClick={onStart}>
        Avvia
      </button>
    </div>
  );
}

/* ==============================
   Runner Allenamento (cronometro)
============================== */
function WorkoutRunner({ workout, minutes, onExit }) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) {
      setRunning(false);
      alert("Allenamento completato! 🎉");
    }
  }, [seconds, running]);

  const fmt = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🏁 {workout.name}</h3>
      <div style={{ fontSize: 48, fontWeight: 800, textAlign: "center", margin: "12px 0" }}>
        {fmt(seconds)}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {!running ? (
          <button style={styles.buttonPrimary} onClick={() => setRunning(true)}>
            Start
          </button>
        ) : (
          <button style={styles.buttonSecondary} onClick={() => setRunning(false)}>
            Pausa
          </button>
        )}
        <button
          style={styles.buttonTertiary}
          onClick={() => {
            setRunning(false);
            setSeconds(minutes * 60);
          }}
        >
          Reset
        </button>
        <button style={styles.buttonTertiary} onClick={onExit}>
          Esci
        </button>
      </div>

      <div style={{ marginTop: 12, color: COLORS.muted, textAlign: "center" }}>
        Durata impostata: {minutes} min • Rimasto: {Math.ceil(seconds / 60)} min
      </div>
    </div>
  );
}

/* ==============================
   Popup Selezione Durata
============================== */
function DurationPicker({ onClose, onChoose }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const quick = [5, 10, 15, 20, 30];
  const [custom, setCustom] = useState("");

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modal} ref={ref}>
        <h3 style={styles.title}>Seleziona la durata</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {quick.map((m) => (
            <button key={m} style={styles.buttonSecondary} onClick={() => onChoose(m)}>
              {m} min
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            type="number"
            min={1}
            placeholder="Minuti personalizzati"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            style={{ ...styles.input, width: 180 }}
          />
          <button
            style={styles.buttonPrimary}
            onClick={() => {
              const n = Number(custom);
              if (!n || n <= 0) {
                alert("Inserisci un numero di minuti valido");
                return;
              }
              onChoose(n);
            }}
          >
            Avvia
          </button>
          <button style={styles.buttonTertiary} onClick={onClose}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==============================
   Area Personale
============================== */
function PersonalArea({ user, onSave }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(user || {});

  useEffect(() => setForm(user || {}), [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Adesso TUTTO è facoltativo tranne i dati di base (nome/cognome/email restano consigliati, ma non forzo qui)
    onSave(form);
    setEdit(false);
  };

  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={styles.title}>👤 Area Personale</h3>
        {!edit && (
          <button style={styles.buttonSecondary} onClick={() => setEdit(true)}>
            Modifica profilo
          </button>
        )}
      </div>

      {!edit ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <Info label="Nome" value={form.name} />
          <Info label="Cognome" value={form.surname} />
          <Info label="Email" value={form.email} />
          <Info label="Altezza (cm)" value={form.height} />
          <Info label="Peso (kg)" value={form.weight} />
          <Info label="Data di nascita" value={form.birthdate} />
          <Info label="Squadra (facoltativa)" value={form.team} />
          <Info label="Ruolo (11, facoltativo)" value={form.role11} />
          <Info label="Ruolo (5, facoltativo)" value={form.role5} />
          <Info label="Durata preferita (facoltativa)" value={form.preferredDuration ? `${form.preferredDuration} min` : ""} />
          <Info label="Frequenza settimanale (facoltativa)" value={form.preferredFrequency ? `${form.preferredFrequency} giorni` : ""} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={styles.row}>
            <Input
              label="Nome"
              value={form.name || ""}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Cognome"
              value={form.surname || ""}
              onChange={(v) => setForm({ ...form, surname: v })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email || ""}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <div style={styles.row}>
            <Input
              label="Altezza (cm)"
              type="number"
              value={form.height || ""}
              onChange={(v) => setForm({ ...form, height: v })}
            />
            <Input
              label="Peso (kg)"
              type="number"
              value={form.weight || ""}
              onChange={(v) => setForm({ ...form, weight: v })}
            />
          </div>
          <Input
            label="Data di nascita"
            type="date"
            value={form.birthdate || ""}
            onChange={(v) => setForm({ ...form, birthdate: v })}
          />
          <Input
            label="Squadra (facoltativa)"
            value={form.team || ""}
            onChange={(v) => setForm({ ...form, team: v })}
          />

          <div style={styles.row}>
            <Select
              label="Ruolo Calcio a 11 (facoltativo)"
              value={form.role11 || ""}
              onChange={(v) => setForm({ ...form, role11: v })}
              options={ROLES_11}
              optional
            />
            <Select
              label="Ruolo Calcio a 5 (facoltativo)"
              value={form.role5 || ""}
              onChange={(v)
