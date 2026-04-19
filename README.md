# 🕉️ Valmiki Ramayana — Sacred Text Reader

An immersive, beautifully crafted web application for reading the **Valmiki Ramayana** — the ancient epic of India and the first poem of humanity (*Adi Kavya*). Explore all seven Kandas with original Sanskrit shlokas, English translations, word-by-word meanings, and scholarly commentary.

🔗 **[Live Demo →](https://prashanthbhat203.github.io/ramayana_hymns/)**

---

## ✨ Features

- **📖 All Seven Kandas** — Complete coverage including Bala, Ayodhya, Aranya, Kishkindha, Sundara, Yuddha, and Uttara Kanda with **23,400+ shlokas** across **648 sargas**
- **🕉️ Original Sanskrit Text** — Each verse displays the Devanagari shloka text prominently with a dedicated font
- **📝 English Explanations** — Clear English explanations for every verse
- **🔍 Word-by-Word Dictionary** — Expandable Sanskrit word-by-word meanings for each shloka
- **💬 Scholarly Commentary** — Contextual commentary on key verses where available
- **🎨 Sacred Scroll Aesthetic** — Warm saffron, gold, and parchment color palette inspired by ancient Indian manuscripts
- **✨ Immersive Animations** — Floating ambient particles, scroll-triggered verse reveals, smooth page transitions, and micro-interactions
- **⌨️ Keyboard Navigation** — Use arrow keys (← →) to navigate between sargas while reading
- **📊 Reading Progress** — A glowing progress bar tracks your reading position within each sarga
- **📱 Fully Responsive** — Optimized for desktop, tablet, and mobile reading experiences
- **⚡ Lazy Loading** — JSON data is fetched on-demand per Kanda for fast initial loads

---

## 🏗️ Tech Stack

Built with **zero frameworks** — pure web fundamentals:

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5 (Semantic) |
| **Styling** | Vanilla CSS (Custom Properties, Grid, Flexbox, Animations) |
| **Logic** | Vanilla JavaScript (ES6+, Fetch API, Intersection Observer) |
| **Typography** | [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [Inter](https://fonts.google.com/specimen/Inter) + [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) |
| **Deployment** | GitHub Pages via GitHub Actions |

---

## 📁 Project Structure

```
ramayana_hymns/
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions deployment workflow
├── data/
│   ├── BalaKanda.json         # Book 1 — The Book of Youth (77 sargas)
│   ├── AyodhyaKanda.json      # Book 2 — The Book of Ayodhya (119 sargas)
│   ├── AranyaKanda.json       # Book 3 — The Book of Forest (75 sargas)
│   ├── KishkindhaKanda.json   # Book 4 — The Book of Kishkindha (67 sargas)
│   ├── SundaraKanda.json      # Book 5 — The Book of Beauty (68 sargas)
│   ├── YuddhaKanda.json       # Book 6 — The Book of War (131 sargas)
│   └── UttaraKanda.json       # Book 7 — The Final Book (111 sargas)
├── index.html                 # Single-page application entry
├── styles.css                 # Complete design system
├── app.js                     # Application logic & routing
├── .gitignore
└── README.md
```

---

## 📦 Data Format

Each JSON file contains an array of shloka objects:

```json
{
  "kanda": "Bala Kanda",
  "sarga": 1,
  "shloka": 1,
  "shloka_text": "तपस्स्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ...",
  "transliteration": "tapassvādhyāyanirataṁ tapasvī vāgvidāṁ varam...",
  "translation": "Word-by-word Sanskrit meanings with English translations...",
  "explanation": "Full English explanation of the verse...",
  "comments": "Scholarly commentary (where available)..."
}
```

---

## 🚀 Getting Started

### Run Locally

Since the app uses `fetch()` to load JSON data, you need a local HTTP server:

```bash
# Clone the repository
git clone https://github.com/prashanthbhat203/ramayana_hymns.git
cd ramayana_hymns

# Option 1: Using Node.js
npx serve

# Option 2: Using Python
python -m http.server 3000

# Option 3: Using VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:3000` in your browser.

### Deploy Your Own

The project includes a GitHub Actions workflow that auto-deploys to GitHub Pages on every push to `main`. To set it up:

1. Fork this repository
2. Go to **Settings → Pages**
3. Set **Source** to **GitHub Actions**
4. Push to `main` — the site will deploy automatically

---

## 🎨 Design Philosophy

The **"Sacred Scroll"** aesthetic draws from:

- **Ancient Indian Manuscripts** — Warm parchment tones and serif typography evoke the feel of reading a sacred text
- **Temple Architecture** — Golden accents and ornamental borders inspired by Indian temple art
- **Modern UI Principles** — Generous whitespace, focused reading columns, and smooth micro-animations for a premium feel
- **Ambient Atmosphere** — Floating golden particles create a meditative, sacred reading environment

---

## 📜 About the Ramayana

The **Valmiki Ramayana** is one of the two great Indian epics, composed by the sage Valmiki. It narrates the life of Prince Rama of Ayodhya — his exile to the forest, the abduction of his wife Sita by the demon king Ravana, and the great war to rescue her. The epic spans approximately **24,000 verses** (*shlokas*) across seven books (*Kandas*), and is revered as the *Adi Kavya* — the first poem ever composed.

---

## 🙏 Acknowledgments

- **Data Source** — [Valmiki Ramayana Dataset](https://github.com/Ashutosh-Vijay/Valmiki_Ramayan_Dataset) by Ashutosh Vijay
- Typography by [Google Fonts](https://fonts.google.com/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
