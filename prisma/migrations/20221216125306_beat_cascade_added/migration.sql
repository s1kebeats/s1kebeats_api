-- DropForeignKey
ALTER TABLE "Beat" DROP CONSTRAINT "Beat_userId_fkey";

-- AddForeignKey
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
