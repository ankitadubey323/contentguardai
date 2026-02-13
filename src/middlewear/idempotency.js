

import redis from '../config/redis.js'
import logger from '../utils/logger.js'
import { hashText } from '../utils/helpers.js'


export const idempotency = (options = {}) => {
    const ttl = options.ttl || 86400  // 24 hours
    const prefix = options.prefix || 'idempotency:'
    const autoGenerate = options.autoGenerate !== false

    return async (req, res, next) => {
        try {
             
            
            let idempotencyKey = req.headers['idempotency-key']

            
            if (!idempotencyKey && autoGenerate && req.body) {
                const bodyStr = JSON.stringify(req.body)
                idempotencyKey = hashText(bodyStr + req.path)
                logger.debug(`Idempotency key auto-generated: ${idempotencyKey}`)
            }

           
            if (!idempotencyKey) {
                return next()
            }

            const cacheKey = `${prefix}${idempotencyKey}`

            
            const redis = new Redis({
    ...redisConfig,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
})


            if (cached) {
                
                const cachedResponse = JSON.parse(cached)
                
                logger.warn(`  Duplicate request detected → ${idempotencyKey}`)
                logger.info('Returning cached response (idempotency)')

                
                res.setHeader('X-Idempotent-Replay', 'true')
                return res.status(cachedResponse.status).json(cachedResponse.body)
            }

            

            const originalJson = res.json.bind(res)

            

            res.json = function (body) {
                
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

                
                return originalJson(body)
            }

            

            next()

        } catch (error) {
            logger.error('Idempotency middleware error:', error.message)
            
            next()
        }
    }
}

export default idempotency

