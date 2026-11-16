import { escapeHtml } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { StarPicker } from '../utils/stars.js';
import { createTagInput } from './TagInput.js';

const ROW_BTN = 'remove-row gx-btn gx-btn-danger shrink-0 !px-3';

/**
 * Formulaire générique (ajout & modification) pour les 4 catégories.
 * Remplace initXAddPage / addXImageInput / addXLinkInput / setXFormRating /
 * addEditXImageInput / addEditXLinkInput / setEditXFormRating et les 8 blocs onsubmit.
 */
export function createEntityForm({ entity, mode, getAllTags, onSubmit, onCancel }) {
  const isEdit = mode === 'edit';
  const labels = entity.add;

  const section = document.createElement('section');
  section.id = `page-${entity.key}-${mode}`;
  section.className = 'page hidden space-y-6';

  section.innerHTML = `
    <header class="mx-auto flex w-full max-w-3xl flex-wrap items-end justify-between gap-4">
      <div>
        <p class="gx-eyebrow">${entity.label} · ${isEdit ? 'Édition' : 'Nouvelle entrée'}</p>
        <h2 class="mt-2 font-display text-xl tracking-[0.14em] text-zinc-50 sm:text-2xl">${
          isEdit ? entity.edit.heading : entity.add.heading
        }</h2>
      </div>
      ${
        isEdit
          ? `<button type="button" data-cancel class="gx-btn gx-btn-ghost">${icon('x', 'h-3.5 w-3.5')}<span>Annuler</span></button>`
          : ''
      }
    </header>

    <form data-form class="gx-panel mx-auto w-full max-w-3xl space-y-6 p-5 sm:p-8">
      <div class="space-y-4">
        <p class="gx-eyebrow">Identité</p>
        <div>
          <label class="gx-label">${labels.nameLabel}</label>
          <input type="text" data-name required class="gx-input">
        </div>
        <div>
          <label class="gx-label">${labels.imageLabel}</label>
          <input type="url" data-primary required class="gx-input" placeholder="https://...">
        </div>
        <div>
          <label class="gx-label">${labels.extraImagesLabel}</label>
          <div data-images class="mb-2 space-y-2"></div>
          <button type="button" data-add-image class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 transition hover:text-amber-300">
            ${icon('plus', 'h-3 w-3')} Ajouter une autre image
          </button>
        </div>
      </div>

      <div class="gx-rule"></div>

      <div class="space-y-4">
        <p class="gx-eyebrow">Évaluation</p>
        <div>
          <label class="gx-label">${isEdit ? 'Note' : 'Note initiale'}</label>
          <div data-stars class="flex cursor-pointer items-center gap-1.5 py-1"></div>
          <input type="hidden" data-rating value="5">
        </div>
      </div>

      <div class="gx-rule"></div>

      <div class="space-y-4">
        <p class="gx-eyebrow">Contenu</p>
        <div>
          <label class="gx-label">${labels.descLabel}</label>
          <textarea data-description rows="4" required class="gx-input"></textarea>
        </div>
        <div class="relative">
          <label class="gx-label">${entity.tagLabel}</label>
          <div data-selected-tags class="mb-2 flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-hairline bg-night p-2"></div>
          <input type="text" data-tag-input class="gx-input" placeholder="${entity.tagPlaceholder}" autocomplete="off">
          <div data-tag-dropdown class="absolute left-0 right-0 z-50 mt-1 hidden max-h-40 overflow-y-auto rounded-lg border border-hairline bg-charcoal shadow-grimoire"></div>
        </div>
      </div>

      <div class="gx-rule"></div>

      <div class="space-y-4">
        <p class="gx-eyebrow">Références</p>
        <div>
          <label class="gx-label">${labels.linksLabel}</label>
          <div data-links class="mb-2 space-y-2"></div>
          <button type="button" data-add-link class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 transition hover:text-amber-300">
            ${icon('plus', 'h-3 w-3')} Ajouter un autre lien
          </button>
        </div>
      </div>

      <button type="submit" class="gx-btn gx-btn-primary w-full">${
        isEdit ? entity.edit.submitLabel : entity.add.submitLabel
      }</button>
    </form>
  `;

  const form = section.querySelector('[data-form]');
  const imagesContainer = section.querySelector('[data-images]');
  const linksContainer = section.querySelector('[data-links]');
  const starPicker = new StarPicker(section.querySelector('[data-stars]'), section.querySelector('[data-rating]'));

  let tags = [];
  const tagInput = createTagInput({
    input: section.querySelector('[data-tag-input]'),
    dropdown: section.querySelector('[data-tag-dropdown]'),
    container: section.querySelector('[data-selected-tags]'),
    getTags: () => tags,
    getAllTags,
  });

  function addImageInput(value = '') {
    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `
      <input type="url" value="${escapeHtml(value)}" data-extra-image class="gx-input" placeholder="https://...">
      <button type="button" class="${ROW_BTN}" aria-label="Retirer cette image">${icon('x', 'h-3.5 w-3.5')}</button>
    `;
    div.querySelector('.remove-row').addEventListener('click', () => div.remove());
    imagesContainer.appendChild(div);
  }

  function addLinkInput(name = '', url = '') {
    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `
      <input type="text" value="${escapeHtml(name)}" data-link-name class="gx-input w-1/3" placeholder="Nom du site">
      <input type="url" value="${escapeHtml(url)}" data-link-url class="gx-input w-2/3" placeholder="https://...">
      <button type="button" class="${ROW_BTN}" aria-label="Retirer ce lien">${icon('x', 'h-3.5 w-3.5')}</button>
    `;
    div.querySelector('.remove-row').addEventListener('click', () => div.remove());
    linksContainer.appendChild(div);
  }

  section.querySelector('[data-add-image]').addEventListener('click', () => addImageInput());
  section.querySelector('[data-add-link]').addEventListener('click', () => addLinkInput());

  const cancelBtn = section.querySelector('[data-cancel]');
  if (cancelBtn) cancelBtn.addEventListener('click', () => onCancel && onCancel());

  function reset() {
    form.reset();
    imagesContainer.innerHTML = '';
    linksContainer.innerHTML = '';
    addLinkInput();
    tags = [];
    tagInput.renderSelected();
    starPicker.set(5);
  }

  function fill(item) {
    section.querySelector('[data-name]').value = item.name || '';
    section.querySelector('[data-primary]').value = (item.images && item.images[0]) || '';
    section.querySelector('[data-description]').value = item.description || '';
    starPicker.set(item.rating || 5);

    tags = [...(item.tags || [])];
    tagInput.renderSelected();

    imagesContainer.innerHTML = '';
    if (item.images && item.images.length > 1) {
      item.images.slice(1).forEach((img) => addImageInput(img));
    }

    linksContainer.innerHTML = '';
    if (item.links && item.links.length > 0) {
      item.links.forEach((l) => addLinkInput(l.name, l.url));
    } else {
      addLinkInput();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = section.querySelector('[data-name]').value.trim();
    const primaryImg = section.querySelector('[data-primary]').value.trim();
    const description = section.querySelector('[data-description]').value.trim();
    const rating = parseInt(section.querySelector('[data-rating]').value, 10) || 5;

    const extraImgs = Array.from(section.querySelectorAll('[data-extra-image]'))
      .map((i) => i.value.trim())
      .filter(Boolean);
    const images = [primaryImg, ...extraImgs];

    const linkNames = Array.from(section.querySelectorAll('[data-link-name]'));
    const linkUrls = Array.from(section.querySelectorAll('[data-link-url]'));
    const links = [];
    linkNames.forEach((nameInput, i) => {
      const urlInput = linkUrls[i];
      if (nameInput.value.trim() && urlInput && urlInput.value.trim()) {
        links.push({ name: nameInput.value.trim(), url: urlInput.value.trim() });
      }
    });

    onSubmit({ name, images, description, rating, tags: [...tags], links });
  });

  if (!isEdit) reset();

  return { section, reset, fill };
}
