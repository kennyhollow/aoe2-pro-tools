import { FastifyInstance } from 'fastify';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { civilizations } from '../db/schema';

const client = postgres("postgresql://postgres:password@localhost:5432/aoe2_db");
const db = drizzle(client);

export async function civilizationRoutes(fastify: FastifyInstance) {
  fastify.get('/civs', async () => {
    return await db.select().from(civilizations);
  });
}