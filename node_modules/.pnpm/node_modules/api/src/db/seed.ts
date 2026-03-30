import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { civilizations } from './schema';

const connectionString = "postgresql://postgres:password@localhost:5432/aoe2_db";
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log('--- Cargando civilizaciones ---');
  await db.insert(civilizations).values([
    { name: 'Francos', specialty: 'Caballería', uniqueUnit: 'Lanzador de hachas' },
    { name: 'Godos', specialty: 'Infantería', uniqueUnit: 'Huscarle' },
  ]);
  console.log('--- ¡Datos cargados con éxito! ---');
  process.exit(0);
}

main();