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
    // Weeks resolved, not cards drawn: Summer's King discards two further cards
    // without those being weeks of their own.
    week: 0,
    // One entry per week — the card drawn, and the actions taken against it.
    log: [],
    currentCard: null,
    abundances: [],
    scarcities: [],
    projects: [],
    // Seeded without ids on purpose: a fresh state is rebuilt on every read, so
    // random ids here would differ between the render that drew a row and the
    // click that acts on it. Rows fall back to their position until the first
    // write stamps real ids on them — see contemptId().
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

// Every action here reads the state, changes it and writes it back, and the
// window between the read and the write is wide — drawWeek() updates cards
// inside it. A player's relayed Contempt click lands on a GM client at a moment
// nobody controls, so those windows really do overlap now; on the client where
// both run, this queue keeps one from discarding the other's change.
//
// It is per client, so it does not order writes between two connected GMs —
// socketlib relays to one of them, and that GM may be mid-action on another.
// Two GMs driving the tracker at once was already a race before this, and
// closing it properly would need a lock held across clients.
let trackerWrites = Promise.resolve();

function queueTrackerWrite(task) {
  const result = trackerWrites.then(task, task);
  // The chain must not stay rejected or every later write would be handed the
  // old failure; callers see it through `result` instead.
  trackerWrites = result.catch(() => {});
  return result;
}

// Wraps an action so its whole read-modify-write takes a turn in the queue.
function serialized(action) {
  return (...args) => queueTrackerWrite(() => action(...args));
}

// Click handlers are fire-and-forget, so a failed write would otherwise be an
// unhandled rejection and a button that looks inert.
function reportTrackerFailure(err) {
  console.error(`${MODULE_ID} |`, err);
  ui.notifications.error("The Quiet Year tracker could not be updated — see the console.");
}

// A week ends in one action of three. Starting a project is the only one that
// already had any UI, so it is recorded from the Add Project flow rather than
// asked for twice.
const WEEK_ACTIONS = {
  discover: "Discovered something new",
  discussion: "Held a discussion",
  project: "Started a project"
};

function currentWeek(state) {
  const log = state.log || [];
  return log.length ? log[log.length - 1] : null;
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

// Contempt rows are addressed by a stable id, because array position stops
// meaning anything once rows can be added and removed. Games saved before ids
// existed — and the seeded default — carry none, so a row falls back to its
// position; every write stamps real ids, so the fallback lasts exactly until
// the first one.
function contemptId(entry, index) {
  return entry?.id || `row-${index}`;
}

function contemptIndex(state, id) {
  const rows = state.contempt || [];
  const found = rows.findIndex((entry, i) => contemptId(entry, i) === id);
  if (found >= 0) return found;
  // The click carries whatever id the row had when it was drawn, and the write
  // that stamped real ids may have landed since — renders trail state by the
  // 100ms debounce. A position-derived id still says which row was meant.
  const position = /^row-(\d+)$/.exec(id);
  const index = position ? Number(position[1]) : -1;
  return index < rows.length ? index : -1;
}

// Must run *after* the lookup that matched a position-derived id, or it would
// rename the very row that was being looked for.
function stampContemptIds(state) {
  for (const entry of state.contempt || []) if (!entry.id) entry.id = foundry.utils.randomID();
  return state;
}

// Runs once per world on the GM's client, so a game carried over from before
// ids existed settles on real ones before anything is rendered. Without it the
// first write of the session would change every row's identity underneath a
// surface that had already drawn them.
// A game saved before weeks were counted has no true week number to recover.
// Cards already drawn across the four decks is the closest approximation, and a
// good deal better than sending an in-progress year back to week 1. Reads the
// stored setting rather than getState(), which would have merged the default in
// and hidden the absence.
async function migrateWeekNumber() {
  const stored = game.settings.get(MODULE_ID, "state");
  if (!stored || stored.week !== undefined) return;
  const drawn = SEASON_ORDER.reduce((total, key) => {
    const deck = getDeck(key);
    return total + (deck ? deck.cards.filter(card => card.drawn).length : 0);
  }, 0);
  if (!drawn) return;
  const state = getState();
  state.week = drawn;
  // The log starts here, with an entry for the week already in play — without
  // one, the surface would show a week whose action nothing could record.
  if (!(state.log || []).length) {
    state.log = [{ week: drawn, season: state.season || "spring", card: state.currentCard?.name || "—", actions: [], allowance: 1 }];
  }
  await setState(state);
}

async function migrateContemptIds() {
  const state = getState();
  if (!(state.contempt || []).some(entry => !entry.id)) return;
  await setState(stampContemptIds(state));
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

const drawWeek = serialized(async function drawWeek() {
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

  state.week = Number(state.week || 0) + 1;
  const week = { week: state.week, season: seasonKey, card: card.name, actions: [], allowance: 1 };
  state.log = [...(state.log || []), week];

  // The King of Summer discards two more cards. Because the seasonal deck is
  // randomized, discarding two random undrawn cards is equivalent to discarding
  // the next two cards from a shuffled deck.
  if (seasonKey === "summer" && card.getFlag(MODULE_ID, "rank") === "K") {
    await markRandomCardsDrawn(deck, 2);
    // The two discarded cards are not weeks of their own; the week they belong
    // to simply gets two actions.
    week.allowance = 2;
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
});

// Project outcomes are beats worth the same permanent record as the drawn card,
// and a notification only reaches the GM who happened to click.
async function announceProjects(heading, names) {
  await ChatMessage.create({
    content: `<div class="quiet-year-chat-card"><h2>${heading}</h2><p>${names.map(n => foundry.utils.escapeHTML(n)).join("<br>")}</p></div>`,
    speaker: { alias: "The Quiet Year" }
  });
}

function completeProject(project) {
  project.status = "completed";
  delete project.completed;
}

// A die that has run out is a finished project however it got there, so the
// weekly tick, Winter 6's bulk reduction and a hand-adjusted countdown all
// finish through here.
async function announceCompleted(completed) {
  if (!completed.length) return;
  const plural = completed.length > 1 ? "s" : "";
  ui.notifications.info(`Project${plural} complete: ${completed.join(", ")}`);
  await announceProjects(`Project${plural} complete`, completed);
}

// `weeks` is a parameter because Winter 6 reduces every remaining project by 2
// in one stroke: "the time has come to consolidate your efforts and your
// borders". The weekly tick is the same operation with a week of one.
const tickProjects = serialized(async function tickProjects(weeks = 1) {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the project tracker.");
  const reduction = Math.max(1, Math.floor(Number(weeks) || 1));
  const state = getState();
  const completed = [];
  // Only active projects count down. A cancelled project still has weeks left
  // on its die and would otherwise tick its way to zero and announce itself
  // finished.
  for (const project of activeProjects(state)) {
    if (Number(project.weeks) > 0) {
      project.weeks = Math.max(0, Number(project.weeks) - reduction);
      if (project.weeks === 0) {
        completeProject(project);
        completed.push(project.name);
      }
    }
  }
  await setState(state);
  await announceCompleted(completed);
});

// Autumn A adds three weeks to a project die, so this deliberately has no
// ceiling — the 1–6 clamp on Add Project belongs to the *initial* die, not to
// what the year does to it afterwards. A die worked down to zero is finished,
// the same as one that ticked there.
const adjustProjectWeeks = serialized(async function adjustProjectWeeks(id, delta) {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the project tracker.");
  // Exported for macros, so the die is protected from a step that would land
  // NaN in the setting: that serializes to null, and a project with a blank
  // die is skipped by every countdown from then on.
  const step = Number(delta);
  if (!Number.isInteger(step) || step === 0) return;
  const state = getState();
  const project = (state.projects || []).find(p => p.id === id);
  if (!project) return ui.notifications.warn("That project is no longer on the tracker.");
  if (projectStatus(project) !== "active") {
    // Clicking − faster than the 100ms render debounce leaves the stepper on
    // screen for a project that just finished. There is nothing to say about
    // a spent die; a cancelled project with weeks still on it is a real slip.
    if (Number(project.weeks) > 0) ui.notifications.warn(`${project.name} is no longer underway.`);
    return;
  }

  project.weeks = Math.max(0, Number(project.weeks || 0) + step);
  const completed = project.weeks === 0;
  if (completed) completeProject(project);
  await setState(state);
  if (completed) await announceCompleted([project.name]);
});

// Autumn 7 radically changes what a project is while insisting the die stays
// put, so a rename touches nothing else.
const renameProject = serialized(async function renameProject(id, name) {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the project tracker.");
  // Every path that declines to write refreshes, because the typed name is
  // sitting in the field and is no longer held as a draft. Without this the
  // surface would keep showing a name the world does not have until some
  // unrelated change happened to re-render it.
  const trimmed = String(name).trim();
  if (!trimmed) {
    ui.notifications.warn("A project needs a name.");
    return refreshPlaySurface();
  }
  const state = getState();
  const project = (state.projects || []).find(p => p.id === id);
  if (!project) {
    ui.notifications.warn("That project is no longer on the tracker.");
    return refreshPlaySurface();
  }
  if (project.name === trimmed) return refreshPlaySurface();
  project.name = trimmed;
  await setState(state);
});

// The cards call for both of these constantly — "a project finishes early", "a
// project fails" — and neither is Tick Projects, which moves every die at once.
// A failed project is not a deleted one either: it stays on the surface as part
// of the community's history.
const setProjectStatus = serialized(async function setProjectStatus(id, status) {
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
});

// The week's action is recorded against the week rather than merely announced,
// so a finished year reads back as what was drawn and what was done about it.
// `week` is the week the click was aimed at, carried from the button that was
// on screen. Without it this would record against whatever the last log entry
// happens to be when the queued task runs — and a draw can slip in ahead of it,
// putting the action on the following week and burning that week's allowance.
const recordAction = serialized(async function recordAction(kind, { week: number, silent = false } = {}) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the week's record.");
  if (!WEEK_ACTIONS[kind]) return;
  const state = getState();
  const log = state.log || [];
  const week = number === undefined ? currentWeek(state) : log.find(entry => entry.week === Number(number));
  if (!week) {
    if (!silent) ui.notifications.warn("Draw a week before recording its action.");
    return;
  }
  if (week.actions.length >= (week.allowance || 1)) {
    // Not every project is the week's action — several cards call for one as
    // part of their own prompt — so a full week just keeps its record.
    if (!silent) ui.notifications.warn(`Week ${week.week} already has its actions recorded.`);
    return;
  }
  week.actions.push(kind);
  await setState(state);
});

const undoAction = serialized(async function undoAction(index) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the week's record.");
  const state = getState();
  const week = currentWeek(state);
  if (!week || !week.actions[index]) return refreshPlaySurface();
  week.actions.splice(index, 1);
  await setState(state);
});

// Roughly a dozen cards add or remove one of these — "a new Abundance", "this
// becomes a Scarcity", "remove an Abundance" — so each entry is its own value
// with its own controls rather than a line inside a textarea. The stored shape
// is unchanged (a string array), so existing games carry over as they are.
const RESOURCE_LISTS = { abundances: "Abundance", scarcities: "Scarcity" };

// Entries are addressed by position, since a plain string has no id. The value
// the row was drawn with comes along as a guard: if the list has shifted under
// the surface, the entry is found by that instead of the stale position.
function resourceIndex(list, index, previous) {
  const at = Number(index);
  const inRange = Number.isInteger(at) && at >= 0 && at < list.length;
  // A caller with no value to hand — a macro, say — gets plain positional
  // addressing rather than a search for `undefined` that always misses.
  if (previous === undefined) return inRange ? at : -1;
  if (inRange && list[at] === previous) return at;
  // Two entries may hold the same string, so prefer the occurrence nearest the
  // position the row was drawn at rather than always the first one.
  let nearest = -1;
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== previous) continue;
    if (nearest < 0 || Math.abs(i - at) < Math.abs(nearest - at)) nearest = i;
  }
  return nearest;
}

const addResource = serialized(async function addResource(kind, value) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the resource lists.");
  if (!RESOURCE_LISTS[kind]) return;
  const trimmed = String(value).trim();
  if (!trimmed) return ui.notifications.warn(`Name the new ${RESOURCE_LISTS[kind]}.`);
  const state = getState();
  state[kind] = [...(state[kind] || []), trimmed];
  await setState(state);
});

const renameResource = serialized(async function renameResource(kind, index, value, previous) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the resource lists.");
  if (!RESOURCE_LISTS[kind]) return;
  const trimmed = String(value).trim();
  // Blank is not a removal — there is a button for that — so the field goes
  // back to what the world holds, as a project rename does.
  if (!trimmed) {
    ui.notifications.warn(`${RESOURCE_LISTS[kind]} entries need a name.`);
    return refreshPlaySurface();
  }
  const state = getState();
  const list = state[kind] || [];
  const at = resourceIndex(list, index, previous);
  if (at < 0) {
    ui.notifications.warn(`That ${RESOURCE_LISTS[kind]} is no longer on the list.`);
    return refreshPlaySurface();
  }
  if (list[at] === trimmed) return refreshPlaySurface();
  list[at] = trimmed;
  await setState(state);
});

const removeResource = serialized(async function removeResource(kind, index, previous) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the resource lists.");
  if (!RESOURCE_LISTS[kind]) return;
  const state = getState();
  const list = state[kind] || [];
  const at = resourceIndex(list, index, previous);
  if (at < 0) {
    ui.notifications.warn(`That ${RESOURCE_LISTS[kind]} is no longer on the list.`);
    return refreshPlaySurface();
  }
  list.splice(at, 1);
  await setState(state);
});

// Contempt is the one tracker a player has to be able to work themselves. The
// rules make it their own move — taken instead of interrupting someone's turn —
// so making them interrupt and ask the GM to click for them defeats the point.
// World-scoped settings are GM-write-only, so a non-GM click is relayed to a GM
// client through socketlib, which performs the write there.
//
// Any player may adjust any row. The rows are a shared table-facing signal and
// this is a trust-based game; tying each row to a `game.users` entry was the
// alternative and buys permission checks nobody at this table needs.
let contemptSocket = null;

Hooks.once("socketlib.ready", () => {
  // Returns undefined — having logged its own reason — when the manifest
  // Foundry read at world launch did not carry `"socket": true`.
  contemptSocket = socketlib.registerModule(MODULE_ID) ?? null;
  if (!contemptSocket) return console.warn(`${MODULE_ID} | No socketlib socket: Contempt stays GM-operated. Relaunch the world so Foundry re-reads this module's manifest.`);
  contemptSocket.register("applyContemptAdjustment", applyContemptAdjustment);
});

// Runs on a GM client, either because a GM clicked or because socketlib relayed
// a player's click here. Returns whether the write happened, so the client that
// clicked is the one that reports a failure — a notification raised here would
// otherwise pop up on the GM's screen for something a player did.
async function applyContemptAdjustment(id, delta) {
  if (!game.user.isGM) return false;
  // The trust boundary for relayed input, so it admits exactly what the buttons
  // send: one token either way. Anything else — a fraction, a huge number, a
  // NaN that would serialize to null and zero the row — is refused.
  if (delta !== 1 && delta !== -1) return false;
  return queueTrackerWrite(async () => {
    const state = getState();
    const index = contemptIndex(state, id);
    if (index < 0) return false;
    const entry = state.contempt[index];
    entry.count = Math.max(0, Number(entry.count || 0) + delta);
    stampContemptIds(state);
    await setState(state);
    return true;
  });
}

async function adjustContempt(id, delta) {
  let applied;
  if (game.user.isGM) applied = await applyContemptAdjustment(id, Number(delta));
  else {
    // socketlib is a declared dependency, so a miss here means it was switched
    // off after the fact rather than a route players normally meet.
    if (!contemptSocket) return ui.notifications.warn("Adjusting Contempt yourself needs the socketlib module enabled.");
    if (!game.users.some(u => u.isGM && u.active)) return ui.notifications.warn("A GM must be connected before Contempt can be adjusted.");
    applied = await contemptSocket.executeAsGM("applyContemptAdjustment", id, Number(delta));
  }
  if (!applied) ui.notifications.warn("That Contempt row could not be adjusted — it may no longer be on the tracker.");
}

const renameContemptRow = serialized(async function renameContemptRow(id, name) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the player roster.");
  const state = getState();
  const index = contemptIndex(state, id);
  if (index < 0) {
    ui.notifications.warn("That Contempt row is no longer on the tracker.");
    return refreshPlaySurface();
  }
  const trimmed = String(name).trim() || `Player ${index + 1}`;
  if (state.contempt[index].name === trimmed) return refreshPlaySurface();
  state.contempt[index].name = trimmed;
  stampContemptIds(state);
  await setState(state);
});

async function addContemptRow() {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the player roster.");
  return queueTrackerWrite(async () => {
    const state = stampContemptIds(getState());
    // Counting rows would reissue a name after a removal, leaving two rows the
    // same on a tracker whose whole job is telling players apart.
    const highest = state.contempt.reduce((n, entry) => Math.max(n, Number(/^Player (\d+)$/.exec(entry.name || "")?.[1]) || 0), 0);
    state.contempt.push({ id: foundry.utils.randomID(), name: `Player ${Math.max(highest + 1, state.contempt.length + 1)}`, count: 0 });
    await setState(state);
  });
}

async function removeContemptRow(id) {
  if (!game.user.isGM) return ui.notifications.warn("The GM keeps the player roster.");
  return queueTrackerWrite(async () => {
    const state = getState();
    const index = contemptIndex(state, id);
    if (index < 0) return ui.notifications.warn("That Contempt row is no longer on the tracker.");
    state.contempt.splice(index, 1);
    stampContemptIds(state);
    await setState(state);
  });
}

async function resetYear() {
  if (!game.user.isGM) return;
  const confirmed = await Dialog.confirm({
    title: "Reset Quiet Year?",
    content: "<p>This resets all four seasonal decks and clears the play-surface tracker. It does not erase the Cobalt Reach map or journals.</p>"
  });
  if (!confirmed) return;
  // The confirm deliberately sits outside the queue — waiting on a human there
  // would hold every other write open — but the reset itself has to take its
  // turn, or a Draw Week still awaiting its card updates will write its
  // pre-reset state back over the cleared tracker.
  return queueTrackerWrite(async () => {
    for (const seasonKey of SEASON_ORDER) {
      const deck = getDeck(seasonKey);
      if (deck) await deck.updateEmbeddedDocuments("Card", deck.cards.map(c => ({ _id: c.id, drawn: false })));
    }
    // Stamped for the same reason migrateContemptIds() exists: a fresh state
    // carries no ids, and rows should not change identity under a surface that
    // has already drawn them.
    await setState(stampContemptIds(freshState()));
    ui.notifications.info("Quiet Year decks and tracker reset.");
  });
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

  // A render arrives whenever anyone writes, so anything the local user has put
  // into the DOM has to survive one. Drafts and the caret are handled below;
  // this covers the history's disclosure state and how far they have scrolled
  // into it, neither of which is a form field.
  _captureDisclosure(root) {
    return [...root.querySelectorAll("details")].map(el => ({
      open: el.open,
      scroll: el.querySelector(".qyc-history-list")?.scrollTop || 0
    }));
  }

  _restoreDisclosure(root, snapshot) {
    if (!snapshot) return;
    [...root.querySelectorAll("details")].forEach((el, index) => {
      const state = snapshot[index];
      if (!state) return;
      el.open = state.open;
      const list = el.querySelector(".qyc-history-list");
      if (list) list.scrollTop = state.scroll;
    });
  }

  _captureFormState() {
    const root = this.element?.[0];
    if (!root) return null;
    const values = {};
    for (const name of this._dirtyFields) {
      const el = root.querySelector(`[name="${name}"]`);
      if (el) values[name] = el.value;
    }
    const disclosure = this._captureDisclosure(root);
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
    return { values, focus, disclosure };
  }

  _restoreFormState(snapshot) {
    const root = this.element?.[0];
    if (!snapshot || !root) return;
    this._restoreDisclosure(root, snapshot.disclosure);
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
    const week = currentWeek(state);
    const allowance = week?.allowance || 1;
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
          statusLabel: PROJECT_STATUS_LABELS[status],
          field: `project-${project.id}-name`
        };
      }),
      // Several cards branch on "if there are no projects underway", so the
      // notice has to key off the active ones, not off an empty list.
      hasActiveProjects: activeProjects(state).length > 0,
      contempt: (state.contempt || []).map((entry, index) => {
        const id = contemptId(entry, index);
        return { id, name: entry.name, count: Number(entry.count || 0), field: `contempt-${id}-name` };
      }),
      // Players reach the world setting only through socketlib; without it the
      // tokens stay GM-operated rather than looking clickable and doing nothing.
      canAdjustContempt: game.user.isGM || !!contemptSocket,
      seasonLabel: SEASON_LABELS[seasonKey],
      remaining: seasonRemaining(seasonKey),
      currentCard: state.currentCard,
      hasCurrentCard: !!state.currentCard,
      gameOver: !!state.gameOver,
      week: state.week || 0,
      hasWeek: !!state.week,
      // Both the record of this week and what is still open on it.
      weekActions: (week?.actions || []).map((kind, index) => ({ index, label: WEEK_ACTIONS[kind] })),
      // Summer's King is the only card that grants two, so the count is worth
      // spelling out only when there is more than one to take.
      allowanceLabel: allowance > 1 ? `${(week?.actions || []).length} of ${allowance} actions taken` : "",
      canTakeAction: game.user.isGM && !!week && (week.actions || []).length < allowance,
      log: [...(state.log || [])].reverse().map(entry => ({
        week: entry.week,
        season: SEASON_LABELS[entry.season],
        card: entry.card,
        actions: (entry.actions || []).map(kind => WEEK_ACTIONS[kind]).join(", ")
      })),
      hasLog: !!(state.log || []).length,
      actionChoices: Object.entries(WEEK_ACTIONS)
        .filter(([kind]) => kind !== "project")
        .map(([kind, label]) => ({ kind, label })),
      resources: Object.entries(RESOURCE_LISTS).map(([kind, label]) => ({
        kind,
        // The keys are already the plurals the columns are headed with.
        label: kind.charAt(0).toUpperCase() + kind.slice(1),
        placeholder: `New ${label.toLowerCase()}`,
        newField: `new-${kind}`,
        entries: (state[kind] || []).map((value, index) => ({ kind, value, index, field: `${kind}-${index}` }))
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const root = html[0] ?? html;

    root.querySelectorAll("input[type='text'], input[type='number'], textarea").forEach(el => {
      if (el.name) el.addEventListener("input", () => this._dirtyFields.add(el.name));
    });

    root.querySelectorAll("[data-week-action]").forEach(el => el.addEventListener("click", ev => {
      const button = ev.currentTarget;
      recordAction(button.dataset.weekAction, { week: Number(button.dataset.week) }).catch(reportTrackerFailure);
    }));

    root.querySelectorAll("[data-week-action-undo]").forEach(el => el.addEventListener("click", ev => {
      undoAction(Number(ev.currentTarget.dataset.weekActionUndo)).catch(reportTrackerFailure);
    }));

    root.querySelector('[data-action="draw"]')?.addEventListener("click", () => drawWeek().catch(reportTrackerFailure));
    root.querySelector('[data-action="tick-projects"]')?.addEventListener("click", () => tickProjects().catch(reportTrackerFailure));
    root.querySelector('[data-action="reset"]')?.addEventListener("click", () => resetYear().catch(reportTrackerFailure));

    // The form is read here, synchronously, and only the state change is
    // queued. `root` belongs to the render that bound this listener, and a
    // render landing while the queue drains detaches it — a deferred read would
    // then take its values from a dead node, including drafts _restoreFormState
    // has already discarded in favour of someone else's committed value.
    // Everything on this surface now commits as it is edited, so there is no
    // save step left to get wrong: an in-place field writes when it loses
    // focus or takes an Enter, and the add and remove buttons write outright.
    const commitField = (input, write) => {
      if (input.value === this._renderedValues[input.name]) return this._clearDirty(input.name);
      this._clearDirty(input.name);
      write(input.value).catch(reportTrackerFailure);
    };

    // Not the `change` event: _restoreFormState writes a surviving draft back
    // with `el.value = …`, which resets what the element believes it held at
    // the last change. A name typed before a render from another client and
    // blurred after it would fire no change event at all and be lost.
    const commitOnBlur = (selector, write) => {
      root.querySelectorAll(selector).forEach(el => {
        el.addEventListener("blur", ev => commitField(ev.currentTarget, value => write(ev.currentTarget, value)));
        el.addEventListener("keydown", ev => {
          if (ev.key === "Enter") ev.currentTarget.blur();
        });
      });
    };

    commitOnBlur("[data-project-rename]", (el, value) => renameProject(el.dataset.projectRename, value));

    commitOnBlur("[data-contempt-rename]", (el, value) => renameContemptRow(el.dataset.contemptRename, value));

    commitOnBlur("[data-resource-edit]", (el, value) => {
      const [kind, index] = el.dataset.resourceEdit.split(":");
      return renameResource(kind, Number(index), value, el.dataset.resourcePrevious);
    });

    // Mousedown on the trash button blurs the row's field first, so an edit the
    // GM never committed is already on its way through the queue by the time
    // the removal runs — and both are serialized, so it lands first. Taking the
    // guard value from the field as it stands now rather than from the render
    // means the removal still finds the row it was pointed at.
    root.querySelectorAll("[data-resource-remove]").forEach(el => el.addEventListener("click", ev => {
      const button = ev.currentTarget;
      const [kind, index] = button.dataset.resourceRemove.split(":");
      const field = button.closest(".qyc-resource-row")?.querySelector("input");
      const previous = field ? field.value.trim() : button.dataset.resourcePrevious;
      removeResource(kind, Number(index), previous).catch(reportTrackerFailure);
    }));

    // Every other field here commits on Enter, so the add boxes do too.
    root.querySelectorAll("[data-add-on-enter]").forEach(el => el.addEventListener("keydown", ev => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      root.querySelector(ev.currentTarget.dataset.addOnEnter)?.click();
    }));

    root.querySelectorAll("[data-resource-add]").forEach(el => el.addEventListener("click", ev => {
      if (!game.user.isGM) return;
      const kind = ev.currentTarget.dataset.resourceAdd;
      const field = `new-${kind}`;
      const input = root.querySelector(`[name="${field}"]`);
      const value = input?.value ?? "";
      this._clearDirty(field);
      if (input) input.value = "";
      addResource(kind, value).catch(reportTrackerFailure);
    }));

    // The form is read here, synchronously, and only the state change is
    // queued: `root` belongs to this render, and a render landing while the
    // queue drains detaches it.
    root.querySelector('[data-action="add-project"]')?.addEventListener("click", ev => {
      if (!game.user.isGM) return;
      const name = root.querySelector('[name="new-project-name"]')?.value?.trim();
      const weeks = Number(root.querySelector('[name="new-project-weeks"]')?.value || 1);
      // The week as it was on screen when the button was pressed.
      const week = Number(ev.currentTarget.dataset.week) || undefined;
      if (!name) return ui.notifications.warn("Give the project a name.");
      this._clearDirty("new-project-name", "new-project-weeks");
      queueTrackerWrite(async () => {
        const state = getState();
        state.projects.push({ id: foundry.utils.randomID(), name, weeks: Math.min(6, Math.max(1, weeks)), status: "active" });
        await setState(state);
      })
        // Silent: several cards call for a project as part of their own prompt
        // rather than as the week's action, and the chip can be taken off again
        // when this was one of those.
        .then(() => recordAction("project", { week, silent: true }))
        .catch(reportTrackerFailure);
    });

    root.querySelectorAll("[data-project-weeks]").forEach(el => el.addEventListener("click", ev => {
      const [id, delta] = ev.currentTarget.dataset.projectWeeks.split(":");
      adjustProjectWeeks(id, Number(delta)).catch(reportTrackerFailure);
    }));

    // Winter 6's "all remaining projects are reduced by 2 this week" — the
    // weekly tick with a different number of weeks.
    root.querySelector('[data-action="reduce-projects"]')?.addEventListener("click", () => {
      if (!game.user.isGM) return;
      const weeks = Number(root.querySelector('[name="reduce-weeks"]')?.value || 2);
      this._clearDirty("reduce-weeks");
      tickProjects(weeks).catch(reportTrackerFailure);
    });

    root.querySelectorAll('[data-project-finish]').forEach(el => el.addEventListener("click", ev => {
      setProjectStatus(ev.currentTarget.dataset.projectFinish, "completed").catch(reportTrackerFailure);
    }));

    root.querySelectorAll('[data-project-cancel]').forEach(el => el.addEventListener("click", ev => {
      setProjectStatus(ev.currentTarget.dataset.projectCancel, "cancelled").catch(reportTrackerFailure);
    }));

    root.querySelectorAll('[data-project-remove]').forEach(el => el.addEventListener("click", ev => {
      const id = ev.currentTarget.dataset.projectRemove;
      queueTrackerWrite(async () => {
        if (!game.user.isGM) return;
        const state = getState();
        state.projects = state.projects.filter(p => p.id !== id);
        await setState(state);
      }).catch(reportTrackerFailure);
    }));

    root.querySelector('[data-action="add-contempt"]')?.addEventListener("click", () => {
      addContemptRow().catch(reportTrackerFailure);
    });

    root.querySelectorAll('[data-contempt]').forEach(el => el.addEventListener("click", ev => {
      const [id, delta] = ev.currentTarget.dataset.contempt.split(":");
      adjustContempt(id, Number(delta)).catch(reportTrackerFailure);
    }));

    root.querySelectorAll('[data-contempt-remove]').forEach(el => el.addEventListener("click", ev => {
      removeContemptRow(ev.currentTarget.dataset.contemptRemove).catch(reportTrackerFailure);
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
  window.QuietYearCobalt = { installKit, openPlaySurface, drawWeek, tickProjects, setProjectStatus, resetYear, adjustProjectWeeks, renameProject, recordAction, adjustContempt, renameContemptRow,
    addResource, renameResource, removeResource, SEASONS, app: null };
  registerRealtimeHooks();
  if (!game.user.isGM) return;
  await migrateWeekNumber();
  await migrateContemptIds();
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
