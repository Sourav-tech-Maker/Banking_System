const { ipKeyGenerator, rateLimit } = require('express-rate-limit');

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function authenticatedClientKey(req) {
  if (req.user?._id) {
    return `user:${req.user._id.toString()}`;
  }

  return `ip:${ipKeyGenerator(req.ip)}`;
}

function tooManyRequestsMessage(operation) {
  return {
    status: 429,
    message: `Too many ${operation} requests, please try again after 15 minutes`
  };
}

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequestsMessage('API')
});

const dbReadLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authenticatedClientKey,
  message: tooManyRequestsMessage('read')
});

const dbWriteLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authenticatedClientKey,
  message: tooManyRequestsMessage('write')
});

const transactionLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authenticatedClientKey,
  message: tooManyRequestsMessage('transaction')
});

module.exports = {
  limiter,
  dbReadLimiter,
  dbWriteLimiter,
  transactionLimiter
};
