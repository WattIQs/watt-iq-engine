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

    /*
     * =========================================================
     * USUÁRIOS
     *
     * Guarda os dados básicos do perfil.
     *
     * Isso permite que:
     *
     * Google:
     *   email + nome + foto
     *
     * E depois:
     *   login por e-mail
     *
     * recupere o mesmo nome e a mesma foto.
     * =========================================================
     */

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        picture TEXT NOT NULL DEFAULT '',
        email_verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
    `);

    /*
     * =========================================================
     * CONFIGURAÇÕES DO USUÁRIO
     *
     * A preferência fica no PostgreSQL e nunca depende do
     * estado do frontend/localStorage.
     * =========================================================
     */

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id UUID PRIMARY KEY
          REFERENCES users(id)
          ON DELETE CASCADE,
        require_email_verification BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    /*
     * =========================================================
     * CONVERSAS
     * =========================================================
     */

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

    /*
     * =========================================================
     * OTP
     * =========================================================
     */

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

    console.log(
      "Banco WattIQ inicializado com sucesso.",
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Erro ao inicializar banco:",
      error,
    );

    throw error;
  } finally {
    client.release();
  }
}
