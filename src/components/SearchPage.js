import { createCard } from './Card.js';
import { createTagFilter } from './TagFilter.js';
import { icon } from '../utils/icons.js';

/**
 * Page de recherche générique : recherche texte + filtre par tags + grille de cartes.
 * Remplace filterArtists / filterManhwas / filterDoujinshis / filterCosplayeuses
 * et initXSearchPage.
 */
export function createSearchPage({ entity, getItems, getAllTags, onOpenDetail, onAdd }) {
  const section = document.createElement('section');
  section.id = `page-${entity.key}-search`;
  section.className = 'page hidden space-y-6';

  section.innerHTML = `
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="gx-eyebrow">${entity.label} · Collection</p>
        <h2 class="mt-2 font-display text-xl tracking-[0.14em] text-zinc-50 sm:text-2xl">${entity.search.title}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span id="${entity.key}-counter-badge" class="gx-chip">—</span>
        <button type="button" data-add class="gx-btn gx-btn-primary">
          ${icon('plus', 'h-3.5 w-3.5')}<span>${entity.addCta}</span>
        </button>
      </div>
    </header>

    <div class="gx-panel space-y-4 p-4 sm:p-5">
      <div class="relative">
        ${icon('search', 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600')}
        <input type="text" id="${entity.key}-search-input" autocomplete="off" class="gx-input pl-10" placeholder="${entity.search.placeholder}">
      </div>
      <div>
        <p class="gx-eyebrow mb-3">${entity.search.filterLabel}</p>
        <div id="${entity.key}-tags-filter-container" class="flex flex-wrap gap-2"></div>
      </div>
    </div>

    <div id="${entity.key}-search-results-container" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"></div>
  `;

  const input = section.querySelector(`#${entity.key}-search-input`);
  const results = section.querySelector(`#${entity.key}-search-results-container`);
  const badge = section.querySelector(`#${entity.key}-counter-badge`);

  let tagFilter = null;
  let loading = true;

  section.querySelector('[data-add]').addEventListener('click', () => onAdd && onAdd());

  const filter = createTagFilter({
    container: section.querySelector(`#${entity.key}-tags-filter-container`),
    onSelect: (tag) => {
      tagFilter = tag;
      render();
      renderTags();
    },
  });

  function renderTags() {
    filter.render(getAllTags(), tagFilter);
  }

  /** Squelettes affichés pendant les requêtes Supabase. */
  function renderSkeleton() {
    badge.textContent = 'Chargement…';
    results.innerHTML = Array.from({ length: 10 })
      .map(
        () => `
      <div class="overflow-hidden rounded-lg border border-hairline bg-charcoal">
        <div class="gx-skeleton aspect-[5/7] rounded-none"></div>
        <div class="space-y-2.5 p-3.5">
          <div class="gx-skeleton h-3 w-3/4"></div>
          <div class="gx-skeleton h-2.5 w-1/3"></div>
          <div class="gx-skeleton h-2.5 w-full"></div>
        </div>
      </div>`
      )
      .join('');
  }

  function render() {
    if (loading) {
      renderSkeleton();
      return;
    }

    const query = (input.value || '').toLowerCase();
    const items = getItems();

    const filtered = items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      const matchesTag = tagFilter === null || (item.tags && item.tags.includes(tagFilter));
      return matchesQuery && matchesTag;
    });

    badge.textContent = `${filtered.length} ${entity.search.counterLabel}${filtered.length > 1 ? 's' : ''}`;

    results.innerHTML = '';
    if (filtered.length === 0) {
      results.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-hairline bg-charcoal/50 py-16 text-center">
          <span class="text-zinc-700">${icon('layers', 'h-7 w-7')}</span>
          <p class="text-xs italic text-zinc-500">${entity.search.emptyText}</p>
        </div>`;
      return;
    }

    filtered.forEach((item) => {
      results.appendChild(createCard(entity, item, items.indexOf(item), onOpenDetail));
    });
  }

  input.addEventListener('input', render);

  return {
    section,
    setLoading(value) {
      loading = value;
      render();
      // Les tags ne sont connus qu'après la réponse Supabase : on reconstruit
      // la barre de filtres dès que le chargement se termine.
      if (!value) renderTags();
    },
    refresh() {
      render();
      renderTags();
    },
  };
}
