---
name: chess-review
description: Review kode chess-online untuk memastikan tampilan tetap menyamar dan konvensi terjaga
---

# Chess Online — Code Review Skill

Lakukan review kode pada file yang diberikan atau yang baru saja diubah.

## Checklist Review

### 1. Penyamaran UI
- [ ] Tidak ada teks "chess", "catur", "king", "queen" dll yang terlihat oleh user
- [ ] Label sudah diganti sesuai konvensi (lihat agents.md)
- [ ] Piece menggunakan huruf, bukan gambar/emoji

### 2. Warna & Tampilan
- [ ] Warna papan menggunakan palet office-friendly (#F9FAFB, #D1D5DB)
- [ ] Tidak ada warna mencolok yang tidak sesuai tema enterprise

### 3. Kode Quality
- [ ] TypeScript types digunakan dari `packages/types`
- [ ] Tidak ada `any` type yang tidak perlu
- [ ] Socket events konsisten antara client dan server
- [ ] Validasi gerakan dilakukan di server-side

### 4. Real-time
- [ ] Socket.io events menggunakan nama yang jelas
- [ ] Error handling untuk disconnect/reconnect
- [ ] Room cleanup saat semua pemain keluar

### 5. SEO (untuk halaman publik)
- [ ] Meta title dan description ada
- [ ] Open Graph tags ada
- [ ] Tidak ada konten catur yang terekspos di meta tags

## Output Review

Berikan feedback dalam format:
- **Lulus**: Item yang sudah benar
- **Perlu diperbaiki**: Item yang harus diubah + alasan
- **Saran**: Improvement opsional
