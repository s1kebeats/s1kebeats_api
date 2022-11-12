import { Prisma } from '@prisma/client'

const authorSelect: Prisma.UserSelect = {
  username: true,
  displayedName: true,
  image: true,
}
export default authorSelect;
