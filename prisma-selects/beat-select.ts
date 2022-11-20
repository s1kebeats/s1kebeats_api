import { Prisma } from '@prisma/client';

class BeatSelect {
  id: boolean;
  name: boolean;
  bpm: boolean;
  user: Prisma.UserArgs | boolean;
  image: boolean;
  mp3: boolean;
  wavePrice: boolean;
  tags: Prisma.TagFindManyArgs | boolean;
  plays: boolean;

  constructor(model: Prisma.BeatSelect) {
    this.id = model.id !== undefined ? model.id : true;
    this.name = model.name !== undefined ? model.name : true;
    this.bpm = model.bpm !== undefined ? model.bpm : true;
    this.user =
      model.user !== undefined
        ? model.user
        : {
            select: {
              id: true,
              username: true,
              displayedName: true,
            },
          };
    this.image = model.image !== undefined ? model.image : true;
    this.mp3 = model.mp3 !== undefined ? model.mp3 : true;
    this.wavePrice = model.wavePrice !== undefined ? model.wavePrice : true;
    this.tags = model.tags !== undefined ? model.tags : true;
    this.plays = model.plays !== undefined ? model.plays : false;
  }
}

export default BeatSelect;
