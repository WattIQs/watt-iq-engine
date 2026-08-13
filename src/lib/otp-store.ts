import { randomUUID } from "node:crypto";
import { db } from "./db";

export async function createOtpChallenge(
  email: string,
  code: string,
): Promise<string> {
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

  return challengeId;
}

export async function verifyOtpChallenge(
  challengeId: string,
  code: string,
): Promise<string | null> {
  if (!challengeId) {
    return null;
  }

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
      return null;
    }

    const entry = result.rows[0];

    if (
      !entry ||
      new Date() > new Date(entry.expires_at)
    ) {
      await client.query(
        `
          DELETE FROM otp_challenges
          WHERE id = $1
        `,
        [challengeId],
      );

      await client.query("COMMIT");

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

    return entry.email;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}