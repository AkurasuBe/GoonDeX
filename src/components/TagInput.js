import { escapeHtml } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

/**
 * Champ de tags avec autocomplétion + création libre + chips supprimables.
 * Remplace setupTagAutocomplete / showTagDropdown / renderSelectedTags / addTagValue / removeTagByIndex
 * et les 8 handlers handleXTagInput.
 */
export function createTagInput({ input, dropdown, container, getTags, getAllTags }) {
  function renderSelected() {
    const tags = getTags();
    container.innerHTML =
      tags
        .map(
          (t, idx) => `
        <span class="inline-flex items-center gap-1.5 rounded-md border border-carmine/40 bg-carmine/15 px-2 py-1 text-[11px] text-amber-100">
          ${escapeHtml(t)}
          <button type="button" data-idx="${idx}" class="remove-tag text-amber-400/70 transition hover:text-white" aria-label="Retirer le tag">${icon('x', 'h-3 w-3')}</button>
        </span>`
        )
        .join('') || '<span class="p-1 text-[11px] italic text-zinc-600">Aucun tag sélectionné</span>';
  }

  function addTag(tag) {
    const arr = getTags();
    if (tag && !arr.includes(tag)) arr.push(tag);
    input.value = '';
    dropdown.classList.add('hidden');
    renderSelected();
  }

  function show(query) {
    const arr = getTags();
    const allTags = getAllTags();
    const q = (query || '').toLowerCase();
    const filtered = allTags.filter((t) => t.toLowerCase().includes(q) && !arr.includes(t));

    let html = '';
    const trimmed = (query || '').trim();
    if (trimmed && !allTags.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase()) && !arr.includes(trimmed)) {
      html += `<button type="button" data-tag="${escapeHtml(trimmed)}" class="tag-option flex w-full items-center gap-2 border-b border-hairline px-3 py-2.5 text-left text-[11px] font-semibold text-amber-400 transition hover:bg-carmine/25 hover:text-white">${icon('plus', 'h-3 w-3')} Créer le tag « ${escapeHtml(trimmed)} »</button>`;
    }

    if (filtered.length === 0 && !html) {
      html += '<p class="px-3 py-2.5 text-[11px] italic text-zinc-600">Aucun tag trouvé. Appuyez sur Entrée pour créer.</p>';
    } else {
      filtered.forEach((tag) => {
        html += `<button type="button" data-tag="${escapeHtml(tag)}" class="tag-option block w-full px-3 py-2.5 text-left text-[11px] text-zinc-300 transition hover:bg-carmine/25 hover:text-white">${escapeHtml(tag)}</button>`;
      });
    }

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
  }

  input.addEventListener('focus', () => show(input.value));
  input.addEventListener('input', () => show(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      if (val && !getTags().includes(val)) addTag(val);
    }
  });

  dropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.tag-option');
    if (option) addTag(option.dataset.tag);
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-tag');
    if (!btn) return;
    getTags().splice(parseInt(btn.dataset.idx, 10), 1);
    renderSelected();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  return { renderSelected, addTag };
}
