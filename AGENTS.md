# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

1. The world setting `quiet-year.state` — season, current card, projects, abundances/scarcities, contempt, game-over flag. Read through `getState()` (merged over `freshState()`, so missing keys are tolerated) and written only through `setState()`.
2. The four `Cards` decks' per-card `drawn` flags — the authority on which cards remain. `seasonRemaining()` derives the "N cards remain" count from these, not from module state, so card updates propagate as their own document events.

**Live sync across clients.** Every refresh funnels through the debounced `refreshPlaySurface()`, fed by three sources: the state setting's `onChange` (Foundry calls it on every client, covering both writes and the create on the first write in a fresh world), a `deleteSetting` hook (the one case `onChange` is not called for), and the `createCard`/`updateCard`/`deleteCard`/`updateCards` hooks filtered to the kit's own decks. `setState()` calls the same helper so local and remote paths behave identically, and the debounce collapses a draw's setting write plus card updates into one render. `registerRealtimeHooks()` is called from `ready` **before** the GM-only early return — players need it most.

**Uncommitted input survives re-renders.** Since a render can now arrive at any moment from another client, the app tracks which fields the local user has typed into (`_dirtyFields`) and `_render` carries those values, the focus, and the caret across the render. Committing via Save Trackers or Add Project clears the flags so incoming state wins again. Anything new that edits on Save rather than on change needs the same treatment.

**Everything is idempotent and flag-tagged.** The `ensureDeck`/`ensureJournal`/`ensureScene`/`ensureMacro` helpers find existing documents by `getFlag(MODULE_ID, …)` rather than by name, so `installKit()` doubles as the repair path and re-running it never duplicates.

**GM-only writes.** Players cannot write world-scoped settings, so every mutating action returns early for non-GMs and the template disables their controls. Propagation to players is read-only by design; no permission changes or socket messages are involved.

`window.QuietYearCobalt` is the public surface (`installKit`, `openPlaySurface`, `drawWeek`, `tickProjects`, `resetYear`, and the live `app`). The generated macros call into it, so keep those names stable.

## Rules fidelity

The seasonal decks are drawn from randomly among undrawn cards, which is equivalent to shuffling once and drawing from the top — see the comments in `drawWeek()`. Two card effects are special-cased and should stay that way: the **King of Summer** discards two further Summer cards (two actions that week), and the **King of Winter** ends the game immediately.

## Known deprecation

The play surface extends the V1 `Application` and the prompts use V1 `Dialog`; Foundry v14 warns both will be removed. Migration to ApplicationV2 is outstanding — the `foundryvtt-dev` plugin (enabled in `.claude/settings.json`) ships an `appv2` skill covering it.
