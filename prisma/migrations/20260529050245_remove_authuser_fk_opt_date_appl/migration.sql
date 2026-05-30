/*
  Warnings:

  - The values [OA] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('WISHLIST', 'APPLIED', 'OA_ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
COMMIT;

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "dateApplied" DROP NOT NULL;
