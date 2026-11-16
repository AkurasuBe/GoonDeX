import './style.css';
import { ENTITIES, DELETE_PASSWORD } from './config/entities.js';
import { entityService } from './services/supabaseClient.js';
import { registerPage, switchPage } from './utils/router.js';
import { hydrateIcons } from './utils/icons.js';
import { normalizeTags } from './utils/dom.js';
import { initImageFallback } from './utils/imageFallback.js';
import { toast } from './components/Toast.js';
import { initLightbox } from './components/Lightbox.js';
import { createSearchPage } from './components/SearchPage.js';
import { createDetailPage } from './components/DetailPage.js';
import { createEntityForm } from './components/EntityForm.js';
import { createHomeDashboard } from './components/HomeDashboard.js';

/** État applicatif : une entrée par catégorie. */
const store = {};
const editTargets = {};
const searchPages = {};
const detailPages = {};
let dashboard = null;

function ensureDarkTheme() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('goondex_theme', 'dark');
}

/* --- NAVIGATION --- */
/**
 * Délégation d'événements au niveau du document : les clics fonctionnent pour
 * les boutons présents dans le HTML statique ET pour ceux créés dynamiquement
 * (cartes de l'accueil, etc.), sans dépendre de l'ordre d'initialisation.
 */
function wireNavigation() {
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    if (target.closest('[data-theme-toggle]')) {
      ensureDarkTheme();
      return;
    }

    const pageBtn = target.closest('[data-page]');
    if (pageBtn) switchPage(pageBtn.dataset.page);
  });
}

/** Ouvre la fiche détail d'une entrée précise (depuis la recherche, les derniers
 *  ajouts ou le tirage aléatoire de l'accueil). */
function openEntityItem(entity, item) {
  const page = detailPages[entity.key];
  const index = (store[entity.key] || []).indexOf(item);
  if (!page || index === -1) return;
  page.open(index);
}

/* --- DONNÉES --- */
async function loadEntity(entity) {
  const page = searchPages[entity.key];
  if (page) page.setLoading(true);

  const { data, error } = await entityService.list(entity.table);

  if (error) {
    toast.error(`Chargement impossible · ${entity.label} : ${error.message}`);
    if (page) page.setLoading(false);
    return;
  }

  store[entity.key] = (data || []).map((item) => ({
    ...item,
    tags: normalizeTags(item.tags),
  }));
  if (page) page.setLoading(false);
  if (dashboard) dashboard.refresh();
}

async function submitNew(entity, data) {
  const { error } = await entityService.create(entity.table, data);
  if (error) {
    toast.error(`Ajout impossible : ${error.message}`);
    return;
  }
  toast.success(`${data.name} a rejoint la collection ${entity.label}.`);
  await loadEntity(entity);
  switchPage(`${entity.key}-search`);
}

async function submitEdit(entity, data) {
  const { error } = await entityService.update(entity.table, editTargets[entity.key], data);
  if (error) {
    toast.error(`Modification impossible : ${error.message}`);
    return;
  }
  toast.success('Modifications enregistrées.');
  await loadEntity(entity);
  switchPage(`${entity.key}-search`);
}

async function deleteItem(entity, item) {
  const pwd = prompt(entity.deletePrompt);
  if (pwd !== DELETE_PASSWORD) {
    if (pwd !== null) toast.error('Mot de passe incorrect.');
    return;
  }

  const { error } = await entityService.remove(entity.table, item.name);
  if (error) {
    toast.error(`Suppression impossible : ${error.message}`);
    return;
  }
  toast.success(`${item.name} a été retiré du répertoire.`);
  await loadEntity(entity);
  switchPage(`${entity.key}-search`);
}

/* --- CONSTRUCTION DES PAGES D'UNE CATÉGORIE --- */
function buildEntity(entity) {
  store[entity.key] = [];

  const getAllTags = () => [...new Set(store[entity.key].flatMap((i) => i.tags || []))].sort();

  const addForm = createEntityForm({
    entity,
    mode: 'add',
    getAllTags,
    onSubmit: (data) => submitNew(entity, data),
  });

  const editForm = createEntityForm({
    entity,
    mode: 'edit',
    getAllTags,
    onCancel: () => switchPage(`${entity.key}-detail`),
    onSubmit: (data) => submitEdit(entity, data),
  });

  const searchPage = createSearchPage({
    entity,
    getItems: () => store[entity.key],
    getAllTags,
    onOpenDetail: (index) => detailPage.open(index),
    onAdd: () => switchPage(`${entity.key}-add`),
  });
  searchPages[entity.key] = searchPage;

  const detailPage = createDetailPage({
    entity,
    getItems: () => store[entity.key],
    onEdit: (item) => {
      editTargets[entity.key] = item.name;
      editForm.fill(item);
      switchPage(`${entity.key}-edit`);
    },
    onDelete: (item) => deleteItem(entity, item),
  });
  detailPages[entity.key] = detailPage;

  document
    .getElementById('app-main')
    .append(searchPage.section, detailPage.section, addForm.section, editForm.section);

  registerPage(`${entity.key}-search`, () => loadEntity(entity));
  registerPage(`${entity.key}-add`, () => addForm.reset());
}

function init() {
  ensureDarkTheme();
  initImageFallback();
  hydrateIcons();
  initLightbox();
  dashboard = createHomeDashboard({
    entities: ENTITIES,
    getItems: (key) => store[key] || [],
    onOpenItem: openEntityItem,
  });
  wireNavigation();
  ENTITIES.forEach(buildEntity);
  ENTITIES.forEach(loadEntity);
  switchPage('home');
}

init();
