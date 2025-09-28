// --- INIZIO FILE --- (PARTE 1/3)
import { useEffect, useMemo, useState } from "react";

/**
 * Calcio Trainer — versione con video dimostrativi sotto la descrizione
 * Tema: BLU
 * Lingua: Italiano
 */

// 5 esercizi generici (tecnica + resistenza) con video segnaposto
const VIDEO_PLACEHOLDER = "https://www.youtube.com/embed/Ll7J3cPjDmU";

const DRILLS = [
  {
    titolo: "Guida palla veloce",
    descrizione:
      "Guida la palla avanti e indietro in linea retta alla massima velocità controllata. Mantieni tocchi corti.",
    durataMin: 1, // minuti
    focus: ["tecnica", "resistenza"],
    difficolta: 2,
    video: VIDEO_PLACEHOLDER,
  },
  {
    titolo: "Stop + cambio direzione",
    descrizione:
      "Conduci palla, esegui uno stop secco e cambia direzione a 90° o 180°. Alterna piede destro/sinistro.",
    durataMin: 1,
    focus: ["agilità", "tecnica"],
    difficolta: 2,
    video: VIDEO_PLACEHOLDER,
  },
  {
    titolo: "Palleggio tecnico",
    descrizione:
      "Palleggia con entrambi i piedi, cosce e testa. Punta a serie continue mantenendo controllo e ritmo.",
    durataMin: 1,
    focus: ["coordinazione", "tocchi"],
    difficolta: 3,
    video: VIDEO_PLACEHOLDER,
  },
  {
    titolo: "Slalom tra coni (immaginari)",
    descrizione:
      "Immagina 6 coni distanziati 1,5 m. Serpentina stretta mantenendo la palla vicina al piede.",
    durataMin: 1,
    focus: ["dribbling", "controllo"],
    difficolta: 2,
    video: VIDEO_PLACEHOLDER,
  },
  {
    titolo: "Scatti brevi con palla",
    descrizione:
      "5–6 scatti da 10–15 m con palla, rientro al passo. Cura primo controllo e accelerazione.",
    durataMin: 1,
    focus: ["velocità", "resistenza"],
    difficolta: 3,
    video: VIDEO_PLACEHOLDER,
  },
];

// Helpers
const sec = (m) => Math.max(1, Math.round(m * 60));
const formatTime = (s) => {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};
// --- PARTE 2/3 ---
export default function App() {
  // Stato allenamento
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  const totaleEsercizi = DRILLS.length;
  const drill = useMemo(() => DRILLS[current], [current]);

  // Avvia allenamento
  const startWorkout = () => {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setSecondsLeft(sec(DRILLS[0].durataMin));
    setRunning(true);
  };

  // Pausa/continua
  const togglePause = () => setRunning((r) => !r);

  // Prossimo esercizio
  const nextDrill = () => {
    const next = current + 1;
    if (next < DRILLS.length) {
      setCurrent(next);
      setSecondsLeft(sec(DRILLS[next].durataMin));
      setRunning(true);
    } else {
      // Fine allenamento
      setRunning(false);
      setFinished(true);
    }
  };

  // Termina
  const stopWorkout = () => {
    setStarted(false);
    setRunning(false);
    setFinished(false);
    setSecondsLeft(0);
    setCurrent(0);
  };

  // Timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // passa automaticamente al prossimo
          setTimeout(nextDrill, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, current]);

  // Progress bar in secondi rimanenti
  const progress = useMemo(() => {
    const total = sec(drill?.durataMin ?? 1);
    return total ? Math.max(0, Math.min(100, ((total - secondsLeft) / total) * 100)) : 0;
  }, [drill, secondsLeft]);

  // Card esercizio (lista + dettaglio)
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

      <p className="mt-2 text-gray-700">{item.descrizione}</p>

      {/* Player video responsive sotto la descrizione */}
      <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-gray-200">
        <iframe
          src={item.video}
          className="w-full h-full"
          title={`Video: ${item.titolo}`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
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

// --- FINE FILE (PARTE 3/3)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-700">
            Calcio Trainer
          </h1>
          <button
            onClick={started ? stopWorkout : startWorkout}
            className={`px-3 md:px-4 py-2 rounded-xl text-white font-semibold shadow transition
            ${started ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {started ? "Termina" : "Inizia allenamento"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Lista esercizi (prima di iniziare) */}
        {!started && !finished && (
          <section className="space-y-4">
            <p className="text-gray-700">
              Allena tecnica e resistenza a casa con solo il pallone. Seleziona{" "}
              <span className="font-semibold">“Inizia allenamento”</span> per partire.
            </p>
            {DRILLS.map((d, i) => (
              <DrillCard key={i} item={d} index={i} />
            ))}
          </section>
        )}

        {/* Allenamento in corso */}
        {started && !finished && drill && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-blue-700">
                {current + 1}/{totaleEsercizi} • {drill.titolo}
              </h2>
              <span className="text-sm text-gray-600">Durata: {drill.durataMin}′</span>
            </div>

            <DrillCard item={drill} compact />

            {/* Timer + controlli */}
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

              {/* Pallini avanzamento */}
              <div className="mt-3 flex gap-2">
                {DRILLS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i === current ? "bg-blue-700" : "bg-blue-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Fine allenamento */}
        {finished && (
          <section className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-700">
              Allenamento completato! 💪
            </h2>
            <p className="text-gray-700">Ottimo lavoro. Vuoi ripeterlo o tornare alla lista?</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={startWorkout}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
              >
                Ripeti
              </button>
              <button
                onClick={stopWorkout}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200"
              >
                Torna alla lista
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Calcio Trainer — PWA
      </footer>
    </div>
  );
}

