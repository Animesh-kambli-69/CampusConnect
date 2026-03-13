import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { extractEmailDomain, collegeNameFromDomain } from '../utils/helpers';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    collegeId: string;
    role: string;
  };
}

/**
 * Generate JWT token for a user.
 */
function generateToken(user: { id: string; email: string; collegeId: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      collegeId: user.collegeId,
      role: user.role,
    },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

/**
 * Verify and decode a JWT token.
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

/**
 * Register a new user.
 * - Validates college email domain
 * - Auto-creates college if domain is new
 * - Hashes password
 * - Returns JWT token + user data
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { email, password, name } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw AppError.conflict('User with this email already exists');
  }

  // Extract and validate domain
  const domain = extractEmailDomain(email);

  // Find or create college based on domain
  let college = await prisma.college.findUnique({ where: { domain } });
  if (!college) {
    college = await prisma.college.create({
      data: {
        name: collegeNameFromDomain(domain),
        domain,
      },
    });
    logger.info('New college created', { collegeName: college.name, domain });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      collegeId: college.id,
    },
  });

  const token = generateToken(user);

  logger.info('User registered', { userId: user.id, college: college.name });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      collegeId: user.collegeId,
      role: user.role,
    },
  };
}

/**
 * Login user with email and password.
 * - Validates credentials
 * - Checks banned status
 * - Returns JWT token + user data
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Check if banned
  if (user.banned) {
    throw AppError.forbidden('Your account has been banned. Contact your college administrator.');
  }

  // Compare passwords
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user);

  logger.info('User logged in', { userId: user.id });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      collegeId: user.collegeId,
      role: user.role,
    },
  };
}
