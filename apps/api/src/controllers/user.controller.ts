import { Request, Response, NextFunction } from 'express';
import UserService from '@/services/user.service';
import { OAuth2Client } from 'google-auth-library';
import { createToken } from '@/libs/jwt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class UserController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { access_token, refresh_token } = await UserService.login(req);
      res
        .status(200)
        .cookie('access_token', access_token)
        .cookie('refresh_token', refresh_token)
        .json({
          message: 'Login success',
          access_token,
          refresh_token,
        });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.createUser(req);
      const { password, ...userWithoutPassword } = data;
      res.status(200).send({
        message: 'Register success',
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response) {
    const { id_token: google_id_token } = req.body;
    if (!google_id_token)
      return res.status(400).json({ message: 'id_token is required' });
    try {
      // Verify token ke Google
      const ticket = await client.verifyIdToken({
        idToken: google_id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        return res.status(400).json({ message: 'Invalid Google token' });
      }
      // Cari atau buat user
      const user = await UserService.findOrCreateGoogleUser({
        email: payload.email,
        name: payload.name || '',
        googleId: payload.sub,
      });
      // Buat JWT mirip login biasa
      const access_token = createToken({ user, type: 'access_token' }, '1d');
      const refresh_token = createToken({ user, type: 'refresh_token' }, '7d');
      res
        .status(200)
        .cookie('access_token', access_token)
        .cookie('refresh_token', refresh_token)
        .json({
          message: 'Login with Google success',
          access_token,
          refresh_token,
        });
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Google authentication failed', error: err });
    }
  }
}
