import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const router = Router();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_MINUTES_HOURS = 12;
const JWT_SECRET = 'Kevin';

function generateEmailToken(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}
function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };
  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: 'HS256',
    noTimestamp: true,
  });
}

//create a user
router.post('/login', async (req, res) => {
  const { email } = req.body;
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );
  try {
    const createdToken = await prisma.token.create({
      data: {
        type: 'EMAIL',
        emailToken,
        expiration,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong' });
  }
});

//validate the email token & exchange it for JWT Token
router.post('/authenticate', async (req, res) => {
  const { email, emailToken } = req.body;
  const dbEmailToken = await prisma.token.findUnique({
    where: {
      emailToken,
    },
    include: {
      user: true,
    },
  });
  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }
  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: 'Token expired!' });
  }

  if (dbEmailToken?.user?.email !== email) {
    return res.sendStatus(401);
  }

  const expiration = new Date(
    new Date().getTime() +
      AUTHENTICATION_EXPIRATION_MINUTES_HOURS * 60 * 60 * 1000
  );

  const apiToken = await prisma.token.create({
    data: {
      type: 'API',
      expiration,
      user: {
        connect: {
          email,
        },
      },
    },
  });

  //invaliate the email token
  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: { valid: false },
  });

  //generate the JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.status(200).json({
    authToken,
  });
});
export default router;
