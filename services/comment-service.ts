import PrismaClient from '@prisma/client';
const prisma = new PrismaClient.PrismaClient();

class CommentService {
    async uploadComment(
        commentPayload: PrismaClient.Prisma.CommentCreateManyInput
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
    async getCommentById(commentId: number) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });
        return comment;
    }
    async deleteComment(commentId: number) {
        const comment = await prisma.comment.delete({
            where: { id: commentId },
        });
        return comment;
    }
}

export default new CommentService();
