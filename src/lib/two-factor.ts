import * as OTPAuth from "otpauth";
import crypto from "crypto";

const APP_NAME = "Builders.to";
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

// Generate a new TOTP secret
export function generateTOTPSecret(userEmail: string | null): {
  secret: string;
  uri: string;
} {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: userEmail || "User",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

// Verify a TOTP token
export function verifyTOTPToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: "User",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // Allow for time drift (window of 1 means +/- 30 seconds)
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

// Generate backup codes
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    // Generate a random code of the specified length
    const code = crypto.randomBytes(BACKUP_CODE_LENGTH / 2).toString("hex").toUpperCase();
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// Hash a backup code for secure storage
export function hashBackupCode(code: string): string {
  // Normalize the code (remove dashes, uppercase)
  const normalizedCode = code.replace(/-/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalizedCode).digest("hex");
}

// Verify a backup code against stored hashes
export function verifyBackupCode(code: string, hashedCodes: string[]): {
  valid: boolean;
  matchedIndex: number;
} {
  const normalizedCode = code.replace(/-/g, "").toUpperCase();
  const hashedInput = crypto.createHash("sha256").update(normalizedCode).digest("hex");

  const matchedIndex = hashedCodes.findIndex((hashed) => hashed === hashedInput);

  return {
    valid: matchedIndex !== -1,
    matchedIndex,
  };
}

// Encrypt the TOTP secret for database storage
export function encryptSecret(secret: string): string {
  const encryptionKey = process.env.TWO_FACTOR_ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length !== 64) {
    // In development, use a fallback key (32 bytes = 64 hex chars)
    console.warn("TWO_FACTOR_ENCRYPTION_KEY not set or invalid length. Using fallback for development.");
  }

  // Use the environment key or a development fallback
  const key = encryptionKey?.length === 64
    ? Buffer.from(encryptionKey, "hex")
    : crypto.scryptSync(process.env.NEXTAUTH_SECRET || "dev-secret", "salt", 32);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return IV + AuthTag + Encrypted data
  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
}

// Decrypt the TOTP secret from database storage
export function decryptSecret(encryptedData: string): string {
  const encryptionKey = process.env.TWO_FACTOR_ENCRYPTION_KEY;

  const key = encryptionKey?.length === 64
    ? Buffer.from(encryptionKey, "hex")
    : crypto.scryptSync(process.env.NEXTAUTH_SECRET || "dev-secret", "salt", 32);

  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
