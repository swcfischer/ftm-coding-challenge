const rateLimit = require("express-rate-limit");

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for AI message requests
const aiMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 AI requests per hour
  message: {
    error:
      "AI message limit exceeded. You can send up to 50 messages per hour.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from the rate limiter if AI request fails
  skipSuccessfulRequests: false,
  // Skip failed requests from the rate limiter
  skipFailedRequests: true,
});

// Rate limiter for knowledge base operations
const knowledgeBaseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 knowledge base operations per 15 minutes
  message: {
    error: "Knowledge base operation limit exceeded. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  aiMessageLimiter,
  knowledgeBaseLimiter,
};
