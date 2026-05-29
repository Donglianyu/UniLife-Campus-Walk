const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const displayNameInput = document.getElementById('displayNameInput');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const newGameBtn = document.getElementById('newGameBtn');
const endDayBtn = document.getElementById('endDayBtn');
const statusGrid = document.getElementById('statusGrid');
const saveLabel = document.getElementById('saveLabel');
const placeSummary = document.getElementById('placeSummary');
const eventSummary = document.getElementById('eventSummary');
const activityList = document.getElementById('activityList');
const npcList = document.getElementById('npcList');
const storyList = document.getElementById('storyList');
const actionLog = document.getElementById('actionLog');
const dayLog = document.getElementById('dayLog');
const toast = document.getElementById('toast');

const DEFAULT_MAP_IMAGE = '/assets/bnub_uic_campus_map.png';
let currentUsername = localStorage.getItem('unilife_current_user_v3') || '';
let saveId = currentUsername ? Number(localStorage.getItem(`unilife_save_id_v3_${currentUsername}`) || 0) : 0;
let state = null;
let hoverLocationId = null;
let mapImage = new Image();
let mapImageLoaded = false;

if (currentUsername) {
  usernameInput.value = currentUsername;
  newGameBtn.disabled = false;
}

mapImage.onload = () => {
  mapImageLoaded = true;
  renderMap();
};

mapImage.onerror = () => {
  mapImageLoaded = false;
  renderMap();
};

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = `toast show${isError ? ' error' : ''}`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function ensureNpcDialogueModal() {
  let overlay = document.getElementById('npcDialogueOverlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'npcDialogueOverlay';
  overlay.className = 'npc-dialogue-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="npc-dialogue-box" role="dialog" aria-modal="true" aria-labelledby="npcDialogueTitle">
      <div id="npcDialogueTitle" class="npc-dialogue-title"></div>
      <div id="npcDialogueText" class="npc-dialogue-text"></div>
      <div class="npc-dialogue-actions">
        <button type="button" id="npcDialogueOk">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('npcDialogueOk').addEventListener('click', hideNpcDialogueModal);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('show')) hideNpcDialogueModal();
  });
  return overlay;
}

function showNpcDialogueModal(title, text) {
  const overlay = ensureNpcDialogueModal();
  document.getElementById('npcDialogueTitle').textContent = title;
  document.getElementById('npcDialogueText').textContent = text;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('npcDialogueOk').focus();
}

function hideNpcDialogueModal() {
  const overlay = document.getElementById('npcDialogueOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed.');
  return data;
}

function ensureMapImage() {
  const imagePath = state?.mapAsset?.image_path || DEFAULT_MAP_IMAGE;
  const currentPath = mapImage.src ? new URL(mapImage.src, window.location.href).pathname : '';
  if (currentPath !== imagePath) {
    mapImageLoaded = false;
    mapImage.src = imagePath;
  }
}

async function loadState(id = saveId) {
  ensureMapImage();
  if (!id) return;
  try {
    state = await request(`/api/state/${id}`);
    saveId = Number(id);
    rememberSession(state.status.username, saveId);
    ensureMapImage();
    renderAll();
  } catch (error) {
    forgetCurrentSave();
    saveId = 0;
    showToast(error.message, true);
    renderMap();
  }
}

function authPayload() {
  return {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim(),
    displayName: displayNameInput.value.trim() || usernameInput.value.trim() || 'Campus Walker'
  };
}

function rememberSession(username, nextSaveId) {
  currentUsername = username;
  localStorage.setItem('unilife_current_user_v3', username);
  localStorage.setItem(`unilife_save_id_v3_${username}`, String(nextSaveId));
  newGameBtn.disabled = false;
}

function forgetCurrentSave() {
  if (currentUsername) localStorage.removeItem(`unilife_save_id_v3_${currentUsername}`);
}

function acceptAuthResponse(data, message) {
  saveId = Number(data.saveId);
  state = data.state;
  rememberSession(state.status.username, saveId);
  ensureMapImage();
  showToast(`${message} Save ID: ${saveId}`);
  renderAll();
}

registerBtn.addEventListener('click', async () => {
  try {
    const data = await request('/api/register', {
      method: 'POST',
      body: JSON.stringify(authPayload())
    });
    acceptAuthResponse(data, 'Registered and started.');
  } catch (error) {
    showToast(error.message, true);
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    const data = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify(authPayload())
    });
    acceptAuthResponse(data, 'Logged in.');
  } catch (error) {
    showToast(error.message, true);
  }
});

newGameBtn.addEventListener('click', async () => {
  try {
    const username = currentUsername || usernameInput.value.trim();
    if (!username) throw new Error('Register or login first.');
    const data = await request('/api/new-game', {
      method: 'POST',
      body: JSON.stringify({ username, displayName: displayNameInput.value || username || 'Campus Walker' })
    });
    acceptAuthResponse(data, 'New save created.');
  } catch (error) {
    showToast(error.message, true);
  }
});

endDayBtn.addEventListener('click', async () => {
  if (!saveId) return;
  try {
    const data = await request('/api/end-day', { method: 'POST', body: JSON.stringify({ saveId }) });
    state = data.state;
    ensureMapImage();
    showToast(state.status.is_finished ? 'The semester is complete.' : 'A new day begins.');
    renderAll();
  } catch (error) {
    showToast(error.message, true);
  }
});

canvas.addEventListener('mousemove', e => {
  if (!state) return;
  const p = canvasPoint(e);
  const hit = findLocationAt(p.x, p.y);
  hoverLocationId = hit ? hit.location_id : null;
  canvas.style.cursor = hit ? 'pointer' : 'default';
  renderMap();
});

canvas.addEventListener('mouseleave', () => {
  hoverLocationId = null;
  canvas.style.cursor = 'default';
  renderMap();
});

canvas.addEventListener('click', async e => {
  if (!state || !saveId) return;
  const p = canvasPoint(e);
  const hit = findLocationAt(p.x, p.y);
  if (!hit) return;
  if (!hit.unlocked) {
    showToast(`${hit.location_name} is locked. Unlock: ${describeCondition(hit)}`, true);
    return;
  }
  try {
    const data = await request('/api/move', { method: 'POST', body: JSON.stringify({ saveId, locationId: hit.location_id }) });
    state = data.state;
    showToast(`Moved to ${hit.location_name}.`);
    renderAll();
  } catch (error) {
    showToast(error.message, true);
  }
});

function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * canvas.width / rect.width,
    y: (e.clientY - rect.top) * canvas.height / rect.height
  };
}

function mapMeta() {
  return state?.mapAsset || { image_width: 2057, image_height: 1196 };
}

function sx(x) { return Number(x) * canvas.width / Number(mapMeta().image_width || 2057); }
function sy(y) { return Number(y) * canvas.height / Number(mapMeta().image_height || 1196); }

function findLocationAt(x, y) {
  return [...(state?.locations || [])].reverse().find(location => Math.hypot(x - sx(location.map_x), y - sy(location.map_y)) <= 20);
}

function currentLocation() {
  if (!state) return null;
  return state.locations.find(location => location.location_id === state.status.current_location_id)
    || state.locations.find(location => location.location_name === state.status.current_location);
}

function describeCondition(location) {
  const parts = [];
  if (location.unlock_condition_day > 1) parts.push(`Day >= ${location.unlock_condition_day}`);
  if (Number(location.require_gpa_min) > 0) parts.push(`GPA >= ${Number(location.require_gpa_min).toFixed(2)}`);
  if (location.require_affection_min > 0) {
    const npc = state?.npcs?.find(item => item.npc_id === location.require_affection_npc_id);
    parts.push(`${npc?.npc_name || 'NPC'} affection >= ${location.require_affection_min}`);
  }
  return parts.join(', ') || 'Default';
}

function taskBadge(type) {
  const label = { required: 'Required', optional: 'Optional', earn: 'Earn' }[type] || type;
  const cls = { required: 'req', optional: 'opt', earn: 'earn' }[type] || 'opt';
  return `<span class="badge ${cls}">${label}</span>`;
}

function pendingRequiredEvent() {
  const event = state?.activeEvent;
  if (!event?.is_required || !event.event_key) return null;
  const completed = state.completedRequiredEvents?.includes(event.event_key);
  const skipped = state.skippedRequiredEvents?.includes(event.event_key);
  return completed || skipped ? null : event;
}

function confirmRequiredSkip(actionName = 'this action') {
  const event = pendingRequiredEvent();
  if (!event) return true;
  return window.confirm(
    `Required task now: ${event.activity_name} at ${event.location_name}.\n\n` +
    `If you choose ${actionName} instead, it counts as skipping the required task.\n` +
    `Consequence: GPA -0.08, Happiness +6, Fatigue +2.\n\n` +
    'Continue anyway?'
  );
}

function renderAll() {
  renderStatus();
  renderMap();
  renderPlaceSummary();
  renderEventSummary();
  renderActivities();
  renderNpcs();
  renderStoryLeads();
  renderHistory();
}

function renderStatus() {
  if (!state) return;
  const s = state.status;
  saveLabel.textContent = `${s.username} / Save #${s.save_id}${state.mode === 'memory' ? ' demo' : ''}`;
  newGameBtn.disabled = false;
  endDayBtn.disabled = Boolean(s.is_finished);
  const stats = [
    ['Day', `${s.current_day}/${s.max_days}`],
    ['Time', s.current_time],
    ['Phase', s.semester_phase],
    ['Location', s.current_location || 'Unknown'],
    ['GPA', Number(s.gpa).toFixed(2)],
    ['Happiness', s.happiness],
    ['Fatigue', s.fatigue],
    ['Money', `$${s.money}`],
    ['Points', s.remaining_points],
    ['Cash', s.cash_crisis ? 'Crisis' : 'Stable']
  ];
  statusGrid.className = 'status-grid';
  statusGrid.innerHTML = stats.map(([k, v]) => `<div class="stat ${k === 'Cash' && s.cash_crisis ? 'cash-crisis' : ''}"><b>${k}</b><strong>${v}</strong></div>`).join('');
}

function renderPlaceSummary() {
  if (!state) return;
  const location = currentLocation();
  if (!location) return;
  const tasks = state.activities.filter(activity => activity.location_id === location.location_id);
  const required = tasks.filter(activity => activity.task_type === 'required').length;
  const earn = tasks.filter(activity => activity.task_type === 'earn').length;
  const optional = tasks.filter(activity => activity.task_type === 'optional').length;
  const story = location.tasks?.story?.length || 0;
  const moneyHint = state.status.cash_crisis
    ? '<span class="badge warn">Cash crisis: choose Earn, Required, Study, or Rest</span>'
    : '<span class="badge">Cash stable</span>';
  placeSummary.className = 'place-summary';
  placeSummary.innerHTML = `
    <div>
      <div class="place-name">${location.location_name}</div>
      <div class="empty">${location.description || ''}</div>
    </div>
    <div class="task-strip">
      <span class="badge req">Required ${required}</span>
      <span class="badge story">Story ${story}</span>
      <span class="badge opt">Optional ${optional}</span>
      <span class="badge earn">Earn ${earn}</span>
      ${moneyHint}
    </div>
    <div class="empty">Only tasks and NPCs at this place are shown in the panels.</div>
  `;
}

function renderEventSummary() {
  if (!state) return;
  const card = eventSummary.closest('.event-card');
  card.classList.remove('required', 'optional');
  const event = state.activeEvent;
  if (!event) {
    eventSummary.className = 'place-summary';
    eventSummary.innerHTML = `
      <div class="event-title">No required event</div>
      <div class="empty">This time slot is open. Choose a local task, earn money, rest, or explore.</div>
      <div class="task-strip"><span class="badge opt">Free slot</span></div>
    `;
    return;
  }
  card.classList.add(event.is_required ? 'required' : 'optional');
  const completed = event.event_key && state.completedRequiredEvents?.includes(event.event_key);
  eventSummary.className = 'place-summary';
  eventSummary.innerHTML = `
    <div>
      <div class="event-title">${event.event_title}</div>
      <div class="empty">${event.description || ''}</div>
    </div>
    <div class="task-strip">
      ${event.is_required ? '<span class="badge req">Required now</span>' : '<span class="badge opt">Campus event</span>'}
      ${event.location_name ? `<span class="badge">${event.location_name}</span>` : ''}
      ${completed ? '<span class="badge earn">Completed</span>' : ''}
    </div>
    ${event.is_required && !completed ? '<div class="empty">You can choose another activity, but it will count as skipping this required task: GPA -0.08, Happiness +6, Fatigue +2.</div>' : ''}
  `;
}

function renderMap() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawBackground(W, H);
  if (!state) return;

  for (const location of state.locations) drawLocation(location);
  for (const npc of state.npcs) drawNpc(npc);

  const current = currentLocation() || state.locations[0];
  if (current) drawPlayer(sx(current.map_x) + 18, sy(current.map_y) - 18);

  if (hoverLocationId) {
    const hover = state.locations.find(location => location.location_id === hoverLocationId);
    if (hover) drawTooltip(hover);
  }
}

function drawBackground(W, H) {
  ctx.fillStyle = '#dfe9d5';
  ctx.fillRect(0, 0, W, H);
  if (mapImageLoaded) {
    ctx.drawImage(mapImage, 0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.03)';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    for (let x = 30; x < W; x += 80) ctx.fillRect(x, 0, 3, H);
    for (let y = 30; y < H; y += 80) ctx.fillRect(0, y, W, 3);
    ctx.fillStyle = '#52616f';
    ctx.font = '700 18px sans-serif';
    ctx.fillText('BNBU/UIC Campus Map loading...', 24, 40);
  }
}

function drawLocation(location) {
  const x = sx(location.map_x);
  const y = sy(location.map_y);
  const r = hoverLocationId === location.location_id ? 15 : 12;
  const isCurrent = state.status.current_location_id === location.location_id || state.status.current_location === location.location_name;
  ctx.save();
  ctx.globalAlpha = location.unlocked ? 1 : 0.5;
  ctx.fillStyle = location.unlocked ? '#209b67' : '#8c96a6';
  if (isCurrent) ctx.fillStyle = '#2d5bff';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '800 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(location.building_type.slice(0, 2).toUpperCase(), x, y + 3);
  drawTaskChips(location, x, y);
  drawLocationLabel(location, x, y, r);
  ctx.restore();
}

function drawTaskChips(location, x, y) {
  const chips = [];
  if (location.tasks?.required?.length) chips.push(['REQ', '#dc4942']);
  if (location.tasks?.story?.length) chips.push(['STO', '#c45b32']);
  chips.slice(0, 3).forEach(([text, color], index) => {
    const chipX = x - 24 + index * 24;
    const chipY = y - 28;
    ctx.fillStyle = color;
    roundRect(ctx, chipX, chipY, text === '$' ? 20 : 28, 13, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 8px sans-serif';
    ctx.fillText(text, chipX + (text === '$' ? 10 : 14), chipY + 9);
  });
}

function drawLocationLabel(location, x, y, r) {
  ctx.fillStyle = '#102033';
  ctx.font = '800 10px sans-serif';
  ctx.strokeStyle = 'rgba(255,255,255,.92)';
  ctx.lineWidth = 4;
  const label = location.location_name.length > 18 ? `${location.location_name.slice(0, 18)}...` : location.location_name;
  ctx.strokeText(label, x, y + r + 13);
  ctx.fillText(label, x, y + r + 13);
  if (!location.unlocked) {
    ctx.font = '10px sans-serif';
    ctx.strokeText('Locked', x, y + r + 25);
    ctx.fillText('Locked', x, y + r + 25);
  }
}

function drawNpc(npc) {
  const location = state.locations.find(item => item.location_id === npc.location_id);
  if (!location || !location.unlocked) return;
  const x = sx(location.map_x) + 18;
  const y = sy(location.map_y) - 20;
  ctx.save();
  ctx.fillStyle = '#f49b20';
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = '#152033';
  ctx.font = '800 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(255,255,255,.9)';
  ctx.lineWidth = 3;
  ctx.strokeText(npc.npc_name, x, y - 11);
  ctx.fillText(npc.npc_name, x, y - 11);
  ctx.restore();
}

function drawPlayer(x, y) {
  ctx.save();
  ctx.fillStyle = '#2d5bff';
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#152033';
  ctx.font = '800 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(255,255,255,.92)';
  ctx.lineWidth = 3;
  ctx.strokeText('You', x, y - 16);
  ctx.fillText('You', x, y - 16);
  ctx.restore();
}

function drawTooltip(location) {
  const x = Math.min(canvas.width - 310, sx(location.map_x) + 20);
  const y = Math.max(12, sy(location.map_y) - 36);
  const tasks = [
    ...(location.tasks?.required || []).map(name => `REQ now: ${name}`),
    ...(location.tasks?.story || []).map(name => `STORY: ${name}`)
  ];
  ctx.save();
  ctx.fillStyle = 'rgba(10, 24, 40, .90)';
  ctx.strokeStyle = 'rgba(255,255,255,.65)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, 300, 92, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '800 13px sans-serif';
  ctx.fillText(location.location_name, x + 12, y + 22);
  ctx.font = '11px sans-serif';
  ctx.fillText(location.unlocked ? 'Unlocked' : `Locked: ${describeCondition(location)}`, x + 12, y + 40);
  ctx.fillText(tasks[0] || 'No required task in this time slot', x + 12, y + 58);
  ctx.fillText((location.description || '').slice(0, 38), x + 12, y + 75);
  ctx.restore();
}

function roundRect(targetCtx, x, y, w, h, r) {
  targetCtx.beginPath();
  targetCtx.moveTo(x + r, y);
  targetCtx.lineTo(x + w - r, y);
  targetCtx.quadraticCurveTo(x + w, y, x + w, y + r);
  targetCtx.lineTo(x + w, y + h - r);
  targetCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  targetCtx.lineTo(x + r, y + h);
  targetCtx.quadraticCurveTo(x, y + h, x, y + h - r);
  targetCtx.lineTo(x, y + r);
  targetCtx.quadraticCurveTo(x, y, x + r, y);
}

function renderActivities() {
  if (!state) return;
  const location = currentLocation();
  const list = state.activities.filter(activity => location && activity.location_id === location.location_id);
  if (!list.length) {
    activityList.className = 'list empty';
    activityList.textContent = 'No activities at this location. Click another unlocked location on the map.';
    return;
  }
  activityList.className = 'list';
  activityList.innerHTML = list.map(activity => {
    const timeBlocked = state.status.is_finished || state.status.current_time === '23:59:00' || state.status.remaining_points <= 0;
    const disabled = timeBlocked || Boolean(activity.blocked_reason);
    return `<div class="item ${disabled ? 'blocked' : ''}">
      <h3>${activity.activity_name}<span>${taskBadge(activity.task_type)}</span></h3>
      <p>${activity.description || ''}</p>
      <div class="row">
        <span class="badge">GPA ${fmtSigned(activity.gpa_effect)}</span>
        <span class="badge">Happy ${fmtSigned(activity.happiness_effect)}</span>
        <span class="badge">Fatigue ${fmtSigned(activity.fatigue_effect)}</span>
        <span class="badge ${activity.money_effect > 0 ? 'earn' : activity.money_effect < 0 ? 'warn' : ''}">Money ${fmtSigned(activity.money_effect)}</span>
        ${activity.skip_required_warning ? `<span class="badge warn">${activity.skip_required_warning}</span>` : ''}
        ${activity.blocked_reason ? `<span class="badge warn">${activity.blocked_reason}</span>` : ''}
        <button class="small" ${disabled ? 'disabled' : ''} onclick="doActivity(${activity.activity_id})">Do</button>
      </div>
    </div>`;
  }).join('');
}

function renderNpcs() {
  if (!state) return;
  const location = currentLocation();
  const list = state.npcs.filter(npc => location && npc.location_id === location.location_id && location.unlocked);
  if (!list.length) {
    npcList.className = 'list empty';
    npcList.textContent = 'No NPC at this location.';
    return;
  }
  npcList.className = 'list';
  npcList.innerHTML = list.map(npc => {
    const relationship = state.relationships.find(item => item.npc_id === npc.npc_id) || {};
    const baseDisabled = state.status.is_finished || state.status.current_time === '23:59:00' || state.status.remaining_points <= 0;
    const giftCost = Number(npc.gift_cost || 30);
    const labels = npc.interaction_labels || {};
    const giftDisabled = baseDisabled || state.status.money < giftCost;
    return `<div class="item">
      <h3>${npc.npc_name}<span class="badge">${npc.story_progress || '0/0'} ${npc.npc_role || 'NPC'}</span></h3>
      <p><strong>${npc.story_title || npc.npc_role || 'Campus Story'}</strong><br>${npc.personality_desc || ''}<br>${npc.story_summary || npc.description || ''}</p>
      ${relationship.quest_note ? `<div class="story-note">${formatMultiline(relationship.quest_note)}</div>` : ''}
      ${relationship.last_dialogue ? `<div class="dialogue-note">${formatMultiline(relationship.last_dialogue)}</div>` : ''}
      <div class="row">
        <span class="badge">${relationship.relationship_type || 'stranger'}</span>
        <span class="badge">Affection ${relationship.affection ?? 0}</span>
        <button class="small" ${baseDisabled ? 'disabled' : ''} onclick="talkNpc(${npc.npc_id}, 'chat')">${labels.chat || 'Chat'}</button>
        <button class="small secondary" ${baseDisabled ? 'disabled' : ''} onclick="talkNpc(${npc.npc_id}, 'ask_advice')">${labels.ask_advice || 'Advice'}</button>
        <button class="small secondary" ${giftDisabled ? 'disabled' : ''} onclick="talkNpc(${npc.npc_id}, 'give_gift')">${labels.give_gift || 'Gift'} $${giftCost}</button>
        <button class="small secondary" ${baseDisabled ? 'disabled' : ''} onclick="talkNpc(${npc.npc_id}, 'find_job')">${labels.find_job || npc.favor_label || 'Favor'}</button>
      </div>
    </div>`;
  }).join('');
}

function renderStoryLeads() {
  if (!state) return;
  const leads = state.storyLeads || [];
  if (!leads.length) {
    storyList.className = 'story-list empty';
    storyList.textContent = 'Talk to NPCs to discover story routes.';
    return;
  }
  storyList.className = 'story-list';
  storyList.innerHTML = leads.map(lead => {
    const statusClass = lead.status === 'complete' ? 'earn' : lead.status === 'waiting' ? 'warn' : lead.status === 'active' ? 'story' : 'opt';
    const ready = lead.ready_day && lead.status === 'waiting' ? `<span class="badge warn">Ready Day ${lead.ready_day}</span>` : '';
    return `<div class="story-lead">
      <div class="story-head">
        <strong>${lead.npc_name}: ${lead.story_title}</strong>
        <span class="badge ${statusClass}">${lead.status} ${lead.progress}/${lead.total}</span>
      </div>
      <div class="story-sub">${lead.quest_title} @ ${lead.target_location_name || 'campus'}</div>
      <div class="story-hint">${formatMultiline(lead.hint || '')}</div>
      <div class="task-strip">${ready}</div>
    </div>`;
  }).join('');
}

function formatMultiline(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function shortToast(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 150 ? `${text.slice(0, 147)}...` : text;
}

function renderHistory() {
  if (!state) return;
  if (state.actions.length) {
    actionLog.className = 'history';
    actionLog.innerHTML = state.actions.map(action => `<div class="history-entry">
      <strong>${action.action_kind.toUpperCase()} - ${action.time_slot} - ${action.location_name}</strong>
      <small>${action.action_description || ''}</small><br>
      <small>GPA ${action.gpa_before} -> ${action.gpa_after}, Happy ${action.happiness_before} -> ${action.happiness_after}, Fatigue ${action.fatigue_before} -> ${action.fatigue_after}, Money ${action.money_before} -> ${action.money_after}</small>
    </div>`).join('');
  } else {
    actionLog.className = 'history empty';
    actionLog.textContent = 'No records yet.';
  }

  const endingHtml = state.ending ? `<div class="history-entry" style="border-left-color:#f49b20">
      <strong>Ending: ${state.ending.ending_title}</strong>
      <small>${state.ending.description}</small>
    </div>` : '';
  const logsHtml = state.dayLogs.map(log => `<div class="history-entry">
      <strong>Day ${log.day_number} - Slept to end the day</strong>
      <small>${log.summary || ''}</small><br>
      <small>Actions: ${log.actions_completed}. GPA ${log.gpa_before_day} -> ${log.gpa_after_day}, Happy ${log.happiness_before_day} -> ${log.happiness_after_day}, Fatigue ${log.fatigue_before_day} -> ${log.fatigue_after_day}, Money ${log.money_before_day} -> ${log.money_after_day}</small>
    </div>`).join('');
  dayLog.className = logsHtml || endingHtml ? 'history' : 'history empty';
  dayLog.innerHTML = endingHtml + logsHtml || 'No daily summary yet.';
}

function fmtSigned(value) {
  const n = Number(value);
  return `${n >= 0 ? '+' : ''}${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

window.doActivity = async function(activityId) {
  try {
    const activity = state?.activities?.find(item => item.activity_id === activityId);
    if (activity?.skip_required_warning && !confirmRequiredSkip(activity.activity_name)) return;
    const data = await request('/api/activity', { method: 'POST', body: JSON.stringify({ saveId, activityId }) });
    state = data.state;
    showToast('Activity completed.');
    renderAll();
  } catch (error) {
    showToast(error.message, true);
  }
};

window.talkNpc = async function(npcId, interactionType) {
  try {
    const npc = state?.npcs?.find(item => item.npc_id === npcId);
    if (!confirmRequiredSkip(`talking with ${npc?.npc_name || 'this NPC'}`)) return;
    const data = await request('/api/npc', { method: 'POST', body: JSON.stringify({ saveId, npcId, interactionType }) });
    state = data.state;
    renderAll();
    const relationship = state.relationships.find(item => item.npc_id === npcId) || {};
    showNpcDialogueModal(`${npc?.npc_name || 'NPC'} Dialogue`, relationship.last_dialogue || data.message || 'NPC relationship updated.');
  } catch (error) {
    showToast(error.message, true);
  }
};

ensureMapImage();
renderMap();
loadState();
