import authorSelect from "./author-select"
import { Prisma } from '@prisma/client'

const beatIndividualSelect: Prisma.BeatSelect = {
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
  likes: true,
  tags: true,
  user: {
    select: authorSelect,
  },
}
export default beatIndividualSelect;