# Quiet Year — Cobalt Reach Kit (Foundry VTT v14)

Personal-use helper module for running *The Quiet Year* inside an existing Foundry world (including an Ironsworn: Starforged world).

*The Quiet Year* is by Avery Alder, published by Buried Without Ceremony. **This repository contains none of the game's text.** The card prompts and the rules summary are read at install time from `content/`, which you fill in from your own copy — see [`content/README.md`](content/README.md) for the format. The module supplies only the machinery around them.

## What the kit installs

When enabled, the GM can install the kit into the current world. It creates:

- **Quiet Year — Spring** card deck (Hearts)
- **Quiet Year — Summer** card deck (Diamonds)
- **Quiet Year — Autumn** card deck (Clubs)
- **Quiet Year — Winter** card deck (Spades)
- **Quiet Year — Rules & Turn Summary** journal
- **Cobalt Reach — Quiet Year Setup** journal
- **Quiet Year — Cobalt Reach** blank gridless collaborative Scene
- **Quiet Year: Install / Repair Kit** macro
- **Quiet Year: Open Play Surface** macro

All created documents are tagged with the module flag `quiet-year` so the installer can find them without relying on names alone. Re-running the installer repairs what is missing and never duplicates what is there.

The decks and the rules journal take their text from `content/`. Without it the kit still installs and still runs: each deck is created with all thirteen cards in the right suit and rank order, simply without prompts, and the rules journal holds a note saying where to put the file. The installer names whatever is missing rather than failing.

## Install

1. Copy the entire `quiet-year` folder into your Foundry user-data `Data/modules/` directory.
2. Restart Foundry.
3. Open the existing Starforged world.
4. Install **socketlib** from Foundry's module browser if you do not already have it. This kit requires it and declares the dependency, but without a manifest URL Foundry cannot offer to fetch it for you — it will simply refuse to enable the kit until socketlib is present. socketlib is what lets a player take and discard Contempt: world settings are GM-write-only, so a player's click is relayed to a GM client.
5. Enable **Quiet Year — Cobalt Reach Kit** and **socketlib** under Manage Modules.
6. Fill in `content/` from your own copy of the game — the format is documented in [`content/README.md`](content/README.md). You can skip this and do it later; see above for what the kit does without it.
7. As GM, accept the one-time prompt to install the kit.

Note that the module declares `"socket": true`, which Foundry reads when the **world is launched**. If you add or update this module while a world is running, relaunch the world — reloading the browser is not enough, and Contempt will stay GM-operated until you do.

If you dismiss the prompt, run the macro **Quiet Year: Install / Repair Kit**.

## The play surface

Open it from the **Q** tab in the sidebar, or with the **Quiet Year: Open Play Surface** macro. It is a floating window that every connected client sees, kept in step live — a GM's change appears on the players' screens without a reload. It tracks:

- **The week.** A counter, the season, how many cards remain in it, and the turn order reminder (play a card → adjust project dice → take an action). **Draw Week** draws at random from the season's undrawn cards and shows the card's full text.
- **The week's action.** One of *discovered something new*, *held a discussion* or *started a project*, recorded against that week — Summer's King allows two. Starting a project records itself. An action recorded by mistake can be taken back.
- **Projects.** Each carries its countdown die. **Tick Projects** advances every active one by a week; individual projects can be nudged up or down, renamed in place, finished early, failed, or deleted. A failed project stays on the surface, struck through and holding the weeks it had left, as the record of where it stood. There is also a control to reduce every project by a fixed number of weeks, for the cards that call for it.
- **Abundances and Scarcities**, as two editable lists — add, rename in place, remove.
- **Contempt**, a row per player with a running count. Players work the rows themselves rather than asking the GM to click for them: the ± buttons are enabled for everyone, and a player's click is relayed to a GM client. Any player can adjust any row — it is a shared, table-facing signal, not a permission boundary. The GM adds, renames and removes rows.
- **The year so far** — a collapsible log of every week: the card drawn and what was done that week.
- **Reset Year**, which clears the tracker and returns all four decks to undrawn.

Players see the same surface, read-only apart from Contempt.

## How to use the decks

The original game separates the deck by season and shuffles each suit separately. These four Foundry decks mirror that setup. Start with Spring, then Summer, Autumn, and Winter. **The Winter King ends the game immediately.**

The kit intentionally leaves map drawing to Foundry's native Drawing tools. That keeps the module system-agnostic and avoids interfering with the Starforged system.

## Two-player / sector-scale note

The rules support two players. For Cobalt Reach, the setup journal includes the optional house tweak discussed for sector-scale play: each player may nominate two strategically important resources, then choose one total Abundance and treat the other three as Scarcities.

## Caveats

- This is a personal-use helper, not an official or distributable Quiet Year product.
- The game's text is not distributed with this module. `content/` is gitignored, so a clone carries none of it, and the owner supplies their own transcription. The *Cobalt Reach — Quiet Year Setup* journal is original writing about sector-scale play and does live in the source.
- A deck that already exists is never rewritten by a repair run, because its cards carry which have been drawn — the record of the year so far. To pick up new or corrected text for a season already installed, delete that deck and repair.
- The kit creates world documents rather than shipping binary LevelDB compendium packs. This makes it much easier to add directly to an already-running Starforged world. A later version can package the same source documents into true module compendia using Foundry's official CLI.

## Changelog

### 0.4.0
- The card prompts and rules summary moved out of the module source into `content/`, which is gitignored and filled in by the owner from their own copy. The repository no longer contains the game's text.
- The kit installs and runs without that content: decks are created structurally complete but textless, and the installer says exactly which files it could not find.
- The GM can take back a **Draw Week** or a **Tick Projects**, ten deep, including Summer's King and the two cards it discards at random.
- Fixed: Summer's King drawn with exactly two Summer cards remaining discarded one card where the rules call for two.

### 0.3.0
- The play surface is live for everyone: a change on one client appears on every other without a reload.
- Opened from a **Q** tab in the sidebar as well as from its macro.
- The week is numbered, and each week records what was done in it — discovered something new, held a discussion, or started a project. **The year so far** collects them.
- Projects can be renamed in place, nudged a week either way, finished early, or failed. A failed project stays on the surface as the record of where it stood.
- Abundances and Scarcities are structured lists rather than free text.
- Contempt has a roster, and players take and discard their own.
- Re-running the installer now repairs the kit's journals as well as its decks, scene and macros. A page you have written in is left alone; a page that has gone is put back.

### 0.2.1
- The floating play surface window is now titled simply **The Quiet Year**, making the interface reusable in non-Cobalt Reach worlds.

### 0.1.1
- Fix Foundry v14 Card validation: card `value` is now numeric (Ace=1, Jack=11, Queen=12, King=13).
- Omit null image/origin values from Card source data.
- Repair installer now reports per-season deck failures and only marks installation complete when all four decks exist.
