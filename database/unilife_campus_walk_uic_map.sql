SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS unilife_campus_walk;
CREATE DATABASE unilife_campus_walk
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE unilife_campus_walk;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- UniLife: Campus Walk - UIC Campus Map Mini App Database
-- Target: MySQL 8.0+
-- Includes map image metadata, real campus locations, NPC weak entity,
-- activity/action record/day log/ending procedures.
-- =========================================================

CREATE TABLE map_asset (
  map_asset_id INT AUTO_INCREMENT PRIMARY KEY,
  map_name VARCHAR(100) NOT NULL UNIQUE,
  image_path VARCHAR(255) NOT NULL,
  image_width INT NOT NULL,
  image_height INT NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_map_asset_size CHECK (image_width > 0 AND image_height > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE player (
  player_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT NULL,
  display_name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `location` (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  map_asset_id INT NOT NULL DEFAULT 1,
  location_name VARCHAR(80) NOT NULL UNIQUE,
  building_type VARCHAR(40) NOT NULL,
  map_x INT NOT NULL,
  map_y INT NOT NULL,
  unlock_condition_day INT DEFAULT 1,
  require_gpa_min DECIMAL(5,2) DEFAULT 0.00,
  require_affection_npc_id INT DEFAULT NULL,
  require_affection_min INT DEFAULT 0,
  description TEXT,
  is_default_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_location_map_asset FOREIGN KEY (map_asset_id)
    REFERENCES map_asset(map_asset_id) ON DELETE CASCADE,
  CONSTRAINT chk_location_day CHECK (unlock_condition_day >= 1),
  CONSTRAINT chk_location_gpa CHECK (require_gpa_min >= 0.00 AND require_gpa_min <= 4.00),
  CONSTRAINT chk_location_affection CHECK (require_affection_min >= 0 AND require_affection_min <= 100),
  CONSTRAINT chk_location_coord CHECK (map_x >= 0 AND map_y >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE game_save (
  save_id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  current_location_id INT DEFAULT NULL,
  `current_time` TIME NOT NULL DEFAULT '08:00:00',
  current_day INT NOT NULL DEFAULT 1,
  semester_phase VARCHAR(30) NOT NULL DEFAULT 'Phase 1',
  max_days INT NOT NULL DEFAULT 16,
  gpa DECIMAL(5,2) NOT NULL DEFAULT 3.00,
  happiness INT NOT NULL DEFAULT 50,
  fatigue INT NOT NULL DEFAULT 40,
  money INT NOT NULL DEFAULT 150,
  remaining_points INT NOT NULL DEFAULT 4,
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_game_save_player FOREIGN KEY (player_id)
    REFERENCES player(player_id) ON DELETE CASCADE,
  CONSTRAINT fk_game_save_current_location FOREIGN KEY (current_location_id)
    REFERENCES `location`(location_id) ON DELETE SET NULL,
  CONSTRAINT chk_save_day CHECK (current_day >= 1),
  CONSTRAINT chk_save_max_days CHECK (max_days >= 1),
  CONSTRAINT chk_save_gpa CHECK (gpa >= 0.00 AND gpa <= 4.00),
  CONSTRAINT chk_save_happiness CHECK (happiness >= 0 AND happiness <= 100),
  CONSTRAINT chk_save_fatigue CHECK (fatigue >= 0 AND fatigue <= 100),
  CONSTRAINT chk_save_money CHECK (money >= 0),
  CONSTRAINT chk_save_points CHECK (remaining_points >= 0),
  CONSTRAINT chk_save_time CHECK (`current_time` IN ('08:00:00','10:00:00','16:00:00','22:00:00','23:59:00'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity (
  activity_id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  activity_name VARCHAR(80) NOT NULL,
  activity_type VARCHAR(30) NOT NULL,
  description TEXT,
  base_duration_minutes INT NOT NULL DEFAULT 120,
  gpa_effect DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  happiness_effect INT NOT NULL DEFAULT 0,
  fatigue_effect INT NOT NULL DEFAULT 0,
  money_effect INT NOT NULL DEFAULT 0,
  min_day INT NOT NULL DEFAULT 1,
  min_gpa DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_activity_location FOREIGN KEY (location_id)
    REFERENCES `location`(location_id) ON DELETE CASCADE,
  CONSTRAINT chk_activity_duration CHECK (base_duration_minutes > 0),
  CONSTRAINT chk_activity_min_day CHECK (min_day >= 1),
  CONSTRAINT chk_activity_min_gpa CHECK (min_gpa >= 0.00 AND min_gpa <= 4.00),
  CONSTRAINT chk_activity_type CHECK (activity_type IN ('study','food','exercise','rest','explore','work','career','social','culture','system'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE npc (
  npc_id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  npc_name VARCHAR(80) NOT NULL,
  npc_role VARCHAR(80) DEFAULT NULL,
  personality_desc VARCHAR(255) DEFAULT NULL,
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_npc_location FOREIGN KEY (location_id)
    REFERENCES `location`(location_id) ON DELETE CASCADE,
  UNIQUE KEY uq_npc_name_location (npc_name, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `location`
  ADD CONSTRAINT fk_location_affection_npc
  FOREIGN KEY (require_affection_npc_id)
  REFERENCES npc(npc_id)
  ON DELETE SET NULL;

CREATE TABLE npc_relationship (
  npc_id INT NOT NULL,
  save_id INT NOT NULL,
  first_met_time DATETIME DEFAULT NULL,
  last_met_time DATETIME DEFAULT NULL,
  meeting_count INT NOT NULL DEFAULT 0,
  relationship_type VARCHAR(30) NOT NULL DEFAULT 'stranger',
  affection INT NOT NULL DEFAULT 0,
  dialogue_stage INT NOT NULL DEFAULT 0,
  quest_stage INT NOT NULL DEFAULT 0,
  memory_note TEXT,
  PRIMARY KEY (npc_id, save_id),
  CONSTRAINT fk_relationship_npc FOREIGN KEY (npc_id)
    REFERENCES npc(npc_id) ON DELETE CASCADE,
  CONSTRAINT fk_relationship_save FOREIGN KEY (save_id)
    REFERENCES game_save(save_id) ON DELETE CASCADE,
  CONSTRAINT chk_relationship_meeting CHECK (meeting_count >= 0),
  CONSTRAINT chk_relationship_affection CHECK (affection >= 0 AND affection <= 100),
  CONSTRAINT chk_relationship_dialogue CHECK (dialogue_stage >= 0),
  CONSTRAINT chk_relationship_quest CHECK (quest_stage >= 0),
  CONSTRAINT chk_relationship_type CHECK (relationship_type IN ('stranger','acquaintance','friend','close_friend','mentor'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE location_unlock (
  unlock_id INT AUTO_INCREMENT PRIMARY KEY,
  save_id INT NOT NULL,
  location_id INT NOT NULL,
  unlocked_date DATE NOT NULL,
  unlock_reason VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_unlock_save FOREIGN KEY (save_id)
    REFERENCES game_save(save_id) ON DELETE CASCADE,
  CONSTRAINT fk_unlock_location FOREIGN KEY (location_id)
    REFERENCES `location`(location_id) ON DELETE CASCADE,
  UNIQUE KEY uq_unlock_save_location (save_id, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE day_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  save_id INT NOT NULL,
  day_number INT NOT NULL,
  is_stayed_up BOOLEAN NOT NULL DEFAULT FALSE,
  gpa_before_day DECIMAL(5,2) NOT NULL,
  happiness_before_day INT NOT NULL,
  fatigue_before_day INT NOT NULL,
  money_before_day INT NOT NULL,
  gpa_after_day DECIMAL(5,2) NOT NULL,
  happiness_after_day INT NOT NULL,
  fatigue_after_day INT NOT NULL,
  money_after_day INT NOT NULL,
  actions_completed INT NOT NULL DEFAULT 0,
  log_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_day_log_save FOREIGN KEY (save_id)
    REFERENCES game_save(save_id) ON DELETE CASCADE,
  CONSTRAINT uq_day_log_save_day UNIQUE (save_id, day_number),
  CONSTRAINT chk_day_log_actions CHECK (actions_completed >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE action_record (
  action_id INT AUTO_INCREMENT PRIMARY KEY,
  save_id INT NOT NULL,
  log_id INT DEFAULT NULL,
  location_id INT NOT NULL,
  activity_id INT DEFAULT NULL,
  npc_id INT DEFAULT NULL,
  action_kind VARCHAR(20) NOT NULL,
  interaction_type VARCHAR(30) DEFAULT NULL,
  time_slot TIME NOT NULL,
  gpa_before DECIMAL(5,2) NOT NULL,
  happiness_before INT NOT NULL,
  fatigue_before INT NOT NULL,
  money_before INT NOT NULL,
  gpa_after DECIMAL(5,2) NOT NULL,
  happiness_after INT NOT NULL,
  fatigue_after INT NOT NULL,
  money_after INT NOT NULL,
  action_description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_action_save FOREIGN KEY (save_id)
    REFERENCES game_save(save_id) ON DELETE CASCADE,
  CONSTRAINT fk_action_day_log FOREIGN KEY (log_id)
    REFERENCES day_log(log_id) ON DELETE SET NULL,
  CONSTRAINT fk_action_location FOREIGN KEY (location_id)
    REFERENCES `location`(location_id) ON DELETE CASCADE,
  CONSTRAINT fk_action_activity FOREIGN KEY (activity_id)
    REFERENCES activity(activity_id) ON DELETE SET NULL,
  CONSTRAINT fk_action_npc FOREIGN KEY (npc_id)
    REFERENCES npc(npc_id) ON DELETE SET NULL,
  CONSTRAINT chk_action_kind CHECK (action_kind IN ('activity','npc','move','system')),
  CONSTRAINT chk_action_time CHECK (time_slot IN ('08:00:00','10:00:00','16:00:00','22:00:00','23:59:00')),
  KEY idx_action_kind (action_kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER before_action_record_insert
BEFORE INSERT ON action_record
FOR EACH ROW
BEGIN
  IF NEW.action_kind = 'activity' THEN
    IF NEW.activity_id IS NULL OR NEW.npc_id IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For activity action, activity_id is required and npc_id must be NULL.';
    END IF;
  ELSEIF NEW.action_kind = 'npc' THEN
    IF NEW.npc_id IS NULL OR NEW.activity_id IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For npc action, npc_id is required and activity_id must be NULL.';
    END IF;
  ELSEIF NEW.action_kind IN ('move','system') THEN
    IF NEW.activity_id IS NOT NULL OR NEW.npc_id IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For move/system action, activity_id and npc_id must be NULL.';
    END IF;
  END IF;
END$$
DELIMITER ;

CREATE TABLE ending (
  ending_id INT AUTO_INCREMENT PRIMARY KEY,
  save_id INT NOT NULL,
  player_id INT NOT NULL,
  ending_title VARCHAR(100) NOT NULL,
  description TEXT,
  final_gpa DECIMAL(5,2) NOT NULL,
  final_happiness INT NOT NULL,
  final_fatigue INT NOT NULL,
  final_money INT NOT NULL,
  avg_affection DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  achieved_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ending_save FOREIGN KEY (save_id)
    REFERENCES game_save(save_id) ON DELETE CASCADE,
  CONSTRAINT fk_ending_player FOREIGN KEY (player_id)
    REFERENCES player(player_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_save_player ON game_save(player_id);
CREATE INDEX idx_activity_location ON activity(location_id);
CREATE INDEX idx_npc_location ON npc(location_id);
CREATE INDEX idx_action_save_day ON action_record(save_id, log_id, time_slot);
CREATE INDEX idx_relationship_save ON npc_relationship(save_id);
CREATE INDEX idx_unlock_save ON location_unlock(save_id);

-- =========================================================
-- Seed: map image metadata and real UIC campus locations
-- Coordinates use the original uploaded map image size: 1536 x 864.
-- The front end scales these coordinates automatically to the canvas.
-- =========================================================
INSERT INTO map_asset(map_name, image_path, image_width, image_height, description)
VALUES('BNBU/UIC Campus Guide', '/assets/bnub_uic_campus_map.png', 2057, 1196,
       'Clear BNBU/UIC campus guide used as the game map background.');

INSERT INTO `location`
(map_asset_id, location_name, building_type, map_x, map_y, unlock_condition_day, require_gpa_min, require_affection_npc_id, require_affection_min, description, is_default_unlocked)
VALUES
(1, 'Institute for Advanced Study', 'Study', 210, 70, 7, 3.50, NULL, 0, 'Academic research hub in the northwest area; unlocked for high-GPA students.', FALSE),
(1, 'D1-D6 Dormitory Area', 'Rest', 180, 220, 1, 0.00, NULL, 0, 'Main dormitory ring where the player starts each morning.', TRUE),
(1, 'Sports Park', 'Exercise', 560, 200, 1, 0.00, NULL, 0, 'Outdoor sports field and running track.', TRUE),
(1, 'Arts Hill', 'Cultural', 1230, 155, 3, 0.00, NULL, 0, 'Artistic hillside with cultural atmosphere and outdoor scenery.', FALSE),
(1, 'Da Tong Village V15-V20', 'Rest', 990, 275, 1, 0.00, NULL, 0, 'Residential area on the north side of campus.', TRUE),
(1, 'Lakeside Walkway', 'Social', 1250, 390, 2, 0.00, NULL, 0, 'Scenic walkway near the lake for relaxing walks.', FALSE),
(1, 'Hui Xian Village V21-V29', 'Rest', 730, 455, 1, 0.00, NULL, 0, 'Residential village near the central teaching area.', TRUE),
(1, 'Learning Resource Centre', 'Study', 1070, 430, 1, 0.00, NULL, 0, 'Library and learning resource center, the core academic location.', TRUE),
(1, 'Central Lawn', 'Social', 890, 510, 1, 0.00, NULL, 0, 'Central green space for walking, relaxing, and chatting.', TRUE),
(1, 'Canteen 1', 'Food', 830, 465, 1, 0.00, NULL, 0, 'Canteen near the teaching buildings.', TRUE),
(1, 'Teaching Area T1-T8', 'Study', 930, 590, 1, 0.00, NULL, 0, 'Main teaching area containing T1 to T8.', TRUE),
(1, 'CEFC Teaching Building', 'Study', 780, 470, 1, 0.00, NULL, 0, 'Teaching building with classrooms and study spaces.', TRUE),
(1, 'Canteen 2', 'Food', 660, 690, 1, 0.00, NULL, 0, 'Canteen near the southern residential area.', TRUE),
(1, 'Sports Complex', 'Exercise', 1125, 690, 1, 0.00, NULL, 0, 'Indoor sports complex for gym and court activities.', TRUE),
(1, 'Huitong Village', 'Social', 415, 550, 3, 0.00, NULL, 0, 'Historic village area suitable for exploration.', FALSE),
(1, 'Cultural Creativity Clusters', 'Cultural', 1375, 415, 5, 0.00, NULL, 0, 'Creative studio area for cultural and design activities.', FALSE),
(1, 'Performance Theatre', 'Cultural', 1345, 555, 3, 0.00, NULL, 0, 'Theatre for performances, talks, and campus events.', FALSE),
(1, 'Administration Building', 'System', 1415, 650, 1, 0.00, NULL, 0, 'Administrative service center.', TRUE),
(1, 'University Hall', 'System', 1360, 725, 1, 0.00, NULL, 0, 'Large hall for important ceremonies and events.', TRUE),
(1, 'Arts Hill Backyard', 'Secret', 1270, 95, 5, 0.00, NULL, 60, 'Hidden viewpoint behind Arts Hill, unlocked through friendship with Lily.', FALSE);

INSERT INTO npc(location_id, npc_name, npc_role, personality_desc, description)
VALUES
((SELECT location_id FROM `location` WHERE location_name='Central Lawn'), 'Lily', 'Classmate', 'Friendly and curious', 'A cheerful student who likes campus walks and hidden places.'),
((SELECT location_id FROM `location` WHERE location_name='Teaching Area T1-T8'), 'Professor Chen', 'Professor', 'Strict but helpful', 'A professor who gives study advice and academic support.'),
((SELECT location_id FROM `location` WHERE location_name='Sports Complex'), 'Alex', 'Gym Partner', 'Energetic and optimistic', 'A sporty student who encourages healthy routines.'),
((SELECT location_id FROM `location` WHERE location_name='Administration Building'), 'Mia', 'Career Mentor', 'Calm and practical', 'A senior student who helps with career planning and internships.'),
((SELECT location_id FROM `location` WHERE location_name='Arts Hill'), 'Yuki', 'Art Club Member', 'Imaginative and quiet', 'An art club member who introduces creative activities around Arts Hill.');

UPDATE `location`
SET require_affection_npc_id = (SELECT npc_id FROM npc WHERE npc_name='Lily'), require_affection_min = 60
WHERE location_name = 'Arts Hill Backyard';

INSERT INTO activity
(location_id, activity_name, activity_type, description, base_duration_minutes, gpa_effect, happiness_effect, fatigue_effect, money_effect, min_day, min_gpa)
VALUES
((SELECT location_id FROM `location` WHERE location_name='Teaching Area T1-T8'), 'Attend Professional Course', 'study', 'Attend lectures in the main teaching area.', 120, 0.10, -3, 8, 0, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Learning Resource Centre'), 'Study in Library', 'study', 'Study independently in the Learning Resource Centre.', 120, 0.15, -5, 10, 0, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Institute for Advanced Study'), 'Academic Lecture', 'study', 'Attend an advanced academic lecture.', 120, 0.20, 2, 12, 0, 7, 3.50),
((SELECT location_id FROM `location` WHERE location_name='Canteen 1'), 'Eat at Canteen 1', 'food', 'Have lunch at Canteen 1.', 60, 0.00, 8, -5, -20, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Canteen 2'), 'Eat at Canteen 2', 'food', 'Have dinner at Canteen 2.', 60, 0.00, 10, -6, -18, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Sports Complex'), 'Workout at Gym', 'exercise', 'Exercise indoors to reduce fatigue and improve mood.', 90, 0.00, 5, -12, 0, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Sports Park'), 'Outdoor Running', 'exercise', 'Run on the outdoor sports track.', 60, 0.00, 7, -10, 0, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='D1-D6 Dormitory Area'), 'Rest in Dorm', 'rest', 'Return to dorm and recover energy.', 120, 0.00, 4, -25, 0, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Central Lawn'), 'Campus Walk', 'explore', 'Take a calm walk across the central lawn.', 60, 0.00, 5, 3, 0, 1, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Lakeside Walkway'), 'Walk by the Lake', 'explore', 'Enjoy scenery around the lake.', 60, 0.00, 8, 2, 0, 2, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Huitong Village'), 'Explore Huitong Village', 'explore', 'Explore the historic village area.', 90, 0.00, 12, 5, 0, 3, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Cultural Creativity Clusters'), 'Creative Workshop', 'culture', 'Join a creative workshop.', 120, 0.00, 15, 8, -30, 5, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Performance Theatre'), 'Watch Performance', 'culture', 'Watch a campus performance.', 120, 0.00, 20, 5, -50, 3, 0.00),
((SELECT location_id FROM `location` WHERE location_name='Administration Building'), 'Career Consultation', 'career', 'Ask for career and internship guidance.', 120, 0.05, -3, 8, 0, 6, 3.30),
((SELECT location_id FROM `location` WHERE location_name='Arts Hill Backyard'), 'Meditation on the Hilltop', 'rest', 'Rest quietly at the hidden hilltop viewpoint.', 60, 0.00, 15, -10, 0, 5, 0.00);

-- Application views
CREATE VIEW v_map_asset AS
SELECT map_asset_id, map_name, image_path, image_width, image_height, description
FROM map_asset;

CREATE VIEW v_player_status AS
SELECT p.player_id, p.username, p.display_name, s.save_id, s.current_day, s.`current_time`, s.semester_phase,
       s.max_days, l.location_name AS current_location, s.gpa, s.happiness, s.fatigue, s.money,
       s.remaining_points, s.is_finished
FROM player p
JOIN game_save s ON p.player_id = s.player_id
LEFT JOIN `location` l ON s.current_location_id = l.location_id;

CREATE VIEW v_activity_location AS
SELECT a.activity_id, a.activity_name, a.activity_type, a.description, a.location_id, l.location_name,
       a.gpa_effect, a.happiness_effect, a.fatigue_effect, a.money_effect, a.min_day, a.min_gpa, a.is_available
FROM activity a JOIN `location` l ON a.location_id = l.location_id;

CREATE VIEW v_npc_location AS
SELECT n.npc_id, n.npc_name, n.npc_role, n.personality_desc, n.description, n.location_id, l.location_name, n.is_available
FROM npc n JOIN `location` l ON n.location_id = l.location_id;

CREATE VIEW v_npc_relationship AS
SELECT r.save_id, n.npc_id, n.npc_name, n.npc_role, l.location_name, r.first_met_time, r.last_met_time,
       r.meeting_count, r.relationship_type, r.affection, r.dialogue_stage, r.quest_stage, r.memory_note
FROM npc_relationship r
JOIN npc n ON r.npc_id = n.npc_id
JOIN `location` l ON n.location_id = l.location_id;

CREATE VIEW v_unlocked_locations AS
SELECT u.save_id, l.location_id, l.location_name, l.building_type, l.map_x, l.map_y, l.description,
       l.unlock_condition_day, l.require_gpa_min, l.require_affection_npc_id, l.require_affection_min,
       u.unlocked_date, u.unlock_reason
FROM location_unlock u JOIN `location` l ON u.location_id = l.location_id;

CREATE VIEW v_action_history AS
SELECT ar.action_id, ar.save_id, ar.log_id, ar.time_slot, ar.action_kind, l.location_name, a.activity_name,
       n.npc_name, ar.interaction_type, ar.gpa_before, ar.gpa_after, ar.happiness_before, ar.happiness_after,
       ar.fatigue_before, ar.fatigue_after, ar.money_before, ar.money_after, ar.action_description, ar.created_at
FROM action_record ar
JOIN `location` l ON ar.location_id = l.location_id
LEFT JOIN activity a ON ar.activity_id = a.activity_id
LEFT JOIN npc n ON ar.npc_id = n.npc_id;

DELIMITER $$
CREATE PROCEDURE create_new_game(
  IN p_username VARCHAR(50),
  IN p_display_name VARCHAR(50),
  OUT o_player_id INT,
  OUT o_save_id INT
)
BEGIN
  DECLARE v_start_location_id INT;
  START TRANSACTION;

  SELECT location_id INTO v_start_location_id FROM `location` WHERE location_name='D1-D6 Dormitory Area';

  INSERT INTO player(username, display_name)
  VALUES(p_username, p_display_name)
  ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

  SELECT player_id INTO o_player_id FROM player WHERE username = p_username;

  INSERT INTO game_save(player_id, current_location_id, current_day, `current_time`, semester_phase, gpa, happiness, fatigue, money, remaining_points)
  VALUES(o_player_id, v_start_location_id, 1, '08:00:00', 'Phase 1', 3.00, 50, 40, 150, 4);

  SET o_save_id = LAST_INSERT_ID();

  INSERT INTO location_unlock(save_id, location_id, unlocked_date, unlock_reason)
  SELECT o_save_id, location_id, CURDATE(), 'Default unlocked location'
  FROM `location` WHERE is_default_unlocked = TRUE;

  INSERT INTO npc_relationship(npc_id, save_id, relationship_type, affection, memory_note)
  SELECT npc_id, o_save_id, 'stranger', 0, CONCAT('The player has not met ', npc_name, ' yet.')
  FROM npc;

  COMMIT;
END$$

CREATE PROCEDURE check_location_unlocks(IN p_save_id INT)
BEGIN
  DECLARE v_day INT;
  DECLARE v_gpa DECIMAL(5,2);

  SELECT current_day, gpa INTO v_day, v_gpa FROM game_save WHERE save_id = p_save_id;

  INSERT IGNORE INTO location_unlock(save_id, location_id, unlocked_date, unlock_reason)
  SELECT p_save_id, l.location_id, CURDATE(), CONCAT('Unlocked by Day/GPA condition: Day >= ', l.unlock_condition_day, ', GPA >= ', l.require_gpa_min)
  FROM `location` l
  WHERE l.require_affection_npc_id IS NULL
    AND v_day >= l.unlock_condition_day
    AND v_gpa >= l.require_gpa_min;

  INSERT IGNORE INTO location_unlock(save_id, location_id, unlocked_date, unlock_reason)
  SELECT p_save_id, l.location_id, CURDATE(), CONCAT('Unlocked by NPC affection condition: ', n.npc_name, ' affection >= ', l.require_affection_min)
  FROM `location` l
  JOIN npc n ON l.require_affection_npc_id = n.npc_id
  JOIN npc_relationship r ON r.npc_id = n.npc_id AND r.save_id = p_save_id
  WHERE v_day >= l.unlock_condition_day
    AND v_gpa >= l.require_gpa_min
    AND r.affection >= l.require_affection_min;
END$$

CREATE PROCEDURE move_to_location(IN p_save_id INT, IN p_location_id INT)
BEGIN
  DECLARE v_count INT;
  DECLARE v_time TIME;
  DECLARE v_gpa DECIMAL(5,2);
  DECLARE v_happiness INT;
  DECLARE v_fatigue INT;
  DECLARE v_money INT;
  DECLARE v_name VARCHAR(80);

  START TRANSACTION;

  SELECT COUNT(*) INTO v_count FROM location_unlock WHERE save_id=p_save_id AND location_id=p_location_id;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This location has not been unlocked yet.';
  END IF;

  SELECT gpa, happiness, fatigue, money, `current_time` INTO v_gpa, v_happiness, v_fatigue, v_money, v_time
  FROM game_save WHERE save_id=p_save_id FOR UPDATE;
  SELECT location_name INTO v_name FROM `location` WHERE location_id=p_location_id;

  UPDATE game_save SET current_location_id=p_location_id WHERE save_id=p_save_id;

  INSERT INTO action_record(save_id, location_id, action_kind, time_slot, gpa_before, happiness_before, fatigue_before, money_before,
                            gpa_after, happiness_after, fatigue_after, money_after, action_description)
  VALUES(p_save_id, p_location_id, 'move', v_time, v_gpa, v_happiness, v_fatigue, v_money,
         v_gpa, v_happiness, v_fatigue, v_money, CONCAT('Moved to ', v_name));

  COMMIT;
END$$

CREATE PROCEDURE perform_activity(IN p_save_id INT, IN p_activity_id INT)
BEGIN
  DECLARE v_location_id INT;
  DECLARE v_unlocked INT;
  DECLARE v_activity_name VARCHAR(80);
  DECLARE v_type VARCHAR(30);
  DECLARE v_gpa_before DECIMAL(5,2);
  DECLARE v_happiness_before INT;
  DECLARE v_fatigue_before INT;
  DECLARE v_money_before INT;
  DECLARE v_time TIME;
  DECLARE v_points INT;
  DECLARE v_day INT;
  DECLARE v_min_day INT;
  DECLARE v_min_gpa DECIMAL(5,2);
  DECLARE v_ge DECIMAL(5,2);
  DECLARE v_he INT;
  DECLARE v_fe INT;
  DECLARE v_me INT;
  DECLARE v_gpa_after DECIMAL(5,2);
  DECLARE v_happiness_after INT;
  DECLARE v_fatigue_after INT;
  DECLARE v_money_after INT;
  DECLARE v_next_time TIME;

  START TRANSACTION;

  SELECT current_day, gpa, happiness, fatigue, money, `current_time`, remaining_points
  INTO v_day, v_gpa_before, v_happiness_before, v_fatigue_before, v_money_before, v_time, v_points
  FROM game_save WHERE save_id=p_save_id FOR UPDATE;

  IF v_points <= 0 OR v_time = '23:59:00' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No remaining action points today. Please end the day.';
  END IF;

  SELECT location_id, activity_name, activity_type, gpa_effect, happiness_effect, fatigue_effect, money_effect, min_day, min_gpa
  INTO v_location_id, v_activity_name, v_type, v_ge, v_he, v_fe, v_me, v_min_day, v_min_gpa
  FROM activity WHERE activity_id=p_activity_id AND is_available=TRUE;

  SELECT COUNT(*) INTO v_unlocked FROM location_unlock WHERE save_id=p_save_id AND location_id=v_location_id;
  IF v_unlocked = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The activity location is locked.';
  END IF;
  IF v_day < v_min_day OR v_gpa_before < v_min_gpa THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You do not meet the requirement for this activity.';
  END IF;

  IF v_fatigue_before >= 75 AND v_type = 'study' THEN
    SET v_ge = v_ge * 0.50;
  END IF;

  SET v_gpa_after = LEAST(4.00, GREATEST(0.00, v_gpa_before + v_ge));
  SET v_happiness_after = LEAST(100, GREATEST(0, v_happiness_before + v_he));
  SET v_fatigue_after = LEAST(100, GREATEST(0, v_fatigue_before + v_fe));
  SET v_money_after = GREATEST(0, v_money_before + v_me);
  SET v_next_time = CASE v_time WHEN '08:00:00' THEN '10:00:00' WHEN '10:00:00' THEN '16:00:00'
                    WHEN '16:00:00' THEN '22:00:00' ELSE '23:59:00' END;

  UPDATE game_save
  SET current_location_id=v_location_id, gpa=v_gpa_after, happiness=v_happiness_after,
      fatigue=v_fatigue_after, money=v_money_after, remaining_points=remaining_points-1, `current_time`=v_next_time
  WHERE save_id=p_save_id;

  INSERT INTO action_record(save_id, location_id, activity_id, action_kind, time_slot, gpa_before, happiness_before, fatigue_before, money_before,
                            gpa_after, happiness_after, fatigue_after, money_after, action_description)
  VALUES(p_save_id, v_location_id, p_activity_id, 'activity', v_time, v_gpa_before, v_happiness_before, v_fatigue_before, v_money_before,
         v_gpa_after, v_happiness_after, v_fatigue_after, v_money_after, CONCAT('Performed activity: ', v_activity_name));

  CALL check_location_unlocks(p_save_id);
  COMMIT;
END$$

CREATE PROCEDURE interact_with_npc(IN p_save_id INT, IN p_npc_id INT, IN p_interaction_type VARCHAR(30))
BEGIN
  DECLARE v_location_id INT;
  DECLARE v_unlocked INT;
  DECLARE v_npc_name VARCHAR(80);
  DECLARE v_gpa_before DECIMAL(5,2);
  DECLARE v_happiness_before INT;
  DECLARE v_fatigue_before INT;
  DECLARE v_money_before INT;
  DECLARE v_time TIME;
  DECLARE v_points INT;
  DECLARE v_gain INT DEFAULT 5;
  DECLARE v_ge DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_he INT DEFAULT 3;
  DECLARE v_fe INT DEFAULT 2;
  DECLARE v_me INT DEFAULT 0;
  DECLARE v_gpa_after DECIMAL(5,2);
  DECLARE v_happiness_after INT;
  DECLARE v_fatigue_after INT;
  DECLARE v_money_after INT;
  DECLARE v_next_time TIME;
  DECLARE v_new_affection INT;
  DECLARE v_relation VARCHAR(30);

  START TRANSACTION;

  SELECT location_id, npc_name INTO v_location_id, v_npc_name FROM npc WHERE npc_id=p_npc_id AND is_available=TRUE;
  SELECT COUNT(*) INTO v_unlocked FROM location_unlock WHERE save_id=p_save_id AND location_id=v_location_id;
  IF v_unlocked = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This NPC is in a locked location.';
  END IF;

  SELECT gpa, happiness, fatigue, money, `current_time`, remaining_points
  INTO v_gpa_before, v_happiness_before, v_fatigue_before, v_money_before, v_time, v_points
  FROM game_save WHERE save_id=p_save_id FOR UPDATE;

  IF v_points <= 0 OR v_time = '23:59:00' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No remaining action points today. Please end the day.';
  END IF;

  IF p_interaction_type = 'chat' THEN
    SET v_gain=8; SET v_he=6; SET v_fe=2; SET v_ge=0.00; SET v_me=0;
  ELSEIF p_interaction_type = 'ask_advice' THEN
    SET v_gain=5; SET v_he=3; SET v_fe=3; SET v_ge=0.05; SET v_me=0;
  ELSEIF p_interaction_type = 'give_gift' THEN
    SET v_gain=15; SET v_he=8; SET v_fe=0; SET v_ge=0.00; SET v_me=-30;
  ELSE
    SET v_gain=4; SET v_he=2; SET v_fe=1; SET v_ge=0.00; SET v_me=0;
  END IF;

  SET v_gpa_after = LEAST(4.00, GREATEST(0.00, v_gpa_before + v_ge));
  SET v_happiness_after = LEAST(100, GREATEST(0, v_happiness_before + v_he));
  SET v_fatigue_after = LEAST(100, GREATEST(0, v_fatigue_before + v_fe));
  SET v_money_after = GREATEST(0, v_money_before + v_me);
  SET v_next_time = CASE v_time WHEN '08:00:00' THEN '10:00:00' WHEN '10:00:00' THEN '16:00:00'
                    WHEN '16:00:00' THEN '22:00:00' ELSE '23:59:00' END;

  INSERT INTO npc_relationship(npc_id, save_id, first_met_time, last_met_time, meeting_count, relationship_type, affection, dialogue_stage, quest_stage, memory_note)
  VALUES(p_npc_id, p_save_id, NOW(), NOW(), 1, 'acquaintance', v_gain, 1, 0, CONCAT('First interaction with ', v_npc_name))
  ON DUPLICATE KEY UPDATE
    first_met_time = IFNULL(first_met_time, NOW()),
    last_met_time = NOW(),
    meeting_count = meeting_count + 1,
    affection = LEAST(100, affection + v_gain),
    dialogue_stage = dialogue_stage + 1,
    memory_note = CONCAT('Latest interaction: ', p_interaction_type);

  SELECT affection INTO v_new_affection FROM npc_relationship WHERE npc_id=p_npc_id AND save_id=p_save_id;
  SET v_relation = CASE WHEN v_new_affection >= 80 THEN 'close_friend'
                        WHEN v_new_affection >= 50 THEN 'friend'
                        WHEN v_new_affection >= 20 THEN 'acquaintance'
                        ELSE 'stranger' END;
  UPDATE npc_relationship SET relationship_type=v_relation WHERE npc_id=p_npc_id AND save_id=p_save_id;

  UPDATE game_save
  SET current_location_id=v_location_id, gpa=v_gpa_after, happiness=v_happiness_after, fatigue=v_fatigue_after,
      money=v_money_after, remaining_points=remaining_points-1, `current_time`=v_next_time
  WHERE save_id=p_save_id;

  INSERT INTO action_record(save_id, location_id, npc_id, action_kind, interaction_type, time_slot, gpa_before, happiness_before, fatigue_before, money_before,
                            gpa_after, happiness_after, fatigue_after, money_after, action_description)
  VALUES(p_save_id, v_location_id, p_npc_id, 'npc', p_interaction_type, v_time, v_gpa_before, v_happiness_before, v_fatigue_before, v_money_before,
         v_gpa_after, v_happiness_after, v_fatigue_after, v_money_after, CONCAT('Interacted with ', v_npc_name, ' by ', p_interaction_type));

  CALL check_location_unlocks(p_save_id);
  COMMIT;
END$$

CREATE PROCEDURE end_day(IN p_save_id INT)
BEGIN
  DECLARE v_day INT;
  DECLARE v_max_days INT;
  DECLARE v_gpa DECIMAL(5,2);
  DECLARE v_happiness INT;
  DECLARE v_fatigue INT;
  DECLARE v_money INT;
  DECLARE v_time TIME;
  DECLARE v_actions INT;
  DECLARE v_stayed_up BOOLEAN;
  DECLARE v_happiness_after INT;
  DECLARE v_fatigue_after INT;

  START TRANSACTION;
  SELECT current_day, max_days, gpa, happiness, fatigue, money, `current_time`
  INTO v_day, v_max_days, v_gpa, v_happiness, v_fatigue, v_money, v_time
  FROM game_save WHERE save_id=p_save_id FOR UPDATE;

  SELECT COUNT(*) INTO v_actions FROM action_record WHERE save_id=p_save_id AND log_id IS NULL AND action_kind IN ('activity','npc');
  SET v_stayed_up = IF(v_time='23:59:00' OR v_fatigue >= 75, TRUE, FALSE);
  SET v_happiness_after = GREATEST(0, v_happiness - IF(v_stayed_up, 5, 0));
  SET v_fatigue_after = LEAST(100, GREATEST(0, v_fatigue + IF(v_stayed_up, 10, -10)));

  INSERT INTO day_log(save_id, day_number, is_stayed_up, gpa_before_day, happiness_before_day, fatigue_before_day, money_before_day,
                      gpa_after_day, happiness_after_day, fatigue_after_day, money_after_day, actions_completed)
  VALUES(p_save_id, v_day, v_stayed_up, v_gpa, v_happiness, v_fatigue, v_money,
         v_gpa, v_happiness_after, v_fatigue_after, v_money, v_actions);

  UPDATE action_record SET log_id = LAST_INSERT_ID() WHERE save_id=p_save_id AND log_id IS NULL;

  IF v_day >= v_max_days THEN
    UPDATE game_save SET happiness=v_happiness_after, fatigue=v_fatigue_after, is_finished=TRUE, remaining_points=0, `current_time`='23:59:00'
    WHERE save_id=p_save_id;
  ELSE
    UPDATE game_save
    SET current_day=current_day+1, `current_time`='08:00:00', remaining_points=4,
        current_location_id=(SELECT location_id FROM `location` WHERE location_name='D1-D6 Dormitory Area'),
        happiness=v_happiness_after, fatigue=v_fatigue_after
    WHERE save_id=p_save_id;
  END IF;

  CALL check_location_unlocks(p_save_id);
  COMMIT;
END$$

CREATE PROCEDURE generate_ending(IN p_save_id INT)
BEGIN
  DECLARE v_player_id INT;
  DECLARE v_gpa DECIMAL(5,2);
  DECLARE v_happiness INT;
  DECLARE v_fatigue INT;
  DECLARE v_money INT;
  DECLARE v_avg_affection DECIMAL(5,2);
  DECLARE v_title VARCHAR(100);
  DECLARE v_desc TEXT;

  SELECT player_id, gpa, happiness, fatigue, money INTO v_player_id, v_gpa, v_happiness, v_fatigue, v_money
  FROM game_save WHERE save_id=p_save_id;

  SELECT IFNULL(AVG(affection),0) INTO v_avg_affection FROM npc_relationship WHERE save_id=p_save_id;

  IF v_gpa >= 3.60 AND v_happiness >= 65 AND v_fatigue <= 60 THEN
    SET v_title='Excellent Graduate';
    SET v_desc='You achieved strong academic success while keeping a balanced campus life.';
  ELSEIF v_avg_affection >= 60 AND v_happiness >= 55 THEN
    SET v_title='Beloved Campus Friend';
    SET v_desc='You built warm relationships across campus, and many familiar faces remember your semester.';
  ELSEIF v_gpa >= 3.00 AND v_happiness >= 45 AND v_fatigue <= 75 THEN
    SET v_title='Balanced Graduate';
    SET v_desc='You managed study, rest, social life and exploration in a balanced way.';
  ELSEIF v_gpa < 2.00 THEN
    SET v_title='Academic Crisis';
    SET v_desc='You ignored too many academic responsibilities, and your GPA dropped into a dangerous range.';
  ELSEIF v_fatigue >= 85 THEN
    SET v_title='Burned Out Student';
    SET v_desc='You pushed yourself too hard and ignored rest, leading to severe fatigue.';
  ELSEIF v_money >= 500 THEN
    SET v_title='Campus Entrepreneur';
    SET v_desc='You earned a lot through campus work, though balance may have suffered.';
  ELSE
    SET v_title='Ordinary Campus Life';
    SET v_desc='You completed the semester with an ordinary but memorable campus experience.';
  END IF;

  INSERT INTO ending(save_id, player_id, ending_title, description, final_gpa, final_happiness, final_fatigue, final_money, avg_affection)
  VALUES(p_save_id, v_player_id, v_title, v_desc, v_gpa, v_happiness, v_fatigue, v_money, v_avg_affection);
END$$
DELIMITER ;

-- Optional smoke test after import:
-- CALL create_new_game('test_player', 'Test Player', @pid, @sid);
-- SELECT @pid, @sid;
-- SELECT * FROM v_player_status;
