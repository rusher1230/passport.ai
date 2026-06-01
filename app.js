const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const sizeSelect = document.getElementById("size");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let img = null;

/* ================= UPLOAD ================= */

uploadBtn.onclick = () => imageInput.click();

imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
        img = new Image();
        img.onload = () => {
            canvas.width = 350;
            canvas.height = 450;
            ctx.drawImage(img, 0, 0, 350, 450);
        };
        img.src = ev.target.result;
    };

    reader.readAsDataURL(file);
};

/* ================= PASSPORT CROP ================= */

function createPassport() {

    const W = 413;
    const H = 600;

    const c = document.createElement("canvas");
    const x = c.getContext("2d");

    c.width = W;
    c.height = H;

    x.fillStyle = "#fff";
    x.fillRect(0, 0, W, H);

    // SAFE CENTER CROP (NO AI DEPENDENCY)
    const scale = 0.75;

    const sw = img.width * scale;
    const sh = img.height * scale;

    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) * 0.30;

    x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

    return c;
}

/* ================= QUALITY COMPRESS ================= */

function compress(canvas, targetKB) {

    let quality = 0.92;

    function size(q) {
        const data = canvas.toDataURL("image/jpeg", q);
        return atob(data.split(",")[1]).length / 1024;
    }

    while (quality > 0.2) {
        if (size(quality) <= targetKB) break;
        quality -= 0.05;
    }

    return canvas.toDataURL("image/jpeg", quality);
}

/* ================= GENERATE ================= */

generateBtn.onclick = () => {

    if (!img) {
        alert("Please upload image first");
        return;
    }

    const result = createPassport();

    canvas.width = 413;
    canvas.height = 531;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(result, 0, 0);
};

/* ================= DOWNLOAD ================= */

downloadBtn.onclick = () => {

    if (!img) {
        alert("Please upload image first");
        return;
    }

    const result = createPassport();

    const target = parseInt(sizeSelect.value);

    const finalImg = compress(result, target);

    const a = document.createElement("a");
    a.download = `passport_${target}kb.jpg`;
    a.href = finalImg;
    a.click();
};

/* ================= PHOTO SHEET SYSTEM ================= */

function createSheet(count) {

    const A4W = 2480;
    const A4H = 3508;

    const sheet = document.createElement("canvas");
    const s = sheet.getContext("2d");

    sheet.width = A4W;
    sheet.height = A4H;

    s.fillStyle = "#fff";
    s.fillRect(0, 0, A4W, A4H);

    const photo = createPassport();

    const PW = 413;
    const PH = 531;

    const cols = 4;
    const rows = count === 8 ? 2 : 4;

    const gapX = 60;
    const gapY = 60;

    const startX = (A4W - (cols * PW + (cols - 1) * gapX)) / 2;
    const startY = 200;

    for (let i = 0; i < count; i++) {

        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = startX + col * (PW + gapX);
        const y = startY + row * (PH + gapY);

        s.drawImage(photo, x, y, PW, PH);
    }

    return sheet;
}

/* ================= AUTO BUTTONS ================= */

function addSheetButtons() {

    const box = document.querySelector(".editor-left");

    const b8 = document.createElement("button");
    b8.innerText = "Generate 8 Photo Sheet";
    b8.className = "sheet-btn";

    b8.onclick = () => {

        if (!img) return alert("Upload image first");

        const sheet = createSheet(8);

        const a = document.createElement("a");
        a.download = "8-photo-sheet.jpg";
        a.href = sheet.toDataURL("image/jpeg", 0.95);
        a.click();
    };

    const b16 = document.createElement("button");
    b16.innerText = "Generate 16 Photo Sheet";
    b16.className = "sheet-btn";

    b16.onclick = () => {

        if (!img) return alert("Upload image first");

        const sheet = createSheet(16);

        const a = document.createElement("a");
        a.download = "16-photo-sheet.jpg";
        a.href = sheet.toDataURL("image/jpeg", 0.95);
        a.click();
    };

    box.appendChild(b8);
    box.appendChild(b16);
}

addSheetButtons();
