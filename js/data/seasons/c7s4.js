/**
 * Chapter 7 Season 4: Override.
 * Compiled from community guides (see README). Locations are hints, not guarantees.
 * Progress is stored by "spriteId:variantId", so renaming a sprite or variant never
 * breaks saved progress (changing an id does).
 */
(function (app) {
  "use strict";

  const STANDARD = Object.freeze(["base", "gold", "cheat-master", "loot-hacker", "bounty-hunter", "trick-or-treat"]);
  const WITH_QUACK = Object.freeze(STANDARD.concat("quack"));
  const BASE_ONLY = Object.freeze(["base"]);

  // `source` and `power` are null/omitted when the guides did not name them.
  app.registerSeason({
    id: "c7s4",
    name: "Chapter 7 Season 4: Override",
    order: 1,
    dataCheckedOn: "2026-10-26",
    notes: null,
    sprites: [
      // Rare
      { id: "adventure", name: "Adventure", rarity: "Rare", source: "Starts in your inventory each match", power: "Upgrades a random item in your inventory at each level.", variants: WITH_QUACK },
      { id: "bush", name: "Bush", rarity: "Rare", source: "Starts in your inventory each match", power: "Spawns a bush on you after a while; at max level also when you eliminate someone.", variants: WITH_QUACK },
      { id: "jonesy", name: "Jonesy", rarity: "Rare", source: "Starts in your inventory each match", power: "Recovers some health or shield after you take damage.", variants: WITH_QUACK },
      { id: "8-bit", name: "8-Bit", rarity: "Rare", source: "Blue Cheat Code panels", power: "Guarantees an 8-Bit Shotgun in a chest and adds a score multiplier for it.", variants: STANDARD },
      { id: "birthday", name: "Birthday", rarity: "Rare", source: "Enter cheat code FM1 in the Admin Panel", variants: STANDARD },
      { id: "mega-man", name: "Mega Man", rarity: "Rare", source: "Blue Cheat Code chests", variants: BASE_ONLY },
      { id: "onigiri", name: "Onigiri", rarity: "Rare", source: "Blue Cheat Code chests", variants: STANDARD },
      { id: "overshield", name: "Overshield", rarity: "Rare", source: "Chests or Cheat Code chests", variants: STANDARD },
      { id: "storm-scout", name: "Storm Scout", rarity: "Rare", source: "Blue Cheat Codes (purple for rarer variants)", variants: STANDARD },

      // Epic
      { id: "dumpster-dive", name: "Dumpster Dive", rarity: "Epic", source: "Any Cheat Code or Pumpkin Chest, no fixed spawn", variants: STANDARD },
      { id: "killswitch", name: "Killswitch", rarity: "Epic", source: "Cheat Code panels (night versions)", power: "Enter Hangtime with improved accuracy.", variants: STANDARD },
      { id: "morgana", name: "Morgana", rarity: "Epic", source: null, variants: STANDARD },
      { id: "pond", name: "Pond", rarity: "Epic", source: "Epic Cheat Code chests", variants: STANDARD },
      { id: "shadow", name: "Shadow", rarity: "Epic", source: "Cheat Code panels", power: "Automatically reloads weapons over time, even when unequipped.", variants: STANDARD },
      { id: "sonic", name: "Sonic", rarity: "Epic", source: "Cheat Code panels", power: "Sprint faster.", variants: STANDARD },
      { id: "tails", name: "Tails", rarity: "Epic", source: "Cheat Code panels", power: "Lets you hover in the air.", variants: STANDARD },

      // Legendary
      { id: "blinky", name: "Blinky", rarity: "Legendary", source: "Defeat the floating Pac-Man boss", variants: STANDARD },
      { id: "crash-bandicoot", name: "Crash Bandicoot", rarity: "Legendary", source: "Defeat the Adam Smasher boss", variants: STANDARD },
      { id: "jackrabbit", name: "Jackrabbit", rarity: "Legendary", source: "Defeat the Hush boss", power: "Lets you jump again while in mid-air.", variants: STANDARD },
      { id: "the-deer", name: "The Deer", rarity: "Legendary", source: "Fortnitemares sprite", variants: STANDARD },
      { id: "vampire", name: "Vampire", rarity: "Legendary", source: "Gold Cheat Codes, Pumpkin Chests", variants: STANDARD },
      { id: "x-ray", name: "X-Ray", rarity: "Legendary", source: "Purple or gold Cheat Codes", variants: STANDARD },

      // Mythic
      { id: "crown", name: "Crown", rarity: "Mythic", source: null, power: "Gain extra Crown Wins after a Victory Royale. Levels up only by winning matches.", variants: STANDARD },
      { id: "klombo", name: "Klombo", rarity: "Mythic", source: null, power: "Grants a random item at each level. Levels up by using health or shield items.", variants: WITH_QUACK },
      { id: "one-wish-willow", name: "One Wish Willow", rarity: "Mythic", source: "Pumpkin Chests, vaults, high-rarity Cheat Codes", power: "Steals the Sprites your eliminations had equipped and pushes everything away when you take damage.", variants: STANDARD },
      { id: "spooky-dash", name: "Spooky Dash", rarity: "Mythic", source: "Pumpkin Chests, normal chests, Cheat Codes", variants: WITH_QUACK },

      // Rarity not confirmed by the guides
      { id: "honey", name: "Honey", rarity: "Unknown", source: "Added with v42.40 (Oct 15)", variants: STANDARD },
    ],
  });
})((window.SpriteTracker = window.SpriteTracker || {}));
