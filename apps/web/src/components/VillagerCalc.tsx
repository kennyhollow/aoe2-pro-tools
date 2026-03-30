// ─── Tipos ─────────────────────────────────────────────

interface UnitCost {
  food  : number
  wood  : number
  gold  : number
  stone : number
}

interface GatherRates {
  /** Recursos por aldean@ por segundo (base, sin upgrades) */
  food  : number   // ~0.31 en farms
  wood  : number   // ~0.39
  gold  : number   // ~0.30
  stone : number   // ~0.28
}

interface ProductionConfig {
  unitCost       : UnitCost
  trainTimeSec   : number    // Tiempo de entrenamiento base
  barracksCount  : number    // Cuántos edificios de producción
  gatherRates    : GatherRates
  alsoMakeVills  : boolean   // ¿Seguir haciendo aldeanos también?
  villTrainSec   : number    // Tiempo de aldeano (base 25s)
}

interface VillagerDistribution {
  food    : number
  wood    : number
  gold    : number
  stone   : number
  total   : number
  unitsPerMin : number
  villsPerMin : number
  notes   : string[]
}

// ─── Tasas de recolección predefinidas ─────────────────

const BASE_GATHER_RATES: GatherRates = {
  food: 0.31, wood: 0.39, gold: 0.30, stone: 0.28
}

/** Bonificadores por civilización (multiplicadores sobre base) */
const CIV_BONUSES: Record<string, Partial<GatherRates>> = {
  franks    : { food: 1.15 },          // +15% food mills
  mayans    : { food: 1.10, gold: 1.0 },// -15% cost resources
  chinese   : { food: 1.05, wood: 1.05 },
  vietnamese: { wood: 1.15 },
  incas     : { stone: 1.20 },
}

// ─── Calculadora principal ──────────────────────────────

export function calcVillagerDistribution(
  config: ProductionConfig,
  civSlug: string = "generic"
): VillagerDistribution {

  // 1. Aplicar bonos de civilización
  const civBonus = CIV_BONUSES[civSlug] ?? {}
  const rates: GatherRates = {
    food : config.gatherRates.food  * (civBonus.food  ?? 1),
    wood : config.gatherRates.wood  * (civBonus.wood  ?? 1),
    gold : config.gatherRates.gold  * (civBonus.gold  ?? 1),
    stone: config.gatherRates.stone * (civBonus.stone ?? 1),
  }

  // 2. Unidades producidas por minuto (todos los edificios)
  const unitsPerMin = (config.barracksCount * 60) / config.trainTimeSec

  // 3. Recurso necesario por minuto para sostener esa producción
  const demandPerMin = {
    food : config.unitCost.food  * unitsPerMin,
    wood : config.unitCost.wood  * unitsPerMin,
    gold : config.unitCost.gold  * unitsPerMin,
    stone: config.unitCost.stone * unitsPerMin,
  }

  // 4. Aldeanos necesarios = demanda_por_min / (tasa * 60)
  const villsForUnit = {
    food : demandPerMin.food  / (rates.food  * 60),
    wood : demandPerMin.wood  / (rates.wood  * 60),
    gold : demandPerMin.gold  / (rates.gold  * 60),
    stone: demandPerMin.stone / (rates.stone * 60),
  }

  // 5. Aldeanos extra si también producimos aldeanos (1 TC)
  const villsPerMin = config.alsoMakeVills
    ? 60 / config.villTrainSec
    : 0

  const extraFood = config.alsoMakeVills
    ? ((50 * villsPerMin) / (rates.food * 60))  // aldeano cuesta 50 food
    : 0

  // 6. Totales redondeados hacia arriba
  const ceil = Math.ceil
  const dist = {
    food : ceil(villsForUnit.food  + extraFood),
    wood : ceil(villsForUnit.wood),
    gold : ceil(villsForUnit.gold),
    stone: ceil(villsForUnit.stone),
  }

  const total = dist.food + dist.wood + dist.gold + dist.stone

  // 7. Notas de optimización
  const notes: string[] = []
  if (civBonus.food)  notes.push(`Bonus food ×${civBonus.food} aplicado`)
  if (dist.gold > 15) notes.push("Alto costo en oro — considerá reliquias")
  if (total > 80)    notes.push("Distribución para late game (80+ pop)")

  return { ...dist, total, unitsPerMin: round2(unitsPerMin),
                           villsPerMin: round2(villsPerMin), notes }
}

const round2 = (n: number) => Math.round(n * 100) / 100

// ─── Ejemplo: Caballeros con Francos ────────────────────

const frankKnightsConfig: ProductionConfig = {
  unitCost      : { food: 60, wood: 0, gold: 75, stone: 0 },
  trainTimeSec  : 30,          // caballero base
  barracksCount : 3,           // 3 establos
  gatherRates   : BASE_GATHER_RATES,
  alsoMakeVills : true,
  villTrainSec  : 25,
}

const result = calcVillagerDistribution(frankKnightsConfig, "franks")

console.log("═══ Francos — 3 Establos + TC activo ═══")
console.log(`Food:  ${result.food} aldeanos`)
console.log(`Wood:  ${result.wood} aldeanos`)
console.log(`Gold:  ${result.gold} aldeanos`)
console.log(`TOTAL: ${result.total} aldeanos`)
console.log(`Caballeros/min: ${result.unitsPerMin}`)
console.log(`Notas: ${result.notes.join(" | ")}`)
