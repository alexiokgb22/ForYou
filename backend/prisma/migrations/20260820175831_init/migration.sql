-- CreateEnum
CREATE TYPE "ReadingMode" AS ENUM ('UNDECIDED', 'IMMEDIATE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('SENT', 'OPENED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "google_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "public_token" TEXT NOT NULL,
    "reading_mode" "ReadingMode" NOT NULL DEFAULT 'UNDECIDED',
    "unlock_date" TIMESTAMP(3),
    "mode_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letters" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT,
    "content" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "design_config" JSONB,
    "status" "LetterStatus" NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_at" TIMESTAMP(3),

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "collections_public_token_key" ON "collections"("public_token");

-- CreateIndex
CREATE INDEX "collections_user_id_idx" ON "collections"("user_id");

-- CreateIndex
CREATE INDEX "letters_collection_id_idx" ON "letters"("collection_id");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
