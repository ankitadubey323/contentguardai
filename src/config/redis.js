/**
 * ============================================
 * REDIS.JS — Redis Connection Configuration
 * ============================================
 * 
 * WHY WE NEED REDIS:
 * MongoDB is great for permanent storage, but it's slow (10-50ms per query).
 * Redis is an in-memory database that's 100× faster (<1ms response time).
 * 
 * WHAT REDIS DOES IN CONTENTGUARD AI:
 * 1. Cache AI analysis results (same text analyzed twice = instant response)
 * 2. Store rate limit counters (track how many requests per user)
 * 3. Bull Queue backing store (job queue system in Week 5)
 * 
 * WHEN IT'S USED:
 * - cacheService.js uses this to cache Groq AI results
 * - rateLimiter.js uses this to count requests
 * - queueService.js uses this to store background jobs
 * 
 * REAL WORLD BENEFIT:
 * User analyzes "Hello" → Groq API call (3 seconds, costs money)
 * Same user analyzes "Hello" again → Redis cache hit (0.001 seconds, FREE)
 * Savings: 3000× faster + saves API costs
 */

import Redis from 'ioredis'
import logger from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────
// REDIS CLIENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    
    // Retry strategy — if Redis goes down, keep trying
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)  // Max 2 second delay
        logger.warn(`Redis connection failed, retrying in ${delay}ms...`)
        return delay
    },
    
    // Reconnect on error
    reconnectOnError: (err) => {
        logger.error('Redis reconnect on error:', err.message)
        return true
    },
}

// ─────────────────────────────────────────────────────────────────
// CREATE REDIS CLIENT
// ─────────────────────────────────────────────────────────────────

const redis = new Redis(redisConfig)

// ─────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────

redis.on('connect', () => {
    logger.success('Redis connected successfully')
})

redis.on('ready', () => {
    logger.success(' Redis is ready to accept commands')
})

redis.on('error', (err) => {
    logger.error(' Redis connection error:', err.message)
    
    // In development, it's okay if Redis is not running
    // The app will work without caching (just slower)
    if (process.env.NODE_ENV === 'development') {
        logger.warn('  Running without Redis (caching disabled)')
    }
})

redis.on('close', () => {
    logger.warn(' Redis connection closed')
})

redis.on('reconnecting', () => {
    logger.info('Redis reconnecting...')
})

// ─────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────

process.on('SIGINT', async () => {
    logger.info('Closing Redis connection...')
    await redis.quit()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    logger.info('Closing Redis connection...')
    await redis.quit()
    process.exit(0)
})

// ─────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────

export default redis

/**
 * ═══════════════════════════════════════════════════════════════
 * INSTALLATION INSTRUCTIONS
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. Install Redis locally:
 *    
 *    macOS:
 *    brew install redis
 *    brew services start redis
 *    
 *    Ubuntu/Debian:
 *    sudo apt update
 *    sudo apt install redis-server
 *    sudo systemctl start redis
 *    
 *    Windows:
 *    Download from: https://github.com/microsoftarchive/redis/releases
 *    Or use WSL
 * 
 * 2. Install npm package:
 *    npm install ioredis
 * 
 * 3. Add to .env:
 *    REDIS_HOST=localhost
 *    REDIS_PORT=6379
 *    REDIS_PASSWORD=          (leave empty for local dev)
 * 
 * 4. For production (cloud Redis):
 *    - Redis Cloud (free tier): https://redis.com/try-free/
 *    - Upstash (serverless): https://upstash.com
 *    - Railway Redis: https://railway.app
 * 
 * ═══════════════════════════════════════════════════════════════
 * REDIS DATA TYPES WE'LL USE
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. STRING — Cache analysis results
 *    SET cache:abc123 '{"toxicity":...}'
 *    GET cache:abc123
 * 
 * 2. HASH — Store multiple fields
 *    HSET user:123 name "John" email "john@example.com"
 *    HGET user:123 name
 * 
 * 3. LIST — Queue jobs (Bull uses this)
 *    LPUSH queue:analyze job1
 *    RPOP queue:analyze
 * 
 * 4. SORTED SET — Rate limiting with timestamps
 *    ZADD rate:user123 timestamp1 request1
 *    ZCOUNT rate:user123 -inf +inf
 * 
 * 5. EXPIRE — Auto-delete after TTL
 *    SET cache:abc123 data EX 3600  (expires in 1 hour)
 * 
 * ═══════════════════════════════════════════════════════════════
 */