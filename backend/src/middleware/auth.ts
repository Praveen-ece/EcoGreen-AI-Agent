import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'ecopick_jwt_sustainability_secret_token_key_2026';

    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (!err && decoded && decoded.id) {
        req.userId = decoded.id;
      }
      next();
    });
  } else {
    next();
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
};
