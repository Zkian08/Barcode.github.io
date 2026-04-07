let barcodes = JSON.parse(localStorage.getItem("barcodes")) || [];
let lastScanned = null;

// ===== STORAGE =====
function save() {
  localStorage.setItem("barcodes", JSON.stringify(barcodes));
}

// ===== UI RENDER =====
function render() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  barcodes.forEach((code, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${code}</td>
        <td>
          <button class="copy" onclick="copyBarcode('${code}')">Copy</button>
          <button class="edit" onclick="editBarcode(${index})">Edit</button>
          <button class="delete" onclick="deleteBarcode(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

// ===== ADD =====
function addBarcode(value = null) {
  const input = document.getElementById("barcodeInput");
  let code = value || input.value.trim();

  if (!code) return;

  // Prevent duplicate rapid scans
  if (code === lastScanned) return;

  lastScanned = code;

  barcodes.push(code);
  input.value = "";

  save();
  render();

  showStatus("✅ Added: " + code);
}

// ===== COPY =====
function copyBarcode(code) {
  navigator.clipboard.writeText(code);
  showStatus("📋 Copied: " + code);
}

// ===== EDIT =====
function editBarcode(index) {
  let newVal = prompt("Edit UPC:", barcodes[index]);
  if (newVal) {
    barcodes[index] = newVal.trim();
    save();
    render();
  }
}

// ===== DELETE =====
function deleteBarcode(index) {
  if (confirm("Delete this UPC?")) {
    barcodes.splice(index, 1);
    save();
    render();
  }
}

// ===== CLEAR =====
function clearAll() {
  if (confirm("Clear all data?")) {
    barcodes = [];
    save();
    render();
  }
}

// ===== STATUS =====
function showStatus(msg) {
  document.getElementById("status").innerText = msg;
}

// ===== CAMERA SCANNER =====
function startScanner() {
  const qr = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(devices => {
    if (!devices.length) {
      showStatus("❌ No camera found");
      return;
    }

    // Prefer back camera
    let cameraId = devices.find(d => d.label.toLowerCase().includes("back"))?.id 
                  || devices[0].id;

    qr.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777,
        disableFlip: false
      },
      (decodedText) => {
        addBarcode(decodedText);
      },
      (error) => {
        // silent (avoid spam)
      }
    ).then(() => {
      showStatus("📷 Scanner ready (continuous mode)");
    }).catch(err => {
      showStatus("❌ Camera error: " + err);
    });
  });
}

// INIT
render();
startScanner();