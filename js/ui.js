/**
 * Rendering only. Reads the DOM elements from index.html and draws a view model.
 * User-provided text is always set via textContent (never innerHTML),
 * so custom sprite names cannot inject markup.
 */
(function (app) {
  "use strict";

  const els = {
    seasonSelect: document.getElementById("season-select"),
    seasonLabel: document.getElementById("season-label"),
    seasonNotes: document.getElementById("season-notes"),
    foundBar: document.getElementById("found-bar"),
    foundCount: document.getElementById("found-count"),
    masteredBar: document.getElementById("mastered-bar"),
    masteredCount: document.getElementById("mastered-count"),
    filterButtons: Array.from(document.querySelectorAll(".filter")),
    search: document.getElementById("search"),
    storageWarning: document.getElementById("storage-warning"),
    list: document.getElementById("sprite-list"),
    emptyState: document.getElementById("empty-state"),
    addForm: document.getElementById("add-form"),
    addName: document.getElementById("add-name"),
    addRarity: document.getElementById("add-rarity"),
    addError: document.getElementById("add-error"),
    resetButton: document.getElementById("reset-button"),
  };

  const ICON_SIZES = { large: 56, small: 44 };

  // Icons that failed to load. They render as placeholders, so a re-render
  // (which happens on every click) does not request them again.
  const failedIcons = new Set();

  function createPlaceholder(label, size) {
    const placeholder = document.createElement("span");
    placeholder.className = "icon icon--placeholder icon--" + size;
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.textContent = label.charAt(0).toUpperCase();
    return placeholder;
  }

  /** `size` is a key of ICON_SIZES. Falls back to a letter placeholder if there is no image. */
  function createIcon(url, label, size) {
    if (!url || failedIcons.has(url)) return createPlaceholder(label, size);

    const image = document.createElement("img");
    image.className = "icon icon--" + size;
    image.width = ICON_SIZES[size];
    image.height = ICON_SIZES[size];
    image.alt = ""; // decorative: the name is always shown next to it
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.src = url;
    image.addEventListener(
      "error",
      () => {
        failedIcons.add(url);
        image.replaceWith(createPlaceholder(label, size));
      },
      { once: true }
    );
    return image;
  }

  function createCheckbox(sprite, variant, field, labelText) {
    const label = document.createElement("label");
    label.className = "check";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = variant[field];
    input.dataset.key = variant.key;
    input.dataset.field = field;
    // Full context for screen readers, since "Found" alone repeats for every variant.
    input.setAttribute("aria-label", labelText + ": " + variant.name + " " + sprite.name);

    const text = document.createElement("span");
    text.textContent = labelText;

    label.append(input, text);
    return label;
  }

  function createVariant(sprite, variant) {
    const item = document.createElement("li");
    item.className = "variant";
    if (variant.mastered) item.classList.add("variant--mastered");
    else if (variant.found) item.classList.add("variant--found");

    const name = document.createElement("span");
    name.className = "variant__name";
    name.textContent = variant.name;

    const checks = document.createElement("div");
    checks.className = "variant__checks";
    checks.append(
      createCheckbox(sprite, variant, "found", "Found"),
      createCheckbox(sprite, variant, "mastered", "Mastered")
    );

    const body = document.createElement("div");
    body.className = "variant__body";
    body.append(name, checks);

    item.append(createIcon(variant.iconUrl, sprite.name, "small"), body);
    return item;
  }

  function createRow(sprite) {
    const item = document.createElement("li");
    item.className = "sprite";
    if (sprite.mastered === sprite.total) item.classList.add("sprite--mastered");
    else if (sprite.found === sprite.total) item.classList.add("sprite--found");

    const info = document.createElement("div");
    info.className = "sprite__info";

    const title = document.createElement("div");
    title.className = "sprite__title";

    const name = document.createElement("span");
    name.className = "sprite__name";
    name.textContent = sprite.name;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.dataset.rarity = sprite.rarity;
    badge.textContent = sprite.rarity;

    title.append(name, badge);
    info.append(title);

    if (sprite.power) {
      const power = document.createElement("p");
      power.className = "sprite__power";
      power.textContent = sprite.power;
      info.append(power);
    }

    if (sprite.source) {
      const source = document.createElement("p");
      source.className = "sprite__source";
      source.textContent = sprite.source;
      info.append(source);
    }

    const summary = document.createElement("div");
    summary.className = "sprite__summary";

    const counts = document.createElement("span");
    counts.textContent =
      "Found " + sprite.found + "/" + sprite.total + " · Mastered " + sprite.mastered + "/" + sprite.total;
    summary.append(counts);

    if (sprite.custom) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button button--ghost";
      remove.dataset.action = "remove";
      remove.dataset.id = sprite.id;
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove " + sprite.name);
      summary.append(remove);
    }

    const header = document.createElement("div");
    header.className = "sprite__header";
    header.append(createIcon(sprite.iconUrl, sprite.name, "large"), info, summary);

    const variants = document.createElement("ul");
    variants.className = "variants";
    variants.append(...sprite.variants.map((variant) => createVariant(sprite, variant)));

    item.append(header, variants);
    return item;
  }

  /** Remembers which control had focus so a re-render does not drop it. */
  function captureFocus() {
    const active = document.activeElement;
    if (!active || !els.list.contains(active)) return null;
    const { key, id, field, action } = active.dataset;
    if (!key && !id) return null;
    return { key: key || null, id: id || null, field: field || null, action: action || null };
  }

  function restoreFocus(saved) {
    if (!saved) return;
    const match = Array.from(els.list.querySelectorAll("input[data-key], button[data-id]")).find(
      (node) =>
        (node.dataset.key || null) === saved.key &&
        (node.dataset.id || null) === saved.id &&
        (node.dataset.field || null) === saved.field &&
        (node.dataset.action || null) === saved.action
    );
    if (match) match.focus();
  }

  function renderProgress(stats) {
    const max = Math.max(stats.total, 1);
    els.foundBar.max = max;
    els.foundBar.value = stats.found;
    els.foundCount.textContent = stats.found + " / " + stats.total;
    els.masteredBar.max = max;
    els.masteredBar.value = stats.mastered;
    els.masteredCount.textContent = stats.mastered + " / " + stats.total;
  }

  app.ui = {
    els,

    /** One-time setup that depends on the season data. */
    init() {
      app.getSeasons().forEach((season) => {
        const option = document.createElement("option");
        option.value = season.id;
        option.textContent = season.name;
        els.seasonSelect.append(option);
      });
      app.RARITIES.forEach((rarity) => {
        const option = document.createElement("option");
        option.value = rarity;
        option.textContent = rarity;
        els.addRarity.append(option);
      });
      els.addRarity.value = "Unknown";
    },

    /** view = { season, sprites, stats, filter, canPersist } */
    render(view) {
      const focus = captureFocus();

      els.seasonSelect.value = view.season.id;
      els.seasonLabel.textContent = view.season.name + " (data checked " + view.season.dataCheckedOn + ")";
      els.seasonNotes.textContent = view.season.notes || "";
      els.seasonNotes.hidden = !view.season.notes;

      renderProgress(view.stats);

      els.filterButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === view.filter));
      });

      els.storageWarning.hidden = view.canPersist;

      els.list.replaceChildren(...view.sprites.map(createRow));
      els.emptyState.hidden = view.sprites.length > 0;

      restoreFocus(focus);
    },

    showAddError(message) {
      els.addError.textContent = message;
      els.addError.hidden = false;
    },

    clearAddError() {
      els.addError.textContent = "";
      els.addError.hidden = true;
    },
  };
})((window.SpriteTracker = window.SpriteTracker || {}));
