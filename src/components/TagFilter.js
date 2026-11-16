import { escapeHtml, formatTag } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

/**
 * Barre de filtres par tags générique.
 * Remplace renderTagsFilter / renderManhwaTagsFilter / renderDoujinshiTagsFilter / renderCosplayeuseTagsFilter.
 */
export function createTagFilter({ container, onSelect }) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tag]');
    if (!btn) return;
    const tag = btn.dataset.tag;
    onSelect(tag === '__all__' ? null : tag);
  });

  return {
    render(allTags, selected) {
      let html = `<button type="button" data-tag="__all__" class="gx-chip-toggle ${
        selected === null ? 'is-active' : ''
      }">${icon('filter', 'h-3 w-3')}<span>Tous</span></button>`;

      allTags.forEach((tag) => {
        html += `<button type="button" data-tag="${escapeHtml(tag)}" class="gx-chip-toggle ${
          selected === tag ? 'is-active' : ''
        }">${escapeHtml(formatTag(tag))}</button>`;
      });

      container.innerHTML = html;
    },
  };
}
