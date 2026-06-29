// ===== REVIEWS & TESTIMONIALS DATA =====

const REVIEWS = [
  {
    id: 1,
    name: 'Hendra Wijaya',
    title: 'CEO',
    company: 'PT Kencana Maju Bersama',
    avatarColor: '#4285f4',
    rating: 5,
    review: 'ERP-nya beneran ngubah cara kami kerja — 30+ perusahaan dikelola dari satu sistem, closing bulanan dari 2 minggu jadi 2 hari. Tapi yang paling berkesan itu after-service-nya. Pernah ada issue kritis jam 10 malam, tim Magintek respons dalam hitungan menit dan selesai sebelum tengah malam. Itu bukan hal kecil buat kami.',
    date: '2 months ago',
    projectType: 'Enterprise ERP',
    badge: '⚡ Fast Response'
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    title: 'Operations Director',
    company: 'DAT Indonesia',
    avatarColor: '#ea4335',
    rating: 5,
    review: 'Udah coba 2 vendor sebelumnya dan kecewa. Magintek beda — mereka ngerti bisnis kami dulu baru coding. Revenue online naik 300% dalam 3 bulan. Dan setiap kali ada pertanyaan atau gangguan kecil, dibalas cepat, ga pernah nunggu lebih dari beberapa menit. Servis-nya konsisten dari awal sampai sekarang.',
    date: '3 months ago',
    projectType: 'E-Commerce Platform',
    badge: '🏆 Consistent Service'
  },
  {
    id: 3,
    name: 'Budi Santoso',
    title: 'Project Manager',
    company: 'Petrokimia Gresik',
    avatarColor: '#34a853',
    rating: 5,
    review: 'Fleet 200+ kendaraan sebelumnya dipantau manual via telepon, sekarang real-time semua. Tim Magintek mau turun langsung ke lapangan buat survey kondisi operasional dulu — itu yang bikin sistemnya cocok beneran. Kalau ada trouble, support mereka always on, respons ga pernah lebih dari 5 menit.',
    date: '4 months ago',
    projectType: 'Fleet Management System',
    badge: '⚡ Always On Support'
  },
  {
    id: 4,
    name: 'Ari Kusuma',
    title: 'Store Manager',
    company: 'iPhone Gresik',
    avatarColor: '#fbbc05',
    rating: 4,
    review: 'POS-nya user-friendly, staff langsung paham tanpa training panjang. Ada minor bug di fitur retur pas awal launch — saya WA tim Magintek, dalam 15 menit sudah ada yang handle, dan sejam kemudian beres. Respons secepat itu bikin saya tenang kalau ada masalah di kemudian hari.',
    date: '5 months ago',
    projectType: 'POS & Inventory',
    badge: '⚡ 15-Min Response'
  },
  {
    id: 5,
    name: 'Rahma Wijaya',
    title: 'Product Manager',
    company: 'Laracamp',
    avatarColor: '#a142f4',
    rating: 5,
    review: 'Saat promo besar pertama, traffic naik 8x dalam 2 jam dan platform tetap stabil. Yang ga kalah penting: tim Magintek standby selama event berlangsung, pantau bareng kami dari jauh dan siap intervensi kalau ada anomali. Itu level of care yang jarang kamu temuin dari vendor lain.',
    date: '5 months ago',
    projectType: 'E-Learning + DevOps',
    badge: '🛡️ Proactive Standby'
  },
  {
    id: 6,
    name: 'Yusuf Rianto',
    title: 'Technical Lead',
    company: 'GAPULO — Kemenparekraf',
    avatarColor: '#00bcd4',
    rating: 5,
    review: 'Proyek pemerintah: deadline kaku, budget fix, wajib lolos audit keamanan. Magintek deliver on-time dan app dapat 4.7★ di Play Store. Waktu ada feedback dari tim audit mendadak, mereka langsung revisi hari itu juga tanpa drama. Komunikasinya selalu cepat dan to the point.',
    date: '6 months ago',
    projectType: 'Flutter App + Chatbot',
    badge: '✅ On-Time Delivery'
  },
  {
    id: 7,
    name: 'Dian Pramesti',
    title: 'Finance Manager',
    company: 'Sinergi Gula Nusantara',
    avatarColor: '#ff7043',
    rating: 5,
    review: 'Proses PO/PR dari 5 hari jadi 8 jam. Tapi yang saya appreciate adalah cara Magintek handle request perubahan — ga pernah nolak atau lelet. Tiap kali ada kebutuhan baru dari tim finance, mereka langsung diskusi dan kasih estimasi yang realistis. Responnya cepat, ga bikin nunggu lama.',
    date: '7 months ago',
    projectType: 'Financial Platform',
    badge: '💬 Responsive Team'
  },
  {
    id: 8,
    name: 'Faisal Azhar',
    title: 'IT Director',
    company: 'PENS Surabaya',
    avatarColor: '#607d8b',
    rating: 4,
    review: 'SIPINBAR reliable untuk audit akreditasi. Ada beberapa fitur yang baru tersedia di fase 2, tapi Magintek komunikasiin roadmap-nya dari awal jadi ga ada surprise. Setiap laporan bug dari tim kami selalu direspons cepat — rata-rata kurang dari 10 menit. Itu standar support yang saya harapin.',
    date: '8 months ago',
    projectType: 'Campus Asset Management',
    badge: '⚡ 10-Min Bug Response'
  },
  {
    id: 9,
    name: 'Reza Pratama',
    title: 'Founder',
    company: 'Radja Kompor',
    avatarColor: '#4caf50',
    rating: 5,
    review: 'Sebagai UMKM kami khawatir soal budget dan after-sales. Keduanya terjawab. Magintek bantu prioritize fitur yang paling impactful dulu, dan setelah launch mereka masih aktif follow up kalau ada yang perlu diperbaiki. Balik modal dalam 2 bulan, dan sampai sekarang masih bisa hubungi kapanpun.',
    date: '9 months ago',
    projectType: 'Website + E-Commerce',
    badge: '🤝 Long-Term Support'
  },
  {
    id: 10,
    name: 'Citra Dewi',
    title: 'Project Lead',
    company: 'Fasindo Property',
    avatarColor: '#e91e63',
    rating: 5,
    review: 'Sales cycle turun 40% setelah pakai app dari Magintek. Pernah malam sebelum soft launch ada bug display di peta interaktif — saya chat tim mereka jam 11 malam, dan dalam 20 menit sudah di-handle. Besok paginya launch berjalan mulus. Itu momen yang bikin saya rekomendasiin Magintek ke kolega.',
    date: '10 months ago',
    projectType: 'Real Estate Super App',
    badge: '⚡ Crisis Handled Fast'
  }
];

const REVIEW_STATS = {
  totalReviews: 10,
  averageRating: 4.8,
  clientRetentionRate: '95%',
  clientSatisfaction: '100%'
};
