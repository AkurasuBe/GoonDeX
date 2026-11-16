import { escapeHtml, formatTag, normalizeTags } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { watchImage } from '../utils/imageFallback.js';

const MAX_TAGS = 3;

/**
 * Carte « Collector » générique, partagée par les 4 catégories.
 * Remplace createArtistCard / createManhwaCard / createDoujinshiCard / createCosplayeuseCard.
 */
export function createCard(entity, item, index, onOpen) {
  const card = document.createElement('article');
  card.className = 'group relative cursor-pointer';
  card.addEventListener('click', () => onOpen(index));

  const tags = normalizeTags(item.tags);
  const visibleTags = tags.slice(0, MAX_TAGS);
  const extraTags = tags.length - visibleTags.length;

  const tagsHtml =
    visibleTags
      .map(
        (t) =>
          `<span class="rounded border border-hairline/80 bg-night px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-500">${escapeHtml(formatTag(t))}</span>`
      )
      .join('') + (extraTags > 0 ? `<span class="px-1 py-0.5 text-[9px] text-zinc-600">+${extraTags}</span>` : '');

  const cover = (item.images && item.images[0]) || entity.placeholderImage;
  const rating = item.rating || 0;
  const linkLabel = item.links && item.links.length > 0 ? escapeHtml(item.links[0].name) : 'Aucun lien';

  card.innerHTML = `
    <div class="relative rounded-lg border border-hairline bg-charcoal transition-all duration-300 group-hover:-translate-y-1 group-hover:border-carmine/50 group-hover:shadow-glow">
      <span class="gx-corner left-0 top-0 rounded-tl border-l border-t"></span>
      <span class="gx-corner right-0 top-0 rounded-tr border-r border-t"></span>
      <span class="gx-corner bottom-0 left-0 rounded-bl border-b border-l"></span>
      <span class="gx-corner bottom-0 right-0 rounded-br border-b border-r"></span>

      <div class="relative aspect-[5/7] overflow-hidden rounded-t-lg bg-black">
        <img
          src="${escapeHtml(cover)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy"
          class="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.06] group-hover:opacity-100"
        >
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent"></div>

        ${
          rating > 0
            ? `<div class="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md border border-amber-500/30 bg-black/75 px-1.5 py-1 backdrop-blur-sm">
                 <span class="text-amber-500">${icon('star', 'h-3 w-3', { fill: 'currentColor', strokeWidth: 1 })}</span>
                 <span class="text-[10px] font-semibold text-amber-400">${rating}</span>
               </div>`
            : ''
        }

        ${
          item.images && item.images.length > 1
            ? `<div class="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md border border-hairline bg-black/75 px-1.5 py-1 text-[10px] text-zinc-400 backdrop-blur-sm">
                 ${icon('images', 'h-3 w-3')}<span>${item.images.length}</span>
               </div>`
            : ''
        }

        <span class="absolute bottom-2 left-2.5 font-display text-[10px] tracking-[0.25em] text-zinc-500">#${String(index + 1).padStart(3, '0')}</span>
      </div>

      <div class="space-y-2.5 p-3.5">
        <h3 class="line-clamp-2 font-display text-[13px] leading-snug tracking-wide text-zinc-100 transition-colors duration-300 group-hover:text-amber-200">${escapeHtml(item.name)}</h3>
        <div class="flex flex-wrap items-center gap-1">${tagsHtml}</div>
        <div class="flex items-center gap-1.5 border-t border-hairline pt-2.5 text-[10px] uppercase tracking-wider text-zinc-500">
          <span class="shrink-0 text-zinc-600">${icon(entity.linkIcon, 'h-3 w-3')}</span>
          <span class="truncate">${linkLabel}</span>
        </div>
      </div>
    </div>
  `;

  watchImage(card.querySelector('img'));

  return card;
}
