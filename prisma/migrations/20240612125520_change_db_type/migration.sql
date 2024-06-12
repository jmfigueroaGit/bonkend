/*
  Warnings:

  - You are about to alter the column `credentials` on the `database` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `database` MODIFY `credentials` JSON NOT NULL;
