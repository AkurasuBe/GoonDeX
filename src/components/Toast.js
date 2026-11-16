import { icon } from '../utils/icons.js';
import { escapeHtml } from '../utils/dom.js';

/** Notifications discrètes en bas à droite, en remplacement des `alert()`. */
const VARIANTS = {
  success: { icon: 'check', border: 'border-emerald-500/40', accent: 'text-emerald-400' },
  error: { icon: 'alert', border: 'border-ruby/50', accent: 'text-rose-400' },
  info: { icon: 'info', border: 'border-hairline', accent: 'text-amber-400' },
};

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.id = 'toast-container';
  container.className =
    'pointer-events-none fixed bottom-24 right-4 z-[80] flex w-[min(92vw,340px)] flex-col gap-2 lg:bottom-6 lg:right-6';
  document.body.appendChild(container);
  return container;
}

export function toast(message, type = 'info') {
  const cfg = VARIANTS[type] || VARIANTS.info;
  const el = document.createElement('div');
  el.className = `pointer-events-auto flex translate-y-2 items-start gap-3 rounded-lg border ${cfg.border} bg-charcoal/95 px-4 py-3 opacity-0 shadow-grimoire backdrop-blur-xl transition-all duration-300`;
  el.innerHTML = `
    <span class="${cfg.accent} mt-0.5 shrink-0">${icon(cfg.icon, 'h-4 w-4')}</span>
    <p class="text-xs leading-relaxed text-zinc-300">${escapeHtml(message)}</p>
  `;

  ensureContainer().appendChild(el);

  requestAnimationFrame(() => {
    el.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    el.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => el.remove(), 300);
  }, 4200);
}

toast.success = (message) => toast(message, 'success');
toast.error = (message) => toast(message, 'error');
toast.info = (message) => toast(message, 'info');
