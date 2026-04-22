function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const API_URL = requireEnv("API_URL", "http://localhost:8000");
