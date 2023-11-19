import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

//create tweet
router.post('/', async (req, res) => {
  const { content, image } = req.body;
  //@ts-ignore
  const user = req.user;

  try {
    const result = await prisma.tweet.create({
      data: {
        content,
        image,
        userId: user.id,
      },
      include: { user: true },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong!' });
  }
});
//allTweets
router.get('/', async (req, res) => {
  const allTweet = await prisma.tweet.findMany({
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });
  res.status(200).json(allTweet);
});
//get one tweet
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const tweet = await prisma.tweet.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });
  if (!tweet) {
    res.status(404).json({ error: 'Tweet not found' });
  }
  res.status(200).json(tweet);
});
//update tweet
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, image, impression } = req.body;
  try {
    const result = await prisma.tweet.update({
      where: { id: Number(id) },
      data: {
        content,
        image,
        impression,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong' });
  }
});
//delete tweet
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.tweet.delete({ where: { id: Number(id) } });
  res.sendStatus(200);
});

export default router;
