/**
 * Application state and rules. No DOM access in this file.
 *
 * State (one entry per season, so progress never mixes between seasons):
 *  - progress:      { ["spriteId:variantId"]: { found: boolean, mastered: boolean } }
 *  - customSprites: sprites the user added on top of the season data (Base variant only)
 * Plus the id of the active season.
 *
 * Rules (applied per variant):
 *  - Mastering a variant also marks it as found.
 *  - Un-finding a variant also removes its mastery.
 */
(function (app) {
  "use strict";

  const MAX_NAME_LENGTH = 40;
  const FILTERS = ["all", "not-found", "not-mastered", "mastered"];
  const KEY_SEPARATOR = ":";
  const BASE_ONLY = Object.freeze(["base"]);

  const variantNames = new Map(app.VARIANTS.map((variant) => [variant.id, variant.name]));
  const listeners = [];
  const states = {}; // seasonId -> { progress, customSprites }
  let foreignSeasons = {}; // saved data of seasons this build does not know; kept so it is not lost
  let activeSeasonId = null;
  let saveFailed = false;

  /* ---------- sanitizing (saved data is untrusted input) ---------- */

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function sanitizeProgress(raw) {
    const clean = {};
    if (!isObject(raw)) return clean;
    Object.keys(raw).forEach((key) => {
      if (!key.includes(KEY_SEPARATOR)) return;
      const entry = raw[key];
      if (!entry || typeof entry !== "object") return;
      const found = entry.found === true || entry.mastered === true;
      const mastered = entry.mastered === true;
      if (found) clean[key] = { found, mastered };
    });
    return clean;
  }

  function sanitizeCustomSprites(raw, seasonSprites) {
    if (!Array.isArray(raw)) return [];
    const seedIds = new Set(seasonSprites.map((sprite) => sprite.id));
    const seen = new Set();
    const clean = [];
    raw.forEach((item) => {
      if (!item || typeof item.id !== "string" || typeof item.name !== "string") return;
      if (item.id.includes(KEY_SEPARATOR)) return;
      if (seedIds.has(item.id) || seen.has(item.id)) return;
      const name = item.name.trim().slice(0, MAX_NAME_LENGTH);
      if (!name) return;
      const rarity = app.RARITIES.includes(item.rarity) ? item.rarity : "Unknown";
      seen.add(item.id);
      clean.push({ id: item.id, name, rarity, source: null, variants: BASE_ONLY });
    });
    return clean;
  }

  /* ---------- helpers ---------- */

  function activeSeason() {
    return app.getSeason(activeSeasonId);
  }

  function state() {
    return states[activeSeasonId];
  }

  function persist() {
    const seasons = Object.assign({}, foreignSeasons);
    Object.keys(states).forEach((seasonId) => {
      seasons[seasonId] = {
        progress: states[seasonId].progress,
        // Variants of custom sprites are always Base only, so they are not stored.
        customSprites: states[seasonId].customSprites.map((sprite) => ({
          id: sprite.id,
          name: sprite.name,
          rarity: sprite.rarity,
        })),
      };
    });
    saveFailed = !app.storage.save({ activeSeason: activeSeasonId, seasons });
    notify();
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeName(name) {
    return name.trim().replace(/\s+/g, " ");
  }

  function makeKey(spriteId, variantId) {
    return spriteId + KEY_SEPARATOR + variantId;
  }

  function allBaseSprites() {
    return activeSeason().sprites.concat(state().customSprites);
  }

  function hasSprite(id) {
    return allBaseSprites().some((sprite) => sprite.id === id);
  }

  function isKnownKey(key) {
    const parts = String(key).split(KEY_SEPARATOR);
    if (parts.length !== 2) return false;
    const sprite = allBaseSprites().find((item) => item.id === parts[0]);
    return Boolean(sprite && sprite.variants.includes(parts[1]));
  }

  function pruneEntry(key) {
    const progress = state().progress;
    const entry = progress[key];
    if (entry && !entry.found && !entry.mastered) delete progress[key];
  }

  /** Sprites of the active season with all variants and their status. */
  function buildSprites() {
    const { progress, customSprites } = state();
    return allBaseSprites().map((sprite) => {
      const variants = sprite.variants.map((variantId) => {
        const key = makeKey(sprite.id, variantId);
        const entry = progress[key];
        return {
          key,
          id: variantId,
          name: variantNames.get(variantId) || variantId,
          iconUrl: app.getIconUrl(sprite.id, variantId),
          found: Boolean(entry && entry.found),
          mastered: Boolean(entry && entry.mastered),
        };
      });
      return {
        id: sprite.id,
        name: sprite.name,
        rarity: sprite.rarity,
        source: sprite.source,
        power: sprite.power || null,
        iconUrl: app.getIconUrl(sprite.id, "base"),
        custom: customSprites.some((custom) => custom.id === sprite.id),
        variants,
        // Counts over ALL variants of this sprite, regardless of filters.
        total: variants.length,
        found: variants.filter((variant) => variant.found).length,
        mastered: variants.filter((variant) => variant.mastered).length,
      };
    });
  }

  function matchesFilter(variant, filter) {
    switch (filter) {
      case "not-found":
        return !variant.found;
      case "not-mastered":
        return !variant.mastered;
      case "mastered":
        return variant.mastered;
      default:
        return true;
    }
  }

  /* ---------- public API ---------- */

  app.store = {
    FILTERS,
    MAX_NAME_LENGTH,

    init() {
      const seasons = app.getSeasons();
      if (seasons.length === 0) throw new Error("No seasons registered.");

      const saved = app.storage.load();
      const savedSeasons = saved && isObject(saved.seasons) ? saved.seasons : {};

      seasons.forEach((season) => {
        const raw = Object.prototype.hasOwnProperty.call(savedSeasons, season.id) ? savedSeasons[season.id] : null;
        states[season.id] = {
          progress: sanitizeProgress(raw && raw.progress),
          customSprites: sanitizeCustomSprites(raw && raw.customSprites, season.sprites),
        };
      });

      foreignSeasons = {};
      Object.keys(savedSeasons).forEach((seasonId) => {
        if (!app.getSeason(seasonId)) foreignSeasons[seasonId] = savedSeasons[seasonId];
      });

      // Fall back to the newest season if nothing (valid) was saved.
      activeSeasonId = saved && app.getSeason(saved.activeSeason) ? saved.activeSeason : seasons[0].id;
    },

    subscribe(listener) {
      listeners.push(listener);
    },

    /** True if progress is currently being saved to the browser. */
    canPersist() {
      return app.storage.isAvailable() && !saveFailed;
    },

    /** { id, name, dataCheckedOn, notes } of the active season. */
    getActiveSeason() {
      const season = activeSeason();
      return {
        id: season.id,
        name: season.name,
        dataCheckedOn: season.dataCheckedOn,
        notes: season.notes || null,
      };
    },

    /** Switches the season. Progress of every season is kept separately. */
    setSeason(id) {
      if (!app.getSeason(id) || id === activeSeasonId) return;
      activeSeasonId = id;
      persist();
    },

    getSprites() {
      return buildSprites();
    },

    /**
     * Applies the filter per variant: a sprite is returned only with the variants
     * that match, and sprites without any matching variant are left out.
     * The search matches every word against "<variant> <sprite>", so
     * "gold", "sonic" and "gold sonic" all work.
     */
    getVisibleSprites(filter, query) {
      const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const result = [];
      buildSprites().forEach((sprite) => {
        const variants = sprite.variants.filter((variant) => {
          if (tokens.length) {
            const haystack = (variant.name + " " + sprite.name).toLowerCase();
            if (!tokens.every((token) => haystack.includes(token))) return false;
          }
          return matchesFilter(variant, filter);
        });
        if (variants.length > 0) result.push(Object.assign({}, sprite, { variants }));
      });
      return result;
    },

    /** Totals over every variant of every sprite in the active season. */
    getStats() {
      return buildSprites().reduce(
        (stats, sprite) => ({
          total: stats.total + sprite.total,
          found: stats.found + sprite.found,
          mastered: stats.mastered + sprite.mastered,
        }),
        { total: 0, found: 0, mastered: 0 }
      );
    },

    /** `key` is "spriteId:variantId". */
    setFound(key, value) {
      if (!isKnownKey(key)) return;
      const progress = state().progress;
      const entry = progress[key] || { found: false, mastered: false };
      entry.found = Boolean(value);
      if (!entry.found) entry.mastered = false;
      progress[key] = entry;
      pruneEntry(key);
      persist();
    },

    setMastered(key, value) {
      if (!isKnownKey(key)) return;
      const progress = state().progress;
      const entry = progress[key] || { found: false, mastered: false };
      entry.mastered = Boolean(value);
      if (entry.mastered) entry.found = true;
      progress[key] = entry;
      pruneEntry(key);
      persist();
    },

    /** Returns { ok: true } or { ok: false, error: string }. */
    addSprite(rawName, rarity) {
      const name = normalizeName(String(rawName || ""));
      if (!name) return { ok: false, error: "Please enter a name." };
      if (name.length > MAX_NAME_LENGTH) {
        return { ok: false, error: "Name must be at most " + MAX_NAME_LENGTH + " characters." };
      }
      const lower = name.toLowerCase();
      if (allBaseSprites().some((sprite) => sprite.name.toLowerCase() === lower)) {
        return { ok: false, error: "A sprite with this name already exists." };
      }

      const baseSlug = slugify(name) || "sprite";
      let id = "custom-" + baseSlug;
      let counter = 2;
      while (hasSprite(id)) {
        id = "custom-" + baseSlug + "-" + counter;
        counter += 1;
      }

      state().customSprites.push({
        id,
        name,
        rarity: app.RARITIES.includes(rarity) ? rarity : "Unknown",
        source: null,
        variants: BASE_ONLY,
      });
      persist();
      return { ok: true };
    },

    /** Only user-added sprites can be removed; season data is edited in its data file. */
    removeSprite(id) {
      const { progress, customSprites } = state();
      const index = customSprites.findIndex((sprite) => sprite.id === id);
      if (index === -1) return;
      customSprites.splice(index, 1);
      Object.keys(progress).forEach((key) => {
        if (key.startsWith(id + KEY_SEPARATOR)) delete progress[key];
      });
      persist();
    },

    /** Clears found/mastered flags of the active season only; keeps user-added sprites. */
    resetProgress() {
      state().progress = {};
      persist();
    },
  };
})((window.SpriteTracker = window.SpriteTracker || {}));
