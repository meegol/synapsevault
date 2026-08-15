import crypto from 'crypto';

// Vault master password
const VAULT_PASSWORD = process.env.VAULT_PASSWORD || 'migol';

// Secret key for HMAC token signing (falls back to stable internal salt)
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'synapse_vault_migol_hmac_secret_2026';
const SERVER_SALT = 'synapse_vault_migol_secure_salt_2026';

/**
 * Hash password with PBKDF2
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

const EXPECTED_HASH = hashPassword(VAULT_PASSWORD, SERVER_SALT);

/**
 * Validate password and issue a stateless, HMAC-signed session token
 * @param {string} inputPassword 
 * @returns {string|null} token or null
 */
export function authenticate(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string') return null;

  const currentExpected = hashPassword(process.env.VAULT_PASSWORD || 'migol', SERVER_SALT);
  const inputHash = hashPassword(inputPassword, SERVER_SALT);
  
  // Constant time comparison to prevent timing attacks
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(inputHash, 'hex'),
    Buffer.from(currentExpected, 'hex')
  );

  if (!isMatch) return null;

  // Issue stateless HMAC-signed token: timestamp.signature
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(timestamp)
    .digest('hex');

  return `${timestamp}.${signature}`;
}

/**
 * Verify HMAC-signed session token
 * @param {string} token 
 * @returns {boolean}
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(timestampStr)
    .digest('hex');

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );

  if (!isMatch) return false;

  // Check 30-day expiration
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) {
    return false;
  }

  return true;
}

/**
 * Invalidate session
 */
export function invalidateToken(token) {
  // Stateless token
}

/**
 * Express Authentication Middleware
 */
export function authMiddleware(req, res, next) {
  // Public routes
  if (
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/status' ||
    req.path === '/api/health' ||
    !req.path.startsWith('/api/')
  ) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please unlock your personal vault.' });
  }

  const token = authHeader.slice(7).trim();
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Session expired or invalid. Please unlock your personal vault.' });
  }

  next();
}
