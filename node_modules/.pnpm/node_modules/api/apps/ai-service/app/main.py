from fastapi import FastAPI
from app.analyzers.macro_analyzer import MacroAnalyzer
from app.llm.prompt_builder import analyze_match_with_llm

app = FastAPI()

@app.post("/analyze")
async def analyze_match(match_data: dict):
    # 1. Analiza los números
    macro_results = MacroAnalyzer.analyze(match_data)
    
    # 2. Pide consejo a la IA
    ai_advice = analyze_match_with_llm(macro_results)
    
    return {
        "status": "success",
        "analysis": macro_results,
        "coach_advice": ai_advice
    }

@app.get("/")
def read_root():
    return {"message": "Servicio de IA de AoE2 activo"}