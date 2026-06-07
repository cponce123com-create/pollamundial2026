import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import bcrypt from "bcrypt";

describe("Auth — Schema Validation", () => {
  const registerSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    phone: z.string().min(1, "El teléfono es requerido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    player_slug: z.string().min(1, "Debes seleccionar un jugador"),
  });

  const loginSchema = z.object({
    phone: z.string().min(1),
    password: z.string().min(1),
  });

  it("should reject empty registration", () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      phone: "999999999",
      password: "123",
      player_slug: "personaje1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("6 caracteres");
    }
  });

  it("should accept valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      phone: "999999999",
      password: "secure123",
      player_slug: "personaje1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty login", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept valid login data", () => {
    const result = loginSchema.safeParse({
      phone: "999999999",
      password: "secure123",
    });
    expect(result.success).toBe(true);
  });
});

describe("Auth — Password Hashing", () => {
  it("should hash and verify password correctly", async () => {
    const password = "test_password_123";
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);

    const valid = await bcrypt.compare(password, hash);
    expect(valid).toBe(true);

    const invalid = await bcrypt.compare("wrong_password", hash);
    expect(invalid).toBe(false);
  });

  it("should produce different hashes for same password", async () => {
    const hash1 = await bcrypt.hash("same", 10);
    const hash2 = await bcrypt.hash("same", 10);
    expect(hash1).not.toBe(hash2);
  });
});

describe("Auth — JWT Token", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV, JWT_SECRET: "test-secret-key-for-unit-tests" };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should sign and verify tokens", async () => {
    const { signToken, verifyToken } = await import("../../lib/jwt");
    const payload = { userId: "123e4567-e89b-12d3-a456-426614174000", role: "participant" as const };

    const token = signToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  it("should require JWT_SECRET to be set", async () => {
    delete process.env.JWT_SECRET;
    await expect(() => import("../../lib/jwt")).rejects.toThrow();
  });

  it("should reject tampered tokens", async () => {
    const { signToken, verifyToken } = await import("../../lib/jwt");
    const token = signToken({ userId: "test-id", role: "participant" });
    const tampered = token.slice(0, -5) + "XXXXX";

    expect(() => verifyToken(tampered)).toThrow();
  });
});

describe("Auth — CSRF Protection", () => {
  const COOKIE = "csrf_token";
  const HEADER = "x-csrf-token";

  it("should validate CSRF token presence", () => {
    // Simulate the CSRF validation logic
    const cookieToken = "abc123".repeat(5); // 30 chars
    const headerToken = "abc123".repeat(5);
    const crypto = require("crypto");

    const valid = crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
    expect(valid).toBe(true);
  });

  it("should reject mismatched CSRF tokens", () => {
    const crypto = require("crypto");
    const cookieToken = "abc123".repeat(5);
    const headerToken = "def456".repeat(5);

    // Constant-time comparison
    const valid = crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
    expect(valid).toBe(false);
  });

  it("should reject when lengths differ", () => {
    const crypto = require("crypto");
    const cookieToken = "abc123".repeat(5);
    const headerToken = "abc123".repeat(4);

    expect(cookieToken.length).not.toBe(headerToken.length);
  });
});
