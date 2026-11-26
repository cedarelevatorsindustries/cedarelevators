import { Redis } from '@upstash/redis'

const hasEnvCredentials = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
)

let redisUnavailableUntil = 0

export const redis: Redis | null = hasEnvCredentials
  ? new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)!,
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)!,
      retry: false,
    })
  : null

export function isRedisCircuitOpen(): boolean {
  return Date.now() < redisUnavailableUntil
}

export function tripRedisCircuit(cooldownMs: number = 5 * 60 * 1000): void {
  redisUnavailableUntil = Date.now() + cooldownMs
}

export function getRedisClient(): Redis {
  return Redis.fromEnv({ retry: false })
}
