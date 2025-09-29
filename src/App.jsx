import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * =========================================================
 *  App.jsx — versione completa e funzionante (no backend)
 *  - Login / Registrazione con LocalStorage
 *  - Dopo login: se profilo incompleto → Area Personale (edit obbligatorio)
 *                 se completo → Allenamenti (tab per sezione)
 *  - Menu hamburger ≡ (popup) con: Area Personale, Invia feedback
 *  - Area Personale: visualizza + Modifica profilo, feedback
 *  - Stile sportivo verde/bianco
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
   Costanti UI & Dati
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

const WORKOUT_SECTIONS = [
  {
    key: "riscaldamento",
    label: "Riscaldamento",
    items: [
      { id: 1, name: "Corsa leggera 10 minuti", duration: "10 min" },
      { id: 2, name: "Mobilità articolare", duration: "8 min" },
      { id: 3, name: "Esercizi dinamici", duration: "7 min" },
    ],
  },
  {
    key: "tecnica",
    label: "Tecnica",
    items: [
      { id: 11, name: "Conduzione palla a zig-zag", duration: "12 min" },
      { id: 12, name: "Passaggi di prima in coppia", duration: "10 min" },
      { id: 13, name: "Controllo orientato + scarico", duration: "10 min" },
    ],
  },
  {
    key: "resistenza",
    label: "Resistenza",
    items: [
      { id: 21, name: "Intermittente 10x(30\"/30\")", duration: "10 min" },
      { id: 22, name: "Navette 10-20-30", duration: "12 min" },
    ],
  },
  {
    key: "tiro",
    label: "Tiro",
    items: [
      { id: 31, name: "Tiro su scarico dal limite", duration: "12 min" },
      { id: 32, name: "1 contro 1 + conclusione", duration: "10 min" },
    ],
  },
  {
    key: "defaticamento",
    label: "Defaticamento",
    items: [
      { id: 41, name: "Corsa blanda 5 minuti", duration: "5 min" },
      { id: 42, name: "Stretching globale", duration: "8 min" },
    ],
  },
];

/* ==============================
   App
============================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login"); // login | workouts | area
  const [menuOpen, setMenuOpen] = useState(false);

  // Carica utente all'avvio
  useEffect(() => {
    const u = loadUser();
    if (u) {
      setUser(u);
      setScreen(isProfileComplete(u) ? "workouts" : "area");
    }
  }, []);

  // Sincronizza LS quando user cambia
  useEffect(() => {
    if (user) saveUser(user);
  }, [user]);

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
                setScreen("area");
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
                setScreen(isProfileComplete(u) ? "workouts" : "area");
              }}
            />
          </div>
        </>
      )}

      {screen === "workouts" && (
        <>
          <Header title="Allenamenti" />
          <div style={styles.container}>
            <WorkoutsTabs />
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
              onSave={(updated) => {
                setUser(updated);
              }}
            />
            <Footer onLogout={handleLogout} />
          </div>
        </>
      )}
    </div>
  );
}

/* ==============================
   Componenti
============================== */
function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Email e password sono obbligatorie");
      return;
    }

    const existing = loadUser();

    if (isRegister) {
      const newUser = {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        surname: form.surname.trim(),
        // campi profilo
        height: "",
        weight: "",
        birthdate: "",
        role11: "",
        role5: "",
      };
      saveUser(newUser);
      onLogin(newUser);
    } else {
      if (!existing) {
        alert("Nessun utente registrato. Crea un account.");
        return;
      }
      if (
        existing.email === form.email.trim() &&
        existing.password === form.password
      ) {
        onLogin(existing);
      } else {
        alert("Credenziali errate");
      }
    }
  };

  return (
    <div style={styles.authCard}>
      <h2 style={styles.title}>{isRegister ? "Registrazione" : "Accesso"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {isRegister && (
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
        )}
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
        <button type="submit" style={styles.buttonPrimary}>
          {isRegister ? "Crea account" : "Entra"}
        </button>
      </form>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <button style={styles.linkBtn} onClick={() => setIsRegister((v) => !v)}>
          {isRegister ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
        </button>
      </div>
    </div>
  );
}

function PersonalArea({ user, onSave }) {
  const [edit, setEdit] = useState(!isProfileComplete(user)); // se incompleto → edit obbligatorio
  const [form, setForm] = useState(user || {});

  useEffect(() => {
    setForm(user || {});
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.surname ||
      !form.height ||
      !form.weight ||
      !form.birthdate ||
      !form.role11 ||
      !form.role5
    ) {
      alert("Compila tutti i campi del profilo");
      return;
    }
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
          <Info label="Ruolo (Calcio a 11)" value={form.role11} />
          <Info label="Ruolo (Calcio a 5)" value={form.role5} />
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
          <div style={styles.row}>
            <Select
              label="Ruolo Calcio a 11"
              value={form.role11 || ""}
              onChange={(v) => setForm({ ...form, role11: v })}
              options={ROLES_11}
            />
            <Select
              label="Ruolo Calcio a 5"
              value={form.role5 || ""}
              onChange={(v) => setForm({ ...form, role5: v })}
              options={ROLES_5}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.buttonPrimary}>
              Salva
            </button>
            <button
              type="button"
              style={styles.buttonTertiary}
              onClick={() => setEdit(false)}
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="mailto:appcalcio1@gmail.com" style={styles.linkBtnLike}>
          Invia feedback ✉️
        </a>
      </div>
    </div>
  );
}

function WorkoutsTabs() {
  const [active, setActive] = useState(WORKOUT_SECTIONS[0].key);
  const activeSection = useMemo(
    () => WORKOUT_SECTIONS.find((s) => s.key === active),
    [active]
  );

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>📋 Allenamenti</h3>
      <div style={styles.tabsBar}>
        {WORKOUT_SECTIONS.map((s) => (
          <button
            key={s.key}
            style={{
              ...styles.tabBtn,
              ...(active === s.key ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActive(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {activeSection?.items.map((it) => (
          <div key={it.id} style={styles.workoutCard}>
            <div style={{ fontWeight: 600 }}>{it.name}</div>
            <div style={{ color: COLORS.muted, fontSize: 13 }}>{it.duration}</div>
            <button
              style={styles.buttonSecondarySmall}
              onClick={() => alert(`Apri dettaglio: ${it.name}`)}
            >
              Apri
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuPopup({ onClose, onArea, onLogout }) {
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [onClose]);

  return (
    <div ref={ref} style={styles.popup}>
      <button style={styles.popupItem} onClick={onArea}>
        Area Personale
      </button>
      <a
        style={{ ...styles.popupItem, textDecoration: "none" }}
        href="mailto:appcalcio1@gmail.com"
      >
        Invia Feedback
      </a>
      <hr style={{ margin: 0, border: 0, borderTop: `1px solid ${COLORS.border}` }} />
      <button style={styles.popupItem} onClick={onLogout}>
        Esci
      </button>
    </div>
  );
}

/* ==============================
   UI Atomi
============================== */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={styles.input}
      >
        <option value="" disabled>
          Seleziona…
        </option>
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <div style={{ color: COLORS.muted, fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || "-"}</div>
    </div>
  );
}

function Footer({ onLogout }) {
  return (
    <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
      <button style={styles.buttonTertiary} onClick={onLogout}>
        Esci
      </button>
    </div>
  );
}

/* ==============================
   Helpers
============================== */
function isProfileComplete(u) {
  if (!u) return false;
  const required = [
    "name",
    "surname",
    "email",
    "height",
    "weight",
    "birthdate",
    "role11",
    "role5",
  ];
  return required.every((k) => u[k] && String(u[k]).trim() !== "");
}

/* ==============================
   Stili inline (tema sportivo)
============================== */
const styles = {
  app: {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: COLORS.card,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  headerLeft: { fontWeight: 700, color: COLORS.brandDark },
  headerRight: { position: "relative", display: "flex", alignItems: "center", gap: 8 },
  hamburger: {
    width: 40,
    height: 36,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
  },
  burgerLine: { width: 18, height: 2, background: COLORS.text, borderRadius: 2 },

  popup: {
    position: "absolute",
    top: 44,
    right: 0,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    overflow: "hidden",
    minWidth: 220,
  },
  popupItem: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "10px 14px",
    cursor: "pointer",
    color: COLORS.text,
  },

  title: { color: COLORS.brandDark, margin: 0 },
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 16,
  },
  authCard: {
    maxWidth: 420,
    margin: "40px auto",
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 18,
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 13, color: COLORS.muted },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    background: "#fff",
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    background: "#fff",
    border: `1px solid ${COLORS.border}`,
  },

  tabsBar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
  },
  tabBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border}`,
    background: "#fff",
    cursor: "pointer",
  },
  tabBtnActive: {
    background: COLORS.brand,
    color: "#fff",
    borderColor: COLORS.brand,
    fontWeight: 600,
  },
  workoutCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonPrimary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: COLORS.brand,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonSecondarySmall: {
    padding: "6px 10px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonTertiary: {
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: "transparent",
    cursor: "pointer",
  },
  linkBtn: {
    background: "transparent",
    color: COLORS.brand,
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: 600,
  },
  linkBtnLike: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border}`,
    background: "#fff",
    color: COLORS.text,
    textDecoration: "none",
    fontWeight: 600,
  },
};
