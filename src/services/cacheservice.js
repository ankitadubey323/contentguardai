/**
 * ============================================
 * CACHE SERVICE — Redis Caching Layer
 * ============================================
 * 
 * WHY WE NEED CACHING:
 * Groq AI costs money and takes 2-4 seconds per request.
 * If 1000 users analyze the same text "Hello", that's:
 * - Without cache: 1000 API calls × 3 seconds = 50 minutes + $1000
 * - With cache: 1 API call + 999 cache hits = 3 seconds + $1
 * 
 * WHAT THIS FILE DOES:
 * Wraps Redis operations with a simple interface:
 * - get(key) — retrieve cached data
 * - set(key, value, ttl) — store data with expiration
 * - delete(key) — remove from cache
 * - exists(key) — check if cached
 * 
 * HOW IT'S USED IN CONTENTGUARD:
 * analysisService checks cache before calling Groq AI:
 *   const cacheKey = hashText(text)
 *   const cached = await cacheService.get(cacheKey)
 *   if (cached) return cached  // ← instant response!
 *   
 *   const result = await groqService.analyze(text)  // ← slow AI call
 *   await cacheService.set(cacheKey, result, 3600)  // ← save for next time
 * 
 * REAL WORLD SCENARIO:
 * Social media platform with 10,000 comments saying "lol"
 * First "lol" → Groq API (3 seconds)
 * Next 9,999 "lol" → Redis cache (0.001 seconds each)
 * Total time saved: 29,997 seconds (8.3 hours!)
 */

import redis from '../config/redis.js'
import logger from '../utils/logger.js'
import { CACHE } from '../config/constants.js'

// ─────────────────────────────────────────────────────────────────
// CACHE SERVICE
// ─────────────────────────────────────────────────────────────────

class CacheService {
    constructor() {
        this.redis = redis
        this.prefix = CACHE.PREFIX || 'contentguard:'
        this.defaultTTL = CACHE.TTL || 3600  // 1 hour
        this.enabled = CACHE.ENABLED !== false
    }

    /**
     * Build full cache key with prefix
     * Example: buildKey('analysis', 'abc123') → 'contentguard:analysis:abc123'
     */
    buildKey(namespace, key) {
        return `${this.prefix}${namespace}:${key}`
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * GET — Retrieve cached data
     * ═══════════════════════════════════════════════════════════════
     * 
     * @param {string} key - Cache key
     * @returns {Promise<any|null>} - Parsed JSON data or null
     * 
     * Example:
     *   const result = await cacheService.get('analysis:abc123')
     *   if (result) {
     *     logger.info('Cache HIT!')
     *     return result
     *   }
     *   logger.info('Cache MISS — calling Groq AI')
     */
    async get(key) {
        if (!this.enabled) return null

        try {
            const data = await this.redis.get(key)
            
            if (!data) {
                logger.debug(`Cache MISS → ${key}`)
                return null
            }

            logger.debug(`Cache HIT → ${key}`)
            
            // Parse JSON back to object
            return JSON.parse(data)

        } catch (error) {
            logger.error('Cache GET error:', error.message)
            return null  // Fail gracefully — don't crash app
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * SET — Store data in cache
     * ═══════════════════════════════════════════════════════════════
     * 
     * @param {string} key - Cache key
     * @param {any} value - Data to cache (will be JSON stringified)
     * @param {number} ttl - Time to live in seconds (default: 3600)
     * @returns {Promise<boolean>} - Success status
     * 
     * Example:
     *   const aiResult = await groqService.analyze(text)
     *   await cacheService.set('analysis:abc123', aiResult, 3600)
     */
    async set(key, value, ttl = this.defaultTTL) {
        if (!this.enabled) return false

        try {
            // Convert object to JSON string
            const data = JSON.stringify(value)
            
            // Store with expiration
            await this.redis.setex(key, ttl, data)
            
            logger.debug(`Cache SET → ${key} (TTL: ${ttl}s)`)
            return true

        } catch (error) {
            logger.error('Cache SET error:', error.message)
            return false
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * DELETE — Remove from cache
     * ═══════════════════════════════════════════════════════════════
     * 
     * Use when content is updated or deleted
     */
    async delete(key) {
        if (!this.enabled) return false

        try {
            await this.redis.del(key)
            logger.debug(`Cache DELETE → ${key}`)
            return true

        } catch (error) {
            logger.error('Cache DELETE error:', error.message)
            return false
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * DELETE MANY — Remove multiple keys matching pattern
     * ═══════════════════════════════════════════════════════════════
     * 
     * Example: deleteMany('analysis:*') — deletes all analysis caches
     */
    async deleteMany(pattern) {
        if (!this.enabled) return 0

        try {
            const keys = await this.redis.keys(pattern)
            
            if (keys.length === 0) {
                return 0
            }

            await this.redis.del(...keys)
            logger.debug(`Cache DELETE MANY → ${keys.length} keys deleted`)
            return keys.length

        } catch (error) {
            logger.error('Cache DELETE MANY error:', error.message)
            return 0
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * EXISTS — Check if key exists in cache
     * ═══════════════════════════════════════════════════════════════
     */
    async exists(key) {
        if (!this.enabled) return false

        try {
            const exists = await this.redis.exists(key)
            return exists === 1

        } catch (error) {
            logger.error('Cache EXISTS error:', error.message)
            return false
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * GET TTL — Get remaining time to live
     * ═══════════════════════════════════════════════════════════════
     */
    async getTTL(key) {
        if (!this.enabled) return -1

        try {
            return await this.redis.ttl(key)
        } catch (error) {
            logger.error('Cache GET TTL error:', error.message)
            return -1
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * FLUSH ALL — Clear entire cache (use carefully!)
     * ═══════════════════════════════════════════════════════════════
     */
    async flushAll() {
        if (!this.enabled) return false

        try {
            await this.redis.flushall()
            logger.warn(' Cache FLUSHED — all data deleted')
            return true

        } catch (error) {
            logger.error('Cache FLUSH error:', error.message)
            return false
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * GET STATS — Cache statistics
     * ═══════════════════════════════════════════════════════════════
     */
    async getStats() {
        if (!this.enabled) {
            return { enabled: false }
        }

        try {
            const info = await this.redis.info('stats')
            const keyspace = await this.redis.info('keyspace')
            
            return {
                enabled: true,
                info,
                keyspace,
            }

        } catch (error) {
            logger.error('Cache STATS error:', error.message)
            return { enabled: true, error: error.message }
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

const cacheService = new CacheService()

export default cacheService

/**
 * ═══════════════════════════════════════════════════════════════
 * USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════
 * 
 * // In analysisService.js
 * import cacheService from './cacheService.js'
 * import { hashText } from '../utils/helpers.js'
 * 
 * async function analyzeWithCache(text) {
 *   // Create unique cache key from text
 *   const cacheKey = cacheService.buildKey('analysis', hashText(text))
 *   
 *   // Try to get from cache
 *   const cached = await cacheService.get(cacheKey)
 *   if (cached) {
 *     logger.info('Cache HIT — returning instantly')
 *     return cached
 *   }
 *   
 *   // Cache MISS — call Groq AI
 *   logger.info('Cache MISS — calling Groq AI')
 *   const result = await groqService.analyzeContent(text)
 *   
 *   // Save to cache for 1 hour
 *   await cacheService.set(cacheKey, result, 3600)
 *   
 *   return result
 * }
 * 
 * ═══════════════════════════════════════════════════════════════
 * CACHE KEY PATTERNS
 * ═══════════════════════════════════════════════════════════════
 * 
 * analysis:abc123...    → AI analysis result
 * rate:user123:minute   → Rate limit counter
 * idempotency:request123 → Idempotency key
 * session:token123      → User session
 * 
 * ═══════════════════════════════════════════════════════════════
 * PERFORMANCE METRICS
 * ═══════════════════════════════════════════════════════════════
 * 
 * WITHOUT CACHE:
 * - Every request hits Groq API
 * - Response time: 2000-4000ms
 * - Cost per request: ~$0.001
 * - 1000 requests = $1
 * 
 * WITH CACHE (90% hit rate):
 * - 100 requests hit Groq API
 * - 900 requests hit Redis cache
 * - Avg response time: 200ms (10× faster)
 * - Cost: $0.10 (10× cheaper)
 * 
 * ═══════════════════════════════════════════════════════════════
 */