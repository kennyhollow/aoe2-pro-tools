import cron from 'node-cron';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { civilizations } from '../db/schema';

const client = postgres("postgresql://postgres:password@localhost:5432/aoe2_db");
const db = drizzle(client);

export const setupMetaUpdater = () => {
  cron.schedule('0 3 * * *', async () => {
    console.log('⏳ Actualizando Meta del Age...');
  });
  console.log('⏰ Cron Job programado: El meta se actualizará cada día a las 3 AM');
};