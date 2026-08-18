-- CreateTable
CREATE TABLE `scholarships` (
    `id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `scholarship_type` ENUM('FULL', 'PARTIAL', 'SPONSORSHIP', 'BURSARY') NOT NULL,
    `sponsor_name` VARCHAR(191) NULL,
    `coverage_description` VARCHAR(191) NULL,
    `coverage_percentage` DECIMAL(5, 2) NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `renewable` BOOLEAN NOT NULL DEFAULT false,
    `renewal_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'RENEWED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `academic_requirement_gpa` DECIMAL(3, 2) NULL,
    `sports_requirement` VARCHAR(191) NULL,
    `awarded_by` VARCHAR(191) NULL,
    `awarded_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revoked_by` VARCHAR(191) NULL,
    `revoked_at` DATETIME(3) NULL,
    `revocation_reason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `scholarships_athlete_id_idx`(`athlete_id`),
    INDEX `scholarships_status_idx`(`status`),
    INDEX `scholarships_end_date_idx`(`end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scholarship_renewals` (
    `id` VARCHAR(191) NOT NULL,
    `scholarship_id` VARCHAR(191) NOT NULL,
    `previous_end_date` DATETIME(3) NOT NULL,
    `new_end_date` DATETIME(3) NOT NULL,
    `renewed_by` VARCHAR(191) NOT NULL,
    `renewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gpa_at_renewal` DECIMAL(3, 2) NULL,
    `notes` TEXT NULL,
    `renewal_number` INTEGER NOT NULL,

    INDEX `scholarship_renewals_scholarship_id_idx`(`scholarship_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `athlete_contracts` (
    `id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `contract_type` ENUM('PLAYING', 'COACHING_DEVELOPMENT', 'AMBASSADOR', 'OTHER') NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `terms_summary` VARCHAR(191) NULL,
    `has_accompanying_scholarship` BOOLEAN NOT NULL DEFAULT false,
    `scholarship_id` VARCHAR(191) NULL,
    `signed_by_athlete` BOOLEAN NOT NULL DEFAULT false,
    `signed_at` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'TERMINATED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `terminated_by` VARCHAR(191) NULL,
    `termination_date` DATETIME(3) NULL,
    `termination_reason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `athlete_contracts_athlete_id_idx`(`athlete_id`),
    INDEX `athlete_contracts_status_idx`(`status`),
    INDEX `athlete_contracts_end_date_idx`(`end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `scholarships` ADD CONSTRAINT `scholarships_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scholarships` ADD CONSTRAINT `scholarships_awarded_by_fkey` FOREIGN KEY (`awarded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scholarships` ADD CONSTRAINT `scholarships_revoked_by_fkey` FOREIGN KEY (`revoked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scholarship_renewals` ADD CONSTRAINT `scholarship_renewals_scholarship_id_fkey` FOREIGN KEY (`scholarship_id`) REFERENCES `scholarships`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scholarship_renewals` ADD CONSTRAINT `scholarship_renewals_renewed_by_fkey` FOREIGN KEY (`renewed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `athlete_contracts` ADD CONSTRAINT `athlete_contracts_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `athlete_contracts` ADD CONSTRAINT `athlete_contracts_scholarship_id_fkey` FOREIGN KEY (`scholarship_id`) REFERENCES `scholarships`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `athlete_contracts` ADD CONSTRAINT `athlete_contracts_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `athlete_contracts` ADD CONSTRAINT `athlete_contracts_terminated_by_fkey` FOREIGN KEY (`terminated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
