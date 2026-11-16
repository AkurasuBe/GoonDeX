/**
 * Lightbox globale (une seule instance pour les 4 catégories).
 * Supporte la navigation dans la galerie (boutons + flèches clavier + Échap).
 */
import { watchImage, resetImageFallback } from '../utils/imageFallback.js';

let modal;
let img;
let counter;
let prevBtn;
let nextBtn;
let urls = [];
let current = 0;

function isOpen() {
  return !!modal && !modal.classList.contains('opacity-0');
}

function update() {
  resetImageFallback(img);
  img.src = urls[current] || '';
  const multi = urls.length > 1;
  counter.textContent = multi ? `${current + 1} / ${urls.length}` : '';
  counter.classList.toggle('hidden', !multi);
  prevBtn.classList.toggle('hidden', !multi);
  nextBtn.classList.toggle('hidden', !multi);
}

function step(direction) {
  if (urls.length < 2) return;
  current = (current + direction + urls.length) % urls.length;
  update();
}

export function initLightbox() {
  modal = document.getElementById('lightbox-modal');
  img = document.getElementById('lightbox-img');
  watchImage(img);
  counter = document.getElementById('lightbox-counter');
  prevBtn = document.getElementById('lightbox-prev');
  nextBtn = document.getElementById('lightbox-next');
  const inner = document.getElementById('lightbox-inner');
  const closeBtn = document.getElementById('lightbox-close');

  modal.addEventListener('click', closeLightbox);
  inner.addEventListener('click', (e) => e.stopPropagation());
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
}

/**
 * @param {string|string[]} source URL unique ou galerie complète
 * @param {number} [start] index de départ dans la galerie
 */
export function openLightbox(source, start = 0) {
  if (!modal) return;
  urls = (Array.isArray(source) ? source : [source]).filter(Boolean);
  if (!urls.length) return;

  current = Math.min(Math.max(start, 0), urls.length - 1);
  update();

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  img.classList.remove('scale-95');
  img.classList.add('scale-100');
}

export function closeLightbox() {
  if (!modal) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  img.classList.remove('scale-100');
  img.classList.add('scale-95');

  setTimeout(() => {
    if (isOpen()) return;
    img.removeAttribute('src');
  }, 300);
}
