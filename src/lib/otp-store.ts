type OtpEntry = {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

const otpStore = new Map<string, OtpEntry>();

export function createOtpChallenge(
  email: string,
  code: string,
): string {
  const challengeId = crypto.randomUUID();

  otpStore.set(challengeId, {
    email,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  return challengeId;
}

export function verifyOtpChallenge(
  challengeId: string,
  code: string,
): string | null {
  const entry = otpStore.get(challengeId);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(challengeId);
    return null;
  }

  if (entry.attempts >= 5) {
    otpStore.delete(challengeId);
    return null;
  }

  entry.attempts += 1;

  if (entry.code !== code) {
    return null;
  }

  otpStore.delete(challengeId);

  return entry.email;
}
