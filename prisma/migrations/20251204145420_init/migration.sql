/*
  Warnings:

  - The `meta` column on the `LogAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[hotspotId,code]` on the table `Code` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROVIDER', 'ADMIN');

-- DropIndex
DROP INDEX "Payment_orderId_key";

-- AlterTable
ALTER TABLE "Code" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Hotspot" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LogAccess" DROP COLUMN "meta",
ADD COLUMN     "meta" JSONB;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PROVIDER';

-- CreateIndex
CREATE UNIQUE INDEX "Code_hotspotId_code_key" ON "Code"("hotspotId", "code");

-- RenameForeignKey
ALTER TABLE "Code" RENAME CONSTRAINT "Code_Order_fkey" TO "Code_orderId_fkey";

-- RenameForeignKey
ALTER TABLE "Payment" RENAME CONSTRAINT "Payment_Order_fkey" TO "Payment_orderId_fkey";
