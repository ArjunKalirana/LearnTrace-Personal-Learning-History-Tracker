import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
    { expiresIn: '7d' } // Changed to 7d temporarily, usually this would be 1h with refresh
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    getJwtSecret(),
    { expiresIn: '30d' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  return { user, token, refreshToken };
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

  const refreshToken = jwt.sign(
    { userId: user.id },
    getJwtSecret(),
    { expiresIn: '30d' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    },
    token,
    refreshToken
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

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null; // Don't throw exception to prevent email enumeration

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: hashedToken, resetTokenExpiry }
  });

  // Since we don't have email setup yet in MVP, return the raw token.
  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() }
    }
  });

  if (!user) throw new Error('Invalid or expired password reset token');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      refreshToken: null // invalidate existing sessions
    }
  });
};

export const refresh = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(refreshToken, getJwtSecret());
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        refreshToken: refreshToken
      }
    });

    if (!user) throw new Error('Invalid refresh token');

    const newToken = jwt.sign(
       { userId: user.id, email: user.email },
       getJwtSecret(),
       { expiresIn: '7d' }
    );
    const newRefreshToken = jwt.sign(
       { userId: user.id },
       getJwtSecret(),
       { expiresIn: '30d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
