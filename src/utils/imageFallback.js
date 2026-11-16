/**
 * Secours global pour les images.
 *
 * Un lien externe peut devenir invalide (404, domaine fermé, coupure réseau) :
 * plutôt que d'afficher l'icône « image cassée » du navigateur, on rejoue un
 * visuel de secours « Dark Grimoire » encodé en Data URI (donc 100 % autonome,
 * sans aucun fichier externe à charger).
 *
 * Optimisation vitesse : le visuel de secours est pré-décodé une seule fois au
 * démarrage et appliqué via `background-image` — la peinture est alors
 * synchrone, sans aucun aller-retour réseau ni attente de décodage.
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

/** Pré-décodage unique : le secours est décodé et gardé en cache mémoire, si
 *  bien qu'au premier échec le navigateur n'a plus rien à préparer. */
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
 * Remplace la source d'une image par le visuel de secours.
 * Le marqueur `data-fallback-applied` garantit qu'un même élément n'est traité
 * qu'une seule fois : si le secours lui-même échouait, la boucle s'arrête là.
 */
export function applyFallback(img) {
  if (!img || img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';

  img.removeAttribute('srcset');
  // Plus de chargement différé : la peinture du secours doit être immédiate.
  img.removeAttribute('loading');

  // Peinture synchrone du visuel, indépendante de tout chargement d'image.
  img.style.backgroundImage = FALLBACK_BACKGROUND;
  img.style.backgroundPosition = 'center';
  img.style.backgroundRepeat = 'no-repeat';
  img.style.backgroundSize = 'cover';

  // Source mise à jour en parallèle (déjà en cache → aucune attente).
  img.src = FALLBACK_IMAGE;
}

/** Ré-autorise le secours après l'affectation d'une nouvelle source. */
export function resetImageFallback(img) {
  if (!img) return;
  delete img.dataset.fallbackApplied;
  img.style.backgroundImage = '';
}

/**
 * Branche le secours sur une image précise (cartes et galeries générées
 * dynamiquement, miniatures, lightbox).
 */
export function watchImage(img) {
  if (!img || img.dataset.fallbackWatched === '1') return img;
  img.dataset.fallbackWatched = '1';
  img.addEventListener('error', () => applyFallback(img), true);

  // Cas d'une image déjà en échec au moment du branchement.
  const source = img.getAttribute('src');
  if (source && img.complete && img.naturalWidth === 0) applyFallback(img);

  return img;
}

/**
 * Filet de sécurité global : l'erreur est écoutée en phase de capture, car
 * l'événement `error` des images ne remonte pas (bubbling désactivé). Le
 * secours est appliqué par `applyFallback`, sans aucun délai d'attente réseau.
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
}
