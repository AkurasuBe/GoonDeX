import { createClient } from '@supabase/supabase-js';

/**
 * Configuration Supabase isolée.
 * Les valeurs proviennent des variables d'environnement Vite (.env).
 * Un fallback en dur conserve les clés de test locales si l'env n'est pas défini.
 */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://qmxygwyxkakxkxeyflqx.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_S0zW_2DKvCxnhpN5-LRzvQ_0Lxhm-RB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Service CRUD générique : une seule implémentation pour les 4 catégories.
 */
export const entityService = {
  async list(table) {
    return supabase.from(table).select('*');
  },

  async create(table, item) {
    return supabase.from(table).insert([item]);
  },

  async update(table, originalName, data) {
    return supabase.from(table).update(data).eq('name', originalName);
  },

  async remove(table, name) {
    return supabase.from(table).delete().eq('name', name);
  },
};
