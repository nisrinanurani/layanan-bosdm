// ============================================================
//  permissions.js – Utility RBAC Helper
//  Digunakan di App.jsx dan semua halaman terproteksi
// ============================================================

/** Default permissions: semua false (pegawai biasa tanpa izin khusus) */
export const DEFAULT_PERMISSIONS = {
    berita:     { view: false, edit: false, delete: false },
    dokumen:    { view: false, edit: false, delete: false, manage_kategori: false },
    grafik:     { view: false, edit: false, delete: false, publish: false },
    semua_link: { view: false, edit: false, delete: false, manage_fungsi: false },
    profil:     { view: false, edit: false },
    lapor:      { view: false, edit: false },
    tanya:      { view: false, edit: false, delete: false },
};

/** Full permissions: semua true (superadmin) */
export const FULL_PERMISSIONS = {
    berita:     { view: true, edit: true, delete: true },
    dokumen:    { view: true, edit: true, delete: true, manage_kategori: true },
    grafik:     { view: true, edit: true, delete: true, publish: true },
    semua_link: { view: true, edit: true, delete: true, manage_fungsi: true },
    profil:     { view: true, edit: true },
    lapor:      { view: true, edit: true },
    tanya:      { view: true, edit: true, delete: true },
};

/**
 * Build permissions object dari userData.
 * - userData.is_superadmin → FULL_PERMISSIONS
 * - userData.permissions    → merge dengan DEFAULT (agar field baru tidak hilang)
 * - default                 → DEFAULT_PERMISSIONS
 */
export function buildPermissions(userData) {
    if (!userData) return DEFAULT_PERMISSIONS;
    if (userData.is_superadmin) return FULL_PERMISSIONS;
    if (!userData.permissions) return DEFAULT_PERMISSIONS;

    // Merge: pastikan semua modul & key ada
    const merged = {};
    for (const module in DEFAULT_PERMISSIONS) {
        merged[module] = {
            ...DEFAULT_PERMISSIONS[module],
            ...(userData.permissions[module] || {}),
        };
    }
    return merged;
}

/**
 * Helper: cek apakah user punya akses ke suatu modul dan aksi.
 * Contoh: can(permissions, 'grafik', 'edit')
 */
export function can(permissions, module, action) {
    return !!(permissions?.[module]?.[action]);
}

/**
 * Daftar modul dan label tampilan (digunakan di KelolaUser)
 */
export const MODULE_DEFINITIONS = [
    {
        key: 'berita',
        label: 'Berita BOSDM',
        icon: '📰',
        actions: [
            { key: 'view',   label: 'Lihat' },
            { key: 'edit',   label: 'Buat/Edit' },
            { key: 'delete', label: 'Hapus' },
        ],
    },
    {
        key: 'dokumen',
        label: 'Download Dokumen',
        icon: '📁',
        actions: [
            { key: 'view',            label: 'Lihat' },
            { key: 'edit',            label: 'Upload/Edit' },
            { key: 'delete',          label: 'Hapus' },
            { key: 'manage_kategori', label: 'Kelola Kategori' },
        ],
    },
    {
        key: 'grafik',
        label: 'Grafik Kepegawaian',
        icon: '📊',
        actions: [
            { key: 'view',    label: 'Lihat' },
            { key: 'edit',    label: 'Tambah/Edit' },
            { key: 'delete',  label: 'Hapus' },
            { key: 'publish', label: 'Publish' },
        ],
    },
    {
        key: 'semua_link',
        label: 'Kumpulan Link',
        icon: '🔗',
        actions: [
            { key: 'view',          label: 'Lihat' },
            { key: 'edit',          label: 'Tambah/Edit' },
            { key: 'delete',        label: 'Hapus' },
            { key: 'manage_fungsi', label: 'Kelola Fungsi' },
        ],
    },
    {
        key: 'profil',
        label: 'Profil Biro',
        icon: '🏛️',
        actions: [
            { key: 'view', label: 'Lihat' },
            { key: 'edit', label: 'Edit Konten' },
        ],
    },
    {
        key: 'lapor',
        label: 'Admin Lapor KAK!',
        icon: '🛡️',
        actions: [
            { key: 'view', label: 'Lihat Laporan' },
            { key: 'edit', label: 'Update Status' },
        ],
    },
    {
        key: 'tanya',
        label: 'Tanya Kami',
        icon: '💬',
        actions: [
            { key: 'view',   label: 'Lihat' },
            { key: 'edit',   label: 'Balas' },
            { key: 'delete', label: 'Hapus' },
        ],
    },
];
