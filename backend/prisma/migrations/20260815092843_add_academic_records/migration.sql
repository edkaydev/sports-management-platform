-- CreateTable
CREATE TABLE `academic_records` (
    `id` VARCHAR(191) NOT NULL,
    `athlete_id` VARCHAR(191) NOT NULL,
    `academic_year` VARCHAR(191) NOT NULL,
    `semester` ENUM('SEM1', 'SEM2', 'RESIT') NOT NULL,
    `year_of_study` INTEGER NULL,
    `gpa` DECIMAL(3, 2) NULL,
    `cgpa` DECIMAL(3, 2) NULL,
    `total_credit_units_taken` INTEGER NULL,
    `total_credit_units_passed` INTEGER NULL,
    `failed_units` INTEGER NOT NULL DEFAULT 0,
    `attendance_percentage` DECIMAL(5, 2) NULL,
    `academic_standing` ENUM('GOOD_STANDING', 'WARNING', 'PROBATION', 'ACADEMIC_SUSPENSION', 'WITHDRAWN') NOT NULL DEFAULT 'GOOD_STANDING',
    `entered_by` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `academic_records_athlete_id_idx`(`athlete_id`),
    INDEX `academic_records_academic_standing_idx`(`academic_standing`),
    UNIQUE INDEX `academic_records_athlete_id_academic_year_semester_key`(`athlete_id`, `academic_year`, `semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_course_results` (
    `id` VARCHAR(191) NOT NULL,
    `academic_record_id` VARCHAR(191) NOT NULL,
    `course_code` VARCHAR(191) NOT NULL,
    `course_name` VARCHAR(191) NOT NULL,
    `credit_units` INTEGER NOT NULL,
    `marks` DECIMAL(5, 2) NULL,
    `grade` VARCHAR(191) NULL,
    `result` ENUM('PASS', 'FAIL', 'INCOMPLETE', 'WITHDRAWN') NOT NULL,
    `retake` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `academic_course_results_academic_record_id_idx`(`academic_record_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `academic_records` ADD CONSTRAINT `academic_records_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_records` ADD CONSTRAINT `academic_records_entered_by_fkey` FOREIGN KEY (`entered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_course_results` ADD CONSTRAINT `academic_course_results_academic_record_id_fkey` FOREIGN KEY (`academic_record_id`) REFERENCES `academic_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
