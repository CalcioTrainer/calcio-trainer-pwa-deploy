import React, { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login"); // login | home | profile | percorso | allenati

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setScreen("home");
    }
  }, []);

  const LoginRegister = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ name: "", surname: "", email: "", password: "" });

    const handleSubmit = () => {
      if (isRegister) {
        localStorage.setItem("user", JSON.stringify({ ...form, goals: { weight: "70→65", goals: "10/5", assists: "7/2" } }));
        setUser({ ...form, goals: { weight: "70→65", goals: "10/5", assists: "7/2" } });
        setScreen("home");
      } else {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u.email === form.email && u.password === form.password) {
            setUser(u);
            setScreen("home");
          } else alert("Credenziali errate");
        } else alert("Nessun utente registrato");
      }
    };

    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{isRegister ? "Registrati" : "Accedi"}</h2>
        {isRegister && (
          <>
            <input style={styles.input} placeholder="Nome" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input style={styles.input} placeholder="Cognome" onChange={(e) => setForm({ ...form, surname: e.target.value })} />
          </>
        )}
        <input style={styles.input} placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button style={styles.button} onClick={handleSubmit}>{isRegister ? "Registrati" : "Accedi"}</button>
        <p style={styles.link} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
        </p>
      </div>
    );
  };

  const Home = () => (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Benvenuto {user.name} {user.surname}!</h2>
      <button style={styles.button} onClick={() => setScreen("percorso")}>Percorso di oggi</button>
      <button style={styles.button} onClick={() => setScreen("allenati")}>Allenati</button>
      <button style={styles.secondaryButton} onClick={() => setScreen("profile")}>Area Personale</button>
    </div>
  );

  const Profile = () => (
    <div style={styles.container}>
      <h2 style={styles.title}>👤 Area Personale</h2>
      <p><b>Nome:</b> {user.name}</p>
      <p><b>Cognome:</b> {user.surname}</p>
      <p><b>Email:</b> {user.email}</p>
      <h3 style={styles.sectionTitle}>🎯 Obiettivi</h3>
      <p>Peso: {user.goals.weight}</p>
      <p>Gol: {user.goals.goals}</p>
      <p>Assist: {user.goals.assists}</p>
      <button style={styles.button} onClick={() => alert("Funzione Modifica dati")}>Modifica dati</button>
      <button style={styles.button} onClick={() => alert("Funzione Cambia obiettivi")}>Cambia obiettivi</button>
      <button style={styles.secondaryButton} onClick={() => setScreen("home")}>⬅️ Torna</button>
    </div>
  );

  const Placeholder = ({ title }) => (
    <div style={styles.container}>
      <h2 style={styles.title}>{title}</h2>
      <p>Questa schermata è un placeholder e sarà implementata.</p>
      <button style={styles.secondaryButton} onClick={() => setScreen("home")}>⬅️ Torna</button>
    </div>
  );

  return (
    <>
      {screen === "login" && <LoginRegister />}
      {screen === "home" && <Home />}
      {screen === "profile" && <Profile />}
      {screen === "percorso" && <Placeholder title="📅 Percorso di oggi" />}
      {screen === "allenati" && <Placeholder title="💪 Allenati" />}
    </>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 15, padding: 30, alignItems: "center", background: "#f8fdf8", minHeight: "100vh" },
  title: { color: "#1b6e1f", fontSize: 24, fontWeight: "bold" },
  sectionTitle: { color: "#1b6e1f", fontSize: 20, marginTop: 15 },
  input: { padding: 10, borderRadius: 5, border: "1px solid #ccc", width: 250 },
  button: { padding: "10px 20px", background: "#25a244", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", transition: "0.2s" },
  secondaryButton: { padding: "10px 20px", background: "#e0e0e0", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  link: { color: "#25a244", cursor: "pointer" },
};

export default App;
