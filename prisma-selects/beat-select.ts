import { Prisma } from '@prisma/client'

const beatSelect: Prisma.BeatSelect = {
  id: true,
  name: true,
  bpm: true,
  user: {
    select: {
      username: true,
      displayedName: true,
    },
  },
  image: true,
  mp3: true,
  wavePrice: true,
}
export default beatSelect