# Core X #1 — Undertale ver. · Claude Code Integrated Development Prompt

> **How to use this document**
> Place this single document at the root of your Claude Code project as `SPEC.md` (or `CLAUDE.md`), then instruct Claude Code: "Implement this game from start to finish according to this specification."
> Also add the accompanying `board_data.json` (board graph data) and `Core_X_Board.png` (original board image) to the project.
> Every game rule below is a finalized specification that has been validated by actually playing the 4-player board game.

---

## 0. Getting Started with Claude Code (Dev Environment)

This project is built with **pure HTML + Vanilla JS + CSS** — no build tools or frameworks. Node.js is needed only to run Claude Code and a local static server.

1. Confirm Node.js 18+ is installed (`node -v`)
2. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
   - Official docs: https://docs.claude.com/en/docs/claude-code/overview
3. Run `claude` in the project folder and instruct it to read this document
4. Local run/test: from the project folder run `python3 -m http.server 8000`, then open `http://localhost:8000` in a browser
   - ⚠️ Do NOT open `index.html` directly as a file (Firebase SDK CDN / module loading requires it). Always use a local server.

**Verification principles (Claude Code must follow):**
- Run `node --check js/*.js` for syntax validation at every step
- Validate game logic (turns/rounds/scoring) with headless Node simulation scripts before proceeding
- After each milestone, ask the user to confirm actual behavior in the browser

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| Title | Core X #1 — Undertale ver. |
| Genre | 4-player multiplayer Euro board game (web implementation) |
| Platform | Web browser (PC · mobile responsive) |
| Tech stack | HTML5 · Vanilla JavaScript (ES2020+) · CSS3 · Firebase Realtime Database |
| Playtime | 10–20 minutes per game |
| Tagline | "A 4-player board game where you travel with Frisk through Ruins, Snowdin, Waterfall, and Hotland to free Asriel at the Core" |

Base setting: UNDERTALE (Toby Fox) — Pacifist Route. The story begins right after Frisk falls into the Underground.

**Copyright note:** Do NOT use the actual OST or official character images. Replace sound with 8-bit Web Audio–generated tones or royalty-free tracks. Use placeholder pixel art for characters until the user provides actual images.

---

## 2. Players & Characters (Fixed at 4, one per faction)

| Player | Character | Faction | Faction Color |
|--------|-----------|---------|---------------|
| P1 | Toriel | RUINS | Red `#ff0000` |
| P2 | Papyrus | SNOWDIN | Blue `#0099ff` |
| P3 | Undyne | WATERFALL | Green `#15ff00` |
| P4 | Mettaton | HOTLAND | Yellow `#fbff00` |

> Each faction is one player's home, and the home has a soulful item **"Box" (storage)**.

### Character Upgrade Paths (via upgrade token at the Core)
- **Undyne** → Pre-Undying → Undyne the Undying
- **Mettaton** → Mettaton EX → Mettaton NEO → Mettaton NEO + Alphys
- Toriel and Papyrus have no character self-upgrades

---

## 3. Board Structure (Core)

The board is a graph of **43 cells**. **The movement unit is the "precise number"** (1–39 + 4 faction cells + Core).
All coordinates, adjacencies, and zone info live in `board_data.json` — **use that file as the single source of truth.** Coordinates are normalized to 0–1 relative to the original image (1414×2000).

### 3-1. Cell Types
- **4 faction home cells**: `RUINS`, `SNOWDIN`, `WATERFALL`, `HOTLAND` (each has a Box)
- **1 Core cell**: `CORE` (upgrade-only space)
- **38 regular cells**: precise numbers 1–39 (note: 20 is the Core, so it's excluded from regular cells)
- **Dead-end cells**: 10, 11, 30, 31 (the 4 faction cells also have only one connection)
- **4 Core gates**: 16, 17, 23, 24 — the Core can only be entered from these cells

### 3-2. Movement Rules
- One turn = move to a single adjacent cell (OR pick up). **Move OR pick-up is mutually exclusive** — only one per turn.
- **The Core can only be entered from a gate (16/17/23/24)**, and entering it also consumes one turn.
- When leaving the Core, you can only exit to the 4 gate cells (bidirectional).
- Entering a faction home: RUINS←1, HOTLAND←4, SNOWDIN←38, WATERFALL←39 (must pass through one designated cell).

### 3-3. Full Adjacency List (bidirectional, validated)

```
        1 : 5, 8, RUINS
        2 : 5, 13
        3 : 6, 14
        4 : 6, 7, HOTLAND
        5 : 1, 2, 9
        6 : 3, 4, 12
        7 : 4, 12
        8 : 1, 9
        9 : 5, 8
       10 : 16                 (dead-end)
       11 : 17                 (dead-end)
       12 : 6, 7, 14
       13 : 2, 15
       14 : 3, 12, 18
       15 : 13, 19
       16 : 10, 19, CORE       (Core gate)
       17 : 11, 21, CORE       (Core gate)
       18 : 14, 21
       19 : 15, 16, 22, 23
       21 : 17, 18, 24, 25
       22 : 19, 26
       23 : 19, 30, CORE       (Core gate)
       24 : 21, 31, CORE       (Core gate)
       25 : 21, 27
       26 : 22, 35
       27 : 25, 36
       28 : 29, 38
       29 : 28, 34
       30 : 23                 (dead-end)
       31 : 24                 (dead-end)
       32 : 33, 37
       33 : 32, 39
       34 : 29, 35
       35 : 26, 34
       36 : 27, 37
       37 : 32, 36
       38 : 28, SNOWDIN
       39 : 33, WATERFALL
    RUINS : 1
  HOTLAND : 4
  SNOWDIN : 38
WATERFALL : 39
     CORE : 16, 17, 23, 24
```

> Note: cell 20 (the Core) is numerically 20, but its node id is `CORE`. Follow `board_data.json` as the standard.

### 3-4. Simple Numbers (zones) — labels only (unrelated to movement)
Logical name labels used when referring to a region (e.g. "zone 7"). They have no effect on movement. Reference them for To-do / item placement.

| Simple number | Precise numbers |
|---------------|-----------------|
| RUINS | 1,2,5,8,9,13,15 (+ faction cell) |
| HOTLAND | 3,4,6,7,12,14,18 (+ faction cell) |
| WATERFALL | 25,27,32,33,36,37,39 (+ faction cell) |
| SNOWDIN | 22,26,28,29,34,35,38 (+ faction cell) |
| CORE | 20 |
| zone 1 | 19 |
| zone 2 | 10 |
| zone 3 | 11 |
| zone 4 | 21 |
| zone 5 | 30 |
| zone 6 | 31 |
| zone 7 | 16 |
| zone 8 | 17 |
| zone 9 | 23 |
| zone 10 | 24 |

### 3-5. Balance Note
Shortest distance from faction to Core: RUINS·HOTLAND = 8 turns / SNOWDIN·WATERFALL = 10 turns. The two top factions are 2 turns closer to the Core — **this is an intentional asymmetry, so do NOT arbitrarily modify the board graph.**

---

## 4. Core Game Loop

### Order of a single turn
```
① Move OR Pick up   (mutually exclusive, only one per turn)
      ↓
② (If at the Core) may perform an upgrade
      ↓
③ (If at your own faction) may swap items
      ↓
End turn → next player
```

### Important rules
- Max 1 upgrade per turn.
- Item swapping is allowed starting **the turn after** you arrive at your faction.
- Regardless of how many items are swapped, the swap action itself consumes one turn.
- Turn order is **decided randomly** at game start.

---

## 5. Gold (G) System

| Rule | Value |
|------|-------|
| Game start | 0G |
| Start of each round (everyone) | +15G |
| Completing one To-do item | +5G |
| First moment of holding Sans + Flowey simultaneously (Papyrus) | +2G (once) |
| Max items held | 8 |

### Special item pick-up costs (at your own faction)
| Character | Action | G |
|-----------|--------|---|
| Toriel (RUINS) | Pick up Napstablook | -10G |
| Papyrus (SNOWDIN) | Pick up Sans | -5G |
| Papyrus (SNOWDIN) | Pick up Flowey | -7G |
| Undyne (WATERFALL) | Pick up Asgore | -10G |
| Mettaton (HOTLAND) | Pick up Monster Kid | -10G |

---

## 6. Victory / Round Structure (finalized)

- **Round end condition**: the moment any player is the **first to complete all of their faction's To-do items**.
- **Game end (final victory) condition**: the player who is the **first to reach 100G cumulative**.
- **No round-win bonus** (the +5G per completed To-do is all).
- **Round-end reset policy**: keep **only G (cumulative score)**, reset everything else
  - Empty inventory & faction Box
  - Reset To-do progress
  - Reset character upgrade tier (back to base character)
  - Respawn regular items on the board
  - Return all tokens to their faction home
  - At the next round start: everyone +15G, joker reassigned

---

## 7. Item System

### 7-1. Item list
| Item | Qty | Notes |
|------|-----|-------|
| Froggit | 3 | Upgrades to Final Froggit at the Core |
| Whimsun | 3 | Upgrades to Whimsalot at the Core |
| Lesser Dog | 4 | Upgrades to Greater Dog at the Core |
| Moldsmal | 3 | Upgrades to Moldbygg at the Core |
| Napstablook | 1 | RUINS-related (Toriel, -10G) |
| Sans | 1 | SNOWDIN-related (-5G) |
| Flowey | 1 | SNOWDIN-related (-7G) |
| Asgore | 1 | WATERFALL-related (-10G) |
| Monster Kid | 1 | HOTLAND-related (-10G) |
| Joker | separate | Special card (see §8) |

### 7-2. Item upgrades (at the Core)
```
Froggit     → Final Froggit
Whimsun     → Whimsalot
Lesser Dog  → Greater Dog
Moldsmal    → Moldbygg
```

### 7-3. Upgrade token rules (per original PDF)
- After arriving at the Core, upon leaving the Core you obtain an **upgrade token that must be used immediately**.
- One Core visit = one upgrade token.
- One upgrade token can upgrade **only a single target (either the player character OR one item)**.
- **Upgrade tokens cannot be stockpiled** — if not used at that time (or the designated timing), it disappears.

> Example (from the PDF): If Undyne visits the Core while holding 2 Moldsmal, **one upgrade token cannot convert both Moldsmal at once**; she can upgrade only one of: the character itself (Undyne→Pre-Undying) OR one Moldsmal.

### 7-4. Item "swapping" (the Box)
- Each faction home has a **Box**.
- Starting the turn after arriving at your faction, "swapping" means taking items out of / putting items into the **inventory ↔ Box**.
- Regardless of quantity swapped, it consumes one turn.

### 7-5. ⚠️ Unconfirmed (awaiting user input) — Q3
**Which cells the regular items (Froggit/Whimsun/Lesser Dog/Moldsmal) are placed on** is not yet decided. The user will provide the placement via a separate image.
→ Until then, build only the data structure (e.g. allow an `items: []` field on each node in `board_data.json`) so the placement can be injected once confirmed. Picking up regular items is **free**.

---

## 8. Joker System

- At the start of each round, one joker is given to a **random player**.
- While held, it can be used any time on your turn (single use, consumed after use).
- **When the round advances, an unused joker also disappears** (and is reassigned).
- On use, choose one of three:

| # | Effect |
|---|--------|
| ① | Move to the Core immediately (obtain one upgrade token) |
| ② | Steal one item from another player — **the user designates the target and item; the victim is notified** |
| ③ | Double turn (act once more this turn) |

---

## 9. To-do List (per-faction objectives, finalized)

Each completed item gives +5G. Completing all of your faction's To-dos ends the round.

### RUINS (Toriel)
- Acquire 2 Final Froggit (2 Froggit → Core upgrade)
- Acquire 2 Whimsalot (2 Whimsun → Core upgrade)
- Bring Napstablook (-10G at RUINS)

### SNOWDIN (Papyrus)
- Acquire 3 Greater Dog (3 Lesser Dog → Core upgrade)
- Bring Sans (-5G at SNOWDIN)
- Bring Flowey (-7G at SNOWDIN)
- *(Bonus)* First moment of holding Sans + Flowey simultaneously: +2G

### WATERFALL (Undyne)
- Acquire 2 Moldbygg (2 Moldsmal → Core upgrade)
- Achieve Undyne the Undying (Undyne → Pre-Undying → Undyne the Undying)
- Bring Asgore (-10G at WATERFALL)

### HOTLAND (Mettaton)
- Achieve Mettaton NEO (Mettaton → EX → NEO)
- Call Alphys (Mettaton NEO → Mettaton NEO + Alphys)
- Bring Monster Kid (-10G at HOTLAND)

---

## 10. Screen Layout & UI Flow

### Screen transitions
```
Title
  ↓
[Online] Create/Join room → Lobby → Character (faction) select
[Local]  Character (faction) select
  ↓
In-game
  ↓
Result screen → Leaderboard
```

### In-game HUD layout
```
┌──────────────┬──────────────────────────────┬────────────────┐
│ Inventory(8) │                              │ Faction/Player │
│ Box (8)      │       Board (center Canvas)    │ To-do list     │
│              │                              │ Total score(G) │
│              │                              │ Scoreboard     │
├──────────────┴──────────────────────────────┴────────────────┤
│ Current turn | [Move][Pick][Upgrade][Swap][Joker][End Turn] | ROUND │
└─────────────────────────────────────────────────────────────┘
```

### Popups / modals
| Popup | Trigger |
|-------|---------|
| Item acquired | Successful pick-up |
| Round win/lose | All faction To-dos completed |
| Final win/lose | Reaching 100G |
| Leaderboard | After game ends |
| Joker select | Joker button |
| Upgrade select | Upgrading at the Core |

---

## 11. Visual Design

### Art style
Pixel art applied throughout. Force `image-rendering: pixelated`. Pixel font for UI.

### Color palette (finalized)
| Use | HEX |
|-----|-----|
| Main (background/accent) | `#7b52c1` |
| Sub (emphasis) | `#a070e8` |
| Accent pink | `#e87fd4` |
| Light pink | `#ffb3f0` |
| Dark background | `#0d0010` |
| Gold (G display) | `#f5c842` |
| RUINS | `#ff0000` |
| SNOWDIN | `#0099ff` |
| WATERFALL | `#15ff00` |
| HOTLAND | `#fbff00` |
| CORE | `#9080dc` (light purple / lavender) |

### Fonts
- Title / headings / English body: **Press Start 2P** (Google Fonts)
- Korean body / notifications: Gulim (system-ui fallback)
- Final leaderboard: Dotum (system-ui fallback)

### Background & animation
- Starfield Canvas twinkle (60fps), dark space + Underground atmosphere
- Title heart heartbeat (1.2s loop)
- Character idle float (3s loop)
- On gold gain, "+NG" text floats up and fades
- On final victory, Asriel_b image appears (scale+rotate, 1s) — use a placeholder until the user provides the image

### Placeholder character sprites
48×48px pixel art drawn on Canvas. Design it so it can be swapped out when the user provides real images.
- Toriel: purple/pink / Papyrus: white/orange / Undyne: blue·teal / Mettaton: pink/gray

---

## 12. Sound

| Type | Use |
|------|-----|
| BGM | Atmosphere during play (8-bit substitute in the spirit of "Hopes and Dreams") |
| Win SFX | Final victory |
| Lose SFX | Final defeat |
| Implementation | Web Audio API generated tones, or Howler.js + royalty-free |

> **Using the actual Undertale OST is prohibited for copyright reasons.** Replace with 8-bit generated tones or royalty-free tracks.

---

## 13. Online Multiplayer (Firebase)

### Tech
Firebase Realtime Database (serverless, real-time sync). 4-player connection, turn sync, shared state.

### Room system
- Create a room with a random 4-character code
- The host holds the start privilege
- When all 4 are ready, auto-transition to the character select screen

### Data structure (example)
```json
{
  "rooms": {
    "{roomCode}": {
      "host": "{uid}",
      "players": {
        "{uid}": {
          "name": "nickname", "character": "Toriel",
          "gold": 0, "inventory": [], "box": [],
          "position": "RUINS", "todo": [],
          "hasJoker": false, "ready": false
        }
      },
      "gameState": {
        "phase": "waiting|char-select|playing|ended",
        "currentTurn": 0, "round": 1,
        "boardItems": {}, "logs": []
      }
    }
  }
}
```

### Firebase config handling
- Put a `FIREBASE_CONFIG` object at the top of `js/online.js`, with placeholder initial values (`YOUR_API_KEY`, etc.).
- While in placeholder state, entering online mode shows a "Firebase setup required" modal; local mode works normally.
- The user creates a Firebase project in the console → enables Realtime Database → registers a web app → pastes the 6–7 config lines.

### Local play (offline)
- 4-player hotseat on the same device/screen.
- Save state with localStorage; recover on refresh.

---

## 14. File Structure

```
corex/
├── index.html          # all screens + modals + toasts
├── SPEC.md             # (this document)
├── board_data.json     # board graph (single source of truth)
├── README.md           # run/setup guide
├── css/
│   └── style.css       # variables, pixel font, layout, animations
├── js/
│   ├── main.js         # screen transitions, starfield, event wiring, move mode
│   ├── game.js         # game state / rules engine (turns, rounds, scoring, To-do)
│   ├── board.js        # Canvas board rendering + movement graph (loads board_data.json)
│   ├── sprites.js      # 48×48 pixel art characters / items
│   └── online.js       # Firebase integration
└── assets/
    ├── sprites/        # future character images
    └── audio/          # future BGM/SFX
```

### Rendering & input
- Board: HTML5 Canvas 2D, uses normalized coordinates (adapts to any size), 60fps requestAnimationFrame.
- UI panels: HTML+CSS pixel style.
- Board click: Canvas MouseEvent → pick the nearest node. Mobile touch supported.
- Responsive: design for PC first, then single-column layout for mobile (≤900px), with dynamic Canvas resizing.

---

## 15. Development Milestones (implement in this order)

### M1 — Scaffolding & screen skeleton
- Create file structure, transitions among the 7 screens (title/mode/online-entry/lobby/char-select/in-game/result)
- Color palette, pixel font, starfield background, heart animation
- Placeholder character pixel art
- **Verify**: all screen transitions + starfield work

### M2 — Game engine (logic)
- Player/faction/To-do definitions, random turn order
- Round start +15G, To-do +5G, Sans+Flowey +2G
- 100G final victory, round-end keeps only G and resets the rest
- Joker random assignment / expiry each round
- **Verify**: simulate round progression, score accumulation, and victory detection with a headless Node script

### M3 — Board & movement
- Load `board_data.json`, 43-cell graph, render nodes/edges/tokens/highlights
- [Move] → highlight adjacent cells → click to move (consumes 1 turn)
- Core gate (16/17/23/24) entry rule, grant upgrade token on Core arrival
- Joker ① Core move / ③ double turn
- **Verify**: confirm full connectivity and faction↔Core distance (8/8/10/10 turns) via BFS + browser move test

### M4 — Items & actions (requires Q3 input)
- Regular item board placement (after the user's image is confirmed), pick-up/upgrade/swap actions
- Inventory/Box UI integration, special item cost handling
- Auto To-do progression (detect completion on item/upgrade achievement), joker ② steal
- **Verify**: play through one faction completing all To-dos to round end

### M5 — Online multiplayer
- Firebase room create/join/lobby, character select sync
- Real-time sharing of turn/game state, steal notifications
- **Verify**: join a room and progress turns with two browser tabs

### M6 — Polish (Release)
- Replace placeholder character images, Asriel_b victory effect, sound (substitute audio)
- Mobile optimization, localStorage recovery, final leaderboard

---

## 16. Absolutely Prohibited
- Ads (in any form)
- External payment systems
- Violent depictions
- Unauthorized use of the actual Undertale OST / official character images

---

## 17. Unconfirmed / To-Be-Decided Items (ask the user)

| Item | Status |
|------|--------|
| Regular item board placement (Q3) | Undecided — user to provide image |
| Character images | Not delivered — placeholder pixel art |
| Asriel_b victory image | Not delivered — placeholder |
| Sound files | Substitute audio after copyright review |
| Firebase config | User to enter directly |

**Claude Code must NOT proceed on the above unconfirmed items with arbitrary guesses; instead, ask the user for confirmation as soon as the relevant milestone is reached.**

---

*This document is a finalized specification that has been validated by actually playing the 4-player board game. If a rule conflict is suspected, do not guess — confirm with the user. In particular, the board graph (`board_data.json`) and the §6 round/victory rules must never be changed arbitrarily.*
