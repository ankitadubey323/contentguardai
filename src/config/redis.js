import logger from '../utils/logger.js'

// Dummy Redis client that does nothing
const dummyRedisClient = {
  isOpen: false,
  connect: async () => {},
  quit: async () => {},
  ping: async () => { throw new Error('Redis not available') },
  get: async () => null,
  set: async () => null,
  del: async () => null,
}

logger.warn(' Redis is disabled - Running without caching')

export const isRedisAvailable = () => false
export const safeRedisGet = async () => null
export const safeRedisSet = async () => false
export const safeRedisDel = async () => false

export default dummyRedisClient

