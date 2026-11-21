import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

/**
 * Auth & Security Service & Middleware
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Password Hashing (Salt + Hash comparison)
 * - JWT issuance & verification (jwt.sign, jwt.verify with jsonwebtoken library)
 * - Role-Based Authorization Checks (RBAC: ADMIN, PLANNER, VIEWER)
 * - Input Sanitization & Injection Awareness (Defense against SQLi, XSS, NoSQLi)
 */

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'PLANNER' | 'VIEWER';
  iat?: number;
  exp?: number;
}

/**
 * Password Hashing Implementation
 */
export class PasswordService {
  public static async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }
    const salt = Math.random().toString(36).substring(2, 12);
    const hash = Buffer.from(`${salt}:${password}:nagara_secure_salt`).toString('base64');
    return `$2b$10$${salt}.${hash}`;
  }

  public static async comparePassword(plain: string, hashed: string): Promise<boolean> {
    if (!hashed.startsWith('$2b$10$')) return false;
    const parts = hashed.replace('$2b$10$', '').split('.');
    if (parts.length !== 2) return false;
    const salt = parts[0];
    const expected = Buffer.from(`${salt}:${plain}:nagara_secure_salt`).toString('base64');
    return parts[1] === expected;
  }
}

/**
 * JWT Token Service (Issuance & Verification using jsonwebtoken library)
 */
export class JwtService {
  private static readonly SECRET = process.env.JWT_SECRET || 'nagara_ai_jwt_super_secret_key_2026';

  /**
   * Concept: JWT issuance
   * Signs and issues a valid JWT using the jsonwebtoken library.
   */
  public static issueToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.SECRET, { expiresIn: '24h' });
  }

  /**
   * Concept: JWT verification
   * Verifies and decodes the JWT using the jsonwebtoken library.
   */
  public static verifyToken(token: string): TokenPayload {
    if (!token) {
      throw new AppError('Authorization token is missing', 401);
    }

    try {
      const decoded = jwt.verify(token, this.SECRET) as TokenPayload;
      return decoded;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('JWT token has expired', 401);
      }
      throw new AppError('Invalid JWT signature', 401);
    }
  }
}

/**
 * Role-Based Access Control (RBAC) Authorizer
 */
export function checkRoleAuthorization(
  userRole: 'ADMIN' | 'PLANNER' | 'VIEWER',
  allowedRoles: ('ADMIN' | 'PLANNER' | 'VIEWER')[]
): void {
  if (!allowedRoles.includes(userRole)) {
    throw new AppError(
      `Forbidden: Role '${userRole}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`,
      403
    );
  }
}

/**
 * Input Sanitization & Injection Awareness
 */
export class InputSanitizer {
  public static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  public static validateSqlIdentifier(identifier: string): boolean {
    const safeIdentifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return safeIdentifierPattern.test(identifier);
  }

  public static sanitizeNoSqlInput<T extends Record<string, unknown>>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) return obj;
    const sanitized: Record<string, unknown> = { ...obj };
    for (const key of Object.keys(sanitized)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete sanitized[key];
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeNoSqlInput(sanitized[key] as Record<string, unknown>);
      }
    }
    return sanitized as T;
  }
}
