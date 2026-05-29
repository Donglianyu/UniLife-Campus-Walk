# UniLife NPC 剧情线与玩法设计

本版本已把 NPC 从“通用加好感”升级为可推进的剧情路线。每个 NPC 都有专属故事标题、剧情摘要、聊天反馈、建议反馈、礼物反馈、功能性互动，以及 3 段贯穿校园地点的任务。任务会在 `Story Leads` 面板和地图 `STO` 标记中提示下一步地点。

## Lili：Hidden Route Romance

主线定位：慢热恋爱线。Lili 通过校园小路、湖边约会和 Arts Hill 隐藏地点，让玩家在学习压力之外保留一段真诚关系。

- 专属礼物：pressed flower bookmark。
- 聊天反馈：从“带你走安静路线”逐步发展到“湖边约会”和“Arts Hill Backyard 日落告白”。
- 礼物反馈：Lili 会注意玩家是否记得湖边花、书签、笔记本这些细节。
- 任务 1：Shortcut to the Lake。聊天触发，Day 2 后去 Lakeside Walkway 完成 `Walk by the Lake`。
- 任务 2：Two-Day Date Promise。好感达标后聊天触发，需要等待 2 天，再去 Lakeside Walkway 完成 `Talk with Lili by Lake`。
- 任务 3：Backyard Sunset。Day 5 且 Lili 好感 60 后触发，解锁 Arts Hill Backyard 后完成 `Secret Talk with Lili`。
- 特殊结局：Lili 好感 85 且完成路线后，可进入 `Lili Sunset Promise` 结局。

## Professor Chen：The Reluctant Mentor

主线定位：学术导师线。教授通过出勤、测验、研究讨论检验玩家是否具备稳定学习习惯。

- 专属礼物：annotated article printout。教授不会把它当“礼物”，而是当成阅读证据。
- 任务 1：Prepared Attendance。完成 `Attend Professional Course`。
- 任务 2：Quiz Recovery。Day 3 后通过建议触发，完成 `Take Quiz`。
- 任务 3：Research Door。Day 7 且 GPA 3.40 后触发，前往 Institute for Advanced Study 完成 `Join Research Discussion`。

## Alex：Recovery Pact

主线定位：运动恢复线。Alex 让玩家学会区分“疲劳”和“忽视身体”，改善疲劳管理。

- 专属礼物：electrolyte drink pack。
- 任务 1：Start Without Drama。完成 Sports Park 的 `Morning Stretch`。
- 任务 2：Gym After Two Mornings。等待 2 天后完成 `Workout at Gym`。
- 任务 3：Badminton Trust Match。完成 `Play Badminton`。

## Mia：Career Compass

主线定位：职业与金钱线。Mia 帮玩家建立奖学金、兼职、咨询的经济路线。

- 专属礼物：thank-you coffee。
- 任务 1：Emergency Funding。完成 `Apply for Scholarship`，缓解开局金钱压力。
- 任务 2：Plaza Confidence。Day 2 后完成 `Campus Market Stall`。
- 任务 3：Consultation Slot。Day 6 且 GPA 3.20 后完成 `Career Consultation`。

## Yuki：Quiet Exhibition

主线定位：艺术社与表达线。Yuki 带玩家从私密创作走向公共展示。

- 专属礼物：watercolor postcard set。
- 任务 1：One Honest Line。Day 3 后完成 `Sketch on Arts Hill`。
- 任务 2：Poster That Stops People。Day 5 后完成 `Design Poster`。
- 任务 3：Stage Light Courage。完成 `Watch Performance`。

## Mr. Liang：Huitong Field Notes

主线定位：村落探索与文化记录线。Mr. Liang 引导玩家从拍照式探索转向尊重式田野记录。

- 专属礼物：jasmine tea tin。
- 任务 1：Listening Walk。Day 2 后完成 `Explore Huitong Village`。
- 任务 2：Workshop Hands。Day 6 后完成 `Repair Old Workshop Tools`。
- 任务 3：Borrowed Stories。完成 `Archive Village Stories`。

## Kai：Lake Safety Trust

主线定位：湖泊与安全线。Kai 先让玩家学习安全，再开放皮划艇与水样采集。

- 专属礼物：waterproof whistle。
- 任务 1：Briefing Before Water。Day 4 后完成 `Lake Safety Briefing`。
- 任务 2：One-Day Weather Window。等待 1 天后完成 `Kayak Across the Lake`。
- 任务 3：Water Sampling Crew。完成 `Water Sampling Mission`。

## Nora：Club Constellation

主线定位：社团与领导力线。Nora 将玩家从报名者培养为可靠的社团协作者。

- 专属礼物：color-coded sticky tabs。
- 任务 1：Choose a Society。Day 2 后完成 `Join Society Fair`。
- 任务 2：Booth Shift。完成 `Club Booth Duty`。
- 任务 3：Speaking Corner。Day 3 后完成 `Public Speaking Corner`。

## 可玩性调整

- 新增 `Story Leads` 面板：显示每个 NPC 当前剧情状态、进度、目标地点、是否需要等待到未来某一天。
- 地图新增 `STO` 标记：当前地点如果有 NPC 剧情目标，会在地图点位显示故事任务提示。
- NPC 卡片增强：显示故事标题、路线进度、当前任务提示、最近完整对话、专属礼物价格。
- 交互反馈增强：Chat、Advice、Gift、Job/Favor 不再是通用文案，每个 NPC 都有不同台词与数值效果。
- 跨天任务：Lili、Alex、Kai 等路线包含“等待 1-2 天后再赴约/训练/下水”的时间要求。
- 结局增强：完成 Lili 恋爱线并保持高好感会触发专属恋爱结局。
