# Chess Online — Project Index

Website catur online real-time. Tampilan **menyamar sebagai Jira** agar tidak mencolok di kantor.

---

## Dokumen Detail

| Konteks | File |
|---------|------|
| Frontend (`apps/web/`) | [`apps/web/agents.md`](apps/web/agents.md) |
| Backend (`apps/server/`) | [`apps/server/agents.md`](apps/server/agents.md) |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 + React 19 + Tailwind v4 |
| Chess UI | react-chessboard + chess.js |
| Bot AI | Stockfish 18 WASM (Web Worker) |
| Real-time | Socket.io v4 |
| Backend | Node.js + Express |
| Types | `packages/types` (shared monorepo) |
| Package manager | pnpm workspace |

---

## Struktur Monorepo

```
chess-online/
├── apps/
│   ├── web/agents.md   → Konvensi UI, komponen, hooks, catatan teknis FE
│   └── server/agents.md → Arsitektur server, socket events, game state
├── apps/
│   ├── web/            → Next.js frontend (port 3000)
│   └── server/         → Express + Socket.io backend (port 3001)
└── packages/types/     → Shared TypeScript types
```

---

## Urutan Pengerjaan

### Frontend
1. ✅ Setup monorepo pnpm workspace
2. ✅ TypeScript types di `packages/types`
3. ✅ Board.tsx — piece huruf, office-friendly
4. ✅ Layout Jira-style (page.tsx)
5. ✅ Stockfish bot offline (useStockfish.ts)
6. ✅ MoveHistory / Activity Log
7. ✅ Piece style toggle + peek mode (R)
8. ✅ Review mode ← →
9. ✅ Game Over Dialog
10. ✅ TaskClosedView (fake analytics)
11. ✅ Keyboard shortcuts
12. ✅ Halaman lobby UI (`/lobby`) — tampilan saja, belum fungsional
13. [ ] Halaman game `/game/[roomId]`
14. [ ] SEO: sitemap, robots, meta tags

### Backend
15. [ ] GameState + RoomManager
16. [ ] Socket.io handlers (room & game)
17. [ ] Deploy ke Render / Railway

### Post-launch
18. ✅ Deploy frontend ke Vercel (`luthfisiregar.web.id`)
19. ✅ Custom domain via DomaiNesia — nameserver dipindah ke Vercel DNS
20. ✅ Branch `dev` → `dev.luthfisiregar.web.id` (preview environment)
21. [ ] Google Search Console + submit sitemap

---

## Info Penting

- **Production**: `https://luthfisiregar.web.id`
- **Preview (dev branch)**: `https://dev.luthfisiregar.web.id`
- **GitHub**: `https://github.com/luthfi55/OfficeChess.git`
- **Cara jalankan**: `pnpm dev` (FE + BE) atau `pnpm --filter web dev` (FE saja)
- **Stockfish** tidak di-commit (107MB). Setelah clone:
  ```bash
  cp node_modules/.pnpm/stockfish@18.0.7/node_modules/stockfish/bin/stockfish-18-single.js apps/web/public/stockfish/stockfish.js
  cp node_modules/.pnpm/stockfish@18.0.7/node_modules/stockfish/bin/stockfish-18-single.wasm apps/web/public/stockfish/stockfish.wasm
  ```
- **Skills**: `/chess-dev`, `/chess-review`, `/update-agents`
