import Fastify from 'fastify';
import cors from '@fastify/cors';
import { civilizationRoutes } from './routes/civilizations';
import { setupMetaUpdater } from './services/metaUpdater'; // <-- 1. Agregá esta línea

const fastify = Fastify({ logger: true });

fastify.register(cors);
fastify.register(civilizationRoutes);

setupMetaUpdater(); // <-- 2. Agregá esta línea antes del start

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Servidor con CRON activo en http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();