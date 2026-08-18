-- AlterTable
ALTER TABLE `seasons` ADD COLUMN `created_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `teams` ADD COLUMN `founding_year` INTEGER NULL;

-- CreateTable
CREATE TABLE `team_squad` (
    `id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `season_id` VARCHAR(191) NOT NULL,
    `jersey_number` INTEGER NULL,
    `position` VARCHAR(191) NULL,
    `is_captain` BOOLEAN NOT NULL DEFAULT false,
    `is_vice_captain` BOOLEAN NOT NULL DEFAULT false,
    `joined_date` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INJURED', 'SUSPENDED', 'TRANSFERRED', 'RELEASED') NOT NULL DEFAULT 'ACTIVE',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `team_squad_athlete_id_idx`(`athlete_id`),
    UNIQUE INDEX `team_squad_team_id_athlete_id_season_id_key`(`team_id`, `athlete_id`, `season_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_staff` (
    `id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('HEAD_COACH', 'ASSISTANT_COACH', 'TEAM_MANAGER', 'FITNESS_TRAINER', 'PHYSIO', 'OTHER') NOT NULL,
    `assigned_date` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `team_staff_user_id_idx`(`user_id`),
    UNIQUE INDEX `team_staff_team_id_user_id_role_key`(`team_id`, `user_id`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seasons` ADD CONSTRAINT `seasons_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_squad` ADD CONSTRAINT `team_squad_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_squad` ADD CONSTRAINT `team_squad_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_squad` ADD CONSTRAINT `team_squad_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_staff` ADD CONSTRAINT `team_staff_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_staff` ADD CONSTRAINT `team_staff_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `teams` RENAME INDEX `teams_sport_id_fkey` TO `teams_sport_id_idx`;
