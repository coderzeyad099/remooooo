/* Reem's birthday interactions. No external JavaScript libraries required. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const intro = $("#intro");
  const site = $("#site");
  const openButton = $("#open-surprise");
  const audio = $("#birthday-audio");
  const musicToggle = $("#music-toggle");
  const volume = $("#volume");
  const toast = $("#toast");
  const confettiLayer = $("#confetti-layer");
  const giftModal = $("#gift-modal");
  const lightbox = $("#lightbox");
  let lastFocusedElement = null;
  let toastTimer = null;
  let currentGift = "one";
  let audioWasStarted = false;
  let letterAnimationTimer = null;

  // Create a light, static field of tiny stars rather than a heavy particle canvas.
  function makeSky() {
    const sky = $("#sky");
    if (!sky) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 52; i++) {
      const star = document.createElement("span");
      star.className = "sky-star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--duration", `${2.4 + Math.random() * 4}s`);
      star.style.animationDelay = `${Math.random() * -5}s`;
      star.style.opacity = `${0.25 + Math.random() * 0.65}`;
      fragment.appendChild(star);
    }
    sky.appendChild(fragment);
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function burstConfetti(amount = 90) {
    if (!confettiLayer || reducedMotion) return;
    const colors = ["#e7a0c3", "#b8a7e9", "#f0ce7d", "#f6d9e7", "#a5c9c0", "#d99b8e"];
    const symbols = ["♥", "✦", "✧"];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < amount; i++) {
      const piece = document.createElement("span");
      const isHeart = Math.random() < 0.13;
      piece.className = `confetti-piece${isHeart ? " heart-piece" : ""}`;
      if (isHeart) {
        piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        piece.style.color = colors[Math.floor(Math.random() * colors.length)];
      } else {
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = `${4 + Math.random() * 7}px`;
        piece.style.height = `${7 + Math.random() * 10}px`;
      }
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--fall-time", `${2.1 + Math.random() * 2.4}s`);
      piece.style.setProperty("--delay", `${Math.random() * .6}s`);
      piece.style.setProperty("--drift", `${Math.random() * 240 - 120}px`);
      piece.style.setProperty("--spin", `${Math.random() * 900 - 450}deg`);
      fragment.appendChild(piece);
      window.setTimeout(() => piece.remove(), 5200);
    }
    confettiLayer.appendChild(fragment);
  }

  async function startMusic() {
    if (!audio) return false;
    try {
      audio.volume = Number(volume?.value ?? 0.55);
      const result = audio.play();
      if (result && typeof result.then === "function") await result;
      audioWasStarted = true;
      updateMusicUI(true);
      return true;
    } catch (error) {
      updateMusicUI(false);
      showToast("ما قدرنا نشغّل الموسيقى. تأكدي من وجود assets/birthday.mp3 ثم جرّبي زر الموسيقى.");
      console.info("Audio playback was blocked or the audio file is unavailable.", error);
      return false;
    }
  }

  function updateMusicUI(playing) {
    if (!musicToggle) return;
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "إيقاف الموسيقى" : "تشغيل الموسيقى");
  }

  async function toggleMusic() {
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      updateMusicUI(false);
      return;
    }
    await startMusic();
  }

  function openExperience() {
    if (!intro || !site) return;
    intro.classList.add("is-leaving");
    site.classList.add("is-visible");
    site.removeAttribute("inert");
    document.body.classList.remove("locked");
    window.setTimeout(() => {
      intro.hidden = true;
      $("#home")?.setAttribute("tabindex", "-1");
      $("#home")?.focus({ preventScroll: true });
    }, reducedMotion ? 20 : 950);
    burstConfetti(125);
    animateLetter();
    // This click is a user gesture, so the browser is more likely to permit playback.
    startMusic();
  }

  const letterText = "ريم يا قطعة من قلبي، يا أختي وحبيبتي وواحدة من أجمل النعم اللي أعطتني ياها الحياة. كل سنة وإنتِ الضحكة الحلوة اللي بتنور أيامنا، والقلب الطيب اللي وجوده لحاله بيعمل فرق. بتمنالك سنة مليانة فرح ونجاح وراحة بال، وتتحقق فيها كل أمنياتك، وتضلي دايمًا مبسوطة ومحبوبة ومحاطة بكل شي حلو بتستحقيه. الله يخليلي ياكي يا أحلى ريم بالدنيا، وكل سنة وإنتِ بألف خير ❤️🎂";
  function animateLetter() {
    const target = $("#letter-text");
    if (!target) return;
    window.clearInterval(letterAnimationTimer);
    if (reducedMotion || !("IntersectionObserver" in window) || target.dataset.typed === "true") {
      target.textContent = letterText;
      return;
    }
    target.dataset.typed = "true";
    target.textContent = "";
    let index = 0;
    letterAnimationTimer = window.setInterval(() => {
      target.textContent += letterText.slice(index, index + 3);
      index += 3;
      if (index >= letterText.length) {
        target.textContent = letterText;
        window.clearInterval(letterAnimationTimer);
      }
    }, 22);
  }

  function replayLetter() {
    const target = $("#letter-text");
    if (!target) return;
    target.dataset.typed = "false";
    if (reducedMotion) {
      target.textContent = letterText;
      return;
    }
    window.clearInterval(letterAnimationTimer);
    target.textContent = "";
    let index = 0;
    letterAnimationTimer = window.setInterval(() => {
      target.textContent += letterText.slice(index, index + 2);
      index += 2;
      if (index >= letterText.length) {
        target.textContent = letterText;
        target.dataset.typed = "true";
        window.clearInterval(letterAnimationTimer);
      }
    }, 28);
  }

  const gifts = {
    one: {
      art: "🎁",
      title: "أحلى هدية",
      message: "أحلى هدية بالدنيا هي وجودك بحياتي يا ريم ❤️ وجودك لحاله فرحة، وضحكتك هدية، وقربك نعمة ما بتنقاس بأي شيء.",
      celebration: true
    },
    two: {
      art: "💌",
      title: "سرّ صغير إلكِ",
      message: "إذا في شي بتمنّاه إلكِ بكل قلبي، فهو إنك تشوفي حالك بعيون الناس اللي بيحبوكي: إنسانة غالية، مميزة، وبتستاهل كل الحب الحلو اللي بالدنيا. لا تنسي هالشي أبدًا يا ريم. ♡",
      celebration: false
    },
    three: {
      art: "✨",
      title: "أمنية من القلب",
      message: "يا رب تكون سنتك الجديدة مليانة أبواب حلوة تنفتح، وأخبار تفرّح قلبك، وراحة بال ترافقك، وأمنيات تتحقق وحدة ورا الثانية. يا رب تضل الضحكة ساكنة بعيونك يا ريم. ✨",
      celebration: true
    }
  };

  function openGift(key) {
    const gift = gifts[key];
    if (!gift || !giftModal) return;
    currentGift = key;
    lastFocusedElement = document.activeElement;
    $("#modal-art").textContent = gift.art;
    $("#modal-title").textContent = gift.title;
    $("#modal-message").textContent = gift.message;
    giftModal.classList.remove("is-opening");
    giftModal.classList.add("is-open");
    giftModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => giftModal.classList.add("is-opening"));
    $(".modal-close", giftModal)?.focus();
    if (gift.celebration) burstConfetti(38);
  }

  function closeGift() {
    if (!giftModal?.classList.contains("is-open")) return;
    giftModal.classList.remove("is-open", "is-opening");
    giftModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocusedElement?.focus?.();
  }

  function openLightbox(button) {
    const image = $("img", button);
    if (!image || !button.classList.contains("has-image") || !lightbox) {
      showToast("أضيفي صورتكِ إلى مجلد assets لتظهر هنا ♡");
      return;
    }
    lastFocusedElement = document.activeElement;
    const largeImage = $("#lightbox-image");
    largeImage.src = image.currentSrc || image.src;
    largeImage.alt = image.alt || "صورة من الذكريات";
    $("#lightbox-caption").textContent = image.alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".modal-close", lightbox)?.focus();
  }

  function closeLightbox() {
    if (!lightbox?.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    $("#lightbox-image").src = "";
    lastFocusedElement?.focus?.();
  }

  function setupPhotos() {
    $$(".memory-card").forEach((card) => {
      const image = $("img", card);
      if (!image) return;
      const markLoaded = () => {
        if (image.naturalWidth > 0) card.classList.add("has-image");
        else card.classList.remove("has-image");
      };
      image.addEventListener("load", markLoaded);
      image.addEventListener("error", () => card.classList.remove("has-image"));
      if (image.complete) markLoaded();
      card.addEventListener("click", () => openLightbox(card));
    });
  }

  function setupCountdown() {
    const label = $("#countdown-label");
    if (!label) return;
    const now = new Date();
    const target = new Date(now.getFullYear(), 9, 15, 0, 0, 0, 0);
    const todayIsBirthday = now.getMonth() === 9 && now.getDate() === 15;
    if (todayIsBirthday) {
      label.textContent = "اليوم يومكِ… كل عام وأنتِ بخير! 🎂";
      return;
    }
    if (target.getTime() < now.getTime()) target.setFullYear(now.getFullYear() + 1);
    const days = Math.ceil((target.getTime() - now.getTime()) / 86400000);
    label.textContent = days === 1 ? "باقي يوم واحد على يومكِ ♡" : `باقي ${days} يومًا على يومكِ ♡`;
  }

  function setupReveal() {
    const items = $$(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    items.forEach((item) => observer.observe(item));
  }

  let candlesBlown = false;
  function toggleCandles() {
    const cake = $(".wish-cake");
    const button = $("#blow-candles");
    const result = $("#wish-result");
    if (!cake || !button || !result) return;
    candlesBlown = !candlesBlown;
    cake.classList.toggle("blown", candlesBlown);
    if (candlesBlown) {
      button.innerHTML = 'نولّع الشموع من جديد <span>✨</span>';
      result.textContent = "يا رب كل أمنياتك تصير حقيقة يا ريم ❤️";
      burstConfetti(90);
    } else {
      button.innerHTML = 'يلا نطفي الشموع <span>🕯️</span>';
      result.textContent = "جاهزة لأمنية جديدة؟ خذي وقتكِ يا ريم ♡";
    }
  }

  function setupKeyboard() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeGift();
        closeLightbox();
      }
      const openModal = giftModal?.classList.contains("is-open") ? giftModal : lightbox?.classList.contains("is-open") ? lightbox : null;
      if (event.key === "Tab" && openModal) {
        const focusable = $$('button:not([disabled]),a[href],input:not([disabled])', openModal).filter(el => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }

  function setupScroll() {
    const back = $("#back-to-top");
    const onScroll = () => back?.classList.toggle("is-visible", window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    back?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  }

  function setupAudio() {
    musicToggle?.addEventListener("click", toggleMusic);
    volume?.addEventListener("input", () => {
      if (audio) audio.volume = Number(volume.value);
    });
    audio?.addEventListener("play", () => updateMusicUI(true));
    audio?.addEventListener("pause", () => updateMusicUI(false));
    audio?.addEventListener("error", () => {
      updateMusicUI(false);
      // Missing audio should not disrupt any other interaction.
      if (audioWasStarted) showToast("ملف الموسيقى غير متاح حاليًا. ضعي birthday.mp3 داخل assets.");
    });
  }

  function init() {
    makeSky();
    setupCountdown();
    setupReveal();
    setupPhotos();
    setupScroll();
    setupKeyboard();
    setupAudio();

    openButton?.addEventListener("click", openExperience);
    $("#replay-letter")?.addEventListener("click", replayLetter);
    $$(".gift-card").forEach((card) => card.addEventListener("click", () => openGift(card.dataset.gift)));
    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeGift));
    $$("[data-close-lightbox]").forEach((el) => el.addEventListener("click", closeLightbox));
    $("#modal-again")?.addEventListener("click", () => openGift(currentGift));
    $("#blow-candles")?.addEventListener("click", toggleCandles);

    // Friendly fallback if a browser reports a missing audio file only after play().
    window.addEventListener("error", (event) => {
      if (event.target instanceof HTMLImageElement) {
        event.target.closest(".memory-card")?.classList.remove("has-image");
      }
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
