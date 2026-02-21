(function () {
  // CONFIGURATION
  const API_BASE_URL = "http://localhost:3000"; // EN PROD: METS TON URL HTTPS

  const currentScript = document.currentScript;
  const ussdCode = currentScript.getAttribute("data-ussd");

  // --- 1. CAPTURE DE L'ADRESSE MAC (ARCEP) ---
  // On cherche dans l'URL: ?mac=XX ou ?client_mac=XX (standard Mikrotik)
  const urlParams = new URLSearchParams(window.location.search);
  const userMac = urlParams.get('mac') || urlParams.get('client_mac') || urlParams.get('mac_esc') || null;

  if (!ussdCode) return;

  // --- 2. STYLE CSS (Ajout des nouveaux états) ---
  const style = document.createElement("style");
  style.innerHTML = `
    .kodfi-btn { position: fixed; bottom: 20px; right: 20px; background-color: #FF5F00; color: white !important; border: none; border-radius: 50px; padding: 12px 24px; font-family: sans-serif; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 95, 0, 0.4); z-index: 2147483647; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; }
    .kodfi-btn:hover { transform: scale(1.05); }
    .kodfi-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483647; display: none; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
    .kodfi-modal { background: white !important; color: #333 !important; width: 90%; max-width: 360px; border-radius: 16px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); font-family: sans-serif; position: relative; text-align: center; }
    .kodfi-close { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
    .kodfi-title { margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #111; }
    
    /* Liste des offres */
    .kodfi-offers { display: flex; flex-direction: column; gap: 10px; }
    .kodfi-offer-item { display: flex; justify-content: space-between; padding: 14px; border: 1px solid #eee; border-radius: 10px; cursor: pointer; transition: 0.2s; text-align: left; }
    .kodfi-offer-item:hover { background-color: #fff5eb; border-color: #FF5F00; }
    .kodfi-price { font-weight: bold; color: #FF5F00; }

    /* Formulaire Téléphone */
    .kodfi-input-group { text-align: left; margin-bottom: 20px; }
    .kodfi-label { display: block; font-size: 12px; color: #666; margin-bottom: 5px; }
    .kodfi-input { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 16px; box-sizing: border-box; outline: none; transition: 0.2s; }
    .kodfi-input:focus { border-color: #FF5F00; }
    .kodfi-submit { width: 100%; background: #FF5F00; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; }
    .kodfi-submit:disabled { background: #ccc; cursor: not-allowed; }

    /* État de chargement */
    .kodfi-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #FF5F00; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .kodfi-status-text { font-size: 14px; color: #555; margin-bottom: 10px; }
    
    .kodfi-footer { margin-top: 20px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
    .kodfi-footer a { color: #888; text-decoration: none; }
    .kodfi-error-msg {
      color: #dc2626; /* Rouge */
      font-size: 12px;
      margin-top: 6px;
      font-weight: 500;
      min-height: 18px; /* Pour éviter le saut de ligne quand l'erreur apparait */
      transition: all 0.2s;
      opacity: 0;
      transform: translateY(-5px);
    }
    .kodfi-error-msg.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .kodfi-input.input-error {
      border-color: #dc2626 !important;
      background-color: #fef2f2;
    }
  `;
  document.head.appendChild(style);

  // --- 3. DOM ---
  const btn = document.createElement("button");
  btn.className = "kodfi-btn";
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 19.28 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg> <span>Acheter Pass</span>`;
  document.body.appendChild(btn);

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "kodfi-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="kodfi-modal">
      <button class="kodfi-close">&times;</button>
      <h3 class="kodfi-title" id="kodfi-title">Choisir un forfait</h3>
      <div id="kodfi-content"></div> <div class="kodfi-footer">Powered by <a href="#">Kodfi</a></div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  // --- 4. ÉTAT ET LOGIQUE ---
  const contentDiv = document.getElementById("kodfi-content");
  const titleEl = document.getElementById("kodfi-title");
  let selectedOffer = null;
  let checkInterval = null;

  // Vue 1: Liste des offres
  async function showOffers() {
    titleEl.innerText = "Choisir un forfait";
    contentDiv.innerHTML = `<div class="kodfi-spinner"></div>`;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/hotspots/${ussdCode}`);
      const data = await res.json();
      
      if(data.error) { contentDiv.innerHTML = `<p style="color:red">${data.error}</p>`; return; }
      if(!data.offers.length) { contentDiv.innerHTML = `<p>Aucune offre disponible.</p>`; return; }

      contentDiv.innerHTML = `<div class="kodfi-offers">` + 
        data.offers.map(o => `
          <div class="kodfi-offer-item" data-id="${o.id}" data-name="${o.name}" data-price="${o.price}">
            <span>${o.name}</span> <span class="kodfi-price">${o.price} F</span>
          </div>
        `).join("") + `</div>`;

      // Clic sur une offre
      contentDiv.querySelectorAll(".kodfi-offer-item").forEach(el => {
        el.addEventListener("click", () => {
          selectedOffer = { id: el.dataset.id, name: el.dataset.name, price: el.dataset.price };
          showPhoneInput();
        });
      });

    } catch(e) { contentDiv.innerHTML = `<p style="color:red">Erreur connexion</p>`; }
  }

  // Vue 2: Saisie numéro (Mise à jour 10 chiffres Bénin)
  function showPhoneInput() {
    titleEl.innerText = `${selectedOffer.name}`;
    
    // Logos
    const networksHtml = `
      <div style="display:flex; gap:8px; justify-content:center; margin-bottom:20px;">
        <span style="background:#ffcc00; color:#000; padding:4px 8px; border-radius:4px; font-weight:800; font-size:10px; letter-spacing:0.5px;">MTN</span>
        <span style="background:#0066cc; color:#fff; padding:4px 8px; border-radius:4px; font-weight:800; font-size:10px; letter-spacing:0.5px;">MOOV</span>
        <span style="background:#009138; color:#fff; padding:4px 8px; border-radius:4px; font-weight:800; font-size:10px; letter-spacing:0.5px;">CELTIIS</span>
      </div>
    `;

    contentDiv.innerHTML = `
      <div style="text-align:center; margin-bottom:15px;">
        <span style="font-size:28px; font-weight:800; color:#FF5F00;">${selectedOffer.price} <small style="font-size:14px; font-weight:600;">FCFA</small></span>
      </div>
      
      ${networksHtml}

      <div class="kodfi-input-group">
        <label class="kodfi-label" for="kodfi-phone">Numéro Mobile Money (10 chiffres)</label>
        
        <input type="tel" id="kodfi-phone" class="kodfi-input" placeholder="Ex: 01 97 00 00 00" maxlength="15" autofocus>
        
        <div id="kodfi-error" class="kodfi-error-msg"></div>
      </div>
      
      <button id="kodfi-pay-btn" class="kodfi-submit">
        Payer maintenant
      </button>
      
      <div style="margin-top:15px; font-size:13px; color:#666; cursor:pointer; text-align:center; font-weight:500;" id="kodfi-back">← Changer d'offre</div>
    `;

    const phoneInput = document.getElementById("kodfi-phone");
    const payBtn = document.getElementById("kodfi-pay-btn");
    const errorEl = document.getElementById("kodfi-error");
    const backBtn = document.getElementById("kodfi-back");

    backBtn.onclick = showOffers;
    
    const showError = (msg) => {
        errorEl.innerText = msg;
        errorEl.classList.add("visible");
        phoneInput.classList.add("input-error");
        phoneInput.focus();
    };

    phoneInput.oninput = (e) => {
        if (errorEl.classList.contains("visible")) {
            errorEl.classList.remove("visible");
            phoneInput.classList.remove("input-error");
        }
    };

    payBtn.onclick = async () => {
      const rawValue = phoneInput.value;
      const cleanPhone = rawValue.replace(/[^0-9]/g, ''); // On garde que les chiffres

      // 1. Vide ?
      if (!cleanPhone) {
          showError("Veuillez entrer un numéro.");
          return;
      }
      
      // 2. Vérification ANCIEN FORMAT (8 chiffres)
      if (cleanPhone.length === 8) {
          showError("Format obsolète. Ajoutez le 01 au début.");
          return;
      }

      // 3. Vérification LONGUEUR (10 ou 13)
      if (cleanPhone.length !== 10 && cleanPhone.length !== 13) {
          showError(`Numéro invalide (${cleanPhone.length} chiffres). Il en faut 10.`);
          return;
      }

      // Gestion du format international (229)
      let finalPhone = cleanPhone;
      if (cleanPhone.length === 13) {
          if (!cleanPhone.startsWith("229")) {
              showError("Format international invalide (doit commencer par 229).");
              return;
          }
          finalPhone = cleanPhone.substring(3);
      }

      // --- NOUVELLE RÈGLE INTELLIGENTE (01 mal placé) ---
      // Si on a 10 chiffres, qu'on ne commence PAS par 01, mais qu'on FINIT par 01
      if (!finalPhone.startsWith("01") && finalPhone.endsWith("01")) {
          showError("Le '01' se met au DÉBUT du numéro, pas à la fin.");
          return;
      }

      // Règle générale : Mobile Money au Bénin commence par 01 actuellement
      if (!finalPhone.startsWith("01")) {
           showError("Le numéro doit commencer par 01.");
           return;
      }

      // Tout est bon
      payBtn.innerHTML = "Lancement...";
      payBtn.disabled = true;
      
      await startPayment(finalPhone);
    };
    
    phoneInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        payBtn.click();
      }
    });
  }

  // Vue 3 & Logique: Paiement
  async function startPayment(phone) {
    titleEl.innerText = "Validation en cours...";
    contentDiv.innerHTML = `
      <div class="kodfi-spinner"></div>
      <p class="kodfi-status-text">Veuillez valider le push USSD sur votre téléphone (${phone}).</p>
      <p style="font-size:12px; color:#999">En attente de confirmation...</p>
    `;

    try {
      // 1. Initier
      const res = await fetch(`${API_BASE_URL}/api/public/payment/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: selectedOffer.id, phone, hotspotUssd: ussdCode, mac: userMac })
      });
      const data = await res.json();

      if (!data.success) {
        contentDiv.innerHTML = `<p style="color:red">${data.error}</p><button onclick="location.reload()" class="kodfi-submit">Réessayer</button>`;
        return;
      }

      // 2. Polling (Vérifier toutes les 3s)
      const txId = data.transactionId;
      let attempts = 0;
      
      checkInterval = setInterval(async () => {
        attempts++;
        if (attempts > 40) { // Timeout après 2 min
            clearInterval(checkInterval);
            contentDiv.innerHTML = `<p style="color:red">Délai dépassé.</p>`;
            return;
        }

        const checkRes = await fetch(`${API_BASE_URL}/api/public/payment/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: txId, hotspotUssd: ussdCode, offerId: selectedOffer.id, phone, mac: userMac })
        });
        const checkData = await checkRes.json();

        if (checkData.status === "COMPLETED") {
            clearInterval(checkInterval);
            successAndLogin(checkData.code);
        } else if (checkData.status === "FAILED") {
            clearInterval(checkInterval);
            contentDiv.innerHTML = `<p style="color:red">Paiement échoué ou annulé.</p>`;
        }
        // Si PENDING, on continue d'attendre
      }, 3000);

    } catch (e) {
      contentDiv.innerHTML = `<p style="color:red">Erreur technique.</p>`;
    }
  }

  // Vue 4: Succès et Auto-Login
  function successAndLogin(code) {
    // 1. On affiche le succès
    titleEl.innerText = "Connexion réussie ! 🚀";
    // On force le vert pour le succès
    titleEl.style.color = "#28a745"; 
    
    contentDiv.innerHTML = `
      <div style="text-align:center; padding: 20px 0;">
        <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
        <p style="font-size:18px; font-weight:bold; color:#333;">Votre code : ${code}</p>
        <p style="color:#666; margin-top:15px;">Vous êtes connecté.</p>
        <p style="font-size:13px; color:#999; margin-top:5px;">Redirection dans <span id="kodfi-countdown">3</span> secondes...</p>
      </div>
    `;

    const userFields = document.querySelectorAll('input[name="username"], input[name="user"], input[id="user"]');
    const passFields = document.querySelectorAll('input[name="password"], input[name="pass"]');
    
    userFields.forEach(f => { f.value = code; });
    passFields.forEach(f => { f.value = code; });

    let timeLeft = 3;
    const countdownEl = document.getElementById("kodfi-countdown");
    
    const timer = setInterval(() => {
        timeLeft--;
        if(countdownEl) countdownEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            // 4. ACTION !
            const form = userFields[0]?.closest('form');
            if (form) {
                form.submit(); // C'est ici que la page change
            } else {
                alert("Erreur: Formulaire introuvable. Code: " + code);
            }
        }
    }, 1000);

    // // --- LE SMART FILLER (Magie) ---
    // setTimeout(() => {
    //     // Chercher les champs Mikrotik classiques
    //     const userFields = document.querySelectorAll('input[name="username"], input[name="user"], input[id="user"]');
    //     const passFields = document.querySelectorAll('input[name="password"], input[name="pass"]');
        
    //     let filled = false;
        
    //     // Remplir User
    //     userFields.forEach(f => { f.value = code; filled = true; });
    //     // Remplir Pass (souvent le code aussi chez Mikrotik config standard)
    //     passFields.forEach(f => { f.value = code; }); // Tu peux mettre "kodfi" si tu as hardcodé le pass

    //     if (filled) {
    //         // Tenter de soumettre le formulaire
    //         const form = userFields[0].closest('form');
    //         if (form) form.submit();
    //     } else {
    //         alert("Impossible de remplir automatiquement. Copiez le code : " + code);
    //     }
        
    //     // Fermer la modale après 3s
    //     setTimeout(() => { modalOverlay.style.display = "none"; }, 3000);
    // }, 1000);
  }

  // --- EVENTS ---
  btn.onclick = () => { modalOverlay.style.display = "flex"; showOffers(); };
  document.querySelector(".kodfi-close").onclick = () => { 
      modalOverlay.style.display = "none"; 
      if(checkInterval) clearInterval(checkInterval); 
  };

})();