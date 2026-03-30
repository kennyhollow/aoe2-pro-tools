import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

// Tabla de Civilizaciones
export const civilizations = pgTable('civilizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  specialty: text('specialty'),
  uniqueUnit: text('unique_unit')
});

// Tabla de Unidades
export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  costFood: integer('cost_food'),
  type: text('type')
});