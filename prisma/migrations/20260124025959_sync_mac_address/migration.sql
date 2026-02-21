/*
  Warnings:

  - You are about to drop the column `event` on the `LogAccess` table. All the data in the column will be lost.
  - Added the required column `action` to the `LogAccess` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LogAccess_event_idx";

-- AlterTable
ALTER TABLE "LogAccess" DROP COLUMN "event",
ADD COLUMN     "action" "LogEvent" NOT NULL;

-- CreateIndex
CREATE INDEX "LogAccess_action_idx" ON "LogAccess"("action");
