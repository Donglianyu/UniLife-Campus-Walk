-- Latest enhanced event schedule.
SET NAMES utf8mb4;
USE unilife_campus_walk;

CREATE TABLE IF NOT EXISTS campus_event (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  day_mod INT NOT NULL,
  time_slot TIME NOT NULL,
  event_title VARCHAR(100) NOT NULL,
  activity_id INT DEFAULT NULL,
  activity_name VARCHAR(100) DEFAULT NULL,
  location_id INT DEFAULT NULL,
  location_name VARCHAR(80) DEFAULT NULL,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  description VARCHAR(255) NOT NULL,
  CONSTRAINT chk_campus_event_day_mod CHECK (day_mod BETWEEN 0 AND 6),
  CONSTRAINT chk_campus_event_time CHECK (time_slot IN ('08:00:00','10:00:00','16:00:00','22:00:00'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELETE FROM campus_event;

INSERT INTO campus_event(day_mod, time_slot, event_title, activity_id, activity_name, location_id, location_name, is_required, description) VALUES
(1, '08:00:00', 'Core Course Morning', 41, 'Attend Professional Course', 11, 'Teaching Area T1-T8', TRUE, 'Required now: Attend Professional Course at Teaching Area T1-T8.'),
(1, '10:00:00', 'Club Recruitment Check', 35, 'Club Recruitment Visit', 9, 'Central Lawn', TRUE, 'Required now: Club Recruitment Visit at Central Lawn.'),
(1, '16:00:00', 'Dinner Energy Check', 49, 'Eat at Canteen 2', 13, 'Canteen 2', TRUE, 'Required now: Eat at Canteen 2 at Canteen 2.'),
(1, '22:00:00', 'Dorm Sleep Routine', 5, 'Sleep Early', 2, 'D1-D6 Dormitory Area', TRUE, 'Required now: Sleep Early at D1-D6 Dormitory Area.'),
(2, '08:00:00', 'Tutorial Attendance', 45, 'Attend Tutorial Class', 12, 'CEFC Teaching Building', TRUE, 'Required now: Attend Tutorial Class at CEFC Teaching Building.'),
(2, '10:00:00', 'Plaza Club Booth Duty', 85, 'Club Booth Duty', 22, 'Campus Plaza', TRUE, 'Required now: Club Booth Duty at Campus Plaza.'),
(2, '16:00:00', 'Huitong Field Visit', 57, 'Explore Huitong Village', 15, 'Huitong Village', TRUE, 'Required now: Explore Huitong Village at Huitong Village.'),
(2, '22:00:00', 'Residential Recovery', 25, 'Rest in Residential Area', 7, 'Hui Xian Village V21-V29', TRUE, 'Required now: Rest in Residential Area at Hui Xian Village V21-V29.'),
(3, '08:00:00', 'Quiz Session', 44, 'Take Quiz', 11, 'Teaching Area T1-T8', TRUE, 'Required now: Take Quiz at Teaching Area T1-T8.'),
(3, '10:00:00', 'Arts Hill Sketch Task', 13, 'Sketch on Arts Hill', 4, 'Arts Hill', TRUE, 'Required now: Sketch on Arts Hill at Arts Hill.'),
(3, '16:00:00', 'Campus Performance Night', 65, 'Watch Performance', 17, 'Performance Theatre', TRUE, 'Required now: Watch Performance at Performance Theatre.'),
(3, '22:00:00', 'Study Plan Reflection', 22, 'Reflect on Study Plan', 6, 'Lakeside Walkway', TRUE, 'Required now: Reflect on Study Plan at Lakeside Walkway.'),
(4, '08:00:00', 'Lake Sampling Mission', 83, 'Water Sampling Mission', 21, 'Artificial Lake Dock', TRUE, 'Required now: Water Sampling Mission at Artificial Lake Dock.'),
(4, '10:00:00', 'Team Project Meeting', 47, 'Team Project Meeting', 12, 'CEFC Teaching Building', TRUE, 'Required now: Team Project Meeting at CEFC Teaching Building.'),
(4, '16:00:00', 'Gym Recovery Plan', 53, 'Workout at Gym', 14, 'Sports Complex', TRUE, 'Required now: Workout at Gym at Sports Complex.'),
(4, '22:00:00', 'Personal Planning Check', 20, 'Organize Personal Plan', 5, 'Da Tong Village V15-V20', TRUE, 'Required now: Organize Personal Plan at Da Tong Village V15-V20.'),
(5, '08:00:00', 'Creative Workshop Session', 61, 'Creative Workshop', 16, 'Cultural Creativity Clusters', TRUE, 'Required now: Creative Workshop at Cultural Creativity Clusters.'),
(5, '10:00:00', 'Hidden Lily Meeting', 78, 'Secret Talk with Lily', 20, 'Arts Hill Backyard', TRUE, 'Required now: Secret Talk with Lily at Arts Hill Backyard.'),
(5, '16:00:00', 'Event Volunteer Call', 67, 'Volunteer for Event', 17, 'Performance Theatre', TRUE, 'Required now: Volunteer for Event at Performance Theatre.'),
(5, '22:00:00', 'Reflection Journal Night', 80, 'Write Reflection Journal', 20, 'Arts Hill Backyard', TRUE, 'Required now: Write Reflection Journal at Arts Hill Backyard.'),
(6, '08:00:00', 'Career Consultation Slot', 69, 'Career Consultation', 18, 'Administration Building', TRUE, 'Required now: Career Consultation at Administration Building.'),
(6, '10:00:00', 'Advanced Seminar Slot', 1, 'Attend Advanced Seminar', 1, 'Institute for Advanced Study', TRUE, 'Required now: Attend Advanced Seminar at Institute for Advanced Study.'),
(6, '16:00:00', 'Old Workshop Repair', 89, 'Repair Old Workshop Tools', 23, 'Old Village Workshop', TRUE, 'Required now: Repair Old Workshop Tools at Old Village Workshop.'),
(6, '22:00:00', 'Laundry Reset Reminder', 28, 'Laundry and Reset', 7, 'Hui Xian Village V21-V29', TRUE, 'Required now: Laundry and Reset at Hui Xian Village V21-V29.'),
(0, '08:00:00', 'Public Lecture Window', 74, 'Join Public Lecture', 19, 'University Hall', TRUE, 'Required now: Join Public Lecture at University Hall.'),
(0, '10:00:00', 'Sports Park Training', 9, 'Outdoor Running', 3, 'Sports Park', TRUE, 'Required now: Outdoor Running at Sports Park.'),
(0, '16:00:00', 'University Hall Guide Shift', 76, 'Volunteer as Guide', 19, 'University Hall', TRUE, 'Required now: Volunteer as Guide at University Hall.'),
(0, '22:00:00', 'Village Lounge Recovery', 17, 'Rest at Village Lounge', 5, 'Da Tong Village V15-V20', TRUE, 'Required now: Rest at Village Lounge at Da Tong Village V15-V20.'),
(1, '10:00:00', 'Sunny Lawn Hour', NULL, NULL, NULL, NULL, FALSE, 'Social activities give you a little more breathing room today.'),
(2, '22:00:00', 'Quiet Campus Night', NULL, NULL, NULL, NULL, FALSE, 'Rest activities are especially valuable tonight.'),
(3, '10:00:00', 'Library Seat Rush', NULL, NULL, NULL, NULL, FALSE, 'Study now before the good seats disappear.'),
(4, '16:00:00', 'Canteen Peak Time', NULL, NULL, NULL, NULL, FALSE, 'Food choices matter when money is tight.'),
(5, '22:00:00', 'Late Deadline Mood', NULL, NULL, NULL, NULL, FALSE, 'Fatigue penalties are easier to trigger tonight.'),
(0, '10:00:00', 'Open Campus Window', NULL, NULL, NULL, NULL, FALSE, 'No required task in this slot. Explore, earn, or recover.');
