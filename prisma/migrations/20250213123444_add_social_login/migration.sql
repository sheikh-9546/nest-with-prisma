-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "social_logins" (
    "id" SERIAL NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "social_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_logins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_logins_user_id_idx" ON "social_logins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_logins_provider_social_id_key" ON "social_logins"("provider", "social_id");

-- AddForeignKey
ALTER TABLE "social_logins" ADD CONSTRAINT "social_logins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
