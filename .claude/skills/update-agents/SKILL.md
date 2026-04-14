---
name: update-agents
description: Update agents.md dengan semua perubahan terbaru dari sesi ini agar selalu sinkron dengan kondisi kode
---

# Update Agents — Skill

Tugasmu adalah memperbarui `agents.md` berdasarkan **apa yang sudah dibahas dan dikerjakan di sesi chat ini**.

## Penting: Jangan baca ulang file source

Gunakan konteks yang **sudah ada di percakapan ini**. Jangan baca ulang file yang sudah dibaca — itu boros token.
Satu-satunya file yang perlu dibaca adalah `agents.md` itu sendiri, untuk tahu bagian mana yang perlu diubah.

## Langkah-langkah

### 1. Baca file yang relevan
- Jika sesi ini mengerjakan frontend → baca `apps/web/agents.md`
- Jika sesi ini mengerjakan backend → baca `apps/server/agents.md`
- Jika ada perubahan urutan pengerjaan atau info umum → baca juga `agents.md`

Jangan baca semua file sekaligus — hanya yang relevan dengan sesi ini.

### 2. Rangkum perubahan dari sesi ini
Dari percakapan yang sudah berlangsung, identifikasi:
- File apa saja yang dibuat atau diubah
- Fitur baru apa yang ditambahkan
- Bug fix atau perubahan perilaku penting
- Keputusan desain yang dibuat

### 3. Update agents.md secara surgical
Hanya ubah bagian yang relevan — jangan tulis ulang seluruh file.

**Bagian yang mungkin perlu diupdate:**
- **Urutan Pengerjaan** — tandai ✅ langkah yang selesai, tambah sub-langkah baru
- **Struktur Project** — tambah file/folder baru ke diagram
- **Catatan** — tambah gotcha atau keputusan teknis baru
- **Progress Log** — tambah entry session baru:

```markdown
### Session N — YYYY-MM-DD

#### ✅ [Nama Fitur]

File: `path/ke/file.tsx`

- Apa yang berubah (singkat)
- Keputusan desain non-obvious
- Gotcha / bug fix penting
- State atau props baru yang penting
```

## Aturan penulisan
- Bahasa Indonesia
- Catat hal yang **tidak obvious dari membaca kode**
- Catat **alasan** di balik keputusan, bukan hanya "apa"-nya
- Tanggal absolut (YYYY-MM-DD)
- Jangan duplikasi isi kode ke dokumentasi

## Yang TIDAK perlu dicatat
- Detail implementasi yang trivial
- Konfigurasi boilerplate
- Hal yang sudah jelas dari nama fungsi/variabel
