-- CreateTable
CREATE TABLE `student_athletes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `registration_number` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `date_of_birth` DATETIME(3) NULL,
    `email` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `year_of_study` INTEGER NULL,
    `programme` VARCHAR(191) NULL,
    `faculty` VARCHAR(191) NULL,
    `athlete_type` ENUM('REGULAR', 'SCHOLARSHIP', 'CONTRACT') NOT NULL DEFAULT 'REGULAR',
    `status` ENUM('ACTIVE', 'INJURED', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `profile_photo_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `student_athletes_user_id_key`(`user_id`),
    UNIQUE INDEX `student_athletes_registration_number_key`(`registration_number`),
    INDEX `student_athletes_status_idx`(`status`),
    INDEX `student_athletes_athlete_type_idx`(`athlete_type`),
    INDEX `student_athletes_faculty_idx`(`faculty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_declarations` (
    `id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `has_condition` BOOLEAN NOT NULL,
    `condition_description` VARCHAR(191) NULL,
    `declared_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,

    UNIQUE INDEX `medical_declarations_athlete_id_key`(`athlete_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sports` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `category` ENUM('TEAM', 'INDIVIDUAL') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sports_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `short_name` VARCHAR(191) NULL,
    `sport_id` VARCHAR(191) NOT NULL,
    `season_id` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `logo_url` VARCHAR(191) NULL,
    `home_venue` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sport_affiliations` (
    `id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `sport_id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `jersey_number` INTEGER NULL,
    `is_captain` BOOLEAN NOT NULL DEFAULT false,
    `is_vice_captain` BOOLEAN NOT NULL DEFAULT false,
    `joined_date` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INJURED', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sport_affiliations_sport_id_idx`(`sport_id`),
    UNIQUE INDEX `sport_affiliations_athlete_id_sport_id_team_id_key`(`athlete_id`, `sport_id`, `team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_athletes` ADD CONSTRAINT `student_athletes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_declarations` ADD CONSTRAINT `medical_declarations_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sport_affiliations` ADD CONSTRAINT `sport_affiliations_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sport_affiliations` ADD CONSTRAINT `sport_affiliations_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sport_affiliations` ADD CONSTRAINT `sport_affiliations_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
