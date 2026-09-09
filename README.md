# Quiet Year — Cobalt Reach Kit (Foundry VTT v14)

Personal-use helper module for running *The Quiet Year* inside an existing Foundry world (including an Ironsworn: Starforged world).

## What v0.1 creates

When enabled, the GM can install the kit into the current world. It creates:

- **Quiet Year — Spring** card deck (Hearts)
- **Quiet Year — Summer** card deck (Diamonds)
- **Quiet Year — Autumn** card deck (Clubs)
- **Quiet Year — Winter** card deck (Spades)
- **Quiet Year — Rules & Turn Summary** journal
- **Cobalt Reach — Quiet Year Setup** journal
- **Quiet Year — Cobalt Reach** blank gridless collaborative Scene
- **Quiet Year: Install / Repair Kit** macro

All created documents are tagged with the module flag `quiet-year` so the installer can find them without relying on names alone.

## Install

1. Copy the entire `quiet-year` folder into your Foundry user-data `Data/modules/` directory.
2. Restart Foundry.
3. Open the existing Starforged world.
4. Enable **Quiet Year — Cobalt Reach Kit** under Manage Modules, along with **socketlib**, which it depends on. socketlib is what lets a player take and discard their own Contempt: world settings are GM-write-only, so a player's click is relayed to a GM client.
5. As GM, accept the one-time prompt to install the kit.

Note that the module declares `"socket": true`, which Foundry reads when the **world is launched**. If you add or update this module while a world is running, relaunch the world — reloading the browser is not enough, and Contempt will stay GM-operated until you do.

If you dismiss the prompt, run the macro **Quiet Year: Install / Repair Kit**.

## How to use the decks

The original game separates the deck by season and shuffles each suit separately. These four Foundry decks mirror that setup. Start with Spring, then Summer, Autumn, and Winter. **The Winter King ends the game immediately.**

This v0.1 intentionally leaves map drawing to Foundry's native Drawing tools. That keeps the module system-agnostic and avoids interfering with the Starforged system.

## Two-player / sector-scale note

The rules support two players. For Cobalt Reach, the setup journal includes the optional house tweak discussed for sector-scale play: each player may nominate two strategically important resources, then choose one total Abundance and treat the other three as Scarcities.

## Caveats

- This is a personal-use helper, not an official or distributable Quiet Year product.
- Card text was transcribed from the user's copy of the game for private use.
- v0.1 creates world documents rather than shipping binary LevelDB compendium packs. This makes it much easier to add directly to an already-running Starforged world. A later version can package the same source documents into true module compendia using Foundry's official CLI.


## 0.1.1
- Fix Foundry v14 Card validation: card `value` is now numeric (Ace=1, Jack=11, Queen=12, King=13).
- Omit null image/origin values from Card source data.
- Repair installer now reports per-season deck failures and only marks installation complete when all four decks exist.


## v0.2.1

- The floating play surface window is now titled simply **The Quiet Year**, making the interface reusable in non-Cobalt Reach worlds.
