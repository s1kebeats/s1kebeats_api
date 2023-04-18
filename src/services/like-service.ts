import PrismaClient from "@prisma/client";
const prisma = new PrismaClient.PrismaClient();

class LikeService {
  async getLikeByIdentifier(beatId: number, userId: number): Promise<PrismaClient.Like | null> {
    const like = await prisma.like.findUnique({
      where: {
        likeIdentifier: { userId, beatId },
      },
    });
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
        user: {
          connect: { id: userId },
        },
        beat: {
          connect: { id: beatId },
        },
      },
    });
    return like;
  }
}

export default new LikeService();
