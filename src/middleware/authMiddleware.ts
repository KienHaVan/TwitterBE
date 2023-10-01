import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'Kevin';

interface AuthRequest extends Request {
  user?: User;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const jwtToken = authHeader?.split(' ')[1];
  if (!jwtToken) {
    return res.sendStatus(401);
  }
  try {
    const payload = (await jwt.verify(jwtToken, JWT_SECRET)) as {
      tokenId: number;
    };
    if (!payload.tokenId) {
      return res.sendStatus(401);
    }
    const dbToken = await prisma.token.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });
    if (!dbToken?.valid || dbToken.expiration < new Date()) {
      return res.status(401).json({ error: 'API token invalid' });
    }
    req.user = dbToken.user;
  } catch (error) {
    return res.sendStatus(401);
  }
  next();
}
