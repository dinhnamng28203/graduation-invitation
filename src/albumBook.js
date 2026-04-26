import { LABELS, PAGES } from "./albumData";

const FLIP_DURATION_MS = 700;

function collectImageSources() {
  const sources = new Set();

  for (const page of PAGES) {
    if (!page || page.type === "cover") continue;

    for (const side of ["left", "right"]) {
      const data = page[side];
      if (!data) continue;

      if (data.src) sources.add(data.src);
      if (Array.isArray(data.photos)) {
        for (const photo of data.photos) {
          if (photo?.src) sources.add(photo.src);
        }
      }
    }
  }

  return [...sources];
}

function preloadBookImages() {
  const sources = collectImageSources();
  for (const src of sources) {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
  }
}

function renderCoverFront() {
  return `<div class="cover-surface">
    <div class="cover-border"></div>
    <div class="cover-border-inner"></div>
    <div class="cover-ornament-top">✦ · ✦ · ✦</div>
    <div class="cover-ornament-bottom">✦ · ✦ · ✦</div>
    <div class="cover-content">
      <div class="cover-eyebrow">Album kỷ niệm</div>
      <div class="cover-rule"></div>
      <div class="cover-main-title">Đại học<br>có gì?</div>
      <div class="cover-rule"></div>
      <div class="cover-year">2021-2026</div>
    </div>
    <div class="cover-open-hint">Nhấn để mở →</div>
  </div>`;
}

function renderCoverBack() {
  return `<div class="cover-back-surface"><div class="cover-back-content"><div class="cover-back-monogram">✦</div></div></div>`;
}

function renderFull(data) {
  const hasCaption = Boolean(data.caption || data.sub);
  return `<div class="layout-full">
    <div class="full-photo-frame">
      <div class="full-photo-content">
        <img src="${data.src}" alt="${data.caption || "Ảnh album"}" loading="eager" decoding="async" fetchpriority="high" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'>📷<span>Thêm ảnh vào đây</span></div>'">
      </div>
    </div>
    ${data.note ? `<div class="page-note">${data.note}</div>` : ""}
    ${
      hasCaption
        ? `<div class="caption-bar">
      <div class="cap-text">${data.caption || ""}</div>
      ${data.sub ? `<div class="cap-sub">${data.sub}</div>` : ""}
    </div>`
        : ""
    }
  </div>`;
}

function renderPortrait(data, side) {
  const pnClass = side === "left" ? "left" : "right";
  return `<div class="layout-portrait">
    <div class="corner-ornament tl">❧</div><div class="corner-ornament tr">❧</div>
    <div class="corner-ornament bl">❧</div><div class="corner-ornament br">❧</div>
    <div class="photo-date">${data.date || ""}</div>
    <div class="photo-frame">
      <div class="tape top-left"></div><div class="tape top-right"></div>
      <img src="${data.src}" alt="${data.caption}" loading="eager" decoding="async" fetchpriority="high" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'>📷<span>Thêm ảnh vào đây</span></div>'">
    </div>
    <div class="photo-caption">${data.caption}</div>
    ${data.pageNum ? `<div class="page-num ${pnClass}">${data.pageNum}</div>` : ""}
  </div>`;
}

function renderDouble(data) {
  const slots = (data.photos || [])
    .map(
      (p) => `<div class="photo-slot">
      <img src="${p.src}" alt="${p.label}" loading="eager" decoding="async" fetchpriority="high" onerror="this.parentElement.innerHTML='<div class=\\'img-placeholder\\'>📷<span>Thêm ảnh</span></div>'">
      <div class="slot-label">${p.label}</div></div>`,
    )
    .join("");

  return `<div class="layout-double">
    ${data.label ? `<div class="section-label">${data.label}</div>` : ""}
    ${slots}
  </div>`;
}

function renderMood(data) {
  return `<div class="layout-mood">
    <div class="mood-flourish">${data.flourish || "✦"}</div>
    <div class="mood-rule"></div>
    <div class="mood-quote">${data.quote}</div>
    <div class="mood-rule"></div>
    <div class="mood-attr">${data.attr || ""}</div>
  </div>`;
}

function renderChapter(data) {
  return `<div class="layout-chapter">
    <img class="chapter-bg" src="${data.src}" alt="${data.title}" loading="eager" decoding="async" fetchpriority="high" onerror="this.style.display='none'">
    <div class="chapter-overlay">
      <div class="chapter-label">${data.chapterNum}</div>
      <div class="chapter-rule"></div>
      <div class="chapter-title">${data.title}</div>
      <div class="chapter-subtitle">${data.subtitle}</div>
    </div>
  </div>`;
}

function renderEnvelope(data) {
  return `<div class="layout-envelope">
    <div class="envelope-pin"></div>
    <div class="envelope-paper-clip"></div>
    <button class="envelope-body" type="button" data-open-invite="${data.inviteSrc || ""}">
      <div class="envelope-flap"></div>
      <div class="envelope-letter-line"></div>
      <div class="envelope-letter-line short"></div>
      <div class="envelope-letter-line tiny"></div>
      <div class="envelope-to">${data.to || "Gửi bạn của tương lai"}</div>
    </button>
    <div class="envelope-click-hint" aria-hidden="true">
      <span class="envelope-click-dot"></span>
      <span class="envelope-click-dot second"></span>
      <span class="envelope-click-label">Nhấn vào đây để mở thiệp</span>
    </div>
  </div>`;
}

function renderPage(data, side) {
  if (!data) return `<div class="page-surface ${side}-face"></div>`;
  let inner = "";
  if (data.layout === "full") inner = renderFull(data);
  if (data.layout === "portrait") inner = renderPortrait(data, side);
  if (data.layout === "double") inner = renderDouble(data);
  if (data.layout === "mood") inner = renderMood(data);
  if (data.layout === "chapter") inner = renderChapter(data);
  if (data.layout === "envelope") inner = renderEnvelope(data);
  return `<div class="page-surface ${side}-face">${inner}</div>`;
}

export function initAlbumBook() {
  let current = 0;
  let animating = false;
  const pageCache = new Map();

  const staticLeft = document.getElementById("staticLeft");
  const staticRight = document.getElementById("staticRight");
  const flipWrap = document.getElementById("flipWrap");
  const flipFront = document.getElementById("flipFront");
  const flipBack = document.getElementById("flipBack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageLabel = document.getElementById("pageLabel");
  let inviteModal = null;

  if (!staticLeft || !staticRight || !flipWrap || !flipFront || !flipBack || !prevBtn || !nextBtn || !pageLabel) {
    return () => {};
  }

  preloadBookImages();

  const getPageContent = (idx, side) => {
    const cacheKey = `${idx}:${side}`;
    const cached = pageCache.get(cacheKey);
    if (cached) return cached;

    const p = PAGES[idx];
    if (!p) return "";
    const content = p.type === "cover" ? (side === "left" ? renderCoverBack() : renderCoverFront()) : renderPage(p[side], side);
    pageCache.set(cacheKey, content);
    return content;
  };

  const getLeftContent = (idx) => {
    return getPageContent(idx, "left");
  };

  const getRightContent = (idx) => {
    return getPageContent(idx, "right");
  };

  const render = () => {
    staticLeft.innerHTML = getLeftContent(current);
    staticRight.innerHTML = getRightContent(current);
    bindInviteAction();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === PAGES.length - 1;
    pageLabel.textContent = LABELS[current] || `Trang ${current}`;
  };

  const closeInviteModal = () => {
    if (inviteModal) {
      inviteModal.remove();
      inviteModal = null;
      document.body.style.overflow = "";
    }
  };

  const openInviteModal = (src) => {
    if (!src) return;
    closeInviteModal();
    inviteModal = document.createElement("div");
    inviteModal.className = "invite-modal";
    inviteModal.innerHTML = `<div class="invite-modal-overlay" data-close-invite="1"></div>
      <div class="invite-modal-card">
        <button type="button" class="invite-modal-close" data-close-invite="1">×</button>
        <img src="${src}" alt="Thiệp mời tốt nghiệp">
      </div>`;
    inviteModal.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeInvite) {
        closeInviteModal();
      }
    });
    document.body.appendChild(inviteModal);
    document.body.style.overflow = "hidden";
  };

  const bindInviteAction = () => {
    const inviteButton = staticRight.querySelector("[data-open-invite]");
    if (!inviteButton) return;
    inviteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      openInviteModal(target.dataset.openInvite || "");
    });
  };

  const flip = (dir) => {
    if (animating) return;
    const next = current + dir;
    if (next < 0 || next >= PAGES.length) return;
    animating = true;

    flipWrap.style.transition = "none";

    if (dir === 1) {
      flipWrap.className = "flip-wrap from-right";
      flipWrap.style.left = "50%";
      flipFront.innerHTML = getRightContent(current);
      flipBack.innerHTML = getLeftContent(next);
      flipWrap.style.transform = "rotateY(0deg)";

      setTimeout(() => {
        flipWrap.style.transition = `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.77,0,0.175,1)`;
        flipWrap.style.transform = "rotateY(-180deg)";
      }, 20);
    } else {
      flipWrap.className = "flip-wrap from-left";
      flipWrap.style.left = "0";
      flipFront.innerHTML = getLeftContent(current);
      flipBack.innerHTML = getRightContent(next);
      flipWrap.style.transform = "rotateY(0deg)";

      setTimeout(() => {
        flipWrap.style.transition = `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.77,0,0.175,1)`;
        flipWrap.style.transform = "rotateY(180deg)";
      }, 20);
    }

    setTimeout(() => {
      current = next;
      render();
      flipWrap.style.transition = "none";
      flipWrap.style.transform = "rotateY(0deg)";
      flipFront.innerHTML = "";
      flipBack.innerHTML = "";
      animating = false;
    }, FLIP_DURATION_MS + 30);
  };

  const onPrev = () => flip(-1);
  const onNext = () => flip(1);
  const onRight = () => {
    if (current < PAGES.length - 1) flip(1);
  };
  const onLeft = () => {
    if (current > 0) flip(-1);
  };

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);
  staticRight.addEventListener("click", onRight);
  staticLeft.addEventListener("click", onLeft);

  render();

  return () => {
    closeInviteModal();
    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
    staticRight.removeEventListener("click", onRight);
    staticLeft.removeEventListener("click", onLeft);
  };
}
