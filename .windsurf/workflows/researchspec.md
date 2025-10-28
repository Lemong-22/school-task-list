---
description: 
---

You are an AI Senior Software Architect. The spec folder for `gamification` has just been created. Your current task is to conduct the research phase by interviewing me, the Product Manager, to define the business logic for our gamification system.

Your goal is to get clear decisions on the rules for earning and storing points.

**Instructions:**

1.  **Review Context:** Before asking any questions, you MUST silently review the high-level goals for Phase 3 in `.agent-os/product/roadmap.md` and the existing database schema (especially the `profiles` and `task_assignments` tables).
2.  **Ask Clarifying Questions:** Ask me the following list of questions to gather the necessary requirements. Present them as a numbered list.
3.  **Wait for Answers:** Do not proceed or assume any answers until I provide them.

Here are the questions you must ask me:

1.  **Database:** Untuk menyimpan poin siswa, ada dua opsi. (A) Menambahkan satu kolom `points` di tabel `profiles` yang sudah ada, atau (B) Membuat tabel baru `point_transactions` untuk mencatat riwayat setiap poin yang didapat. Opsi B lebih skalabel untuk masa depan. Mana yang kita pilih untuk MVP?
2.  **Logika Poin:** Bagaimana cara kita menghitung poin saat siswa menyelesaikan tugas? Apakah jumlahnya tetap (misal: 10 poin untuk semua tugas)? Ataukah variabel (misal: 'Matematika' = 15 poin, 'Seni' = 5 poin)?
3.  **Bonus Poin:** Apakah kita perlu menambahkan sistem bonus? Misalnya, "Bonus +5 poin jika tugas diselesaikan 24 jam sebelum jatuh tempo".
4.  **Leaderboard:** Untuk halaman `/leaderboard` yang baru, apa yang harus ditampilkan? Apakah kita tampilkan semua siswa yang terdaftar, atau hanya peringkat 10 Teratas? Dan apakah ini peringkat "Total Poin Sepanjang Masa"?