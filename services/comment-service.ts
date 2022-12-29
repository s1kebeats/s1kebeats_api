import PrismaClient from "@prisma/client";
const prisma = new PrismaClient.PrismaClient();

class CommentService {
  async uploadComment(data: PrismaClient.Prisma.CommentCreateInput) {
    const comment = await prisma.comment.create({
      data,
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
  async getCommentById(commentId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    return comment;
  }
  async deleteComment(commentId: number): Promise<void> {
    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}

export default new CommentService();
