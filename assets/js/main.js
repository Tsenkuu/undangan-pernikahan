/**
 * The Wedding of Arbian & Hima
 * Interactive Wedding Invitation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State: Lock scroll while cover is visible
  document.body.classList.add('locked');

  // 2. Parse Dynamic Guest Name from URL (/undangan/:slug or ?to=...)
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('dear') || urlParams.get('kepada') || urlParams.get('u');
  const guestNameElement = document.getElementById('guestName');
  const rsvpNameInput = document.getElementById('rsvpName');
  
  let targetGuestName = null;
  if (typeof window.PERSONAL_GUEST_NAME !== 'undefined' && window.PERSONAL_GUEST_NAME) {
    targetGuestName = window.PERSONAL_GUEST_NAME.trim();
  } else if (guestParam) {
    targetGuestName = decodeURIComponent(guestParam.replace(/\+/g, ' ')).trim();
  } else {
    // Check if path is /undangan/:slug
    const pathMatch = window.location.pathname.match(/\/undangan\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      const slug = decodeURIComponent(pathMatch[1]).replace(/[-_]/g, ' ').trim();
      targetGuestName = slug.replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  if (targetGuestName) {
    if (guestNameElement) {
      guestNameElement.textContent = targetGuestName;
    }
    if (rsvpNameInput) {
      rsvpNameInput.value = targetGuestName;
    }
  }

  // 3. Audio & Music Player Management
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicDisc = document.getElementById('musicDisc');
  const musicIcon = document.getElementById('musicIcon');
  let isPlaying = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isPlaying = true;
      if (musicDisc) musicDisc.classList.add('rotating');
      startFloatingNotes();
      if (musicIcon) {
        musicIcon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        `;
      }
    }).catch(err => {
      console.log('Audio autoplay prevented or waiting for user interaction:', err);
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isPlaying = false;
    if (musicDisc) musicDisc.classList.remove('rotating');
    stopFloatingNotes();
    if (musicIcon) {
      musicIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2z"/>
        </svg>
      `;
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (isPlaying) {
        pauseMusic();
        showToast('Musik dijeda');
      } else {
        playMusic();
        showToast('Memutar musik latar');
      }
    });
  }

  // 4. Open Invitation Button Action (3D Flap & Smooth Card Reveal)
  const btnOpen = document.getElementById('btnOpen');
  const coverOverlay = document.getElementById('coverOverlay');
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const bottomNav = document.getElementById('bottomNav');

  if (btnOpen && coverOverlay) {
    btnOpen.addEventListener('click', (e) => {
      e.preventDefault();

      // Step 1: Trigger 3D flap open and card rise
      if (envelopeWrapper) {
        envelopeWrapper.classList.add('opening');
      }

      // Step 2: Start background music
      playMusic();

      // Step 3: Smooth dissolve transition to main invitation page
      setTimeout(() => {
        // Unlock page scroll
        document.body.classList.remove('locked');

        // Animate cover out smoothly
        coverOverlay.classList.add('opened');

        // Reveal bottom navigation
        if (bottomNav) {
          bottomNav.classList.remove('hidden');
        }

        // Smooth scroll to the main hero section
        const heroSection = document.getElementById('hero');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 650);
    });
  }

  // 5. Countdown Timer to Minggu, 29 November 2026, 08:00 WIB (UTC+7)
  const targetWeddingDate = new Date('2026-11-29T08:00:00+07:00').getTime();

  function setDigitText(el, text) {
    if (el && el.textContent !== text) {
      el.classList.add('digit-tick');
      el.textContent = text;
      setTimeout(() => el.classList.remove('digit-tick'), 280);
    }
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetWeddingDate - now;

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minutesEl = document.getElementById('countMinutes');
    const secondsEl = document.getElementById('countSeconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    if (distance < 0) {
      setDigitText(daysEl, '00');
      setDigitText(hoursEl, '00');
      setDigitText(minutesEl, '00');
      setDigitText(secondsEl, '00');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setDigitText(daysEl, days < 10 ? '0' + days : String(days));
    setDigitText(hoursEl, hours < 10 ? '0' + hours : String(hours));
    setDigitText(minutesEl, minutes < 10 ? '0' + minutes : String(minutes));
    setDigitText(secondsEl, seconds < 10 ? '0' + seconds : String(seconds));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 6. Copy to Clipboard Utility with Toast Notification
  const toastNotice = document.getElementById('toastNotice');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.querySelector('.toast-text').textContent = message;
    toastNotice.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  window.copyText = function(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg || 'Berhasil disalin ke clipboard!');
      }).catch(() => {
        fallbackCopyText(text, successMsg);
      });
    } else {
      fallbackCopyText(text, successMsg);
    }
  };

  function fallbackCopyText(text, successMsg) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || 'Berhasil disalin ke clipboard!');
    } catch (err) {
      showToast('Gagal menyalin teks');
    }
    document.body.removeChild(tempInput);
  }

  // 7. Interactive Photo Lightbox Modal
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  const gallerySrcList = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      gallerySrcList.push(img.getAttribute('src'));
      item.addEventListener('click', () => {
        currentGalleryIndex = index;
        openLightbox(currentGalleryIndex);
      });
    }
  });

  function openLightbox(idx) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = gallerySrcList[idx];
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
  }

  function nextLightbox() {
    currentGalleryIndex = (currentGalleryIndex + 1) % gallerySrcList.length;
    openLightbox(currentGalleryIndex);
  }

  function prevLightbox() {
    currentGalleryIndex = (currentGalleryIndex - 1 + gallerySrcList.length) % gallerySrcList.length;
    openLightbox(currentGalleryIndex);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // 8. RSVP & Wishes Feed Storage (Database Integration via db.js)
  async function initWishesDatabase() {
    if (window.WeddingDB) {
      try {
        await window.WeddingDB.init();
        const statusBadge = document.getElementById('dbStatusBadge');
        if (statusBadge && window.WeddingDB.activeEngine) {
          statusBadge.title = `Engine: ${window.WeddingDB.activeEngine}`;
        }
        // Pasang listener realtime jika ada ucapan baru masuk
        window.WeddingDB.onWishAdded(() => {
          renderWishes();
        });
      } catch (e) {
        console.warn('Inisialisasi database:', e);
      }
    }
  }

  async function renderWishes() {
    const feed = document.getElementById('wishesFeed');
    const countBadge = document.getElementById('wishesCount');
    if (!feed) return;

    let wishes = [];
    try {
      if (window.WeddingDB) {
        wishes = await window.WeddingDB.getWishes();
      } else {
        const raw = localStorage.getItem('wedding_wishes_arbian_hima');
        wishes = raw ? JSON.parse(raw) : [];
      }
    } catch (e) {
      console.warn('Gagal memuat ucapan dari database:', e);
    }

    if (countBadge) {
      countBadge.textContent = `${wishes.length} Ucapan`;
    }

    feed.innerHTML = '';
    if (!wishes || wishes.length === 0) {
      feed.innerHTML = `
        <div style="text-align: center; padding: 30px 15px; color: #8c7355; font-size: 14px;">
          Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
        </div>
      `;
      return;
    }

    wishes.forEach(item => {
      let tagClass = 'hadir';
      let tagLabel = 'Hadir';
      if (item.attendance === 'tidak') {
        tagClass = 'tidak';
        tagLabel = 'Tidak Hadir';
      } else if (item.attendance === 'ragu') {
        tagClass = 'ragu';
        tagLabel = 'Masih Ragu';
      }

      const itemEl = document.createElement('div');
      itemEl.className = 'wish-item reveal-up active';
      itemEl.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-sender-name">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            ${escapeHtml(item.name)}
          </span>
          <span class="attendance-tag ${tagClass}">${tagLabel}</span>
        </div>
        <p class="wish-message">${escapeHtml(item.message)}</p>
        <div class="wish-time">${escapeHtml(item.time || 'Baru saja')}</div>
      `;
      feed.appendChild(itemEl);
    });
  }

  function escapeHtml(string) {
    if (!string) return '';
    return string
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Inisialisasi Database dan muat ucapan
  initWishesDatabase().then(() => {
    renderWishes();
  });

  // RSVP Form Submit Handler (Tersimpan ke Database via db.js)
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('rsvpName');
      const attendanceInput = document.getElementById('rsvpAttendance');
      const guestsInput = document.getElementById('rsvpGuests');
      const messageInput = document.getElementById('rsvpMessage');
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const attendance = attendanceInput ? attendanceInput.value : '';
      const guests_count = guestsInput ? guestsInput.value : '1';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name) {
        showToast('Mohon isi nama Anda');
        return;
      }
      if (!attendance) {
        showToast('Mohon pilih konfirmasi kehadiran');
        return;
      }
      if (!message) {
        showToast('Mohon tulis ucapan atau doa restu');
        return;
      }

      // Indikator loading pada tombol kirim
      const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spinDisc 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
          </svg>
          Menyimpan ke Database...
        `;
      }

      try {
        if (window.WeddingDB) {
          await window.WeddingDB.saveWish({
            name,
            attendance,
            guests_count,
            message
          });
        }
        await renderWishes();

        rsvpForm.reset();
        showToast('Terima kasih! Ucapan berhasil tersimpan di database ❤️');

        // Trigger celebratory confetti burst
        triggerCelebrationConfetti();

        // Scroll to feed top
        const feed = document.getElementById('wishesFeed');
        if (feed) {
          feed.scrollTop = 0;
        }
      } catch (err) {
        console.error('Error saat menyimpan ucapan ke database:', err);
        showToast('Gagal menyimpan ucapan. Silakan coba lagi.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
        }
      }
    });
  }

  // 9. Scroll Reveal Animations (Intersection Observer for All Reveal Variants)
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-zoom, .reveal-left, .reveal-right, .reveal-flip');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if observer not supported
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 10. Bottom Navigation Active Section Highlighter
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.pageYOffset + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // 11. Love Story Timeline SVG Stroke Drawer
  function initStoryTimelineAnimation() {
    const storyTimeline = document.getElementById('storyTimeline');
    if (!storyTimeline) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            storyTimeline.classList.add('animated');
          }
        });
      }, { threshold: 0.15 });

      observer.observe(storyTimeline);
    } else {
      storyTimeline.classList.add('animated');
    }
  }
  initStoryTimelineAnimation();

  // 12. Floating Musical Notes on Vinyl Disc Controller
  let notesInterval = null;
  function startFloatingNotes() {
    const container = document.getElementById('musicNotesContainer');
    if (!container || notesInterval) return;
    const symbols = ['♪', '♫', '𝅘𝅥𝅯', '♩', '♬'];

    notesInterval = setInterval(() => {
      if (!isPlaying) return;
      const note = document.createElement('span');
      note.className = 'music-note';
      note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const driftX = (Math.random() - 0.5) * 40;
      note.style.setProperty('--drift-x', `${driftX}px`);
      note.style.left = `${Math.random() * 20}px`;
      container.appendChild(note);

      setTimeout(() => {
        if (note.parentNode) note.parentNode.removeChild(note);
      }, 2200);
    }, 1400);
  }

  function stopFloatingNotes() {
    if (notesInterval) {
      clearInterval(notesInterval);
      notesInterval = null;
    }
  }

  // 13. Parallax Scrolling on Hero
  function initHeroParallax() {
    const heroPortrait = document.querySelector('.hero-portrait-frame');
    const heroGunungan = document.querySelector('.hero-gunungan-top');

    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      if (scrollY < 900) {
        if (heroPortrait) {
          heroPortrait.style.transform = `translateY(${scrollY * 0.05}px)`;
        }
        if (heroGunungan) {
          heroGunungan.style.transform = `translateY(${scrollY * 0.025}px)`;
        }
      }
    }, { passive: true });
  }
  initHeroParallax();

  // 14. Ambient Golden Sparkles & Floating Melati Petals Particle Canvas
  function initAmbientParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const particles = [];
    const TOTAL_PARTICLES = window.innerWidth < 600 ? 25 : 45;

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        type: i % 3 === 0 ? 'sparkle' : 'petal',
        size: i % 3 === 0 ? Math.random() * 2 + 1 : Math.random() * 5 + 4,
        speedY: Math.random() * 0.5 + 0.3,
        speedX: Math.random() * 0.3 - 0.15,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.015 + 0.008,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.45 + 0.35
      });
    }

    let animationFrameId;

    function render() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.sway += p.swaySpeed;
        p.x += Math.sin(p.sway) * 0.5 + p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'sparkle') {
          // Twinkling gold speck
          const alpha = (Math.sin(p.sway * 2) * 0.3 + 0.7) * p.opacity;
          ctx.fillStyle = `rgba(247, 231, 180, ${alpha})`;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.75)';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Delicate jasmine / melati petal
          ctx.fillStyle = `rgba(255, 252, 240, ${p.opacity * 0.75})`;
          ctx.strokeStyle = `rgba(212, 175, 55, ${p.opacity * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.6, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.6, 0, 0, -p.size);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      if (!document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    });

    render();
  }
  initAmbientParticles();

  // 15. Confetti Celebration Burst on Wish Submission
  function triggerCelebrationConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#d4af37', '#f7e7b4', '#ffffff', '#e6a8b0', '#c24253', '#ffd700'];
    const confetti = [];
    const COUNT = 55;

    for (let i = 0; i < COUNT; i++) {
      confetti.push({
        x: width * 0.5 + (Math.random() - 0.5) * 80,
        y: height * 0.6,
        vx: (Math.random() - 0.5) * 11,
        vy: -(Math.random() * 11 + 5),
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        gravity: 0.32,
        opacity: 1
      });
    }

    let frames = 0;
    function animateConfetti() {
      ctx.clearRect(0, 0, width, height);
      frames++;

      let active = false;
      confetti.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.rotation += c.rotationSpeed;
        c.opacity -= 0.012;

        if (c.opacity > 0) {
          active = true;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rotation * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.globalAlpha = Math.max(0, c.opacity);
          ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
          ctx.restore();
        }
      });

      if (active && frames < 130) {
        requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    requestAnimationFrame(animateConfetti);
  }
});
