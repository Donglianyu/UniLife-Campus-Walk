# Latest Database Patch

This database folder keeps the original project SQL files and adds the latest gameplay content patch.

Import order for a fresh MySQL database:

```bash
mysql -u root -p < database/unilife_campus_walk_uic_map.sql
mysql -u root -p < database/latest_game_content_patch.sql
mysql -u root -p < database/enhanced_event_schedule.sql
```

Latest content counts from memory engine:

- Locations: 23
- NPCs: 8
- Activities: 92
- Required event slots: 28
- Flavor event slots: 6

The default server mode uses backend/memoryStore.js and does not require MySQL. MySQL mode is kept for the original project structure and future backend migration.
