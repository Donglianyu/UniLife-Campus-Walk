SET NAMES utf8mb4;
USE unilife_campus_walk;
SET FOREIGN_KEY_CHECKS = 0;

-- Keep existing imported saves aligned with the 16-day game length.
ALTER TABLE game_save MODIFY max_days INT NOT NULL DEFAULT 16;
UPDATE game_save
SET max_days = 16,
    current_day = LEAST(current_day, 16)
WHERE max_days <> 16 OR current_day > 16;

-- Latest hidden locations added by mobile gameplay update.
INSERT INTO `location`(location_id, map_asset_id, location_name, building_type, map_x, map_y, unlock_condition_day, require_gpa_min, require_affection_npc_id, require_affection_min, description, is_default_unlocked) VALUES
(21, 1, 'Artificial Lake Dock', 'Secret', 1660, 610, 4, 0, NULL, 35, 'Hidden dock for kayaking and lake cleanup missions.', FALSE),
(22, 1, 'Campus Plaza', 'Social', 1160, 700, 2, 0, NULL, 0, 'Open plaza where clubs set up booths and pop-up events.', FALSE),
(23, 1, 'Old Village Workshop', 'Secret', 560, 720, 6, 0, NULL, 35, 'A small Huitong workshop unlocked through village field support.', FALSE)
ON DUPLICATE KEY UPDATE location_name=VALUES(location_name), building_type=VALUES(building_type), map_x=VALUES(map_x), map_y=VALUES(map_y), unlock_condition_day=VALUES(unlock_condition_day), require_gpa_min=VALUES(require_gpa_min), require_affection_min=VALUES(require_affection_min), description=VALUES(description), is_default_unlocked=VALUES(is_default_unlocked);

INSERT INTO npc(npc_id, location_id, npc_name, npc_role, personality_desc, description, is_available) VALUES
(7, 21, 'Kai', 'Kayak Coach', 'Steady and encouraging', 'He opens lake missions after you build a reliable campus routine.', TRUE),
(8, 22, 'Nora', 'Club Captain', 'Organized and bright', 'She coordinates plaza booths and student club events.', TRUE)
ON DUPLICATE KEY UPDATE location_id=VALUES(location_id), npc_role=VALUES(npc_role), personality_desc=VALUES(personality_desc), description=VALUES(description), is_available=VALUES(is_available);

UPDATE `location` SET require_affection_npc_id = 3 WHERE location_id = 21;
UPDATE `location` SET require_affection_npc_id = 6 WHERE location_id = 23;

INSERT INTO activity(activity_id, location_id, activity_name, activity_type, description, base_duration_minutes, gpa_effect, happiness_effect, fatigue_effect, money_effect, min_day, min_gpa, is_available) VALUES
(81, 21, 'Kayak Across the Lake', 'exercise', 'Paddle a short loop from the hidden dock.', 90, 0, 14, 6, -15, 4, 0, TRUE),
(82, 21, 'Lake Safety Briefing', 'system', 'Join a dock safety briefing before lake activities.', 45, 0.03, 4, 2, 0, 4, 0, TRUE),
(83, 21, 'Water Sampling Mission', 'study', 'Collect lake samples for an environmental class.', 90, 0.1, 3, 8, 20, 4, 0, TRUE),
(84, 21, 'Hidden Dock Cleanup', 'work', 'Help clean the dock and receive a small campus stipend.', 75, 0, 7, 7, 35, 4, 0, TRUE),
(85, 22, 'Club Booth Duty', 'social', 'Help run a student club booth on the plaza.', 90, 0.02, 12, 6, 15, 2, 0, TRUE),
(86, 22, 'Campus Market Stall', 'work', 'Run a small pop-up stall during plaza hour.', 90, 0, 8, 8, 45, 2, 0, TRUE),
(87, 22, 'Join Society Fair', 'social', 'Explore student societies and choose one to follow.', 60, 0.03, 10, 4, 0, 2, 0, TRUE),
(88, 22, 'Public Speaking Corner', 'career', 'Practice a short public pitch in the plaza.', 60, 0.05, 5, 6, 0, 3, 0, TRUE),
(89, 23, 'Repair Old Workshop Tools', 'work', 'Help Mr. Liang repair tools in the old village workshop.', 90, 0, 6, 9, 55, 6, 0, TRUE),
(90, 23, 'Village Craft Lesson', 'culture', 'Learn a traditional craft from village residents.', 90, 0.04, 14, 6, -10, 6, 0, TRUE),
(91, 23, 'Archive Village Stories', 'study', 'Record oral history notes for a campus archive.', 90, 0.12, 5, 8, 20, 6, 0, TRUE),
(92, 23, 'Secret Workshop Reflection', 'rest', 'Rest in the quiet workshop after field work.', 60, 0.03, 10, -8, 0, 6, 0, TRUE)
ON DUPLICATE KEY UPDATE location_id=VALUES(location_id), activity_name=VALUES(activity_name), activity_type=VALUES(activity_type), description=VALUES(description), base_duration_minutes=VALUES(base_duration_minutes), gpa_effect=VALUES(gpa_effect), happiness_effect=VALUES(happiness_effect), fatigue_effect=VALUES(fatigue_effect), money_effect=VALUES(money_effect), min_day=VALUES(min_day), min_gpa=VALUES(min_gpa), is_available=VALUES(is_available);

SET FOREIGN_KEY_CHECKS = 1;
