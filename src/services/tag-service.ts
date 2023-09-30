import PrismaClient from '@prisma/client';

const prisma = new PrismaClient.PrismaClient();

class TagService {
  async findTags(name: string, viewed: number): Promise<PrismaClient.Tag[]> {
    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      take: 10,
      skip: viewed,
    });
    return tags;
  }

  async getTags(viewed: number): Promise<PrismaClient.Tag[]> {
    const tags = await prisma.tag.findMany({
      take: 10,
      skip: viewed,
    });
    return tags;
  }
}

export default new TagService();
