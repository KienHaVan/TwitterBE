import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

//create user
router.post('/', async (req, res) => {
  const { email, name, username } = req.body;
  try {
    const result = await prisma.user.create({
      data: {
        email,
        name,
        username,
        bio: "Hello, I'm new on Twitter",
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong!' });
  }
});
//allUsers
router.get('/', async (req, res) => {
  const allUser = await prisma.user.findMany();
  res.status(200).json(allUser);
});
//get one user
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { tweets: true },
  });
  res.status(200).json(user);
});
//update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { bio, name, image } = req.body;
  try {
    const result = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        bio,
        name,
        image,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong!' });
  }
});
//delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.sendStatus(200);
});

export default router;
