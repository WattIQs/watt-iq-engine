import { Pool } from "pg";

const LEGACY_DATABASE_HOST = "dpg-d9uj1aqjobas73auc35g-a";
const databaseUrl = process.env.DATABASE_URL?.trim();

export class DatabaseUnavailableError extends Error {
  code = "DATABASE_UNAVAILABLE";

  constructor() {
    super("Banco de dados temporariamente indisponível.");
    this.name = "DatabaseUnavailableError";
  }
}

function createUnavailablePool(): Pool {
  const unavailable = async () => {
    throw new DatabaseUnavailableError();
  };

  const pool = {
    query: unavailable,
    connect: unavailable,
    end: async () => undefined,
    on: () => pool,
  };

  return pool as unknown as Pool;
}

const hasUsableDatabaseUrl =
  Boolean(databaseUrl) &&
  !databaseUrl?.includes(LEGACY_DATABASE_HOST) &&
  /^postgres(?:ql)?:\/\//i.test(databaseUrl ?? "");

export const db = hasUsableDatabaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 3000,
    })
  : createUnavailablePool();

if (hasUsableDatabaseUrl) {
  db.on("error", (error) => {
    console.error("Erro inesperado no PostgreSQL:", error);
  });
}
