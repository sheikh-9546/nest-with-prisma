/*
  Warnings:

  - You are about to drop the column `createdAt` on the `audits` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `audits` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `audits` table. All the data in the column will be lost.
  - You are about to drop the column `roleName` on the `roles` table. All the data in the column will be lost.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profilePic` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role_name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `model_id` to the `audits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `audits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_name` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- DropIndex
DROP INDEX "roles_roleName_key";

-- DropIndex
DROP INDEX "users_phoneNumber_key";

-- AlterTable
ALTER TABLE "audits" DROP COLUMN "createdAt",
DROP COLUMN "modelId",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "model_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "roleName",
ADD COLUMN     "role_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey",
DROP COLUMN "roleId",
DROP COLUMN "userId",
ADD COLUMN     "role_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "deletedAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phoneNumber",
DROP COLUMN "profilePic",
DROP COLUMN "refreshToken",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "profile_pic" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
