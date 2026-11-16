/**
 * Secours global pour les images.
 *
 * Chaque case affiche par défaut le visuel « VISUEL INDISPONIBLE » (Dark
 * Grimoire) comme fond de base ; la vraie image se peint par-dessus dès qu'elle
 * est chargée. Si le lien externe est invalide (404, domaine fermé, coupure
 * réseau), le fond de secours reste visible : aucune icône d'image cassée.
 *
 * Le visuel de secours est un SVG encodé en Data URI (100 % autonome, sans
 * fichier externe) et il est pré-décodé une seule fois au démarrage afin d'être
 * peint immédiatement, sans délai réseau.
 */

/** Visuel de secours : fond #121215, bordure #27272a, icône barrée gris/carmin. */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#121215"/>
  <rect x="12" y="12" width="376" height="476" rx="16" fill="none" stroke="#27272a" stroke-width="2" stroke-dasharray="9 7"/>
  <g fill="none" stroke="#3f3f46" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="128" y="180" width="144" height="112" rx="14"/>
    <circle cx="166" cy="212" r="11"/>
    <path d="M136 278l36-36a13 13 0 0 1 18 0l24 24 12-12a13 13 0 0 1 18 0l16 16"/>
  </g>
  <path d="M140 320 268 172" stroke="#9f1239" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
  <text x="200" y="372" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" letter-spacing="3" fill="#52525b">VISUEL INDISPONIBLE</text>
</svg>`;

export const FALLBACK_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_SVG)}`;

const FALLBACK_BACKGROUND = `url("${FALLBACK_IMAGE}")`;

/** Délai maximal toléré avant de forcer le secours (ms). */
const FALLBACK_TIMEOUT = 3000;

/** Pré-décodage unique : le secours est décodé et gardé en cache mémoire, si
 *  bien qu'au premier affichage le navigateur n'a plus rien à préparer. */
let preloaded = false;
function preloadFallback() {
  if (preloaded || typeof Image === 'undefined') return;
  preloaded = true;
  const img = new Image();
  img.decoding = 'sync';
  img.src = FALLBACK_IMAGE;
  if (typeof img.decode === 'function') img.decode().catch(() => {});
}

/**
 * Peint le visuel de secours en fond de la case. C'est le fond de base : la
 * vraie image, une fois chargée, recouvre entièrement ce fond.
 */
function paintFallbackBackground(img) {
  if (!img) return;
  img.style.backgroundImage = FALLBACK_BACKGROUND;
  img.style.backgroundPosition = 'center';
  img.style.backgroundRepeat = 'no-repeat';
  img.style.backgroundSize = 'cover';
}

/**
 * Enregistre l'échec définitif : le fond de secours reste affiché et la source
 * est remplacée par le SVG, afin qu'aucune icône « image cassée » n'apparaisse.
 * Le marqueur `data-fallback-applied` évite de retraiter un même élément.
 */
export function applyFallback(img) {
  if (!img || img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';

  if (img.dataset.fallbackTimer) {
    clearTimeout(Number(img.dataset.fallbackTimer));
    delete img.dataset.fallbackTimer;
  }

  img.removeAttribute('srcset');
  // Plus de chargement différé : le secours doit s'afficher tout de suite.
  img.removeAttribute('loading');

  paintFallbackBackground(img);
  img.src = FALLBACK_IMAGE;
}

/** Ré-autorise le secours après l'affectation d'une nouvelle source.
 *  Le fond de base, lui, reste toujours peint. */
export function resetImageFallback(img) {
  if (!img) return;
  delete img.dataset.fallbackApplied;
  paintFallbackBackground(img);
}

/**
 * Arme un garde-temps : si l'image n'a toujours rien affiché après
 * `FALLBACK_TIMEOUT`, on enregistre l'échec sans attendre la fin de la requête
 * (certains hébergeurs suspendent la requête très longtemps avant `error`).
 * Le minuteur est annulé dès que l'image se charge réellement.
 */
function armWatchdog(img) {
  if (!img || img.dataset.fallbackTimer || img.dataset.fallbackApplied === '1') return;
  const timer = window.setTimeout(() => {
    delete img.dataset.fallbackTimer;
    if (!img.complete || img.naturalWidth === 0) applyFallback(img);
  }, FALLBACK_TIMEOUT);
  img.dataset.fallbackTimer = String(timer);
  img.addEventListener(
    'load',
    () => {
      if (img.dataset.fallbackTimer === String(timer)) {
        clearTimeout(timer);
        delete img.dataset.fallbackTimer;
      }
    },
    { once: true, capture: true }
  );
}

/**
 * Branche le fond de secours sur une image (cartes et galeries générées
 * dynamiquement, miniatures, lightbox). Le fond est peint immédiatement ; la
 * vraie image s'affiche ensuite par-dessus lorsqu'elle est chargée.
 */
export function watchImage(img) {
  if (!img || img.dataset.fallbackWatched === '1') return img;
  img.dataset.fallbackWatched = '1';

  // Fond de base : visible tant que la vraie image n'est pas chargée.
  paintFallbackBackground(img);

  img.addEventListener('error', () => applyFallback(img), true);

  // Une fois la vraie image chargée, on retire le fond de base (utile pour les
  // images en `object-contain`, où il resterait visible sur les côtés).
  img.addEventListener(
    'load',
    () => {
      if (img.dataset.fallbackApplied === '1') return;
      img.style.backgroundImage = '';
    },
    true
  );

  // Cas d'une image déjà en échec au moment du branchement.
  const source = img.getAttribute('src');
  if (source && img.complete && img.naturalWidth === 0) {
    applyFallback(img);
    return img;
  }

  // Image encore en cours de chargement : garde-temps de sécurité.
  if (source && !img.complete) armWatchdog(img);

  return img;
}

/**
 * Filet de sécurité global : l'erreur est écoutée en phase de capture, car
 * l'événement `error` des images ne remonte pas (bubbling désactivé). Le fond
 * de secours est également peint sur les images présentes au chargement.
 */
export function initImageFallback() {
  preloadFallback();
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) applyFallback(target);
    },
    true
  );

  document.querySelectorAll('img').forEach((img) => {
    paintFallbackBackground(img);
    const source = img.getAttribute('src');
    if (source && !img.complete) armWatchdog(img);
  });
}
