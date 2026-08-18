-- CreateTable
CREATE TABLE `prospects` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'MIXED') NOT NULL,
    `date_of_birth` DATETIME(3) NULL,
    `school_or_institution` VARCHAR(191) NULL,
    `programme_applied` VARCHAR(191) NULL,
    `sport_id` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NULL,
    `previous_level` ENUM('SECONDARY', 'CLUB', 'DISTRICT', 'NATIONAL', 'INTERNATIONAL', 'NONE') NULL,
    `previous_clubs` VARCHAR(191) NULL,
    `previous_achievements` VARCHAR(191) NULL,
    `referred_by` VARCHAR(191) NULL,
    `source` ENUM('SELF', 'SCOUT', 'COACH_REFERRAL', 'WALK_IN', 'OTHER') NOT NULL DEFAULT 'SELF',
    `status` ENUM('PROSPECT', 'REGISTERED', 'TRIAL_SCHEDULED', 'TRIAL_COMPLETED', 'SELECTED', 'REJECTED', 'ENROLLED', 'WITHDRAWN') NOT NULL DEFAULT 'PROSPECT',
    `notes` TEXT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `prospects_sport_id_idx`(`sport_id`),
    INDEX `prospects_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trials` (
    `id` VARCHAR(191) NOT NULL,
    `sport_id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NULL,
    `trial_date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NULL,
    `conducted_by` VARCHAR(191) NULL,
    `season_id` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `trials_sport_id_idx`(`sport_id`),
    INDEX `trials_trial_date_idx`(`trial_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trial_participants` (
    `id` VARCHAR(191) NOT NULL,
    `trial_id` VARCHAR(191) NOT NULL,
    `prospect_id` VARCHAR(191) NOT NULL,
    `attended` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trial_participants_prospect_id_idx`(`prospect_id`),
    UNIQUE INDEX `trial_participants_trial_id_prospect_id_key`(`trial_id`, `prospect_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trial_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `trial_id` VARCHAR(191) NOT NULL,
    `prospect_id` VARCHAR(191) NOT NULL,
    `assessed_by` VARCHAR(191) NULL,
    `assessed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `score_technical` DECIMAL(3, 1) NULL,
    `score_physical` DECIMAL(3, 1) NULL,
    `score_speed` DECIMAL(3, 1) NULL,
    `score_tactical` DECIMAL(3, 1) NULL,
    `score_teamwork` DECIMAL(3, 1) NULL,
    `score_discipline` DECIMAL(3, 1) NULL,
    `score_academic` DECIMAL(3, 1) NULL,
    `overall_score` DECIMAL(3, 1) NULL,
    `recommended_position` VARCHAR(191) NULL,
    `recommendation` ENUM('STRONGLY_RECOMMEND', 'RECOMMEND', 'NEUTRAL', 'NOT_RECOMMENDED') NOT NULL DEFAULT 'NEUTRAL',
    `selectionOutcome` ENUM('SELECTED', 'RESERVE', 'REJECTED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `coach_notes` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `trial_assessments_prospect_id_idx`(`prospect_id`),
    UNIQUE INDEX `trial_assessments_trial_id_prospect_id_key`(`trial_id`, `prospect_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recruitment_records` (
    `id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `prospect_id` VARCHAR(191) NOT NULL,
    `trial_id` VARCHAR(191) NULL,
    `assessment_id` VARCHAR(191) NULL,
    `enrolled_date` DATETIME(3) NULL,
    `enrolled_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `recruitment_records_athlete_id_key`(`athlete_id`),
    UNIQUE INDEX `recruitment_records_prospect_id_key`(`prospect_id`),
    UNIQUE INDEX `recruitment_records_assessment_id_key`(`assessment_id`),
    INDEX `recruitment_records_athlete_id_idx`(`athlete_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `prospects` ADD CONSTRAINT `prospects_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prospects` ADD CONSTRAINT `prospects_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trials` ADD CONSTRAINT `trials_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trials` ADD CONSTRAINT `trials_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trials` ADD CONSTRAINT `trials_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trials` ADD CONSTRAINT `trials_conducted_by_fkey` FOREIGN KEY (`conducted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trials` ADD CONSTRAINT `trials_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trial_participants` ADD CONSTRAINT `trial_participants_trial_id_fkey` FOREIGN KEY (`trial_id`) REFERENCES `trials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trial_participants` ADD CONSTRAINT `trial_participants_prospect_id_fkey` FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trial_assessments` ADD CONSTRAINT `trial_assessments_trial_id_fkey` FOREIGN KEY (`trial_id`) REFERENCES `trials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trial_assessments` ADD CONSTRAINT `trial_assessments_prospect_id_fkey` FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trial_assessments` ADD CONSTRAINT `trial_assessments_assessed_by_fkey` FOREIGN KEY (`assessed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_records` ADD CONSTRAINT `recruitment_records_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_records` ADD CONSTRAINT `recruitment_records_prospect_id_fkey` FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_records` ADD CONSTRAINT `recruitment_records_trial_id_fkey` FOREIGN KEY (`trial_id`) REFERENCES `trials`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_records` ADD CONSTRAINT `recruitment_records_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `trial_assessments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_records` ADD CONSTRAINT `recruitment_records_enrolled_by_fkey` FOREIGN KEY (`enrolled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
