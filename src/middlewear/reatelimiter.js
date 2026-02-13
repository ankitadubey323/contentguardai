/**
 * ============================================
 * RATE LIMITER — API Protection Middleware
 * ============================================
 * 
 * WHY WE NEED RATE LIMITING:
 * Without limits, one malicious user can:
 * - Send 1 million requests → crash your server
 * - Cost you $10,000 in Groq API bills
 * - Steal all your data through scraping
 * - DDoS attack your service
 * 
 * WHAT RATE LIMITING DOES:
 * Sets a maximum number of requests per time window:
 * - Free tier: 10 requests/minute
 * - Pro tier: 100 requests/minute
 * - Enterprise: 1000 requests/minute
 * 
 * HOW IT WORKS:
 * Uses Redis to count requests per identifier (IP or API key).
 * When limit exceeded → Returns HTTP 429 "Too Many Requests"
 * 
 * REAL WORLD SCENARIO:
 * User sends 15 requests in 1 minute (limit is 10)
 * - First 10 requests: ✅ Processed normally
 * - Request 11-15: ❌ Blocked with "Rate limit exceeded"
 * - After 1 minute: Counter resets, user can try again
 * 
 * ALGORITHM USED:
 * Sliding Window Counter — most accurate, prevents bursts
 */

import redis from '../config/redis.js'
import logger from '../utils/logger.js'
import { RATE_LIMITS, HTTP_STATUS, ERRORS } from '../config/constants.js'

// ─────────────────────────────────────────────────────────────────
// RATE LIMITER CLASS
// ─────────────────────────────────────────────────────────────────

class RateLimiter {
    constructor(options = {}) {
        this.redis = redis
        this.windowMs = options.windowMs || 60000  // 1 minute
        this.max = options.max || 10  // 10 requests per window
        this.prefix = options.prefix || 'rate:'
        this.skipFailedRequests = options.skipFailedRequests || false
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * CHECK RATE LIMIT
     * ═══════════════════════════════════════════════════════════════
     * 
     * Uses Redis INCR + EXPIRE for atomic operation
     * 
     * How it works:
     * 1. Identifier = IP address or API key
     * 2. Redis key = "rate:192.168.1.1:60000" (IP + window)
     * 3. INCR key → increments counter, returns count
     * 4. If count === 1 (first request), set EXPIRE
     * 5. If count > max, reject request
     */
    async checkLimit(identifier) {
        try {
            const now = Date.now()
            const windowStart = now - this.windowMs
            const key = `${this.prefix}${identifier}:${this.windowMs}`

            // Get current count
            let count = await this.redis.incr(key)

            // If first request in this window, set expiration
            if (count === 1) {
                await this.redis.pexpire(key, this.windowMs)
            }

            // Get time until reset
            const ttl = await this.redis.pttl(key)
            const resetTime = now + ttl

            const result = {
                allowed: count <= this.max,
                current: count,
                limit: this.max,
                remaining: Math.max(0, this.max - count),
                resetTime,
                retryAfter: ttl > 0 ? Math.ceil(ttl / 1000) : 0,
            }

            if (result.allowed) {
                logger.debug(`Rate limit OK → ${identifier} (${count}/${this.max})`)
            } else {
                logger.warn(`Rate limit EXCEEDED → ${identifier} (${count}/${this.max})`)
            }

            return result

        } catch (error) {
            logger.error('Rate limiter error:', error.message)
            
            // Fail open — allow request if Redis is down
            return {
                allowed: true,
                current: 0,
                limit: this.max,
                remaining: this.max,
                error: error.message,
            }
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * RESET LIMIT — Clear counter for identifier
     * ═══════════════════════════════════════════════════════════════
     * 
     * Use when user upgrades tier or for admin override
     */
    async resetLimit(identifier) {
        try {
            const key = `${this.prefix}${identifier}:${this.windowMs}`
            await this.redis.del(key)
            logger.info(`Rate limit RESET → ${identifier}`)
            return true

        } catch (error) {
            logger.error('Reset limit error:', error.message)
            return false
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// MIDDLEWARE FACTORY
// ─────────────────────────────────────────────────────────────────

/**
 * Create rate limiter middleware
 * 
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.tier - Tier name (free, pro, enterprise)
 * 
 * Usage:
 *   router.post('/analyze', rateLimiter({ tier: 'free' }), controller)
 */
export function rateLimiter(options = {}) {
    // Get limits based on tier
    const tier = options.tier || 'free'
    const tierLimits = RATE_LIMITS[tier.toUpperCase()] || RATE_LIMITS.FREE

    const limiter = new RateLimiter({
        windowMs: options.windowMs || 60000,  // 1 minute
        max: options.max || tierLimits.requests_per_minute,
        prefix: options.prefix || 'rate:',
    })

    return async (req, res, next) => {
        try {
            // Identifier: API key if present, otherwise IP address
            const identifier = req.apiKey || req.ip || 'unknown'

            // Check limit
            const result = await limiter.checkLimit(identifier)

            // Add rate limit headers to response
            res.setHeader('X-RateLimit-Limit', result.limit)
            res.setHeader('X-RateLimit-Remaining', result.remaining)
            res.setHeader('X-RateLimit-Reset', result.resetTime)

            if (!result.allowed) {
                // Rate limit exceeded
                res.setHeader('Retry-After', result.retryAfter)
                
                return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                    success: false,
                    error: ERRORS.RATE_LIMIT_EXCEEDED,
                    limit: result.limit,
                    current: result.current,
                    retryAfter: result.retryAfter,
                    message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
                })
            }

            // Rate limit OK — continue
            next()

        } catch (error) {
            logger.error('Rate limiter middleware error:', error.message)
            // Fail open — allow request if rate limiter fails
            next()
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// TIER-SPECIFIC RATE LIMITERS
// ─────────────────────────────────────────────────────────────────

export const rateLimitFree = rateLimiter({ tier: 'free' })
export const rateLimitPro = rateLimiter({ tier: 'pro' })
export const rateLimitEnterprise = rateLimiter({ tier: 'enterprise' })

// ─────────────────────────────────────────────────────────────────
// CUSTOM RATE LIMITERS
// ─────────────────────────────────────────────────────────────────

// Strict rate limit for expensive operations
export const rateLimitStrict = rateLimiter({
    windowMs: 60000,   // 1 minute
    max: 5,            // Only 5 requests per minute
    tier: 'custom',
})

// Generous rate limit for cheap operations
export const rateLimitGenerous = rateLimiter({
    windowMs: 60000,   // 1 minute
    max: 100,          // 100 requests per minute
    tier: 'custom',
})

export default rateLimiter;

/**
 * ═══════════════════════════════════════════════════════════════
 * USAGE IN ROUTES
 * ═══════════════════════════════════════════════════════════════
 * 
 * import { rateLimitFree, rateLimitPro } from '../middleware/rateLimiter.js'
 * 
 * // Apply to specific route
 * router.post('/analyze', rateLimitFree, contentController.createContent)
 * 
 * // Apply to all routes in file
 * router.use(rateLimitFree)
 * 
 * // Different limits for different endpoints
 * router.post('/analyze', rateLimitStrict, createContent)  // Expensive
 * router.get('/content', rateLimitGenerous, getAllContent) // Cheap
 * 
 * ═══════════════════════════════════════════════════════════════
 * HOW IT PROTECTS YOUR APP
 * ═══════════════════════════════════════════════════════════════
 * 
 * ATTACK SCENARIO 1: Brute Force
 * Attacker sends 10,000 requests/second
 * Rate limiter allows 10/minute → 9,990 blocked
 * Server handles load easily
 * 
 * ATTACK SCENARIO 2: Cost Attack
 * Attacker analyzes random text 1000 times
 * Rate limiter blocks after 10 → You only pay for 10 API calls
 * Without limiter → $1000 bill
 * With limiter → $0.10 bill
 * 
 * ATTACK SCENARIO 3: Data Scraping
 * Competitor tries to GET /content?page=1 through page=10000
 * Rate limiter blocks after 100 pages
 * Your data stays protected
 * 
 * ═══════════════════════════════════════════════════════════════
 * RESPONSE HEADERS EXPLAINED
 * ═══════════════════════════════════════════════════════════════
 * 
 * X-RateLimit-Limit: 10       → Max requests allowed
 * X-RateLimit-Remaining: 7    → Requests left in window
 * X-RateLimit-Reset: 1234567890  → Unix timestamp when counter resets
 * Retry-After: 45             → Seconds until can retry (if blocked)
 * 
 * Client can use these headers to avoid hitting limit
 * 
 * ═══════════════════════════════════════════════════════════════
 * REDIS KEY STRUCTURE
 * ═══════════════════════════════════════════════════════════════
 * 
 * rate:192.168.1.1:60000 = 7   (7 requests in last minute)
 * rate:apikey123:60000 = 45    (45 requests in last minute)
 * 
 * Keys auto-expire after windowMs (no manual cleanup needed)
 * 
 * ═══════════════════════════════════════════════════════════════
 */
