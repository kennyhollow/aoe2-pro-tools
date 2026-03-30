class MacroAnalyzer:
    @staticmethod
    def analyze(data):
        # Lógica básica para detectar si te faltaron aldeanos
        idle_time = data.get("idle_tc_time", 0)
        status = "Bueno" if idle_time < 30 else "Crítico"
        return {
            "aspecto": "Producción de Aldeanos",
            "puntuacion": status,
            "detalle": f"Tuviste {idle_time}s de tiempo inactivo en el TC."
        }