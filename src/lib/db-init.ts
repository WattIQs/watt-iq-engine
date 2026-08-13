import { db } from "./db";

export async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id BIGSERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      user_sub TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_user
    ON ai_conversations (user_email, created_at);
  `);

  console.log("Tabela ai_conversations verificada/criada.");
}
