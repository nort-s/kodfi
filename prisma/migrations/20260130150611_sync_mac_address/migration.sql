/*
  Warnings:

  - The required column `secretKey` was added to the `Hotspot` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Hotspot" ADD COLUMN     "secretKey" TEXT NOT NULL;
