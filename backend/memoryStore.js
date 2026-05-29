const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'memory-save.json');
const GAME_MAX_DAYS = 16;

const mapAsset = {
  map_asset_id: 1,
  map_name: 'BNBU/UIC Campus Guide',
  image_path: '/assets/bnub_uic_campus_map.png',
  image_width: 2057,
  image_height: 1196,
  description: 'Clear BNBU/UIC campus guide used as the game map background.'
};

const locations = [
  [1, 'Institute for Advanced Study', 'Study', 275, 160, 7, 3.5, null, 0, 'Advanced research and academic challenge area.', false],
  [2, 'D1-D6 Dormitory Area', 'Rest', 270, 350, 1, 0, null, 0, 'Main dormitory ring. Sleep and recovery are essential here.', true],
  [3, 'Sports Park', 'Exercise', 770, 320, 1, 0, null, 0, 'Outdoor track and sports fields.', true],
  [4, 'Arts Hill', 'Cultural', 1565, 295, 3, 0, null, 0, 'Creative hill area for cultural exploration.', false],
  [5, 'Da Tong Village V15-V20', 'Rest', 1265, 405, 1, 0, null, 0, 'Residential village near the northern teaching cluster.', true],
  [6, 'Lakeside Walkway', 'Social', 1605, 650, 2, 0, null, 0, 'Scenic lakeside route for walks and inspiration.', false],
  [7, 'Hui Xian Village V21-V29', 'Rest', 920, 625, 1, 0, null, 0, 'Student living area close to class buildings.', true],
  [8, 'Learning Resource Centre', 'Study', 1405, 715, 1, 0, null, 0, 'Library and learning resource center.', true],
  [9, 'Central Lawn', 'Social', 1060, 775, 1, 0, null, 0, 'Central green space for social time and short breaks.', true],
  [10, 'Canteen 1', 'Food', 1550, 500, 1, 0, null, 0, 'Canteen near T4 and the lake.', true],
  [11, 'Teaching Area T1-T8', 'Study', 1280, 870, 1, 0, null, 0, 'Main teaching area. Required classes happen here.', true],
  [12, 'CEFC Teaching Building', 'Study', 980, 740, 1, 0, null, 0, 'Classrooms and study rooms near Hui Xian Village.', true],
  [13, 'Canteen 2', 'Food', 870, 815, 1, 0, null, 0, 'Canteen near the southern residential area.', true],
  [14, 'Sports Complex', 'Exercise', 1500, 950, 1, 0, null, 0, 'Indoor gym and courts.', true],
  [15, 'Huitong Village', 'Work', 520, 760, 2, 0, null, 0, 'Historic village. Good place for field work and heritage projects.', false],
  [16, 'Cultural Creativity Clusters', 'Cultural', 1800, 565, 5, 0, null, 0, 'Creative cluster for exhibitions, markets, and design events.', false],
  [17, 'Performance Theatre', 'Cultural', 1705, 735, 3, 0, null, 0, 'Theatre for shows, rehearsals, and campus performances.', false],
  [18, 'Administration Building', 'System', 1810, 835, 1, 0, null, 0, 'Administrative service center and scholarship office.', true],
  [19, 'University Hall', 'System', 1700, 895, 1, 0, null, 0, 'Large hall for ceremonies, lectures, and events.', true],
  [20, 'Arts Hill Backyard', 'Secret', 1560, 245, 5, 0, 1, 60, 'Hidden viewpoint unlocked through friendship with Lili.', false],
  [21, 'Artificial Lake Dock', 'Secret', 1660, 610, 4, 0, null, 0, 'Lake dock for kayaking, safety briefings, and cleanup missions. Unlocks automatically on Day 4.', false],
  [22, 'Campus Plaza', 'Social', 1225, 660, 2, 0, null, 0, 'Open plaza where clubs set up booths and pop-up events.', false],
  [23, 'Old Village Workshop', 'Secret', 560, 720, 6, 0, null, 0, 'A small Huitong workshop for repair work and village craft lessons. Unlocks automatically on Day 6.', false]
].map(([location_id, location_name, building_type, map_x, map_y, unlock_condition_day, require_gpa_min, require_affection_npc_id, require_affection_min, description, is_default_unlocked]) => ({
  location_id,
  map_asset_id: 1,
  location_name,
  building_type,
  map_x,
  map_y,
  unlock_condition_day,
  require_gpa_min,
  require_affection_npc_id,
  require_affection_min,
  description,
  is_default_unlocked
}));

function locationById(id) {
  return locations.find(location => location.location_id === id);
}

const npcs = [
  [1, 9, 'Lili', 'Classmate', 'Friendly and curious', 'She knows shortcuts, hidden views, and good places to decompress.'],
  [2, 11, 'Professor Chen', 'Professor', 'Strict but helpful', 'He rewards consistent class attendance and gives academic advice.'],
  [3, 14, 'Alex', 'Gym Partner', 'Energetic and optimistic', 'He helps you turn exercise into useful recovery.'],
  [4, 18, 'Mia', 'Career Mentor', 'Calm and practical', 'She can help you find scholarship and part-time opportunities.'],
  [5, 4, 'Yuki', 'Art Club Member', 'Imaginative and quiet', 'She introduces creative activities around Arts Hill.'],
  [6, 15, 'Mr. Liang', 'Village Coordinator', 'Observant and generous', 'He pays students for useful field support in Huitong Village.'],
  [7, 21, 'Kai', 'Kayak Coach', 'Steady and encouraging', 'He opens lake missions after you build a reliable campus routine.'],
  [8, 22, 'Nora', 'Club Captain', 'Organized and bright', 'She coordinates plaza booths and student club events.']
].map(([npc_id, location_id, npc_name, npc_role, personality_desc, description]) => ({
  npc_id,
  location_id,
  location_name: locationById(location_id).location_name,
  npc_name,
  npc_role,
  personality_desc,
  description,
  is_available: true
}));

const defaultInteractionEffects = {
  chat: { gain: 8, gpa: 0, happiness: 6, fatigue: 2, money: 0 },
  ask_advice: { gain: 5, gpa: 0.05, happiness: 3, fatigue: 3, money: 0 },
  give_gift: { gain: 15, gpa: 0, happiness: 8, fatigue: 0, money: -30 },
  find_job: { gain: 10, gpa: 0.02, happiness: 2, fatigue: 5, money: 25 }
};

const npcStories = {
  1: {
    story_title: 'Hidden Route Romance',
    story_summary: 'Lili turns campus shortcuts into a slow-burn romance about trust, timing, and small promises.',
    gift_name: 'pressed flower bookmark',
    gift_cost: 30,
    favor_label: 'Plan Date',
    interaction_labels: {
      chat: 'Chat',
      ask_advice: 'Heart Talk',
      give_gift: 'Gift Bookmark',
      find_job: 'Plan Date'
    },
    effects: {
      chat: { gain: 9, gpa: 0, happiness: 7, fatigue: 1, money: 0 },
      ask_advice: { gain: 7, gpa: 0.02, happiness: 5, fatigue: 1, money: 0 },
      give_gift: { gain: 18, gpa: 0, happiness: 10, fatigue: 0, money: -30 },
      find_job: { gain: 8, gpa: 0, happiness: 6, fatigue: 2, money: 0 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Lili: You always look like you are sprinting through the semester. Want a quieter route across campus?\nYou: I could use one. Especially if it comes with good company.' },
        { minStage: 1, text: 'Lili: The lake is better when nobody is rushing. If we go again, let us actually call it a date.\nYou: Then I will not hide behind the word "walk".' },
        { minStage: 2, text: 'Lili: I found the hilltop behind Arts Hill. It feels like campus forgot to be loud there.\nYou: Save that place for us.' },
        { minStage: 3, text: 'Lili: We made it through deadlines, rain, and terrible cafeteria timing. I still choose the long way if you are there.\nYou: Then we have a route.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Lili: Pick one thing today that makes tomorrow easier. Not ten things. One.\nYou: That sounds suspiciously healthy.' },
        { minStage: 1, text: 'Lili: Do the required work first, then keep one hour that belongs to you. That is how you do not disappear into the timetable.\nYou: I will try the Lili method.' },
        { minStage: 2, text: 'Lili: If you want the sunset plan to work, protect your energy. Romance is less charming when one person is half asleep.\nYou: Noted. Rest is now part of the strategy.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Lili: A pressed flower bookmark? This is dangerously specific.\nYou: I noticed you fold paper corners. This seemed kinder.' },
        { minStage: 1, text: 'Lili: You remembered the flower from the lake path. I am trying not to smile too obviously.\nYou: I am failing at the same thing.' },
        { minStage: 2, text: 'Lili: I will keep this in my notebook. If I pretend it is casual, do not believe me.\nYou: I would never accuse you of being casual.' }
      ],
      find_job: [
        { minStage: 0, text: 'Lili: Practical plan: finish one useful task, then meet me somewhere pretty.\nYou: That is the best productivity system I have heard.' },
        { minStage: 1, text: 'Lili: Two days. No dramatic promises, just show up when you said you would.\nYou: I can do that.' },
        { minStage: 2, text: 'Lili: The hilltop date needs a calm evening and enough courage to say things plainly.\nYou: I am working on both.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Shortcut to the Lake',
        trigger: 'chat',
        intro: 'Lili marks a quiet route in your notebook and asks you to test it when the lake opens up.',
        activeNote: 'Go to Lakeside Walkway and do "Walk by the Lake" on Day 2 or later.',
        objective: { kind: 'activity', activityId: 21, waitDays: 1 },
        reward: { affection: 10, happiness: 5, fatigue: -4 },
        complete: 'You follow Lili\'s route. The lake is quiet, and her notes in the margin feel like a private invitation.'
      },
      {
        stage: 1,
        title: 'Two-Day Date Promise',
        trigger: 'chat',
        minAffection: 18,
        intro: 'Lili says the next lake walk should be a real date, but only if you can wait two days and still remember.',
        activeNote: 'Wait two days, then do "Talk with Lili by Lake" at Lakeside Walkway.',
        objective: { kind: 'activity', activityId: 23, waitDays: 2 },
        reward: { affection: 14, happiness: 8, fatigue: -2 },
        complete: 'The date is small and honest: shared quiet, bad jokes, and the relief of being expected.'
      },
      {
        stage: 2,
        title: 'Backyard Sunset',
        trigger: 'chat',
        minDay: 5,
        minAffection: 60,
        intro: 'Lili trusts you with the hidden Arts Hill Backyard and asks for one sunset with no running away.',
        activeNote: 'Reach Day 5, unlock Arts Hill Backyard with Lili affection 60, then do "Secret Talk with Lili".',
        objective: { kind: 'activity', activityId: 78, waitDays: 0 },
        reward: { affection: 18, happiness: 12, fatigue: -6 },
        complete: 'At sunset, Lili admits she started saving stories for you. The relationship becomes something named.'
      }
    ]
  },
  2: {
    story_title: 'The Reluctant Mentor',
    story_summary: 'Professor Chen notices discipline, then gradually opens a research path if you prove you can follow through.',
    gift_name: 'annotated article printout',
    gift_cost: 10,
    favor_label: 'Office Lead',
    interaction_labels: {
      chat: 'Discuss',
      ask_advice: 'Office Advice',
      give_gift: 'Bring Article',
      find_job: 'Research Lead'
    },
    effects: {
      chat: { gain: 6, gpa: 0.03, happiness: 2, fatigue: 2, money: 0 },
      ask_advice: { gain: 7, gpa: 0.08, happiness: 1, fatigue: 4, money: 0 },
      give_gift: { gain: 5, gpa: 0.05, happiness: 1, fatigue: 1, money: -10 },
      find_job: { gain: 8, gpa: 0.07, happiness: 2, fatigue: 5, money: 15 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Professor Chen: Talent is useful. Attendance is better.\nYou: So I start by showing up?\nProfessor Chen: You start by showing up prepared.' },
        { minStage: 1, text: 'Professor Chen: Your question was almost precise. Almost is a place to improve from.\nYou: I will take that as encouragement.' },
        { minStage: 2, text: 'Professor Chen: The seminar room is not a trophy. It is a responsibility.\nYou: I understand. I want the work, not just the door.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Professor Chen: Write the question before you ask it. If the question survives paper, bring it to me.\nYou: That is stricter than expected.\nProfessor Chen: Useful things often are.' },
        { minStage: 1, text: 'Professor Chen: Protect your GPA, but do not worship it. A good transcript should point toward a better question.\nYou: Then I need a better question.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Professor Chen: An annotated article is not a gift. It is evidence that you read.\nYou: Is that good?\nProfessor Chen: It is a beginning.' },
        { minStage: 1, text: 'Professor Chen: Your margin notes are less decorative this time. Good.\nYou: I tried to argue with the author.\nProfessor Chen: Finally.' }
      ],
      find_job: [
        { minStage: 0, text: 'Professor Chen: The department needs someone to organize references. It pays little and teaches a lot.\nYou: I am listening.' },
        { minStage: 1, text: 'Professor Chen: If you want research access, earn trust in small tasks first.\nYou: Give me one.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Prepared Attendance',
        trigger: 'chat',
        intro: 'Professor Chen asks you to prove consistency in the main teaching area.',
        activeNote: 'Do "Attend Professional Course" at Teaching Area T1-T8.',
        objective: { kind: 'activity', activityId: 41, waitDays: 0 },
        reward: { affection: 8, gpa: 0.08 },
        complete: 'Your notes are complete enough that Professor Chen writes one short approval mark at the top.'
      },
      {
        stage: 1,
        title: 'Quiz Recovery',
        trigger: 'ask_advice',
        minDay: 3,
        intro: 'Professor Chen gives you a focused quiz slot and a warning not to cram while exhausted.',
        activeNote: 'On Day 3 or later, do "Take Quiz" at Teaching Area T1-T8.',
        objective: { kind: 'activity', activityId: 44, waitDays: 0 },
        reward: { affection: 9, gpa: 0.12, fatigue: 3 },
        complete: 'The quiz is hard, but the questions finally look like patterns instead of traps.'
      },
      {
        stage: 2,
        title: 'Research Door',
        trigger: 'find_job',
        minDay: 7,
        minGpa: 3.4,
        intro: 'Professor Chen offers a research discussion if your grades and stamina can carry it.',
        activeNote: 'Unlock Institute for Advanced Study, then do "Join Research Discussion".',
        objective: { kind: 'activity', activityId: 2, waitDays: 0 },
        reward: { affection: 14, gpa: 0.10, happiness: 4 },
        complete: 'You survive the research discussion and leave with a reading list that feels like a key.'
      }
    ]
  },
  3: {
    story_title: 'Recovery Pact',
    story_summary: 'Alex helps you turn exercise from stat repair into a friendship about showing up for your body.',
    gift_name: 'electrolyte drink pack',
    gift_cost: 20,
    favor_label: 'Training Tip',
    interaction_labels: {
      chat: 'Chat',
      ask_advice: 'Training Advice',
      give_gift: 'Gift Drink Pack',
      find_job: 'Training Tip'
    },
    effects: {
      chat: { gain: 8, gpa: 0, happiness: 6, fatigue: -2, money: 0 },
      ask_advice: { gain: 7, gpa: 0, happiness: 4, fatigue: -6, money: 0 },
      give_gift: { gain: 14, gpa: 0, happiness: 7, fatigue: -4, money: -20 },
      find_job: { gain: 8, gpa: 0, happiness: 3, fatigue: -7, money: 0 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Alex: You do not need to become a sports person. You just need one routine that forgives bad weeks.\nYou: That sounds possible.' },
        { minStage: 1, text: 'Alex: Good. You came back. That is the whole trick.\nYou: The trick feels like leg pain.\nAlex: Temporary leg pain.' },
        { minStage: 2, text: 'Alex: Now you know the difference between tired and neglected.\nYou: I hate how useful that sentence is.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Alex: Stretch first, compete later. The scoreboard does not care about your knees.\nYou: My knees appreciate the diplomacy.' },
        { minStage: 1, text: 'Alex: When fatigue is high, choose recovery exercise. When mood is low, choose team exercise.\nYou: So the gym is basically a menu.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Alex: Electrolytes? You are either thoughtful or planning to make me run.\nYou: Both can be true.' },
        { minStage: 1, text: 'Alex: You remembered the lemon flavor. Friendship officially upgraded.\nYou: That was the goal.' }
      ],
      find_job: [
        { minStage: 0, text: 'Alex: Today: low ego, steady pace. Tomorrow you can pretend you are heroic.\nYou: I can do low ego.' },
        { minStage: 1, text: 'Alex: Gym first, then badminton later. Build the engine before showing it off.\nYou: Copy that, coach.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Start Without Drama',
        trigger: 'chat',
        intro: 'Alex asks you to begin with something sustainable instead of heroic.',
        activeNote: 'Do "Morning Stretch" at Sports Park.',
        objective: { kind: 'activity', activityId: 10, waitDays: 0 },
        reward: { affection: 8, fatigue: -8, happiness: 3 },
        complete: 'The stretch is simple, but your body stops feeling like background noise.'
      },
      {
        stage: 1,
        title: 'Gym After Two Mornings',
        trigger: 'ask_advice',
        minAffection: 15,
        intro: 'Alex sets a two-day recovery pact before you try a real gym session.',
        activeNote: 'Wait two days, then do "Workout at Gym" at Sports Complex.',
        objective: { kind: 'activity', activityId: 53, waitDays: 2 },
        reward: { affection: 10, fatigue: -12, happiness: 5 },
        complete: 'The gym session lands cleanly. Alex calls it boring discipline, which is apparently praise.'
      },
      {
        stage: 2,
        title: 'Badminton Trust Match',
        trigger: 'chat',
        minAffection: 30,
        intro: 'Alex invites you into a doubles badminton match where the point is trust, not winning.',
        activeNote: 'Do "Play Badminton" at Sports Complex.',
        objective: { kind: 'activity', activityId: 54, waitDays: 0 },
        reward: { affection: 12, happiness: 8, fatigue: -5 },
        complete: 'You lose the match and somehow feel stronger. Alex says that means the pact worked.'
      }
    ]
  },
  4: {
    story_title: 'Career Compass',
    story_summary: 'Mia builds your money plan into a career route: emergency support, public confidence, then a real consultation.',
    gift_name: 'thank-you coffee',
    gift_cost: 18,
    favor_label: 'Job Tip',
    interaction_labels: {
      chat: 'Check In',
      ask_advice: 'Career Advice',
      give_gift: 'Gift Coffee',
      find_job: 'Job Tip'
    },
    effects: {
      chat: { gain: 7, gpa: 0.02, happiness: 3, fatigue: 1, money: 0 },
      ask_advice: { gain: 8, gpa: 0.04, happiness: 2, fatigue: 2, money: 0 },
      give_gift: { gain: 12, gpa: 0, happiness: 5, fatigue: 0, money: -18 },
      find_job: { gain: 10, gpa: 0.02, happiness: 2, fatigue: 4, money: 45 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Mia: You do not need a perfect career plan. You need the next responsible move.\nYou: Responsible sounds expensive.\nMia: That is why we start with funding.' },
        { minStage: 1, text: 'Mia: Money pressure narrows imagination. Stabilize the basics, then choose bigger risks.\nYou: I can feel my brain unclenching already.' },
        { minStage: 2, text: 'Mia: A career is not a personality test. It is a sequence of experiments with receipts.\nYou: Weirdly comforting.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Mia: Track cash, fatigue, and GPA together. Any plan that ignores one of them will punish you later.\nYou: That is painfully accurate.' },
        { minStage: 1, text: 'Mia: Practice your pitch where the stakes are low. Campus Plaza is perfect for that.\nYou: Public embarrassment as training. Got it.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Mia: Coffee accepted. Bribes rejected. Gratitude filed under morale.\nYou: Very official.' },
        { minStage: 1, text: 'Mia: You brought the exact roast from Canteen 1. I am impressed and mildly concerned by your research skills.\nYou: I prefer "career readiness".' }
      ],
      find_job: [
        { minStage: 0, text: 'Mia: There is a paid booth shift. Not glamorous, but it teaches reliability.\nYou: Reliability pays?\nMia: Eventually.' },
        { minStage: 1, text: 'Mia: Try a market stall. You will learn more from five awkward customers than from one motivational poster.\nYou: Brutal, useful, accepted.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Emergency Funding',
        trigger: 'chat',
        intro: 'Mia points you to scholarship paperwork before money pressure starts steering every choice.',
        activeNote: 'Do "Apply for Scholarship" at Administration Building.',
        objective: { kind: 'activity', activityId: 70, waitDays: 0 },
        reward: { affection: 8, money: 30, happiness: 4 },
        complete: 'The form is dull, but the stipend notice feels like breathing room.'
      },
      {
        stage: 1,
        title: 'Plaza Confidence',
        trigger: 'find_job',
        minDay: 2,
        intro: 'Mia sends you to Campus Plaza to earn money and practice talking to strangers.',
        activeNote: 'Do "Campus Market Stall" at Campus Plaza on Day 2 or later.',
        objective: { kind: 'activity', activityId: 86, waitDays: 0 },
        reward: { affection: 10, money: 35, happiness: 5 },
        complete: 'The stall is awkward for ten minutes, then useful for the rest of the day.'
      },
      {
        stage: 2,
        title: 'Consultation Slot',
        trigger: 'ask_advice',
        minDay: 6,
        minGpa: 3.2,
        intro: 'Mia opens a serious career consultation if your academic base is stable enough.',
        activeNote: 'Reach Day 6 with GPA 3.20, then do "Career Consultation".',
        objective: { kind: 'activity', activityId: 69, waitDays: 0 },
        reward: { affection: 12, gpa: 0.06, money: 50, happiness: 4 },
        complete: 'Mia turns your scattered ideas into a three-step plan and a list of real next actions.'
      }
    ]
  },
  5: {
    story_title: 'Quiet Exhibition',
    story_summary: 'Yuki invites you to make art slowly: sketch, photograph, then help turn a private idea into a public show.',
    gift_name: 'watercolor postcard set',
    gift_cost: 22,
    favor_label: 'Art Prompt',
    interaction_labels: {
      chat: 'Talk Art',
      ask_advice: 'Art Advice',
      give_gift: 'Gift Postcards',
      find_job: 'Art Prompt'
    },
    effects: {
      chat: { gain: 8, gpa: 0, happiness: 7, fatigue: 1, money: 0 },
      ask_advice: { gain: 7, gpa: 0.02, happiness: 6, fatigue: 2, money: 0 },
      give_gift: { gain: 16, gpa: 0, happiness: 9, fatigue: 0, money: -22 },
      find_job: { gain: 8, gpa: 0.01, happiness: 5, fatigue: 3, money: 10 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Yuki: People walk past Arts Hill like it is scenery. I think it is listening.\nYou: That is either poetic or alarming.\nYuki: Both are useful.' },
        { minStage: 1, text: 'Yuki: Your sketch had one honest line. Keep that line.\nYou: Only one?\nYuki: One is enough to begin.' },
        { minStage: 2, text: 'Yuki: A public show is just a private fear with better lighting.\nYou: That is not comforting, but it is memorable.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Yuki: Draw the shadow first. The object will stop pretending it is simple.\nYou: That may also describe my schedule.' },
        { minStage: 1, text: 'Yuki: Do not make the poster pretty. Make it honest enough that people stop walking.\nYou: Honest, then pretty if there is time.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Yuki: Watercolor postcards. These are dangerous. They make me want to start six projects.\nYou: I accept partial responsibility.' },
        { minStage: 1, text: 'Yuki: You chose paper with texture. Thank you for noticing the quiet part.\nYou: The quiet part seemed important.' }
      ],
      find_job: [
        { minStage: 0, text: 'Yuki: Prompt: draw the route you take when you are avoiding something.\nYou: That might be the whole map.\nYuki: Exactly.' },
        { minStage: 1, text: 'Yuki: The exhibition needs a poster that feels like an invitation, not an announcement.\nYou: I can try.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'One Honest Line',
        trigger: 'chat',
        minDay: 3,
        intro: 'Yuki asks you to sketch Arts Hill without trying to make it impressive.',
        activeNote: 'Do "Sketch on Arts Hill".',
        objective: { kind: 'activity', activityId: 13, waitDays: 0 },
        reward: { affection: 9, happiness: 6 },
        complete: 'Yuki circles one line in your sketch and says it is the part that tells the truth.'
      },
      {
        stage: 1,
        title: 'Poster That Stops People',
        trigger: 'find_job',
        minDay: 5,
        minAffection: 16,
        intro: 'Yuki wants a poster for the creative cluster, but only if it keeps the quiet feeling intact.',
        activeNote: 'Do "Design Poster" at Cultural Creativity Clusters.',
        objective: { kind: 'activity', activityId: 62, waitDays: 0 },
        reward: { affection: 11, happiness: 7, gpa: 0.03 },
        complete: 'The poster is simple, strange, and effective. Yuki looks proud before hiding it.'
      },
      {
        stage: 2,
        title: 'Stage Light Courage',
        trigger: 'chat',
        minDay: 5,
        minAffection: 30,
        intro: 'Yuki asks you to attend the performance night so the exhibition does not feel like shouting alone.',
        activeNote: 'Do "Watch Performance" at Performance Theatre.',
        objective: { kind: 'activity', activityId: 65, waitDays: 0 },
        reward: { affection: 12, happiness: 10 },
        complete: 'The performance gives Yuki the courage to sign her work with her full name.'
      }
    ]
  },
  6: {
    story_title: 'Huitong Field Notes',
    story_summary: 'Mr. Liang turns village errands into heritage work, practical income, and a quieter sense of belonging.',
    gift_name: 'jasmine tea tin',
    gift_cost: 16,
    favor_label: 'Field Tip',
    interaction_labels: {
      chat: 'Listen',
      ask_advice: 'Village Advice',
      give_gift: 'Gift Tea',
      find_job: 'Field Tip'
    },
    effects: {
      chat: { gain: 7, gpa: 0.01, happiness: 5, fatigue: 2, money: 0 },
      ask_advice: { gain: 7, gpa: 0.03, happiness: 4, fatigue: 2, money: 0 },
      give_gift: { gain: 13, gpa: 0, happiness: 6, fatigue: 0, money: -16 },
      find_job: { gain: 10, gpa: 0, happiness: 3, fatigue: 5, money: 40 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Mr. Liang: Students hurry through old places and call it exploration.\nYou: What should I call it?\nMr. Liang: Listening, if you do it properly.' },
        { minStage: 1, text: 'Mr. Liang: A useful student asks before moving things.\nYou: I can be useful.\nMr. Liang: We will see.' },
        { minStage: 2, text: 'Mr. Liang: Stories do not belong to the recorder. Remember that.\nYou: I will.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Mr. Liang: Bring water, charge your phone, and never point a camera before saying hello.\nYou: Fieldwork has manners.\nMr. Liang: Everything important does.' },
        { minStage: 1, text: 'Mr. Liang: Repair work teaches patience. If you force an old tool, it teaches you regret.\nYou: Patience first.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Mr. Liang: Jasmine tea. Good. This is not expensive, but it is respectful.\nYou: I hoped that mattered more.' },
        { minStage: 1, text: 'Mr. Liang: You remembered I dislike sweet drinks. That is field observation.\nYou: I am learning.' }
      ],
      find_job: [
        { minStage: 0, text: 'Mr. Liang: There is paid work if you do not mind dust and questions.\nYou: I can handle both.\nMr. Liang: Questions are heavier.' },
        { minStage: 1, text: 'Mr. Liang: The workshop opens soon. Old tools need careful hands.\nYou: I will be there.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Listening Walk',
        trigger: 'chat',
        minDay: 2,
        intro: 'Mr. Liang asks you to explore Huitong Village without treating it like a photo backdrop.',
        activeNote: 'Do "Explore Huitong Village".',
        objective: { kind: 'activity', activityId: 57, waitDays: 0 },
        reward: { affection: 8, money: 20, happiness: 4 },
        complete: 'You return with fewer photos and better notes. Mr. Liang approves.'
      },
      {
        stage: 1,
        title: 'Workshop Hands',
        trigger: 'find_job',
        minDay: 6,
        minAffection: 15,
        intro: 'Mr. Liang trusts you with the old workshop after you prove you can listen.',
        activeNote: 'On Day 6 or later, do "Repair Old Workshop Tools" at Old Village Workshop.',
        objective: { kind: 'activity', activityId: 89, waitDays: 0 },
        reward: { affection: 12, money: 45, fatigue: 4 },
        complete: 'The repaired tools look ordinary, which Mr. Liang says is the highest compliment.'
      },
      {
        stage: 2,
        title: 'Borrowed Stories',
        trigger: 'ask_advice',
        minDay: 6,
        minAffection: 28,
        intro: 'Mr. Liang lets you help archive village stories, with a strict reminder to handle them carefully.',
        activeNote: 'Do "Archive Village Stories" at Old Village Workshop.',
        objective: { kind: 'activity', activityId: 91, waitDays: 0 },
        reward: { affection: 14, gpa: 0.08, happiness: 6, money: 20 },
        complete: 'The archive entry carries more than facts. It carries permission.'
      }
    ]
  },
  7: {
    story_title: 'Lake Safety Trust',
    story_summary: 'Kai makes the lake feel earned: safety first, a delayed paddle, then environmental fieldwork.',
    gift_name: 'waterproof whistle',
    gift_cost: 24,
    favor_label: 'Dock Tip',
    interaction_labels: {
      chat: 'Dock Chat',
      ask_advice: 'Safety Advice',
      give_gift: 'Gift Whistle',
      find_job: 'Dock Tip'
    },
    effects: {
      chat: { gain: 7, gpa: 0, happiness: 5, fatigue: 1, money: 0 },
      ask_advice: { gain: 8, gpa: 0.03, happiness: 3, fatigue: 2, money: 0 },
      give_gift: { gain: 15, gpa: 0, happiness: 7, fatigue: 0, money: -24 },
      find_job: { gain: 9, gpa: 0.02, happiness: 3, fatigue: 4, money: 25 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Kai: The lake is calm because people respect it, not because it is harmless.\nYou: That sounds like a warning.\nKai: It is an invitation with rules.' },
        { minStage: 1, text: 'Kai: You listened during briefing. That puts you ahead of half the confident people.\nYou: Confidence is apparently loud.\nKai: Safety is quieter.' },
        { minStage: 2, text: 'Kai: Now you can help the lake instead of just borrowing it.\nYou: I like that.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Kai: If the weather changes, the plan changes. Pride is not a flotation device.\nYou: Strong image. Hard to forget.' },
        { minStage: 1, text: 'Kai: Paddle with rhythm, not force. Campus already gives you enough things to fight.\nYou: Rhythm it is.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Kai: A waterproof whistle. Practical. I respect practical.\nYou: I guessed glitter would not help.\nKai: Correct guess.' },
        { minStage: 1, text: 'Kai: You brought safety gear as a gift. That is the lake version of a compliment.\nYou: I will take it.' }
      ],
      find_job: [
        { minStage: 0, text: 'Kai: Dock cleanup pays a little and prevents bigger problems.\nYou: Useful and paid is a good combination.' },
        { minStage: 1, text: 'Kai: Sampling work needs steady hands. No heroic splashing.\nYou: My heroism will remain dry.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Briefing Before Water',
        trigger: 'chat',
        minDay: 4,
        intro: 'Kai refuses to let you near a kayak until you complete the dock safety briefing.',
        activeNote: 'Do "Lake Safety Briefing" at Artificial Lake Dock.',
        objective: { kind: 'activity', activityId: 82, waitDays: 0 },
        reward: { affection: 8, gpa: 0.03, happiness: 3 },
        complete: 'You learn the safety route, emergency calls, and why Kai trusts checklists more than courage.'
      },
      {
        stage: 1,
        title: 'One-Day Weather Window',
        trigger: 'ask_advice',
        minAffection: 14,
        intro: 'Kai checks the weather and tells you to come back after one day for the first paddle.',
        activeNote: 'Wait one day, then do "Kayak Across the Lake".',
        objective: { kind: 'activity', activityId: 81, waitDays: 1 },
        reward: { affection: 11, happiness: 8, fatigue: -2 },
        complete: 'The kayak loop is short, bright, and just difficult enough to feel earned.'
      },
      {
        stage: 2,
        title: 'Water Sampling Crew',
        trigger: 'find_job',
        minAffection: 28,
        intro: 'Kai asks you to join a lake sampling mission that counts as both fieldwork and care.',
        activeNote: 'Do "Water Sampling Mission" at Artificial Lake Dock.',
        objective: { kind: 'activity', activityId: 83, waitDays: 0 },
        reward: { affection: 12, gpa: 0.08, money: 25, happiness: 4 },
        complete: 'The samples are labeled correctly. Kai says the lake will remember. You suspect he means you will.'
      }
    ]
  },
  8: {
    story_title: 'Club Constellation',
    story_summary: 'Nora turns club chaos into leadership: choose a society, run a booth, then speak for something.',
    gift_name: 'color-coded sticky tabs',
    gift_cost: 12,
    favor_label: 'Club Lead',
    interaction_labels: {
      chat: 'Club Chat',
      ask_advice: 'Leadership Advice',
      give_gift: 'Gift Tabs',
      find_job: 'Club Lead'
    },
    effects: {
      chat: { gain: 8, gpa: 0, happiness: 6, fatigue: 2, money: 0 },
      ask_advice: { gain: 7, gpa: 0.03, happiness: 4, fatigue: 2, money: 0 },
      give_gift: { gain: 14, gpa: 0, happiness: 6, fatigue: 0, money: -12 },
      find_job: { gain: 9, gpa: 0.01, happiness: 3, fatigue: 4, money: 30 }
    },
    dialogue: {
      chat: [
        { minStage: 0, text: 'Nora: Everyone says they want community until someone has to make the sign-up sheet.\nYou: Is that where I come in?\nNora: With a pen, yes.' },
        { minStage: 1, text: 'Nora: Booth duty is ninety percent smiling and ten percent knowing where the tape went.\nYou: I can guard tape.' },
        { minStage: 2, text: 'Nora: Leadership is mostly noticing who has gone quiet.\nYou: That is gentler than I expected.\nNora: It is not always gentle.' }
      ],
      ask_advice: [
        { minStage: 0, text: 'Nora: Join one society with your heart and one with your calendar. Never reverse those.\nYou: That is alarmingly usable.' },
        { minStage: 1, text: 'Nora: Public speaking is just organized sincerity. The organization part is what saves you.\nYou: I will organize the sincerity.' }
      ],
      give_gift: [
        { minStage: 0, text: 'Nora: Color-coded tabs. You understand love languages for organizers.\nYou: I suspected stationery was power.' },
        { minStage: 1, text: 'Nora: These tabs are going into the club binder immediately. This is not a gift; it is infrastructure.\nYou: Happy to support civilization.' }
      ],
      find_job: [
        { minStage: 0, text: 'Nora: Paid booth shift at the plaza. You will learn names faster than you expect.\nYou: And earn money?\nNora: Miracles happen.' },
        { minStage: 1, text: 'Nora: The speaking corner needs someone who sounds human, not perfect.\nYou: I can do human.' }
      ]
    },
    questline: [
      {
        stage: 0,
        title: 'Choose a Society',
        trigger: 'chat',
        minDay: 2,
        intro: 'Nora challenges you to stop browsing clubs and actually choose a society to follow.',
        activeNote: 'Do "Join Society Fair" at Campus Plaza.',
        objective: { kind: 'activity', activityId: 87, waitDays: 0 },
        reward: { affection: 8, happiness: 5, gpa: 0.02 },
        complete: 'You choose a society and Nora immediately puts your name on a schedule. Somehow this feels fair.'
      },
      {
        stage: 1,
        title: 'Booth Shift',
        trigger: 'find_job',
        minAffection: 14,
        intro: 'Nora gives you a booth shift with actual responsibility and a tiny budget.',
        activeNote: 'Do "Club Booth Duty" at Campus Plaza.',
        objective: { kind: 'activity', activityId: 85, waitDays: 0 },
        reward: { affection: 10, money: 20, happiness: 6 },
        complete: 'The booth survives the crowd. Nora promotes you from "helpful" to "dangerously reliable".'
      },
      {
        stage: 2,
        title: 'Speaking Corner',
        trigger: 'ask_advice',
        minDay: 3,
        minAffection: 25,
        intro: 'Nora asks you to speak for the club in public, not perfectly, just honestly.',
        activeNote: 'Do "Public Speaking Corner" at Campus Plaza.',
        objective: { kind: 'activity', activityId: 88, waitDays: 0 },
        reward: { affection: 12, gpa: 0.05, happiness: 7 },
        complete: 'Your voice shakes once, then steadies. Nora writes your name under future leaders.'
      }
    ]
  }
};

const activitySeed = [
  [1, 1, 'Attend Advanced Seminar', 'study', 'Join a demanding advanced seminar.', 120, 0.20, 2, 12, 0, 7, 3.5],
  [2, 1, 'Join Research Discussion', 'study', 'Discuss research ideas with senior students.', 120, 0.15, 4, 10, 0, 8, 3.4],
  [3, 1, 'Read Academic Paper', 'study', 'Work through a dense academic paper.', 90, 0.12, -3, 9, 0, 7, 0],
  [4, 1, 'Meet Research Mentor', 'career', 'Ask a mentor about research direction.', 120, 0.10, 5, 8, 0, 10, 3.5],
  [5, 2, 'Sleep Early', 'rest', 'Recover properly in the dorm.', 120, 0, 3, -30, 0, 1, 0],
  [6, 2, 'Review Notes in Dorm', 'study', 'Review lecture notes before bed.', 90, 0.08, -2, 6, 0, 1, 0],
  [7, 2, 'Clean Dorm Room', 'rest', 'Reset your room and your headspace.', 60, 0, 5, 3, 0, 1, 0],
  [8, 2, 'Chat with Roommate', 'social', 'Talk with your roommate about campus life.', 60, 0, 8, 2, 0, 1, 0],
  [9, 3, 'Outdoor Running', 'exercise', 'Run on the sports track.', 60, 0, 7, -10, 0, 1, 0],
  [10, 3, 'Morning Stretch', 'exercise', 'Stretch and breathe before the day gets busy.', 45, 0, 5, -8, 0, 1, 0],
  [11, 3, 'Join Football Match', 'exercise', 'Join a high-energy campus match.', 90, 0, 12, 8, 0, 1, 0],
  [12, 3, 'Watch Campus Game', 'social', 'Watch a student game with classmates.', 60, 0, 8, 3, 0, 1, 0],
  [13, 4, 'Sketch on Arts Hill', 'culture', 'Sketch the Arts Hill scenery.', 90, 0, 12, 4, -10, 3, 0],
  [14, 4, 'Join Art Club Talk', 'culture', 'Listen to art club members discuss creative practice.', 90, 0.03, 10, 5, 0, 3, 0],
  [15, 4, 'Take Landscape Photos', 'explore', 'Take photos around the hill.', 60, 0, 9, 3, 0, 3, 0],
  [16, 4, 'Listen to Outdoor Music', 'rest', 'Rest while listening to outdoor music.', 60, 0, 10, -5, 0, 3, 0],
  [17, 5, 'Rest at Village Lounge', 'rest', 'Recover in the residential lounge.', 90, 0, 5, -18, 0, 1, 0],
  [18, 5, 'Visit Friend in V Area', 'social', 'Visit a friend in the V area.', 60, 0, 9, 2, 0, 1, 0],
  [19, 5, 'Evening Self-study', 'study', 'Study quietly in the evening.', 90, 0.08, -2, 7, 0, 1, 0],
  [20, 5, 'Organize Personal Plan', 'system', 'Plan upcoming deadlines and spending.', 45, 0.03, 3, -3, 0, 1, 0],
  [21, 6, 'Walk by the Lake', 'explore', 'Enjoy scenery around the lake.', 60, 0, 8, 2, 0, 2, 0],
  [22, 6, 'Reflect on Study Plan', 'rest', 'Think through your study plan by the water.', 60, 0.03, 6, -5, 0, 2, 0],
  [23, 6, 'Talk with Lili by Lake', 'social', 'Spend quiet time with Lili by the lake.', 60, 0, 10, 2, 0, 2, 0],
  [24, 6, 'Take Campus Photos', 'explore', 'Take photos along the lake path.', 60, 0, 7, 3, 0, 2, 0],
  [25, 7, 'Rest in Residential Area', 'rest', 'Rest in the Hui Xian residential area.', 90, 0, 4, -20, 0, 1, 0],
  [26, 7, 'Group Study in Village', 'study', 'Study with classmates in the residential area.', 90, 0.10, 2, 8, 0, 1, 0],
  [27, 7, 'Late-night Snack Chat', 'social', 'Share snacks and gossip late at night.', 60, 0, 10, 5, -15, 1, 0],
  [28, 7, 'Laundry and Reset', 'rest', 'Do laundry and reset your week.', 60, 0, 5, -10, -5, 1, 0],
  [29, 8, 'Study in Library', 'study', 'Study independently in the Learning Resource Centre.', 120, 0.15, -5, 10, 0, 1, 0],
  [30, 8, 'Borrow Reference Books', 'study', 'Borrow useful reference books.', 60, 0.08, 0, 4, 0, 1, 0],
  [31, 8, 'Finish Assignment', 'study', 'Push through a difficult assignment.', 120, 0.18, -6, 12, 0, 1, 0],
  [32, 8, 'Quiet Reading', 'rest', 'Read quietly and recover a little.', 60, 0.05, 4, -2, 0, 1, 0],
  [33, 9, 'Campus Walk', 'explore', 'Take a calm walk across the central lawn.', 60, 0, 5, 3, 0, 1, 0],
  [34, 9, 'Picnic with Friends', 'social', 'Have a picnic with friends.', 90, 0, 12, 4, -20, 1, 0],
  [35, 9, 'Club Recruitment Visit', 'social', 'Visit club booths and find new interests.', 60, 0.02, 8, 5, 0, 1, 0],
  [36, 9, 'Talk with Lili', 'social', 'Talk with Lili on the central lawn.', 60, 0, 8, 2, 0, 1, 0],
  [37, 10, 'Eat at Canteen 1', 'food', 'Have lunch at Canteen 1.', 60, 0, 8, -5, -20, 1, 0],
  [38, 10, 'Buy Coffee', 'food', 'Buy coffee before class.', 30, 0, 5, -3, -12, 1, 0],
  [39, 10, 'Quick Lunch Before Class', 'food', 'Eat a quick lunch before class.', 45, 0, 6, -4, -18, 1, 0],
  [40, 10, 'Chat During Lunch', 'social', 'Chat with friends during lunch.', 60, 0, 7, 1, -15, 1, 0],
  [41, 11, 'Attend Professional Course', 'study', 'Attend lectures in the main teaching area.', 120, 0.10, -3, 8, 0, 1, 0],
  [42, 11, 'Ask Professor Questions', 'study', 'Ask the professor focused questions.', 60, 0.12, 2, 6, 0, 1, 0],
  [43, 11, 'Group Presentation Practice', 'study', 'Practice a group presentation.', 90, 0.10, 4, 9, 0, 1, 0],
  [44, 11, 'Take Quiz', 'study', 'Take a short quiz.', 60, 0.15, -5, 10, 0, 1, 0],
  [45, 12, 'Attend Tutorial Class', 'study', 'Attend a tutorial class.', 90, 0.10, -2, 7, 0, 1, 0],
  [46, 12, 'Practice Coding Lab', 'study', 'Practice programming in the lab.', 120, 0.14, -4, 10, 0, 1, 0],
  [47, 12, 'Team Project Meeting', 'study', 'Meet teammates for project planning.', 90, 0.08, 5, 8, 0, 1, 0],
  [48, 12, 'Meet Teaching Assistant', 'study', 'Ask a TA for help.', 60, 0.12, 2, 6, 0, 1, 0],
  [49, 13, 'Eat at Canteen 2', 'food', 'Have dinner at Canteen 2.', 60, 0, 10, -6, -18, 1, 0],
  [50, 13, 'Dinner with Friends', 'social', 'Have dinner with friends.', 90, 0, 13, 2, -25, 1, 0],
  [51, 13, 'Buy Dessert', 'food', 'Buy a small dessert.', 30, 0, 7, 0, -10, 1, 0],
  [52, 13, 'Budget Meal', 'food', 'Eat a low-cost meal.', 45, 0, 4, -3, -8, 1, 0],
  [53, 14, 'Workout at Gym', 'exercise', 'Exercise indoors to reduce fatigue.', 90, 0, 5, -12, 0, 1, 0],
  [54, 14, 'Play Badminton', 'exercise', 'Play badminton with classmates.', 90, 0, 10, 5, 0, 1, 0],
  [55, 14, 'Join Fitness Class', 'exercise', 'Join a structured fitness class.', 90, 0, 8, -6, -10, 1, 0],
  [56, 14, 'Talk with Alex', 'social', 'Talk with Alex about routines.', 60, 0, 8, 2, 0, 1, 0],
  [57, 15, 'Explore Huitong Village', 'explore', 'Explore the historic village area.', 90, 0, 12, 5, 20, 2, 0],
  [58, 15, 'Learn Campus History', 'culture', 'Learn stories behind the old village.', 90, 0.05, 8, 4, 0, 2, 0],
  [59, 15, 'Take Heritage Photos', 'explore', 'Take heritage photos and sell a few prints.', 90, 0, 9, 3, 25, 2, 0],
  [60, 15, 'Rest in Old Village', 'rest', 'Rest in the quiet old village.', 60, 0, 6, -8, 0, 2, 0],
  [61, 16, 'Creative Workshop', 'culture', 'Join a creative workshop.', 120, 0, 15, 8, -30, 5, 0],
  [62, 16, 'Design Poster', 'culture', 'Design a poster for an event.', 90, 0.04, 10, 7, 0, 5, 0],
  [63, 16, 'Join Maker Activity', 'culture', 'Join a hands-on maker activity.', 120, 0.05, 12, 10, -20, 5, 0],
  [64, 16, 'Sell Handmade Item', 'work', 'Sell a handmade item at a small booth.', 90, 0, 5, 8, 40, 5, 0],
  [65, 17, 'Watch Performance', 'culture', 'Watch a campus performance.', 120, 0, 20, 5, -50, 3, 0],
  [66, 17, 'Rehearse on Stage', 'culture', 'Rehearse a stage piece.', 120, 0.03, 12, 10, 0, 3, 0],
  [67, 17, 'Volunteer for Event', 'work', 'Volunteer during an event.', 90, 0, 8, 8, 20, 3, 0],
  [68, 17, 'Attend Campus Talk', 'culture', 'Attend a campus talk.', 90, 0.06, 6, 6, 0, 3, 0],
  [69, 18, 'Career Consultation', 'career', 'Ask for career and internship guidance.', 120, 0.05, -3, 8, 0, 6, 3.3],
  [70, 18, 'Apply for Scholarship', 'career', 'Apply for scholarship support.', 90, 0.03, 4, 6, 80, 1, 0],
  [71, 18, 'Handle Student Affairs', 'system', 'Handle routine student affairs.', 60, 0, 2, 5, 0, 1, 0],
  [72, 18, 'Meet Career Mentor Mia', 'career', 'Meet Mia for practical career advice.', 90, 0.06, 5, 6, 0, 1, 0],
  [73, 19, 'Attend Opening Ceremony', 'culture', 'Attend a university ceremony.', 90, 0, 10, 5, 0, 1, 0],
  [74, 19, 'Join Public Lecture', 'study', 'Join a public lecture.', 90, 0.08, 3, 7, 0, 1, 0],
  [75, 19, 'Attend Award Ceremony', 'culture', 'Attend an award ceremony.', 90, 0, 12, 4, 0, 1, 0],
  [76, 19, 'Volunteer as Guide', 'work', 'Volunteer as a guide at University Hall.', 90, 0, 6, 8, 25, 1, 0],
  [77, 20, 'Meditation on the Hilltop', 'rest', 'Rest quietly at the hidden hilltop viewpoint.', 60, 0, 15, -10, 0, 5, 0],
  [78, 20, 'Secret Talk with Lili', 'social', 'Have a secret talk with Lili.', 60, 0, 18, 2, 0, 5, 0],
  [79, 20, 'Watch Sunset Alone', 'rest', 'Watch sunset alone and recover.', 60, 0, 12, -8, 0, 5, 0],
  [80, 20, 'Write Reflection Journal', 'rest', 'Write a reflection journal.', 60, 0.04, 10, -5, 0, 5, 0],
  [81, 21, 'Kayak Across the Lake', 'exercise', 'Paddle a short loop from the hidden dock.', 90, 0, 14, 6, -15, 4, 0],
  [82, 21, 'Lake Safety Briefing', 'system', 'Join a dock safety briefing before lake activities.', 45, 0.03, 4, 2, 0, 4, 0],
  [83, 21, 'Water Sampling Mission', 'study', 'Collect lake samples for an environmental class.', 90, 0.10, 3, 8, 20, 4, 0],
  [84, 21, 'Hidden Dock Cleanup', 'work', 'Help clean the dock and receive a small campus stipend.', 75, 0, 7, 7, 35, 4, 0],
  [85, 22, 'Club Booth Duty', 'social', 'Help run a student club booth on the plaza.', 90, 0.02, 12, 6, 15, 2, 0],
  [86, 22, 'Campus Market Stall', 'work', 'Run a small pop-up stall during plaza hour.', 90, 0, 8, 8, 45, 2, 0],
  [87, 22, 'Join Society Fair', 'social', 'Explore student societies and choose one to follow.', 60, 0.03, 10, 4, 0, 2, 0],
  [88, 22, 'Public Speaking Corner', 'career', 'Practice a short public pitch in the plaza.', 60, 0.05, 5, 6, 0, 3, 0],
  [89, 23, 'Repair Old Workshop Tools', 'work', 'Help Mr. Liang repair tools in the old village workshop.', 90, 0, 6, 9, 55, 6, 0],
  [90, 23, 'Village Craft Lesson', 'culture', 'Learn a traditional craft from village residents.', 90, 0.04, 14, 6, -10, 6, 0],
  [91, 23, 'Archive Village Stories', 'study', 'Record oral history notes for a campus archive.', 90, 0.12, 5, 8, 20, 6, 0],
  [92, 23, 'Secret Workshop Reflection', 'rest', 'Rest in the quiet workshop after field work.', 60, 0.03, 10, -8, 0, 6, 0]
];

const activities = activitySeed.map(([activity_id, location_id, activity_name, activity_type, description, base_duration_minutes, gpa_effect, happiness_effect, fatigue_effect, money_effect, min_day, min_gpa]) => ({
  activity_id,
  location_id,
  location_name: locationById(location_id).location_name,
  activity_name,
  activity_type,
  base_duration_minutes,
  task_type: money_effect > 0 || activity_type === 'work' ? 'earn' : 'optional',
  description,
  gpa_effect,
  happiness_effect,
  fatigue_effect,
  money_effect,
  min_day,
  min_gpa,
  is_available: true
}));

// One entry per day-mod/time slot at most. Locked locations are skipped until unlocked.
const requiredEventRules = [
  [1, '08:00:00', 41, 'Core Course Morning'],
  [1, '10:00:00', 35, 'Club Recruitment Check'],
  [1, '16:00:00', 49, 'Dinner Energy Check'],
  [1, '22:00:00', 5, 'Dorm Sleep Routine'],
  [2, '08:00:00', 45, 'Tutorial Attendance'],
  [2, '10:00:00', 85, 'Plaza Club Booth Duty'],
  [2, '16:00:00', 57, 'Huitong Field Visit'],
  [2, '22:00:00', 25, 'Residential Recovery'],
  [3, '08:00:00', 44, 'Quiz Session'],
  [3, '10:00:00', 13, 'Arts Hill Sketch Task'],
  [3, '16:00:00', 65, 'Campus Performance Night'],
  [3, '22:00:00', 22, 'Study Plan Reflection'],
  [4, '08:00:00', 83, 'Lake Sampling Mission'],
  [4, '10:00:00', 47, 'Team Project Meeting'],
  [4, '16:00:00', 53, 'Gym Recovery Plan'],
  [4, '22:00:00', 20, 'Personal Planning Check'],
  [5, '08:00:00', 61, 'Creative Workshop Session'],
  [5, '10:00:00', 78, 'Hidden Lili Meeting'],
  [5, '16:00:00', 67, 'Event Volunteer Call'],
  [5, '22:00:00', 80, 'Reflection Journal Night'],
  [6, '08:00:00', 69, 'Career Consultation Slot'],
  [6, '10:00:00', 1, 'Advanced Seminar Slot'],
  [6, '16:00:00', 89, 'Old Workshop Repair'],
  [6, '22:00:00', 28, 'Laundry Reset Reminder'],
  [0, '08:00:00', 74, 'Public Lecture Window'],
  [0, '10:00:00', 9, 'Sports Park Training'],
  [0, '16:00:00', 76, 'University Hall Guide Shift'],
  [0, '22:00:00', 17, 'Village Lounge Recovery']
].map(([day_mod, time_slot, activity_id, event_title]) => ({ day_mod, time_slot, activity_id, event_title, is_required: true }));

const flavorEventRules = [
  [1, '10:00:00', 'Sunny Lawn Hour', 'Social activities give you a little more breathing room today.'],
  [2, '22:00:00', 'Quiet Campus Night', 'Rest activities are especially valuable tonight.'],
  [3, '10:00:00', 'Library Seat Rush', 'Study now before the good seats disappear.'],
  [4, '16:00:00', 'Canteen Peak Time', 'Food choices matter when money is tight.'],
  [5, '22:00:00', 'Late Deadline Mood', 'Fatigue penalties are easier to trigger tonight.'],
  [0, '10:00:00', 'Open Campus Window', 'No required task in this slot. Explore, earn, or recover.']
].map(([day_mod, time_slot, event_title, description]) => ({ day_mod, time_slot, event_title, description, is_required: false }));

let nextPlayerId = 1;
let nextSaveId = 1;
let nextActionId = 1;
let nextLogId = 1;
let nextEndingId = 1;
const saves = new Map();
const accounts = new Map();

function accountKey(username) {
  return String(username || '').trim().toLowerCase();
}

function saveData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    nextPlayerId,
    nextSaveId,
    nextActionId,
    nextLogId,
    nextEndingId,
    accounts: [...accounts.values()],
    saves: [...saves.values()]
  }, null, 2));
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    nextPlayerId = data.nextPlayerId || nextPlayerId;
    nextSaveId = data.nextSaveId || nextSaveId;
    nextActionId = data.nextActionId || nextActionId;
    nextLogId = data.nextLogId || nextLogId;
    nextEndingId = data.nextEndingId || nextEndingId;
    (data.accounts || []).forEach(account => accounts.set(accountKey(account.username), account));
    (data.saves || []).forEach(save => saves.set(Number(save.save_id), save));
  } catch (error) {
    console.warn('Could not load memory save data:', error.message);
  }
}

loadData();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function nextTime(time) {
  if (time === '08:00:00') return '10:00:00';
  if (time === '10:00:00') return '16:00:00';
  if (time === '16:00:00') return '22:00:00';
  return '23:59:00';
}

function currentLocation(save) {
  return locationById(save.current_location_id);
}

function relationshipType(affection, npcId = 0) {
  if (Number(npcId) === 1 && affection >= 85) return 'romance';
  if (Number(npcId) === 1 && affection >= 60) return 'crush';
  if (affection >= 80) return 'close_friend';
  if (affection >= 50) return 'friend';
  if (affection >= 20) return 'acquaintance';
  return 'stranger';
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function eventKey(day, timeSlot, activityId) {
  return `${day}|${timeSlot}|${activityId}`;
}

function npcById(id) {
  return npcs.find(npc => npc.npc_id === Number(id));
}

function storyForNpc(npcId) {
  return npcStories[Number(npcId)] || null;
}

function questForRelationship(relationship) {
  const story = storyForNpc(relationship.npc_id);
  if (!story) return null;
  const activeStage = relationship.active_quest?.stage;
  const stage = activeStage !== undefined && activeStage !== null ? activeStage : relationship.quest_stage;
  return story.questline.find(quest => quest.stage === stage) || null;
}

function nextQuestForRelationship(relationship) {
  const story = storyForNpc(relationship.npc_id);
  if (!story) return null;
  return story.questline.find(quest => quest.stage === relationship.quest_stage) || null;
}

function objectiveActivity(objective) {
  if (!objective || objective.kind !== 'activity') return null;
  return activities.find(activity => activity.activity_id === Number(objective.activityId)) || null;
}

function objectiveLocationId(objective, npcId) {
  if (!objective) return null;
  if (objective.kind === 'activity') return objectiveActivity(objective)?.location_id || null;
  if (objective.kind === 'npc_interaction') return npcById(npcId)?.location_id || null;
  return null;
}

function objectiveText(objective, npcId) {
  if (!objective) return 'Continue the story lead.';
  if (objective.kind === 'activity') {
    const activity = objectiveActivity(objective);
    return activity
      ? `Do "${activity.activity_name}" at ${activity.location_name}.`
      : 'Do the target activity.';
  }
  if (objective.kind === 'npc_interaction') {
    const npc = npcById(npcId);
    const label = objective.interactionType ? objective.interactionType.replace(/_/g, ' ') : 'talk';
    return npc ? `${label} with ${npc.npc_name} at ${npc.location_name}.` : `Do ${label} with the NPC.`;
  }
  return 'Continue the story lead.';
}

function questAvailability(save, relationship, quest) {
  if (!quest) return { ok: false, reason: 'No more story quests.' };
  if (quest.minDay && save.current_day < quest.minDay) return { ok: false, reason: `available on Day ${quest.minDay}` };
  if (quest.minAffection && relationship.affection < quest.minAffection) {
    return { ok: false, reason: `needs affection ${quest.minAffection}` };
  }
  if (quest.minGpa && save.gpa < quest.minGpa) return { ok: false, reason: `needs GPA ${quest.minGpa.toFixed(2)}` };
  return { ok: true, reason: '' };
}

function interactionEffectsFor(npc, interactionType) {
  const story = storyForNpc(npc.npc_id);
  const base = defaultInteractionEffects[interactionType] || { gain: 4, gpa: 0, happiness: 2, fatigue: 1, money: 0 };
  return { ...base, ...(story?.effects?.[interactionType] || {}) };
}

function pickDialogue(npc, relationship, interactionType) {
  const story = storyForNpc(npc.npc_id);
  const lines = story?.dialogue?.[interactionType] || [];
  const eligible = lines.filter(line => {
    const minStage = line.minStage ?? 0;
    const minAffection = line.minAffection ?? 0;
    return relationship.quest_stage >= minStage && relationship.affection >= minAffection;
  });
  const line = eligible[eligible.length - 1];
  if (line) return line.text;
  return `${npc.npc_name}: Good to see you. Let us keep going.`;
}

function startNpcQuestIfReady(save, npc, relationship, interactionType) {
  if (relationship.active_quest?.status === 'active') return '';
  const quest = nextQuestForRelationship(relationship);
  if (!quest) {
    relationship.quest_note = 'Story complete. Keep building the relationship for the ending.';
    return '';
  }
  if ((quest.trigger || 'chat') !== interactionType) {
    const availability = questAvailability(save, relationship, quest);
    relationship.quest_note = availability.ok
      ? `Next: use ${quest.trigger || 'chat'} with ${npc.npc_name} to start "${quest.title}".`
      : `Next: "${quest.title}" is ${availability.reason}.`;
    return '';
  }
  const availability = questAvailability(save, relationship, quest);
  if (!availability.ok) {
    relationship.quest_note = `Next: "${quest.title}" is ${availability.reason}.`;
    return `Story lead locked: "${quest.title}" is ${availability.reason}.`;
  }
  const readyDay = Math.max(
    save.current_day + Number(quest.objective?.waitDays || 0),
    Number(quest.objective?.minDay || 1)
  );
  relationship.active_quest = {
    status: 'active',
    stage: quest.stage,
    title: quest.title,
    started_day: save.current_day,
    ready_day: readyDay
  };
  relationship.quest_note = `Active: ${quest.title}. ${quest.activeNote || objectiveText(quest.objective, npc.npc_id)}${readyDay > save.current_day ? ` Ready on Day ${readyDay}.` : ''}`;
  return `Quest started: ${quest.title}. ${quest.intro} ${relationship.quest_note}`;
}

function applyQuestReward(save, relationship, quest) {
  const reward = quest.reward || {};
  if (reward.affection) relationship.affection = clamp(relationship.affection + reward.affection, 0, 100);
  if (reward.gpa) save.gpa = Number(clamp(save.gpa + reward.gpa, 0, 4).toFixed(2));
  if (reward.happiness) save.happiness = clamp(save.happiness + reward.happiness, 0, 100);
  if (reward.fatigue) save.fatigue = clamp(save.fatigue + reward.fatigue, 0, 100);
  if (reward.money) save.money = Math.max(0, save.money + reward.money);
  for (const locationId of reward.unlockLocationIds || []) {
    if (!save.unlockedIds.includes(locationId)) save.unlockedIds.push(locationId);
  }
  relationship.relationship_type = relationshipType(relationship.affection, relationship.npc_id);
}

function objectiveMatches(relationship, quest, context) {
  const objective = quest.objective || {};
  if (objective.kind === 'activity') {
    return context.kind === 'activity' && context.activity?.activity_id === Number(objective.activityId);
  }
  if (objective.kind === 'npc_interaction') {
    return context.kind === 'npc'
      && context.npc?.npc_id === Number(relationship.npc_id)
      && (!objective.interactionType || context.interactionType === objective.interactionType);
  }
  return false;
}

function progressNpcQuests(save, context) {
  const messages = [];
  ensureSaveShape(save);
  for (const relationship of save.relationships) {
    if (relationship.active_quest?.status !== 'active') continue;
    const quest = questForRelationship(relationship);
    if (!quest || !objectiveMatches(relationship, quest, context)) continue;
    if (save.current_day < Number(relationship.active_quest.ready_day || 1)) {
      relationship.quest_note = `Waiting: ${quest.title}. Ready on Day ${relationship.active_quest.ready_day}.`;
      messages.push(`${relationship.npc_name} story waits until Day ${relationship.active_quest.ready_day}: ${quest.title}.`);
      continue;
    }
    applyQuestReward(save, relationship, quest);
    relationship.quest_stage = Math.max(relationship.quest_stage, quest.stage + 1);
    relationship.active_quest = null;
    const nextQuest = nextQuestForRelationship(relationship);
    relationship.quest_note = nextQuest
      ? `Completed: ${quest.title}. Next, talk to ${relationship.npc_name} about "${nextQuest.title}".`
      : `Completed: ${quest.title}. ${relationship.npc_name}'s story route is complete.`;
    relationship.memory_note = quest.complete;
    messages.push(`Quest completed for ${relationship.npc_name}: ${quest.title}. ${quest.complete}`);
  }
  return messages;
}

function storyTargetsForLocation(save, locationId) {
  ensureSaveShape(save);
  return save.relationships
    .filter(relationship => relationship.active_quest?.status === 'active')
    .map(relationship => {
      const quest = questForRelationship(relationship);
      if (!quest) return null;
      const targetLocationId = objectiveLocationId(quest.objective, relationship.npc_id);
      if (targetLocationId !== Number(locationId)) return null;
      const readyDay = Number(relationship.active_quest.ready_day || save.current_day);
      const wait = save.current_day < readyDay ? ` (ready Day ${readyDay})` : '';
      return `${relationship.npc_name}: ${quest.title}${wait}`;
    })
    .filter(Boolean);
}

function relationshipQuestSummary(save, relationship) {
  const story = storyForNpc(relationship.npc_id);
  const npc = npcById(relationship.npc_id);
  if (!story || !npc) return '';
  if (relationship.active_quest?.status === 'active') {
    const quest = questForRelationship(relationship);
    if (!quest) return relationship.quest_note || '';
    const readyDay = Number(relationship.active_quest.ready_day || save.current_day);
    const wait = save.current_day < readyDay ? ` Ready on Day ${readyDay}.` : '';
    return `${quest.title}: ${quest.activeNote || objectiveText(quest.objective, relationship.npc_id)}${wait}`;
  }
  const quest = nextQuestForRelationship(relationship);
  if (!quest) return 'Story complete. Relationship choices can still affect the ending.';
  const availability = questAvailability(save, relationship, quest);
  if (availability.ok) return `Talk to ${npc.npc_name} at ${npc.location_name} with ${quest.trigger || 'chat'} to start "${quest.title}".`;
  return `${quest.title}: ${availability.reason}.`;
}

function buildStoryLeads(save) {
  ensureSaveShape(save);
  return save.relationships.map(relationship => {
    const story = storyForNpc(relationship.npc_id);
    const npc = npcById(relationship.npc_id);
    if (!story || !npc) return null;
    const active = relationship.active_quest?.status === 'active';
    const quest = active ? questForRelationship(relationship) : nextQuestForRelationship(relationship);
    const targetLocationId = active && quest ? objectiveLocationId(quest.objective, relationship.npc_id) : npc.location_id;
    const targetLocation = targetLocationId ? locationById(targetLocationId) : locationById(npc.location_id);
    const total = story.questline.length;
    const progress = Math.min(relationship.quest_stage, total);
    const readyDay = active ? Number(relationship.active_quest.ready_day || save.current_day) : null;
    return {
      npc_id: relationship.npc_id,
      npc_name: relationship.npc_name,
      story_title: story.story_title,
      progress,
      total,
      status: active ? (save.current_day < readyDay ? 'waiting' : 'active') : (progress >= total ? 'complete' : 'available'),
      quest_title: quest?.title || 'Story complete',
      target_location_id: targetLocation?.location_id || null,
      target_location_name: targetLocation?.location_name || npc.location_name,
      ready_day: readyDay,
      hint: relationshipQuestSummary(save, relationship)
    };
  }).filter(Boolean);
}

function enrichNpcForState(npc, save) {
  const story = storyForNpc(npc.npc_id);
  const relationship = save.relationships.find(item => item.npc_id === npc.npc_id);
  if (!story || !relationship) return npc;
  const total = story.questline.length;
  return {
    ...npc,
    story_title: story.story_title,
    story_summary: story.story_summary,
    story_progress: `${Math.min(relationship.quest_stage, total)}/${total}`,
    gift_name: story.gift_name,
    gift_cost: story.gift_cost || Math.abs(defaultInteractionEffects.give_gift.money),
    favor_label: story.favor_label || 'Favor',
    interaction_labels: story.interaction_labels || {},
    next_story_hint: relationshipQuestSummary(save, relationship)
  };
}

function seededNumber(seed) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffledBySeed(items, seed) {
  return items
    .map((item, index) => ({ item, rank: seededNumber(`${seed}|${index}|${item.time_slot}|${item.activity_id}`) }))
    .sort((a, b) => a.rank - b.rank)
    .map(entry => entry.item);
}

function isActivityAvailableForSave(save, activity) {
  const location = locationById(activity.location_id);
  const relationship = location.require_affection_npc_id
    ? save.relationships.find(item => item.npc_id === location.require_affection_npc_id)
    : null;
  const affectionOk = !location.require_affection_npc_id || (relationship && relationship.affection >= location.require_affection_min);
  return save.current_day >= activity.min_day
    && save.gpa >= activity.min_gpa
    && save.current_day >= location.unlock_condition_day
    && save.gpa >= location.require_gpa_min
    && affectionOk;
}

function hydrateRequiredSchedule(save, day = save.current_day) {
  ensureSaveShape(save);
  const dayKey = String(day);
  if (save.requiredSchedules[dayKey]) return save.requiredSchedules[dayKey];

  const candidates = requiredEventRules
    .filter(rule => rule.day_mod === day % 7)
    .filter(rule => {
      const activity = activities.find(item => item.activity_id === rule.activity_id);
      if (!activity) return false;
      return isActivityAvailableForSave({ ...save, current_day: day, current_time: rule.time_slot }, activity);
    });

  const count = Math.min(candidates.length, 1 + (seededNumber(`${save.username}|${save.save_id}|day-${day}`) % 2));
  save.requiredSchedules[dayKey] = shuffledBySeed(candidates, `${save.username}|${save.save_id}|required-${day}`)
    .slice(0, count)
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  saveData();
  return save.requiredSchedules[dayKey];
}

function getActiveRequiredEvent(save) {
  const rule = hydrateRequiredSchedule(save).find(item => item.time_slot === save.current_time);
  if (!rule) return null;
  const activity = activities.find(item => item.activity_id === rule.activity_id);
  if (!activity || !isActivityAvailableForSave(save, activity)) return null;
  return {
    ...rule,
    event_key: eventKey(save.current_day, save.current_time, activity.activity_id),
    activity_id: activity.activity_id,
    activity_name: activity.activity_name,
    location_id: activity.location_id,
    location_name: activity.location_name,
    description: `Required now: ${activity.activity_name} at ${activity.location_name}.`
  };
}

function getFlavorEvent(save) {
  if (getActiveRequiredEvent(save)) return null;
  const rule = flavorEventRules.find(item => item.day_mod === save.current_day % 7 && item.time_slot === save.current_time);
  if (!rule) return null;
  return {
    ...rule,
    event_key: `${save.current_day}|${save.current_time}|flavor`,
    activity_id: null,
    location_id: null,
    location_name: null
  };
}

function getActiveEvent(save) {
  return getActiveRequiredEvent(save) || getFlavorEvent(save);
}

function pendingRequiredEvent(save) {
  const event = getActiveRequiredEvent(save);
  if (!event) return null;
  return save.completedRequiredEvents.includes(event.event_key) || save.skippedRequiredEvents.includes(event.event_key) ? null : event;
}

function taskSummaryForLocation(save, locationId) {
  const requiredHereNow = [pendingRequiredEvent(save)]
    .filter(Boolean)
    .filter(event => event.location_id === locationId);
  const here = activities.filter(activity => activity.location_id === locationId);
  return {
    required: requiredHereNow.map(event => event.activity_name),
    story: storyTargetsForLocation(save, locationId),
    optional: here.filter(activity => activity.task_type === 'optional').map(activity => activity.activity_name),
    earn: here.filter(activity => activity.task_type === 'earn').map(activity => activity.activity_name)
  };
}

function checkLocationUnlocks(save) {
  ensureSaveShape(save);
  for (const location of locations) {
    const relationship = location.require_affection_npc_id
      ? save.relationships.find(item => item.npc_id === location.require_affection_npc_id)
      : null;
    const affectionOk = !location.require_affection_npc_id || (relationship && relationship.affection >= location.require_affection_min);
    const basicOk = save.current_day >= location.unlock_condition_day && save.gpa >= location.require_gpa_min;
    if (basicOk && affectionOk && !save.unlockedIds.includes(location.location_id)) {
      save.unlockedIds.push(location.location_id);
    }
  }
}

function ensureSaveShape(save) {
  save.current_day = Math.min(Math.max(1, Number(save.current_day || 1)), GAME_MAX_DAYS);
  save.max_days = GAME_MAX_DAYS;
  if (!save.relationships) save.relationships = [];
  for (const npc of npcs) {
    let relationship = save.relationships.find(item => item.npc_id === npc.npc_id);
    if (!relationship) {
      relationship = {
        save_id: save.save_id,
        npc_id: npc.npc_id,
        npc_name: npc.npc_name,
        npc_role: npc.npc_role,
        location_name: npc.location_name,
        first_met_time: null,
        last_met_time: null,
        meeting_count: 0,
        relationship_type: 'stranger',
        affection: 0,
        dialogue_stage: 0,
        quest_stage: 0,
        active_quest: null,
        quest_note: `Talk to ${npc.npc_name} to discover their story route.`,
        last_dialogue: '',
        gift_memory: '',
        memory_note: `The player has not met ${npc.npc_name} yet.`
      };
      save.relationships.push(relationship);
    }
    relationship.save_id = save.save_id;
    relationship.npc_name = npc.npc_name;
    relationship.npc_role = npc.npc_role;
    relationship.location_name = npc.location_name;
    relationship.affection = clamp(Number(relationship.affection || 0), 0, 100);
    relationship.dialogue_stage = Number(relationship.dialogue_stage || 0);
    relationship.quest_stage = Number(relationship.quest_stage || 0);
    relationship.active_quest = relationship.active_quest || null;
    relationship.quest_note = relationship.quest_note || `Talk to ${npc.npc_name} to discover their story route.`;
    relationship.last_dialogue = relationship.last_dialogue || '';
    relationship.gift_memory = relationship.gift_memory || '';
    relationship.memory_note = relationship.memory_note || `The player has not met ${npc.npc_name} yet.`;
    relationship.relationship_type = relationshipType(relationship.affection, relationship.npc_id);
  }
  save.completedRequiredEvents = save.completedRequiredEvents || [];
  save.skippedRequiredEvents = save.skippedRequiredEvents || [];
  save.requiredSchedules = save.requiredSchedules || {};
  save.unlockedIds = save.unlockedIds || locations.filter(location => location.is_default_unlocked).map(location => location.location_id);
}

function assertPlayable(save) {
  if (!save) throw new Error('Save not found.');
  ensureSaveShape(save);
  if (save.is_finished) throw new Error('This save is already finished.');
  if (save.remaining_points <= 0 || save.current_time === '23:59:00') {
    throw new Error('No remaining action points today. Please end the day.');
  }
}

function effectiveTaskType(save, activity) {
  const event = pendingRequiredEvent(save);
  if (event && event.activity_id === activity.activity_id) return 'required';
  return activity.task_type;
}

function activityBlockedReason(save, activity) {
  if (save.current_day < activity.min_day) return `Unlocks on Day ${activity.min_day}.`;
  if (save.gpa < activity.min_gpa) return `Requires GPA ${activity.min_gpa.toFixed(2)}.`;
  if (!save.unlockedIds.includes(activity.location_id)) return 'This location is locked.';
  if (activity.money_effect < 0 && save.money + activity.money_effect < 0) {
    return `Not enough money. Need at least $${Math.abs(activity.money_effect)}.`;
  }
  if (save.money <= 0 && !['earn', 'required'].includes(effectiveTaskType(save, activity)) && !['study', 'rest'].includes(activity.activity_type)) {
    return 'Cash crisis: earn money, study, or rest before optional spending.';
  }
  if (save.fatigue >= 90 && !['rest', 'food'].includes(activity.activity_type)) {
    return 'Too exhausted. Rest or eat first.';
  }
  return '';
}

function skipRequiredWarning(save, activity) {
  const requiredEvent = pendingRequiredEvent(save);
  if (!requiredEvent || requiredEvent.activity_id === activity.activity_id) return '';
  return `Skipping ${requiredEvent.activity_name} at ${requiredEvent.location_name}: GPA -0.08, Happiness +6, Fatigue +2.`;
}

function applyRequiredSkipPenalty(save, requiredEvent) {
  if (!requiredEvent || save.skippedRequiredEvents.includes(requiredEvent.event_key)) return false;
  save.skippedRequiredEvents.push(requiredEvent.event_key);
  save.gpa = Number(clamp(save.gpa - 0.08, 0, 4).toFixed(2));
  save.happiness = clamp(save.happiness + 6, 0, 100);
  save.fatigue = clamp(save.fatigue + 2, 0, 100);
  return true;
}

function addAction(save, payload) {
  const action = {
    action_id: nextActionId++,
    save_id: save.save_id,
    log_id: null,
    time_slot: save.current_time,
    day_number: save.current_day,
    gpa_before: save.gpa,
    happiness_before: save.happiness,
    fatigue_before: save.fatigue,
    money_before: save.money,
    created_at: new Date().toISOString(),
    ...payload
  };
  save.actions.unshift(action);
  save.actions = save.actions.slice(0, 60);
  return action;
}

function scheduledRequiredEventsForDay(save, day) {
  return hydrateRequiredSchedule(save, day)
    .map(rule => {
      const activity = activities.find(item => item.activity_id === rule.activity_id);
      if (!activity) return null;
      const fakeSave = { ...save, current_day: day, current_time: rule.time_slot };
      if (!isActivityAvailableForSave(fakeSave, activity)) return null;
      return {
        ...rule,
        event_key: eventKey(day, rule.time_slot, activity.activity_id),
        activity_id: activity.activity_id,
        activity_name: activity.activity_name,
        location_id: activity.location_id,
        location_name: activity.location_name
      };
    })
    .filter(Boolean);
}

function buildState(saveId) {
  const save = saves.get(Number(saveId));
  if (!save) return null;
  checkLocationUnlocks(save);

  const richLocations = locations.map(location => ({
    ...location,
    unlocked: save.unlockedIds.includes(location.location_id),
    tasks: taskSummaryForLocation(save, location.location_id)
  }));

  const visibleActivities = activities.map(activity => ({
    ...activity,
    task_type: effectiveTaskType(save, activity),
    blocked_reason: activityBlockedReason(save, activity),
    skip_required_warning: skipRequiredWarning(save, activity)
  }));

  const unlocked = richLocations
    .filter(location => save.unlockedIds.includes(location.location_id))
    .map(location => ({
      save_id: save.save_id,
      location_id: location.location_id,
      location_name: location.location_name,
      building_type: location.building_type,
      map_x: location.map_x,
      map_y: location.map_y,
      description: location.description,
      unlock_condition_day: location.unlock_condition_day,
      require_gpa_min: location.require_gpa_min,
      require_affection_npc_id: location.require_affection_npc_id,
      require_affection_min: location.require_affection_min,
      unlocked_date: new Date().toISOString().slice(0, 10),
      unlock_reason: 'Unlocked in demo mode'
    }));

  const activeEvent = getActiveEvent(save);
  const requiredToday = scheduledRequiredEventsForDay(save, save.current_day);

  return clone({
    status: {
      player_id: save.player_id,
      username: save.username,
      display_name: save.display_name,
      save_id: save.save_id,
      current_day: save.current_day,
      current_time: save.current_time,
      semester_phase: save.semester_phase,
      max_days: save.max_days,
      current_location: currentLocation(save).location_name,
      current_location_id: save.current_location_id,
      gpa: save.gpa,
      happiness: save.happiness,
      fatigue: save.fatigue,
      money: save.money,
      remaining_points: save.remaining_points,
      is_finished: save.is_finished,
      cash_crisis: save.money <= 0
    },
    activeEvent,
    requiredToday,
    completedRequiredEvents: save.completedRequiredEvents,
    skippedRequiredEvents: save.skippedRequiredEvents,
    mapAsset,
    locations: richLocations,
    unlockedLocations: unlocked,
    activities: visibleActivities,
    npcs: npcs.map(npc => enrichNpcForState(npc, save)),
    relationships: save.relationships,
    storyLeads: buildStoryLeads(save),
    actions: save.actions,
    dayLogs: save.dayLogs,
    ending: save.ending,
    currentLocation: currentLocation(save).location_name,
    mode: 'memory'
  });
}

function createNewGame(username, displayName) {
  const key = accountKey(username);
  const account = accounts.get(key);
  const save = {
    player_id: account?.playerId || nextPlayerId++,
    save_id: nextSaveId++,
    username,
    display_name: displayName,
    current_location_id: 2,
    current_time: '08:00:00',
    current_day: 1,
    semester_phase: 'Phase 1',
    max_days: GAME_MAX_DAYS,
    gpa: 3,
    happiness: 50,
    fatigue: 40,
    money: 60,
    remaining_points: 4,
    is_finished: false,
    unlockedIds: locations.filter(location => location.is_default_unlocked).map(location => location.location_id),
    completedRequiredEvents: [],
    skippedRequiredEvents: [],
    relationships: npcs.map(npc => ({
      save_id: 0,
      npc_id: npc.npc_id,
      npc_name: npc.npc_name,
      npc_role: npc.npc_role,
      location_name: npc.location_name,
      first_met_time: null,
      last_met_time: null,
      meeting_count: 0,
      relationship_type: 'stranger',
      affection: 0,
      dialogue_stage: 0,
      quest_stage: 0,
      active_quest: null,
      quest_note: `Talk to ${npc.npc_name} to discover their story route.`,
      last_dialogue: '',
      gift_memory: '',
      memory_note: `The player has not met ${npc.npc_name} yet.`
    })),
    actions: [],
    dayLogs: [],
    ending: null
  };
  save.requiredSchedules = {};
  save.relationships.forEach(relationship => { relationship.save_id = save.save_id; });
  saves.set(save.save_id, save);
  if (account) {
    account.playerId = save.player_id;
    account.displayName = displayName;
    account.saveIds = [...new Set([...(account.saveIds || []), save.save_id])];
  }
  hydrateRequiredSchedule(save);
  saveData();
  return { playerId: save.player_id, saveId: save.save_id, state: buildState(save.save_id) };
}

function register(username, password, displayName) {
  const cleanUsername = String(username || '').trim().slice(0, 50);
  const cleanPassword = String(password || '').trim();
  const cleanDisplayName = String(displayName || cleanUsername || 'Campus Walker').trim().slice(0, 50);
  const key = accountKey(cleanUsername);
  if (!cleanUsername) throw new Error('Username is required.');
  if (cleanUsername.length < 3) throw new Error('Username must be at least 3 characters.');
  if (!cleanPassword) throw new Error('Password is required.');
  if (accounts.has(key)) throw new Error('This username is already registered.');
  accounts.set(key, {
    username: cleanUsername,
    password: cleanPassword,
    displayName: cleanDisplayName,
    playerId: nextPlayerId++,
    saveIds: []
  });
  return createNewGame(cleanUsername, cleanDisplayName);
}

function login(username, password) {
  const account = accounts.get(accountKey(username));
  if (!account || account.password !== String(password || '').trim()) {
    throw new Error('Invalid username or password.');
  }
  let saveId = [...(account.saveIds || [])].reverse().find(id => saves.has(Number(id)));
  if (!saveId) {
    return createNewGame(account.username, account.displayName);
  }
  return { playerId: account.playerId, saveId: Number(saveId), state: buildState(Number(saveId)) };
}

function move(saveId, locationId) {
  const save = saves.get(Number(saveId));
  if (!save) throw new Error('Save not found.');
  const location = locationById(Number(locationId));
  if (!location) throw new Error('Location not found.');
  if (!save.unlockedIds.includes(location.location_id)) throw new Error('This location is locked.');
  addAction(save, {
    location_id: location.location_id,
    location_name: location.location_name,
    action_kind: 'move',
    activity_name: null,
    npc_name: null,
    interaction_type: null,
    gpa_after: save.gpa,
    happiness_after: save.happiness,
    fatigue_after: save.fatigue,
    money_after: save.money,
    action_description: `Moved to ${location.location_name}`
  });
  save.current_location_id = location.location_id;
  saveData();
  return { message: 'Moved successfully.', state: buildState(save.save_id) };
}

function performActivity(saveId, activityId) {
  const save = saves.get(Number(saveId));
  assertPlayable(save);
  const activity = activities.find(item => item.activity_id === Number(activityId));
  if (!activity) throw new Error('Activity not found.');
  const taskType = effectiveTaskType(save, activity);
  const blockedReason = activityBlockedReason(save, activity);
  if (blockedReason) throw new Error(blockedReason);

  const activeRequired = pendingRequiredEvent(save);
  let gpaEffect = activity.gpa_effect;
  if (save.fatigue >= 75 && activity.activity_type === 'study') gpaEffect *= 0.5;
  const before = { gpa: save.gpa, happiness: save.happiness, fatigue: save.fatigue, money: save.money };
  const skippedRequired = activeRequired && activeRequired.activity_id !== activity.activity_id
    ? applyRequiredSkipPenalty(save, activeRequired)
    : false;
  save.gpa = Number(clamp(save.gpa + gpaEffect, 0, 4).toFixed(2));
  save.happiness = clamp(save.happiness + activity.happiness_effect, 0, 100);
  save.fatigue = clamp(save.fatigue + activity.fatigue_effect, 0, 100);
  save.money = Math.max(0, save.money + activity.money_effect);
  if (activeRequired && activeRequired.activity_id === activity.activity_id) {
    save.completedRequiredEvents.push(activeRequired.event_key);
  }
  const questMessages = progressNpcQuests(save, { kind: 'activity', activity });
  addAction(save, {
    location_id: activity.location_id,
    location_name: activity.location_name,
    activity_id: activity.activity_id,
    activity_name: activity.activity_name,
    action_kind: 'activity',
    npc_name: null,
    interaction_type: null,
    event_key: activeRequired && activeRequired.activity_id === activity.activity_id ? activeRequired.event_key : null,
    gpa_before: before.gpa,
    happiness_before: before.happiness,
    fatigue_before: before.fatigue,
    money_before: before.money,
    gpa_after: save.gpa,
    happiness_after: save.happiness,
    fatigue_after: save.fatigue,
    money_after: save.money,
    action_description: [
      `${skippedRequired ? `SKIPPED required event: ${activeRequired.activity_name}. ` : ''}${taskType.toUpperCase()} task: ${activity.activity_name}`,
      ...questMessages
    ].filter(Boolean).join('\n')
  });
  save.current_location_id = activity.location_id;
  save.current_time = nextTime(save.current_time);
  save.remaining_points -= 1;
  checkLocationUnlocks(save);
  saveData();
  return { message: 'Activity completed.', state: buildState(save.save_id) };
}

function interactWithNpc(saveId, npcId, interactionType = 'chat') {
  const save = saves.get(Number(saveId));
  assertPlayable(save);
  const requiredEvent = pendingRequiredEvent(save);
  const npc = npcs.find(item => item.npc_id === Number(npcId));
  if (!npc) throw new Error('NPC not found.');
  if (!save.unlockedIds.includes(npc.location_id)) throw new Error('This NPC is in a locked location.');
  if (save.current_location_id !== npc.location_id) throw new Error(`Move to ${npc.location_name} to meet ${npc.npc_name}.`);

  const relationship = save.relationships.find(item => item.npc_id === npc.npc_id);
  const effects = interactionEffectsFor(npc, interactionType);
  if (effects.money < 0 && save.money + effects.money < 0) {
    throw new Error(`Not enough money. Need at least $${Math.abs(effects.money)}.`);
  }

  const dialogue = pickDialogue(npc, relationship, interactionType);
  const before = { gpa: save.gpa, happiness: save.happiness, fatigue: save.fatigue, money: save.money };
  const skippedRequired = requiredEvent ? applyRequiredSkipPenalty(save, requiredEvent) : false;
  save.gpa = Number(clamp(save.gpa + effects.gpa, 0, 4).toFixed(2));
  save.happiness = clamp(save.happiness + effects.happiness, 0, 100);
  save.fatigue = clamp(save.fatigue + effects.fatigue, 0, 100);
  save.money = Math.max(0, save.money + effects.money);

  relationship.first_met_time = relationship.first_met_time || new Date().toISOString();
  relationship.last_met_time = new Date().toISOString();
  relationship.meeting_count += 1;
  relationship.affection = clamp(relationship.affection + effects.gain, 0, 100);
  relationship.dialogue_stage += 1;
  relationship.relationship_type = relationshipType(relationship.affection, npc.npc_id);
  if (interactionType === 'give_gift') relationship.gift_memory = dialogue;

  const questMessages = progressNpcQuests(save, { kind: 'npc', npc, interactionType });
  const startMessage = questMessages.length ? '' : startNpcQuestIfReady(save, npc, relationship, interactionType);
  const storyMessages = [dialogue, startMessage, ...questMessages].filter(Boolean);
  relationship.last_dialogue = storyMessages.join('\n');
  relationship.memory_note = storyMessages[storyMessages.length - 1] || `Latest interaction: ${interactionType}`;

  addAction(save, {
    location_id: npc.location_id,
    location_name: npc.location_name,
    npc_id: npc.npc_id,
    npc_name: npc.npc_name,
    action_kind: 'npc',
    interaction_type: interactionType,
    activity_name: null,
    gpa_before: before.gpa,
    happiness_before: before.happiness,
    fatigue_before: before.fatigue,
    money_before: before.money,
    gpa_after: save.gpa,
    happiness_after: save.happiness,
    fatigue_after: save.fatigue,
    money_after: save.money,
    action_description: [
      `${skippedRequired ? `SKIPPED required event: ${requiredEvent.activity_name}. ` : ''}Interacted with ${npc.npc_name} by ${interactionType}`,
      ...storyMessages
    ].filter(Boolean).join('\n')
  });
  save.current_location_id = npc.location_id;
  save.current_time = nextTime(save.current_time);
  save.remaining_points -= 1;
  checkLocationUnlocks(save);
  saveData();
  return { message: storyMessages[storyMessages.length - 1] || 'NPC interaction completed.', state: buildState(save.save_id) };
}

function endDay(saveId) {
  const save = saves.get(Number(saveId));
  if (!save) throw new Error('Save not found.');
  ensureSaveShape(save);
  if (save.is_finished) return { message: 'Save already finished.', state: buildState(save.save_id) };
  const pendingActions = save.actions.filter(action => action.log_id === null && ['activity', 'npc'].includes(action.action_kind));
  const todayRequired = scheduledRequiredEventsForDay(save, save.current_day);
  const skippedRequired = todayRequired.filter(event => save.skippedRequiredEvents.includes(event.event_key));
  const missedRequired = todayRequired.filter(event => !save.completedRequiredEvents.includes(event.event_key) && !save.skippedRequiredEvents.includes(event.event_key));
  const before = { gpa: save.gpa, happiness: save.happiness, fatigue: save.fatigue, money: save.money };

  if (missedRequired.length) save.gpa = Number(clamp(save.gpa - 0.05 * missedRequired.length, 0, 4).toFixed(2));
  save.happiness = clamp(save.happiness + 2 - (save.money <= 0 ? 4 : 0) - missedRequired.length * 2, 0, 100);
  save.fatigue = Math.round(clamp(save.fatigue, 0, 100) * 0.5);

  const log = {
    log_id: nextLogId++,
    save_id: save.save_id,
    day_number: save.current_day,
    is_stayed_up: false,
    gpa_before_day: before.gpa,
    happiness_before_day: before.happiness,
    fatigue_before_day: before.fatigue,
    money_before_day: before.money,
    gpa_after_day: save.gpa,
    happiness_after_day: save.happiness,
    fatigue_after_day: save.fatigue,
    money_after_day: save.money,
    actions_completed: pendingActions.length,
    log_date: new Date().toISOString(),
    summary: `Slept to end the day; ${todayRequired.length - missedRequired.length - skippedRequired.length}/${todayRequired.length} required events completed; ${skippedRequired.length} skipped; fatigue reduced by 50%; ${save.money <= 0 ? 'cash crisis' : 'cash stable'}`
  };
  pendingActions.forEach(action => { action.log_id = log.log_id; });
  save.dayLogs.unshift(log);
  if (save.current_day >= save.max_days) {
    save.is_finished = true;
    save.remaining_points = 0;
    save.current_time = '23:59:00';
    generateEnding(save.save_id);
  } else {
    save.current_day += 1;
    save.current_time = '08:00:00';
    save.remaining_points = 4;
    save.current_location_id = 2;
  }
  checkLocationUnlocks(save);
  hydrateRequiredSchedule(save);
  saveData();
  return { message: 'Day ended.', state: buildState(save.save_id) };
}

function generateEnding(saveId) {
  const save = saves.get(Number(saveId));
  if (!save) throw new Error('Save not found.');
  if (save.ending) return { message: 'Ending already generated.', state: buildState(save.save_id) };
  const avgAffection = save.relationships.reduce((sum, item) => sum + item.affection, 0) / save.relationships.length;
  const lili = save.relationships.find(item => item.npc_id === 1);
  const earnedOften = save.actions.filter(action => action.activity_name && action.money_after > action.money_before).length >= 8;
  const completedRequired = save.completedRequiredEvents.length;
  let ending_title = 'Ordinary Campus Life';
  let description = 'You completed the semester with an ordinary but memorable campus experience.';
  if (lili && lili.affection >= 85 && lili.quest_stage >= 3 && save.happiness >= 55) {
    ending_title = 'Lili Sunset Promise';
    description = 'You protected enough time and courage to finish Lili\'s hidden route, and the semester ends with a promise at Arts Hill Backyard.';
  } else if (save.gpa >= 3.6 && completedRequired >= 12 && save.fatigue <= 65) {
    ending_title = 'Excellent Graduate';
    description = 'You kept academics strong and handled the major scheduled events.';
  } else if (earnedOften && save.money >= 250) {
    ending_title = 'Campus Entrepreneur';
    description = 'You built a practical money plan through campus work and creative events.';
  } else if (avgAffection >= 60 && save.happiness >= 55) {
    ending_title = 'Beloved Campus Friend';
    description = 'You built warm relationships across campus, and many people remember your semester.';
  } else if (save.gpa >= 3 && save.happiness >= 45 && save.fatigue <= 75) {
    ending_title = 'Balanced Graduate';
    description = 'You managed study, money, rest, social life, and exploration in a balanced way.';
  } else if (save.money <= 0) {
    ending_title = 'Cash-Strapped Survivor';
    description = 'You finished the semester, but money pressure shaped many of your choices.';
  } else if (save.gpa < 2) {
    ending_title = 'Academic Crisis';
    description = 'You ignored too many academic responsibilities, and your GPA dropped into danger.';
  } else if (save.fatigue >= 85) {
    ending_title = 'Burned Out Student';
    description = 'You pushed yourself too hard and ignored recovery.';
  }
  save.ending = {
    ending_id: nextEndingId++,
    save_id: save.save_id,
    player_id: save.player_id,
    ending_title,
    description,
    final_gpa: save.gpa,
    final_happiness: save.happiness,
    final_fatigue: save.fatigue,
    final_money: save.money,
    avg_affection: Number(avgAffection.toFixed(2))
  };
  saveData();
  return { message: 'Ending generated.', state: buildState(save.save_id) };
}

module.exports = {
  register,
  login,
  buildState,
  createNewGame,
  move,
  performActivity,
  interactWithNpc,
  endDay,
  generateEnding
};
