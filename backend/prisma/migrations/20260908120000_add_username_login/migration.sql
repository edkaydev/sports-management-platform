-- Add username column (temporarily nullable for backfill)
ALTER TABLE `users` ADD COLUMN `username` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `users_username_key`(`username`);

-- Backfill so existing users keep their login
UPDATE `users` SET `username` = `email` WHERE `username` IS NULL AND `email` IS NOT NULL;

-- Email is now optional; username is required
ALTER TABLE `users` MODIFY `email` VARCHAR(191) NULL;
ALTER TABLE `users` MODIFY `username` VARCHAR(191) NOT NULL;