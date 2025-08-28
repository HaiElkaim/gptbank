// In-memory cache for simple rate limiting (per function instance)

const tokenBucket = new Map<string, { tokens: number; lastAccess: number }>();
const BUCKET_CAPACITY = 10;
const REFILL_RATE = 1; // tokens per second

export function consumeToken(ip: string): boolean {
  const now = Date.now();
  if (!tokenBucket.has(ip)) {
    tokenBucket.set(ip, { tokens: BUCKET_CAPACITY, lastAccess: now });
  }

  const bucket = tokenBucket.get(ip)!;
  const timePassed = (now - bucket.lastAccess) / 1000;
  const newTokens = timePassed * REFILL_RATE;

  bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + newTokens);
  bucket.lastAccess = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // Token consumed
  }

  return false; // Rate limit exceeded
}
