# SynapseVault

A personal knowledge base and study reviewer with an Obsidian-style force-directed knowledge graph, PDF parser, YouTube transcript synchronizer, 3D flashcards, practice quizzes, and full-vault search assistant.

Built with React, Vite, Tailwind CSS, Express, and Google Gemini 3.7 / 2.5 Flash.

---

## Features

- **Document Ingestion**:
  - **PDF Parser**: Multi-page PDF text and formula extractor with section chunking.
  - **YouTube Transcripts**: Fetches timestamps and captions, with interactive transcript jumps synced to an embedded player.
  - **Markdown Notes**: Native Obsidian-compatible note creator supporting `#tags` and `[[wikilinks]]`.
- **Reviewer Studio**:
  - Detailed section-by-section breakdown (preserving definitions, theorems, formulas, and edge cases).
  - Key takeaways, formulas in LaTeX format, and concept glossaries.
  - Active recall flashcard decks with Leitner rating and keyboard navigation.
  - Practice quiz arena with score tracking, rationale breakdowns, and retry modes.
- **Obsidian Knowledge Graph**:
  - Canvas 2D force-directed layout with repulsive charges, spring physics, and center gravity.
  - Real-time search highlighting with 1-hop and 2-hop neighbor expansion.
  - Filter by document type, tags, and concepts.
  - Interactive slide-over drawer to inspect connected notes.
- **Vault Assistant**:
  - Cross-document Q&A assistant querying your entire vault with source citations.
- **Security & Access Control**:
  - Password-protected vault gate (`migol`) with PBKDF2 hashing, constant-time checks, and session tokens.
  - Server-side API key isolation.
- **Mobile Responsive**:
  - Touch-optimized layout with mobile bottom navigation bar and gesture-ready study decks.

---

## Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS (Gruvbox Dark theme), Lucide Icons, Canvas 2D
- **Backend**: Node.js, Express, `pdf-parse`, `youtube-transcript`, Axios
- **AI / LLM**: Google Gemini 3.7 Flash (default) with automatic fallback to Gemini 2.5 Flash
- **Deployment**: Vercel (Edge & Serverless with 0s cold-start)

---

## Architecture

```
synapse-vault/
├── api/
│   └── index.js              # Vercel serverless entry point
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphView.jsx        # 2D Canvas force-directed graph
│   │   │   ├── ReviewerStudio.jsx   # Section notes, flashcards & quiz
│   │   │   ├── VaultChatbot.jsx     # Full-vault assistant
│   │   │   ├── FlashcardsView.jsx   # 3D interactive flashcards
│   │   │   ├── QuizView.jsx         # Practice quiz arena
│   │   │   ├── LockScreen.jsx       # Password auth gate
│   │   │   ├── IngestionModal.jsx   # PDF, YouTube & Note ingestion
│   │   │   ├── Navbar.jsx           # Top header & search
│   │   │   ├── Sidebar.jsx          # Vault document explorer & tag cloud
│   │   │   └── MobileNav.jsx        # Bottom mobile navigation
│   │   ├── App.jsx
│   │   └── api.js                   # Authenticated fetch client
│   └── vite.config.js
├── server/
│   ├── services/
│   │   ├── authService.js      # Session management & token verification
│   │   ├── geminiService.js    # Reviewer & study guide generation
│   │   ├── chatService.js      # Cross-document vault search
│   │   ├── pdfExtractor.js     # PDF text & structure extraction
│   │   ├── youtubeExtractor.js # Captions & chapter clustering
│   │   ├── nlpEngine.js        # Heuristic entity & keyword analysis
│   │   └── vaultManager.js     # Markdown file persistence & graph compiler
│   ├── vault/                  # Obsidian-compatible .md files
│   ├── index.js                # Express API server
│   └── config.js
└── vercel.json                 # Vercel deployment configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/meegol/synapsevault.git
cd synapsevault

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Configuration

Create a `.env` file inside `server/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_MODEL=gemini-3.7-flash
FALLBACK_MODEL=gemini-2.5-flash
VAULT_PASSWORD=migol
PORT=3001
```

### Running Locally

```bash
# Build client
cd client && npm run build

# Start server
cd ../server && npm start
```

Open `http://localhost:3001` in your browser and enter password `migol`.

---

## Keyboard Shortcuts

- `Space`: Flip flashcard
- `←` / `→` or `A` / `D`: Previous / Next flashcard
- `1` / `2`: Mark card as "Needs Review" / "Mastered"
- `Ctrl + K`: Focus search bar

---

## Deployment on Vercel

SynapseVault is pre-configured with `vercel.json` for deployment with 0 cold-start delays.

### Deploy with Vercel CLI:
```bash
npx vercel --prod
```

### Environment Variables on Vercel:
- `GEMINI_API_KEY`: Your Google AI Studio API key
- `DEFAULT_MODEL`: `gemini-3.7-flash`
- `VAULT_PASSWORD`: `migol`

---

## License

MIT License
