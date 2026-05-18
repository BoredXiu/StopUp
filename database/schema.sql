-- ============================================================
-- 拼个场 (SpotUp) 数据库设计
-- 年轻人的运动拼场与搭子组局平台
-- ============================================================

CREATE DATABASE IF NOT EXISTS ai_spotup DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_spotup;

-- ============================================================
-- 1. 用户表
-- ============================================================
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(64) DEFAULT NULL COMMENT '微信openid',
  `unionid` VARCHAR(64) DEFAULT NULL COMMENT '微信unionid',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `password` VARCHAR(255) DEFAULT NULL COMMENT '密码哈希(手机号登录)',
  `nickname` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `gender` TINYINT UNSIGNED DEFAULT 0 COMMENT '性别: 0未知 1男 2女',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `bio` VARCHAR(200) DEFAULT '' COMMENT '个性签名',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '所在城市',
  `credit_score` INT NOT NULL DEFAULT 100 COMMENT '信用分(满分100)',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_city` (`city`),
  KEY `idx_credit_score` (`credit_score`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 2. 运动类型表
-- ============================================================
CREATE TABLE `sports` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL COMMENT '运动名称',
  `icon` VARCHAR(500) DEFAULT NULL COMMENT '图标URL',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1启用 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动类型表';

-- ============================================================
-- 3. 用户运动标签表
-- ============================================================
CREATE TABLE `user_sport_tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `sport_id` INT UNSIGNED NOT NULL,
  `level` TINYINT UNSIGNED DEFAULT 1 COMMENT '水平: 1入门 2初级 3中级 4高级 5专业',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_sport` (`user_id`, `sport_id`),
  KEY `idx_sport_id` (`sport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户运动标签表';

-- ============================================================
-- 4. 场馆表
-- ============================================================
CREATE TABLE `venues` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '场馆名称',
  `address` VARCHAR(300) NOT NULL COMMENT '详细地址',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) DEFAULT NULL COMMENT '区/县',
  `latitude` DECIMAL(10, 7) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10, 7) NOT NULL COMMENT '经度',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `business_hours` VARCHAR(100) DEFAULT NULL COMMENT '营业时间(如: 09:00-22:00)',
  `description` TEXT COMMENT '场馆介绍',
  `facilities` JSON DEFAULT NULL COMMENT '设施列表JSON',
  `cover_image` VARCHAR(500) DEFAULT NULL COMMENT '封面图',
  `rating` DECIMAL(2, 1) NOT NULL DEFAULT 5.0 COMMENT '评分',
  `match_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '举办球局数',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1正常 0下架',
  `is_hot` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否热门推荐',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_city` (`city`),
  KEY `idx_district` (`district`),
  KEY `idx_status` (`status`),
  KEY `idx_is_hot` (`is_hot`),
  KEY `idx_rating` (`rating`),
  KEY `idx_location` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场馆表';

-- ============================================================
-- 5. 场馆图片表
-- ============================================================
CREATE TABLE `venue_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `venue_id` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venue_id` (`venue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场馆图片表';

-- ============================================================
-- 6. 球局表（核心）
-- ============================================================
CREATE TABLE `matches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL COMMENT '球局标题',
  `sport_id` INT UNSIGNED NOT NULL COMMENT '运动类型ID',
  `venue_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '场馆ID',
  `creator_id` BIGINT UNSIGNED NOT NULL COMMENT '创建者ID',
  `match_date` DATE NOT NULL COMMENT '球局日期',
  `start_time` TIME NOT NULL COMMENT '开始时间',
  `end_time` TIME NOT NULL COMMENT '结束时间',
  `max_players` INT UNSIGNED NOT NULL COMMENT '最大人数',
  `min_players` INT UNSIGNED NOT NULL DEFAULT 2 COMMENT '最少成局人数',
  `current_players` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '当前已报名人数',
  `fee_type` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '费用模式: 1AA制 2固定费用 3免费',
  `total_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '总费用(分)',
  `per_person_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '人均费用(分)',
  `level_required` TINYINT UNSIGNED DEFAULT 0 COMMENT '水平要求: 0不限 1入门 2初级 3中级 4高级 5专业',
  `gender_required` TINYINT UNSIGNED DEFAULT 0 COMMENT '性别要求: 0不限 1仅男生 2仅女生',
  `description` TEXT COMMENT '球局描述/备注',
  `cover_image` VARCHAR(500) DEFAULT NULL COMMENT '封面图',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1报名中 2已满员 3已开始 4已结束 5已取消',
  `cancel_reason` VARCHAR(300) DEFAULT NULL COMMENT '取消原因',
  `is_featured` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否推荐',
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sport_id` (`sport_id`),
  KEY `idx_venue_id` (`venue_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_status` (`status`),
  KEY `idx_match_date` (`match_date`),
  KEY `idx_city_date` (`status`, `match_date`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='球局表';

-- ============================================================
-- 7. 球局成员表
-- ============================================================
CREATE TABLE `match_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role` TINYINT UNSIGNED NOT NULL DEFAULT 2 COMMENT '角色: 1创建者 2参与者',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1已报名 2已签到 3已退出 4已取消',
  `check_in_at` DATETIME DEFAULT NULL COMMENT '签到时间',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_match_user` (`match_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='球局成员表';

-- ============================================================
-- 8. 订单表
-- ============================================================
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '订单金额(元)',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1待支付 2已支付 3已取消 4已完成 5已退款',
  `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
  `refund_at` DATETIME DEFAULT NULL COMMENT '退款时间',
  `refund_amount` DECIMAL(10, 2) DEFAULT NULL COMMENT '退款金额',
  `expire_at` DATETIME DEFAULT NULL COMMENT '支付过期时间',
  `remark` VARCHAR(300) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_match_id` (`match_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expire_at` (`expire_at`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================================
-- 9. 支付记录表
-- ============================================================
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_no` VARCHAR(32) NOT NULL COMMENT '支付流水号',
  `order_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '支付金额(元)',
  `channel` VARCHAR(20) NOT NULL DEFAULT 'wechat' COMMENT '支付渠道: wechat微信支付',
  `transaction_id` VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1待支付 2支付成功 3支付失败 4已退款',
  `paid_at` DATETIME DEFAULT NULL COMMENT '支付成功时间',
  `raw_data` JSON DEFAULT NULL COMMENT '回调原始数据',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  UNIQUE KEY `uk_transaction_id` (`transaction_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- ============================================================
-- 10. 关注表
-- ============================================================
CREATE TABLE `follows` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `follower_id` BIGINT UNSIGNED NOT NULL COMMENT '关注者ID',
  `followed_id` BIGINT UNSIGNED NOT NULL COMMENT '被关注者ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follow` (`follower_id`, `followed_id`),
  KEY `idx_followed_id` (`followed_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- ============================================================
-- 11. 球局收藏表
-- ============================================================
CREATE TABLE `match_favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_match` (`user_id`, `match_id`),
  KEY `idx_match_id` (`match_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='球局收藏表';

-- ============================================================
-- 12. 通知表
-- ============================================================
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(30) NOT NULL COMMENT '通知类型: system系统 match_join报名 match_full满员 match_success成局 match_cancel取消 payment支付 remind提醒',
  `title` VARCHAR(100) NOT NULL COMMENT '通知标题',
  `content` TEXT COMMENT '通知内容',
  `related_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联业务ID',
  `related_type` VARCHAR(30) DEFAULT NULL COMMENT '关联业务类型: match, order, user',
  `is_read` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否已读',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`, `is_read`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- ============================================================
-- 13. 举报表
-- ============================================================
CREATE TABLE `reports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reporter_id` BIGINT UNSIGNED NOT NULL COMMENT '举报人ID',
  `reported_user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '被举报用户ID',
  `match_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联球局ID',
  `type` VARCHAR(30) NOT NULL COMMENT '举报类型: no_show放鸽子 violation违规 abuse恶意骚扰 other其他',
  `reason` VARCHAR(500) NOT NULL COMMENT '举报原因',
  `images` JSON DEFAULT NULL COMMENT '举证图片',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1待审核 2已通过 3已驳回',
  `handle_result` VARCHAR(300) DEFAULT NULL COMMENT '处理结果',
  `handler_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '处理人ID',
  `handled_at` DATETIME DEFAULT NULL COMMENT '处理时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_reported_user_id` (`reported_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';

-- ============================================================
-- 14. 信用日志表
-- ============================================================
CREATE TABLE `credit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `change_amount` INT NOT NULL COMMENT '变化值(正加负扣)',
  `balance` INT NOT NULL COMMENT '变化后余额',
  `reason` VARCHAR(50) NOT NULL COMMENT '原因: join_match参加 no_show放鸽子 complete_match完成 report_approved举报成立',
  `related_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联业务ID',
  `related_type` VARCHAR(30) DEFAULT NULL COMMENT '关联业务类型',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_reason` (`reason`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信用日志表';

-- ============================================================
-- 15. 管理员表
-- ============================================================
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `nickname` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像',
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin' COMMENT '角色: super_admin超级管理员 admin普通管理员',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `last_login_at` DATETIME DEFAULT NULL,
  `last_login_ip` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================================
-- 16. 系统配置表
-- ============================================================
CREATE TABLE `system_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(50) NOT NULL COMMENT '配置键',
  `config_value` TEXT NOT NULL COMMENT '配置值',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '配置说明',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================================
-- 初始数据
-- ============================================================

-- 运动类型
INSERT INTO `sports` (`name`, `sort_order`) VALUES
('篮球', 1),
('足球', 2),
('羽毛球', 3),
('乒乓球', 4),
('网球', 5),
('排球', 6),
('台球', 7),
('游泳', 8),
('跑步', 9),
('健身', 10),
('瑜伽', 11),
('飞盘', 12),
('骑行', 13),
('攀岩', 14),
('滑雪', 15);

-- 默认管理员 (密码: admin123, bcrypt哈希)
INSERT INTO `admin_users` (`username`, `password`, `nickname`, `role`) VALUES
('admin', '$2b$10$placeholder_hash_for_admin123', '超级管理员', 'super_admin');

-- 系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES
('order_expire_minutes', '30', '订单超时自动取消时间(分钟)'),
('min_credit_to_join', '60', '报名最低信用分'),
('credit_join_reward', '2', '参加球局信用奖励'),
('credit_no_show_penalty', '20', '放鸽子信用扣分'),
('credit_complete_reward', '5', '完成球局信用奖励'),
('max_daily_matches', '10', '每日最多创建球局数');