/* =========================================================
   Pearlies Dental Clinic — interactions
   ========================================================= */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const motionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionMQ.matches;

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Masthead state ---------- */
  const masthead = $(".masthead");
  const toTop = $("#toTop");
  function onScroll() {
    const y = window.scrollY;
    if (masthead) masthead.classList.toggle("is-stuck", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Mobile menu ---------- */
  const toggle = $("#menuToggle");
  const menu = $("#menu");
  if (masthead && toggle && menu) {
    const setOpen = (open) => {
      masthead.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!masthead.classList.contains("is-open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && masthead.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    const wide = window.matchMedia("(min-width: 721px)");
    wide.addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Loading screen ---------- */
  const loader = $("#loader");
  const loaderBar = $(".loader__bar span", loader);
  const loaderPercent = $(".loader__percent", loader);
  let progress = 0;
  function setProgress(p) {
    progress = Math.min(100, Math.max(progress, p));
    if (loaderBar) loaderBar.style.width = progress + "%";
    if (loaderPercent) loaderPercent.textContent = Math.round(progress) + "%";
  }
  // Simulate asset loading progress
  const loadStart = performance.now();
  const minLoad = reduceMotion ? 300 : 900;
  function tickLoad() {
    const elapsed = performance.now() - loadStart;
    const t = Math.min(1, elapsed / minLoad);
    setProgress(t * 90);
    if (t < 1) requestAnimationFrame(tickLoad);
    else finishLoad();
  }
  function finishLoad() {
    setProgress(100);
    setTimeout(() => {
      if (loader) loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      // trigger skeleton hydration
      hydrateSkeletons();
      // trigger hero intro
      const hero = $(".hero");
      if (hero) cinematicIntro(hero);
      playReveal();
    }, reduceMotion ? 100 : 350);
  }
  // kick off
  document.body.classList.add("is-loading");
  requestAnimationFrame(tickLoad);
  // also wait for window load as a safety
  window.addEventListener("load", () => { if (progress < 90) setProgress(90); });

  /* ---------- Skeleton hydration ---------- */
  function hydrateSkeletons() {
    const blocks = $$("[data-skeleton]");
    blocks.forEach((block, i) => {
      setTimeout(() => {
        block.classList.remove("is-loading");
        block.classList.add("is-loaded");
      }, reduceMotion ? 0 : 200 + i * 120);
    });
  }

  /* ---------- Text → char spans ---------- */
  function splitIntoChars(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((tn) => {
      const text = tn.textContent;
      if (!text.trim()) return;
      const frag = document.createDocumentFragment();
      [...text].forEach((ch) => {
        const sp = document.createElement("span");
        sp.className = "char";
        sp.textContent = ch === " " ? "\u00A0" : ch;
        sp.style.display = "inline-block";
        frag.appendChild(sp);
      });
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  /* ---------- Cinematic hero entrance ---------- */
  async function cinematicIntro(root) {
    if (reduceMotion) {
      $$("[data-enter]", root).forEach((el) => el.classList.add("is-in"));
      return;
    }
    const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
    async function reveal(el, { delay = 0, duration = 520, fromY = 14, stagger = 0 } = {}) {
      if (!el) return;
      const chars = $$(".char", el);
      if (chars.length) {
        await Promise.all(chars.map((span, i) =>
          span.animate(
            [{ opacity: 0, transform: `translateY(${fromY}px)` }, { opacity: 1, transform: "none" }],
            { duration, delay: delay + i * stagger, easing: EASE, fill: "both" }
          ).finished
        ));
      } else {
        await el.animate(
          [{ opacity: 0, transform: `translateY(${fromY}px)` }, { opacity: 1, transform: "none" }],
          { duration, delay, easing: EASE, fill: "both" }
        ).finished;
      }
    }
    const role = $(".hero__role", root);
    const title = $(".hero__name", root);
    const lede = $(".hero__lede", root);
    const actions = $(".hero__actions", root);
    const assurance = $(".hero__assurance", root);
    if (title) splitIntoChars(title);
    await reveal(role, { delay: 60 });
    await reveal(title, { delay: 180, stagger: 38 });
    await reveal(lede, { delay: 340 });
    await reveal(actions, { delay: 480 });
    await reveal(assurance, { delay: 620 });
    $$("[data-enter]", root).forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Hero 3D mouse parallax ---------- */
    const hero = $(".hero");
    if (hero) {
      const layers = $$(".hero__layer", hero);
      if (layers.length) {
        hero.addEventListener("mousemove", (e) => {
          const r = hero.getBoundingClientRect();
          const cx = (e.clientX - r.left) / r.width - 0.5;
          const cy = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((el) => {
            const z = parseFloat(el.dataset.z || 0);
            const strength = z / 40;
            el.style.transform = `translate3d(${cx * 12 * strength}px, ${cy * 12 * strength}px, ${z}px)`;
          });
        });
        hero.addEventListener("mouseleave", () => {
          layers.forEach((el) => { el.style.transform = `translateZ(${el.dataset.z || 0}px)`; });
        });
      }
    }

  /* ---------- Card tilt ---------- */
  if (!reduceMotion) {
    $$(".service, .principle, .team-card, .testimonial, .gallery-item").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(var(--perspective)) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function playReveal() {
    const items = $$("[data-reveal], [data-enter]").filter((el) => !el.closest(".hero"));
    if (!items.length) return;
    const show = (el) => el.classList.add("is-in");
    if (reduceMotion || !("IntersectionObserver" in window)) { items.forEach(show); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Counter animation ---------- */
  function animateCounters() {
    $$("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
      const duration = 1400;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  // trigger counters when hero assurance enters view
  const assurance = $(".hero__assurance");
  if (assurance) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { animateCounters(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(assurance);
    } else { animateCounters(); }
  }

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-item__q", item);
    if (!q) return;
    q.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      // close others
      $$(".faq-item.is-open").forEach((o) => o.classList.remove("is-open"));
      if (!open) item.classList.add("is-open");
    });
  });

  /* ---------- Appointment form ---------- */
  const form = $("#bookingForm");
  const note = $("#formNote");
  if (form && note) {
    const setError = (input, message) => {
      const field = input.closest(".field");
      field.classList.toggle("is-error", Boolean(message));
      const slot = $(".field__error", field);
      if (slot) slot.textContent = message || "";
      input.setAttribute("aria-invalid", message ? "true" : "false");
    };
    const validators = {
      name: (v) => (v.trim() ? "" : "Tell us what to call you."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email so we can reply."),
      phone: (v) => (v.trim().length >= 7 ? "" : "Enter a valid phone number."),
      message: (v) => (v.trim().length >= 10 ? "" : "A sentence or two is enough."),
    };
    Object.keys(validators).forEach((key) => {
      const input = form.elements[key];
      if (!input) return;
      input.addEventListener("blur", () => setError(input, validators[key](input.value)));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("is-error") && !validators[key](input.value)) setError(input, "");
      });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      note.classList.remove("is-error", "is-success");
      let firstBad = null;
      Object.keys(validators).forEach((key) => {
        const input = form.elements[key];
        if (!input) return;
        const message = validators[key](input.value);
        setError(input, message);
        if (message && !firstBad) firstBad = input;
      });
      if (firstBad) {
        note.textContent = "Check the highlighted fields and send again.";
        note.classList.add("is-error");
        firstBad.focus();
        return;
      }
      const name = form.elements.name.value.trim().split(/\s+/)[0];
      note.textContent = `Thank you, ${name}. Your request has been received — we'll reply within one business day.`;
      note.classList.add("is-success");
      form.reset();
    });
  }

  /* ---------- Button ripple ---------- */
  $$(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - r.left - size / 2) + "px";
      ripple.style.top = (e.clientY - r.top - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Page transition ---------- */
  const pt = $(".page-transition");
  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;
    if (href.endsWith(".html") || href === "index.html") {
      a.addEventListener("click", (e) => {
        if (reduceMotion || !pt) return;
        e.preventDefault();
        pt.classList.add("is-active");
        setTimeout(() => { window.location.href = href; }, 220);
      });
    }
  });

  /* ---------- Reduced motion changes at runtime ---------- */
  motionMQ.addEventListener("change", (e) => {
    reduceMotion = e.matches;
    if (reduceMotion) {
      $$("[data-enter], [data-reveal]").forEach((el) => el.classList.add("is-in"));
      document.body.classList.remove("is-loading");
      if (loader) loader.classList.add("is-done");
    }
  });

  /* ---------- Char opacity initial (CSS handles; ensure no stuck) ---------- */
  // safety: if loader never finishes (e.g. no JS animation), show content after 4s
  setTimeout(() => {
    document.body.classList.remove("is-loading");
    if (loader) loader.classList.add("is-done");
    $$("[data-enter], [data-reveal]").forEach((el) => el.classList.add("is-in"));
  }, 4000);
})();
