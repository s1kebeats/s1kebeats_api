import PrismaClient from '@prisma/client';
const prisma = new PrismaClient.PrismaClient();

class LikeService {
  async getLikeByIdentifier(beatId: number, userId: number): Promise<PrismaClient.Like | null> {
    const likeFindUniqueArgs: PrismaClient.Prisma.LikeFindUniqueArgs = {
      where: {
        likeIdentifier: { userId, beatId },
      },
    };
    const like = await prisma.like.findUnique(likeFindUniqueArgs);
    return like;
  }
  async deleteLike(beatId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.delete({
      where: {
        likeIdentifier: { userId, beatId },
      },
    });
    return like;
  }
  async createLike(beatId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.create({
      data: {
        userId,
        beatId,
      },
    });
    return like;
  }
}

export default new LikeService();
