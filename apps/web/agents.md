# Frontend — Chess Online

> Baca file ini saat mengerjakan `apps/web/`.

---

## Konvensi UI (Wajib Dipatuhi)

### Piece Catur = Huruf

| Piece | Putih (bold, `#1F2937`) | Hitam (regular, `#2563EB`) |
|-------|------------------------|---------------------------|
| King  | `K` | `k` |
| Queen | `Q` | `q` |
| Rook  | `R` | `r` |
| Bishop| `B` | `b` |
| Knight| `N` | `n` |
| Pawn  | `P` | `p` |

### Warna Papan

| Kotak     | Hex       |
|-----------|-----------|
| Semua kotak | `white` + border `1px solid #E5E7EB` |
| Selected  | `#BFDBFE` |
| Last move | `#FEF9C3` |
| Legal move dot | `rgba(191,219,254,0.5)` |

### Label UI yang Disamarkan

| Elemen Game      | Label di UI              |
|------------------|--------------------------|
| Giliran pemain   | "Assigned to: [nama]"    |
| Riwayat gerakan  | "Activity Log"           |
| Tombol Resign    | "Close Task"             |
| Tombol Draw      | "Mark Resolved"          |
| Room ID          | "Meeting ID"             |
| Status check     | "Pending Review ⚠"       |
| Timer            | "Session Time"           |

### Branding Halaman

- Logo: **Jira** — kotak `bg-blue-600` + huruf "J"
- Player putih: **Luthfi** (LF, `#6366F1`)
- Player hitam: **Jordan** (JD, `#0EA5E9`) atau "AI" (`#6B7280`) saat mode bot

---

## Struktur File Frontend

```
apps/web/src/
├── app/
│   ├── page.tsx                    → Lobby (halaman awal, Team Sessions)
│   ├── offline-session/page.tsx    → Chessboard offline (Jira-style)
│   ├── game/[roomId]/page.tsx      → Multiplayer game (real Socket.io)
│   ├── layout.tsx                  → Meta SEO + ThemeProvider + FOUC script
│   └── globals.css                 → @import "tailwindcss" + @variant dark
│
├── components/chess/
│   ├── Board.tsx             → Komponen utama offline (semua state game)
│   ├── BoardWrapper.tsx      → SSR wrapper (dynamic import, ssr: false)
│   ├── MultiplayerBoard.tsx  → Board multiplayer (FEN dari server, giliran terkunci)
│   ├── MoveHistory.tsx       → Activity Log panel
│   └── TaskClosedView.tsx    → Fake analytics saat resign
│
├── context/
│   └── ThemeContext.tsx      → Dark/light theme, localStorage persist
│
├── hooks/
│   ├── useStockfish.ts       → Stockfish 18 UCI Web Worker wrapper
│   └── useMultiplayerGame.ts → Socket.io state untuk multiplayer (create/join/move/resign/draw)
│
└── lib/
    └── socket.ts             → Singleton socket.io-client (autoConnect: false)
```

---

## Komponen: Board.tsx

Komponen utama yang mengandung semua state dan logika game.

### State

```ts
game           // Chess instance aktif
mode           // "bot" | "pvp"
level          // BotLevel 1–5
selectedSquare
optionSquares
lastMove
botThinking    // true saat stockfish sedang hitung
moveHistory    // string[] SAN — disimpan terpisah, bukan game.history()
taskClosed     // true → tampilkan TaskClosedView
fenHistory     // string[] FEN tiap langkah (untuk review mode)
viewIndex      // FEN index yang ditampilkan; < length-1 = sedang review
pieceStyle     // "letter" | "image"
peekImage      // true saat tahan R (sementara tampilkan piece gambar)
gameOverDialog // true saat game.isGameOver() (checkmate/draw)
```

### Keyboard Shortcuts

| Key | Aksi |
|-----|------|
| `Esc` | Toggle Close Task / Resume |
| `←` | Previous move (review) |
| `→` | Next move (review) |
| `R` hold | Peek piece gambar; lepas → kembali huruf |

### Review Mode

- `isReviewing = viewIndex < fenHistory.length - 1`
- Saat review: board non-interaktif, tampilkan `fenHistory[viewIndex]`
- `fenHistoryRef` dipakai di `handleBestMove` untuk hindari stale closure

### Game Over Dialog

- Muncul otomatis saat `game.isGameOver()`
- Terpisah dari `taskClosed` (resign manual)
- Label: "Session Completed" / "Session Closed" / "Mutual Resolution"

### Gotcha

- `handleBestMove` pakai `gameRef.current` bukan `setGame(prev => ...)` — React StrictMode double-invoke menyebabkan history duplikat jika pakai functional updater
- `moveHistory` harus disimpan di state terpisah — `new Chess(fen)` tidak menyimpan history
- `boardWidth`: 460px fixed

---

## Komponen: MoveHistory.tsx

- 3 kolom: `#` | `Luthfi` | `Jordan`, pakai **inline style** `gridTemplateColumns: "28px 1fr 1fr"`
- Tailwind arbitrary values `grid-cols-[...]` tidak reliable di v4 — wajib inline style
- Row terakhir highlight `#EFF6FF`; teks move terbaru `#2563EB`
- Auto-scroll via `scrollIntoView` setiap `moves.length` berubah

---

## Komponen: TaskClosedView.tsx

Muncul saat "Close Task" (resign). Tampilan fake analytics dashboard.

Props: `{ totalMoves, winner, onNewSession, onResume }`
`winner`: `"Luthfi" | "Jordan" | "Draw" | null`

Semua metric dihitung dari `totalMoves`:
- Completion: `Math.min(99, 60 + totalMoves * 2)` %
- Story Points: `totalMoves * 1.4`
- Chart: SVG bar 12 bulan, seed dari `totalMoves`

---

## Hook: useStockfish.ts

Stockfish 18 WASM via Web Worker. Berjalan di browser, tanpa server.

**Setup setelah clone** (file tidak di-commit ke git):
```bash
cp node_modules/.pnpm/stockfish@18.0.7/node_modules/stockfish/bin/stockfish-18-single.js apps/web/public/stockfish/stockfish.js
cp node_modules/.pnpm/stockfish@18.0.7/node_modules/stockfish/bin/stockfish-18-single.wasm apps/web/public/stockfish/stockfish.wasm
```

**Level:**

| Level | Label    | Skill | Depth | Movetime | MinDelay |
|-------|----------|-------|-------|----------|----------|
| 1     | Beginner | 1     | 5     | 100ms    | 700ms    |
| 2     | Easy     | 5     | 8     | 300ms    | 500ms    |
| 3     | Medium   | 10    | 12    | 800ms    | 0        |
| 4     | Hard     | 15    | 16    | 1500ms   | 0        |
| 5     | Expert   | 20    | 20    | 2500ms   | 0        |

`minDelay` — waktu tunggu minimum agar gerakan bot terasa natural di level rendah.

---

## Halaman: page.tsx

Tampilan Jira-style. **Semua statis** (tidak ada state di halaman ini).

- Navbar: Logo Jira, nav tabs (Projects aktif), search, avatar LF
- Sidebar: Workspace menu, task list, team (Luthfi + Jordan)
- Main: Breadcrumb → card "Active Session" → `<BoardWrapper />`
- Right panel (w-56): Details, Activity Log (statis), Shortcuts

---

## Catatan Teknis Frontend

- Tailwind v4: `@import "tailwindcss"` (bukan `@tailwind base/components/utilities`)
- Hydration error `react-chessboard` → diatasi dengan `BoardWrapper` + `dynamic(..., { ssr: false })`
- `apps/web/public/stockfish/` di-ignore git (107MB). Copy dari node_modules setelah clone.
- `useStockfish` init worker **sekali** saat mount — jangan buat worker baru tiap render

---

## SEO Checklist (Planned)

- [ ] `<title>` dan `<meta description>` di setiap halaman
- [ ] Open Graph tags
- [ ] `sitemap.xml` via Next.js
- [ ] `robots.txt` via Next.js
- [ ] Google Search Console

---

## Progress Log Frontend

### Session 8 — 2026-04-20

#### ✅ Multiplayer real-time dengan Socket.io

File baru:
- `src/lib/socket.ts` — singleton `socket.io-client`, `autoConnect: false` agar tidak connect saat import
- `src/hooks/useMultiplayerGame.ts` — manage koneksi socket + game state; param: `roomId | null`, `playerName`, `action: "create" | "join"`
- `src/components/chess/MultiplayerBoard.tsx` — board khusus multiplayer, terima FEN + lastMove dari server sebagai props

File diubah:
- `src/app/page.tsx` — Create button → `/game/new?player=host`, Join button → `/game/MEET-XXXX?player=guest&name=...`; tambah state `joinName`
- `src/app/game/[roomId]/page.tsx` — full rewrite: pakai `useMultiplayerGame` + `MultiplayerBoard`, hapus mock setTimeout

**Alur create/join:**
- Host: navigate ke `/game/new?player=host` → socket emit `room:create` → server return roomId nyata → `router.replace()` ke URL baru
- Guest: navigate ke `/game/MEET-XXXX?player=guest` → socket emit `room:join`

**Keputusan desain:**
- `lastMove` di MultiplayerBoard berasal dari `room.moves.at(-1)` (server), bukan state lokal — supaya gerakan lawan juga ter-highlight
- Warna last move highlight: `#374151` (dark) / `#F3F4F6` (light) — sama persis dengan `Board.tsx` offline
- Board square pakai `outline` bukan `border` — `border` menambah ukuran kotak dan merusak alignment
- Participant tile highlight di dark mode pakai `#1E3A5F` — `#EFF6FF` (light mode) tidak terbaca di dark mode karena teks putih di atas background terang

**Gotcha:**
- `MultiplayerBoard` tidak punya internal `lastMove` state — semua dari prop. Ini penting karena gerakan lawan hanya datang via FEN update dari server, bukan dari event lokal
- `socket.ts` singleton: jika `getSocket()` dipanggil dua kali, instance yang sama dikembalikan — penting agar listener tidak double

### Session 7 — 2026-04-15

#### ✅ Route Swap: Lobby jadi halaman awal

File: `apps/web/src/app/page.tsx`, `apps/web/src/app/offline-session/page.tsx`

- `/` sekarang adalah Lobby (Team Sessions), `/offline-session` adalah chessboard
- Folder `lobby/` dihapus, kontennya dipindah ke root `page.tsx`
- Semua link internal diupdate konsisten (Back to Board → `/offline-session`, Team Sessions → `/`)

#### ✅ Halaman game `/game/[roomId]` — Frontend multiplayer

File: `apps/web/src/app/game/[roomId]/page.tsx`

- Tampilan **meeting room** (dark/light theme) — sengaja beda total dari Jira-style offline
- Simulasi koneksi: `connecting` (0.9s) → `waiting` (1.3s) → `ready` (mock, belum socket)
- Warna dikontrol via `c` object (`Colors` type) berisi `bg, surface, border, text, textMuted, textFaint, ctrl` — sehingga mudah diswap saat tema berubah
- `ParticipantTile` menerima `c` sebagai prop karena berada di luar komponen utama
- Tombol "Create Session" di lobby generate ID random `MEET-Q2-XX` → redirect ke `/game/[id]`
- Tombol "Join Session" aktif jika Meeting ID diisi → redirect ke `/game/[id]`
- Tab "Offline" di lobby → `/offline-session`

#### ✅ Dark Mode Global

File: `apps/web/src/context/ThemeContext.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/globals.css`

- `ThemeContext` — simpan `theme: "light" | "dark"`, persist ke `localStorage`, apply `.dark` class ke `<html>`
- `layout.tsx` — inline script di `<head>` untuk baca localStorage sebelum React hydrate → cegah FOUC (flash of wrong theme)
- `globals.css` — tambah `@variant dark (&:is(.dark, .dark *))` untuk aktifkan `dark:` Tailwind v4
- Toggle di semua halaman: **segmented control** (Light / Dark) bukan slide toggle — konsisten dengan gaya kontrol di Board.tsx
  - Lobby: di sidebar section "Preferences"
  - Offline-session: di sidebar section "Preferences"  
  - Game page: di bottom control bar (icon-only, `hidden sm:flex`)
- `offline-session/page.tsx` harus `"use client"` karena pakai `useTheme` — sempat error karena hook dipanggil di luar komponen

**Gotcha**: `offline-session/page.tsx` adalah Server Component by default karena tidak ada `"use client"`. Setelah tambah `useTheme`, wajib tambah directive dan pindah hook ke dalam komponen.

### Session 6 — 2026-04-15

#### ✅ Responsive Fix — Board overflow di mobile

File: `apps/web/src/components/chess/Board.tsx`, `apps/web/src/app/globals.css`

- **Root cause**: controls bar kanan (mode toggle + piece toggle + level dropdown + status badge) totalnya ~400px → lebih lebar dari viewport mobile 360-375px → menyebabkan layout melar → board container ikut melar
- **Fix controls**: piece style toggle (`hidden sm:flex`) dan status badge (`hidden sm:inline`) disembunyikan di mobile agar controls muat
- **Fix board width measurement**: ganti `ResizeObserver entries.contentRect.width` → `getBoundingClientRect().width` + double `requestAnimationFrame` — pastikan layout sudah settled sebelum diukur (ResizeObserver bisa fire sebelum paint)
- **Fix container constraint**: Board root div ditambah `min-w-0 overflow-hidden w-full`, board container ditambah `min-w-0` — mencegah flex child melar melewati parent
- **globals.css**: tambah `overflow-x: hidden; max-width: 100vw` pada `html, body`
- **Stockfish di Vercel**: file WASM tidak di-commit (di `.gitignore`). Fix dengan `prebuild` script (`scripts/copy-stockfish.js`) yang copy dari `node_modules` sebelum build. Tambah `stockfish` ke `pnpm.onlyBuiltDependencies` di root `package.json`

**Gotcha**: `ResizeObserver` bisa fire sebelum browser selesai layout pass — pakai double `requestAnimationFrame` untuk hasil yang reliable di mobile.

### Session 5 — 2026-04-14

#### ✅ Responsive Layout

File: `apps/web/src/app/page.tsx`, `apps/web/src/app/lobby/page.tsx`, `apps/web/src/components/chess/Board.tsx`, `apps/web/src/components/chess/TaskClosedView.tsx`

- Sidebar hidden di mobile (`hidden md:flex`) — muncul mulai breakpoint `md`
- Right panel hidden di mobile & tablet (`hidden xl:flex`) — muncul hanya di `xl+`
- Board+History layout: `flex-col sm:flex-row`, boardWidth via `ResizeObserver`
- TaskClosedView metric cards: `flex-row sm:flex-col`

### Session 4 — 2026-04-14

#### ✅ Lobby Page UI (`/lobby`)

File: `apps/web/src/app/lobby/page.tsx`

- Halaman baru route `/lobby` — tampilan saja, belum ada koneksi socket
- Tab "New Meeting" (Create) dan "Join Meeting" — tombol disabled dengan label "coming soon"
- Recent Sessions: tabel riwayat dummy (placeholder)
- "How it works" info card dengan step-by-step
- Sidebar `page.tsx` ditambah link **Team Sessions → /lobby**
- Layout konsisten dengan `page.tsx` (Jira-style, navbar + sidebar sama)

#### ✅ Deploy & Domain

- Deploy ke Vercel: `luthfisiregar.web.id` (production, branch `main`)
- Preview env: `dev.luthfisiregar.web.id` (branch `dev`)
- Nameserver domain dipindah dari DomaiNesia ke Vercel DNS (`ns1.vercel-dns.com`) — DNS Management DomaiNesia tidak bisa dipakai lagi setelah ini, semua DNS dikelola di Vercel dashboard
- Update Next.js dari `15.3.0` → `16.2.3` karena Vercel deteksi security vulnerability saat deploy

### Session 2–3 — 2026-04-14

- Piece style toggle (Aa / ♟)
- Peek real pieces (tahan R)
- Review mode ← → dengan `fenHistory` + `viewIndex`
- Game Over Dialog (popup otomatis)
- TaskClosedView (fake analytics saat resign)
- Keyboard shortcuts (Esc, ←, →, R)
- Branding Jira, player names Luthfi/Jordan, Shortcuts panel di sidebar kanan

### Session 1 — 2026-04-13

- Setup monorepo Next.js + Tailwind v4
- Board.tsx: piece huruf, warna office-friendly, highlight, drag & drop
- BoardWrapper.tsx: SSR wrapper
- useStockfish.ts: Stockfish 18 WASM, 5 level
- MoveHistory.tsx: Activity Log, 3 kolom, auto-scroll
- page.tsx: layout Jira-style
