/**
 * ============================================
 * IDEMPOTENCY MIDDLEWARE — Prevent Duplicate Processing
 * ============================================
 * 
 * WHY WE NEED IDEMPOTENCY:
 * Network issues cause duplicate requests:
 * - User clicks "Analyze" button
 * - Request sent to server
 * - Network hiccup → no response received
 * - User clicks button again (thinks first failed)
 * - Server processes SAME text TWICE
 * - You pay Groq AI TWICE for same analysis!
 * 
 * WHAT IDEMPOTENCY DOES:
 * Ensures same request processed only ONCE
 * If duplicate detected → returns cached result instantly
 * 
 * HOW IT WORKS:
 * 1. Client sends Idempotency-Key header (unique ID)
 * 2. Server checks Redis if this key was processed before
 * 3. If yes → return cached response (no re-processing)
 * 4. If no → process request, cache response for 24 hours
 * 
 * REAL WORLD SCENARIO:
 * User submits form, double-clicks submit button:
 * - Request 1: Processed normally, result cached
 * - Request 2 (duplicate): Instant response from cache
 * - Result: Processed once, paid once, user happy
 * 
 * STANDARD:
 * Stripe, PayPal, AWS all use this pattern
 */

import redis from '../config/redis.js'
import logger from '../utils/logger.js'
import { hashText } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────
// IDEMPOTENCY MIDDLEWARE
// ─────────────────────────────────────────────────────────────────

/**
 * Idempotency key can come from:
 * 1. Idempotency-Key header (recommended)
 * 2. Auto-generated from request body hash
 * 
 * Cache response for 24 hours
 */
export const idempotency = (options = {}) => {
    const ttl = options.ttl || 86400  // 24 hours
    const prefix = options.prefix || 'idempotency:'
    const autoGenerate = options.autoGenerate !== false

    return async (req, res, next) => {
        try {
            // ─────────────────────────────────────────────────────────────
            // STEP 1: Get or generate idempotency key
            // ─────────────────────────────────────────────────────────────
            
            let idempotencyKey = req.headers['idempotency-key']

            // If no header and auto-generate enabled, hash request body
            if (!idempotencyKey && autoGenerate && req.body) {
                const bodyStr = JSON.stringify(req.body)
                idempotencyKey = hashText(bodyStr + req.path)
                logger.debug(`Idempotency key auto-generated: ${idempotencyKey}`)
            }

            // If still no key, skip idempotency check
            if (!idempotencyKey) {
                return next()
            }

            const cacheKey = `${prefix}${idempotencyKey}`

            // ─────────────────────────────────────────────────────────────
            // STEP 2: Check if request was already processed
            // ─────────────────────────────────────────────────────────────

            const cached = await redis.get(cacheKey)

            if (cached) {
                // This request was already processed!
                const cachedResponse = JSON.parse(cached)
                
                logger.warn(`⚠️  Duplicate request detected → ${idempotencyKey}`)
                logger.info('Returning cached response (idempotency)')

                // Send cached response with special header
                res.setHeader('X-Idempotent-Replay', 'true')
                return res.status(cachedResponse.status).json(cachedResponse.body)
            }

            // ─────────────────────────────────────────────────────────────
            // STEP 3: Store original res.json function
            // ─────────────────────────────────────────────────────────────

            const originalJson = res.json.bind(res)

            // ─────────────────────────────────────────────────────────────
            // STEP 4: Wrap res.json to cache the response
            // ─────────────────────────────────────────────────────────────

            res.json = function (body) {
                // Cache this response
                const responseToCache = {
                    status: res.statusCode,
                    body,
                    timestamp: Date.now(),
                }

                redis.setex(
                    cacheKey,
                    ttl,
                    JSON.stringify(responseToCache)
                ).then(() => {
                    logger.debug(`Idempotency response cached → ${idempotencyKey}`)
                }).catch((err) => {
                    logger.error('Idempotency cache error:', err.message)
                })

                // Call original res.json
                return originalJson(body)
            }

            // ─────────────────────────────────────────────────────────────
            // STEP 5: Continue to next middleware/controller
            // ─────────────────────────────────────────────────────────────

            next()

        } catch (error) {
            logger.error('Idempotency middleware error:', error.message)
            // Fail open — allow request if idempotency check fails
            next()
        }
    }
}

export default idempotency

/**
 * ═══════════════════════════════════════════════════════════════
 * USAGE IN ROUTES
 * ═══════════════════════════════════════════════════════════════
 * 
 * import { idempotency } from '../middleware/idempotency.js'
 * 
 * // Apply to create endpoint (most important)
 * router.post('/content', idempotency(), createContent)
 * 
 * // Custom TTL (cache for 1 hour)
 * router.post('/content', idempotency({ ttl: 3600 }), createContent)
 * 
 * // Disable auto-generate (require header)
 * router.post('/content', idempotency({ autoGenerate: false }), createContent)
 * 
 * ═══════════════════════════════════════════════════════════════
 * CLIENT-SIDE USAGE
 * ═══════════════════════════════════════════════════════════════
 * 
 * // Generate unique key (client side)
 * import { v4 as uuidv4 } from 'uuid'
 * 
 * const idempotencyKey = uuidv4()  // "550e8400-e29b-41d4-a716-446655440000"
 * 
 * // Send in header
 * fetch('/api/content', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Idempotency-Key': idempotencyKey,  // ← Important!
 *   },
 *   body: JSON.stringify({ text: 'Hello' }),
 * })
 * 
 * // If user clicks button again, SAME idempotencyKey is used
 * // Server returns cached result instantly
 * 
 * ═══════════════════════════════════════════════════════════════
 * EXAMPLE SCENARIOS
 * ═══════════════════════════════════════════════════════════════
 * 
 * SCENARIO 1: Network Timeout
 * Time    Event
 * 10:00   User clicks "Analyze"
 * 10:01   Request sent, processing starts
 * 10:03   Response sent, but packet lost in network
 * 10:05   User sees "timeout", clicks again
 * 10:06   Server sees duplicate key → returns cached result instantly
 * Result: Processed once, charged once ✅
 * 
 * SCENARIO 2: Impatient User
 * Time    Event
 * 10:00   User clicks "Analyze"
 * 10:01   Request processing...
 * 10:02   User clicks again (impatient)
 * 10:03   User clicks again (very impatient)
 * 10:04   First request finishes, response cached
 * 10:05   2nd & 3rd requests → instant cached responses
 * Result: Processed once, charged once ✅
 * 
 * SCENARIO 3: Mobile Network Flakiness
 * User on train, network keeps dropping
 * App auto-retries failed requests
 * Same idempotency key used for all retries
 * Server processes only first attempt
 * Result: Reliable experience despite bad network ✅
 * 
 * ═══════════════════════════════════════════════════════════════
 * RESPONSE HEADERS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Original request (processed):
 * (no special header)
 * 
 * Duplicate request (cached):
 * X-Idempotent-Replay: true
 * 
 * Client can check this header to know if response was cached
 * 
 * ═══════════════════════════════════════════════════════════════
 * REDIS KEY STRUCTURE
 * ═══════════════════════════════════════════════════════════════
 * 
 * idempotency:550e8400-e29b-41d4-a716-446655440000 = {
 *   status: 201,
 *   body: { success: true, contentId: "..." },
 *   timestamp: 1234567890
 * }
 * 
 * Key expires after 24 hours (86400 seconds)
 * 
 * ═══════════════════════════════════════════════════════════════
 * COST SAVINGS CALCULATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * WITHOUT IDEMPOTENCY:
 * - 1000 users, 10% double-click
 * - 100 duplicate requests processed
 * - 100 × $0.001 = $0.10 wasted
 * - Per month: $0.10 × 30 = $3/month wasted
 * - Per year: $36/year wasted
 * 
 * WITH IDEMPOTENCY:
 * - Duplicates return cached response
 * - 0 wasted API calls
 * - Savings: $36/year
 * - Plus: Better user experience (instant response on retry)
 * 
 * ═══════════════════════════════════════════════════════════════
 * WHEN TO USE IDEMPOTENCY
 * ═══════════════════════════════════════════════════════════════
 * 
 * ✅ USE for:
 * - POST /content (creates new resource)
 * - POST /analyze (expensive operation)
 * - POST /payment (critical — never charge twice!)
 * - PUT /update (state-changing operation)
 * 
 * ❌ DON'T USE for:
 * - GET /content (safe, read-only)
 * - DELETE /content (naturally idempotent)
 * - GET /stats (cheap, read-only)
 * 
 * ═══════════════════════════════════════════════════════════════
 */