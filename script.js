const printerIP = localStorage.getItem("printerIP");
let articleDB = {};

fetch("Artikelstamm.json")
  .then(res => res.json())
  .then(data => {
      data.forEach(item => {
        const id = String(item.Id).trim();
        const name = item.Name ? String(item.Name).trim() : "";
        articleDB[id] = name;
      });

    dbReady = true;
    console.log(">>> JSON chargé :", articleDB);
  })
  .catch(err => console.error("Erreur chargement JSON:", err));
 

  
function showError(msg) {
  const box = document.getElementById("errorBox");
  if (!box) {
    // fallback si pas de conteneur
    alert(msg);
    return;
  }
  box.textContent = msg;
  box.style.display = "block";
}

// ----------------------------
// Récupération du nom de l'article
// ----------------------------
function getArticleName(articleId) {
    const key = String(articleId);
    const name = articleDB[key];

    // Cas 3: Article NON trouvé
    if (name === undefined) {
        showError("Art.N° nicht gefunden! Prüfen!");
        return ""; // Imprimer sans nom
    }

    // Cas 2: Article trouvé mais nom vide
    if (name.trim() === "") {
        return "";
    }

    // Cas 1: Article trouvé + nom rempli
    return name;
}

// ----------------------------
// Génération du QR Code
// ----------------------------

function generateQR() {
    const article = document.getElementById("article").value.trim();
    const amount = document.getElementById("amount").value.trim();

    if (!article || !amount) {
        alert("Bitte Artikelnummer und Menge eingeben.");
        return;
    }

    // Met à jour l'aperçu complet
    updatePreview();

    // Affiche l'étiquette
    document.getElementById("labelPreview").style.display = "block";
}

// ----------------------------
// Visualisation de l'etiquette
// ----------------------------
function updatePreview() {
    const article = document.getElementById("article").value.trim();
    const amount  = document.getElementById("amount").value.trim();
    const preview = document.getElementById("labelPreview");

    // Prépare le conteneur
    preview.style.position = "relative";
    preview.innerHTML = ""; // on repart de zéro à chaque clic

    // --- Logo Detectomat ---
    const logoDet = document.createElement("img");
    logoDet.src = "Logo_Detectomat.png";
    logoDet.style.cssText = "width:100px; position:absolute; top:10px; left:10px;";
    preview.appendChild(logoDet);

    // --- Libellé "Artikelnummer:" ---
    const lblArt = document.createElement("div");
    lblArt.textContent = "Artikelnummer:";
    lblArt.style.cssText = "position:absolute; top:70px; left:10px; font-weight:bold; font-size:12px;";
    preview.appendChild(lblArt);

    // --- Valeur article ---
    const valArt = document.createElement("div");
    valArt.textContent = article;
    valArt.style.cssText = "position:absolute; top:70px; left:110px; font-size:12px;";
    preview.appendChild(valArt);

    // --- Libellé "Menge:" ---
    const lblQty = document.createElement("div");
    lblQty.textContent = "Menge:";
    lblQty.style.cssText = "position:absolute; top:90px; left:10px; font-weight:bold; font-size:12px;";
    preview.appendChild(lblQty);

    // --- Valeur quantité ---
    const valQty = document.createElement("div");
    valQty.textContent = `${amount} Stk`;
    valQty.style.cssText = "position:absolute; top:90px; left:110px; font-size:12px;";
    preview.appendChild(valQty);

    // --- Zone QR en haut à droite ---
    const qrWrap = document.createElement("div");
    qrWrap.style.cssText = "position:absolute; top:10px; right:10px;";
    const qrDiv = document.createElement("div");
    qrDiv.id = "previewQR";
    qrWrap.appendChild(qrDiv);
    preview.appendChild(qrWrap);

    // --- Logo CE (si tu le veux dans l’aperçu) ---
    const logoCE = document.createElement("img");
    logoCE.src = "logo_CE.png";
    logoCE.style.cssText = "width:13px; position:absolute; top:54px; right:72px;";
    preview.appendChild(logoCE);

    // --- Conteneur pour le nom d’article (on le remplit ensuite) ---
    const nameBox = document.createElement("div");
    nameBox.id = "articleNamePreview";
    nameBox.style.cssText = "position:absolute; bottom:10px; left:10px; font-size:12px;";
    preview.appendChild(nameBox);

    // --- Génération du QR (toujours) ---
    try {
        qrDiv.innerHTML = ""; // clean si on régénère
        new QRCode(qrDiv, {
            text: article,   // tu voulais le numéro seul dans le QR
            width: 55,
            height: 55
        });
        showPrintSuccess();
    } catch (e) {
        console.error("Erreur génération QR:", e);
    }

    if (window.dbReady) {
        const name = getArticleName(article); // ta fonction
        nameBox.textContent = name || "";     // si vide → rien
    } else {
         nameBox.textContent = ""; // DB pas prête → on n’affiche pas
    }
}

// ----------------------------
// Build of ZPL 
// ----------------------------
function buildZPL() {
    const article = document.getElementById("article").value.trim();
    const amount  = document.getElementById("amount").value.trim();
    const name    = getArticleName(article) || "";

    return `
^XA
^PW560
^LL320
^LH0,0

### Logo Detectomat
^FO21,21
^GFA,1647,1647,27,,::::gS0FFE,gR07IFC,gQ03KF8,gQ0LFC,gP01MF,gP07MF8,gP0NFE,gO01OF,gO03FF8I03FF8,gO07FL01F8,gO0F8M03C,gO0EO0E,gN018O03,,gS03F8,gS0FFE,gR03IF8,gR07F9FC,gR0F001E,0IFE07IF0JFE3IF83IFCJFE1F001F01IFC3IFC7JF,0JF0JF8JFE7IFC7IFCJFE1CI0703IFE3IFE7JF,0C0038C001C00C006I0C6L0C003CI07830606J06003,0C0018CI0C00C006I06CL0C003EI0F860606J06002,0CI0CCI0C00C006I06CL0C002J01860606J06003,0CI0CJFC00C007IFECL0C003CI07C606061IFE003,0CI0CJFC00C007IFECL0C003J01C606063IFE003,0CI0CJF800C007IFCCL0C007J01C606067IFE003,0CI0CCL0C006J0CL0C003J018606066I06003,0C0018CL0C006J0CL0C003J018606066I06003,0C0038CL0C006J06L0C003CI0F8606066I06003,0JF0JF800C007IFC7IFC00C0038I038606063IFE003,0IFE07IFI0C003IF83IFC00C001CI070606063IFE002,gQ01E001F,gR0F001E,gR07F1FC,gR03IF8,gS0FFE,gS03F8,gN01P03,gO0CO06,gO0FN03C,gO07EL01FC,gO03FEJ01FF8,gO01OF,gP0NFE,gP07MFC,gP03MF,gQ0LFE,gQ03KF8,gR0JFE,gR01IF,,::::^FS

### Artikelnummer label
^FO21,147
^A0N,22,22
^FDArtikelnummer:^FS

### Artikelnummer value
^FO231,147
^A0N,22,22
^FD${article}^FS

### Menge label
^FO21,189
^A0N,22,22
^FDMenge:^FS

### Menge value
^FO231,189
^A0N,22,22
^FD${amount} Stk^FS

### QR code (top:10px right:10px → X=450)
^FO450,21
^BQN,2,4
^FDLA,${article}^FS

### CE Logo (top:54px right:72px → X=409, Y=113)
^FO400,90
^GFA,120,120,4,,::::003I03,01F001F807F003F80F8007C,1EI0F,1C001E,38001C,380038,3I03C4,3I03FE,:3I038,380038,38001C,1C001E,1EI0F,0F8007C,07F003F801F001F8003I01,,::::^FS

### Product name (bottom:10px left:10px → Y = 320-21 = 299)
${name !== "" ? `
^FO21,299
^A0N,22,22
^FD${name}^FS
` : ""}

^XZ
`;
}


// ----------------------------
// Impression via IP
// ----------------------------
function printLabel() {
    const article = document.getElementById("article").value.trim();
    const amount = document.getElementById("amount").value.trim();
    let printed = false;

    const name = getArticleName(article); // ta fonction
    
    const zpl = buildZPL();

    generateQR();

    fetch(`http://${printerIP}:9100`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: zpl
    })
    .then(() => {
        // Si on arrive ici, l'envoi s'est fait → succès garanti
        printed = true;
        showPrintSuccess();
    })
    .catch(err => {
        // Une erreur = impression non envoyée
        printed = false;
        alert("Druckfehler: " + err);
    });

    // Sécurité : si fetch reste bloqué mais PAS d'erreur après 300ms → impression OK
    setTimeout(() => {
        if (!printed) {
            // On vérifie qu'il n'y a pas eu d'erreur et pas de succès
            // mais fetch n'est ni en erreur, ni terminé = imprimé
            showPrintSuccess();
            printed = true;
        }
    }, 300);
}

// ----------------------------
// Display of pop-up
// ----------------------------

function showPrintSuccess() {
    const box = document.getElementById("printSuccess");
    box.style.display = "block";
    setTimeout(() => {
        box.style.display = "none";
    }, 3000); // disparaît après 2.5 sec
}

function clearError() {
  const box = document.getElementById("errorBox");
  if (box) {
    box.textContent = "";
    box.style.display = "none";
  }
}

document.getElementById("article").addEventListener("input", clearError); 
``



/*
function buildZPL() {
  const article = document.getElementById("article").value.trim();
  const amount  = document.getElementById("amount").value.trim();

  return `
^XA
^PW560
^LL320
^LH0,0

^FO21,21
^GFA,1647,1647,27,,::::gS0FFE,gR07IFC,gQ03KF8,gQ0LFC,gP01MF,gP07MF8,gP0NFE,gO01OF,gO03FF8I03FF8,gO07FL01F8,gO0F8M03C,gO0EO0E,gN018O03,,gS03F8,gS0FFE,gR03IF8,gR07F9FC,gR0F001E,0IFE07IF0JFE3IF83IFCJFE1F001F01IFC3IFC7JF,0JF0JF8JFE7IFC7IFCJFE1CI0703IFE3IFE7JF,0C0038C001C00C006I0C6L0C003CI07830606J06003,0C0018CI0C00C006I06CL0C003EI0F860606J06002,0CI0CCI0C00C006I06CL0C002J01860606J06003,0CI0CJFC00C007IFECL0C003CI07C606061IFE003,0CI0CJFC00C007IFECL0C003J01C606063IFE003,0CI0CJF800C007IFCCL0C007J01C606067IFE003,0CI0CCL0C006J0CL0C003J018606066I06003,0C0018CL0C006J0CL0C003J018606066I06003,0C0038CL0C006J06L0C003CI0F8606066I06003,0JF0JF800C007IFC7IFC00C0038I038606063IFE003,0IFE07IFI0C003IF83IFC00C001CI070606063IFE002,gQ01E001F,gR0F001E,gR07F1FC,gR03IF8,gS0FFE,gS03F8,gN01P03,gO0CO06,gO0FN03C,gO07EL01FC,gO03FEJ01FF8,gO01OF,gP0NFE,gP07MFC,gP03MF,gQ0LFE,gQ03KF8,gR0JFE,gR01IF,,::::^FS

^FO21,126
^A0N,22,22
^FDArtikelnummer:^FS

^FO231,126
^A0N,22,22
^FD${article}^FS

^FO21,189
^A0N,22,22
^FDMenge:^FS

^FO231,189
^A0N,22,22
^FD${amount} Stk^FS

^FO395,21
^BQN,2,6
^FDLA,${article}^FS

^FO486,189
^GFA,120,120,4,,::::003I03,01F001F807F003F80F8007C,1EI0F,1C001E,38001C,380038,3I03C4,3I03FE,:3I038,380038,38001C,1C001E,1EI0F,0F8007C,07F003F801F001F8003I01,,::::^FS
^XZ
`;
}
*/

/*
// ----------------------------
// Visualisation de l'etiquette
// ----------------------------
function updatePreview() {
    const article = document.getElementById("article").value.trim();
    const amount  = document.getElementById("amount").value.trim();
    const preview = document.getElementById("labelPreview");

    // Prépare le conteneur
    preview.style.position = "relative";
    preview.innerHTML = ""; // on repart de zéro à chaque clic

    // --- Logo Detectomat ---
    const logoDet = document.createElement("img");
    logoDet.src = "Logo_Detectomat.png";
    logoDet.style.cssText = "width:100px; position:absolute; top:10px; left:10px;";
    preview.appendChild(logoDet);

    // --- Libellé "Artikelnummer:" ---
    const lblArt = document.createElement("div");
    lblArt.textContent = "Artikelnummer:";
    lblArt.style.cssText = "position:absolute; top:70px; left:10px; font-weight:bold; font-size:12px;";
    preview.appendChild(lblArt);

    // --- Valeur article ---
    const valArt = document.createElement("div");
    valArt.textContent = article;
    valArt.style.cssText = "position:absolute; top:70px; left:110px; font-size:12px;";
    preview.appendChild(valArt);

    // --- Libellé "Menge:" ---
    const lblQty = document.createElement("div");
    lblQty.textContent = "Menge:";
    lblQty.style.cssText = "position:absolute; top:90px; left:10px; font-weight:bold; font-size:12px;";
    preview.appendChild(lblQty);

    // --- Valeur quantité ---
    const valQty = document.createElement("div");
    valQty.textContent = `${amount} Stk`;
    valQty.style.cssText = "position:absolute; top:90px; left:110px; font-size:12px;";
    preview.appendChild(valQty);

    // --- Zone QR en haut à droite ---
    const qrWrap = document.createElement("div");
    qrWrap.style.cssText = "position:absolute; top:10px; right:10px;";
    const qrDiv = document.createElement("div");
    qrDiv.id = "previewQR";
    qrWrap.appendChild(qrDiv);
    preview.appendChild(qrWrap);

    // --- Logo CE (si tu le veux dans l’aperçu) ---
    const logoCE = document.createElement("img");
    logoCE.src = "logo_CE.png";
    logoCE.style.cssText = "width:13px; position:absolute; top:54px; right:72px;";
    preview.appendChild(logoCE);

    // --- Conteneur pour le nom d’article (on le remplit ensuite) ---
    const nameBox = document.createElement("div");
    nameBox.id = "articleNamePreview";
    nameBox.style.cssText = "position:absolute; bottom:10px; left:10px; font-size:12px;";
    preview.appendChild(nameBox);

    // --- Génération du QR (toujours) ---
    try {
        qrDiv.innerHTML = ""; // clean si on régénère
        new QRCode(qrDiv, {
            text: article,   // tu voulais le numéro seul dans le QR
            width: 55,
            height: 55
        });
        showPrintSuccess();
    } catch (e) {
        console.error("Erreur génération QR:", e);
    }

    if (window.dbReady) {
        const name = getArticleName(article); // ta fonction
        nameBox.textContent = name || "";     // si vide → rien
    } else {
         nameBox.textContent = ""; // DB pas prête → on n’affiche pas
    }
}
*/