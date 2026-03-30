def build_analysis_prompt(metrics_summary: dict, player_name: str = "Agustín"):
    """
    Construye el prompt estructurado para que el LLM (Claude/GPT) 
    actúe como un coach de AoE2.
    """
    
    SYSTEM_PROMPT = """
    Eres un Coach profesional de Age of Empires II con 2k+ de ELO.
    Tu objetivo es analizar las métricas macro de un jugador y darle un feedback:
    1. Directo y técnico pero motivador.
    2. Enfocado en la producción constante de aldeanos.
    3. Usa jerga del juego (TC, idle, build order, boom).
    """

    USER_CONTENT = f"""
    Analiza el desempeño de {player_name}:
    - Nota obtenida: {metrics_summary['grade']}
    - Tiempo inactivo del TC: {metrics_summary['idle_time']}s ({metrics_summary['idle_pct']}%)
    - Aldeanos producidos: {metrics_summary['produced']}/{metrics_summary['expected']}
    - Veredicto técnico: {metrics_summary['verdict']}

    Instrucciones para el Coach:
    Si la nota es A o S, felicítalo y dale un detalle técnico para perfeccionar.
    Si la nota es B, C o D, sé firme sobre la importancia de no dejar de producir aldeanos.
    Devuelve la respuesta en formato JSON con dos campos: "coach_advice" y "priority_tip".
    """

    return {"system": SYSTEM_PROMPT, "user": USER_CONTENT}