/**
 * Routeur interne : affiche une seule page `.page` à la fois
 * et met en surbrillance l'entrée de navigation correspondante
 * (barre latérale desktop + barre inférieure mobile).
 */
const handlers = {};

export function registerPage(pageId, onShow) {
  handlers[pageId] = onShow;
}

/** Détermine l'entrée de nav à surligner pour une page donnée. */
function navTarget(pageId) {
  if (pageId === 'home') return 'home';
  const match = pageId.match(/^([a-z]+)-(search|add|detail|edit)$/);
  if (!match) return null;
  const [, key, kind] = match;
  return kind === 'detail' || kind === 'edit' ? `${key}-search` : pageId;
}

export function switchPage(pageId) {
  document.querySelectorAll('.page').forEach((p) => p.classList.add('hidden'));

  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('animate-[gx-rise_.35s_ease-out]');
  }

  const active = navTarget(pageId);
  document.querySelectorAll('[data-nav]').forEach((el) => {
    const isActive = el.dataset.nav === active;
    el.classList.toggle('is-active', isActive);
    el.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  const handler = handlers[pageId];
  if (handler) handler();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
