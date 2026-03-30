from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import statistics

# ─── Modelos de datos ───────────────────────────────────

@dataclass
class TcEvent:
    """Representa un evento de producción del Centro Urbano."""
    timestamp_ms: int        # Momento del evento en milisegundos
    event_type: str          # "start_train" | "finish_train" | "idle"
    unit_trained: Optional[str] = None

@dataclass
class MacroMetrics:
    """Resultado del análisis macroeconómico de una partida."""
    tc_idle_time_s: float           # Segundos totales de inactividad
    tc_idle_pct: float             # % del tiempo de juego inactivo
    villagers_produced: int         # Total de aldeanos producidos
    expected_villagers: int         # Aldeanos óptimos al mismo tiempo
    villager_efficiency_pct: float  # (producidos / esperados) * 100
    idle_windows: List[Dict]        # Lista de ventanas de inactividad
    grade: str                      # "S" / "A" / "B" / "C" / "D"
    verdict: str                    # Texto explicativo

# ─── Analizador principal ───────────────────────────────

class MacroAnalyzer:
    """
    Analiza el archivo JSON de una partida de AoE2:DE
    y calcula métricas macroeconómicas clave.
    """

    # Tiempo de entrenamiento base de un aldeano (seg)
    VILLAGER_TRAIN_TIME: int = 25

    # Umbral de idle time "aceptable" en % del tiempo de juego
    IDLE_THRESHOLDS = {
        "S": 2,   # <2% — Pro level
        "A": 8,   # 2-8% — Sólido
        "B": 18,  # 8-18% — Promedio
        "C": 30,  # 18-30% — Mejorable
    }               # >30% — D (necesita trabajo)

    def analyze(self, match_data: Dict[str, Any]) -> MacroMetrics:
        """
        Punto de entrada principal.
        match_data: JSON de la partida con campos estándar de aoe2.net
        """
        duration_s   = match_data["duration_s"]
        tc_events    = self._parse_tc_events(match_data)
        idle_windows = self._find_idle_windows(tc_events, duration_s)
        total_idle_s = sum(w["duration_s"] for w in idle_windows)
        idle_pct     = (total_idle_s / duration_s) * 100 if duration_s > 0 else 0

        produced     = len([e for e in tc_events if e.event_type == "finish_train"])
        expected     = max(1, int(duration_s / self.VILLAGER_TRAIN_TIME))
        efficiency   = min(100.0, (produced / expected) * 100)

        grade   = self._grade(idle_pct)
        verdict = self._verdict(idle_pct, idle_windows, produced)

        return MacroMetrics(
            tc_idle_time_s=round(total_idle_s, 1),
            tc_idle_pct=round(idle_pct, 2),
            villagers_produced=produced,
            expected_villagers=expected,
            villager_efficiency_pct=round(efficiency, 1),
            idle_windows=idle_windows,
            grade=grade,
            verdict=verdict
        )

    def _parse_tc_events(self, data: Dict) -> List[TcEvent]:
        """Extrae y ordena los eventos del TC desde el JSON de la partida."""
        events = []
        raw_actions = data.get("tc_actions", [])

        for action in raw_actions:
            events.append(TcEvent(
                timestamp_ms = action["timestamp_ms"],
                event_type   = action["type"],
                unit_trained = action.get("unit")
            ))

        return sorted(events, key=lambda e: e.timestamp_ms)

    def _find_idle_windows(
        self, events: List[TcEvent], duration_s: int
    ) -> List[Dict]:
        """
        Detecta ventanas de inactividad entre eventos de entrenamiento.
        Una ventana de idle ocurre cuando el gap entre 'finish_train'
        y el siguiente 'start_train' supera los 3 segundos.
        """
        IDLE_THRESHOLD_S = 3  # ignorar gaps menores a 3s
        windows = []

        finish_events = [
            e for e in events
            if e.event_type in ("finish_train", "idle")
        ]

        for i, evt in enumerate(finish_events[:-1]):
            next_evt  = finish_events[i + 1]
            gap_s     = (next_evt.timestamp_ms - evt.timestamp_ms) / 1000

            if gap_s > IDLE_THRESHOLD_S:
                start_s = evt.timestamp_ms / 1000
                windows.append({
                    "start_s"   : round(start_s, 1),
                    "end_s"     : round(start_s + gap_s, 1),
                    "duration_s": round(gap_s, 1),
                    "severity"  : "critical" if gap_s > 60 else
                                   "high"     if gap_s > 30 else "medium"
                })

        return windows

    def _grade(self, idle_pct: float) -> str:
        for grade, threshold in self.IDLE_THRESHOLDS.items():
            if idle_pct <= threshold:
                return grade
        return "D"

    def _verdict(self, idle_pct, windows, produced) -> str:
        worst = max(windows, key=lambda w: w["duration_s"], default=None)
        if idle_pct <= 2:
            return f"Excelente control del TC. Solo {idle_pct:.1f}% idle."
        elif idle_pct <= 8:
            return f"Buen flujo de producción ({idle_pct:.1f}% idle). Pequeñas mejoras posibles."
        elif worst:
            return (
                f"TC inactivo {idle_pct:.1f}% del tiempo. Tu peor pausa fue de "
                f"{worst['duration_s']:.0f}s a los {worst['start_s']:.0f}s de partida. "
                f"Revisa tu manejo de recursos en ese momento."
            )
        return f"TC inactivo {idle_pct:.1f}% — trabajá en mantener producción continua."


# ─── Uso / test rápido ──────────────────────────────────

if __name__ == "__main__":
    # Simulación de JSON de partida
    sample_match = {
        "duration_s": 1800,  # 30 minutos
        "tc_actions": [
            {"timestamp_ms": 25000,  "type": "finish_train", "unit": "villager"},
            {"timestamp_ms": 25200,  "type": "start_train",  "unit": "villager"},
            {"timestamp_ms": 50000,  "type": "finish_train", "unit": "villager"},
            # Gap de 90s — idle crítico!
            {"timestamp_ms": 140000, "type": "start_train",  "unit": "villager"},
            {"timestamp_ms": 165000, "type": "finish_train", "unit": "villager"},
        ]
    }

    analyzer = MacroAnalyzer()
    result   = analyzer.analyze(sample_match)

    print(f"Grade: {result.grade}")
    print(f"Idle total: {result.tc_idle_time_s}s ({result.tc_idle_pct}%)")
    print(f"Aldeanos: {result.villagers_produced}/{result.expected_villagers}")
    print(f"Veredicto: {result.verdict}")
    print(f"Ventanas idle: {result.idle_windows}")
