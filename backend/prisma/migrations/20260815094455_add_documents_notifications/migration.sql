-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('REGISTRATION', 'MEDICAL', 'ACADEMIC', 'SCHOLARSHIP', 'CONTRACT', 'COMPETITION', 'MATCH', 'RECRUITMENT', 'IDENTIFICATION', 'CORRESPONDENCE', 'OTHER') NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_type` ENUM('PDF', 'JPEG', 'PNG', 'DOCX', 'XLSX', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `file_size_bytes` INTEGER NULL,
    `owner_type` ENUM('ATHLETE', 'TEAM', 'EVENT', 'MATCH', 'TRIAL', 'DEPARTMENT') NOT NULL,
    `athlete_id` VARCHAR(191) NULL,
    `team_id` VARCHAR(191) NULL,
    `event_id` VARCHAR(191) NULL,
    `match_id` VARCHAR(191) NULL,
    `trial_id` VARCHAR(191) NULL,
    `expiry_date` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'SUPERSEDED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `verified_by` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `uploaded_by` VARCHAR(191) NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `documents_athlete_id_idx`(`athlete_id`),
    INDEX `documents_owner_type_idx`(`owner_type`),
    INDEX `documents_category_idx`(`category`),
    INDEX `documents_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('ACADEMIC_WARNING', 'ACADEMIC_PROBATION', 'FAILED_UNIT', 'LOW_ATTENDANCE', 'MISSING_ACADEMIC_RECORD', 'SCHOLARSHIP_EXPIRING', 'SCHOLARSHIP_EXPIRED', 'SCHOLARSHIP_AT_RISK', 'SCHOLARSHIP_REVIEW', 'CONTRACT_EXPIRING', 'CONTRACT_EXPIRED', 'DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED', 'DOCUMENT_MISSING', 'FIXTURE_REMINDER', 'LINEUP_DUE', 'MATCH_RESULT_PENDING', 'MATCH_REPORT_PENDING', 'TRIAL_REMINDER', 'ASSESSMENT_PENDING', 'PROSPECT_AWAITING_DECISION', 'POOR_FORM', 'FREQUENT_CARDS', 'TRAINING_ABSENCES', 'SYSTEM') NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'INFO',
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `recipient_user_id` VARCHAR(191) NOT NULL,
    `related_athlete_id` VARCHAR(191) NULL,
    `related_entity_type` VARCHAR(191) NULL,
    `related_entity_id` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,

    INDEX `notifications_recipient_user_id_is_read_idx`(`recipient_user_id`, `is_read`),
    INDEX `notifications_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_related_athlete_id_fkey` FOREIGN KEY (`related_athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
