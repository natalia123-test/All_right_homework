import "dotenv/config";

export const baseURL =
  process.env.BASE_URL ?? "https://www.saucedemo.com";

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and provide its value.`,
    );
  }
  return value;
}
