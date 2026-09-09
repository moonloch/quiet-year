# Content files

*The Quiet Year* is by Avery Alder, published by Buried Without Ceremony. Its
text is not this module's to distribute, so the module does not carry it. This
directory is where you put your own transcription, from your own copy.

Everything in here except this file is gitignored. A clone of this repository
contains none of the game's text, and a populated `content/` cannot be
committed by accident.

## What goes here

| File | Holds |
| --- | --- |
| `spring.json` | The thirteen Hearts prompts |
| `summer.json` | The thirteen Diamonds prompts |
| `autumn.json` | The thirteen Clubs prompts |
| `winter.json` | The thirteen Spades prompts |
| `rules.html` | The turn structure and action summary for the reference journal |

## Deck format

One JSON file per season. `season` is the season key; `cards` is an array of
thirteen entries.

```json
{
  "season": "spring",
  "cards": [
    {
      "rank": "A",
      "prompt": "The text of the card.",
      "alternate": "The text of the card's second option."
    },
    {
      "rank": "2",
      "prompt": "A card with only one option.",
      "alternate": null
    }
  ]
}
```

- **`rank`** — one of `A 2 3 4 5 6 7 8 9 10 J Q K`. Order in the file does not
  matter; the deck is built in rank order regardless. Each rank may appear once.
- **`prompt`** — the card's text. Required.
- **`alternate`** — the card's second option, or `null` if it has only one.

Both text fields are **plain text, not HTML**. Write `&` and `<` as themselves;
the module escapes them when it builds the card. Line breaks inside a field are
not significant.

The module supplies everything around the text: the suit and its season, the
card's name and value, the back, and the *or…* divider between the two options.

## Rules format

`rules.html` is an HTML fragment — no `<html>` or `<body>` wrapper. It becomes
the body of the **Table Reference** page in the *Quiet Year — Rules & Turn
Summary* journal. Ordinary headings, paragraphs and lists are all that is
needed:

```html
<p><strong>Each week:</strong></p>
<ol><li>…</li></ol>
<h2>Discover Something New</h2>
<p>…</p>
```

Foundry sanitizes stored HTML, so a tag it does not allow will be dropped.

You do not need to write a credit line into this file. The module appends its
own below whatever is here, naming Avery Alder, Buried Without Ceremony and the
publisher's page, so the journal credits the game whether or not you supply
`rules.html` at all.

## If a file is missing

Nothing breaks. The installer says which files it could not find, and:

- A deck with no content file is still created, with all thirteen cards in the
  right suit and rank order — they simply have no prompt text. Drawing still
  works, and the week still advances.
- A deck whose file is present but incomplete gets the cards it can, and the
  rest are created without text. The console names the ranks it could not fill.
- With no `rules.html`, the reference journal is created holding a note saying
  where to put the file. If that journal **already** has its text, it is left
  alone — the installer never replaces real rules text with the note.

Once you add a missing file, run **Quiet Year: Install / Repair Kit** again.
A deck that already exists is never rewritten, though, because its cards carry
which ones have been drawn — the record of the year so far. To pick up new text
for a season already installed, delete that deck and run the repair.

## What stays in the repository

The *Cobalt Reach — Quiet Year Setup* journal is original writing about reading
the map at sector scale for this campaign, not reproduced game text, so it
lives in the module source rather than here.
