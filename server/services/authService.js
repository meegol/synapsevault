import crypto from 'crypto';

// In-memory active tokens set (or persistent cache)
const activeSessions = new Map(); // token -> { createdAt, expiresAt }

// Default vault password: 'migol'
const VAULT_PASSWORD = process.env.VAULT_PASSWORD || 'migol';

/**
 * Hash password with salt
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

const SERVER_SALT = 'synapse_vault_migol_secure_salt_2026';
const EXPECTED_HASH = hashPassword(VAULT_PASSWORD, SERVER_SALT);

/**
 * Validate password and issue a secure session token
 * @param {string} inputPassword 
 * @returns {string|null} token or null
 */
export function authenticate(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string') return null;

  const inputHash = hashPassword(inputPassword, SERVER_SALT);
  
  // Constant time comparison to prevent timing attacks
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(inputHash, 'hex'),
    Buffer.from(EXPECTED_HASH, 'hex')
  );

  if (!isMatch) return null;

  // Issue random cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days session

  activeSessions.set(token, {
    createdAt: now,
    expiresAt
  });

  return token;
}

/**
 * Verify session token
 * @param {string} token 
 * @returns {boolean}
 */
export function verifyToken(token) {
  if (!token) return false;
  
  const session = activeSessions.get(token);
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }

  return true;
}

/**
 * Invalidate session (Logout)
 * @param {string} token 
 */
export function invalidateToken(token) {
  if (token) activeSessions.delete(token);
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
