/*
Defaulting is now Prisma's responsibility
*/

ALTER TABLE public."User"
ALTER COLUMN "settings"
DROP DEFAULT;