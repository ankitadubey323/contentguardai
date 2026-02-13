/**
 * ============================================
 * CONSTANTS.JS — ContentGuard AI
 * ============================================
 * Central place for all magic numbers and configuration
 * Change thresholds here to tune moderation behavior
 */

// ─────────────────────────────────────────────────────────────────
// TOXICITY THRESHOLDS
// ─────────────────────────────────────────────────────────────────

export const TOXICITY = {
    // Flagging threshold — content above this score gets flagged
    FLAG_THRESHOLD: 60,  // 0-100 scale
    
    // Moderation action thresholds
    REMOVE_THRESHOLD:  80,  // score >= 80 → removed
    HIDE_THRESHOLD:    60,  // score >= 60 → hidden
    WARN_THRESHOLD:    40,  // score >= 40 → warned
    
    // Severity levels
    CRITICAL_THRESHOLD: 80,  // score >= 80 → critical severity
    HIGH_THRESHOLD:     60,  // score >= 60 → high severity
    MEDIUM_THRESHOLD:   40,  // score >= 40 → medium severity
    // Below 40 → low severity
}

// ─────────────────────────────────────────────────────────────────
// CONTENT LIMITS
// ─────────────────────────────────────────────────────────────────

export const CONTENT = {
    MIN_TEXT_LENGTH:   3,      // Minimum text length
    MAX_TEXT_LENGTH:   10000,  // Maximum text length
    
    DEFAULT_PAGE_SIZE: 20,     // Default pagination limit
    MAX_PAGE_SIZE:     100,    // Maximum items per page
}

// ─────────────────────────────────────────────────────────────────
// HARMFUL CONTENT CATEGORIES
// ─────────────────────────────────────────────────────────────────

export const HARMFUL_CATEGORIES = [
    'hate_speech',
    'harassment',
    'violence',
    'threat',
    'insult',
    'explicit',
    'spam',
]

// ─────────────────────────────────────────────────────────────────
// RATE LIMITING (when you add it in Week 3)
// ─────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
    // Free tier
    FREE: {
        requests_per_minute: 10,
        requests_per_hour:   100,
        requests_per_day:    500,
    },
    
    // Pro tier
    PRO: {
        requests_per_minute: 100,
        requests_per_hour:   1000,
        requests_per_day:    10000,
    },
    
    // Enterprise tier
    ENTERPRISE: {
        requests_per_minute: 1000,
        requests_per_hour:   10000,
        requests_per_day:    100000,
    },
}

// ─────────────────────────────────────────────────────────────────
// GROQ AI SETTINGS
// ─────────────────────────────────────────────────────────────────

export const GROQ = {
    MODEL:       'llama-3.1-70b-versatile',
    MAX_TOKENS:  1000,
    TEMPERATURE: 0.3,  // Lower = more consistent results
    
    // Retry settings for API failures
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,  // milliseconds
}

// ─────────────────────────────────────────────────────────────────
// CACHE SETTINGS (for Week 4)
// ─────────────────────────────────────────────────────────────────

export const CACHE = {
    ENABLED: true,
    TTL:     3600,  // Time to live (seconds) — 1 hour
    PREFIX:  'contentguard:',
}

// ─────────────────────────────────────────────────────────────────
// HTTP STATUS CODES (for consistency)
// ─────────────────────────────────────────────────────────────────

export const HTTP_STATUS = {
    OK:                    200,
    CREATED:               201,
    ACCEPTED:              202,
    NO_CONTENT:            204,
    BAD_REQUEST:           400,
    UNAUTHORIZED:          401,
    FORBIDDEN:             403,
    NOT_FOUND:             404,
    CONFLICT:              409,
    TOO_MANY_REQUESTS:     429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE:   503,
}

// ─────────────────────────────────────────────────────────────────
// ERROR MESSAGES
// ─────────────────────────────────────────────────────────────────

export const ERRORS = {
    TEXT_REQUIRED:      'Text is required',
    TEXT_TOO_SHORT:     `Text must be at least ${CONTENT.MIN_TEXT_LENGTH} characters`,
    TEXT_TOO_LONG:      `Text cannot exceed ${CONTENT.MAX_TEXT_LENGTH} characters`,
    CONTENT_NOT_FOUND:  'Content not found',
    INVALID_ID:         'Invalid content ID format',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
    API_KEY_REQUIRED:   'API key is required',
    API_KEY_INVALID:    'Invalid API key',
}

// ─────────────────────────────────────────────────────────────────
// SUCCESS MESSAGES
// ─────────────────────────────────────────────────────────────────

export const SUCCESS = {
    ANALYSIS_QUEUED:    'Analysis queued successfully',
    ANALYSIS_COMPLETED: 'Content analyzed successfully',
    CONTENT_DELETED:    'Content deleted successfully',
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

export default {
    TOXICITY,
    CONTENT,
    HARMFUL_CATEGORIES,
    RATE_LIMITS,
    GROQ,
    CACHE,
    HTTP_STATUS,
    ERRORS,
    SUCCESS,
}