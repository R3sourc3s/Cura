import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request for a new key", () => {
    const result = checkRateLimit(`key-${Math.random()}`);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("decrements remaining on each request within the window", () => {
    const key = `key-${Math.random()}`;
    checkRateLimit(key);
    const second = checkRateLimit(key);
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(28);
  });

  it("blocks once the limit is exhausted", () => {
    const key = `key-${Math.random()}`;
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(key).ok).toBe(true);
    }
    const blocked = checkRateLimit(key);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    const key = `key-${Math.random()}`;
    for (let i = 0; i < 30; i++) checkRateLimit(key);
    expect(checkRateLimit(key).ok).toBe(false);

    vi.advanceTimersByTime(60 * 60 * 1000 + 1);

    const afterReset = checkRateLimit(key);
    expect(afterReset.ok).toBe(true);
    expect(afterReset.remaining).toBe(29);
  });

  it("tracks separate keys independently", () => {
    const keyA = `key-a-${Math.random()}`;
    const keyB = `key-b-${Math.random()}`;
    for (let i = 0; i < 30; i++) checkRateLimit(keyA);
    expect(checkRateLimit(keyA).ok).toBe(false);
    expect(checkRateLimit(keyB).ok).toBe(true);
  });
});
