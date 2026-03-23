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
^CI28
^PW827           
^LL473           
^LH0,0

### Logo Detectomat 
^FO31,31
^GFA,2409,2409,33,,:::::gY01FFE,gX01JFE,gX0LF8,gW03LFE,gW07MF8,gV01NFC,gV03OF,gV0PF8,gU01PFC,gU03IFE003IFE,gU07FF8K07FF,gU0FFN07F8,gU0F8O0FC,gT01EP01C,gT038Q06,gT02R02,,h0FF8,gY03IF,gY0JFC,gX01FF3FE,gX03E00BF,gX07C001F801IFC,07IFE03JF8KFE1JFC1JFCLF078I0F807JF07JF1KFC,07JF07JF8KFE3JFC3JFCKFE0FJ03C07JF8KF9KFC,06I0787I01C00380038I0E7M038I0EJ03C0E07038J038007,06I0186J0C0018003J067M018001FJ07E0C07018J018003,06I01C6J0C0018003J066M018001CK0E0C07018J018003,06J0C6J0C0018003J066M0180018K0E0C07018J018003,06J0C7JFC0018003JFE6M018001EJ01E0C070183JF8003,06J0C7JFC0018003JFE6M0180018K0E0C07018KF8003,06J0C7JFC0018003JFE6M018001CK0E0C07018KF8003,06J0C6M018003K06M018001CK0E0C07019CI018003,06I01C6M018003K06M0180018K0E0C07019CI018003,06I0386M018003K07M018001CJ01E0C07019CI018003,07I0F87J0800180038I0438L018001FJ03E0C07018EI038003,07JF07JF80018003JFC3JFC0018I0EJ03C0C07018KF8003,07IFE03JFI018001JF81JFC0018I0FJ03C0C070187JF8003,gX078I078,gX07C001F,gX03E003F,gX01FF1FE,gY0JFC,gY03IF,h0FFC,,gT03R06,gT01CP01E,gT01F8O07C,gU0FFN03F8,gU07FEL03FF,gU03IF8I0IFE,gU01PFC,gV0PF8,gV07OF,gV01NFE,gW0NF8,gW03MF,gX0LFC,gX03JFE,gY03IF,,:::::^FS

### Ligne horizontale 1
^FO31,255^GB755,0,4^FS

### Artikelnummer label 
^FO31,150
^A0N,40,40          
^FDArtNrº:^FS

### Artikelnummer value
^FO31,205 
^A0N,50,50          
^FD${article}^FS

### Menge label 
^FO31,290
^A0N,40,40
^FDMenge:^FS

### Menge value 
^FO192,290
^A0N,40,40
^FD${amount} Stk^FS

### QR code 
^FO640,20
^BQN,5,7
^FDLA,${article}^FS

### CE Logo 
^FO578,146
^GFA,180,180,5,,:::::I0CJ08,007CI0FC,01FE001FC,03FC007FC,07CI0FC,0FJ0F,1EI01E,1EI01C,3CI03C,3CI038,38I03FE,38I03FF,:38I03FE,3CI038,3CI03C,1EI01C,1EI01E,0F8I0F,07CI0FC,03FC007FC,01FE001FC,007CI0FC,N08,,:::::^FS

### Product name 
${name !== "" ? `
^FO31,380
^A0N,35,35          
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
        // alert("Druckfehler: " + err);
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
^XA
^MUD,8,12
^CI28
^PW560
^LL320
^LH0,0

### Logo Detectomat
^FO21,21
^GFA,1647,1647,27,,::::gS0FFE,gR07IFC,gQ03KF8,gQ0LFC,gP01MF,gP07MF8,gP0NFE,gO01OF,gO03FF8I03FF8,gO07FL01F8,gO0F8M03C,gO0EO0E,gN018O03,,gS03F8,gS0FFE,gR03IF8,gR07F9FC,gR0F001E,0IFE07IF0JFE3IF83IFCJFE1F001F01IFC3IFC7JF,0JF0JF8JFE7IFC7IFCJFE1CI0703IFE3IFE7JF,0C0038C001C00C006I0C6L0C003CI07830606J06003,0C0018CI0C00C006I06CL0C003EI0F860606J06002,0CI0CCI0C00C006I06CL0C002J01860606J06003,0CI0CJFC00C007IFECL0C003CI07C606061IFE003,0CI0CJFC00C007IFECL0C003J01C606063IFE003,0CI0CJF800C007IFCCL0C007J01C606067IFE003,0CI0CCL0C006J0CL0C003J018606066I06003,0C0018CL0C006J0CL0C003J018606066I06003,0C0038CL0C006J06L0C003CI0F8606066I06003,0JF0JF800C007IFC7IFC00C0038I038606063IFE003,0IFE07IFI0C003IF83IFC00C001CI070606063IFE002,gQ01E001F,gR0F001E,gR07F1FC,gR03IF8,gS0FFE,gS03F8,gN01P03,gO0CO06,gO0FN03C,gO07EL01FC,gO03FEJ01FF8,gO01OF,gP0NFE,gP07MFC,gP03MF,gQ0LFE,gQ03KF8,gR0JFE,gR01IF,,::::^FS

### Artikelnummer label
^FO21,140
^A0N,30,30
^FDArtNrº:^FS

### Artikelnummer value
^FO21,175
^A0N,35,35
^FD${article}^FS

### Menge label
^FO21,240
^A0N,30,30
^FDMenge:^FS

### Menge value
^FO130,240
^A0N,30,30
^FD${amount} Stk^FS

### QR code (top:10px right:10px → X=450)
^FO420,21
^BQN,4,6
^FDLA,${article}^FS

### CE Logo (top:54px right:72px → X=409, Y=113)
^FO370,130
^GFA,120,120,4,,::::003I03,01F001F807F003F80F8007C,1EI0F,1C001E,38001C,380038,3I03C4,3I03FE,:3I038,380038,38001C,1C001E,1EI0F,0F8007C,07F003F801F001F8003I01,,::::^FS

### Product name (bottom:10px left:10px → Y = 320-21 = 299)
${name !== "" ? `
^FO21,299
^A0N,22,22
^FD${name}^FS
` : ""}
^XZ
*/