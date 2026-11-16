/**
 * Jeu d'icônes SVG (style Lucide), tracés en `currentColor`.
 * Remplace tous les emojis de l'ancienne interface.
 */
const PATHS = {
  home: '<path d="M3 10.2 12 3l9 7.2"/><path d="M5.5 9.3V20a1 1 0 0 0 1 1H10v-5.5h4V21h3.5a1 1 0 0 0 1-1V9.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  star: '<path d="M12 3.6l2.62 5.31 5.86.85-4.24 4.13 1 5.84L12 16.98l-5.24 2.75 1-5.84-4.24-4.13 5.86-.85Z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2.5-2.5c0-.6-.3-1.2-.7-1.7-.4-.5-.6-1-.6-1.6a2.5 2.5 0 0 1 2.5-2.5h2.8A4.5 4.5 0 0 0 23 9.1C22.3 5 17.6 2 12 2Z"/>',
  sparkles:
    '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z"/><path d="M5 14l.6 1.7 1.8.7-1.8.7L5 18.8l-.6-1.7-1.8-.7 1.8-.7Z"/>',
  crown: '<path d="M3.5 8.5 8 12l4-7 4 7 4.5-3.5-1.8 9.5H5.3Z"/><path d="M5.3 20h13.4"/>',
  link: '<path d="M9.5 14.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14.5 9.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>',
  externalLink:
    '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  chevronLeft: '<path d="m15 5-7 7 7 7"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  pencil: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 6.5 3 3"/>',
  trash:
    '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/><path d="M11 8v6M8 11h6"/>',
  images: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v11"/>',
  heart: '<path d="M12 20.5 4.6 13a4.9 4.9 0 0 1 7-6.9l.4.4.4-.4a4.9 4.9 0 0 1 7 6.9Z"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8h.01"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>',
  filter: '<path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3.5 12.5 8.5 4.7 8.5-4.7"/>',
};

/**
 * Retourne le markup SVG d'une icône.
 * @param {string} name clé de PATHS
 * @param {string} className classes Tailwind appliquées au svg
 * @param {{strokeWidth?:number, fill?:string}} [options]
 */
export function icon(name, className = 'h-4 w-4', options = {}) {
  const { strokeWidth = 1.6, fill = 'none' } = options;
  const body = PATHS[name] || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true">${body}</svg>`;
}

/** Injecte les icônes déclarées dans le HTML statique via `data-icon`. */
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.iconReady === '1') return;
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass || 'h-[18px] w-[18px]', {
      strokeWidth: Number(el.dataset.iconStroke || 1.6),
      fill: el.dataset.iconFill || 'none',
    });
    el.dataset.iconReady = '1';
  });
}
