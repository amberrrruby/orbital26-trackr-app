-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "offsetDays" INTEGER,
ALTER COLUMN "content" DROP NOT NULL;
