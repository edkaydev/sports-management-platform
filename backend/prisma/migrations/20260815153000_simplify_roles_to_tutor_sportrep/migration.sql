-- Widen the enum to hold both old and new role values
ALTER TABLE `users` MODIFY `role` ENUM('TUTOR', 'SPORTS_REP', 'SUPER_ADMIN', 'SPORTS_ADMIN', 'COACH', 'TEAM_MANAGER', 'OFFICIAL', 'ACADEMIC', 'ATHLETE', 'UNI_ADMIN', 'RECRUITER') NOT NULL;

-- Map existing roles to the new two-role model
UPDATE `users` SET `role` = 'TUTOR' WHERE `role` IN ('SUPER_ADMIN', 'SPORTS_ADMIN', 'UNI_ADMIN', 'ACADEMIC', 'RECRUITER');
UPDATE `users` SET `role` = 'SPORTS_REP' WHERE `role` IN ('COACH', 'TEAM_MANAGER', 'OFFICIAL', 'ATHLETE');

-- Narrow the enum to the new roles
ALTER TABLE `users` MODIFY `role` ENUM('TUTOR', 'SPORTS_REP') NOT NULL;
