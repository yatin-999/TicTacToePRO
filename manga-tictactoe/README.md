# 墨と混沌 — INK & CHAOS
## Manga Tic Tac Toe

> *"The strongest battle is the one fought with a single stroke of ink."*

A cinematic, Japanese Manga/Anime themed Tic Tac Toe experience inspired by **Death Note**, **Tokyo Ghoul**, **Jujutsu Kaisen**, **Chainsaw Man**, **Bleach**, and **Vagabond**.

---

## 🎮 Features

### Core Game
- ✅ **Local Multiplayer** — Two players on same device
- ✅ **AI Mode** — Three difficulty levels:
  - 🟢 **Easy** — Random moves with occasional strategy
  - 🟡 **Medium** — Blocks threats, plays smart 70%
  - 🔴 **Impossible** — Perfect play via Minimax + Alpha-Beta Pruning
- ✅ **Score tracking** per session
- ✅ **Round counter**
- ✅ **Match history** with timestamps

### Visuals
- ✅ Animated ink-drawn grid (SVG stroke animation)
- ✅ **X** drawn stroke-by-stroke with ink splash
- ✅ **O** drawn calligraphy-style with sweep animation
- ✅ Manga speed lines on menu
- ✅ Floating ink particles
- ✅ Japanese typography throughout
- ✅ Win line drawn as animated brush stroke
- ✅ Epic win/draw cinematic sequences
- ✅ Canvas-based cursor trail
- ✅ Player card active glow

### Screens
- ✅ **Loading** — Animated SVG logo with progress bar
- ✅ **Main Menu** — Speed lines, particles, dramatic title
- ✅ **Mode Select** — Card-style selection
- ✅ **Game** — Full board with player cards
- ✅ **Settings** — Audio, visual, game toggles
- ✅ **Statistics** — Win rate bars, match history
- ✅ **Credits** — With Easter egg

### Animations
- ✅ GSAP-powered screen transitions (manga wipe)
- ✅ Screen shake on win
- ✅ Ink particle celebration on victory
- ✅ Victory flash
- ✅ AI "thinking" indicator
- ✅ Toast notifications
- ✅ Button ripple effects
- ✅ Hover ghost marks

### Audio (Web Audio API — no files needed!)
- ✅ Button click sounds
- ✅ Hover tones
- ✅ Brush stroke (mark placement)
- ✅ Ink splash (X and O have different sounds)
- ✅ Victory fanfare
- ✅ Draw descending tones
- ✅ AI thinking ticks
- ✅ Transition whoosh

### Accessibility & Responsive
- ✅ Keyboard navigation (Arrow keys, Enter, Space, Escape, R)
- ✅ ARIA labels on all interactive elements
- ✅ Touch support (mobile/tablet)
- ✅ Fully responsive — Desktop, Tablet, Mobile
- ✅ Focus-visible styles

---

## 🚀 How to Run

Simply open `index.html` in a modern browser:

```bash
# Option 1: Direct open
open index.html

# Option 2: Local server (recommended for best experience)
npx serve .
# or
python3 -m http.server 8080
# then visit http://localhost:8080
```

> **No build step required.** No npm install. No dependencies to download.
> GSAP and Google Fonts are loaded from CDN.

---

## 📁 Project Structure

```
manga-tictactoe/
├── index.html              # Main entry point
├── css/
│   ├── main.css            # Global styles & CSS variables
│   ├── animations.css      # All CSS keyframe animations
│   ├── effects.css         # Particles, speed lines, ink FX
│   ├── menu.css            # Menu & loading screen
│   ├── game.css            # Game board, cells, result overlay
│   └── settings.css        # Settings page
├── js/
│   ├── utils.js            # Shared utility functions
│   ├── audio.js            # Web Audio API sound synthesis
│   ├── particles.js        # Canvas particle systems
│   ├── animations.js       # GSAP animation controller
│   ├── ai.js               # AI engine (minimax + alpha-beta)
│   ├── game.js             # Core game logic
│   ├── menu.js             # Menu & navigation
│   ├── settings.js         # Settings + Stats modules
│   └── main.js             # App bootstrap & Router
└── README.md
```

---

## ⌨️ Keyboard Controls

| Key | Action |
|-----|--------|
| `Esc` | Return to menu |
| `R` | Restart game |
| `Enter` / `Space` | Select cell / button |
| `Tab` | Navigate UI |

---

## 🎨 Design Philosophy

The entire interface is rendered in a **pure black-and-white** palette, evoking the ink-on-paper aesthetic of classic manga. Every interaction is treated as a "panel transition" — from the wipe transitions to the dramatic win sequences.

Typography draws from:
- `Bebas Neue` — Bold Latin display
- `Noto Serif JP` — Japanese characters
- `Cinzel Decorative` — Ceremonial headings
- `Permanent Marker` — Handwritten feel

---

## 🏆 Easter Egg

Click the ⚡ symbol in the Credits screen **5 times** to unlock the hidden Shōnen Spirit!

---

## 📖 Inspired By

| Manga | Aesthetic Borrowed |
|-------|--------------------|
| **Death Note** | Dark atmosphere, dramatic framing |
| **Tokyo Ghoul** | Ink splatter, horror beauty |
| **Jujutsu Kaisen** | Energy burst effects |
| **Chainsaw Man** | Raw, visceral transitions |
| **Bleach** | Calligraphic marks |
| **Vagabond** | Brush-stroke artistry |

---

*Built with ❤ and ink — MANGA STUDIO 2024*
