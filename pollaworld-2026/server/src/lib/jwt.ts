import jwt from "jsonwebtoken";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Variable de entorno ${key} no definida. ` +
      "Configúrala en .env con una clave segura (ej: openssl rand -hex 64)"
    );
  }
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");

export interface JwtPayload {
  userId: string;
  role: "participant" | "admin";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
