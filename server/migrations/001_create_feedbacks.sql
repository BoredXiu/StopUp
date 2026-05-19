CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT 'bug|feature|experience|ui|other',
  `content` TEXT NOT NULL,
  `images` JSON NULL,
  `contact` VARCHAR(50) NULL,
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1-待处理, 2-已处理, 3-已忽略',
  `handler_id` INT NULL,
  `reply` VARCHAR(500) NULL,
  `handled_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;