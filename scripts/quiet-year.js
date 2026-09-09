const MODULE_ID = "quiet-year-cobalt";

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

async function ensureJournal(name, key, html) {
  let journal = game.journal.find(j => j.getFlag(MODULE_ID, "key") === key);
  if (journal) return journal;
  journal = await JournalEntry.create({
    name,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
    flags: { [MODULE_ID]: { key, createdByKit: true } },
    pages: [{
      name,
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
  if (window.QuietYearCobalt?.app?.rendered) window.QuietYearCobalt.app.render(false);
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

async function tickProjects() {
  if (!game.user.isGM) return ui.notifications.warn("The GM controls the project tracker.");
  const state = getState();
  const completed = [];
  for (const project of state.projects) {
    if (!project.completed && Number(project.weeks) > 0) {
      project.weeks = Math.max(0, Number(project.weeks) - 1);
      if (project.weeks === 0) {
        project.completed = true;
        completed.push(project.name);
      }
    }
  }
  await setState(state);
  if (completed.length) ui.notifications.info(`Project${completed.length > 1 ? "s" : ""} complete: ${completed.join(", ")}`);
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

  getData() {
    const state = getState();
    const seasonKey = state.season || "spring";
    return {
      isGM: game.user.isGM,
      state,
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
      await setState(state);
      ui.notifications.info("Quiet Year trackers saved.");
    });

    root.querySelector('[data-action="add-project"]')?.addEventListener("click", async () => {
      if (!game.user.isGM) return;
      const name = root.querySelector('[name="new-project-name"]')?.value?.trim();
      const weeks = Number(root.querySelector('[name="new-project-weeks"]')?.value || 1);
      if (!name) return ui.notifications.warn("Give the project a name.");
      const state = getState();
      state.projects.push({ id: foundry.utils.randomID(), name, weeks: Math.min(6, Math.max(1, weeks)), completed: false });
      await setState(state);
    });

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

const rulesHtml = `
<p>The Quiet Year is by Avery Alder, published by Buried Without Ceremony. Its text is not this module’s to carry. Put your own transcription in content/rules.html.</p>`;

const setupHtml = `
<h1>Cobalt Reach — Quiet Year Setup</h1>
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
  const rules = await ensureJournal("Quiet Year — Rules & Turn Summary", "rules", rulesHtml);
  const setup = await ensureJournal("Cobalt Reach — Quiet Year Setup", "setup", setupHtml);
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
    default: freshState()
  });
});

Hooks.once("ready", async () => {
  window.QuietYearCobalt = { installKit, openPlaySurface, drawWeek, tickProjects, resetYear, SEASONS, app: null };
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
