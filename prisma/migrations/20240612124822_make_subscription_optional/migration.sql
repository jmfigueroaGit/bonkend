-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_subscriptionId_fkey`;

-- AlterTable
ALTER TABLE `user` MODIFY `subscriptionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
