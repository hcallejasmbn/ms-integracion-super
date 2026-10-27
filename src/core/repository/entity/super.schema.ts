import { pgSchema } from "drizzle-orm/pg-core";

// Todas las tablas del sistema viven en el esquema "super" de PostgreSQL
export const superSchema = pgSchema("super");
