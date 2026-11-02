/**
 * SCRIPT.JS - UTS PEMROGRAMAN WEB 1
 * Sistem Pemesanan Buku Online Sederhana
 * Menggunakan data dari data.js tanpa mengubah variabel aslinya.
 */

// ========================================================
// 1. DATA INITIALIZATION & STORAGE HELPER
// ========================================================

/**
 * Mengambil data katalog buku dari localStorage.
 * Jika belum ada, inisialisasi dari dataKatalogBuku (data.js).
 */
function getKatalogBuku() {
    var stored = localStorage.getItem('katalogBuku');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Gagal parse katalogBuku dari localStorage:", e);
        }
    }
    // Deep clone dataKatalogBuku agar variabel di data.js tidak termutasi langsung
    var awal = JSON.parse(JSON.stringify(typeof dataKatalogBuku !== 'undefined' ? dataKatalogBuku : []));
    localStorage.setItem('katalogBuku', JSON.stringify(awal));
    return awal;
}

/**
 * Menyimpan data katalog buku ke localStorage
 */
function simpanKatalogBuku(data) {
    localStorage.setItem('katalogBuku', JSON.stringify(data));
}

/**
 * Mengambil data tracking dari localStorage.
 * Jika belum ada, inisialisasi dari dataTracking (data.js).
 */
function getTrackingData() {
    var stored = localStorage.getItem('dataTrackingApp');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Gagal parse dataTrackingApp dari localStorage:", e);
        }
    }
    var awal = JSON.parse(JSON.stringify(typeof dataTracking !== 'undefined' ? dataTracking : {}));
    localStorage.setItem('dataTrackingApp', JSON.stringify(awal));
    return awal;
}

/**
 * Menyimpan data tracking ke localStorage
 */
function simpanTrackingData(data) {
    localStorage.setItem('dataTrackingApp', JSON.stringify(data));
}

/**
 * Mengambil keranjang belanja dari localStorage
 */
function getKeranjang() {
    var cart = localStorage.getItem('keranjangBuku');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Menyimpan keranjang belanja ke localStorage
 */
function simpanKeranjang(cart) {
    localStorage.setItem('keranjangBuku', JSON.stringify(cart));
}

// ========================================================
// 2. AUTHENTICATION & SESSION MANAGEMENT
// ========================================================

/**
 * Mendapatkan data pengguna yang sedang login
 */
function getCurrentUser() {
    var user = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Menyimpan pengguna yang login
 */
function setCurrentUser(user, remember) {
    var userJson = JSON.stringify(user);
    if (remember) {
        localStorage.setItem('currentUser', userJson);
    }
    sessionStorage.setItem('currentUser', userJson);
}

/**
 * Logout pengguna
 */
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    showNotification("Anda telah berhasil logout.", "info");
    setTimeout(function() {
        window.location.href = "login.html";
    }, 600);
}

/**
 * Cek autentikasi pada halaman yang memerlukan login
 */
function checkAuthProtection(isLoginPage) {
    var user = getCurrentUser();
    if (!isLoginPage && !user) {
        // Belum login, arahkan ke login.html
        window.location.href = "login.html";
    } else if (isLoginPage && user) {
        // Sudah login tapi akses login.html, arahkan ke dashboard
        window.location.href = "dashboard.html";
    }
}

/**
 * Memperbarui info pengguna pada Navbar di seluruh halaman
 */
function renderNavbarUser() {
    var user = getCurrentUser();
    var navUserContainer = document.getElementById('navUserContainer');
    if (!navUserContainer) return;

    if (user) {
        navUserContainer.innerHTML = `
            <div class="user-badge">
                <span>👤 <strong>${user.nama}</strong></span>
                <span class="user-role-badge">${user.role}</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="logoutUser()" title="Keluar">
                🚪 Logout
            </button>
        `;
    } else {
        navUserContainer.innerHTML = `
            <a href="login.html" class="btn btn-sm btn-primary">
                🔑 Masuk
            </a>
        `;
    }
}

// ========================================================
// 3. UI NOTIFICATIONS & TOASTS
// ========================================================

/**
 * Menampilkan pesan notifikasi toast melayang
 */
function showNotification(message, type) {
    type = type || 'info'; // 'success', 'error', 'warning', 'info'
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    var icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3500);
}

/**
 * Format string atau number ke format Rupiah
 */
function formatRupiah(angka) {
    if (typeof angka === 'string') {
        var clean = angka.replace(/[^0-9]/g, '');
        angka = parseInt(clean, 10) || 0;
    }
    return "Rp " + angka.toLocaleString('id-ID');
}

/**
 * Parsing harga string "Rp 180.000" menjadi angka number 180000
 */
function parseHargaNumber(hargaStr) {
    if (typeof hargaStr === 'number') return hargaStr;
    if (!hargaStr) return 0;
    var cleaned = hargaStr.toString().replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
}

// ========================================================
// 4. LOGIN PAGE LOGIC
// ========================================================

function initLoginPage() {
    checkAuthProtection(true);

    var form = document.getElementById('loginForm');
    var emailInput = document.getElementById('loginEmail');
    var passwordInput = document.getElementById('loginPassword');
    var alertBox = document.getElementById('loginAlert');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var email = emailInput.value.trim();
        var password = passwordInput.value.trim();

        // Validasi form kosong
        if (!email || !password) {
            showAlert(alertBox, "Email dan password wajib diisi!", "danger");
            return;
        }

        // Cari pengguna di dataPengguna (dari data.js)
        var matchedUser = null;
        if (typeof dataPengguna !== 'undefined' && Array.isArray(dataPengguna)) {
            for (var i = 0; i < dataPengguna.length; i++) {
                if (dataPengguna[i].email.toLowerCase() === email.toLowerCase() && 
                    dataPengguna[i].password === password) {
                    matchedUser = dataPengguna[i];
                    break;
                }
            }
        }

        if (matchedUser) {
            // Berhasil login
            setCurrentUser(matchedUser, true);
            showAlert(alertBox, "Login berhasil! Mengalihkan ke Dashboard...", "success");
            showNotification("Selamat datang, " + matchedUser.nama + "!", "success");
            setTimeout(function() {
                window.location.href = "dashboard.html";
            }, 800);
        } else {
            // Gagal login
            showAlert(alertBox, "Email atau password salah. Silakan coba lagi.", "danger");
            showNotification("Email atau password tidak cocok!", "error");
        }
    });
}

/**
 * Helper untuk quick-fill akun demo pada halaman login
 */
function fillDemoAccount(email, password) {
    var emailInput = document.getElementById('loginEmail');
    var passwordInput = document.getElementById('loginPassword');
    if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password;
        showNotification("Akun demo dipilih: " + email, "info");
    }
}

function showAlert(alertEl, message, type) {
    if (!alertEl) return;
    alertEl.className = "alert alert-" + type;
    alertEl.style.display = "block";
    alertEl.innerHTML = (type === 'success' ? '✅ ' : '⚠️ ') + message;
}

// ========================================================
// 5. DASHBOARD PAGE LOGIC
// ========================================================

function initDashboardPage() {
    checkAuthProtection(false);
    renderNavbarUser();

    var user = getCurrentUser();
    var welcomeEl = document.getElementById('welcomeUserMsg');
    if (welcomeEl && user) {
        welcomeEl.textContent = user.nama + " (" + user.role + ")";
    }

    var katalog = getKatalogBuku();
    var tracking = getTrackingData();

    // Hitung statistik
    var totalJudul = katalog.length;
    var totalStok = katalog.reduce(function(acc, item) {
        return acc + (parseInt(item.stok, 10) || 0);
    }, 0);
    var totalUsers = (typeof dataPengguna !== 'undefined') ? dataPengguna.length : 0;
    var totalDO = Object.keys(tracking).length;

    var elJudul = document.getElementById('statTotalJudul');
    var elStok = document.getElementById('statTotalStok');
    var elUsers = document.getElementById('statTotalUsers');
    var elDO = document.getElementById('statTotalDO');

    if (elJudul) elJudul.textContent = totalJudul;
    if (elStok) elStok.textContent = totalStok.toLocaleString('id-ID');
    if (elUsers) elUsers.textContent = totalUsers;
    if (elDO) elDO.textContent = totalDO;

    // Render Preview Buku Pilihan
    var featuredContainer = document.getElementById('featuredBooksContainer');
    if (featuredContainer) {
        var previewList = katalog.slice(0, 3);
        featuredContainer.innerHTML = previewList.map(function(buku) {
            return `
                <div class="book-card">
                    <div class="book-cover-wrap">
                        <img src="${buku.cover}" alt="${buku.namaBarang}" class="book-cover" onerror="this.onerror=null; this.src='img/pengantar_komunikasi.jpg';">
                        <span class="book-badge">${buku.jenisBarang}</span>
                    </div>
                    <div class="book-details">
                        <span class="book-code">${buku.kodeBarang} - Edisi ${buku.edisi}</span>
                        <h4 class="book-title">${buku.namaBarang}</h4>
                        <div class="book-price-stock">
                            <span class="book-price">${buku.harga}</span>
                            <span class="book-stock-badge ${buku.stok > 100 ? 'stock-in' : 'stock-low'}">Stok: ${buku.stok}</span>
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-sm btn-primary btn-block" onclick="pesanBukuLangsung('${buku.kodeBarang}')">
                                🛒 Pesan Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ========================================================
// 6. STOK PAGE LOGIC (KATALOG & TAMBAH STOK)
// ========================================================

var currentStokViewMode = 'grid'; // 'grid' atau 'table'

function initStokPage() {
    checkAuthProtection(false);
    renderNavbarUser();

    renderKatalogStok();

    // Event listener pencarian
    var searchInput = document.getElementById('searchBukuInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderKatalogStok(this.value.trim());
        });
    }

    // Modal Tambah Stok Form
    var formTambahStok = document.getElementById('formTambahStokModal');
    if (formTambahStok) {
        formTambahStok.addEventListener('submit', function(e) {
            e.preventDefault();
            var selectKode = document.getElementById('modalSelectBuku').value;
            var inputJumlah = parseInt(document.getElementById('modalJumlahStok').value, 10);

            if (!selectKode) {
                showNotification("Silakan pilih buku terlebih dahulu!", "warning");
                return;
            }
            if (isNaN(inputJumlah) || inputJumlah <= 0) {
                showNotification("Jumlah penambahan harus berupa angka lebih dari 0!", "error");
                return;
            }

            prosesTambahStok(selectKode, inputJumlah);
            tutupModalStok();
        });
    }

    // Populate dropdown pilihan buku di modal
    populateModalBookOptions();
}

/**
 * Render dataKatalogBuku secara dinamis
 */
function renderKatalogStok(keyword) {
    var katalog = getKatalogBuku();
    var container = document.getElementById('katalogContainer');
    if (!container) return;

    keyword = (keyword || '').toLowerCase();

    var filtered = katalog.filter(function(buku) {
        return buku.namaBarang.toLowerCase().includes(keyword) ||
               buku.kodeBarang.toLowerCase().includes(keyword) ||
               buku.jenisBarang.toLowerCase().includes(keyword);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</p>
                <h3 style="color: var(--gray-700);">Buku tidak ditemukan</h3>
                <p style="color: var(--gray-500);">Tidak ada buku yang sesuai dengan kata kunci "${keyword}".</p>
            </div>
        `;
        return;
    }

    if (currentStokViewMode === 'table') {
        container.innerHTML = `
            <div class="table-responsive" style="grid-column: 1 / -1;">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Cover</th>
                            <th>Kode</th>
                            <th>Judul Buku</th>
                            <th>Jenis</th>
                            <th>Edisi</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            <th style="text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(function(buku) {
                            var badgeClass = buku.stok > 200 ? 'stock-in' : (buku.stok > 0 ? 'stock-low' : 'stock-out');
                            return `
                                <tr>
                                    <td>
                                        <img src="${buku.cover}" alt="${buku.namaBarang}" class="table-cover-thumb" onerror="this.onerror=null; this.src='img/pengantar_komunikasi.jpg';">
                                    </td>
                                    <td><strong>${buku.kodeBarang}</strong></td>
                                    <td>${buku.namaBarang}</td>
                                    <td><span class="user-badge">${buku.jenisBarang}</span></td>
                                    <td>Edisi ${buku.edisi}</td>
                                    <td><strong style="color: var(--primary);">${buku.harga}</strong></td>
                                    <td><span class="book-stock-badge ${badgeClass}">${buku.stok} eks</span></td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-sm btn-outline" onclick="bukaModalTambahStokKhusus('${buku.kodeBarang}')">
                                            ➕ Tambah Stok
                                        </button>
                                        <button class="btn btn-sm btn-primary" onclick="pesanBukuLangsung('${buku.kodeBarang}')">
                                            🛒 Beli
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(function(buku) {
            var badgeClass = buku.stok > 200 ? 'stock-in' : (buku.stok > 0 ? 'stock-low' : 'stock-out');
            return `
                <div class="book-card">
                    <div class="book-cover-wrap">
                        <img src="${buku.cover}" alt="${buku.namaBarang}" class="book-cover" onerror="this.onerror=null; this.src='img/pengantar_komunikasi.jpg';">
                        <span class="book-badge">${buku.jenisBarang}</span>
                    </div>
                    <div class="book-details">
                        <span class="book-code">${buku.kodeBarang} - Edisi ${buku.edisi}</span>
                        <h3 class="book-title" title="${buku.namaBarang}">${buku.namaBarang}</h3>
                        <div class="book-meta">
                            <span>📖 ${buku.jenisBarang}</span>
                        </div>
                        <div class="book-price-stock">
                            <span class="book-price">${buku.harga}</span>
                            <span class="book-stock-badge ${badgeClass}">Stok: ${buku.stok}</span>
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="bukaModalTambahStokKhusus('${buku.kodeBarang}')">
                                ➕ Tambah Stok
                            </button>
                            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="pesanBukuLangsung('${buku.kodeBarang}')">
                                🛒 Pesan
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * Ganti tampilan katalog antara Grid dan Table
 */
function setStokViewMode(mode) {
    currentStokViewMode = mode;
    var btnGrid = document.getElementById('btnViewGrid');
    var btnTable = document.getElementById('btnViewTable');

    if (btnGrid && btnTable) {
        if (mode === 'grid') {
            btnGrid.classList.add('btn-primary');
            btnGrid.classList.remove('btn-secondary');
            btnTable.classList.add('btn-secondary');
            btnTable.classList.remove('btn-primary');
        } else {
            btnTable.classList.add('btn-primary');
            btnTable.classList.remove('btn-secondary');
            btnGrid.classList.add('btn-secondary');
            btnGrid.classList.remove('btn-primary');
        }
    }

    var searchVal = document.getElementById('searchBukuInput') ? document.getElementById('searchBukuInput').value : '';
    renderKatalogStok(searchVal);
}

/**
 * Mengisi opsi pilihan buku pada modal
 */
function populateModalBookOptions(selectedKode) {
    var select = document.getElementById('modalSelectBuku');
    if (!select) return;

    var katalog = getKatalogBuku();
    select.innerHTML = '<option value="">-- Pilih Buku --</option>' + 
        katalog.map(function(b) {
            var isSel = (b.kodeBarang === selectedKode) ? 'selected' : '';
            return `<option value="${b.kodeBarang}" ${isSel}>${b.kodeBarang} - ${b.namaBarang} (Stok saat ini: ${b.stok})</option>`;
        }).join('');
}

/**
 * Membuka modal tambah stok umum
 */
function bukaModalStok() {
    populateModalBookOptions();
    var modal = document.getElementById('modalTambahStok');
    if (modal) {
        document.getElementById('modalJumlahStok').value = '10';
        modal.classList.add('show');
    }
}

/**
 * Membuka modal tambah stok langsung untuk buku tertentu
 */
function bukaModalTambahStokKhusus(kodeBarang) {
    populateModalBookOptions(kodeBarang);
    var modal = document.getElementById('modalTambahStok');
    if (modal) {
        document.getElementById('modalSelectBuku').value = kodeBarang;
        document.getElementById('modalJumlahStok').value = '25';
        modal.classList.add('show');
    }
}

/**
 * Menutup modal tambah stok
 */
function tutupModalStok() {
    var modal = document.getElementById('modalTambahStok');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Proses penambahan stok dan update ke storage
 */
function prosesTambahStok(kodeBarang, jumlah) {
    var katalog = getKatalogBuku();
    var targetBuku = null;

    for (var i = 0; i < katalog.length; i++) {
        if (katalog[i].kodeBarang === kodeBarang) {
            katalog[i].stok = (parseInt(katalog[i].stok, 10) || 0) + jumlah;
            targetBuku = katalog[i];
            break;
        }
    }

    if (targetBuku) {
        simpanKatalogBuku(katalog);
        var searchVal = document.getElementById('searchBukuInput') ? document.getElementById('searchBukuInput').value : '';
        renderKatalogStok(searchVal);
        showNotification(`Berhasil menambah stok +${jumlah} untuk "${targetBuku.namaBarang}". Total stok sekarang: ${targetBuku.stok}`, "success");
    } else {
        showNotification("Buku tidak ditemukan!", "error");
    }
}

// ========================================================
// 7. CHECKOUT PAGE LOGIC
// ========================================================

/**
 * Memesan buku langsung dari katalog atau dashboard menuju halaman checkout
 */
function pesanBukuLangsung(kodeBarang) {
    var cart = getKeranjang();
    var katalog = getKatalogBuku();
    var itemBuku = katalog.find(function(b) { return b.kodeBarang === kodeBarang; });

    if (!itemBuku) {
        showNotification("Buku tidak ditemukan!", "error");
        return;
    }

    if (itemBuku.stok <= 0) {
        showNotification("Maaf, stok buku ini sedang habis!", "error");
        return;
    }

    var existing = cart.find(function(c) { return c.kodeBarang === kodeBarang; });
    if (existing) {
        if (existing.qty + 1 > itemBuku.stok) {
            showNotification(`Jumlah melebihi stok yang tersedia (${itemBuku.stok})!`, "warning");
        } else {
            existing.qty += 1;
            showNotification(`Menambahkan 1 lagi "${itemBuku.namaBarang}" ke daftar pesanan.`, "success");
        }
    } else {
        cart.push({
            kodeBarang: itemBuku.kodeBarang,
            namaBarang: itemBuku.namaBarang,
            harga: itemBuku.harga,
            cover: itemBuku.cover,
            qty: 1
        });
        showNotification(`"${itemBuku.namaBarang}" ditambahkan ke daftar pesanan!`, "success");
    }

    simpanKeranjang(cart);
    window.location.href = "checkout.html";
}

function initCheckoutPage() {
    checkAuthProtection(false);
    renderNavbarUser();

    // Pastikan jika keranjang kosong pertama kali, kita berikan 1 buku default agar pengguna langsung melihat contoh daftar pesanan
    var cart = getKeranjang();
    if (cart.length === 0) {
        var katalog = getKatalogBuku();
        if (katalog.length > 0) {
            cart.push({
                kodeBarang: katalog[0].kodeBarang,
                namaBarang: katalog[0].namaBarang,
                harga: katalog[0].harga,
                cover: katalog[0].cover,
                qty: 1
            });
            simpanKeranjang(cart);
        }
    }

    // Auto-fill nama & email dari currentUser
    var user = getCurrentUser();
    if (user) {
        var namaInput = document.getElementById('checkoutNama');
        var emailInput = document.getElementById('checkoutEmail');
        if (namaInput && !namaInput.value) namaInput.value = user.nama;
        if (emailInput && !emailInput.value) emailInput.value = user.email;
    }

    renderCheckoutItems();
    populateQuickAddBookDropdown();

    // Event submit checkout
    var form = document.getElementById('formCheckout');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCheckoutSubmit();
        });
    }
}

/**
 * Render daftar item pesanan pada halaman checkout
 */
function renderCheckoutItems() {
    var cart = getKeranjang();
    var container = document.getElementById('checkoutItemsContainer');
    var subtotalEl = document.getElementById('checkoutSubtotal');
    var ongkirEl = document.getElementById('checkoutOngkir');
    var totalEl = document.getElementById('checkoutTotal');
    var badgeCount = document.getElementById('checkoutItemCountBadge');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem;">
                <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛒</p>
                <h4 style="color: var(--gray-700);">Daftar Pesanan Kosong</h4>
                <p style="color: var(--gray-500); font-size: 0.9rem; margin-bottom: 1rem;">Pilih buku dari katalog terlebih dahulu untuk melanjutkan pemesanan.</p>
                <a href="stok.html" class="btn btn-sm btn-primary">Lihat Katalog Buku</a>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "Rp 0";
        if (ongkirEl) ongkirEl.textContent = "Rp 0";
        if (totalEl) totalEl.textContent = "Rp 0";
        if (badgeCount) badgeCount.textContent = "0";
        return;
    }

    var subtotal = 0;
    var totalQty = 0;

    container.innerHTML = cart.map(function(item) {
        var hargaNum = parseHargaNumber(item.harga);
        var itemTotal = hargaNum * item.qty;
        subtotal += itemTotal;
        totalQty += item.qty;

        return `
            <div class="order-item">
                <img src="${item.cover}" alt="${item.namaBarang}" class="order-item-img" onerror="this.onerror=null; this.src='img/pengantar_komunikasi.jpg';">
                <div class="order-item-info">
                    <div class="order-item-title">${item.namaBarang}</div>
                    <div class="order-item-price">${formatRupiah(hargaNum)} / buku</div>
                    <div style="font-weight: 600; color: var(--primary); font-size: 0.88rem; margin-top: 0.2rem;">
                        Subtotal: ${formatRupiah(itemTotal)}
                    </div>
                </div>
                <div class="order-item-controls">
                    <button type="button" class="qty-btn" onclick="ubahQtyCart('${item.kodeBarang}', -1)">-</button>
                    <input type="text" class="qty-input" value="${item.qty}" readonly>
                    <button type="button" class="qty-btn" onclick="ubahQtyCart('${item.kodeBarang}', 1)">+</button>
                    <button type="button" class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--gray-300); padding: 0.25rem 0.5rem; margin-left: 0.5rem;" onclick="hapusItemCart('${item.kodeBarang}')" title="Hapus buku">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');

    var ongkir = 20000; // Biaya kurir flat standar
    var total = subtotal + ongkir;

    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (ongkirEl) ongkirEl.textContent = formatRupiah(ongkir);
    if (totalEl) totalEl.textContent = formatRupiah(total);
    if (badgeCount) badgeCount.textContent = totalQty;
}

/**
 * Mengubah kuantitas item dalam keranjang
 */
function ubahQtyCart(kodeBarang, delta) {
    var cart = getKeranjang();
    var katalog = getKatalogBuku();
    var buku = katalog.find(function(b) { return b.kodeBarang === kodeBarang; });
    var item = cart.find(function(c) { return c.kodeBarang === kodeBarang; });

    if (!item) return;

    var newQty = item.qty + delta;

    if (newQty <= 0) {
        hapusItemCart(kodeBarang);
        return;
    }

    if (buku && newQty > buku.stok) {
        showNotification(`Maksimal jumlah adalah stok yang tersedia (${buku.stok})!`, "warning");
        return;
    }

    item.qty = newQty;
    simpanKeranjang(cart);
    renderCheckoutItems();
}

/**
 * Menghapus item dari keranjang
 */
function hapusItemCart(kodeBarang) {
    var cart = getKeranjang();
    cart = cart.filter(function(item) {
        return item.kodeBarang !== kodeBarang;
    });
    simpanKeranjang(cart);
    renderCheckoutItems();
    showNotification("Buku dihapus dari daftar pesanan.", "info");
}

/**
 * Isi dropdown untuk menambah buku lain langsung dari halaman checkout
 */
function populateQuickAddBookDropdown() {
    var select = document.getElementById('quickAddBukuSelect');
    if (!select) return;

    var katalog = getKatalogBuku();
    select.innerHTML = '<option value="">-- Tambah Buku Lain ke Pesanan --</option>' +
        katalog.map(function(b) {
            return `<option value="${b.kodeBarang}">${b.namaBarang} (${b.harga})</option>`;
        }).join('');
}

function handleQuickAddBook() {
    var select = document.getElementById('quickAddBukuSelect');
    if (!select || !select.value) return;

    var kodeBarang = select.value;
    var cart = getKeranjang();
    var katalog = getKatalogBuku();
    var itemBuku = katalog.find(function(b) { return b.kodeBarang === kodeBarang; });

    if (!itemBuku) return;

    var existing = cart.find(function(c) { return c.kodeBarang === kodeBarang; });
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            kodeBarang: itemBuku.kodeBarang,
            namaBarang: itemBuku.namaBarang,
            harga: itemBuku.harga,
            cover: itemBuku.cover,
            qty: 1
        });
    }

    simpanKeranjang(cart);
    renderCheckoutItems();
    select.value = '';
    showNotification(`"${itemBuku.namaBarang}" ditambahkan ke pesanan!`, "success");
}

/**
 * Validasi form dan proses konfirmasi checkout
 */
function handleCheckoutSubmit() {
    var cart = getKeranjang();
    if (cart.length === 0) {
        showNotification("Daftar pesanan masih kosong! Pilih minimal 1 buku.", "error");
        return;
    }

    var nama = document.getElementById('checkoutNama').value.trim();
    var email = document.getElementById('checkoutEmail').value.trim();
    var telepon = document.getElementById('checkoutTelepon').value.trim();
    var alamat = document.getElementById('checkoutAlamat').value.trim();
    var ekspedisi = document.getElementById('checkoutEkspedisi').value;
    var pembayaran = document.getElementById('checkoutPembayaran').value;

    // Reset error styling
    var inputs = ['checkoutNama', 'checkoutEmail', 'checkoutTelepon', 'checkoutAlamat', 'checkoutEkspedisi', 'checkoutPembayaran'];
    inputs.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('is-invalid');
    });

    var isValid = true;

    if (!nama) {
        markInvalid('checkoutNama', 'Nama lengkap wajib diisi');
        isValid = false;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
        markInvalid('checkoutEmail', 'Format email tidak valid');
        isValid = false;
    }
    if (!telepon || telepon.length < 8) {
        markInvalid('checkoutTelepon', 'Nomor telepon minimal 8 digit');
        isValid = false;
    }
    if (!alamat || alamat.length < 10) {
        markInvalid('checkoutAlamat', 'Alamat pengiriman minimal 10 karakter');
        isValid = false;
    }
    if (!ekspedisi) {
        markInvalid('checkoutEkspedisi', 'Pilih jasa ekspedisi');
        isValid = false;
    }
    if (!pembayaran) {
        markInvalid('checkoutPembayaran', 'Pilih metode pembayaran');
        isValid = false;
    }

    if (!isValid) {
        showNotification("Harap lengkapi semua data formulir dengan benar!", "error");
        return;
    }

    // Hitung total dan kurangi stok dari katalog
    var katalog = getKatalogBuku();
    var subtotal = 0;
    for (var i = 0; i < cart.length; i++) {
        var cartItem = cart[i];
        var buku = katalog.find(function(b) { return b.kodeBarang === cartItem.kodeBarang; });
        if (buku) {
            buku.stok = Math.max(0, buku.stok - cartItem.qty);
        }
        subtotal += parseHargaNumber(cartItem.harga) * cartItem.qty;
    }
    simpanKatalogBuku(katalog);

    var totalBayar = formatRupiah(subtotal + 20000);

    // Generate Nomor DO baru (contoh format: 2026xxxx)
    var nomorDOBaru = "2026" + Math.floor(1000 + Math.random() * 9000);
    var tanggalKirimHariIni = new Date().toISOString().split('T')[0];

    // Buat data tracking baru
    var trackingDb = getTrackingData();
    trackingDb[nomorDOBaru] = {
        nomorDO: nomorDOBaru,
        nama: nama,
        status: "Diproses",
        ekspedisi: ekspedisi,
        tanggalKirim: tanggalKirimHariIni,
        paket: "PKT-" + Math.floor(100 + Math.random() * 900),
        total: totalBayar,
        perjalanan: [
            {
                waktu: new Date().toLocaleString('id-ID'),
                keterangan: `Pesanan dibuat oleh ${nama}. Pembayaran via ${pembayaran} dikonfirmasi.`
            },
            {
                waktu: new Date().toLocaleString('id-ID'),
                keterangan: `Pesanan sedang dikemas oleh Gudang Penerbit.`
            }
        ]
    };
    simpanTrackingData(trackingDb);

    // Kosongkan keranjang
    simpanKeranjang([]);

    // Tampilkan modal sukses
    tampilkanModalSuksesCheckout(nomorDOBaru, nama, totalBayar, ekspedisi);
}

function markInvalid(inputId, msg) {
    var el = document.getElementById(inputId);
    if (el) {
        el.classList.add('is-invalid');
        var feedback = el.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = msg;
        }
    }
}

function tampilkanModalSuksesCheckout(nomorDO, nama, total, ekspedisi) {
    var modal = document.getElementById('modalSuksesCheckout');
    if (!modal) {
        alert("Pemesanan Berhasil!\nNomor DO Anda: " + nomorDO + "\nTotal: " + total);
        window.location.href = "tracking.html?do=" + nomorDO;
        return;
    }

    document.getElementById('modalSuksesDO').textContent = nomorDO;
    document.getElementById('modalSuksesNama').textContent = nama;
    document.getElementById('modalSuksesTotal').textContent = total;
    document.getElementById('modalSuksesEkspedisi').textContent = ekspedisi;

    var btnLacak = document.getElementById('btnLacakPesananModal');
    if (btnLacak) {
        btnLacak.onclick = function() {
            window.location.href = "tracking.html?do=" + nomorDO;
        };
    }

    modal.classList.add('show');
}

// ========================================================
// 8. TRACKING PAGE LOGIC
// ========================================================

function initTrackingPage() {
    checkAuthProtection(false);
    renderNavbarUser();

    var searchBtn = document.getElementById('btnCariTracking');
    var inputDO = document.getElementById('inputNomorDO');

    if (searchBtn && inputDO) {
        searchBtn.addEventListener('click', function() {
            prosesCariTracking(inputDO.value.trim());
        });

        inputDO.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                prosesCariTracking(inputDO.value.trim());
            }
        });
    }

    // Cek apakah ada parameter nomor DO di URL (misal: tracking.html?do=20230012)
    var urlParams = new URLSearchParams(window.location.search);
    var doFromUrl = urlParams.get('do');
    if (doFromUrl) {
        if (inputDO) inputDO.value = doFromUrl;
        prosesCariTracking(doFromUrl);
    } else {
        // Otomatis tampilkan contoh pertama untuk kemudahan demo pengujian
        prosesCariTracking("20230012");
    }
}

/**
 * Mencari dan menampilkan informasi pelacakan berdasarkan nomor DO
 */
function prosesCariTracking(nomorDO) {
    var resultContainer = document.getElementById('trackingResultContainer');
    var emptyContainer = document.getElementById('trackingEmptyContainer');
    if (!resultContainer) return;

    if (!nomorDO) {
        showNotification("Silakan masukkan Nomor Delivery Order (DO)!", "warning");
        return;
    }

    var trackingDb = getTrackingData();
    var data = trackingDb[nomorDO];

    if (!data) {
        if (resultContainer) resultContainer.style.display = 'none';
        if (emptyContainer) {
            emptyContainer.style.display = 'block';
            emptyContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">❓</p>
                    <h3 style="color: var(--gray-800);">Nomor DO Tidak Ditemukan</h3>
                    <p style="color: var(--gray-600); margin-top: 0.25rem;">
                        Tidak ditemukan riwayat pengiriman dengan nomor DO <strong>"${nomorDO}"</strong>.
                    </p>
                    <p style="color: var(--gray-500); font-size: 0.85rem; margin-top: 0.5rem;">
                        Tips: Coba gunakan nomor DO yang ada pada data pengujian: <strong>20230012</strong> atau <strong>20230013</strong>.
                    </p>
                </div>
            `;
        }
        showNotification("Nomor DO tidak ditemukan!", "error");
        return;
    }

    if (emptyContainer) emptyContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    // Isi ringkasan pengiriman
    document.getElementById('trackDO').textContent = data.nomorDO;
    document.getElementById('trackNama').textContent = data.nama;
    document.getElementById('trackEkspedisi').textContent = data.ekspedisi;
    document.getElementById('trackTanggal').textContent = data.tanggalKirim;
    document.getElementById('trackPaket').textContent = data.paket;
    document.getElementById('trackTotal').textContent = data.total;

    var statusEl = document.getElementById('trackStatus');
    if (statusEl) {
        statusEl.textContent = data.status;
        statusEl.className = 'book-stock-badge ' + (
            data.status.toLowerCase().includes('selesai') || data.status.toLowerCase().includes('dikirim') 
                ? 'stock-in' 
                : 'stock-low'
        );
    }

    // Isi timeline perjalanan
    var timelineContainer = document.getElementById('trackingTimelineContainer');
    if (timelineContainer && Array.isArray(data.perjalanan)) {
        timelineContainer.innerHTML = data.perjalanan.map(function(step, idx) {
            var isLatest = (idx === data.perjalanan.length - 1);
            return `
                <div class="timeline-item ${isLatest ? 'active' : ''}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-time">🕒 ${step.waktu}</div>
                    <div class="timeline-content">
                        <strong>${step.keterangan}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    showNotification(`Riwayat pelacakan DO ${nomorDO} berhasil ditampilkan.`, "success");
}

/**
 * Helper untuk tombol cepat mencoba nomor DO
 */
function setSampleDO(nomorDO) {
    var inputDO = document.getElementById('inputNomorDO');
    if (inputDO) {
        inputDO.value = nomorDO;
        prosesCariTracking(nomorDO);
    }
}

