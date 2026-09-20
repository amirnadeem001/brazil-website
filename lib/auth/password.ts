import bcrypt from "bcrypt";

const MIN_PASSWORD_LENGTH = 1;
const MAX_PASSWORD_LENGTH = 72;

/**
 * Dummy bcrypt hash used only when ADMIN_PASSWORD_HASH is missing, so
 * compare() still takes a similar amount of time. This is not a valid
 * admin password.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$12$FsOJKfrrNbnp6VXyFt5NRunjS.KNYxXTX53tXMThLM.XkcbmCrTxm";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  return value.replace(/\\\$/g, "$");
}

function comparePassword(password: string, hash: string): Promise<boolean> {
  const compare =
    typeof bcrypt.compare === "function"
      ? bcrypt.compare.bind(bcrypt)
      : (
          bcrypt as unknown as { default: typeof bcrypt }
        ).default.compare.bind(
          (bcrypt as unknown as { default: typeof bcrypt }).default
        );

  return compare(password, hash);
}

export function isUsablePassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = readEnv("ADMIN_PASSWORD_HASH");
  const targetHash = hash ?? DUMMY_PASSWORD_HASH;

  try {
    const matches = await comparePassword(password, targetHash);
    return Boolean(hash) && matches;
  } catch {
    return false;
  }
}
