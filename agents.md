# Chess Online — Project Agents

## Overview
Website catur online untuk bermain bersama teman secara real-time.
Tampilan menyamar sebagai aplikasi kerja (Project Management style).
Piece catur menggunakan huruf (FEN notation) agar tidak mencolok di kantor.

---

## Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Next.js (App Router) | SSR untuk SEO, deploy mudah ke Vercel |
| UI Catur | react-chessboard | Custom piece support |
| Logika Catur | chess.js | Validasi gerakan, deteksi skak mat |
| Real-time | Socket.io | WebSocket antara dua pemain |
| Backend | Node.js + Express | Ringan, cocok untuk Socket.io |
| Hosting FE | Vercel | Gratis, optimal untuk Next.js |
| Hosting BE | Render.com | Free tier untuk WebSocket |
| Domain | Vercel subdomain (gratis) atau Namecheap ~Rp 150rb/tahun |

---

## Struktur Project (Monorepo)

```
chess-online/
│
├── apps/
│   ├── web/                          → Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx          → Halaman utama (lobby)
│   │   │   │   ├── layout.tsx        → Layout global + meta SEO
│   │   │   │   ├── sitemap.ts        → Auto generate sitemap.xml
│   │   │   │   ├── robots.ts         → Auto generate robots.txt
│   │   │   │   └── game/
│   │   │   │       └── [roomId]/
│   │   │   │           └── page.tsx  → Halaman permainan
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── chess/
│   │   │   │   │   ├── Board.tsx         → Papan catur (piece = huruf)
│   │   │   │   │   ├── Controls.tsx      → Tombol resign, draw, dll
│   │   │   │   │   └── MoveHistory.tsx   → Riwayat gerakan
│   │   │   │   │
│   │   │   │   ├── lobby/
│   │   │   │   │   ├── CreateRoom.tsx    → Buat room baru
│   │   │   │   │   └── JoinRoom.tsx      → Join dengan kode
│   │   │   │   │
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       └── Modal.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useSocket.ts      → Koneksi Socket.io client
│   │   │   │   └── useChessGame.ts   → Logika game via chess.js
│   │   │   │
│   │   │   └── lib/
│   │   │       └── socket.ts         → Inisialisasi Socket.io client
│   │   │
│   │   ├── .env.local                → Backend URL (development)
│   │   ├── .env.production           → Backend URL (production)
│   │   └── next.config.ts
│   │
│   └── server/                       → Node.js Backend
│       ├── src/
│       │   ├── index.ts              → Entry point
│       │   ├── socket/
│       │   │   ├── index.ts          → Setup Socket.io server
│       │   │   └── handlers/
│       │   │       ├── roomHandler.ts  → Event: buat/join/keluar room
│       │   │       └── gameHandler.ts  → Event: gerakan, resign, draw
│       │   │
│       │   └── game/
│       │       ├── RoomManager.ts    → Manajemen semua room aktif (in-memory)
│       │       └── GameState.ts      → State tiap game
│       │
│       └── .env
│
├── packages/
│   └── types/
│       └── index.ts                  → TypeScript types bersama (Room, Move, Player, GameStatus)
│
├── docs/
│   └── architecture.md
│
├── .gitignore
├── package.json                      → Workspace root (pnpm)
└── README.md
```

---

## Tampilan Piece Catur

Piece menggunakan **huruf FEN notation** agar terlihat seperti tabel data.

| Piece | Putih (Bold, Gelap) | Hitam (Regular, Biru) |
|-------|---------------------|----------------------|
| King | `K` | `k` |
| Queen | `Q` | `q` |
| Rook | `R` | `r` |
| Bishop | `B` | `b` |
| Knight | `N` | `n` |
| Pawn | `P` | `p` |

- **Putih** → `font-bold`, warna `#1F2937`
- **Hitam** → `font-normal`, warna `#2563EB` (terlihat seperti hyperlink)

---

## Warna Papan (Office-friendly)

| Kotak | Warna | Hex |
|-------|-------|-----|
| Terang | Abu-abu muda | `#F9FAFB` |
| Gelap | Abu-abu sedang | `#D1D5DB` |
| Selected | Biru muda | `#BFDBFE` |
| Last move | Kuning muda | `#FEF9C3` |

Tampilan akhir menyerupai **tabel spreadsheet / aplikasi enterprise**.

---

## Elemen UI yang Disamarkan

| Elemen Game | Label di UI |
|-------------|------------|
| Timer | "Session Time" |
| Giliran pemain | "Assigned to: [nama]" |
| Riwayat gerakan | "Activity Log" |
| Tombol Resign | "Close Task" |
| Tombol Draw | "Mark Resolved" |
| Room ID | "Meeting ID" |
| Notifikasi giliran | "You have a pending review" |

---

## SEO Checklist

- [ ] `<title>` dan `<meta description>` di setiap halaman
- [ ] Open Graph tags untuk share media sosial
- [ ] `sitemap.xml` (auto-generate via Next.js)
- [ ] `robots.txt` (auto-generate via Next.js)
- [ ] Daftar Google Search Console
- [ ] Submit sitemap ke Google Search Console
- [ ] Domain custom (opsional, disarankan untuk ranking)

---

## Chess API (Opsional — untuk fitur AI/analisis)

| API | Kegunaan | Limit Gratis |
|-----|---------|-------------|
| chess-api.com | Analisis posisi, best move | 1000 req/hari |
| stockfish.online | AI Stockfish | Terbatas |

> Untuk main 2 pemain (PvP), tidak butuh API eksternal.
> chess.js menangani semua validasi gerakan secara lokal.

---

## Estimasi Biaya

| Komponen | Biaya |
|----------|-------|
| Frontend hosting (Vercel) | Gratis |
| Backend hosting (Render) | Gratis (sleep setelah 15 menit idle) |
| Backend hosting (Railway) | ~Rp 75.000/bulan (lebih stabil) |
| Domain custom | ~Rp 150.000/tahun (opsional) |
| Chess API | Gratis |
| **Total minimal** | **Rp 0** |

---

## Urutan Pengerjaan

1. ✅ Setup monorepo dengan pnpm workspace
2. ✅ Setup TypeScript types di `packages/types`
3. Backend: GameState + RoomManager (in-memory)
4. Backend: Socket.io handlers (room & game)
5. Frontend: hook `useSocket` + `useChessGame`
6. ✅ Frontend: komponen `Board` dengan piece huruf
6a. ✅ Frontend: layout office-friendly (navbar, sidebar, panel kanan)
6b. ✅ Frontend: bot offline Stockfish 18 dengan 5 level kesulitan
6c. ✅ Frontend: Activity Log / Move History (side by side dengan board)
6d. ✅ Frontend: piece style toggle (huruf / gambar) + peek mode (tahan R)
6e. ✅ Frontend: review mode history gerakan (← →)
6f. ✅ Frontend: Game Over Dialog (popup natural game end)
6g. ✅ Frontend: TaskClosedView (fake analytics saat resign)
6h. ✅ Frontend: keyboard shortcuts (Esc, ←, →, R)
6i. ✅ Frontend: branding Jira, team names Luthfi/Jordan, Shortcuts panel
7. Frontend: halaman lobby (CreateRoom + JoinRoom)
8. Frontend: halaman game `/game/[roomId]`
9. SEO: layout.tsx, sitemap.ts, robots.ts, meta tags
10. Deploy frontend ke Vercel
11. Deploy backend ke Render
12. Daftar Google Search Console + submit sitemap

---

## Progress Log

### Session 2 — 2026-04-14

#### ✅ Fitur Baru Board.tsx

**Piece Style Toggle:**
- Tombol "Aa" / "♟" di toolbar untuk switch antara huruf dan piece gambar klasik
- State: `pieceStyle: "letter" | "image"`
- Saat `pieceStyle === "image"`, `customPieces` tidak dikirim ke `<Chessboard>` (gunakan piece bawaan)

**Peek Real Pieces (Hold R):**
- State: `peekImage: boolean`
- Tahan `R` → `setPeekImage(true)` → board tampilkan piece gambar sementara
- Lepas `R` → `setPeekImage(false)` → kembali ke huruf
- Hanya aktif saat `pieceStyle === "letter"`
- `effectivePieceStyle = pieceStyle === "letter" && peekImage ? "image" : pieceStyle`

**Review Mode (← →):**
- State baru: `fenHistory: string[]`, `viewIndex: number`
- Setiap gerakan (player maupun bot): push FEN baru ke `fenHistory`, set `viewIndex` ke index terakhir
- `isReviewing = viewIndex < fenHistory.length - 1`
- Saat review: board menampilkan `fenHistory[viewIndex]`, semua interaksi diblok
- Indicator bar muncul: *"Reviewing move X of Y — ← → to navigate, → to return to live"*
- `fenHistoryRef` digunakan di `handleBestMove` untuk menghindari stale closure

**Game Over Dialog:**
- State: `gameOverDialog: boolean`
- Trigger: `useEffect` watch `game` → set `true` saat `game.isGameOver()`
- Modal overlay dengan:
  - Header stripe berwarna (hijau = menang, merah = kalah, abu = draw)
  - Body: Outcome, Total updates, Session type
  - Actions: "New Session" (reset game) | "View Board" (tutup dialog)
- Label office-friendly: "Session Completed" / "Session Closed" / "Mutual Resolution"

**Keyboard Shortcuts (diimplementasikan):**
- `Esc` → toggle Close Task / Resume
- `←` `→` → navigasi review history
- `R` hold/release → peek piece gambar

**Player naming update:**
- Putih: "Luthfi" (inisial "LF", warna `#6366F1`)
- Hitam: "Jordan" (inisial "JD", `#0EA5E9`) atau "Bot (Level)" + "AI" (`#6B7280`) saat mode bot

#### ✅ Branding Update page.tsx

- Logo diganti dari "WorkBoard" ke **"Jira"** — kotak biru (`bg-blue-600`) + huruf "J"
- Sidebar team: "Alex" diganti menjadi **"Luthfi"**
- Right panel ditambah kartu **Shortcuts** berisi daftar keyboard shortcut

#### ✅ Komponen TaskClosedView.tsx (Baru)

File baru: `apps/web/src/components/chess/TaskClosedView.tsx`

Komponen standalone yang muncul saat "Close Task" (resign) diklik.
Menampilkan **fake analytics dashboard** agar layar tidak kosong dan tampak seperti report meeting.

Fitur:
- Header banner dengan status + tombol Resume / New Session inline
- 3 metric card: Completion %, Story Points, Resolved
- SVG bar chart "Sprint Velocity" — 12 bulan, data digenerate dari seed `totalMoves`
- Summary table: Assigned, Sprint, Updates, Status

---

### Session 1 — 2026-04-13

#### ✅ Setup Monorepo (Step 1 & 2)

Struktur folder dan konfigurasi yang sudah dibuat:

```
chess-online/
├── .claude/
│   └── skills/
│       ├── chess-dev/SKILL.md      → /chess-dev command
│       └── chess-review/SKILL.md   → /chess-review command
├── apps/
│   ├── web/
│   │   ├── src/app/layout.tsx      → title: "WorkBoard — Project Management"
│   │   ├── src/app/globals.css     → Tailwind v4 (@import "tailwindcss")
│   │   ├── src/app/page.tsx        → Halaman demo board
│   │   ├── .env.local              → NEXT_PUBLIC_SERVER_URL=http://localhost:3001
│   │   ├── .env.production         → NEXT_PUBLIC_SERVER_URL=https://your-backend.onrender.com
│   │   ├── next.config.ts          → transpilePackages: ["@chess-online/types"]
│   │   └── postcss.config.mjs      → @tailwindcss/postcss
│   └── server/
│       ├── .env                    → PORT=3001, CLIENT_URL=http://localhost:3000
│       ├── tsconfig.json
│       └── package.json
├── packages/types/index.ts         → Types: Player, Room, Move, GameStatus, Socket events
├── package.json                    → scripts: dev, build, lint, typecheck
│                                      pnpm.onlyBuiltDependencies: [esbuild, sharp]
└── pnpm-workspace.yaml             → packages: [apps/*, packages/*]
```

**Dependencies utama yang terinstall:**
- `next@15.3.0`, `react@19`, `react-dom@19`
- `react-chessboard@4.7.2`, `chess.js@1.3.0`
- `socket.io@4.8.0`, `socket.io-client@4.8.0`
- `express@4.21.0`, `cors@2.8.5`
- `tailwindcss@4`, `@tailwindcss/postcss`, `postcss`
- `tsx@4` (untuk dev server backend dengan hot reload)
- `concurrently@9` (jalankan FE + BE bersamaan)

**Cara menjalankan:**
```bash
pnpm dev              # jalankan FE + BE bersamaan
pnpm --filter web dev # FE saja (port 3000)
```

---

#### ✅ Komponen Board (Step 6)

File: `apps/web/src/components/chess/Board.tsx`

- Menggunakan `react-chessboard` + `chess.js`
- Piece custom: huruf monospace (bukan gambar)
  - Putih: uppercase bold `#1F2937`
  - Hitam: lowercase regular `#2563EB`
- Warna papan: satu warna putih + border `1px solid #E5E7EB` (mirip grid spreadsheet)
- Highlight: selected `#BFDBFE`, last move `#FEF9C3`
- Legal moves ditampilkan sebagai dot biru
- Interaksi: klik-klik atau drag & drop
- UI disamarkan: "Assigned to", "In Progress", "Close Task", "Mark Resolved"
- Wrap di `BoardWrapper.tsx` dengan `dynamic(..., { ssr: false })` untuk hindari hydration error

**State lengkap Board.tsx:**
```ts
game          // Chess instance
mode          // "bot" | "pvp"
level         // BotLevel 1–5
selectedSquare
optionSquares
lastMove
botThinking
moveHistory   // string[] — SAN notation
taskClosed    // boolean — tampilkan TaskClosedView
fenHistory    // string[] — FEN tiap gerakan untuk review
viewIndex     // index FEN yang sedang ditampilkan
pieceStyle    // "letter" | "image"
peekImage     // boolean — sementara tampilkan piece gambar saat tahan R
gameOverDialog // boolean — popup saat game selesai natural
```

**Fitur tambahan Board.tsx:**
- **Piece style toggle** — tombol "Aa" (huruf) dan "♟" (gambar klasik) di toolbar
- **Peek real pieces** — tahan tombol `R` untuk sementara lihat piece gambar; lepas kembali ke huruf
- **Review mode** — navigasi history gerakan dengan `←` `→`. Saat review, `isReviewing = true`, board tidak interaktif. Indicator muncul di bawah board: *"Reviewing move X of Y"*
- **Game Over Dialog** — popup modal saat checkmate/draw/stalemate terjadi secara natural (bukan Close Task). Tampilan office-friendly: "Session Completed" / "Session Closed" / "Mutual Resolution". Ada tombol "New Session" dan "View Board"
- **Keyboard shortcuts** (diimplementasikan via `useEffect`):
  - `Esc` → toggle Close Task / Resume
  - `←` → previous move (review)
  - `→` → next move (review)
  - `R` (hold) → peek image pieces; (keyup) → kembali ke huruf
- **Player names**: Putih = "Luthfi", Hitam = "Jordan" (atau `Bot (Level)` saat mode bot)
- **boardWidth**: 460px fixed

---

#### ✅ Layout Halaman (Office-Friendly)

File: `apps/web/src/app/page.tsx`

Tampilan menyerupai **Jira** (bukan WorkBoard — logo "J" biru, label "Jira"):
- **Top navbar** — logo "Jira" (kotak biru + huruf J), nav tabs (Projects aktif), search bar, avatar LF
- **Sidebar** — workspace menu (Board View aktif), task list (In Progress/Under Review/Completed), team members Luthfi + Jordan
- **Breadcrumb** — Projects / Q2 Planning / Board View
- **Main card** — header "Active Session" + badge `MEET-Q2-01`, board di dalam card
- **Right panel** (w-56) — 3 kartu:
  1. **Details** — Priority (Medium), Sprint (Q2 Week 3), Type (Sync Meeting), Meeting ID
  2. **Activity Log** — 3 entry statis (Luthfi made update, Jordan joined, Luthfi opened)
  3. **Shortcuts** — daftar keyboard shortcut: Esc, ←, →, R, Aa, ♟

Team members: **Luthfi** (LF, `#6366F1` ungu) dan **Jordan** (JD, `#0EA5E9` biru)

---

#### ✅ Bot Offline — Stockfish 18 (Step tambahan)

File: `apps/web/src/hooks/useStockfish.ts`

Menggunakan **Stockfish 18 WASM** via Web Worker — berjalan sepenuhnya di browser, tanpa server.

**Setup:**
```bash
pnpm --filter web add stockfish
# Copy file ke public/
cp node_modules/.pnpm/stockfish@18.0.7/node_modules/stockfish/bin/stockfish-18-single.js apps/web/public/stockfish/stockfish.js
cp node_modules/.pnpm/stockfish@18.0.7/node_modules/stockfish/bin/stockfish-18-single.wasm apps/web/public/stockfish/stockfish.wasm
```

**Cara kerja (UCI Protocol):**
```
Worker.postMessage("uci")           → inisialisasi
Worker.postMessage("setoption name Skill Level value X")
Worker.postMessage("position fen [FEN]")
Worker.postMessage("go depth X movetime X")
Worker.onmessage → parse "bestmove e2e4"
```

**Level konfigurasi:**

| Level | Label | Skill | Depth | Movetime | Min Delay |
|-------|-------|-------|-------|----------|-----------|
| 1 | Beginner | 1 | 5 | 100ms | 700ms |
| 2 | Easy | 5 | 8 | 300ms | 500ms |
| 3 | Medium | 10 | 12 | 800ms | 0ms |
| 4 | Hard | 15 | 16 | 1500ms | 0ms |
| 5 | Expert | 20 | 20 | 2500ms | 0ms |

- `minDelay` — minimum waktu tunggu sebelum piece bergerak, agar terasa natural di level rendah
- Default level: **1 (Beginner)**
- Mode: **vs Bot** (putih=player, hitam=Stockfish) atau **2 Players**

**Bug fix penting:**
- `handleBestMove` menggunakan `gameRef` (bukan functional updater `setGame(prev => ...)`) untuk menghindari React StrictMode double-invoke yang menyebabkan history duplikat

---

#### ✅ Activity Log / Move History

File: `apps/web/src/components/chess/MoveHistory.tsx`

- Tampil di sebelah kanan papan (side by side), `maxHeight: 460px`
- Format tabel 3 kolom: `#` | `Luthfi` (putih) | `Jordan` (hitam)
- Move terakhir di-highlight biru (`#EFF6FF` background pada row terakhir)
- Move terbaru dalam pasangan di-highlight teks biru (`#2563EB`)
- Auto-scroll ke bawah setiap ada gerakan baru (`scrollIntoView`)
- Empty state: "No activity yet" + subtitle "Updates will appear here"
- Footer: "Move X" + legend warna Luthfi (abu) / Jordan (biru)
- Kolom menggunakan **inline style** `gridTemplateColumns: "28px 1fr 1fr"` (bukan Tailwind arbitrary values yang tidak kompatibel dengan v4)
- History disimpan di state `moveHistory: string[]` terpisah — bukan dari `game.history()` karena `new Chess(fen)` tidak menyimpan history

---

#### ✅ TaskClosedView (Komponen Baru)

File: `apps/web/src/components/chess/TaskClosedView.tsx`

Tampil saat user klik "Close Task" (Resign) — menggantikan board dengan tampilan **analytics dashboard palsu**.

**Struktur:**
- **Header banner** — "Task Closed" + deskripsi winner/draw + tombol "Resume" dan "New Session"
- **Metric cards** (3 kartu kiri):
  - Completion: `60 + totalMoves * 2` % (maks 99)
  - Story Points: `totalMoves * 1.4`
  - Resolved: `totalMoves * 0.7`
- **Sprint Velocity chart** — SVG bar chart 12 bulan, data dihasilkan dari seed `totalMoves`
- **Summary table** — Assigned (Luthfi, Jordan), Sprint, Updates, Status (Archived)

Props: `{ totalMoves, winner, onNewSession, onResume }`
Winner type: `"Luthfi" | "Jordan" | "Draw" | null`

---

## Catatan

- Game state disimpan **in-memory** di server (tidak ada database)
- Jika server restart, semua game aktif hilang — acceptable untuk main casual
- Jika ingin simpan riwayat game, tambah database di fase berikutnya (Redis / PostgreSQL)
- Gunakan **pnpm** sebagai package manager (lebih cepat, hemat disk)
- Tailwind v4 — syntax import berbeda: `@import "tailwindcss"` (bukan `@tailwind base` dll)
- Tailwind v4 — arbitrary values seperti `grid-cols-[28px_1fr_1fr]` tidak reliable, gunakan inline style
- Custom slash commands Claude Code ada di `.claude/skills/` dengan subfolder + `SKILL.md`
- Stockfish WASM harus di `public/` agar bisa diakses sebagai Web Worker
- React StrictMode (dev) memanggil functional updater 2x — jangan taruh side effect di dalam `setGame(prev => ...)`
- Hydration error dari `react-chessboard` diatasi dengan `dynamic(..., { ssr: false })` di client wrapper
- `fenHistory` menyimpan FEN tiap langkah; `viewIndex` menentukan posisi yang ditampilkan di board
- Review mode: `isReviewing = viewIndex < fenHistory.length - 1` → board non-interaktif saat review
- Logo/branding halaman: **Jira** (bukan WorkBoard) — kotak biru dengan huruf "J"
- Player putih = "Luthfi" (LF, `#6366F1`), player hitam = "Jordan" (JD, `#0EA5E9`) atau "AI" (abu) saat mode bot
- `TaskClosedView` menampilkan dashboard analytics palsu — metric semuanya dihitung dari `totalMoves`
- `gameOverDialog` muncul otomatis saat `game.isGameOver()` (checkmate/draw/stalemate) — terpisah dari `taskClosed`
- Keyboard shortcut `R` (hold): sementara ganti ke piece gambar untuk "peek"; diimplementasikan via `keydown`/`keyup` event
