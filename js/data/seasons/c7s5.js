/**
 * Chapter 7 Season 5: Treasure Hunters (mini season, started 2026-11-01 with v43.00).
 * Compiled from community guides (see README). Epic has not published rarities yet,
 * so the rarity values are read from spawn tiers and a few may change.
 *
 * Still to come (add to this file when they are confirmed):
 *  - Nov 12: Gold variants return. It is not known yet which sprites get one.
 *  - More sprites during the season.
 */
(function (app) {
  "use strict";

  const STYLED = Object.freeze(["base", "fortune", "cursed"]);
  const BASE_ONLY = Object.freeze(["base"]);

  app.registerSeason({
    id: "c7s5",
    name: "Chapter 7 Season 5: Treasure Hunters",
    order: 2,
    dataCheckedOn: "2026-11-02",
    notes:
      "How to find sprites: tear down a Wanted Poster to get a Sprite Treasure Map, then dig up the buried Sprite Chest it leads to. " +
      "Fortune reveals nearby chests. Cursed improves your odds of rare Sprite variants, but water damages you. " +
      "Gold variants are expected on Nov 12.",
    sprites: [
      // Rare
      { id: "halfpeeld", name: "Halfpeel'd", rarity: "Rare", source: null, power: "Marks eliminations on the map; the detection range grows each level.", variants: STYLED },
      { id: "re-pete", name: "Re-Pete", rarity: "Rare", source: null, power: "Reload faster, with a chance to get ammo back.", variants: STYLED },
      { id: "barry-ofish", name: "Barry O'Fish", rarity: "Rare", source: null, power: "Use less stamina when sprinting in water; at max level you gain a Slap effect.", variants: STYLED },

      // Epic
      { id: "wayfinder", name: "Wayfinder", rarity: "Epic", source: null, power: "Shows nearby Sprites and adds extra loot to Buried Chests.", variants: STYLED },
      { id: "kelper", name: "Kelper", rarity: "Epic", source: null, power: "Heals you over time while in water; heals get bigger each level.", variants: STYLED },

      // Legendary
      { id: "exmarks", name: "Exmarks", rarity: "Legendary", source: null, power: "Shows nearby Treasure Maps and Wanted Posters; spawns a Treasure Map at max level.", variants: STYLED },
      { id: "chester", name: "Chester", rarity: "Legendary", source: null, power: "Chests may spawn extra loot, and fall damage is cancelled.", variants: STYLED },
      { id: "lil-squibbly", name: "Lil' Squibbly", rarity: "Legendary", source: null, power: "Jump into fishing holes to catch fish with bonus loot.", variants: STYLED },
      { id: "lil-flacko", name: "Lil' Flacko", rarity: "Legendary", source: null, power: "Landing creates a small shockwave that knocks opponents back.", variants: STYLED },
      { id: "lil-uzi-vert-jr", name: "Lil' Uzi Vert Jr.", rarity: "Legendary", source: "Expected on Nov 7, not confirmed live by every guide yet", power: "Creates a Chug Splash effect when you restore shields.", variants: STYLED },
      { id: "transponder-snail", name: "Transponder Snail", rarity: "Legendary", source: "Listed by only some guides so far, may change", power: "Grants extra resources on pickup; teammates with it equipped get some too.", variants: BASE_ONLY },

      // Mythic
      { id: "plundarrgh", name: "Plundarrgh", rarity: "Mythic", source: null, power: "Opening a Chest boosts your Pickaxe speed and movement speed.", variants: STYLED },
      { id: "sweet-dreams", name: "Sweet Dreams", rarity: "Mythic", source: null, power: "Grants a random item at each level, with Mythic loot at max level.", variants: BASE_ONLY },
    ],
  });
})((window.SpriteTracker = window.SpriteTracker || {}));
