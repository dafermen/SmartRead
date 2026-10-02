const documentationSections = [
  {
    title: 'Product',
    items: [
      { id: 'introduction', title: 'Introduction', file: '../README.md' },
      { id: 'product-plan', title: 'Product plan', file: 'PLAN_COMPARISON.md' },
      { id: 'troubleshooting', title: 'Troubleshooting', file: 'TROUBLESHOOTING.md' },
      { id: 'privacy', title: 'Privacy', file: 'PRIVACY.md' },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { id: 'architecture', title: 'Architecture overview', file: 'ARCHITECTURE.md' },
      { id: 'message-contracts', title: 'Internal message contracts', file: 'API.md' },
      { id: 'architecture-decisions', title: 'Architecture decisions', file: 'adr/0001-manifest-v3-native-speech.md' },
    ],
  },
  {
    title: 'Engineering',
    items: [
      { id: 'development', title: 'Local development', file: 'DEVELOPMENT.md' },
      { id: 'testing', title: 'Testing strategy', file: 'TESTING.md' },
      { id: 'security', title: 'Security', file: 'SECURITY.md' },
    ],
  },
  {
    title: 'Delivery',
    items: [
      { id: 'deployment', title: 'Deployment', file: 'DEPLOYMENT.md' },
      { id: 'store-submission', title: 'Chrome Web Store', file: 'STORE_SUBMISSION.md' },
      { id: 'release-checklist', title: 'Release checklist', file: 'RELEASE_CHECKLIST.md' },
      { id: 'operations', title: 'Operations', file: 'OPERATIONS.md' },
    ],
  },
  {
    title: 'Project',
    items: [
      { id: 'current-status', title: 'Current status', file: 'CURRENT_STATUS.md' },
      { id: 'changelog', title: 'Changelog', file: 'CHANGELOG.md' },
      { id: 'contributing', title: 'Contributing', file: 'CONTRIBUTING.md' },
      { id: 'third-party', title: 'Third-party licenses', file: 'THIRD_PARTY_LICENSES.md' },
    ],
  },
];

const allDocuments = documentationSections.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.title })),
);
const documentCache = new Map();

const refs = {
  sidebar: document.getElementById('sidebar'),
  sidebarNav: document.getElementById('sidebarNav'),
  menuButton: document.getElementById('menuButton'),
  closeMenuButton: document.getElementById('closeMenuButton'),
  drawerOverlay: document.getElementById('drawerOverlay'),
  breadcrumbs: document.getElementById('breadcrumbs'),
  docContent: document.getElementById('docContent'),
  tocNav: document.getElementById('tocNav'),
  pageNavigation: document.getElementById('pageNavigation'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
  themeButton: document.getElementById('themeButton'),
  themeLabel: document.getElementById('themeLabel'),
  liveRegion: document.getElementById('liveRegion'),
};

let activeDocument = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

function safeUrl(value) {
  const trimmed = String(value || '').trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '#';
  return trimmed;
}

function renderInline(value) {
  const codeTokens = [];
  let output = escapeHtml(value).replace(/`([^`]+)`/g, (_match, code) => {
    const token = `%%CODE${codeTokens.length}%%`;
    codeTokens.push(`<code>${code}</code>`);
    return token;
  });

  output = output
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => `<img src="${escapeHtml(safeUrl(src))}" alt="${alt}" loading="lazy" />`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const safeHref = safeUrl(href);
      const external = /^(https?:|mailto:)/i.test(safeHref);
      return `<a href="${escapeHtml(safeHref)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  codeTokens.forEach((token, index) => {
    output = output.replace(`%%CODE${index}%%`, token);
  });
  return output;
}

function tableCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}/.test(line) && line.includes('|');
}

function renderMarkdown(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const toc = [];
  const usedSlugs = new Map();
  let index = 0;

  const uniqueSlug = (heading) => {
    const base = slugify(heading);
    const count = usedSlugs.get(base) || 0;
    usedSlugs.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      html.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const plainText = heading[2].replace(/[`*_]/g, '');
      const id = uniqueSlug(plainText);
      html.push(`<h${level} id="${id}">${renderInline(heading[2])}<a class="heading-anchor" href="#${id}" aria-label="Link to ${escapeHtml(plainText)}">#</a></h${level}>`);
      if (level === 2 || level === 3) toc.push({ id, title: plainText, level });
      index += 1;
      continue;
    }

    if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
      html.push('<hr />');
      index += 1;
      continue;
    }

    if (index + 1 < lines.length && line.includes('|') && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      html.push(`<div class="table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    const listMatch = line.match(/^\s*([-*+] |\d+\. )(.*)$/);
    if (listMatch) {
      const ordered = /\d+\. /.test(listMatch[1]);
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*([-*+] |\d+\. )(.*)$/);
        if (!match || /\d+\. /.test(match[1]) !== ordered) break;
        let item = match[2];
        const checked = item.match(/^\[([ xX])\]\s+(.*)$/);
        if (checked) {
          item = `<input type="checkbox" disabled${checked[1].toLowerCase() === 'x' ? ' checked' : ''} /> ${renderInline(checked[2])}`;
        } else {
          item = renderInline(item);
        }
        items.push(`<li>${item}</li>`);
        index += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    if (line.startsWith('>')) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith('>')) {
        quote.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      html.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s/.test(lines[index]) &&
      !lines[index].startsWith('```') &&
      !/^\s*([-*+] |\d+\. )/.test(lines[index]) &&
      !(index + 1 < lines.length && lines[index].includes('|') && isTableDivider(lines[index + 1]))
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return { html: html.join('\n'), toc };
}

function routeFromHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  return {
    documentId: params.get('doc') || 'introduction',
    sectionId: params.get('section') || '',
  };
}

function documentHash(documentId, sectionId = '') {
  const params = new URLSearchParams({ doc: documentId });
  if (sectionId) params.set('section', sectionId);
  return `#${params.toString()}`;
}

async function fetchDocument(entry) {
  if (documentCache.has(entry.id)) return documentCache.get(entry.id);
  const response = await fetch(entry.file);
  if (!response.ok) throw new Error(`Unable to load ${entry.title} (${response.status})`);
  const content = await response.text();
  documentCache.set(entry.id, content);
  return content;
}

function renderSidebar() {
  refs.sidebarNav.innerHTML = documentationSections.map((section) => `
    <section class="nav-section">
      <h2>${escapeHtml(section.title)}</h2>
      ${section.items.map((item) => `<a href="${documentHash(item.id)}" data-doc-id="${item.id}">${escapeHtml(item.title)}</a>`).join('')}
    </section>
  `).join('');
}

function setActiveNavigation(documentId) {
  refs.sidebarNav.querySelectorAll('[data-doc-id]').forEach((link) => {
    const active = link.dataset.docId === documentId;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function renderBreadcrumbs(entry) {
  refs.breadcrumbs.innerHTML = `<a href="${documentHash('introduction')}">Docs</a><span aria-hidden="true">/</span><span>${escapeHtml(entry.section)}</span><span aria-hidden="true">/</span><strong>${escapeHtml(entry.title)}</strong>`;
}

function renderToc(toc) {
  if (!toc.length) {
    refs.tocNav.innerHTML = '<span class="toc-empty">No sections</span>';
    return;
  }
  refs.tocNav.innerHTML = toc.map((item) => `<a href="${documentHash(activeDocument.id, item.id)}" data-section-id="${item.id}" class="toc-level-${item.level}">${escapeHtml(item.title)}</a>`).join('');
}

function renderPager(entry) {
  const index = allDocuments.findIndex((documentEntry) => documentEntry.id === entry.id);
  const previous = allDocuments[index - 1];
  const next = allDocuments[index + 1];
  refs.pageNavigation.innerHTML = `
    ${previous ? `<a class="previous-page" href="${documentHash(previous.id)}"><span>Previous</span><strong>← ${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}
    ${next ? `<a class="next-page" href="${documentHash(next.id)}"><span>Next</span><strong>${escapeHtml(next.title)} →</strong></a>` : '<span></span>'}
  `;
}

function closeMobileMenu() {
  refs.sidebar.classList.remove('is-open');
  refs.drawerOverlay.hidden = true;
  refs.menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
}

function openMobileMenu() {
  refs.sidebar.classList.add('is-open');
  refs.drawerOverlay.hidden = false;
  refs.menuButton.setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
  refs.closeMenuButton.focus();
}

function scrollToSection(sectionId) {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'auto', block: 'start' }));
}

async function loadRoute({ focusContent = false } = {}) {
  const route = routeFromHash();
  const entry = allDocuments.find((item) => item.id === route.documentId) || allDocuments[0];
  activeDocument = entry;
  setActiveNavigation(entry.id);
  renderBreadcrumbs(entry);
  refs.docContent.setAttribute('aria-busy', 'true');
  refs.docContent.innerHTML = '<div class="loading-state"><span></span><p>Loading documentation…</p></div>';

  try {
    const markdown = await fetchDocument(entry);
    const rendered = renderMarkdown(markdown);
    refs.docContent.innerHTML = rendered.html;
    renderToc(rendered.toc);
    renderPager(entry);
    document.title = `${entry.title} · SmartRead Documentation`;
    refs.liveRegion.textContent = `${entry.title} loaded`;
    refs.docContent.removeAttribute('aria-busy');
    closeMobileMenu();
    scrollToSection(route.sectionId);
    if (focusContent) refs.docContent.focus({ preventScroll: true });
  } catch (error) {
    refs.docContent.innerHTML = `<div class="error-state"><strong>Document unavailable</strong><p>${escapeHtml(error.message)}</p><button type="button" id="retryButton">Try again</button></div>`;
    refs.docContent.removeAttribute('aria-busy');
    document.getElementById('retryButton')?.addEventListener('click', () => {
      documentCache.delete(entry.id);
      loadRoute();
    });
  }
}

function findDocumentForLink(href, currentEntry) {
  if (!href || href.startsWith('#')) return null;
  let targetUrl;
  try {
    const sourceUrl = new URL(currentEntry.file, location.href);
    targetUrl = new URL(href, sourceUrl);
  } catch (_error) {
    return null;
  }
  const exact = allDocuments.find((entry) => new URL(entry.file, location.href).pathname === targetUrl.pathname);
  if (exact) return exact;
  const targetName = targetUrl.pathname.split('/').pop()?.toLowerCase();
  const matches = allDocuments.filter((entry) => new URL(entry.file, location.href).pathname.split('/').pop()?.toLowerCase() === targetName);
  return matches.length === 1 ? matches[0] : null;
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchDocuments(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];
  const results = await Promise.all(allDocuments.map(async (entry) => {
    try {
      const markdown = await fetchDocument(entry);
      const content = plainText(markdown);
      const searchable = `${entry.title} ${entry.section} ${content}`.toLowerCase();
      const matchIndex = searchable.indexOf(normalizedQuery);
      if (matchIndex < 0) return null;
      const contentIndex = content.toLowerCase().indexOf(normalizedQuery);
      const start = Math.max(0, contentIndex - 55);
      const snippet = contentIndex >= 0 ? content.slice(start, start + 145) : entry.section;
      return { entry, snippet: `${start > 0 ? '…' : ''}${snippet}${content.length > start + 145 ? '…' : ''}` };
    } catch (_error) {
      return null;
    }
  }));
  return results.filter(Boolean).slice(0, 8);
}

function closeSearch() {
  refs.searchResults.hidden = true;
  refs.searchInput.setAttribute('aria-expanded', 'false');
}

let searchSequence = 0;
async function updateSearch() {
  const sequence = ++searchSequence;
  const query = refs.searchInput.value;
  if (query.trim().length < 2) {
    closeSearch();
    return;
  }
  refs.searchResults.hidden = false;
  refs.searchResults.innerHTML = '<div class="search-message">Searching…</div>';
  refs.searchInput.setAttribute('aria-expanded', 'true');
  const results = await searchDocuments(query);
  if (sequence !== searchSequence) return;
  refs.searchResults.innerHTML = results.length
    ? results.map(({ entry, snippet }) => `<a role="option" href="${documentHash(entry.id)}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.section)}</span><p>${escapeHtml(snippet)}</p></a>`).join('')
    : '<div class="search-message">No matching documentation</div>';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('smartReadDocsTheme', theme);
  const dark = theme === 'dark';
  refs.themeLabel.textContent = dark ? 'Light' : 'Dark';
  refs.themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
}

function initializeTheme() {
  const saved = localStorage.getItem('smartReadDocsTheme');
  const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved === 'dark' || saved === 'light' ? saved : preferred);
}

refs.menuButton.addEventListener('click', openMobileMenu);
refs.closeMenuButton.addEventListener('click', closeMobileMenu);
refs.drawerOverlay.addEventListener('click', closeMobileMenu);
refs.searchInput.addEventListener('input', updateSearch);
refs.searchInput.addEventListener('focus', () => {
  if (refs.searchInput.value.trim().length >= 2) updateSearch();
});
refs.themeButton.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

refs.docContent.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !activeDocument) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('#')) {
    event.preventDefault();
    const sectionId = href.slice(1);
    location.hash = documentHash(activeDocument.id, sectionId);
    return;
  }
  const matchingDocument = findDocumentForLink(href, activeDocument);
  if (matchingDocument) {
    event.preventDefault();
    location.hash = documentHash(matchingDocument.id);
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.search')) closeSearch();
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !(event.target instanceof HTMLInputElement)) {
    event.preventDefault();
    refs.searchInput.focus();
  }
  if (event.key === 'Escape') {
    closeSearch();
    if (refs.sidebar.classList.contains('is-open')) {
      closeMobileMenu();
      refs.menuButton.focus();
    }
  }
});

window.addEventListener('hashchange', () => loadRoute({ focusContent: true }));

renderSidebar();
initializeTheme();
if (!location.hash) history.replaceState(null, '', documentHash('introduction'));
loadRoute();
