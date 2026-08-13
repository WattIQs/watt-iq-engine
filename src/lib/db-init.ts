import { db } from "./db";

export async function initDatabase() {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE INDEX IF NOT EXISTS idx_ai_conversations_user
      ON ai_conversations(user_id);

    CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
      ON ai_messages(conversation_id);

    CREATE INDEX IF NOT EXISTS idx_ai_messages_created
      ON ai_messages(conversation_id, created_at);
  `);

  console.log("Banco WattIQ inicializado.");
}
