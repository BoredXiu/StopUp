-- ============================================================
-- 拼个场 (SpotUp) 种子数据
-- 包含每个表至少20条测试数据
-- 数据库名: ai_spotup
-- ============================================================

USE ai_spotup;

-- ============================================================
-- 1. 管理员 - 更新密码为真实可用的 bcrypt 哈希
--    用户名: admin  密码: admin123
-- ============================================================
UPDATE admin_users SET password = '$2a$10$sW6Aqm7h7r0i8dp2.ssG7eeFHHxjLJWwgCQ95FJNT4sJMigCPK0wm' WHERE username = 'admin';

-- ============================================================
-- 2. 用户 (25条)
--    密码均为 123456 的 bcrypt 哈希
-- ============================================================
INSERT INTO users (phone, password, nickname, avatar, gender, city, bio, credit_score, status) VALUES
('13800001001', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '篮球达人李明', '/uploads/avatars/default1.png', 1, '北京', '热爱篮球，每周必打', 95, 1),
('13800001002', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '足球小子王磊', '/uploads/avatars/default2.png', 1, '北京', '梅西铁粉，踢球找我', 88, 1),
('13800001003', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '羽毛球高手张薇', '/uploads/avatars/default3.png', 2, '上海', '羽毛球业余冠军', 92, 1),
('13800001004', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '乒乓小将刘洋', '/uploads/avatars/default4.png', 1, '上海', '乒乓球爱好者', 78, 1),
('13800001005', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '网球少女陈雪', '/uploads/avatars/default5.png', 2, '广州', '网球让我快乐', 85, 1),
('13800001006', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '排球健将赵刚', '/uploads/avatars/default6.png', 1, '广州', '坚持排球十年', 90, 1),
('13800001007', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '台球王子周杰', '/uploads/avatars/default7.png', 1, '深圳', '一杆清台不是梦', 82, 1),
('13800001008', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '游泳达人吴婷', '/uploads/avatars/default8.png', 2, '深圳', '游泳健身了解一下', 88, 1),
('13800001009', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '跑步狂人郑浩', '/uploads/avatars/default9.png', 1, '杭州', '全马330选手', 95, 1),
('13800001010', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '健身教练孙丽', '/uploads/avatars/default10.png', 2, '杭州', '私人健身教练，带练找我', 90, 1),
('13800001011', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '瑜伽女神钱雨', '/uploads/avatars/default11.png', 2, '成都', '瑜伽让我身心合一', 88, 1),
('13800001012', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '飞盘达人冯晨', '/uploads/avatars/default12.png', 1, '成都', '飞盘局组起来', 80, 1),
('13800001013', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '骑行侠客朱峰', '/uploads/avatars/default13.png', 1, '北京', '骑行环游中国', 85, 1),
('13800001014', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '攀岩高手秦岚', '/uploads/avatars/default14.png', 2, '深圳', '攀岩让人上瘾', 92, 1),
('13800001015', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '滑雪达人吕冬', '/uploads/avatars/default15.png', 1, '北京', '冬天滑雪夏天冲浪', 88, 1),
('13800001016', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '运动小白何静', '/uploads/avatars/default16.png', 2, '上海', '开始运动，寻找搭子', 70, 1),
('13800001017', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '篮球迷马超', '/uploads/avatars/default17.png', 1, '广州', '科比门徒，曼巴精神', 82, 1),
('13800001018', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '足球新星罗浩', '/uploads/avatars/default18.png', 1, '成都', '校队主力前锋', 78, 1),
('13800001019', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '羽毛球老手梁红', '/uploads/avatars/default19.png', 2, '杭州', '打了二十年羽毛球', 95, 1),
('13800001020', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '跑步新手方明', '/uploads/avatars/default20.png', 1, '深圳', '刚入坑跑步，求带', 65, 1),
('13800001021', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '滑雪教练韩冰', '/uploads/avatars/default21.png', 1, '北京', '专业滑雪教练，可教学', 90, 1),
('13800001022', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '瑜伽达人沈月', '/uploads/avatars/default22.png', 2, '上海', '瑜伽导师，欢迎交流', 88, 1),
('13800001023', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '排球爱好者魏来', '/uploads/avatars/default23.png', 1, '广州', '大学排球队队长', 85, 1),
('13800001024', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '游泳达人蒋涛', '/uploads/avatars/default24.png', 1, '杭州', '游泳十年，想找泳伴', 82, 1),
('13800001025', '$2a$10$yoAkK2pILfObiyPoKER7Yu01Cqxd4vYaDneoTU7BKYSuRE5ONjbVu', '台球爱好者徐亮', '/uploads/avatars/default25.png', 1, '成都', '周末台球局必到', 75, 1);

-- ============================================================
-- 3. 用户运动标签 (25条)
-- ============================================================
INSERT INTO user_sport_tags (user_id, sport_id, level) VALUES
(1, 1, 4), (2, 2, 3), (3, 3, 5), (4, 4, 3), (5, 5, 3),
(6, 6, 4), (7, 7, 3), (8, 8, 4), (9, 9, 5), (10, 10, 4),
(11, 11, 5), (12, 12, 3), (13, 13, 4), (14, 14, 5), (15, 15, 4),
(16, 3, 1), (17, 1, 3), (18, 2, 4), (19, 3, 5), (20, 9, 1),
(21, 15, 5), (22, 11, 4), (23, 6, 4), (24, 8, 4), (25, 7, 3);

-- ============================================================
-- 4. 场馆 (20条)
-- ============================================================
INSERT INTO venues (name, address, city, district, latitude, longitude, phone, business_hours, description, facilities, rating, match_count, is_hot) VALUES
('朝阳体育馆', '北京市朝阳区姚家园路77号', '北京', '朝阳区', 39.9289000, 116.4713000, '010-88881001', '06:00-22:00', '朝阳区最大的综合体育馆，拥有标准篮球场、羽毛球场和乒乓球室', '["WiFi","停车位","更衣室","淋浴间","饮水机","器材租赁"]', 4.8, 156, 1),
('海淀体育中心', '北京市海淀区颐和园路12号', '北京', '海淀区', 39.9928000, 116.3052000, '010-88881002', '07:00-21:00', '海淀区核心地段，交通便利，设施完善，适合各类运动', '["WiFi","停车位","更衣室","淋浴间","空调"]', 4.6, 132, 1),
('浦东源深体育中心', '上海市浦东新区源深路655号', '上海', '浦东新区', 31.2435000, 121.5347000, '021-88881003', '06:00-22:30', '浦东最大的体育综合体，含篮球、足球、网球等多种场地', '["WiFi","停车位","更衣室","淋浴间","空调","器材租赁","观众席"]', 4.7, 189, 1),
('静安体育中心', '上海市静安区汶水路116号', '上海', '静安区', 31.2792000, 121.4523000, '021-88881004', '07:00-22:00', '市区核心地段，专业羽毛球和乒乓球场地，环境舒适', '["WiFi","停车位","更衣室","淋浴间","空调"]', 4.5, 98, 0),
('天河体育中心', '广州市天河区体育西路299号', '广州', '天河区', 23.1283000, 113.3257000, '020-88881005', '06:30-22:00', '广州标志性体育场馆，亚运会场馆，设施一流', '["WiFi","停车位","更衣室","淋浴间","空调","观众席","器材租赁"]', 4.9, 215, 1),
('越秀山体育场', '广州市越秀区应元路34号', '广州', '越秀区', 23.1312000, 113.2637000, '020-88881006', '06:00-21:00', '历史悠久的体育场，足球场质量优秀，绿化环绕', '["停车位","更衣室","淋浴间","观众席"]', 4.3, 87, 0),
('深圳湾体育中心', '深圳市南山区滨海大道3001号', '深圳', '南山区', 22.5175000, 113.9531000, '0755-88881007', '06:00-22:00', '春茧体育馆，深圳地标性体育建筑，设施国际一流', '["WiFi","停车位","更衣室","淋浴间","空调","观众席","器材租赁","游泳馆"]', 4.9, 201, 1),
('福田体育公园', '深圳市福田区福强路3030号', '深圳', '福田区', 22.5269000, 114.0597000, '0755-88881008', '07:00-22:00', '公园式体育场馆，环境优美，适合户外运动', '["WiFi","停车位","更衣室","淋浴间","饮水机"]', 4.4, 112, 0),
('黄龙体育中心', '杭州市西湖区黄龙路1号', '杭州', '西湖区', 30.2679000, 120.1283000, '0571-88881009', '06:00-22:00', '杭州最大的体育中心，拥有足球场、篮球场和网球场', '["WiFi","停车位","更衣室","淋浴间","空调","观众席","器材租赁"]', 4.7, 145, 1),
('下沙大学城体育馆', '杭州市钱塘区学源街258号', '杭州', '钱塘区', 30.3107000, 120.3655000, '0571-88881010', '08:00-21:00', '大学城核心体育馆，场地多，性价比高', '["WiFi","停车位","更衣室","淋浴间"]', 4.2, 78, 0),
('成都体育中心', '成都市武侯区人民南路四段8号', '成都', '武侯区', 30.6142000, 104.0732000, '028-88881011', '06:00-22:00', '成都市中心最大的综合体育馆，设施齐全', '["WiFi","停车位","更衣室","淋浴间","空调","器材租赁"]', 4.6, 167, 1),
('锦江区体育公园', '成都市锦江区二环路东五段9号', '成都', '锦江区', 30.6375000, 104.1053000, '028-88881012', '07:00-21:00', '公园式运动场地，环境宜人，适合周末运动', '["WiFi","停车位","更衣室","淋浴间","饮水机"]', 4.3, 92, 0),
('工体篮球公园', '北京市朝阳区工人体育场北路', '北京', '朝阳区', 39.9315000, 116.4454000, '010-88881013', '08:00-24:00', '京城篮球圣地，夜场灯光极佳，常年有球局', '["停车位","更衣室","淋浴间","饮水机","器材租赁"]', 4.8, 234, 1),
('徐汇滨江体育公园', '上海市徐汇区龙腾大道2600号', '上海', '徐汇区', 31.1669000, 121.4536000, '021-88881014', '06:00-22:00', '滨江景观运动场，适合跑步、骑行、飞盘等户外运动', '["停车位","更衣室","饮水机","储物柜"]', 4.5, 105, 1),
('宝安体育中心', '深圳市宝安区新湖路2112号', '深圳', '宝安区', 22.5597000, 113.8831000, '0755-88881015', '06:30-22:00', '宝安区最大体育中心，设施新，场地宽敞', '["WiFi","停车位","更衣室","淋浴间","空调","器材租赁"]', 4.4, 88, 0),
('龙岗大运中心', '深圳市龙岗区龙翔大道3001号', '深圳', '龙岗区', 22.6987000, 114.2151000, '0755-88881016', '06:00-22:00', '大运会主会场，国际标准场馆，水晶石造型独特', '["WiFi","停车位","更衣室","淋浴间","空调","观众席","器材租赁","游泳馆"]', 4.8, 178, 1),
('奥体中心体育馆', '北京市朝阳区安定路甲3号', '北京', '朝阳区', 39.9897000, 116.3917000, '010-88881017', '06:00-22:00', '奥运场馆，国际顶级设施，各类运动场地齐全', '["WiFi","停车位","更衣室","淋浴间","空调","观众席","器材租赁","游泳馆","健身区"]', 4.9, 312, 1),
('虹口足球场', '上海市虹口区东江湾路444号', '上海', '虹口区', 31.2741000, 121.4806000, '021-88881018', '07:00-21:00', '专业足球场，草皮质量极佳，申花主场', '["停车位","更衣室","淋浴间","观众席","器材租赁"]', 4.6, 134, 1),
('西湖文体中心', '杭州市西湖区玉古路172号', '杭州', '西湖区', 30.2644000, 120.1193000, '0571-88881019', '08:00-22:00', '毗邻西湖，环境一流，羽毛球和游泳场地热门', '["WiFi","停车位","更衣室","淋浴间","空调","游泳馆"]', 4.5, 120, 0),
('天府新区体育中心', '成都市双流区天府大道南段1888号', '成都', '双流区', 30.4875000, 104.0702000, '028-88881020', '06:30-22:00', '天府新区核心体育场馆，新建设施，场地一流', '["WiFi","停车位","更衣室","淋浴间","空调","器材租赁","观众席"]', 4.5, 76, 1);

-- ============================================================
-- 5. 场馆图片 (20条)
-- ============================================================
INSERT INTO venue_images (venue_id, url, sort_order) VALUES
(1, '/uploads/venues/venue1_1.jpg', 1), (1, '/uploads/venues/venue1_2.jpg', 2),
(2, '/uploads/venues/venue2_1.jpg', 1), (2, '/uploads/venues/venue2_2.jpg', 2),
(3, '/uploads/venues/venue3_1.jpg', 1), (3, '/uploads/venues/venue3_2.jpg', 2),
(4, '/uploads/venues/venue4_1.jpg', 1), (5, '/uploads/venues/venue5_1.jpg', 1),
(6, '/uploads/venues/venue6_1.jpg', 1), (7, '/uploads/venues/venue7_1.jpg', 1),
(7, '/uploads/venues/venue7_2.jpg', 2), (8, '/uploads/venues/venue8_1.jpg', 1),
(9, '/uploads/venues/venue9_1.jpg', 1), (10, '/uploads/venues/venue10_1.jpg', 1),
(11, '/uploads/venues/venue11_1.jpg', 1), (13, '/uploads/venues/venue13_1.jpg', 1),
(13, '/uploads/venues/venue13_2.jpg', 2), (14, '/uploads/venues/venue14_1.jpg', 1),
(16, '/uploads/venues/venue16_1.jpg', 1), (17, '/uploads/venues/venue17_1.jpg', 1);

-- ============================================================
-- 6. 球局 (25条，覆盖各种状态)
--    日期设置为未来几天，确保有可报名的球局
-- ============================================================
INSERT INTO matches (title, sport_id, venue_id, creator_id, match_date, start_time, end_time, max_players, min_players, current_players, fee_type, total_fee, per_person_fee, level_required, gender_required, description, status, is_featured) VALUES
('周六朝阳篮球3v3', 1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '16:00:00', 12, 4, 6, 1, 300.00, 25.00, 2, 0, '周末篮球局，3v3轮换，友好竞技，欢迎报名！场地已订好，费用AA。', 1, 1),
('周日下午足球7v7', 2, 3, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '15:00:00', '17:30:00', 14, 10, 8, 1, 500.00, 35.71, 3, 1, '每周日下午固定足球局，7v7对抗，真草场地，快来报名！', 1, 1),
('周一晚上羽毛球双打', 3, 5, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '21:00:00', 8, 4, 4, 2, 200.00, 25.00, 1, 0, '工作日晚上轻松羽毛球，双打轮换，新手友好，提供羽毛球。', 1, 1),
('周三乒乓球交流赛', 4, 2, 4, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '18:30:00', '20:30:00', 10, 3, 5, 3, 0.00, 0.00, 0, 0, '乒乓球爱好者交流赛，器材自备，免费参与，切磋球技。', 1, 0),
('周六网球训练局', 5, 7, 5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '11:00:00', 4, 2, 2, 1, 240.00, 60.00, 3, 0, '周六上午网球训练，专业场地，一起提高技术！', 1, 0),
('周五排球友谊赛', 6, 6, 6, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '18:00:00', '20:00:00', 12, 8, 10, 1, 360.00, 30.00, 2, 0, '排球友谊赛，不限水平，快乐排球，一起运动！', 1, 0),
('周四台球休闲局', 7, 8, 7, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:00:00', '22:00:00', 6, 2, 3, 2, 180.00, 30.00, 1, 0, '周四晚上台球局，输的请喝水！轻松愉快。', 1, 0),
('周日晨跑10公里', 9, 14, 9, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '06:30:00', '08:00:00', 20, 3, 12, 3, 0.00, 0.00, 0, 0, '周日晨跑团，10公里配速530，一起来燃烧卡路里！', 1, 1),
('周三飞盘局', 12, 10, 12, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '16:00:00', '18:00:00', 14, 6, 9, 3, 0.00, 0.00, 1, 0, '轻松飞盘局，新手友好，有教练指导，免费参与！', 1, 0),
('周六攀岩挑战', 14, 7, 14, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '13:00:00', 6, 2, 4, 2, 480.00, 80.00, 3, 0, '室内攀岩，专业教练陪同，含装备租赁，挑战自我！', 1, 0),
('周二篮球半场4v4', 1, 13, 17, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '21:00:00', 8, 4, 8, 1, 240.00, 30.00, 2, 0, '周二夜场篮球，已满员！下次请早。', 2, 0),
('周五足球训练赛', 2, 18, 18, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '21:30:00', 14, 10, 14, 1, 420.00, 30.00, 3, 1, '高质量足球训练赛，草皮好，已满员。', 2, 0),
('上周日篮球回顾', 1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '14:00:00', '16:00:00', 10, 4, 8, 1, 300.00, 30.00, 1, 0, '已结束的篮球局，大家表现都很棒！', 4, 0),
('上周六羽毛球双打', 3, 5, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:00:00', '11:00:00', 8, 4, 6, 2, 200.00, 25.00, 2, 0, '愉快的羽毛球双打，已经圆满结束。', 4, 0),
('上周末足球对决赛', 2, 3, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '15:00:00', '17:30:00', 14, 10, 12, 1, 500.00, 35.71, 3, 0, '精彩的足球对决，红队获胜！', 4, 0),
('上周乒乓球比赛', 4, 2, 4, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '10:00:00', '12:00:00', 16, 4, 12, 3, 0.00, 0.00, 0, 0, '社区乒乓球友谊赛圆满结束。', 4, 0),
('已取消-周三网球局', 5, 7, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00', 4, 2, 1, 1, 240.00, 60.00, 3, 0, '因场地原因已取消，抱歉。', 5, 0),
('已取消-周日排球局', 6, 6, 6, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00', '16:00:00', 12, 6, 1, 1, 360.00, 30.00, 2, 0, '因人数不足已取消。', 5, 0),
('周日骑行西湖环线', 13, 9, 13, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:00:00', '12:00:00', 10, 3, 5, 3, 0.00, 0.00, 1, 0, '西湖环线骑行，全程约30公里，休闲骑行，欢迎加入！', 1, 1),
('周一瑜伽早课', 11, 15, 11, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '08:30:00', 15, 5, 7, 2, 300.00, 20.00, 1, 2, '清晨瑜伽，唤醒身体，仅限女生，专业瑜伽教练带课。', 1, 0),
('周六健身团课', 10, 1, 10, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '10:30:00', 15, 5, 9, 2, 450.00, 30.00, 2, 0, '专业健身教练带团课，HIIT+力量训练，燃脂塑形！', 1, 0),
('周日游泳训练', 8, 7, 8, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '07:00:00', '09:00:00', 10, 3, 4, 2, 300.00, 30.00, 2, 0, '周日晨泳训练，标准泳池，一起提高！', 1, 0),
('周五滑雪夜场', 15, 17, 15, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '18:00:00', '21:00:00', 8, 3, 5, 2, 1200.00, 150.00, 3, 0, '室内滑雪场夜场，含门票和基础教学！', 1, 1),
('周四健身私教课', 10, 11, 10, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00', '16:00:00', 5, 2, 3, 2, 500.00, 100.00, 1, 0, '小班私教健身课，2-5人，专业教练指导。', 1, 0),
('周日篮球全场5v5', 1, 17, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00:00', '12:00:00', 10, 6, 7, 1, 500.00, 50.00, 4, 0, '周日全场篮球，高手局，欢迎来挑战！', 1, 1);

-- ============================================================
-- 7. 球局成员 - 为每个球局添加成员
-- ============================================================
-- match 1 (creator 1)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(1, 1, 1, 1), (1, 17, 2, 1), (1, 9, 2, 1), (1, 13, 2, 1), (1, 15, 2, 1), (1, 21, 2, 1);
-- match 2 (creator 2)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(2, 2, 1, 1), (2, 18, 2, 1), (2, 1, 2, 1), (2, 23, 2, 1), (2, 6, 2, 1), (2, 17, 2, 1), (2, 25, 2, 1), (2, 9, 2, 1);
-- match 3 (creator 3)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(3, 3, 1, 1), (3, 19, 2, 1), (3, 16, 2, 1), (3, 22, 2, 1);
-- match 4 (creator 4)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(4, 4, 1, 1), (4, 7, 2, 1), (4, 25, 2, 1), (4, 12, 2, 1), (4, 23, 2, 1);
-- match 5 (creator 5)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(5, 5, 1, 1), (5, 10, 2, 1);
-- match 6 (creator 6)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(6, 6, 1, 1), (6, 2, 2, 1), (6, 18, 2, 1), (6, 1, 2, 1), (6, 4, 2, 1), (6, 25, 2, 1), (6, 12, 2, 1), (6, 13, 2, 1), (6, 23, 2, 1), (6, 24, 2, 1);
-- match 7 (creator 7)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(7, 7, 1, 1), (7, 25, 2, 1), (7, 20, 2, 1);
-- match 8 (creator 9)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(8, 9, 1, 1), (8, 20, 2, 1), (8, 24, 2, 1), (8, 10, 2, 1), (8, 16, 2, 1), (8, 22, 2, 1), (8, 14, 2, 1), (8, 25, 2, 1), (8, 12, 2, 1), (8, 13, 2, 1), (8, 15, 2, 1), (8, 21, 2, 1);
-- match 9 (creator 12)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(9, 12, 1, 1), (9, 23, 2, 1), (9, 6, 2, 1), (9, 18, 2, 1), (9, 11, 2, 1), (9, 22, 2, 1), (9, 16, 2, 1), (9, 19, 2, 1), (9, 8, 2, 1);
-- match 10 (creator 14)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(10, 14, 1, 1), (10, 21, 2, 1), (10, 15, 2, 1), (10, 13, 2, 1);
-- match 11 (creator 17) - 满员
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(11, 17, 1, 1), (11, 1, 2, 1), (11, 2, 2, 1), (11, 4, 2, 1), (11, 7, 2, 1), (11, 9, 2, 1), (11, 13, 2, 1), (11, 15, 2, 1);
-- match 12 (creator 18) - 满员
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(12, 18, 1, 1), (12, 2, 2, 1), (12, 23, 2, 1), (12, 6, 2, 1), (12, 1, 2, 1), (12, 17, 2, 1), (12, 25, 2, 1), (12, 9, 2, 1), (12, 13, 2, 1), (12, 15, 2, 1), (12, 21, 2, 1), (12, 4, 2, 1), (12, 7, 2, 1), (12, 10, 2, 1);
-- match 13 (creator 1) - ended
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(13, 1, 1, 2), (13, 17, 2, 2), (13, 15, 2, 2), (13, 13, 2, 2), (13, 9, 2, 2), (13, 21, 2, 2), (13, 2, 2, 2), (13, 25, 2, 2);
-- match 14 (creator 3) - ended
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(14, 3, 1, 2), (14, 19, 2, 2), (14, 22, 2, 2), (14, 16, 2, 2), (14, 11, 2, 2), (14, 8, 2, 2);
-- match 15 (creator 2) - ended
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(15, 2, 1, 2), (15, 18, 2, 2), (15, 1, 2, 2), (15, 23, 2, 2), (15, 6, 2, 2), (15, 17, 2, 2), (15, 4, 2, 2), (15, 25, 2, 2), (15, 7, 2, 2), (15, 9, 2, 2), (15, 13, 2, 2), (15, 15, 2, 2);
-- match 16 (creator 4) - ended
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(16, 4, 1, 2), (16, 7, 2, 2), (16, 25, 2, 2), (16, 12, 2, 2), (16, 23, 2, 2), (16, 6, 2, 2), (16, 10, 2, 2), (16, 24, 2, 2), (16, 8, 2, 2), (16, 20, 2, 2), (16, 22, 2, 2), (16, 16, 2, 2);
-- match 19 (creator 13)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(19, 13, 1, 1), (19, 21, 2, 1), (19, 15, 2, 1), (19, 9, 2, 1), (19, 24, 2, 1);
-- match 20 (creator 11)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(20, 11, 1, 1), (20, 22, 2, 1), (20, 3, 2, 1), (20, 19, 2, 1), (20, 16, 2, 1), (20, 8, 2, 1), (20, 5, 2, 1);
-- match 21 (creator 10)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(21, 10, 1, 1), (21, 1, 2, 1), (21, 17, 2, 1), (21, 9, 2, 1), (21, 13, 2, 1), (21, 24, 2, 1), (21, 5, 2, 1), (21, 14, 2, 1), (21, 21, 2, 1);
-- match 22 (creator 8)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(22, 8, 1, 1), (22, 24, 2, 1), (22, 5, 2, 1), (22, 10, 2, 1);
-- match 23 (creator 15)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(23, 15, 1, 1), (23, 21, 2, 1), (23, 13, 2, 1), (23, 14, 2, 1), (23, 10, 2, 1);
-- match 24 (creator 10)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(24, 10, 1, 1), (24, 1, 2, 1), (24, 9, 2, 1);
-- match 25 (creator 1)
INSERT INTO match_members (match_id, user_id, role, status) VALUES
(25, 1, 1, 1), (25, 17, 2, 1), (25, 2, 2, 1), (25, 15, 2, 1), (25, 21, 2, 1), (25, 13, 2, 1), (25, 4, 2, 1);

-- ============================================================
-- 8. 订单 (25条)
-- ============================================================
INSERT INTO orders (order_no, user_id, match_id, amount, status, paid_at, remark) VALUES
('SP202405010001', 2, 1, 25.00, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), '参加周六朝阳篮球3v3'),
('SP202405010002', 3, 2, 35.71, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周日下午足球7v7'),
('SP202405010003', 4, 3, 25.00, 1, NULL, '参加周一晚上羽毛球双打-待支付'),
('SP202405010004', 5, 5, 60.00, 2, DATE_SUB(NOW(), INTERVAL 3 DAY), '参加周六网球训练局'),
('SP202405010005', 6, 6, 30.00, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), '参加周五排球友谊赛'),
('SP202405010006', 7, 7, 30.00, 1, NULL, '参加周四台球休闲局-待支付'),
('SP202405010007', 10, 21, 30.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周六健身团课'),
('SP202405010008', 11, 20, 20.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周一瑜伽早课'),
('SP202405010009', 12, 9, 0.00, 1, NULL, '参加周三飞盘局-无需支付'),
('SP202405010010', 14, 10, 80.00, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), '参加周六攀岩挑战'),
('SP202405010011', 1, 13, 30.00, 4, DATE_SUB(NOW(), INTERVAL 4 DAY), '上周日篮球回顾-已完成'),
('SP202405010012', 3, 14, 25.00, 4, DATE_SUB(NOW(), INTERVAL 5 DAY), '上周六羽毛球双打-已完成'),
('SP202405010013', 2, 15, 35.71, 4, DATE_SUB(NOW(), INTERVAL 3 DAY), '上周末足球对决赛-已完成'),
('SP202405010014', 8, 22, 30.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周日游泳训练'),
('SP202405010015', 13, 19, 0.00, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), '周日骑行西湖环线-免单'),
('SP202405010016', 15, 23, 150.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周五滑雪夜场'),
('SP202405010017', 17, 11, 30.00, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), '参加周二篮球半场4v4'),
('SP202405010018', 18, 12, 30.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周五足球训练赛'),
('SP202405010019', 19, 14, 25.00, 4, DATE_SUB(NOW(), INTERVAL 5 DAY), '上周六羽毛球-已完成'),
('SP202405010020', 20, 16, 0.00, 4, DATE_SUB(NOW(), INTERVAL 6 DAY), '上周乒乓球比赛-免单'),
('SP202405010021', 21, 15, 35.71, 4, DATE_SUB(NOW(), INTERVAL 3 DAY), '上周末足球-已完成'),
('SP202405010022', 22, 20, 20.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周一瑜伽早课'),
('SP202405010023', 23, 12, 30.00, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), '参加周五足球训练赛'),
('SP202405010024', 7, 17, 60.00, 3, NULL, '取消的周三网球局-已取消'),
('SP202405010025', 23, 18, 30.00, 5, NULL, '取消的周日排球局-已退款');

-- ============================================================
-- 9. 支付记录 (25条)
-- ============================================================
INSERT INTO payments (payment_no, order_id, user_id, amount, channel, transaction_id, status, paid_at) VALUES
('PAY202405010001', 1, 2, 25.00, 'wechat', 'WXTXN202405010001', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('PAY202405010002', 2, 3, 35.71, 'wechat', 'WXTXN202405010002', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010003', 4, 5, 60.00, 'wechat', 'WXTXN202405010003', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('PAY202405010004', 5, 6, 30.00, 'wechat', 'WXTXN202405010004', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('PAY202405010005', 7, 10, 30.00, 'wechat', 'WXTXN202405010005', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010006', 8, 11, 20.00, 'wechat', 'WXTXN202405010006', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010007', 10, 14, 80.00, 'wechat', 'WXTXN202405010007', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('PAY202405010008', 11, 1, 30.00, 'wechat', 'WXTXN202405010008', 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('PAY202405010009', 12, 3, 25.00, 'wechat', 'WXTXN202405010009', 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('PAY202405010010', 13, 2, 35.71, 'wechat', 'WXTXN202405010010', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('PAY202405010011', 14, 8, 30.00, 'wechat', 'WXTXN202405010011', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010012', 16, 15, 150.00, 'wechat', 'WXTXN202405010012', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010013', 17, 17, 30.00, 'wechat', 'WXTXN202405010013', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('PAY202405010014', 18, 18, 30.00, 'wechat', 'WXTXN202405010014', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010015', 19, 19, 25.00, 'wechat', 'WXTXN202405010015', 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('PAY202405010016', 20, 20, 0.00, 'wechat', 'WXTXN202405010016', 2, DATE_SUB(NOW(), INTERVAL 6 DAY)),
('PAY202405010017', 21, 21, 35.71, 'wechat', 'WXTXN202405010017', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('PAY202405010018', 22, 22, 20.00, 'wechat', 'WXTXN202405010018', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010019', 23, 23, 30.00, 'wechat', 'WXTXN202405010019', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('PAY202405010020', 25, 23, 30.00, 'wechat', 'WXTXN202405010020', 4, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- 以下为待支付
('PAY202405010021', 3, 4, 25.00, 'wechat', NULL, 1, NULL),
('PAY202405010022', 6, 7, 30.00, 'wechat', NULL, 1, NULL),
('PAY202405010023', 9, 12, 0.00, 'wechat', NULL, 1, NULL),
('PAY202405010024', 15, 13, 0.00, 'wechat', NULL, 1, NULL),
('PAY202405010025', 24, 7, 60.00, 'wechat', NULL, 1, NULL);

-- ============================================================
-- 10. 关注关系 (20条)
-- ============================================================
INSERT INTO follows (follower_id, followed_id) VALUES
(1, 2), (1, 17), (1, 3), (2, 1), (2, 18),
(3, 19), (3, 22), (4, 7), (4, 25), (5, 10),
(6, 2), (6, 23), (7, 25), (7, 4), (8, 24),
(9, 20), (10, 1), (11, 22), (12, 23), (13, 15);

-- ============================================================
-- 11. 球局收藏 (20条)
-- ============================================================
INSERT INTO match_favorites (user_id, match_id) VALUES
(1, 2), (2, 1), (3, 8), (4, 9), (5, 10),
(6, 1), (7, 2), (8, 19), (9, 21), (10, 23),
(11, 20), (12, 9), (13, 25), (14, 10), (15, 23),
(16, 3), (17, 25), (18, 2), (19, 3), (20, 8);

-- ============================================================
-- 12. 通知 (25条)
-- ============================================================
INSERT INTO notifications (user_id, type, title, content, related_id, related_type, is_read) VALUES
(1, 'system', '欢迎加入拼个场', '欢迎来到拼个场！开始你的运动之旅吧！', NULL, NULL, 1),
(2, 'system', '欢迎加入拼个场', '欢迎来到拼个场！开始你的运动之旅吧！', NULL, NULL, 1),
(3, 'match_join', '报名成功', '你已成功报名「周一晚上羽毛球双打」', 3, 'match', 1),
(4, 'match_success', '球局成局', '你报名的「周三乒乓球交流赛」已成局，请按时到场', 4, 'match', 0),
(5, 'match_join', '报名成功', '你已成功报名「周六网球训练局」', 5, 'match', 1),
(6, 'match_success', '球局成局', '你创建的「周五排球友谊赛」已成局', 6, 'match', 0),
(7, 'match_join', '报名成功', '你已成功报名「周四台球休闲局」', 7, 'match', 0),
(8, 'payment', '支付成功', '你已成功支付「周日游泳训练」费用 ¥30.00', 22, 'order', 1),
(9, 'match_success', '球局成局', '你创建的「周日晨跑10公里」已成局，成员12人', 8, 'match', 1),
(10, 'payment', '支付成功', '你已成功支付「周六健身团课」费用 ¥30.00', 21, 'order', 1),
(11, 'payment', '支付成功', '你已成功支付「周一瑜伽早课」费用 ¥20.00', 20, 'order', 1),
(12, 'match_join', '报名成功', '你已成功报名「周三飞盘局」', 9, 'match', 0),
(13, 'match_success', '球局成局', '你创建的「周日骑行西湖环线」已成局', 19, 'match', 1),
(14, 'payment', '支付成功', '你已成功支付「周六攀岩挑战」费用 ¥80.00', 10, 'order', 1),
(15, 'payment', '支付成功', '你已成功支付「周五滑雪夜场」费用 ¥150.00', 23, 'order', 0),
(16, 'remind', '球局提醒', '明天有球局「周一晚上羽毛球双打」，请做好准备', 3, 'match', 0),
(17, 'match_cancel', '球局取消', '你报名的「周三网球局」已被取消', 17, 'match', 1),
(18, 'match_cancel', '球局取消', '你报名的「周日排球局」已被取消', 18, 'match', 1),
(19, 'system', '信用分变动', '你的信用分发生变化，变化：+5，当前：95', NULL, NULL, 0),
(20, 'remind', '明日球局提醒', '你明天有球局「周日晨跑10公里」，不要迟到哦！', 8, 'match', 0),
(21, 'match_join', '报名成功', '你已成功报名「周六朝阳篮球3v3」', 1, 'match', 1),
(22, 'payment', '支付成功', '你已成功支付「周二篮球半场4v4」费用 ¥30.00', 11, 'order', 1),
(23, 'payment', '支付成功', '你已成功支付「周五足球训练赛」费用 ¥30.00', 12, 'order', 1),
(24, 'system', '系统公告', '拼个场版本更新：新增场馆推荐功能，快来体验！', NULL, NULL, 0),
(25, 'match_success', '球局成局', '你创建的「周日篮球全场5v5」已成局，成员7人', 25, 'match', 1);

-- ============================================================
-- 13. 举报 (20条)
-- ============================================================
INSERT INTO reports (reporter_id, reported_user_id, match_id, type, reason, status, handled_at) VALUES
(1, 20, 8, 'no_show', '报名了周日的晨跑局却没来，电话也不接！', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 17, 11, 'no_show', '篮球局放鸽子，严重影响其他队员体验。', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 16, 14, 'violation', '羽毛球局上使用损坏球拍不赔偿，态度恶劣。', 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 25, 13, 'no_show', '说好来却没来，也没有提前告知，信用分应该扣。', 1, NULL),
(5, 24, 22, 'abuse', '游泳时对他人进行言语攻击，非常不尊重。', 1, NULL),
(6, 18, 15, 'no_show', '足球赛放鸽子，位置都安排好了结果人没来。', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 4, 4, 'other', '活动现场行为不当，影响其他人运动体验。', 1, NULL),
(8, 7, 7, 'no_show', '台球局报名但不出现，已经不是第一次了。', 3, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 10, 21, 'violation', '健身课上不遵守教练指导，擅自使用器械。', 1, NULL),
(10, 22, 20, 'violation', '瑜伽课上大声喧哗，严重干扰课程秩序。', 1, NULL),
(11, 12, 23, 'no_show', '飞盘局无故缺席，不接电话不回消息。', 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(12, 13, 19, 'abuse', '骑行途中对队友进行人身攻击，语言极其恶劣。', 3, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(13, 14, 21, 'other', '攀岩局中不听从安全指引，存在严重安全隐患。', 1, NULL),
(14, 15, 10, 'other', '滑雪局装备乱放影响他人，缺乏基本公共意识。', 1, NULL),
(15, 1, 21, 'violation', '多次发现该用户在球局中有不诚信行为。', 1, NULL),
(16, 2, 3, 'no_show', '周日足球局未出席，已给过他多次机会。', 3, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(17, 3, 14, 'violation', '羽毛球双打中故意扰乱比赛秩序。', 1, NULL),
(18, 5, 22, 'no_show', '游泳局放鸽子，影响队伍安排。', 1, NULL),
(19, 6, 12, 'abuse', '足球赛中使用不当言论攻击对方球员。', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(20, 9, 8, 'no_show', '晨跑局缺席且没有提前告知。', 1, NULL);

-- ============================================================
-- 14. 信用日志 (25条)
-- ============================================================
INSERT INTO credit_logs (user_id, change_amount, balance, reason, related_id, related_type) VALUES
(1, 5, 100, 'join_match', 1, 'match'),
(2, 5, 93, 'join_match', 2, 'match'),
(3, 5, 97, 'join_match', 3, 'match'),
(4, -2, 78, 'no_show', 4, 'match'),
(5, 3, 88, 'complete_match', 5, 'match'),
(6, 5, 95, 'join_match', 6, 'match'),
(7, 3, 85, 'complete_match', 7, 'match'),
(8, 5, 93, 'join_match', 8, 'match'),
(9, 5, 100, 'join_match', 9, 'match'),
(10, 5, 95, 'join_match', 21, 'match'),
(11, 5, 93, 'join_match', 20, 'match'),
(12, 2, 82, 'join_match', 9, 'match'),
(13, 5, 90, 'join_match', 19, 'match'),
(14, 5, 97, 'join_match', 10, 'match'),
(15, 5, 93, 'join_match', 23, 'match'),
(16, -20, 70, 'no_show', 14, 'match'),
(17, 5, 87, 'join_match', 11, 'match'),
(18, 5, 83, 'join_match', 12, 'match'),
(19, 5, 100, 'join_match', 14, 'match'),
(20, -20, 65, 'no_show', 8, 'match'),
(21, -10, 78, 'report_approved', 19, 'report'),
(22, 5, 93, 'join_match', 3, 'match'),
(23, -10, 73, 'report_approved', 11, 'report'),
(24, 5, 87, 'join_match', 22, 'match'),
(25, -20, 55, 'no_show', 18, 'match');