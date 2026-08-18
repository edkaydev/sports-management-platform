-- CreateTable
CREATE TABLE `player_match_performances` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NOT NULL,
    `minutes_played` INTEGER NOT NULL,
    `points` INTEGER NULL DEFAULT 0,
    `assists` INTEGER NULL DEFAULT 0,
    `rebounds` INTEGER NULL DEFAULT 0,
    `steals` INTEGER NULL DEFAULT 0,
    `blocks` INTEGER NULL DEFAULT 0,
    `goals` INTEGER NULL DEFAULT 0,
    `shots_on_target` INTEGER NULL,
    `saves` INTEGER NULL DEFAULT 0,
    `tackles` INTEGER NULL DEFAULT 0,
    `interceptions` INTEGER NULL DEFAULT 0,
    `passes_completed` INTEGER NULL,
    `passes_attempted` INTEGER NULL,
    `fouls` INTEGER NULL DEFAULT 0,
    `yellow_cards` INTEGER NULL DEFAULT 0,
    `red_cards` INTEGER NULL DEFAULT 0,
    `sprints` INTEGER NULL DEFAULT 0,
    `distance_covered_km` DECIMAL(5, 2) NULL,
    `max_speed_kph` DECIMAL(5, 2) NULL,
    `rating` DECIMAL(3, 1) NULL,
    `notes` TEXT NULL,
    `recorded_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `player_match_performances_athlete_id_idx`(`athlete_id`),
    INDEX `player_match_performances_match_id_idx`(`match_id`),
    UNIQUE INDEX `player_match_performances_match_id_athlete_id_key`(`match_id`, `athlete_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sport_id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NULL,
    `season_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `session_date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NULL,
    `end_time` VARCHAR(191) NULL,
    `focus_areas` TEXT NULL,
    `intensity` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `training_sessions_session_date_idx`(`session_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_attendance` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'EXCUSED', 'LATE') NOT NULL DEFAULT 'PRESENT',
    `notes` TEXT NULL,
    `recorded_by` VARCHAR(191) NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `training_attendance_athlete_id_idx`(`athlete_id`),
    UNIQUE INDEX `training_attendance_session_id_athlete_id_key`(`session_id`, `athlete_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `player_match_performances` ADD CONSTRAINT `player_match_performances_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_match_performances` ADD CONSTRAINT `player_match_performances_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_match_performances` ADD CONSTRAINT `player_match_performances_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_match_performances` ADD CONSTRAINT `player_match_performances_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_sessions` ADD CONSTRAINT `training_sessions_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_sessions` ADD CONSTRAINT `training_sessions_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_sessions` ADD CONSTRAINT `training_sessions_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_sessions` ADD CONSTRAINT `training_sessions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_attendance` ADD CONSTRAINT `training_attendance_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `training_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_attendance` ADD CONSTRAINT `training_attendance_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_attendance` ADD CONSTRAINT `training_attendance_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
