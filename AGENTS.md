# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

A personal-use Foundry VTT v14 module that runs *The Quiet Year* inside an existing world. Plain JavaScript loaded as a classic script — no build step, no bundler, no package.json.

## Project rulings

- **No i18n.** User-facing strings stay hardcoded English. Do not add a `lang/` directory, `game.i18n.localize`/`format` calls, or localization keys, and do not flag their absence in review. This overrides the general FoundryVTT guidance (including the `foundryvtt-dev` plugin's skills) that all user-facing text must be localized.
- Personal-use helper, not a distributable product. Card text was transcribed from the author's copy of the game.

## The module id is load-bearing

`MODULE_ID` in `scripts/quiet-year.js`, the `id` in `module.json`, and the containing **directory name** must all be `quiet-year`. Foundry refuses to load a package whose id does not match its directory:

```
Invalid module "quiet-year-cobalt" detected in directory "quiet-year"
```

`MODULE_ID` also determines the settings namespace, the flags stamped on every document the installer creates, and the template path. Changing it orphans the settings and documents of any world that ran the old id.

## Running it

There is no test suite, linter, or build. Verify changes in a live Foundry:

```bash
node ~/Applications/foundry-14/main.js \
  --dataPath=/Users/timlwhite/FoundryVTT-Next --port=30001 --world=v14 --noupnp
```

Port 30000 is occupied by WebStorm's `cef_server`. The `v14` world is the scratch world and has exactly two users, `Gamemaster` and `Player`. `node --check scripts/quiet-year.js` is the only static check available.

Testing multi-client behaviour needs two real sessions — Foundry's session cookie is per browser profile, so two tabs in one profile are the *same* user. With the chrome-devtools MCP, `new_page` with distinct `isolatedContext` values gives two independent sessions in one browser.

**Gotcha when driving it headlessly:** a backgrounded tab has its animation frames paused, so Foundry does not flush that client's document writes until the tab is woken. Driving the GM in a background tab makes every update look like it arrives one action late. Keep the acting tab in front (`select_page` with `bringToFront`) before measuring anything.

## Architecture

Everything lives in `scripts/quiet-year.js`, in four parts: the `SEASONS` card data, the idempotent installer, the state model, and the play-surface Application.

**Two sources of truth.** The play surface renders from both, and anything that keeps it current has to watch both:

1. The world setting `quiet-year.state` — season, current card, projects, abundances/scarcities (plain string arrays, edited as structured lists and addressed by position with the drawn value as a guard), contempt, game-over flag. Read through `getState()` (merged over `freshState()`, so missing keys are tolerated) and written only through `setState()`.

   A project carries a `status` of `active`, `completed` or `cancelled`. `mergeObject` replaces arrays wholesale rather than recursing into them, so projects saved before that field existed arrive still shaped `{ id, name, weeks, completed }` — read the status through `projectStatus()`, which falls back to the old boolean, and never test `project.status` or `project.completed` directly. Only `active` projects tick, and only they count towards the cards' "no projects underway" test; a cancelled one keeps the weeks it had left as the record of where it stood.
2. The four `Cards` decks' per-card `drawn` flags — the authority on which cards remain. `seasonRemaining()` derives the "N cards remain" count from these, not from module state, so card updates propagate as their own document events.

**Live sync across clients.** Every refresh funnels through the debounced `refreshPlaySurface()`, fed by three sources: the state setting's `onChange` (Foundry calls it on every client, covering both writes and the create on the first write in a fresh world), a `deleteSetting` hook (the one case `onChange` is not called for), and the `createCard`/`updateCard`/`deleteCard`/`updateCards` hooks filtered to the kit's own decks. `setState()` calls the same helper so local and remote paths behave identically, and the debounce collapses a draw's setting write plus card updates into one render. `registerRealtimeHooks()` is called from `ready` **before** the GM-only early return — players need it most.

**Uncommitted input survives re-renders — and so does anything else the local user put in the DOM.** Since a render can now arrive at any moment from another client, the app tracks which fields the local user has typed into (`_dirtyFields`) and `_render` carries those values, the focus, and the caret across the render. Committing clears the flags so incoming state wins again, and any new field needs the same treatment.

There is no save button left: project names, resource entries and player names commit through `commitOnBlur()` when they lose focus or take an Enter, and every other control writes outright. That helper deliberately does **not** use the `change` event — `_restoreFormState` writes a surviving draft back with `el.value = …`, which resets what the element believes it held at the last change, so a value typed before a render from another client and blurred after it would fire no change event at all and be silently lost. It compares against `_renderedValues` instead. A write that declines to happen (a blank name, a row that has gone) must call `refreshPlaySurface()`, or the field keeps showing a value the world does not have.

State that is not a form field needs carrying too: `_captureDisclosure`/`_restoreDisclosure` hold the history's `<details>` open and its scroll position, which any other client's write would otherwise snap shut mid-read. Anything similar added later belongs there.

An action queued from a click must carry what it was aimed at rather than resolving it when it runs. `recordAction()` takes the week number from the button that was on screen: the queue can put a draw in front of it, and "the current week" by then is the next one — which would record the action against the wrong week and spend that week's allowance.

**Weeks are counted, not derived.** `state.week` advances in `drawWeek()` and `state.log` gains an entry per week — the card drawn and the actions taken against it. The count follows prompts resolved rather than cards marked drawn, because Summer's King discards two further cards that are not weeks of their own; that card instead sets the week's `allowance` to 2. A game saved before the counter existed is seeded once from the cards already drawn across all four decks (`migrateWeekNumber()`), which is an approximation — the true number is not recoverable — but better than sending an in-progress year back to week 1.

**Serialized actions must not await each other.** `serialized()` puts an action's whole body in the shared write queue, so one calling another would wait for a turn that cannot come until it returns. Chain them from the caller instead — Add Project records the week's action with `.then(() => recordAction(…))`, not from inside the queued task.

**Everything is idempotent and flag-tagged.** The `ensureDeck`/`ensureJournal`/`ensureScene`/`ensureMacro` helpers find existing documents by `getFlag(MODULE_ID, …)` rather than by name, so `installKit()` doubles as the repair path and re-running it never duplicates.

**GM-only writes, with one exception.** Players cannot write world-scoped settings, so every mutating action returns early for non-GMs and the template disables their controls. Contempt is the exception: the rules make taking it the player's own move, so `adjustContempt()` relays a non-GM click to a GM client through **socketlib**, which performs the write there. Any player may adjust any row — the rows are a shared table-facing signal and this is a trust-based game. Everything else stays read-only for players.

**`"socket": true` needs a world relaunch.** socketlib's `registerModule()` refuses a module whose manifest does not declare `socket`, and Foundry reads that field when the **world is launched** — restarting the browser, or even the whole client, changes nothing. Symptom: `socketlib.modules` is empty, `registerModule()` logs to the console and returns `undefined`, and the play surface falls back to GM-only Contempt. Patching `game.modules.get(MODULE_ID).socket = true` at runtime makes registration succeed on that client but the server still drops the relayed event, so it is not a way to test this without the relaunch.

`window.QuietYearCobalt` is the public surface (`installKit`, `openPlaySurface`, `drawWeek`, `tickProjects`, `resetYear`, and the live `app`). The generated macros call into it, so keep those names stable.

**The sidebar tab.** `QuietYearSidebarTab` is an ApplicationV2 tab registered by `registerSidebarTab()` from `init` — `CONFIG.ui[MODULE_ID]` supplies the class and `Sidebar.TABS[MODULE_ID]` the icon-strip entry, both of which `Game#initializeUI` reads between `setup` and `ready`. It renders for players as well as the GM and only launches things: the play surface, and the rules journal found by its `key: "rules"` flag. Its `tabName` is `MODULE_ID`, which is also the tab element's id and the `.quiet-year-sidebar` class the stylesheet hangs off.

## Two traps this file has already hit

**Top-level `const` is global.** `scripts/quiet-year.js` is a classic script, so every top-level `const`/`class` goes into the shared global lexical scope. Declaring one whose name matches a non-configurable global that Foundry already defines — `Sidebar`, and most other core class names — is a SyntaxError raised *before the first statement runs*, so the entire module silently fails to load with nothing in the console. Reach through the namespace (`foundry.applications.sidebar.Sidebar`) instead of destructuring core classes into locals.

**Core CSS is layered; ours is not.** Rules like `.tab[data-tab]:not(.active) { display: none }` live in a core `@layer`, and an unlayered module stylesheet outranks every layered rule regardless of specificity. An unconditional `display: flex` on a sidebar tab body would therefore show it underneath every other tab. Scope such rules to `.active` and to `.sidebar-popout .window-content`.

`rulesHtml` in `scripts/quiet-year.js` is the only copy of the rules-journal text. A Foundry export of the same journal used to sit at the project root; it was byte-identical to the constant and carried world-specific fields (`folder`, page `_id`, `_stats` naming the `foundry-ironsworn` system and a `starforged` world), so it was removed rather than kept as a second copy that could drift. Note that editing the constant does not update a journal that already exists — `ensureJournal` returns early on a hit (issue #8), so seeing a change means deleting the journal and re-running the installer.

Both journal constants open straight into content with no `<h1>`. A single-page journal already renders two headings — the sheet's title bar carries the journal name and the page carries its own — so a third in the HTML just stacks up. `ensureJournal` takes the page name separately for the same reason: pass something shorter than the journal name rather than repeating it.

## Rules fidelity

The seasonal decks are drawn from randomly among undrawn cards, which is equivalent to shuffling once and drawing from the top — see the comments in `drawWeek()`. Two card effects are special-cased and should stay that way: the **King of Summer** discards two further Summer cards (two actions that week), and the **King of Winter** ends the game immediately.

## Known deprecation

The play surface extends the V1 `Application` and the prompts use V1 `Dialog`; Foundry v14 warns both will be removed. Migration to ApplicationV2 is outstanding — the `foundryvtt-dev` plugin (enabled in `.claude/settings.json`) ships an `appv2` skill covering it.
