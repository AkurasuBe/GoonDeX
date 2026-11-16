import { escapeHtml, normalizeTags } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { watchImage } from '../utils/imageFallback.js';
import { starsHtml } from '../utils/stars.js';

const MAX_RESULTS = 8;
const LATEST_COUNT = 4;

/** Un item correspond si son titre ou l'un de ses tags contient la requête. */
function matches(item, query) {
  if (!query) return false;
  if (String(item.name || '').toLowerCase().includes(query)) return true;
  return normalizeTags(item.tags).some((tag) => tag.toLowerCase().includes(query));
}

/**
 * Tableau de bord de l'accueil : compteurs par catégorie, recherche globale
 * (4 tables simultanément), derniers ajouts toutes catégories et entrée aléatoire.
 * Les données proviennent du store déjà chargé via Supabase.
 */
export function createHomeDashboard({ entities, getItems, onOpenItem }) {
  const collectionsEl = document.getElementById('home-collections');
  const searchInput = document.getElementById('home-search-input');
  const searchResults = document.getElementById('home-search-results');
  const latestEl = document.getElementById('home-latest');
  const randomBtn = document.getElementById('home-random');
  if (!collectionsEl || !latestEl) return { refresh() {} };

  let resultItems = [];
  let latestItems = [];

  /* --- 1. Cartes de catégories + badges de comptage --- */
  collectionsEl.innerHTML = entities
    .map(
      (entity) => `
      <button type="button" data-page="${entity.key}-search" class="group relative overflow-hidden rounded-xl border border-hairline bg-charcoal p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-carmine/50 hover:shadow-glow">
        <span class="absolute inset-0 bg-carmine/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
        <span class="relative flex items-start justify-between gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-hairline bg-graphite text-amber-500 transition-colors duration-300 group-hover:border-amber-500/40 group-hover:text-amber-400">
            ${icon(entity.icon, 'h-[18px] w-[18px]')}
          </span>
          <span data-count="${entity.key}" class="gx-chip-gold" title="Entrées enregistrées">
            ${icon('layers', 'h-3 w-3')}<span data-count-value>—</span>
          </span>
        </span>
        <span class="relative mt-4 block font-display text-sm tracking-[0.14em] text-zinc-100">${escapeHtml(entity.label)}</span>
        <span class="relative mt-1 block truncate text-[11px] text-zinc-500">${escapeHtml(entity.tagline)}</span>
        <span class="relative mt-5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors duration-300 group-hover:text-amber-400">
          Explorer ${icon('chevronRight', 'h-3 w-3')}
        </span>
      </button>`
    )
    .join('');

  function renderCounters() {
    collectionsEl.querySelectorAll('[data-count]').forEach((badge) => {
      const value = badge.querySelector('[data-count-value]');
      if (!value) return;
      const items = getItems(badge.dataset.count) || [];
      value.textContent = String(items.length);
    });
  }

  /* --- 2. Recherche globale sur les 4 tables --- */
  function renderSearch() {
    if (!searchInput || !searchResults) return;
    const raw = searchInput.value.trim();
    const query = raw.toLowerCase();

    if (!query) {
      resultItems = [];
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
      return;
    }

    const found = [];
    entities.forEach((entity) => {
      (getItems(entity.key) || []).forEach((item) => {
        if (matches(item, query)) found.push({ entity, item });
      });
    });

    resultItems = found.slice(0, MAX_RESULTS);
    searchResults.classList.remove('hidden');

    if (resultItems.length === 0) {
      searchResults.innerHTML = `
        <div class="gx-panel flex items-center justify-center gap-2 p-5 text-xs italic text-zinc-500">
          ${icon('search', 'h-4 w-4')}<span>Aucun résultat pour « ${escapeHtml(raw)} ».</span>
        </div>`;
      return;
    }

    const rows = resultItems
      .map(
        ({ entity, item }, i) => `
        <button type="button" data-result="${i}" class="flex w-full items-center gap-3 rounded-lg border border-hairline bg-night px-3 py-2.5 text-left transition-colors duration-200 hover:border-carmine/50 hover:bg-carmine/10">
          <span class="h-12 w-9 shrink-0 overflow-hidden rounded border border-hairline bg-black">
            <img src="${escapeHtml((item.images && item.images[0]) || entity.placeholderImage)}" alt="" class="h-full w-full object-cover">
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[13px] font-medium text-zinc-100">${escapeHtml(item.name)}</span>
            <span class="mt-1 flex items-center gap-2">
              <span class="gx-chip !px-1.5 !py-0.5 !text-[9px]">${icon(entity.icon, 'h-3 w-3')}${escapeHtml(entity.label)}</span>
              ${starsHtml(item.rating || 0, 'h-3 w-3')}
            </span>
          </span>
          <span class="shrink-0 text-zinc-600">${icon('chevronRight', 'h-4 w-4')}</span>
        </button>`
      )
      .join('');

    searchResults.innerHTML = `<div class="gx-panel space-y-2 p-2">${rows}</div>`;

    searchResults.querySelectorAll('img').forEach((img) => watchImage(img));
    searchResults.querySelectorAll('[data-result]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const entry = resultItems[Number(btn.dataset.result)];
        if (entry) onOpenItem(entry.entity, entry.item);
      });
    });
  }

  /* --- 3. Derniers ajouts toutes catégories --- */
  function collectAll() {
    const all = [];
    entities.forEach((entity) => {
      const items = getItems(entity.key) || [];
      items.forEach((item, index) => all.push({ entity, item, index }));
    });
    return all;
  }

  function renderLatest() {
    latestItems = collectAll()
      .sort((a, b) => {
        const ta = Date.parse(a.item.created_at);
        const tb = Date.parse(b.item.created_at);
        const va = Number.isNaN(ta) ? -Infinity : ta;
        const vb = Number.isNaN(tb) ? -Infinity : tb;
        // Tri par date de création ; à défaut, les entrées les plus récemment
        // insérées (fin de tableau) remontent en premier.
        if (va !== vb) return vb - va;
        return b.index - a.index;
      })
      .slice(0, LATEST_COUNT);

    if (latestItems.length === 0) {
      latestEl.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-hairline bg-charcoal/50 py-12 text-center">
          <span class="text-zinc-700">${icon('layers', 'h-6 w-6')}</span>
          <p class="text-xs italic text-zinc-500">Aucune entrée pour le moment.</p>
        </div>`;
      return;
    }

    latestEl.innerHTML = latestItems
      .map(
        ({ entity, item }, i) => `
        <button type="button" data-latest="${i}" class="group relative overflow-hidden rounded-lg border border-hairline bg-charcoal text-left transition-all duration-300 hover:-translate-y-1 hover:border-carmine/50 hover:shadow-glow">
          <div class="relative aspect-[5/7] overflow-hidden bg-black">
            <img src="${escapeHtml((item.images && item.images[0]) || entity.placeholderImage)}" alt="${escapeHtml(item.name)}" loading="lazy" class="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.06] group-hover:opacity-100">
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent"></div>
            <span class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-black/80 px-1.5 py-1 text-[9px] uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              ${icon(entity.icon, 'h-3 w-3')}<span>${escapeHtml(entity.label)}</span>
            </span>
          </div>
          <div class="space-y-2 p-3">
            <h3 class="line-clamp-2 font-display text-[12px] leading-snug tracking-wide text-zinc-100 transition-colors duration-300 group-hover:text-amber-200">${escapeHtml(item.name)}</h3>
            <div class="flex items-center gap-2">
              ${starsHtml(item.rating || 0, 'h-3 w-3')}
              <span class="text-[10px] text-zinc-500">${item.rating || 0}/5</span>
            </div>
          </div>
        </button>`
      )
      .join('');

    latestEl.querySelectorAll('img').forEach((img) => watchImage(img));
    latestEl.querySelectorAll('[data-latest]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const entry = latestItems[Number(btn.dataset.latest)];
        if (entry) onOpenItem(entry.entity, entry.item);
      });
    });
  }

  /* --- 4. Entrée aléatoire --- */
  function openRandom() {
    const all = collectAll();
    if (all.length === 0) return;
    const pick = all[Math.floor(Math.random() * all.length)];
    onOpenItem(pick.entity, pick.item);
  }
  if (randomBtn) randomBtn.addEventListener('click', openRandom);

  /* --- Écouteurs de recherche --- */
  if (searchInput) {
    searchInput.addEventListener('input', renderSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && resultItems.length > 0) {
        e.preventDefault();
        onOpenItem(resultItems[0].entity, resultItems[0].item);
      }
    });
  }

  function refresh() {
    renderCounters();
    renderLatest();
    if (searchInput && searchInput.value.trim()) renderSearch();
  }

  refresh();
  return { refresh };
}
