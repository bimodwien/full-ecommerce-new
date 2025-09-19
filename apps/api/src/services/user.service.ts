import { Request } from 'express';
import prisma from '@/prisma';
import { TUser } from '@/models/user.model';
import { hashPassword, comparePasswords } from '@/libs/bcrypt';
import { createToken } from '@/libs/jwt';
import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';

class UserService {
  static async createUser(req: Request) {
    const { name, username, email, password, role } = req.body as TUser;

    if (!['buyer', 'seller'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashed = await hashPassword(String(password));

    const data: Prisma.UserCreateInput = {
      name,
      username,
      email,
      password: hashed,
      role,
    };
    const newUser = await prisma.user.create({ data });
    return newUser;
  }

  static async login(req: Request) {
    const { username, password } = req.body as TUser;

    // check if user not exists
    const user = (await prisma.user.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        password: true,
        role: true,
      },
    })) as TUser;

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // check password
    const isPasswordValid = await comparePasswords(
      String(password),
      String(user.password),
    );
    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }

    // delete password for security
    delete user.password;

    // create token from user
    const access_token = createToken({ user, type: 'access_token' }, '1d');
    const refresh_token = createToken({ user, type: 'refresh_token' }, '7d');

    return { access_token, refresh_token };
  }

  static async findOrCreateGoogleUser(googleProfile: {
    email: string;
    name: string;
    googleId: string;
  }) {
    let user = await prisma.user.findUnique({
      where: { email: googleProfile.email },
    });

    if (user && !user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleProfile.googleId,
          name: user.name || googleProfile.name,
        },
      });
      return user;
    }

    if (!user) {
      const baseUsername = googleProfile.email.split('@')[0];
      // hindari bentrok unik username
      const username = baseUsername;
      user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          name: googleProfile.name,
          googleId: googleProfile.googleId,
          username,
          role: 'buyer',
        },
      });
    }
    return user;
  }

  static async createJwt(user: any) {
    // Buat payload JWT sesuai kebutuhan
    const payload = { id: user.id, email: user.email, role: user.role };
    return createToken(payload);
  }
}

export default UserService;
