/**
 * Thin wrapper around localStorage.
 * Every access is wrapped in try/catch because storage can be blocked
 * (private windows, strict privacy settings) or full.
 * Saved data is upgraded to the current schema by migrate(); data with an
 * unknown version is ignored. Add a migration step there for every version bump.
 *
 * Schema history:
 *  v1: { progress: { "sonic": {...} } }                 one entry per sprite
 *  v2: { progress: { "sonic:base": {...} } }            one entry per variant
 *  v3: { activeSeason, seasons: { "<seasonId>": { progress, customSprites } } }
 */
(function (app) {
  "use strict";

  // The key keeps its "v1" name on purpose: the schema version lives inside the data.
  const STORAGE_KEY = "sprite-tracker:v1";
  const SCHEMA_VERSION = 3;
  // Everything saved before seasons existed belongs to this season.
  const LEGACY_SEASON_ID = "c7s4";

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function migrateV1ToV2(data) {
    const oldProgress = isObject(data.progress) ? data.progress : {};
    const progress = {};
    Object.keys(oldProgress).forEach((spriteId) => {
      progress[spriteId + ":base"] = oldProgress[spriteId];
    });
    return { version: 2, progress, customSprites: data.customSprites };
  }

  function migrateV2ToV3(data) {
    return {
      version: 3,
      activeSeason: null,
      seasons: {
        [LEGACY_SEASON_ID]: { progress: data.progress, customSprites: data.customSprites },
      },
    };
  }

  /** Upgrades saved data to the current schema, or returns null if it is not understood. */
  function migrate(data) {
    if (!isObject(data)) return null;
    let current = data;
    if (current.version === 1) current = migrateV1ToV2(current);
    if (current.version === 2) current = migrateV2ToV3(current);
    return current.version === SCHEMA_VERSION ? current : null;
  }

  function getStorage() {
    try {
      const storage = window.localStorage;
      const probeKey = "__sprite_tracker_probe__";
      storage.setItem(probeKey, "1");
      storage.removeItem(probeKey);
      return storage;
    } catch (error) {
      return null;
    }
  }

  const storage = getStorage();

  app.storage = {
    isAvailable() {
      return storage !== null;
    },

    /** Returns the saved data object (current schema), or null if nothing valid is saved. */
    load() {
      if (!storage) return null;
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return migrate(JSON.parse(raw));
      } catch (error) {
        return null;
      }
    },

    /** `data` = { activeSeason, seasons }. Returns true if it was saved successfully. */
    save(data) {
      if (!storage) return false;
      try {
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: SCHEMA_VERSION,
            activeSeason: data.activeSeason,
            seasons: data.seasons,
          })
        );
        return true;
      } catch (error) {
        return false;
      }
    },
  };
})((window.SpriteTracker = window.SpriteTracker || {}));
