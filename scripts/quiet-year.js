const MODULE_ID = "quiet-year";

const SEASONS = {
  spring: {
    name: "Quiet Year — Spring",
    suit: "♥",
    suitName: "Hearts",
    cards: [
      ["A", "See content/*.json", null],
      ["2", "See content/*.json", null],
      ["3", "See content/*.json", null],
      ["4", "See content/*.json", null],
      ["5", "See content/*.json", null],
      ["6", "See content/*.json", null],
      ["7", "See content/*.json", null],
      ["8", "See content/*.json", null],
      ["9", "See content/*.json", null],
      ["10", "See content/*.json", null],
      ["J", "See content/*.json", null],
      ["Q", "See content/*.json", null],
      ["K", "See content/*.json", null]
    ]
  },
  summer: {
    name: "Quiet Year — Summer",
    suit: "♦",
    suitName: "Diamonds",
    cards: [
      ["A", "See content/*.json", null],
      ["2", "See content/*.json", null],
      ["3", "See content/*.json", null],
      ["4", "See content/*.json", null],
      ["5", "See content/*.json", null],
      ["6", "See content/*.json", null],
      ["7", "See content/*.json", null],
      ["8", "See content/*.json", null],
      ["9", "See content/*.json", null],
      ["10", "See content/*.json", null],
      ["J", "See content/*.json", null],
      ["Q", "See content/*.json", null],
      ["K", "See content/*.json", null]
    ]
  },
  autumn: {
    name: "Quiet Year — Autumn",
    suit: "♣",
    suitName: "Clubs",
    cards: [
      ["A", "See content/*.json", null],
      ["2", "See content/*.json", null],
      ["3", "See content/*.json", null],
      ["4", "See content/*.json", null],
      ["5", "See content/*.json", null],
      ["6", "See content/*.json", null],
      ["7", "See content/*.json", null],
      ["8", "See content/*.json", null],
      ["9", "See content/*.json", null],
      ["10", "See content/*.json", null],
      ["J", "See content/*.json", null],
      ["Q", "See content/*.json", null],
      ["K", "See content/*.json", null]
    ]
  },
  winter: {
    name: "Quiet Year — Winter",
    suit: "♠",
    suitName: "Spades",
    cards: [
      ["A", "See content/*.json", null],
      ["2", "See content/*.json", null],
      ["3", "See content/*.json", null],
      ["4", "See content/*.json", null],
      ["5", "See content/*.json", null],
      ["6", "See content/*.json", null],
      ["7", "See content/*.json", null],
      ["8", "See content/*.json", null],
      ["9", "See content/*.json", null],
      ["10", "See content/*.json", null],
      ["J", "See content/*.json", null],
      ["Q", "See content/*.json", null],
      ["K", "See content/*.json", null]
    ]
  }
};

function cardDescription(first, second) {
  const blocks = [`<p>${first}</p>`];
  if (second) blocks.push(`<hr><p><em>or…</em></p><p>${second}</p>`);
  return blocks.join("");
}

function makeCardSource(rank, season) {
  const [r, first, second] = rank;
  const rankValue = { A: 1, J: 11, Q: 12, K: 13 }[r] ?? Number(r);
  return {
    name: `${r}${season.suit}`,
    description: cardDescription(first, second),
    suit: season.suitName,
    value: rankValue,
    faces: [{ name: `${r}${season.suit}` }],
    back: { name: season.name },
    face: 0,
    drawn: false,
    flags: { [MODULE_ID]: { season: season.suitName, rank: r } }
  };
}

async function ensureDeck(seasonKey) {
  const season = SEASONS[seasonKey];
  const existing = game.cards.find(d => d.getFlag(MODULE_ID, "season") === seasonKey);
  if (existing) {
    // The play surface is intended for collaborative use. Give players owner access
    // to the installed seasonal decks while leaving other world Card stacks alone.
    if (existing.ownership?.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
      await existing.update({"ownership.default": CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER});
    }
    return existing;
  }

  return Cards.create({
    name: season.name,
    type: "deck",
    description: `<p>${season.suitName} — ${season.name.replace("Quiet Year — ", "")}</p><p>Shuffle this seasonal deck before use.</p>`,
    cards: season.cards.map(c => makeCardSource(c, season)),
    displayCount: true,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
    flags: { [MODULE_ID]: { season: seasonKey, createdByKit: true } }
  });
}

// A single-page journal shows its name twice over: once in the sheet's title
// bar and once as the page heading. Giving the page its own shorter name keeps
// the second line from restating the first — and the page HTML opens straight
// into content, since that heading is the <h1> the page already renders.
async function ensureJournal(name, pageName, key, html) {
  let journal = game.journal.find(j => j.getFlag(MODULE_ID, "key") === key);
  if (journal) return journal;
  journal = await JournalEntry.create({
    name,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
    flags: { [MODULE_ID]: { key, createdByKit: true } },
    pages: [{
      name: pageName,
      type: "text",
      text: { format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML, content: html },
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER }
    }]
  });
  return journal;
}

async function ensureScene() {
  let scene = game.scenes.find(s => s.getFlag(MODULE_ID, "key") === "cobalt-scene");
  if (scene) return scene;
  return Scene.create({
    name: "Quiet Year — Cobalt Reach",
    width: 4000,
    height: 3000,
    padding: 0.05,
    backgroundColor: "#090d18",
    grid: { type: 0, size: 100, distance: 1, units: "" },
    tokenVision: false,
    fogExploration: false,
    navigation: true,
    flags: { [MODULE_ID]: { key: "cobalt-scene", createdByKit: true } }
  });
}

async function ensureMacro(key = "installer") {
  const configs = {
    installer: {
      name: "Quiet Year: Install / Repair Kit",
      command: "await window.QuietYearCobalt.installKit();"
    },
    play: {
      name: "Quiet Year: Open Play Surface",
      command: "window.QuietYearCobalt.openPlaySurface();"
    }
  };
  const cfg = configs[key];
  let macro = game.macros.find(m => m.getFlag(MODULE_ID, "key") === key);
  if (macro) {
    if (macro.command !== cfg.command || macro.name !== cfg.name) {
      await macro.update({ name: cfg.name, command: cfg.command });
    }
    return macro;
  }
  return Macro.create({
    name: cfg.name,
    type: "script",
    command: cfg.command,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
    flags: { [MODULE_ID]: { key, createdByKit: true } }
  });
}

const SEASON_ORDER = ["spring", "summer", "autumn", "winter"];
const SEASON_LABELS = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };

function freshState() {
  return {
    season: "spring",
    currentCard: null,
    abundances: [],
    scarcities: [],
    projects: [],
    contempt: [
      { name: "Player 1", count: 0 },
      { name: "Player 2", count: 0 }
    ],
    gameOver: false
  };
}

function getState() {
  return foundry.utils.mergeObject(freshState(), game.settings.get(MODULE_ID, "state") || {}, { inplace: false, recursive: true });
}

async function setState(state) {
  await game.settings.set(MODULE_ID, "state", state);
  refreshPlaySurface();
}

// A project is "active" until it either runs its die out (or is finished early)
// or fails. Cancelled projects keep the weeks they had left, as the record of
// where the work stood when it collapsed, so `weeks` alone cannot tell the
// three apart.
const PROJECT_STATUS_LABELS = { active: "", completed: "complete", cancelled: "failed" };

// Games saved before `status` existed hold projects shaped
// { id, name, weeks, completed }. getState() merges the stored array in whole
// — mergeObject replaces arrays rather than recursing into them — so those
// objects arrive exactly as they were written. Normalize on read instead, and
// drop `completed` from any project this module writes so the two fields can
// never disagree.
function projectStatus(project) {
  const status = project?.status;
  if (Object.hasOwn(PROJECT_STATUS_LABELS, status ?? "")) return status;
  return project?.completed ? "completed" : "active";
}

function activeProjects(state) {
  return (state.projects || []).filter(p => projectStatus(p) === "active");
}

// Foundry broadcasts world settings and card updates to every client, but only
// the acting client re-renders on its own. Every refresh — local or remote —
// goes through this one debounced helper, so a single draw (a setting write
// plus one to three card updates) costs one render on every client.
const refreshPlaySurface = foundry.utils.debounce(() => {
  const app = window.QuietYearCobalt?.app;
  if (!app) return;
  if (app.rendered) return void app.render(false);
  // `rendered` is false for the whole duration of a render, so a change landing
  // mid-render would otherwise be dropped and leave the surface stale until
  // some unrelated change happened to fire. Record it instead; _render runs it
  // once the in-flight render settles.
  if (app._state === Application.RENDER_STATES.RENDERING) app._refreshPending = true;
}, 100);

function isKitDeck(stack) {
  return !!stack && SEASON_ORDER.includes(stack.getFlag(MODULE_ID, "season"));
}

function registerRealtimeHooks() {
  // State changes arrive through the setting's own onChange callback, which
  // Foundry fires on every client. onChange is not called when the Setting
  // document is deleted outright, so that one case is hooked here to keep the
  // surface from showing state that no longer exists.
  Hooks.on("deleteSetting", setting => {
    if (setting?.key === `${MODULE_ID}.state`) refreshPlaySurface();
  });
  // The card hooks cover the season card counter, which is derived from the
  // decks' drawn flags rather than from module state and so travels as its own
  // document update.
  for (const hook of ["createCard", "updateCard", "deleteCard"]) {
    Hooks.on(hook, card => {
      if (isKitDeck(card?.parent)) refreshPlaySurface();
    });
  }
  // The stack hooks cover changes that fire no per-card hook at all: a seasonal
  // deck being created by the installer on a client that already has the
  // surface open, or one being deleted outright.
  for (const hook of ["createCards", "updateCards", "deleteCards"]) {
    Hooks.on(hook, stack => {
      if (isKitDeck(stack)) refreshPlaySurface();
    });
  }
}

function getDeck(seasonKey) {
  return game.cards.find(d => d.getFlag(MODULE_ID, "season") === seasonKey);
}

function undrawnCards(deck) {
  return deck ? deck.cards.filter(c => !c.drawn) : [];
}

function seasonRemaining(seasonKey) {
  return undrawnCards(getDeck(seasonKey)).length;
}

async function markRandomCardsDrawn(deck, count) {
  const available = undrawnCards(deck);
  const chosen = [];
  for (let i = 0; i < Math.min(count, available.length); i++) {
    const idx = Math.floor(Math.random() * available.length);
    chosen.push(available.splice(idx, 1)[0]);
  }
  if (chosen.length) {
    await deck.updateEmbeddedDocuments("Card", chosen.map(c => ({ _id: c.id, drawn: true })));
  }
  return chosen;
}

async function drawWeek() {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the Quiet Year week deck.");
  let state = getState();
  if (state.gameOver) return ui.notifications.warn("The Quiet Year has ended. Reset the year to begin again.");

  let seasonKey = state.season || "spring";
  let deck = getDeck(seasonKey);
  if (!deck) {
    ui.notifications.error(`Quiet Year deck missing: ${SEASON_LABELS[seasonKey]}. Run Install / Repair Kit.`);
    return;
  }

  // Each seasonal deck is shuffled conceptually. Choosing randomly from the
  // undrawn cards is equivalent to shuffling once and drawing from the top.
  let available = undrawnCards(deck);
  while (!available.length) {
    const i = SEASON_ORDER.indexOf(seasonKey);
    if (i >= SEASON_ORDER.length - 1) {
      state.gameOver = true;
      await setState(state);
      return ui.notifications.info("No Winter cards remain. The Quiet Year is over.");
    }
    seasonKey = SEASON_ORDER[i + 1];
    state.season = seasonKey;
    deck = getDeck(seasonKey);
    if (!deck) {
      ui.notifications.error(`Quiet Year deck missing: ${SEASON_LABELS[seasonKey]}. Run Install / Repair Kit.`);
      return;
    }
    available = undrawnCards(deck);
  }

  const card = available[Math.floor(Math.random() * available.length)];
  await deck.updateEmbeddedDocuments("Card", [{ _id: card.id, drawn: true }]);

  state.season = seasonKey;
  state.currentCard = {
    id: card.id,
    deckId: deck.id,
    name: card.name,
    description: card.description,
    season: seasonKey
  };

  // The King of Summer discards two more cards. Because the seasonal deck is
  // randomized, discarding two random undrawn cards is equivalent to discarding
  // the next two cards from a shuffled deck.
  if (seasonKey === "summer" && card.getFlag(MODULE_ID, "rank") === "K") {
    await markRandomCardsDrawn(deck, 2);
    ui.notifications.info("Summer is fleeting: two additional Summer cards were discarded. Take two actions this week.");
  }

  if (seasonKey === "winter" && card.getFlag(MODULE_ID, "rank") === "K") {
    state.gameOver = true;
  }

  await setState(state);

  const seasonLabel = SEASON_LABELS[seasonKey];
  const chat = `<div class="quiet-year-chat-card"><h2>${card.name} — ${seasonLabel}</h2>${card.description}</div>`;
  await ChatMessage.create({ content: chat, speaker: { alias: "The Quiet Year" } });

  if (state.gameOver) {
    new Dialog({
      title: "The Frost Shepherds Arrive",
      content: "<p><strong>The game is over.</strong></p>",
      buttons: { ok: { label: "So it ends." } }
    }).render(true);
  }
}

// Project outcomes are beats worth the same permanent record as the drawn card,
// and a notification only reaches the GM who happened to click.
async function announceProjects(heading, names) {
  await ChatMessage.create({
    content: `<div class="quiet-year-chat-card"><h2>${heading}</h2><p>${names.map(n => foundry.utils.escapeHTML(n)).join("<br>")}</p></div>`,
    speaker: { alias: "The Quiet Year" }
  });
}

async function tickProjects() {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the project tracker.");
  const state = getState();
  const completed = [];
  // Only active projects count down. A cancelled project still has weeks left
  // on its die and would otherwise tick its way to zero and announce itself
  // finished.
  for (const project of activeProjects(state)) {
    if (Number(project.weeks) > 0) {
      project.weeks = Math.max(0, Number(project.weeks) - 1);
      if (project.weeks === 0) {
        project.status = "completed";
        delete project.completed;
        completed.push(project.name);
      }
    }
  }
  await setState(state);
  if (!completed.length) return;
  ui.notifications.info(`Project${completed.length > 1 ? "s" : ""} complete: ${completed.join(", ")}`);
  await announceProjects(`Project${completed.length > 1 ? "s" : ""} complete`, completed);
}

// The cards call for both of these constantly — "a project finishes early", "a
// project fails" — and neither is Tick Projects, which moves every die at once.
// A failed project is not a deleted one either: it stays on the surface as part
// of the community's history.
async function setProjectStatus(id, status) {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the project tracker.");
  const state = getState();
  const project = (state.projects || []).find(p => p.id === id);
  // Another GM may have resolved or deleted this project between their write
  // and this client's debounced re-render, leaving a stale button on screen.
  // Say so rather than letting the click look like it did nothing.
  if (!project) return ui.notifications.warn("That project is no longer on the tracker.");
  if (projectStatus(project) !== "active") return ui.notifications.warn(`${project.name} is no longer underway.`);

  project.status = status;
  delete project.completed;
  // Finishing zeroes the die; failing keeps whatever was left on it.
  if (status === "completed") project.weeks = 0;
  await setState(state);

  await announceProjects(status === "completed" ? "Project finished early" : "Project failed", [project.name]);
}

async function resetYear() {
  if (!game.user.isGM) return;
  const confirmed = await Dialog.confirm({
    title: "Reset Quiet Year?",
    content: "<p>This resets all four seasonal decks and clears the play-surface tracker. It does not erase the Cobalt Reach map or journals.</p>"
  });
  if (!confirmed) return;
  for (const seasonKey of SEASON_ORDER) {
    const deck = getDeck(seasonKey);
    if (deck) await deck.updateEmbeddedDocuments("Card", deck.cards.map(c => ({ _id: c.id, drawn: false })));
  }
  await setState(freshState());
  ui.notifications.info("Quiet Year decks and tracker reset.");
}

class QuietYearPlaySurface extends Application {
  constructor(...args) {
    super(...args);
    // Names of fields the local user has typed into but not yet committed.
    // A refresh triggered by someone else must not wipe them out mid-sentence.
    this._dirtyFields = new Set();
    // Field name -> the value the template produced at the most recent render,
    // i.e. what world state says the field holds. Comparing the next render
    // against this is how an uncommitted draft learns it has been overtaken.
    this._renderedValues = {};
    this._previousRenderedValues = {};
    // Set when a refresh arrives while a render is already in flight.
    this._refreshPending = false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "quiet-year-cobalt-play-surface",
      title: "The Quiet Year",
      template: `modules/${MODULE_ID}/templates/play-surface.html`,
      width: 460,
      height: 720,
      resizable: true,
      classes: ["quiet-year-cobalt", "play-surface"]
    });
  }

  // Re-renders can now arrive at any moment from another client, so carry
  // uncommitted text and the caret across them. This hooks _replaceHTML rather
  // than _render because _render awaits getData and _renderInner before the
  // swap: capturing there would snapshot the form, yield to the event loop, and
  // then restore stale values over any keystroke typed in the gap. _replaceHTML
  // runs synchronously around the swap, so nothing can be typed between the
  // capture and the restore.
  async _render(force, options) {
    await super._render(force, options);
    if (this._refreshPending) {
      this._refreshPending = false;
      refreshPlaySurface();
    }
  }

  _replaceHTML(element, html, options) {
    const snapshot = this._captureFormState();
    super._replaceHTML(element, html, options);
    this._recordRenderedValues();
    this._restoreFormState(snapshot);
  }

  // The first render injects rather than replaces; seed the baseline there too,
  // or the second render would read every field as newly changed.
  _injectHTML(html, options) {
    super._injectHTML(html, options);
    this._recordRenderedValues();
  }

  // What world state says every field holds. Must run before any draft is
  // written back over it.
  _recordRenderedValues() {
    const root = this.element?.[0];
    if (!root) return;
    const rendered = {};
    for (const el of root.querySelectorAll("[name]")) rendered[el.name] = el.value;
    this._previousRenderedValues = this._renderedValues;
    this._renderedValues = rendered;
  }

  _captureFormState() {
    const root = this.element?.[0];
    if (!root) return null;
    const values = {};
    for (const name of this._dirtyFields) {
      const el = root.querySelector(`[name="${name}"]`);
      if (el) values[name] = el.value;
    }
    const active = document.activeElement;
    let focus = null;
    if (active?.name && root.contains(active)) {
      focus = { name: active.name, start: null, end: null };
      // Number inputs throw on selection access in some browsers.
      try {
        focus.start = active.selectionStart;
        focus.end = active.selectionEnd;
      } catch (_err) { /* caret position is a nicety, not a requirement */ }
    }
    return { values, focus };
  }

  _restoreFormState(snapshot) {
    const root = this.element?.[0];
    if (!snapshot || !root) return;
    const rendered = this._renderedValues;
    const previous = this._previousRenderedValues;
    for (const [name, value] of Object.entries(snapshot.values)) {
      const el = root.querySelector(`[name="${name}"]`);
      if (!el || el.disabled) continue;
      // The authoritative value moved since the last render: someone committed
      // to this field, or the year was reset. Their version wins, and the local
      // draft stops being treated as dirty so it cannot be restored again — or
      // read back out of the DOM by the next save.
      if (rendered[name] !== previous[name]) {
        this._dirtyFields.delete(name);
        continue;
      }
      el.value = value;
    }
    if (!snapshot.focus) return;
    const el = root.querySelector(`[name="${snapshot.focus.name}"]`);
    if (!el || el.disabled) return;
    // Swapping the HTML detaches the focused node, which parks focus on body.
    // Anything else means focus is now somewhere the user put it — another app,
    // Foundry's chat input — and pulling it back would send their keystrokes to
    // the wrong field.
    const active = document.activeElement;
    if (active && active !== document.body && !root.contains(active)) return;
    el.focus();
    if (snapshot.focus.start === null) return;
    try {
      el.setSelectionRange(snapshot.focus.start, snapshot.focus.end);
    } catch (_err) { /* see above */ }
  }

  _clearDirty(...names) {
    for (const name of names) this._dirtyFields.delete(name);
  }

  getData() {
    const state = getState();
    const seasonKey = state.season || "spring";
    return {
      isGM: game.user.isGM,
      state,
      projects: (state.projects || []).map(project => {
        const status = projectStatus(project);
        return {
          id: project.id,
          name: project.name,
          weeks: project.weeks,
          status,
          isActive: status === "active",
          statusLabel: PROJECT_STATUS_LABELS[status]
        };
      }),
      // Several cards branch on "if there are no projects underway", so the
      // notice has to key off the active ones, not off an empty list.
      hasActiveProjects: activeProjects(state).length > 0,
      seasonLabel: SEASON_LABELS[seasonKey],
      remaining: seasonRemaining(seasonKey),
      currentCard: state.currentCard,
      hasCurrentCard: !!state.currentCard,
      gameOver: !!state.gameOver,
      abundancesText: (state.abundances || []).join("\n"),
      scarcitiesText: (state.scarcities || []).join("\n")
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const root = html[0] ?? html;

    root.querySelectorAll("input[type='text'], input[type='number'], textarea").forEach(el => {
      if (el.name) el.addEventListener("input", () => this._dirtyFields.add(el.name));
    });

    root.querySelector('[data-action="draw"]')?.addEventListener("click", () => drawWeek());
    root.querySelector('[data-action="tick-projects"]')?.addEventListener("click", () => tickProjects());
    root.querySelector('[data-action="reset"]')?.addEventListener("click", () => resetYear());

    root.querySelector('[data-action="save-resources"]')?.addEventListener("click", async () => {
      if (!game.user.isGM) return;
      const state = getState();
      const lines = id => (root.querySelector(id)?.value || "").split(/\n|,/).map(s => s.trim()).filter(Boolean);
      state.abundances = lines('[name="abundances"]');
      state.scarcities = lines('[name="scarcities"]');
      state.contempt[0].name = root.querySelector('[name="player0-name"]')?.value?.trim() || "Player 1";
      state.contempt[1].name = root.querySelector('[name="player1-name"]')?.value?.trim() || "Player 2";
      this._clearDirty("abundances", "scarcities", "player0-name", "player1-name");
      await setState(state);
      ui.notifications.info("Quiet Year trackers saved.");
    });

    root.querySelector('[data-action="add-project"]')?.addEventListener("click", async () => {
      if (!game.user.isGM) return;
      const name = root.querySelector('[name="new-project-name"]')?.value?.trim();
      const weeks = Number(root.querySelector('[name="new-project-weeks"]')?.value || 1);
      if (!name) return ui.notifications.warn("Give the project a name.");
      const state = getState();
      state.projects.push({ id: foundry.utils.randomID(), name, weeks: Math.min(6, Math.max(1, weeks)), status: "active" });
      this._clearDirty("new-project-name", "new-project-weeks");
      await setState(state);
    });

    root.querySelectorAll('[data-project-finish]').forEach(el => el.addEventListener("click", ev => {
      setProjectStatus(ev.currentTarget.dataset.projectFinish, "completed");
    }));

    root.querySelectorAll('[data-project-cancel]').forEach(el => el.addEventListener("click", ev => {
      setProjectStatus(ev.currentTarget.dataset.projectCancel, "cancelled");
    }));

    root.querySelectorAll('[data-project-remove]').forEach(el => el.addEventListener("click", async ev => {
      if (!game.user.isGM) return;
      const id = ev.currentTarget.dataset.projectRemove;
      const state = getState();
      state.projects = state.projects.filter(p => p.id !== id);
      await setState(state);
    }));

    root.querySelectorAll('[data-contempt]').forEach(el => el.addEventListener("click", async ev => {
      if (!game.user.isGM) return;
      const [index, delta] = ev.currentTarget.dataset.contempt.split(":").map(Number);
      const state = getState();
      state.contempt[index].count = Math.max(0, Number(state.contempt[index].count || 0) + delta);
      await setState(state);
    }));
  }
}

function openPlaySurface() {
  if (!window.QuietYearCobalt.app) window.QuietYearCobalt.app = new QuietYearPlaySurface();
  window.QuietYearCobalt.app.render(true);
}

// The two macros are easy to lose track of on a hotbar page, and there was no
// one-click route to the rules at all. This tab keeps both reachable from
// anywhere in the world, for players as well as the GM.
//
// Foundry v13+ builds the sidebar itself: `Sidebar.TABS` describes the strip of
// icons and `CONFIG.ui` supplies the class instantiated for each one. There is
// no DOM injection to do — but both records are read by `Game#initializeUI`,
// which runs after `setup` and before `ready`, so registration has to happen at
// `init`. Sidebar tabs are ApplicationV2; the play surface is still V1, and
// nothing here requires porting it, since the tab only calls into it.
//
// Everything is reached through the `foundry.*` namespace rather than
// destructured into locals. This file is a classic script, so a top-level
// `const` lands in the shared global lexical scope, and `const Sidebar = …`
// collides with Foundry's non-configurable `globalThis.Sidebar` shim — a
// SyntaxError raised before the first statement runs, which silently takes the
// whole module with it. Same trap for any other name core exposes globally.
class QuietYearSidebarTab extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sidebar.AbstractSidebarTab
) {
  static DEFAULT_OPTIONS = {
    // Only shown when the tab is popped out (right-click on its icon).
    window: { title: "The Quiet Year" },
    actions: {
      openPlaySurface: QuietYearSidebarTab.#onOpenPlaySurface,
      openRules: QuietYearSidebarTab.#onOpenRules
    }
  };

  // Doubles as the CONFIG.ui key, the Sidebar.TABS key, the tab element's id,
  // and the `quiet-year-sidebar` class the stylesheet hangs off.
  static tabName = MODULE_ID;

  static PARTS = {
    [MODULE_ID]: {
      template: `modules/${MODULE_ID}/templates/sidebar.html`,
      root: true
    }
  };

  /**
   * @this {QuietYearSidebarTab}
   * @type {ApplicationClickAction}
   */
  static #onOpenPlaySurface() {
    openPlaySurface();
  }

  /**
   * Found by the installer's flag rather than by name, so a renamed journal
   * still opens — and so the lookup keeps working if the title ever changes.
   * @this {QuietYearSidebarTab}
   * @type {ApplicationClickAction}
   */
  static #onOpenRules() {
    // A player's `game.journal` holds only what they can observe. The installer
    // creates the rules journal with default OBSERVER ownership, so a miss here
    // means either the kit was never installed or a GM has since restricted or
    // deleted the journal — point each audience at whoever can fix it.
    const journal = game.journal.find(j => j.getFlag(MODULE_ID, "key") === "rules");
    if (!journal) {
      return ui.notifications.warn(game.user.isGM
        ? "Quiet Year rules journal not found. Run the “Quiet Year: Install / Repair Kit” macro to create it."
        : "Quiet Year rules journal not found. Ask your GM to run the “Quiet Year: Install / Repair Kit” macro.");
    }
    journal.sheet.render(true);
  }
}

function registerSidebarTab() {
  CONFIG.ui[MODULE_ID] = QuietYearSidebarTab;
  foundry.applications.sidebar.Sidebar.TABS[MODULE_ID] = {
    // The tab strip runs its tooltip through `localize`, which returns the
    // string unchanged when it is not a known key — so hardcoded English works
    // here, per the project's no-i18n ruling.
    tooltip: "The Quiet Year",
    // Not a Font Awesome class: the sidebar puts whatever it is given on the
    // button, and the stylesheet paints a "Q" on that button's pseudo-element.
    icon: "quiet-year-tab-icon"
  };
}

const rulesHtml = `
<p>The Quiet Year is by Avery Alder, published by Buried Without Ceremony. Its text is not this module’s to carry. Put your own transcription in content/rules.html.</p>`;

const setupHtml = `
<p>This kit keeps the published card prompts intact and changes only the camera scale: the shared map represents <strong>Cobalt Reach as a sector</strong>.</p>
<h2>Suggested interpretation</h2>
<ul>
<li><strong>Terrain features</strong> → systems, nebulae, wreck fields, anomalous regions, hazardous routes, dead zones.</li>
<li><strong>The community</strong> → the inhabited Reach as a loose network of settlements and stations.</li>
<li><strong>Nearby communities</strong> → worlds, stations, enclaves, factions, fleets, cultures.</li>
<li><strong>Roads / paths</strong> → known travel corridors, passage routes, or reliable navigation lanes.</li>
<li><strong>Projects</strong> → sector-scale developments whose countdown measures narrative time/attention rather than literal construction time.</li>
</ul>
<h2>Starting resources</h2>
<p>RAW: each player names one important resource; choose one resource total as an Abundance and treat the others as Scarcities.</p>
<p><strong>Optional two-player sector tweak:</strong> each player names two strategically important resources. Choose one total as an Abundance; the other three begin as Scarcities.</p>
<table><thead><tr><th>Abundances</th><th>Scarcities</th></tr></thead><tbody><tr><td><br><br><br></td><td><br><br><br></td></tr></tbody></table>
<h2>Names / factions / places worth remembering</h2><p><br><br><br><br></p>
<h2>Looming end</h2><p>You can leave the Frost Shepherds mysterious or rename them later. Avoid defining exactly what their arrival means before play; the ambiguity is useful campaign fuel.</p>`;

async function installKit() {
  if (!game.user.isGM) return ui.notifications.warn("Only a GM can install the Quiet Year kit into the world.");

  ui.notifications.info("Quiet Year: creating or repairing world resources…");
  const decks = [];
  for (const seasonKey of ["spring", "summer", "autumn", "winter"]) {
    try {
      const deck = await ensureDeck(seasonKey);
      if (!deck) throw new Error(`No deck document returned for ${seasonKey}`);
      decks.push(deck);
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to create ${seasonKey} deck`, err);
      ui.notifications.error(`Quiet Year: failed to create ${seasonKey} deck. See console for details.`);
    }
  }
  const rules = await ensureJournal("Quiet Year — Rules & Turn Summary", "Table Reference", "rules", rulesHtml);
  const setup = await ensureJournal("Cobalt Reach — Quiet Year Setup", "Sector Setup", "setup", setupHtml);
  const scene = await ensureScene();
  const macro = await ensureMacro("installer");
  const playMacro = await ensureMacro("play");

  const complete = decks.length === 4;
  await game.settings.set(MODULE_ID, "installed", complete);
  if (complete) ui.notifications.info("Quiet Year — Cobalt Reach kit is ready.");
  else ui.notifications.warn(`Quiet Year: ${decks.length}/4 seasonal decks created. Run the repair macro after correcting any errors.`);

  const content = `
  <div class="quiet-year-cobalt-dialog">
    <p><strong>Installed into this world:</strong></p>
    <ul>
      <li>${decks.length}/4 seasonal card decks (${decks.reduce((n,d) => n + d.cards.size, 0)} cards)</li>
      <li>2 reference journals</li>
      <li>1 blank gridless Cobalt Reach scene</li>
      <li>2 macros (repair/setup + play surface)</li>
    </ul>
    <p>You can disable the module after setup; the created world documents will remain.</p>
  </div>`;
  new Dialog({ title: "Quiet Year — Cobalt Reach", content, buttons: { ok: { label: "Good" } } }).render(true);
  return {decks, rules, setup, scene, macro, playMacro};
}

Hooks.once("init", () => {
  registerSidebarTab();
  game.settings.register(MODULE_ID, "installed", {
    name: "Quiet Year kit installed",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
  game.settings.register(MODULE_ID, "state", {
    name: "Quiet Year play-surface state",
    scope: "world",
    config: false,
    type: Object,
    default: freshState(),
    // Fires on every client that receives the change, which is what keeps
    // remote play surfaces in step with the GM.
    onChange: () => refreshPlaySurface()
  });
});

Hooks.once("ready", async () => {
  window.QuietYearCobalt = { installKit, openPlaySurface, drawWeek, tickProjects, setProjectStatus, resetYear, SEASONS, app: null };
  registerRealtimeHooks();
  if (!game.user.isGM) return;
  if (game.settings.get(MODULE_ID, "installed")) return;

  new Dialog({
    title: "Install Quiet Year — Cobalt Reach?",
    content: `<p>This module can add the four seasonal decks, reference journals, a blank Cobalt Reach drawing scene, and a repair macro directly to this existing world.</p><p>It does not alter Starforged actors, items, or system data.</p>`,
    buttons: {
      install: { label: "Install Kit", callback: () => installKit() },
      later: { label: "Later" }
    },
    default: "install"
  }).render(true);
});
