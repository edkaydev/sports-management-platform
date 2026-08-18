-- CreateTable
CREATE TABLE `equipment_items` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('BALL', 'UNIFORM', 'PROTECTIVE_GEAR', 'TRAINING_TOOL', 'MATCH_GEAR', 'MEDICAL', 'ELECTRONIC', 'OFFICE', 'OTHER') NOT NULL,
    `asset_number` VARCHAR(191) NULL,
    `serial_number` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `condition` ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') NOT NULL DEFAULT 'NEW',
    `status` ENUM('AVAILABLE', 'ISSUED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED') NOT NULL DEFAULT 'AVAILABLE',
    `sport_id` VARCHAR(191) NULL,
    `storage_location` VARCHAR(191) NULL,
    `purchased_date` DATETIME(3) NULL,
    `purchase_cost` DECIMAL(10, 2) NULL,
    `notes` TEXT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `equipment_items_asset_number_key`(`asset_number`),
    INDEX `equipment_items_category_idx`(`category`),
    INDEX `equipment_items_status_idx`(`status`),
    INDEX `equipment_items_sport_id_idx`(`sport_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `equipment_id` VARCHAR(191) NOT NULL,
    `assigned_to_type` ENUM('ATHLETE', 'TEAM') NOT NULL,
    `athlete_id` VARCHAR(191) NULL,
    `team_id` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `assigned_by` VARCHAR(191) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `due_date` DATETIME(3) NULL,
    `returned_at` DATETIME(3) NULL,
    `condition_on_return` ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') NULL,
    `notes` TEXT NULL,

    INDEX `equipment_assignments_equipment_id_idx`(`equipment_id`),
    INDEX `equipment_assignments_athlete_id_idx`(`athlete_id`),
    INDEX `equipment_assignments_team_id_idx`(`team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipment_items` ADD CONSTRAINT `equipment_items_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_items` ADD CONSTRAINT `equipment_items_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_assignments` ADD CONSTRAINT `equipment_assignments_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_assignments` ADD CONSTRAINT `equipment_assignments_athlete_id_fkey` FOREIGN KEY (`athlete_id`) REFERENCES `student_athletes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_assignments` ADD CONSTRAINT `equipment_assignments_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment_assignments` ADD CONSTRAINT `equipment_assignments_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
