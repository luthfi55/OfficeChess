---
name: chess-dev
description: Skill untuk development project chess-online yang menyamar sebagai project management app
---

# Chess Online — Developer Skill

Kamu adalah developer untuk project **chess-online**, sebuah website catur real-time yang tampilannya **menyamar sebagai aplikasi project management** agar tidak mencolok di kantor.

## Langkah Pertama

Sebelum mulai coding, baca dokumen yang sesuai konteks:
- `agents.md` — index ringkas: tech stack, struktur, urutan pengerjaan
- `apps/web/agents.md` — detail konvensi UI, komponen, hooks (baca ini saat kerjakan `apps/web/`)
- `apps/server/agents.md` — arsitektur server, socket events (baca ini saat kerjakan `apps/server/`)

Jangan baca keduanya sekaligus — pilih sesuai area yang sedang dikerjakan.

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind
- **Chess**: react-chessboard + chess.js
- **Real-time**: Socket.io
- **Backend**: Node.js + Express
- **Package manager**: pnpm (monorepo workspace)

## Konvensi Penting

### Piece Catur = Huruf (FEN Notation)

Piece TIDAK menggunakan gambar/emoji, tapi huruf biasa agar terlihat seperti tabel data:

| Piece | Putih | Hitam |
|-------|-------|-------|
| King | `K` (bold, #1F2937) | `k` (regular, #2563EB) |
| Queen | `Q` | `q` |
| Rook | `R` | `r` |
| Bishop | `B` | `b` |
| Knight | `N` | `n` |
| Pawn | `P` | `p` |

### Warna Papan (Office-Friendly)

```
Terang:   #F9FAFB  (abu-abu muda)
Gelap:    #D1D5DB  (abu-abu sedang)
Selected: #BFDBFE  (biru muda)
Last move:#FEF9C3  (kuning muda)
```

### Label UI yang Disamarkan

Selalu gunakan label ini, JANGAN gunakan terminologi catur langsung:

| Elemen Game | Label di UI |
|-------------|------------|
| Timer | "Session Time" |
| Giliran pemain | "Assigned to: [nama]" |
| Riwayat gerakan | "Activity Log" |
| Tombol Resign | "Close Task" |
| Tombol Draw | "Mark Resolved" |
| Room ID | "Meeting ID" |
| Notifikasi giliran | "You have a pending review" |

## Struktur Folder

```
chess-online/
├── apps/
│   ├── web/src/
│   │   ├── app/                    → Next.js App Router
│   │   ├── components/chess/       → Board, Controls, MoveHistory
│   │   ├── components/lobby/       → CreateRoom, JoinRoom
│   │   ├── hooks/                  → useSocket, useChessGame
│   │   └── lib/socket.ts
│   └── server/src/
│       ├── socket/handlers/        → roomHandler, gameHandler
│       └── game/                   → RoomManager, GameState
└── packages/types/index.ts         → Shared TypeScript types
```

## Aturan Coding

1. Selalu gunakan TypeScript dengan types dari `packages/types`
2. Game state hanya di **in-memory server** (tidak ada database)
3. Gunakan pnpm, bukan npm/yarn
4. Socket events harus konsisten antara frontend dan backend
5. Validasi gerakan catur dilakukan di **server** (bukan hanya client)

## Urutan Pengerjaan (jika memulai dari awal)

1. Setup monorepo pnpm workspace
2. TypeScript types di `packages/types`
3. Backend: GameState + RoomManager
4. Backend: Socket.io handlers
5. Frontend: hooks (useSocket + useChessGame)
6. Frontend: Board component (piece = huruf)
7. Frontend: Lobby (CreateRoom + JoinRoom)
8. Frontend: Game page `/game/[roomId]`
9. SEO: layout, sitemap, robots, meta tags
10. Deploy: Vercel (FE) + Render (BE)
