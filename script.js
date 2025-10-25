// Data Master Produk Anda
const masterDataProduk = [
    { sku: "NTOR", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "TO" },
    { sku: "NTHN", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "TH" },
    { sku: "NTHN", jenis_kemasan: "PAPER PACK", shelf_life_bulan: 13, kode_produk: "TH" },
    { sku: "NTLS", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "TL" },
    { sku: "NTRJ", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "TR" },
    { sku: "NILC", jenis_kemasan: "PET", shelf_life_bulan: 12, kode_produk: "TC" },
    { sku: "NUYT", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "TY" },
    { sku: "NUYB", jenis_kemasan: "PET", shelf_life_bulan: 12, kode_produk: "TB" },
    { sku: "MTOR", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "MO" },
    { sku: "MTTK", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "MT" },
    { sku: "MTCH", jenis_kemasan: "PET", shelf_life_bulan: 13, kode_produk: "MC" },
    { sku: "MTCH", jenis_kemasan: "PAPER PACK", shelf_life_bulan: 12, kode_produk: "MC" },
    { sku: "MTML", jenis_kemasan: "PET", shelf_life_bulan: 12, kode_produk: "ML" },
];

// Variabel untuk menyimpan data produk yang sedang dipilih
let currentShelfLife = 0;
let currentKodeProduk = '';
let currentSKU = '';
let currentLine = ''; // Line Produksi (A atau B)

// Ambil elemen-elemen DOM
const skuSelect = document.getElementById('sku');
const kemasanSelect = document.getElementById('kemasan');
const form = document.getElementById('expiredCodeForm');

// --- FUNGSI PENGISI DROPDOWN DAN UPDATE DETAIL ---

function populateDropdowns() {
    // Pastikan elemen ditemukan sebelum mencoba menambahkan opsi
    if (!skuSelect || !kemasanSelect) return; 

    const uniqueSKUs = [...new Set(masterDataProduk.map(p => p.sku))];
    uniqueSKUs.forEach(sku => {
        const option = document.createElement('option');
        option.value = sku;
        option.textContent = sku;
        skuSelect.appendChild(option);
    });

    const uniqueKemasan = [...new Set(masterDataProduk.map(p => p.jenis_kemasan))];
    uniqueKemasan.forEach(kemasan => {
        const option = document.createElement('option');
        option.value = kemasan;
        option.textContent = kemasan;
        kemasanSelect.appendChild(option);
    });

    // Tambahkan opsi default "Pilih..."
    skuSelect.insertBefore(new Option("Pilih SKU", "", true, true), skuSelect.firstChild);
    kemasanSelect.insertBefore(new Option("Pilih Jenis Kemasan", "", true, true), kemasanSelect.firstChild);
    
    skuSelect.value = "";
    kemasanSelect.value = "";
}

function updateDetails() {
    const selectedSku = skuSelect.value;
    const selectedKemasan = kemasanSelect.value;
    
    // Tentukan Line Produksi (Perbaikan untuk PAPER PACK)
    if (selectedKemasan === 'PET') {
        currentLine = 'B';
    } else if (selectedKemasan === 'PAPER PACK') {
        currentLine = ''; // Paper Pack TIDAK ADA Line (A/B)
    } else {
        currentLine = '';
    }

    if (selectedSku && selectedKemasan) {
        const foundProduct = masterDataProduk.find(p =>
            p.sku === selectedSku && p.jenis_kemasan === selectedKemasan
        );

        if (foundProduct) {
            currentShelfLife = foundProduct.shelf_life_bulan;
            currentKodeProduk = foundProduct.kode_produk;
            currentSKU = foundProduct.sku;

            document.getElementById('displaySku').textContent = currentSKU;
            // Hanya tampilkan (Line B) jika currentLine tidak kosong
            document.getElementById('displayKemasan').textContent = foundProduct.jenis_kemasan + (currentLine ? ` (Line ${currentLine})` : '');
            document.getElementById('displayKodeProduk').textContent = currentKodeProduk;
        } else {
            alert("Kombinasi SKU dan Jenis Kemasan ini tidak ditemukan dalam data.");
            currentShelfLife = 0;
            currentKodeProduk = '';
            currentLine = '';
            document.getElementById('displaySku').textContent = 'N/A';
            document.getElementById('displayKemasan').textContent = 'N/A';
            document.getElementById('displayKodeProduk').textContent = 'N/A';
        }
    } else {
        // Reset tampilan jika belum lengkap
        currentShelfLife = 0;
        currentKodeProduk = '';
        currentLine = '';
        document.getElementById('displaySku').textContent = 'N/A';
        document.getElementById('displayKemasan').textContent = 'N/A';
        document.getElementById('displayKodeProduk').textContent = 'N/A';
    }
}

// --- FUNGSI UTAMA UNTUK LOGIKA TANGGAL KHUSUS DAN KODE AKHIR ---

/**
 * Mengecek apakah tahun adalah tahun kabisat
 * @param {number} year 
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Menghitung tanggal expired dan menentukan akhiran kode (NN, NNC, NNX) 
 * @param {Date} prodDate 
 * @param {number} shelfLife 
 * @returns {{tgl: Date, akhiran: string}}
 */
function calculateExpiryData(prodDate, shelfLife) {
    let expDate = new Date(prodDate); // Copy tanggal produksi
    let akhiran = currentKodeProduk; // Default: NN

    const prodDay = prodDate.getDate();
    const prodMonth = prodDate.getMonth() + 1; // Bulan 1-12 (Januari = 1)
    const prodYear = prodDate.getFullYear();

    // Flag untuk menandai apakah kasus ini sudah ditangani oleh aturan khusus
    let handledBySpecialRule = false;

    // --- KASUS SPESIAL JANUARI (29, 30, 31) dengan Shelf Life 13 Bulan ---
    if (prodMonth === 1 && shelfLife === 13 && (prodDay === 29 || prodDay === 30 || prodDay === 31)) {
        akhiran = currentKodeProduk + 'X';
        expDate.setFullYear(prodYear + 1); 
        
        if (prodDay === 29) {
            // Expired: 1 Maret (bukan kabisat) atau 29 Feb (kabisat) tahun berikutnya
            if (isLeapYear(expDate.getFullYear())) {
                expDate.setMonth(1); // Feb (indeks 1)
                expDate.setDate(29);
            } else {
                expDate.setMonth(2); // Mar (indeks 2)
                expDate.setDate(1); 
            }
        } else if (prodDay === 30) {
            // Expired: 2 Maret tahun berikutnya
            expDate.setMonth(2); // Mar (indeks 2)
            expDate.setDate(2);
        } else if (prodDay === 31) {
            // Expired: 3 Maret tahun berikutnya
            expDate.setMonth(2); // Mar (indeks 2)
            expDate.setDate(3);
        }
        handledBySpecialRule = true;
    }
    
    // --- KASUS SPESIAL LAINNYA (Februari, Maret, Mei, Agustus, Oktober) ---
    
    // KASUS FEBRUARI (29)
    else if (prodMonth === 2 && prodDay === 29) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            akhiran = currentKodeProduk + 'X';
            expDate.setMonth(2); expDate.setDate(1); // 1 Maret tahun berikutnya
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'C';
            expDate.setMonth(2); expDate.setDate(29); // 29 Maret tahun berikutnya
        }
        handledBySpecialRule = true;
    }
    
    // KASUS MARET (31)
    else if (prodMonth === 3 && prodDay === 31) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            expDate.setMonth(2); expDate.setDate(31); 
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'X';
            expDate.setMonth(4); expDate.setDate(1); 
        }
        handledBySpecialRule = true;
    }
    
    // KASUS MEI (31)
    else if (prodMonth === 5 && prodDay === 31) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            expDate.setMonth(4); expDate.setDate(31); 
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'X';
            expDate.setMonth(6); expDate.setDate(1); 
        }
        handledBySpecialRule = true;
    }

    // KASUS AGUSTUS (31)
    else if (prodMonth === 8 && prodDay === 31) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            expDate.setMonth(7); expDate.setDate(31);
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'X';
            expDate.setMonth(9); expDate.setDate(1);
        }
        handledBySpecialRule = true;
    }

    // KASUS OKTOBER (31)
    else if (prodMonth === 10 && prodDay === 31) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            expDate.setMonth(9); expDate.setDate(31); 
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'X';
            expDate.setMonth(11); expDate.setDate(1);
        }
        handledBySpecialRule = true;
    }

    // ----------------------------------------------------
    // KASUS REGULAR (Jika tidak ada aturan spesial yang berlaku)
    // ----------------------------------------------------
    if (!handledBySpecialRule) {
        // Logika penambahan bulan yang aman
        const originalProdDay = prodDate.getDate();
        expDate.setDate(1); 
        expDate.setMonth(prodDate.getMonth() + shelfLife);
        
        // Set kembali tanggal, menghindari day overflow (misal 31 Mar + 1 bulan jadi 1 Mei)
        const lastDayOfMonth = new Date(expDate.getFullYear(), expDate.getMonth() + 1, 0).getDate();
        expDate.setDate(Math.min(originalProdDay, lastDayOfMonth));
        
        // Aturan Akhiran untuk Kasus Regular
        if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'C';
        } 
    }
    
    return {
        tgl: expDate,
        akhiran: akhiran
    };
}


// --- EVENT LISTENERS ---

// Panggil saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Ini harus dipanggil agar dropdown terisi
    populateDropdowns();
    updateDetails(); 
    
    // Tambahkan event listeners setelah elemen DOM dimuat
    if (skuSelect && kemasanSelect) {
        skuSelect.addEventListener('change', updateDetails);
        kemasanSelect.addEventListener('change', updateDetails);
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (currentShelfLife === 0 || !currentKodeProduk || !currentLine && kemasanSelect.value === 'PET' ) {
                alert("Mohon pilih kombinasi SKU dan Jenis Kemasan yang valid.");
                return;
            }
            
            const tglProduksiInput = document.getElementById('tglProduksi').value;
            if (!tglProduksiInput) {
                alert("Mohon masukkan Tanggal Produksi.");
                return;
            }

            // Gunakan 'T00:00:00' untuk mencegah masalah zona waktu lokal
            const tglProduksi = new Date(tglProduksiInput + 'T00:00:00'); 
            
            // Panggil fungsi logika kompleks
            const expiryData = calculateExpiryData(tglProduksi, currentShelfLife);
            const tglExpired = expiryData.tgl;
            const kodeAkhir = expiryData.akhiran;
            
            // 1. Format Tanggal Expired (YYYY-MM-DD)
            const yyyy = tglExpired.getFullYear();
            const mm = String(tglExpired.getMonth() + 1).padStart(2, '0');
            const dd = String(tglExpired.getDate()).padStart(2, '0');
            const tanggalExpiredFormatted = `${yyyy}-${mm}-${dd}`;

            // 2. Buat Kode Expired Final
            // Format: EXP ddmmyy A/B NN/NNC/NNX
            
            const codeDD = dd;
            const codeMM = mm;
            const codeYY = String(yyyy).slice(-2);
            
            // --- PERBAIKAN LOGIKA PENGGABUNGAN KODE FINAL DI SINI ---
            const linePart = currentLine ? ` ${currentLine}` : ''; // Tambahkan spasi + Line B hanya jika Line B ada
            const kodeExpiredFinal = `EXP ${codeDD}${codeMM}${codeYY}${linePart} ${kodeAkhir}`;
            // ---------------------------------------------------------

            // 3. Tampilkan Hasil
            document.getElementById('tanggalExpired').textContent = tanggalExpiredFormatted;
            document.getElementById('kodeExpiredFinal').textContent = kodeExpiredFinal;
            document.getElementById('resultArea').style.display = 'block';
        });
    }
});