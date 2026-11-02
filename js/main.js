/**
 * Entry point: wires user events to the store and re-renders on every change.
 * View state (filter, search text) lives here because it is not saved.
 */
(function (app) {
  "use strict";

  const { store, ui } = app;
  const { els } = ui;

  const view = { filter: "all", query: "" };

  function render() {
    ui.render({
      season: store.getActiveSeason(),
      sprites: store.getVisibleSprites(view.filter, view.query),
      stats: store.getStats(),
      filter: view.filter,
      canPersist: store.canPersist(),
    });
  }

  function bindEvents() {
    // Checkboxes (event delegation, so re-rendered rows keep working)
    els.list.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") return;
      if (input.dataset.field === "found") store.setFound(input.dataset.key, input.checked);
      if (input.dataset.field === "mastered") store.setMastered(input.dataset.key, input.checked);
    });

    els.list.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action='remove']");
      if (!button) return;
      if (window.confirm("Remove this sprite and its progress?")) {
        store.removeSprite(button.dataset.id);
      }
    });

    els.seasonSelect.addEventListener("change", () => {
      store.setSeason(els.seasonSelect.value);
    });

    els.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        view.filter = button.dataset.filter;
        render();
      });
    });

    els.search.addEventListener("input", () => {
      view.query = els.search.value;
      render();
    });

    els.addForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = store.addSprite(els.addName.value, els.addRarity.value);
      if (!result.ok) {
        ui.showAddError(result.error);
        els.addName.focus();
        return;
      }
      ui.clearAddError();
      els.addForm.reset();
      els.addRarity.value = "Unknown";
      // Make sure the new sprite is visible right away.
      view.filter = "all";
      view.query = "";
      els.search.value = "";
      render();
    });

    els.resetButton.addEventListener("click", () => {
      if (window.confirm("Reset found and mastered status for all sprites in this season? Other seasons are not affected.")) {
        store.resetProgress();
      }
    });
  }

  store.init();
  ui.init();
  store.subscribe(render);
  bindEvents();
  render();
})(window.SpriteTracker);
