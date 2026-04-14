# Backend — Chess Online

> Baca file ini saat mengerjakan `apps/server/`.

---

## Status

Backend **belum dikerjakan**. Hanya ada file placeholder.

---

## Rencana Arsitektur

```
apps/server/src/
├── index.ts                  → Entry point (Express + Socket.io init)
├── socket/
│   ├── index.ts              → Setup Socket.io server
│   └── handlers/
│       ├── roomHandler.ts    → Event: create-room, join-room, leave-room
│       └── gameHandler.ts    → Event: move, resign, draw-offer, draw-accept
└── game/
    ├── RoomManager.ts        → Manajemen semua room aktif (in-memory Map)
    └── GameState.ts          → State tiap game (chess.js instance + metadata)
```

---

## Socket Events (Rencana)

### Client → Server

| Event | Payload | Keterangan |
|-------|---------|------------|
| `create-room` | `{ playerName }` | Buat room baru, return roomId |
| `join-room` | `{ roomId, playerName }` | Join room yang ada |
| `move` | `{ roomId, from, to, promotion? }` | Kirim gerakan |
| `resign` | `{ roomId }` | Menyerah |
| `draw-offer` | `{ roomId }` | Tawarkan draw |
| `draw-accept` | `{ roomId }` | Terima draw |

### Server → Client

| Event | Payload | Keterangan |
|-------|---------|------------|
| `room-created` | `{ roomId, color }` | Konfirmasi room dibuat |
| `room-joined` | `{ roomId, color, fen }` | Konfirmasi join berhasil |
| `game-started` | `{ fen }` | Kedua pemain sudah join |
| `move-made` | `{ fen, lastMove, turn }` | Update posisi setelah gerakan |
| `game-over` | `{ result, winner }` | Game selesai |
| `error` | `{ message }` | Error handler |

---

## Game State (In-Memory)

- Tidak ada database — semua state di RAM server
- Jika server restart: semua game aktif hilang (acceptable untuk casual play)
- `RoomManager`: `Map<roomId, GameState>`
- Validasi gerakan dilakukan di **server** (bukan hanya client) via `chess.js`

---

## Environment

```
PORT=3001
CLIENT_URL=http://localhost:3000   # dev
# CLIENT_URL=https://your-frontend.vercel.app  # production
```

---

## Cara Jalankan

```bash
pnpm --filter server dev   # dev dengan hot reload (tsx watch)
pnpm --filter server build # compile ke dist/
```

---

## Hosting

| Opsi | Biaya | Catatan |
|------|-------|---------|
| Render.com | Gratis | Sleep setelah 15 menit idle |
| Railway | ~Rp 75.000/bln | Lebih stabil, tidak sleep |

---

## Catatan Teknis Backend

- Gunakan `chess.js` di server untuk validasi — jangan percaya move dari client
- CORS harus allow origin frontend (set via `CLIENT_URL` env)
- Socket.io room = chess room (gunakan `socket.join(roomId)`)
- Cleanup room saat semua pemain disconnect

---

## Progress Log Backend

*(Belum ada — backend belum dikerjakan)*
