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

let currentShelfLife = 0;
let currentKodeProduk = '';
let currentSKU = '';
let currentLine = '';

const skuSelect = document.getElementById('sku');
const kemasanSelect = document.getElementById('kemasan');
const form = document.getElementById('expiredCodeForm');

function populateDropdowns() {
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

    skuSelect.insertBefore(new Option("Pilih SKU", "", true, true), skuSelect.firstChild);
    kemasanSelect.insertBefore(new Option("Pilih Jenis Kemasan", "", true, true), kemasanSelect.firstChild);
    
    skuSelect.value = "";
    kemasanSelect.value = "";
}

function updateDetails() {
    const selectedSku = skuSelect.value;
    const selectedKemasan = kemasanSelect.value;
    
    if (selectedKemasan === 'PET') {
        currentLine = 'B';
    } else if (selectedKemasan === 'PAPER PACK') {
        currentLine = ''; 
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
        } else {
            alert("Kombinasi SKU dan Jenis Kemasan ini tidak ditemukan dalam data.");
            currentShelfLife = 0;
            currentKodeProduk = '';
            currentLine = '';
        }
    } else {
        currentShelfLife = 0;
        currentKodeProduk = '';
        currentLine = '';
    }
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function calculateExpiryData(prodDate, shelfLife) {
    let expDate = new Date(prodDate);
    let akhiran = currentKodeProduk;

    const prodDay = prodDate.getDate();
    const prodMonth = prodDate.getMonth() + 1; 
    const prodYear = prodDate.getFullYear();

    let handledBySpecialRule = false;

    if (prodMonth === 1 && shelfLife === 13 && (prodDay === 29 || prodDay === 30 || prodDay === 31)) {
        akhiran = currentKodeProduk + 'X';
        expDate.setFullYear(prodYear + 1); 
        
        if (prodDay === 29) {
            if (isLeapYear(expDate.getFullYear())) {
                expDate.setMonth(1); 
                expDate.setDate(29);
            } else {
                expDate.setMonth(2); 
                expDate.setDate(1); 
            }
        } else if (prodDay === 30) {
            expDate.setMonth(2); 
            expDate.setDate(2);
        } else if (prodDay === 31) {
            expDate.setMonth(2); 
            expDate.setDate(3);
        }
        handledBySpecialRule = true;
    }
    
    else if (prodMonth === 2 && prodDay === 29) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            akhiran = currentKodeProduk + 'X'; 
            expDate.setMonth(2); expDate.setDate(1); 
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'C'; // Hasil: 29 Maret tahun berikutnya (NNC)
            expDate.setMonth(2); expDate.setDate(29); 
        }
        handledBySpecialRule = true;
    }
    
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

    else if (prodMonth === 8 && prodDay === 31) {
        expDate.setFullYear(prodYear + 1);
        if (shelfLife === 12) {
            expDate.setMonth(7); expDate.setDate(31);
        } else if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'X';
            expDate.setMonth(9); expDate.setDate(1); // Hasil: 1 Oktober tahun berikutnya (NNX)
        }
        handledBySpecialRule = true;
    }

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

    if (!handledBySpecialRule) {
        const originalProdDay = prodDate.getDate();
        expDate.setDate(1); 
        expDate.setMonth(prodDate.getMonth() + shelfLife);
        
        const lastDayOfMonth = new Date(expDate.getFullYear(), expDate.getMonth() + 1, 0).getDate();
        expDate.setDate(Math.min(originalProdDay, lastDayOfMonth));
        
        if (shelfLife === 13) {
            akhiran = currentKodeProduk + 'C';
        } 
    }
    
    return {
        tgl: expDate,
        akhiran: akhiran
    };
}


document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    updateDetails(); 
    
    if (skuSelect && kemasanSelect) {
        skuSelect.addEventListener('change', updateDetails);
        kemasanSelect.addEventListener('change', updateDetails);
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (currentShelfLife === 0 || !currentKodeProduk) {
                alert("Mohon pilih kombinasi SKU dan Jenis Kemasan yang valid.");
                return;
            }
            
            const tglProduksiInput = document.getElementById('tglProduksi').value;
            if (!tglProduksiInput) {
                alert("Mohon masukkan Tanggal Produksi.");
                return;
            }

            const tglProduksi = new Date(tglProduksiInput + 'T00:00:00'); 
            
            const expiryData = calculateExpiryData(tglProduksi, currentShelfLife);
            const tglExpired = expiryData.tgl;
            const kodeAkhir = expiryData.akhiran;
            
            const yyyy = tglExpired.getFullYear();
            const mm = String(tglExpired.getMonth() + 1).padStart(2, '0');
            const dd = String(tglExpired.getDate()).padStart(2, '0');
            
            const tanggalExpiredFormatted = `${dd}-${mm}-${yyyy}`;

            const codeDD = dd;
            const codeMM = mm;
            const codeYY = String(yyyy).slice(-2);
            
            const linePart = currentLine ? ` ${currentLine}` : ''; 
            const kodeExpiredFinal = `EXP ${codeDD}${codeMM}${codeYY}${linePart} ${kodeAkhir}`;
            
            document.getElementById('tanggalExpired').textContent = tanggalExpiredFormatted;
            document.getElementById('kodeExpiredFinal').textContent = kodeExpiredFinal;
            
            const selectedKemasan = kemasanSelect.value;
            
            document.getElementById('displaySku').textContent = currentSKU;
            document.getElementById('displayKemasan').textContent = selectedKemasan + (currentLine ? ` (Line ${currentLine})` : '');
            
            const displayKodeProduk = kodeAkhir.length > 2 ? kodeAkhir.slice(0, 2) : kodeAkhir;
            document.getElementById('displayKodeProduk').textContent = displayKodeProduk;

            document.getElementById('resultArea').style.display = 'block';
        });
    }
});