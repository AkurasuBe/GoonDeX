import { escapeHtml, formatTag, normalizeTags } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { starsHtml } from '../utils/stars.js';
import { watchImage } from '../utils/imageFallback.js';
import { switchPage } from '../utils/router.js';
import { openLightbox } from './Lightbox.js';

/**
 * Fiche détaillée générique : hero flouté + galerie + lightbox + actions.
 * Remplace showXDetail / renderXDetailContent / changeXDetailImage.
 */
export function createDetailPage({ entity, getItems, onEdit, onDelete }) {
  const section = document.createElement('section');
  section.id = `page-${entity.key}-detail`;
  section.className = 'page hidden space-y-6';
  section.innerHTML = `
    <button data-back class="gx-btn gx-btn-ghost">
      ${icon('arrowLeft', 'h-3.5 w-3.5')}<span>Retour à la collection</span>
    </button>
    <div id="${entity.key}-detail-content"></div>
  `;

  const content = section.querySelector(`#${entity.key}-detail-content`);
  let currentIndex = null;
  let imageIndex = 0;

  section.querySelector('[data-back]').addEventListener('click', () => switchPage(`${entity.key}-search`));

  function changeImage(direction) {
    const item = getItems()[currentIndex];
    const images = item && item.images ? item.images : [];
    if (!images.length) return;
    imageIndex = (imageIndex + direction + images.length) % images.length;
    render();
  }

  function render() {
    const item = getItems()[currentIndex];
    if (!item) return;

    const images = item.images && item.images.length > 0 ? item.images : [entity.placeholderImage];
    const currentImg = images[imageIndex] || images[0];
    const total = images.length;

    const tagsHtml = normalizeTags(item.tags)
      .map(
        (t) =>
          `<span class="rounded-md border border-hairline bg-graphite px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">${escapeHtml(formatTag(t))}</span>`
      )
      .join(' ');

    const linksHtml = (item.links || [])
      .map(
        (l) => `
        <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener" class="flex items-center gap-2.5 rounded-lg border border-hairline bg-graphite px-3 py-2.5 text-xs text-zinc-300 transition-all duration-200 hover:border-carmine/50 hover:bg-carmine/10 hover:text-amber-200">
          <span class="shrink-0 text-amber-500/80">${icon(entity.linkIcon, 'h-3.5 w-3.5')}</span>
          <span class="truncate">${escapeHtml(l.name)}</span>
          <span class="ml-auto shrink-0 text-zinc-600">${icon('externalLink', 'h-3.5 w-3.5')}</span>
        </a>`
      )
      .join('');

    const thumbHtml =
      total > 1
        ? `<div class="flex gap-2 overflow-x-auto pb-1">
            ${images
              .map(
                (img, idx) => `
              <button type="button" data-thumb="${idx}" class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 ${
                idx === imageIndex
                  ? 'border-carmine opacity-100'
                  : 'border-hairline opacity-50 hover:opacity-100'
              }">
                <img src="${escapeHtml(img)}" alt="" class="h-full w-full object-cover">
              </button>`
              )
              .join('')}
          </div>`
        : '';

    content.innerHTML = `
      <div class="mb-6">
        <div class="relative overflow-hidden rounded-2xl border border-hairline">
          <img src="${escapeHtml(images[0])}" alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-2xl">
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/85 to-night/40"></div>
          <div class="pointer-events-none absolute inset-0 bg-carmine/5"></div>

          <div class="relative px-6 py-10 sm:px-10 sm:py-14">
            <p class="gx-eyebrow">${entity.label} · #${String(currentIndex + 1).padStart(3, '0')}</p>
            <h1 class="mt-3 max-w-3xl font-display text-2xl leading-tight tracking-wide text-zinc-50 sm:text-4xl">${escapeHtml(item.name)}</h1>

            <div class="mt-5 flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                ${starsHtml(item.rating, 'h-4 w-4')}
                <span class="text-[10px] uppercase tracking-[0.25em] text-zinc-500">${(item.rating || 0)} / 5</span>
              </div>
              <span class="h-4 w-px bg-hairline"></span>
              <span class="gx-chip">${icon('images', 'h-3 w-3')} ${total} visuel${total > 1 ? 's' : ''}</span>
            </div>

            ${tagsHtml ? `<div class="mt-5 flex flex-wrap gap-1.5">${tagsHtml}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-4">
          <div class="group relative overflow-hidden rounded-2xl border border-hairline bg-black">
            <img data-zoom src="${escapeHtml(currentImg)}" alt="${escapeHtml(item.name)}" class="mx-auto max-h-[68vh] w-full cursor-zoom-in object-contain transition-transform duration-500 group-hover:scale-[1.01]">

            ${
              total > 1
                ? `<button type="button" data-prev class="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-black/70 p-2 text-zinc-300 backdrop-blur-sm transition hover:border-carmine/60 hover:text-white">${icon('chevronLeft', 'h-4 w-4')}</button>
                   <button type="button" data-next class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-black/70 p-2 text-zinc-300 backdrop-blur-sm transition hover:border-carmine/60 hover:text-white">${icon('chevronRight', 'h-4 w-4')}</button>
                   <div class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-hairline bg-black/70 px-3 py-1 font-display text-[10px] tracking-[0.25em] text-zinc-400 backdrop-blur-sm">${imageIndex + 1} / ${total}</div>`
                : ''
            }

            <div class="pointer-events-none absolute right-3 top-3 rounded-md border border-hairline bg-black/70 p-2 text-zinc-500 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              ${icon('zoomIn', 'h-4 w-4')}
            </div>
          </div>

          ${thumbHtml}
        </div>

        <aside class="space-y-4">
          <div class="gx-panel p-5">
            <p class="gx-eyebrow mb-3">Synopsis</p>
            <p class="whitespace-pre-line text-[13px] leading-relaxed text-zinc-300">${escapeHtml(item.description) || '<span class="italic text-zinc-600">Aucune description.</span>'}</p>
          </div>

          <div class="gx-panel p-5">
            <p class="gx-eyebrow mb-3">${entity.linksHeading}</p>
            <div class="max-h-56 space-y-2 overflow-y-auto">${linksHtml || '<p class="text-xs italic text-zinc-600">Aucun lien disponible</p>'}</div>
          </div>

          <div class="flex gap-2">
            <button type="button" data-edit class="gx-btn gx-btn-ghost flex-1">${icon('pencil', 'h-3.5 w-3.5')}<span>Modifier</span></button>
            <button type="button" data-delete class="gx-btn gx-btn-danger flex-1">${icon('trash', 'h-3.5 w-3.5')}<span>Supprimer</span></button>
          </div>
        </aside>
      </div>
    `;

    content.querySelectorAll('img').forEach((img) => watchImage(img));
    content.querySelector('[data-zoom]').addEventListener('click', () => openLightbox(images, imageIndex));
    const prev = content.querySelector('[data-prev]');
    const next = content.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', () => changeImage(-1));
    if (next) next.addEventListener('click', () => changeImage(1));
    content.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        imageIndex = parseInt(thumb.dataset.thumb, 10);
        render();
      });
    });
    content.querySelector('[data-edit]').addEventListener('click', () => onEdit(item));
    content.querySelector('[data-delete]').addEventListener('click', () => onDelete(item));
  }

  return {
    section,
    open(index) {
      currentIndex = index;
      imageIndex = 0;
      render();
      switchPage(`${entity.key}-detail`);
    },
  };
}
