-- AlterTable
ALTER TABLE `sports` MODIFY `gender` ENUM('MALE', 'FEMALE', 'MIXED') NOT NULL;

-- AlterTable
ALTER TABLE `student_athletes` MODIFY `gender` ENUM('MALE', 'FEMALE', 'MIXED') NOT NULL;

-- AlterTable
ALTER TABLE `teams` MODIFY `gender` ENUM('MALE', 'FEMALE', 'MIXED') NOT NULL;
