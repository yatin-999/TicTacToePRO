# 墨と混沌 — INK & CHAOS

## Manga Tic Tac Toe

A modern Tic Tac Toe game with a dark manga-inspired style. The design takes inspiration from series like **Death Note**, **Tokyo Ghoul**, **Jujutsu Kaisen**, **Chainsaw Man**, **Bleach**, and **Vagabond**, combining smooth animations, ink effects, and cinematic transitions to make a classic game feel more immersive.

##  Features

### Game Modes

*  Local multiplayer (2 players on the same device)
*  AI opponent with 3 difficulty levels:

  * Easy
  * Medium
  * Impossible (Minimax + Alpha-Beta Pruning)
*  Score tracking
*  Round counter
*  Match history

### Visual Effects

* Animated ink-style game board
* Hand-drawn X and O animations
* Manga-inspired transitions
* Floating ink particles
* Animated winning line
* Victory and draw effects
* Cursor trail animation
* Player highlight effects

### Screens

* Loading screen
* Main menu
* Mode selection
* Game board
* Settings
* Statistics
* Credits

### Audio

All sounds are generated using the **Web Audio API**, so no audio files are required.

Includes:

* Button clicks
* Hover effects
* Brush strokes
* Ink splash sounds
* Victory and draw sounds
* AI thinking effects

### Accessibility

* Keyboard navigation
* ARIA labels
* Mobile and tablet support
* Responsive design
* Focus indicators

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/manga-tic-tac-toe.git
cd manga-tic-tac-toe
```

Run a local server:

```bash
npx serve .
```

or

```bash
python3 -m http.server 8080
```

Then open:

```
http://localhost:8080
```

You can also open `index.html` directly in your browser, although running a local server is recommended.

---

## 📁 Project Structure

```text
manga-tictactoe/
│
├── index.html
├── css/
│   ├── main.css
│   ├── animations.css
│   ├── effects.css
│   ├── menu.css
│   ├── game.css
│   └── settings.css
│
├── js/
│   ├── main.js
│   ├── game.js
│   ├── ai.js
│   ├── animations.js
│   ├── audio.js
│   ├── particles.js
│   ├── menu.js
│   ├── settings.js
│   └── utils.js
│
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Key               | Action              |
| ----------------- | ------------------- |
| `Esc`             | Return to menu      |
| `R`               | Restart game        |
| `Enter` / `Space` | Select              |
| `Tab`             | Navigate through UI |

---

##  Design

The game uses a simple **black-and-white manga aesthetic** with animated ink effects, brush strokes, and cinematic transitions. The goal was to create a clean interface while giving the game the feel of reading an action manga.

---

##  Easter Egg

Visit the Credits screen and click the ⚡ icon **five times** to unlock a hidden surprise.

---

##  Inspiration

This project is inspired by the visual styles of:

* Death Note
* Tokyo Ghoul
* Jujutsu Kaisen
* Chainsaw Man
* Bleach
* Vagabond

---

##  Built With

* HTML5
* CSS3
* JavaScript (ES6)
* GSAP
* SVG Animations
* Web Audio API
* Canvas API

---

Made with ❤️ for anime, manga, and web development.
