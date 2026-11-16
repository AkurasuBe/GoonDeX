import { icon } from './icons.js';

/** Étoiles dorées (lecture seule) partagées par les cartes et les fiches. */
export function starsHtml(rating, size = 'h-3.5 w-3.5') {
  const r = Math.round(rating || 0);
  let html = '<div class="flex items-center gap-0.5">';
  for (let i = 1; i <= 5; i++) {
    html += i <= r
      ? `<span class="text-amber-500">${icon('star', size, { fill: 'currentColor', strokeWidth: 1 })}</span>`
      : `<span class="text-zinc-800">${icon('star', size, { strokeWidth: 1.4 })}</span>`;
  }
  html += '</div>';
  return html;
}

/**
 * Sélecteur d'étoiles interactif pour les formulaires (ajout & modification).
 * Remplace setFormRating / setEditFormRating des 4 catégories.
 */
export class StarPicker {
  constructor(container, hiddenInput) {
    this.hiddenInput = hiddenInput;
    this.buttons = [];
    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.value = String(i);
      btn.className =
        'text-zinc-800 transition-all duration-200 hover:scale-110 focus:outline-none';
      btn.innerHTML = icon('star', 'h-6 w-6');
      btn.addEventListener('click', () => this.set(i));
      container.appendChild(btn);
      this.buttons.push(btn);
    }

    this.set(parseInt(hiddenInput.value, 10) || 5);
  }

  set(rating) {
    const r = rating || 0;
    if (this.hiddenInput) this.hiddenInput.value = String(r);
    this.buttons.forEach((btn, idx) => {
      const filled = idx < r;
      btn.classList.toggle('text-amber-500', filled);
      btn.classList.toggle('text-zinc-800', !filled);
      btn.innerHTML = icon('star', 'h-6 w-6', filled ? { fill: 'currentColor', strokeWidth: 1 } : {});
    });
  }
}
