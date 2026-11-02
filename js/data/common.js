/**
 * Data shared by all seasons: rarities, variant list and the season registry.
 * Every season file in js/data/seasons/ calls app.registerSeason(...).
 * This file must be loaded before the season files.
 */
(function (app) {
  "use strict";

  app.RARITIES = ["Rare", "Epic", "Legendary", "Mythic", "Unknown"];

  // Every variant that can exist in any season. Which ones a sprite actually has
  // is listed per sprite in its season file. Ids are part of the saved progress keys.
  app.VARIANTS = [
    { id: "base", name: "Base" },
    { id: "gold", name: "Gold" },
    { id: "fortune", name: "Fortune" },
    { id: "cursed", name: "Cursed" },
    { id: "cheat-master", name: "Cheat Master" },
    { id: "loot-hacker", name: "Loot Hacker" },
    { id: "bounty-hunter", name: "Bounty Hunter" },
    { id: "trick-or-treat", name: "Trick or Treat" },
    { id: "quack", name: "Quack" },
  ];

  const seasons = new Map();

  /**
   * season = {
   *   id:            stable id, used in saved data (never change it)
   *   name:          display name
   *   order:         higher = newer; the newest season is the default
   *   dataCheckedOn: "YYYY-MM-DD"
   *   notes:         optional text shown under the season name (e.g. how to find sprites)
   *   sprites:       [{ id, name, rarity, source, power?, variants: [variantId, ...] }]
   * }
   */
  app.registerSeason = function registerSeason(season) {
    if (!season || typeof season.id !== "string" || seasons.has(season.id)) {
      throw new Error("Invalid or duplicate season: " + (season && season.id));
    }
    seasons.set(season.id, season);
  };

  /** All seasons, newest first. */
  app.getSeasons = function getSeasons() {
    return Array.from(seasons.values()).sort((a, b) => b.order - a.order);
  };

  /** Returns the season with this id, or undefined. */
  app.getSeason = function getSeason(id) {
    return seasons.get(id);
  };
})((window.SpriteTracker = window.SpriteTracker || {}));
