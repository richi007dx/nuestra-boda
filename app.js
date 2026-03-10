(function () {
  'use strict';

  // ===== CUSTOM CURSOR =====
  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot hidden sm:block';
  const cursorRing = document.createElement('div');
  cursorRing.className = 'cursor-ring hidden sm:block';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // Add hover effect for links & buttons
  const clickables = document.querySelectorAll('a, button, input, select, textarea, .gallery-item, .envelope-body');
  clickables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Re-run hover logic periodically for dynamic elements
  setInterval(() => {
    document.querySelectorAll('a, button, input, select, textarea, .gallery-item, .envelope-body').forEach(el => {
      if (!el.dataset.cursorBound) {
        el.dataset.cursorBound = 'true';
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      }
    });
  }, 1000);

  // ===== ENVELOPE ANIMATION =====
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const envelopeBody = document.querySelector('.envelope-body');
  const skipBtn = document.querySelector('.envelope-skip');

  // ===== MUSIC PLAYER LOGIC =====
  const bgMusic = document.getElementById('bg-music');
  const customAudioBtn = document.getElementById('custom-audio-btn');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');

  function updateAudioBtnState() {
    if (!bgMusic || !customAudioBtn) return;
    if (bgMusic.paused) {
      customAudioBtn.classList.remove('playing');
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    } else {
      customAudioBtn.classList.add('playing');
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
    }
  }

  if (customAudioBtn && bgMusic) {
    // Initial state (paused)
    iconPlay.classList.remove('hidden');
    bgMusic.volume = 0.4; // Initial background volume

    customAudioBtn.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log('Autoplay prevent by browser', e));
      } else {
        bgMusic.pause();
      }
      updateAudioBtnState();
    });
  }

  let musicHasStarted = false;

  function openEnvelope(userInitiated = true) {
    if (!envelopeBody || envelopeBody.classList.contains('open')) return;
    envelopeBody.classList.add('open');

    // Auto-play music when envelope is opened (user interaction)
    if (userInitiated && bgMusic && !musicHasStarted) {
      bgMusic.play().then(() => {
        musicHasStarted = true;
        updateAudioBtnState();
      }).catch(e => console.log('Autoplay prevent by browser', e));
    }

    setTimeout(() => {
      envelopeOverlay.classList.add('fade-out');
      setTimeout(() => { envelopeOverlay.style.display = 'none'; }, 800);
    }, 2000);
  }

  // Global click listener to start music on first user interaction if auto-opened
  document.body.addEventListener('click', () => {
    if (!musicHasStarted && envelopeBody && envelopeBody.classList.contains('open') && bgMusic) {
      bgMusic.play().then(() => {
        musicHasStarted = true;
        updateAudioBtnState();
      }).catch(e => console.log('Autoplay prevented', e));
    }
  }, { once: false });

  if (envelopeBody) {
    envelopeBody.addEventListener('click', () => openEnvelope(true));
    if (skipBtn) skipBtn.addEventListener('click', (e) => { e.stopPropagation(); openEnvelope(true); });
    
    // Auto-open after 7s without attempting to play audio (blocked by browser)
    setTimeout(() => openEnvelope(false), 7000);
  }

  // ===== FALLING PETALS =====
  const petalColors = ['#C8A96E', '#E8D5A8', '#D4AF37', '#EACDA3', '#d4a574'];
  function createPetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];
    const size = 8 + Math.random() * 10;
    p.innerHTML = `<svg viewBox="0 0 20 20" width="${size}" height="${size}"><ellipse cx="10" cy="10" rx="6" ry="10" fill="${color}" opacity=".5" transform="rotate(${Math.random() * 60 - 30} 10 10)"/></svg>`;
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = '-20px';
    p.style.animation = `petalFall ${6 + Math.random() * 8}s linear forwards`;
    p.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
  setInterval(createPetal, 1200);

  // ===== BLOOMING TREE (Global Scroll) =====
  const branches = document.querySelectorAll('#tree-svg .branch');
  const flowers = document.querySelectorAll('#tree-svg .flower');

  // Set initial branch lengths
  branches.forEach(branch => {
    const length = branch.getTotalLength ? branch.getTotalLength() : 400;
    branch.style.setProperty('--len', length);
    branch.style.strokeDasharray = length;
    branch.style.strokeDashoffset = length;
  });

  const animateTree = () => {
    // Calculate scroll percentage across the entire document
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

    // Animate branches based on scroll depth
    branches.forEach(branch => {
      const length = parseFloat(branch.style.getPropertyValue('--len'));
      // branches draw progressively as we scroll down
      const offset = length - (length * scrollPercent);
      branch.style.strokeDashoffset = offset;
    });

    // Animate flowers - they bloom progressively as scrolling reaches threshold points
    flowers.forEach((flower, index) => {
      // stagger the bloom threshold so they appear gradually
      const bloomThreshold = (index / flowers.length) * 0.8;
      if (scrollPercent > bloomThreshold && !flower.classList.contains('bloom')) {
        flower.classList.add('bloom');
      } else if (scrollPercent <= bloomThreshold && flower.classList.contains('bloom')) {
        flower.classList.remove('bloom');
      }
    });
  };

  // Initially call once
  animateTree();
  window.addEventListener('scroll', animateTree, { passive: true });

  // ===== TIMELINE =====
  const timelineEvents = [
    { label: 'Ceremonia Religiosa', icon: 'church' },
    { label: 'Boda Civil', icon: 'rings' },
    { label: 'Acto Principal', icon: 'couple' },
    { label: 'Brindis', icon: 'champagne' },
    { label: 'Banquete', icon: 'food' },
    { label: 'Torta', icon: 'cake' },
    { label: '¡Ah! Bailar', icon: 'music' },
    { label: 'Ramo de la Novia', icon: 'bouquet' },
    { label: 'Despedida', icon: 'car' },
  ];

  const iconSVGs = {
    church: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v1h1v11h3V9h12v10h3V8h1V7L12 2zm0 2.26L18.47 7H5.53L12 4.26zM8 11v2h3v-2H8zm5 0v2h3v-2h-3zM8 15v2h3v-2H8zm5 0v2h3v-2h-3z"/></svg>',
    rings: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 2a5 5 0 0 0-4.9 4.04A5 5 0 0 0 7 16a5 5 0 0 0 4.9-4.04A5 5 0 1 0 15 2a5 5 0 0 0-3 1.02A5 5 0 0 0 9 2Z"/></svg>',
    couple: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    champagne: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 2L6.5 9.5C6.18 11.08 7.39 12.5 9 12.5V20H7v2h6v-2h-2v-7.5c1.61 0 2.82-1.42 2.5-3L12 2H8zm1 2h2l1 5H8l1-5zm6-2l-1.5 7.5c-.16.79.09 1.57.59 2.15.5.57 1.2.85 1.91.85V20h-2v2h6v-2h-2v-7.5c.71 0 1.41-.28 1.91-.85.5-.58.75-1.36.59-2.15L19 2h-4zm1 2h2l1 5h-4l1-5z"/></svg>',
    food: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 22c0 .54.45 1 1 1h13c.56 0 1-.46 1-1H1zM8.5 9C4.75 9 1 11 1 15h15c0-4-3.75-6-7.5-6zm-4.37 4c1.02-1.28 2.75-2 4.37-2s3.35.72 4.37 2H4.13zM1 17h15v2H1v-2zm18-5v-2h-2V2h-2v8h-2V2h-2v8a4 4 0 0 0 4 4v8h2v-8c2.21 0 4-1.79 4-4V2h-2v10z"/></svg>',
    cake: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12c.01-1.66-1.33-3-2.99-3z"/></svg>',
    music: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    bouquet: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22a9 9 0 0 0 9-9c0-3.53-2.04-6.58-5-8.05C15.44 3.06 14 2 12 2s-3.44 1.06-3 2.95C5.04 6.42 3 9.47 3 13a9 9 0 0 0 9 9zm0-18c.83 0 1.5.67 1.5 1.5 0 .06-.01.12-.02.18C12.99 5.56 12.51 5.5 12 5.5s-.99.06-1.48.18c-.01-.06-.02-.12-.02-.18C10.5 4.67 11.17 4 12 4z"/></svg>',
    car: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
  };

  const tlContainer = document.getElementById('timeline-items');
  if (tlContainer) {
    timelineEvents.forEach((ev, i) => {
      const isLeft = i % 2 === 0;
      const item = document.createElement('div');
      item.className = `reveal relative flex items-center ${isLeft ? 'sm:flex-row flex-row' : 'sm:flex-row-reverse flex-row'}`;
      item.innerHTML = `
        <div class="sm:w-[calc(50%-2rem)] w-[calc(100%-3.5rem)] ${isLeft ? 'sm:text-right sm:pr-8' : 'sm:text-left sm:pl-8'} pl-12 sm:pl-0">
          <div class="card-glow bg-white/[0.03] border border-gold/10 rounded-xl p-4 inline-block"><h4 class="font-script text-xl sm:text-2xl text-gold">${ev.label}</h4></div>
        </div>
        <div class="absolute sm:left-1/2 left-[24px] -translate-x-1/2 w-10 h-10 rounded-full bg-dark border-2 border-gold flex items-center justify-center text-gold z-10">${iconSVGs[ev.icon]}</div>
        <div class="hidden sm:block sm:w-[calc(50%-2rem)]"></div>`;
      tlContainer.appendChild(item);
    });
  }

  // ===== RSVP LOGIC STRIC LIMT =====
  const params = new URLSearchParams(window.location.search);
  const pasesParam = parseInt(params.get('pases'), 10);
  const maxPases = (!isNaN(pasesParam) && pasesParam > 0) ? pasesParam : 2; // Default to 2

  const pasesText = document.getElementById('pases-text');
  if (pasesText) {
    if (maxPases === 1) {
      pasesText.innerHTML = `🌟 Tienes <span class="font-script text-3xl mx-1 text-gold-dark">1</span> pase personal`;
    } else {
      pasesText.innerHTML = `🌟 Tienes <span class="font-script text-3xl mx-1 text-gold-dark">${maxPases}</span> pases reservados`;
    }
  }

  const selectCount = document.getElementById('rsvp-count');
  if (selectCount) {
    selectCount.innerHTML = '';

    const opt0 = document.createElement('option');
    opt0.value = 0;
    opt0.textContent = 'No podré asistir';
    selectCount.appendChild(opt0);

    for (let n = 1; n <= maxPases; n++) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n === 1 ? '1 persona' : `${n} personas`;
      if (n === maxPases) opt.selected = true;
      selectCount.appendChild(opt);
    }
  }

  // URL del Webhook de Google Apps Script 
  const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyQ_ETkXyHyS3jannBatiaNXB4S3Jo2IgG7gR7XIFIFYV2ZvlHoiggXp8KZ4GHAPcTkrQ/exec";

  const handleRSVP = async (phone, bando) => {
    const nameInput = document.getElementById('rsvp-name');
    const phoneInput = document.getElementById('rsvp-phone');
    const name = nameInput ? nameInput.value.trim() : '';
    const guestPhone = phoneInput ? phoneInput.value.trim() : '';
    const count = selectCount ? selectCount.value : "2";

    if (!name) {
      if (nameInput) nameInput.focus();
      alert("Por favor, ingresa tu nombre de invitado o familia.");
      return;
    }

    const btnElement = bando === 'Novio' ? document.getElementById('btn-novio') : document.getElementById('btn-novia');
    const oldText = btnElement ? btnElement.innerHTML : "";
    if (btnElement) btnElement.textContent = "Registrando...";

    // Mensaje para Excel
    const sheetWish = window.userSelectedWish || "";

    // 1. Guardar en Google Sheets silenciosamente
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", // Requisito para App Scripts sin dominio propio
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitado: name,
          telefono: guestPhone,
          cantidad: count,
          bando: bando,
          mensaje: sheetWish
        })
      });
    } catch (err) {
      console.error("Error al registrar en Google Sheets:", err);
      // Falla silenciosa: si Google Sheets falla, igual enviamos a WhatsApp
    }

    // 2. Construir mensaje de WhatsApp
    let text = count === "0"
      ? `¡Hola! Soy *${name}*.\nLamentablemente *no podré asistir* a la boda, pero les deseo muchísimas felicidades paso a paso.`
      : `¡Hola! Soy *${name}*.\nConfirmo la asistencia de *${count} persona(s)* a su boda.`;

    if (window.userSelectedWish) {
      text += `\n\nTambién te dejo este deseo a través de la pizarra virtual:\n"${window.userSelectedWish}"`;
    }

    // 3. Abrir WhatsApp y actualizar UI a estado "Completado"
    setTimeout(() => {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');

      const btnN = document.getElementById('btn-novio');
      const btnS = document.getElementById('btn-novia');

      if (btnN) {
        btnN.textContent = bando === 'Novio' ? "¡Gracias por confirmar!" : "Asistencia Confirmada";
        btnN.disabled = true;
        btnN.classList.add('opacity-80', 'cursor-not-allowed');
      }
      if (btnS) {
        btnS.textContent = bando === 'Novia' ? "¡Gracias por confirmar!" : "Asistencia Confirmada";
        btnS.disabled = true;
        btnS.classList.add('opacity-80', 'cursor-not-allowed');
      }
    }, 100);
  }

  document.getElementById('btn-novio')?.addEventListener('click', () => handleRSVP('59179710021', 'Novio'));
  document.getElementById('btn-novia')?.addEventListener('click', () => handleRSVP('59160376893', 'Novia'));

  // ===== INTERACTIVE WISHES BOARD =====
  const presetButtons = document.querySelectorAll('.wish-preset');
  let selectedPresetText = '';
  const btnWishSubmit = document.getElementById('btn-wish-submit');
  const wishesBoard = document.getElementById('wishes-board');
  const wishesContainer = document.getElementById('wishes-container');

  const customWishInput = document.getElementById('custom-wish-text');

  // Handle Preset selection
  if (presetButtons) {
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove styling from all
        presetButtons.forEach(b => {
          b.classList.remove('border-gold-dark', 'bg-gold/10', 'font-semibold');
          b.classList.add('border-gold/20', 'bg-white/80', 'text-[#3a3a3a]');
        });
        // Add styling to selected
        btn.classList.add('border-gold-dark', 'bg-gold/10', 'font-semibold');
        btn.classList.remove('border-gold/20', 'bg-white/80', 'text-[#3a3a3a]');

        // Clear custom text if preset is chosen
        if (customWishInput) customWishInput.value = '';
        selectedPresetText = btn.textContent.trim();
      });
    });
  }

  // Clear presets if custom text is typed
  if (customWishInput) {
    customWishInput.addEventListener('input', () => {
      if (customWishInput.value.trim() !== '') {
        presetButtons.forEach(b => {
          b.classList.remove('border-gold-dark', 'bg-gold/10', 'font-semibold');
          b.classList.add('border-gold/20', 'bg-white/80', 'text-[#3a3a3a]');
        });
        selectedPresetText = '';
      }
    });
  }

  const handleWishSubmit = () => {
    const nameInput = document.getElementById('wish-guest-name');
    const name = nameInput ? nameInput.value.trim() : '';

    // Determine the actual wish to send: Custom Text area takes priority if filled
    const customText = customWishInput ? customWishInput.value.trim() : '';
    const presetText = selectedPresetText;
    const wishText = customText || presetText;

    if (!name) {
      alert("Por favor, ingresa tu nombre (ej: Familia Pérez) para añadir el deseo.");
      if (nameInput) nameInput.focus();
      return;
    }
    if (!wishText) {
      alert("Por favor, selecciona una frase hermosa o escribe la tuya propia.");
      return;
    }

    // Save the global wish to be sent via whatsapp later during RSVP
    window.userSelectedWish = wishText;

    // Firebase Write Logic
    if (window.firebaseDB && window.firebasePush && window.firebaseRef) {
      const wishesRef = window.firebaseRef(window.firebaseDB, 'wishes/Boda_Jaime_Dayana');
      window.firebasePush(wishesRef, {
        name: name,
        message: wishText,
        timestamp: window.firebaseServerTimestamp
      }).then(() => {
        // Immediate visual feedback
        if (btnWishSubmit) {
          btnWishSubmit.textContent = "¡Deseo Añadido a la Pizarra!";
          btnWishSubmit.classList.add('bg-green-600', 'text-white');
          btnWishSubmit.classList.remove('bg-white', 'text-gold-dark');
          setTimeout(() => {
            btnWishSubmit.textContent = "Añadir a Pizarra";
            btnWishSubmit.classList.remove('bg-green-600', 'text-white');
            btnWishSubmit.classList.add('bg-white', 'text-gold-dark');
          }, 3000);
        }
        if (nameInput) nameInput.value = '';
      }).catch((error) => {
        console.error("Error writing to Firebase:", error);
        alert("Hubo un error al guardar tu deseo. Intenta de nuevo.");
      });
    }

  };

  if (btnWishSubmit) {
    btnWishSubmit.addEventListener('click', () => handleWishSubmit());
  }

  // Firebase Read Logic (Real-time Sync)
  if (window.firebaseDB && window.firebaseOnValue && window.firebaseRef) {
    const wishesRef = window.firebaseRef(window.firebaseDB, 'wishes/Boda_Jaime_Dayana');

    window.firebaseOnValue(wishesRef, (snapshot) => {
      if (wishesContainer) wishesContainer.innerHTML = ''; // Clear currently displayed

      if (snapshot.exists()) {
        const data = snapshot.val();
        let wishesArray = [];

        // Convert to array safely whether it's an object or already an array
        if (typeof data === 'object' && data !== null) {
          wishesArray = Object.values(data);
        } else {
          console.error("Firebase data is not an object:", data);
        }

        // Sort by timestamp (newest first)
        wishesArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (wishesArray.length > 0) {
          if (wishesBoard) wishesBoard.classList.remove('hidden');

          wishesArray.forEach(wish => {
            if (!wish || typeof wish !== 'object') return; // Skip invalid entries

            const wishEl = document.createElement('div');
            wishEl.className = 'wish-note p-4 bg-white/60 mb-3 rounded-xl border border-gold/20 shadow-sm';
            wishEl.innerHTML = `
              <p class="font-script text-2xl text-gold-dark mb-1">${wish.name || 'Invitado'}</p>
              <p class="font-serif text-[#3a3a3a] text-lg leading-relaxed">"${wish.message || ''}"</p>
            `;
            wishesContainer.appendChild(wishEl);
          });
        }
      }
    }, (error) => {
      console.error("Firebase Sync Error:", error);
    });
  }



  // Custom audio player removed for Spotify Embed

  // ===== COUNTDOWN =====
  const wedding = new Date('2026-04-11T16:00:00-04:00').getTime();
  function updateCountdown() {
    const diff = wedding - Date.now();
    if (diff <= 0) { ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '0'; }); return; }
    const d = Math.floor(diff / 864e5), h = Math.floor((diff / 36e5) % 24), m = Math.floor((diff / 6e4) % 60), s = Math.floor((diff / 1e3) % 60);
    const el = (id) => document.getElementById(id);
    if (el('cd-days')) el('cd-days').textContent = d;
    if (el('cd-hours')) el('cd-hours').textContent = String(h).padStart(2, '0');
    if (el('cd-mins')) el('cd-mins').textContent = String(m).padStart(2, '0');
    if (el('cd-secs')) el('cd-secs').textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ===== SCROLL HANDLERS =====
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  reveals.forEach(el => revealObs.observe(el));

  // Nav dots
  const dots = document.querySelectorAll('.nav-dot');
  const sectionIds = ['hero', 'detalles', 'tree-section', 'timeline', 'rsvp'];
  const dotObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        dots.forEach(d => {
          const active = d.dataset.section === e.target.id;
          d.classList.toggle('bg-gold', active);
          d.classList.toggle('bg-gold/30', !active);
          d.classList.toggle('w-3', active);
          d.classList.toggle('h-3', active);
        });
      }
    });
  }, { threshold: 0.3 });
  sectionIds.forEach(id => { const el = document.getElementById(id); if (el) dotObs.observe(el); });

  // Make sure tree scrolls
  window.addEventListener('scroll', animateTree, { passive: true });
  animateTree();

  // ===== HERO SPARKLES =====
  const sparkleContainer = document.getElementById('sparkles');
  if (sparkleContainer) {
    setInterval(() => {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animation = `sparkle ${2 + Math.random() * 3}s ease-in-out`;
      sparkleContainer.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }, 500);
  }

})();
