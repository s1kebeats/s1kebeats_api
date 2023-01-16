import PrismaClient from "@prisma/client";
import authorSelect from "./author-select";

function beatIndividualSelect(authorized: boolean) {
  return {
    select: {
      id: true,
      name: true,
      bpm: true,
      description: true,
      createdAt: true,
      downloads: true,
      plays: true,
      image: true,
      mp3: true,
      wavePrice: true,
      stemsPrice: true,
      tags: true,
      user: {
        ...authorSelect,
      },
      comments: authorized
        ? {
            take: 10,
            select: {
              content: true,
              user: {
                ...authorSelect,
              },
            },
          }
        : false,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  };
}

export type BeatIndividual = PrismaClient.Prisma.BeatGetPayload<ReturnType<typeof beatIndividualSelect>>;
export default beatIndividualSelect;
