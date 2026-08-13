import { randomUUID } from "node:crypto";
import { db } from "./db";

export async function createOtpChallenge(
  email: string,
  code: string,
) {
  const challengeId = randomUUID();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  await db.query(
    `
      INSERT INTO otp_challenges (
        id,
        email,
        code,
        expires_at,
        attempts
      )
      VALUES ($1, $2, $3, $4, 0)
    `,
    [
      challengeId,
      email,
      code,
      expiresAt,
    ],
  );

  console.log("OTP CHALLENGE CRIADO:", {
    challengeId,
    expiresAt: expiresAt.toISOString(),
  });

  return challengeId;
}

export async function verifyOtpChallenge(
  challengeId: string,
  code: string,
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<{
      email: string;
      code: string;
      expires_at: Date;
      attempts: number;
    }>(
      `
        SELECT
          email,
          code,
          expires_at,
          attempts
        FROM otp_challenges
        WHERE id = $1
        FOR UPDATE
      `,
      [challengeId],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");

      console.log("OTP NÃO ENCONTRADO:", {
        challengeId,
      });

      return null;
    }

    const entry = result.rows[0];

    if (new Date() > new Date(entry.expires_at)) {
      await client.query(
        `
          DELETE FROM otp_challenges
          WHERE id = $1
        `,
        [challengeId],
      );

      await client.query("COMMIT");

      console.log("OTP EXPIRADO:", {
        challengeId,
        expiresAt: new Date(
          entry.expires_at,
        ).toISOString(),
      });

      return null;
    }

    if (entry.attempts >= 5) {
      await client.query(
        `
          DELETE FROM otp_challenges
          WHERE id = $1
        `,
        [challengeId],
      );

      await client.query("COMMIT");

      console.log("OTP BLOQUEADO POR TENTATIVAS:", {
        challengeId,
      });

      return null;
    }

    if (entry.code !== code) {
      await client.query(
        `
          UPDATE otp_challenges
          SET attempts = attempts + 1
          WHERE id = $1
        `,
        [challengeId],
      );

      await client.query("COMMIT");

      console.log("OTP NÃO CONFERE:", {
        challengeId,
        attemptsBefore: entry.attempts,
        receivedLength: code.length,
        storedLength: entry.code.length,
      });

      return null;
    }

    await client.query(
      `
        DELETE FROM otp_challenges
        WHERE id = $1
      `,
      [challengeId],
    );

    await client.query("COMMIT");

    console.log("OTP VERIFICADO COM SUCESSO:", {
      challengeId,
    });

    return entry.email;
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Erro ao verificar OTP:",
      error,
    );

    throw error;
  } finally {
    client.release();
  }
}