CREATE TYPE "public"."Status" AS ENUM (
    'WISHLIST',
    'APPLIED',
    'OA_ASSESSMENT',
    'INTERVIEW',
    'OFFER',
    'REJECTED'
);

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING "btree" ("email");

CREATE TABLE IF NOT EXISTS "public"."Application" (
    "id" "text" NOT NULL,
    "company" "text" NOT NULL,
    "role" "text" NOT NULL,
    "source" "text",
    "status" "public"."Status" DEFAULT 'APPLIED'::"public"."Status" NOT NULL,
    "dateApplied" timestamp(3) without time zone,
    "notes" "text",
    "resumeUrl" "text",
    "tags" "text"[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;
