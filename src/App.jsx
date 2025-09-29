import React, { useEffect, useMemo, useState } from "react";

/**
 * App.jsx — Vite + React
 * Tema: Monocromatico chiaro (sfondo bianco, testo nero)
 * Funzioni principali:
 * - Login/Registrazione (demo, senza backend) → dati in localStorage
 * - Home: barra di ricerca in alto, bottone "Percorso di oggi" (facoltativo), elenco di ~50 allenamenti uno sotto l'altro
 * - Menu hamburger (≡): Home, Tutti gli allenamenti, Area personale, Invia feedback (mailto:appcalcio1@gmail.com), Logout
 * - Area personale: dati visibili e modificabili (nome, cognome, email, altezza, peso, data di nascita, squadra (facoltativa), ruolo 11 (facoltativo), ruolo 5 (facoltativo), durata/frequenza preferite facoltative)
 * - Percorso di oggi: crea una seduta singola basata su ruolo/durata preferita (se presenti) — altrimenti avvisa di completare i dati
 * - Avvio allenamento: scelta durata (popup) → cronometro start/pausa/reset/esci
 */

// ==============================
// Local Storage helpers
// ==============================
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

// ==============================
// Tema & Costanti
// ==============================
const COLORS = {
  brand: "#000000",      // Nero principale
  brandDark: "#222222",  // Variante scura
  bg: "#ffffff",         // Sfondo bianco
  text: "#000000",       // Testo nero
  muted: "#6b7280",      // Grigio per testi secondari
  card: "#f9f9f9",       // Grigio molto chiaro per riquadri
  border: "#e5e7eb",     // Bordo leggero
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

// ==============================
// Allenamenti (sezioni + generazione lista 50)
// ==============================
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

function buildAllWorkouts() {
  const base = WORKOUT_SECTIONS.flatMap((s) =>
    s.items.map((it) => ({ ...it, section: s.key, sectionLabel: s.label }))
  );
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

// ==============================
// App
// ==============================
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login"); // login | home | workouts | area | percorso | workout
  const [menuOpen, setMenuOpen] = useState(false);

  // Allenamento attivo
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [activeDuration, setActiveDuration] = useState(null);
  const [durationPickerFor, setDurationPickerFor] = useState(null);

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
              onPercorso={() => {
                const hasSomeData =
                  Boolean(user?.role11) ||
                  Boolean(user?.role5) ||
                  Boolean(user?.preferredDuration) ||
                  Boolean(user?.preferredFrequency);
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
          <Header title="Tutti gli allenamenti" />
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
            <PersonalArea user={user} onSave={(u) => setUser(u)} />
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
              onBack={() => setScreen("home")}
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

// ==============================
// Menu Popup
// ==============================
function MenuPopup({ onClose, onArea, onHome, onWorkouts, onLogout }) {
  return (
    <div style={styles.menu}>
      <button style={styles.menuItem} onClick={onHome}>🏠 Home</button>
      <button style={styles.menuItem} onClick={onWorkouts}>📋 Tutti gli allenamenti</button>
      <button style={styles.menuItem} onClick={onArea}>👤 Area personale</button>
      <a
        href="mailto:appcalcio1@gmail.com?subject=Feedback%20app&body=Ciao%2C%20vorrei%20segnalare..."
        style={{ ...styles.menuItem, textDecoration: "none" }}
      >
        ✉️ Invia feedback
      </a>
      <button style={styles.menuItemDanger} onClick={onLogout}>🚪 Logout</button>
      <button style={styles.menuClose} onClick={onClose}>Chiudi ✕</button>
    </div>
  );
}

// ==============================
// Auth (Login / Registrazione)
// ==============================
function Auth({ onLogin }) {
  const [mode, setMode] = useState("new"); // new | existing
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const submitNew = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name || !form.surname) {
      alert("Compila Nome, Cognome, Email e Password.");
      return;
    }
    const user = {
      name: form.name,
      surname: form.surname,
      email: form.email,
      height: "",
      weight: "",
      birthdate: "",
      team: "",
      role11: "",
      role5: "",
      preferredDuration: "",
      preferredFrequency: "",
    };
    saveUser(user);
    onLogin(user);
  };

  const submitExisting = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Inserisci Email e Password.");
      return;
    }
    const saved = loadUser();
    if (saved && saved.email === form.email) {
      onLogin(saved);
    } else {
      const newUser = {
        name: form.name || "Utente",
        surname: form.surname || "",
        email: form.email,
        height: "",
        weight: "",
        birthdate: "",
        team: "",
        role11: "",
        role5: "",
        preferredDuration: "",
        preferredFrequency: "",
      };
      saveUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.tabs}>
        <button
          onClick={() => setMode("new")}
          style={mode === "new" ? styles.tabActive : styles.tab}
        >
          Nuovo utente
        </button>
        <button
          onClick={() => setMode("existing")}
          style={mode === "existing" ? styles.tabActive : styles.tab}
        >
          Utente esistente
        </button>
      </div>

      {mode === "new" ? (
        <form onSubmit={submitNew} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={styles.row}>
            <Input
              label="Nome"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Cognome"
              value={form.surname}
              onChange={(v) => setForm({ ...form, surname: v })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />
          <button type="submit" style={styles.buttonPrimary}>Registrati</button>
        </form>
      ) : (
        <form onSubmit={submitExisting} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />
          <div style={styles.row}>
            <Input
              label="Nome (opzionale)"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Cognome (opzionale)"
              value={form.surname}
              onChange={(v) => setForm({ ...form, surname: v })}
            />
          </div>
          <button type="submit" style={styles.buttonPrimary}>Accedi</button>
        </form>
      )}
    </div>
  );
}

// ==============================
/* HOME nuova: search + Percorso + lista unica */
// ==============================
function HomeScreenNew({ onPercorso, onStartWorkout }) {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_WORKOUTS;
    return ALL_WORKOUTS.filter((w) => w.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div style={styles.card}>
      <input
        type="text"
        placeholder="Cerca allenamento per nome…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ ...styles.input, width: "100%", marginBottom: 10 }}
      />

      <button style={styles.buttonPrimary} onClick={onPercorso}>
        Percorso di oggi
      </button>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((it) => (
          <WorkoutRow key={it.id} item={it} onStart={() => onStartWorkout(it)} />
        ))}
        {list.length === 0 && (
          <div style={{ color: COLORS.muted, marginTop: 8 }}>Nessun allenamento trovato.</div>
        )}
      </div>
    </div>
  );
}

// ==============================
// Percorso di oggi
// ==============================
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
  const role = user?.role11 || user?.role5 || null;
  const prefDur = Number(user?.preferredDuration) || 45;
  let focus = "generale";
  if (role) {
    if (["Attaccante", "Ala", "Pivot"].includes(role)) focus = "finalizzazione";
    else if (["Difensore", "Terzino", "Difensore centrale"].includes(role)) focus = "difesa";
    else if (["Centrocampista centrale", "Universale", "Trequartista"].includes(role)) focus = "costruzione";
    else if (role === "Portiere") focus = "portiere";
  }
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
    subtitle: `Seduta ${role ? `per ruolo: ${role}` : "generale"} • Durata consigliata: ${total} min`,
    blocks,
  };
}

// ==============================
// Lista allenamenti
// ==============================
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
        <div style={{ color: COLORS.muted, fontSize: 13 }}>Seleziona la durata quando avvii</div>
      </div>
      <button style={styles.buttonSecondarySmall} onClick={onStart}>Avvia</button>
    </div>
  );
}

// ==============================
// Duration Picker (popup)
// ==============================
function DurationPicker({ onClose, onChoose }) {
  const preset = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60];
  const [custom, setCustom] = useState("");

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Scegli durata (minuti)</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {preset.map((m) => (
            <button key={m} style={styles.buttonSecondary} onClick={() => onChoose(m)}>
              {m}′
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            min="5"
            max="180"
            placeholder="Personalizzata"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            style={styles.buttonPrimary}
            onClick={() => {
              const n = Number(custom);
              if (!n || n < 5) return alert("Inserisci un numero valido (>=5).");
              onChoose(n);
            }}
          >
            OK
          </button>
        </div>
        <div style={{ marginTop: 10, textAlign: "right" }}>
          <button style={styles.buttonTertiary} onClick={onClose}>Annulla</button>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Workout Runner (cronometro)
// ==============================
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
    const m = Math.floor(s / 60).toString().padStart(2, "0");
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
    </div>
  );
}

// ==============================
// Area Personale
// ==============================
function PersonalArea({ user, onSave }) {
  const [form, setForm] = useState(
    user || {
      name: "",
      surname: "",
      email: "",
      height: "",
      weight: "",
      birthdate: "",
      team: "",
      role11: "",
      role5: "",
      preferredDuration: "",
      preferredFrequency: "",
    }
  );

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Dati personali</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Input label="Nome" value={form.name || ""} onChange={(v) => update("name", v)} />
        <Input label="Cognome" value={form.surname || ""} onChange={(v) => update("surname", v)} />
      </div>

      <Input label="Email" type="email" value={form.email || ""} onChange={(v) => update("email", v)} />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Input label="Altezza (cm)" value={form.height || ""} onChange={(v) => update("height", v)} />
        <Input label="Peso (kg)" value={form.weight || ""} onChange={(v) => update("weight", v)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Input label="Data di nascita" type="date" value={form.birthdate || ""} onChange={(v) => update("birthdate", v)} />
        <Input label="Squadra (facoltativa)" value={form.team || ""} onChange={(v) => update("team", v)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Select label="Ruolo calcio a 11 (facoltativo)" value={form.role11 || ""} onChange={(v) => update("role11", v)} options={ROLES_11} />
        <Select label="Ruolo calcio a 5 (facoltativo)" value={form.role5 || ""} onChange={(v) => update("role5", v)} options={ROLES_5} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Input label="Durata preferita (min, facoltativo)" type="number" value={form.preferredDuration || ""} onChange={(v) => update("preferredDuration", v)} />
        <Input label="Frequenza settimanale (n°, facoltativa)" type="number" value={form.preferredFrequency || ""} onChange={(v) => update("preferredFrequency", v)} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          style={styles.buttonPrimary}
          onClick={() => {
            onSave(form);
            alert("Dati salvati!");
          }}
        >
          Salva
        </button>
        <a
          href="mailto:appcalcio1@gmail.com?subject=Feedback%20area%20personale&body=Ciao%2C%20vorrei%20segnalare..."
          style={{ ...styles.buttonTertiary, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
        >
          Invia feedback
        </a>
      </div>

      <div style={{ marginTop: 16, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
        <h4 style={{ margin: "0 0 8px", fontSize: 16 }}>Anteprima dati</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, color: COLORS.muted }}>
          <Info label="Nome" value={form.name} />
          <Info label="Cognome" value={form.surname} />
          <Info label="Email" value={form.email} />
          <Info label="Altezza" value={form.height} />
          <Info label="Peso" value={form.weight} />
          <Info label="Nascita" value={form.birthdate} />
          <Info label="Squadra" value={form.team} />
          <Info label="Ruolo 11" value={form.role11} />
          <Info label="Ruolo 5" value={form.role5} />
          <Info label="Durata pref." value={form.preferredDuration} />
          <Info label="Frequenza pref." value={form.preferredFrequency} />
        </div>
      </div>
    </div>
  );
}

// ==============================
// Footer
// ==============================
function Footer({ onLogout }) {
  return (
    <div style={styles.footer}>
      <button style={styles.buttonTertiary} onClick={onLogout}>Logout</button>
    </div>
  );
}

// ==============================
// Input / Select / Info
// ==============================
function Input({ label, value, onChange, type = "text" }) {
  return (
    <label style={styles.inputGroup}>
      <span style={styles.inputLabel}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={styles.inputGroup}>
      <span style={styles.inputLabel}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
        <option value="">-- Seleziona --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <strong>{label}: </strong>
      <span>{value || "-"}</span>
    </div>
  );
}

// ==============================
// STYLES (inline)
// ==============================
const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  header: {
    backgroundColor: COLORS.brand,
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
  },
  headerLeft: { fontWeight: 600, fontSize: 16 },
  headerRight: { position: "relative" },
  hamburger: {
    background: "transparent",
    border: "none",
    padding: 4,
    cursor: "pointer",
  },
  burgerLine: {
    display: "block",
    width: 20,
    height: 2,
    backgroundColor: "white",
    margin: "3px 0",
  },
  menu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 220,
    zIndex: 10,
  },
  menuItem: {
    display: "block",
    padding: "10px 14px",
    background: "white",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
  },
  menuItemDanger: {
    display: "block",
    padding: "10px 14px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
  },
  menuClose: {
    padding: "6px 14px",
    background: COLORS.brand,
    color: "white",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  inputGroup: { display: "flex", flexDirection: "column", width: "100%" },
  inputLabel: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  input: {
    padding: "8px 10px",
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
    fontSize: 14,
    backgroundColor: "white",
    color: COLORS.text,
  },
  row: { display: "flex", gap: 8 },
  buttonPrimary: {
    backgroundColor: COLORS.text,
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonSecondary: {
    backgroundColor: COLORS.border,
    color: COLORS.text,
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  buttonSecondarySmall: {
    backgroundColor: COLORS.border,
    color: COLORS.text,
    padding: "4px 8px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  buttonTertiary: {
    backgroundColor: "transparent",
    color: COLORS.text,
    padding: "6px 10px",
    border: `1px solid ${COLORS.text}`,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  workoutCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 360,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  tabs: {
    display: "flex",
    marginBottom: 8,
    gap: 6,
  },
  tab: {
    flex: 1,
    padding: "8px 12px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: COLORS.border,
    border: "none",
    borderRadius: 6,
  },
  tabActive: {
    flex: 1,
    padding: "8px 12px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: COLORS.text,
    color: "white",
    border: "none",
    borderRadius: 6,
  },
};
