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
│   ├── page.tsx              → Layout Jira + embed BoardWrapper
│   ├── layout.tsx            → Meta SEO global
│   ├── globals.css           → @import "tailwindcss"
│   └── game/[roomId]/page.tsx → (planned) Multiplayer game page
│
├── components/chess/
│   ├── Board.tsx             → Komponen utama (semua state game)
│   ├── BoardWrapper.tsx      → SSR wrapper (dynamic import, ssr: false)
│   ├── MoveHistory.tsx       → Activity Log panel
│   └── TaskClosedView.tsx    → Fake analytics saat resign
│
└── hooks/
    └── useStockfish.ts       → Stockfish 18 UCI Web Worker wrapper
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

### Session 5 — 2026-04-14

#### ✅ Responsive Layout

File: `apps/web/src/app/page.tsx`, `apps/web/src/app/lobby/page.tsx`, `apps/web/src/components/chess/Board.tsx`, `apps/web/src/components/chess/TaskClosedView.tsx`

- Sidebar hidden di mobile (`hidden md:flex`) — muncul mulai breakpoint `md`
- Right panel hidden di mobile & tablet (`hidden xl:flex`) — muncul hanya di `xl+`
- Padding main content: `p-3 md:p-6`
- Content area board: `flex-col xl:flex-row` (stack di bawah xl, side-by-side di xl+)
- Board+History layout: `flex-col sm:flex-row` — stack di mobile, side-by-side di sm+
- **boardWidth dinamis** via `ResizeObserver` pada container div — tidak lagi hardcoded 460px. Min 240, max 460. MoveHistory `maxHeight` juga mengikuti `boardWidth`
- TaskClosedView metric cards: `flex-row sm:flex-col` — horizontal scroll di mobile, stack vertikal di sm+
- Lobby page: Create/Join + Recent Sessions stack di mobile (`flex-col md:flex-row`)

**Keputusan desain:** `ResizeObserver` dipilih daripada `window.innerWidth` + resize listener karena mengukur lebar container langsung (lebih akurat saat layout berubah karena sidebar/panel muncul/hilang).

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
