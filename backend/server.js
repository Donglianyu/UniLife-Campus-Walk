const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const { query, withConnection } = require('./db');
const memoryStore = require('./memoryStore');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const USE_MYSQL = String(process.env.USE_MYSQL || '').toLowerCase() === 'true';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function normalizeError(error) {
  const message = error && error.sqlMessage ? error.sqlMessage : (error.message || 'Unknown server error');
  return { message };
}

async function getFullState(saveId) {
  const statusRows = await query('SELECT * FROM v_player_status WHERE save_id = ?', [saveId]);
  if (statusRows.length === 0) return null;

  const [mapAssets, locations, unlocked, activities, npcs, relationships, actions, dayLogs, endings] = await Promise.all([
    query('SELECT * FROM v_map_asset ORDER BY map_asset_id LIMIT 1'),
    query('SELECT * FROM `location` ORDER BY location_id'),
    query('SELECT * FROM v_unlocked_locations WHERE save_id = ? ORDER BY location_id', [saveId]),
    query('SELECT * FROM v_activity_location ORDER BY location_id, activity_id'),
    query('SELECT * FROM v_npc_location ORDER BY location_id, npc_id'),
    query('SELECT * FROM v_npc_relationship WHERE save_id = ? ORDER BY npc_id', [saveId]),
    query('SELECT * FROM v_action_history WHERE save_id = ? ORDER BY action_id DESC LIMIT 40', [saveId]),
    query('SELECT * FROM day_log WHERE save_id = ? ORDER BY day_number DESC LIMIT 15', [saveId]),
    query('SELECT * FROM ending WHERE save_id = ? ORDER BY ending_id DESC LIMIT 1', [saveId])
  ]);

  const unlockedSet = new Set(unlocked.map(x => x.location_id));
  const currentLocation = statusRows[0].current_location;

  return {
    status: statusRows[0],
    mapAsset: mapAssets[0] || null,
    locations: locations.map(l => ({ ...l, unlocked: unlockedSet.has(l.location_id) })),
    unlockedLocations: unlocked,
    activities,
    npcs,
    relationships,
    actions,
    dayLogs,
    ending: endings[0] || null,
    currentLocation
  };
}

app.get('/api/health', async (req, res) => {
  if (!USE_MYSQL) {
    res.json({ ok: true, database: false, mode: 'memory' });
    return;
  }
  try {
    const rows = await query('SELECT 1 AS ok');
    res.json({ ok: true, database: rows[0].ok === 1, mode: 'mysql' });
  } catch (error) {
    res.status(500).json({ ok: false, error: normalizeError(error).message });
  }
});

app.post('/api/new-game', async (req, res) => {
  const username = String(req.body.username || 'player_' + Date.now()).trim().slice(0, 50);
  const displayName = String(req.body.displayName || 'Campus Walker').trim().slice(0, 50);
  if (!username) return res.status(400).json({ error: 'Username is required.' });

  try {
    if (!USE_MYSQL) {
      res.json(memoryStore.createNewGame(username, displayName));
      return;
    }
    const result = await withConnection(async conn => {
      await conn.query('CALL create_new_game(?, ?, @player_id, @save_id)', [username, displayName]);
      const [outRows] = await conn.query('SELECT @player_id AS playerId, @save_id AS saveId');
      return outRows[0];
    });
    const state = await getFullState(result.saveId);
    res.json({ playerId: result.playerId, saveId: result.saveId, state });
  } catch (error) {
    res.status(500).json({ error: normalizeError(error).message });
  }
});

app.post('/api/register', async (req, res) => {
  if (USE_MYSQL) return res.status(400).json({ error: 'Register is available in memory mode for this direct-run package.' });
  const username = String(req.body.username || '').trim().slice(0, 50);
  const password = String(req.body.password || '').trim();
  const displayName = String(req.body.displayName || username || 'Campus Walker').trim().slice(0, 50);
  try {
    res.json(memoryStore.register(username, password, displayName));
  } catch (error) {
    res.status(400).json({ error: normalizeError(error).message });
  }
});

app.post('/api/login', async (req, res) => {
  if (USE_MYSQL) return res.status(400).json({ error: 'Login is available in memory mode for this direct-run package.' });
  const username = String(req.body.username || '').trim().slice(0, 50);
  const password = String(req.body.password || '').trim();
  try {
    res.json(memoryStore.login(username, password));
  } catch (error) {
    res.status(401).json({ error: normalizeError(error).message });
  }
});

app.get('/api/state/:saveId', async (req, res) => {
  try {
    if (!USE_MYSQL) {
      const state = memoryStore.buildState(Number(req.params.saveId));
      if (!state) return res.status(404).json({ error: 'Save not found.' });
      res.json(state);
      return;
    }
    const state = await getFullState(Number(req.params.saveId));
    if (!state) return res.status(404).json({ error: 'Save not found.' });
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: normalizeError(error).message });
  }
});

app.post('/api/move', async (req, res) => {
  const saveId = Number(req.body.saveId);
  const locationId = Number(req.body.locationId);
  if (!saveId || !locationId) return res.status(400).json({ error: 'saveId and locationId are required.' });

  try {
    if (!USE_MYSQL) {
      res.json(memoryStore.move(saveId, locationId));
      return;
    }
    await query('CALL move_to_location(?, ?)', [saveId, locationId]);
    const state = await getFullState(saveId);
    res.json({ message: 'Moved successfully.', state });
  } catch (error) {
    res.status(400).json({ error: normalizeError(error).message });
  }
});

app.post('/api/activity', async (req, res) => {
  const saveId = Number(req.body.saveId);
  const activityId = Number(req.body.activityId);
  if (!saveId || !activityId) return res.status(400).json({ error: 'saveId and activityId are required.' });

  try {
    if (!USE_MYSQL) {
      res.json(memoryStore.performActivity(saveId, activityId));
      return;
    }
    await query('CALL perform_activity(?, ?)', [saveId, activityId]);
    const state = await getFullState(saveId);
    res.json({ message: 'Activity completed.', state });
  } catch (error) {
    res.status(400).json({ error: normalizeError(error).message });
  }
});

app.post('/api/npc', async (req, res) => {
  const saveId = Number(req.body.saveId);
  const npcId = Number(req.body.npcId);
  const interactionType = String(req.body.interactionType || 'chat');
  if (!saveId || !npcId) return res.status(400).json({ error: 'saveId and npcId are required.' });

  try {
    if (!USE_MYSQL) {
      res.json(memoryStore.interactWithNpc(saveId, npcId, interactionType));
      return;
    }
    await query('CALL interact_with_npc(?, ?, ?)', [saveId, npcId, interactionType]);
    const state = await getFullState(saveId);
    res.json({ message: 'NPC interaction completed.', state });
  } catch (error) {
    res.status(400).json({ error: normalizeError(error).message });
  }
});

app.post('/api/end-day', async (req, res) => {
  const saveId = Number(req.body.saveId);
  if (!saveId) return res.status(400).json({ error: 'saveId is required.' });

  try {
    if (!USE_MYSQL) {
      res.json(memoryStore.endDay(saveId));
      return;
    }
    await query('CALL end_day(?)', [saveId]);
    const stateAfterDay = await getFullState(saveId);

    if (stateAfterDay.status.is_finished && !stateAfterDay.ending) {
      try { await query('CALL generate_ending(?)', [saveId]); } catch (_) {}
    }

    const state = await getFullState(saveId);
    res.json({ message: 'Day ended.', state });
  } catch (error) {
    res.status(400).json({ error: normalizeError(error).message });
  }
});

app.post('/api/generate-ending', async (req, res) => {
  const saveId = Number(req.body.saveId);
  if (!saveId) return res.status(400).json({ error: 'saveId is required.' });
  try {
    if (!USE_MYSQL) {
      res.json(memoryStore.generateEnding(saveId));
      return;
    }
    await query('CALL generate_ending(?)', [saveId]);
    const state = await getFullState(saveId);
    res.json({ message: 'Ending generated.', state });
  } catch (error) {
    res.status(400).json({ error: normalizeError(error).message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getLanUrls(port) {
  const urls = [];
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses || []) {
      const ip = address.address || '';
      const isVirtualProxy = ip.startsWith('198.18.') || ip.startsWith('198.19.');
      if (address.family === 'IPv4' && !address.internal && !isVirtualProxy) {
        urls.push(`http://${address.address}:${port}/`);
      }
    }
  }
  return urls;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UniLife Campus Walk running at http://127.0.0.1:${PORT}/`);
  for (const url of getLanUrls(PORT)) console.log(`LAN URL: ${url}`);
  console.log(`Data mode: ${USE_MYSQL ? 'MySQL' : 'in-memory demo'}`);
});
