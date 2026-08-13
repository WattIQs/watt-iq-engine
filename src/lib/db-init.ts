import { db } from "./db";

let initialized = false;

export async function initDatabase() {
  if (initialized) {
    return;
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id UUID NOT NULL
          REFERENCES ai_conversations(id)
          ON DELETE CASCADE,
        role TEXT NOT NULL
          CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_conversations_user
      ON ai_conversations(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
      ON ai_messages(conversation_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_messages_created
      ON ai_messages(conversation_id, created_at);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_challenges (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires
      ON otp_challenges(expires_at);
    `);

    await client.query("COMMIT");

    initialized = true;

    console.log("Banco WattIQ inicializado com sucesso.");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao inicializar banco:", error);

    throw error;
  } finally {
    client.release();
  }
}