import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

function getJwtSecret() {
  // Read at call-time so dotenv load order can't cause mismatches.
  return process.env.JWT_SECRET || 'default-secret-change-in-production';
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * User Registration Service
 * 
 * Creates a new user account with:
 * - Email uniqueness validation
 * - Password hashing using bcrypt (10 salt rounds)
 * - JWT token generation for immediate authentication
 */
export const signup = async (data: SignupData) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password with bcrypt (10 salt rounds for security)
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true
    }
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return { user, token };
};

/**
 * User Login Service
 * 
 * Authenticates user by:
 * - Finding user by email
 * - Comparing provided password with stored hash using bcrypt
 * - Generating JWT token on successful authentication
 */
export const login = async (data: LoginData) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    // Don't reveal if email exists (security best practice)
    throw new Error('Invalid email or password');
  }

  // Compare password with stored hash
  const isValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    },
    token
  };
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true
    }
  });
};
