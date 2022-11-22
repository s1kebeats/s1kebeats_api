import PrismaClient from '@prisma/client';
const prisma = new PrismaClient.PrismaClient();

class CommentService {
  async uploadComment(
    commentPayload: Omit<PrismaClient.Comment, 'id' | 'createdAt'>
  ) {
    const comment = await prisma.comment.create({
      data: {
        ...commentPayload,
      },
    });
    return comment;
  }
  async getComments(beatId: number, viewed = 0) {
    const comments = await prisma.comment.findMany({
      where: {
        beatId,
      },
      take: 10,
      skip: viewed,
    });
    return comments;
  }
}

export default new CommentService();
