/** Échappe une chaîne pour une insertion sûre dans du HTML. */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normalise la colonne `tags` renvoyée par Supabase en un vrai tableau de
 * chaînes propres. Gère les tableaux (jsonb), les chaînes JSON (`'["A","B"]'`)
 * et les listes séparées par des virgules, afin que le rendu puisse toujours
 * boucler sans risque.
 */
export function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return normalizeTags(parsed);
      } catch {
        /* JSON invalide : on retombe sur le découpage par virgules. */
      }
    }
    return raw.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

/** Formate un tag pour l'affichage : underscores → espaces, espaces compactés. */
export function formatTag(tag) {
  return String(tag ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}
