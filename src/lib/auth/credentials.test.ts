import assert from "node:assert/strict";
import test from "node:test";
import { loginInputSchema } from "./credentials";

test("login accepts only a normalized email and password", () => {
  const result = loginInputSchema.parse({
    email: "  IA@SATMA.MX ",
    password: "a unique password",
  });
  assert.deepEqual(result, {
    email: "ia@satma.mx",
    password: "a unique password",
  });
});

test("login rejects missing or malformed credentials", () => {
  assert.equal(loginInputSchema.safeParse({ email: "invalid", password: "x" }).success, false);
  assert.equal(loginInputSchema.safeParse({ email: "ia@satma.mx" }).success, false);
  assert.equal(loginInputSchema.safeParse({ password: "x" }).success, false);
});

test("login rejects obsolete security-code fields", () => {
  const result = loginInputSchema.safeParse({
    email: "ia@satma.mx",
    password: "a unique password",
    code: "123456",
  });
  assert.equal(result.success, false);
});
