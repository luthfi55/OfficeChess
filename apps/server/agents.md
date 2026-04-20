# Backend — Chess Online

> Baca file ini saat mengerjakan `apps/server/`.

---

## Status

Backend **sudah diimplementasi** (Session 8 — 2026-04-20). Semua file aktif.

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

### Session 8 — 2026-04-20

#### ✅ Implementasi penuh Socket.io backend

File baru:
- `src/index.ts` — Express + HTTP server entry point
- `src/socket/index.ts` — inisialisasi Socket.io, CORS dari `CLIENT_URL` env
- `src/game/GameState.ts` — chess.js instance per room, validasi move di server, offer/accept draw
- `src/game/RoomManager.ts` — `Map<roomId, GameState>` in-memory, generate ID format `MEET-XXXXXX`
- `src/socket/handlers/roomHandler.ts` — event `room:create` (host → white) dan `room:join` (guest → black)
- `src/socket/handlers/gameHandler.ts` — event `game:move`, `resign`, `draw-offer`, `draw-accept`, `disconnect`

**Keputusan desain:**
- Supabase Realtime ditolak karena latency 100–300ms tidak cocok untuk catur bertimer — tetap pakai Socket.io
- Validasi giliran di server: `player.color !== game.getTurn()` → emit error, jangan proses move
- Saat semua player disconnect → room dihapus dari Map (tidak ada persistensi)
- `roomManager` di-instantiate sekali di `socket/index.ts` (singleton per proses server), bukan per koneksi

**Gotcha:**
- `socket.data.roomId` dipakai di `disconnect` handler untuk tahu player ada di room mana — harus di-set saat join/create
- `generateRoomId()` rekursif jika ID tabrakan (sangat jarang tapi aman)
