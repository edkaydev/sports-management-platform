-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('GALA', 'TOURNAMENT', 'LEAGUE', 'COMPETITION', 'FRIENDLY', 'TRIAL', 'TRAINING', 'FESTIVAL', 'SPECIAL') NOT NULL,
    `level` ENUM('CAMPUS', 'FACULTY', 'UNIVERSITY', 'LOCAL', 'NATIONAL', 'REGIONAL', 'INTERNATIONAL') NOT NULL,
    `sport_id` VARCHAR(191) NULL,
    `season_id` VARCHAR(191) NULL,
    `organizer` VARCHAR(191) NULL,
    `host_institution` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `description` TEXT NULL,
    `status` ENUM('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED') NOT NULL DEFAULT 'PLANNED',
    `format` ENUM('KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE', 'GROUP_STAGE', 'SINGLE_MATCH', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `max_teams` INTEGER NULL,
    `max_participants` INTEGER NULL,
    `registration_deadline` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `events_type_idx`(`type`),
    INDEX `events_level_idx`(`level`),
    INDEX `events_start_date_idx`(`start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_participants` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `participant_type` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NULL,
    `athlete_id` VARCHAR(191) NULL,
    `registered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'REGISTERED',

    INDEX `event_participants_event_id_idx`(`event_id`),
    UNIQUE INDEX `event_participants_event_id_team_id_key`(`event_id`, `team_id`),
    UNIQUE INDEX `event_participants_event_id_athlete_id_key`(`event_id`, `athlete_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `sport_id` VARCHAR(191) NOT NULL,
    `season_id` VARCHAR(191) NULL,
    `match_number` INTEGER NULL,
    `round` VARCHAR(191) NULL,
    `home_team_id` VARCHAR(191) NULL,
    `away_team_id` VARCHAR(191) NULL,
    `home_individual_id` VARCHAR(191) NULL,
    `away_individual_id` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NULL,
    `scheduled_date` DATETIME(3) NOT NULL,
    `scheduled_time` VARCHAR(191) NULL,
    `actual_start_time` DATETIME(3) NULL,
    `actual_end_time` DATETIME(3) NULL,
    `home_score` INTEGER NULL,
    `away_score` INTEGER NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'ABANDONED') NOT NULL DEFAULT 'SCHEDULED',
    `match_type` ENUM('LEAGUE', 'KNOCKOUT', 'FRIENDLY', 'GALA', 'TRIAL', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `notes` TEXT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `matches_event_id_idx`(`event_id`),
    INDEX `matches_scheduled_date_idx`(`scheduled_date`),
    INDEX `matches_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_lineups` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NOT NULL,
    `submitted_by` VARCHAR(191) NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_confirmed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `match_lineups_match_id_team_id_key`(`match_id`, `team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_lineup_entries` (
    `id` VARCHAR(191) NOT NULL,
    `lineup_id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `jersey_number` INTEGER NULL,
    `position` VARCHAR(191) NULL,
    `is_starter` BOOLEAN NOT NULL DEFAULT false,
    `is_captain` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NULL,

    INDEX `match_lineup_entries_lineup_id_idx`(`lineup_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_events` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `minute` INTEGER NULL,
    `team_id` VARCHAR(191) NULL,
    `athlete_id` VARCHAR(191) NULL,
    `secondary_athlete_id` VARCHAR(191) NULL,
    `details` TEXT NULL,
    `recorded_by` VARCHAR(191) NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `match_events_match_id_idx`(`match_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_results` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `home_score` INTEGER NOT NULL,
    `away_score` INTEGER NOT NULL,
    `winner_team_id` VARCHAR(191) NULL,
    `result_type` VARCHAR(191) NOT NULL,
    `home_penalties` INTEGER NULL,
    `away_penalties` INTEGER NULL,
    `walkover` BOOLEAN NOT NULL DEFAULT false,
    `verified_by` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,

    UNIQUE INDEX `match_results_match_id_key`(`match_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_reports` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `submitted_by` VARCHAR(191) NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `summary` TEXT NULL,
    `mvp_athlete_id` VARCHAR(191) NULL,
    `attendance_count` INTEGER NULL,
    `notable_incidents` TEXT NULL,
    `coaching_notes` TEXT NULL,

    UNIQUE INDEX `match_reports_match_id_key`(`match_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_trial_id_fkey` FOREIGN KEY (`trial_id`) REFERENCES `trials`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_home_team_id_fkey` FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_away_team_id_fkey` FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_home_individual_id_fkey` FOREIGN KEY (`home_individual_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_away_individual_id_fkey` FOREIGN KEY (`away_individual_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_lineups` ADD CONSTRAINT `match_lineups_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_lineups` ADD CONSTRAINT `match_lineups_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_lineups` ADD CONSTRAINT `match_lineups_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_lineup_entries` ADD CONSTRAINT `match_lineup_entries_lineup_id_fkey` FOREIGN KEY (`lineup_id`) REFERENCES `match_lineups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_lineup_entries` ADD CONSTRAINT `match_lineup_entries_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_secondary_athlete_id_fkey` FOREIGN KEY (`secondary_athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_winner_team_id_fkey` FOREIGN KEY (`winner_team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_reports` ADD CONSTRAINT `match_reports_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_reports` ADD CONSTRAINT `match_reports_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_reports` ADD CONSTRAINT `match_reports_mvp_athlete_id_fkey` FOREIGN KEY (`mvp_athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
