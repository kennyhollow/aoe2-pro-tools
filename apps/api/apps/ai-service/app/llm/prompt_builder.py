def analyze_match_with_llm(macro_data):
    prompt = f"Analizá esta partida de AoE2. El jugador tuvo estos resultados: {macro_data}. Dame un consejo corto y agresivo como un coach pro."
    # Aquí es donde luego conectarás con la API Key de Anthropic
    return f"IA Coach: {prompt}"