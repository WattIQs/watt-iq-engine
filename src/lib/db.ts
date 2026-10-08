import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não configurada.");
}

export const db = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 3000,
});

db.on("error", (error) => {
  console.error("Erro inesperado no PostgreSQL:", error);
});
