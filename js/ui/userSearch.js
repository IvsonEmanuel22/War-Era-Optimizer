import { $, escapeHtml } from '../utils.js';
import { searchUsernames } from '../api.js';
import { analyze } from '../analyze.js';

function showDropdownMessage(msg, isError = false) {
  const dropdown = $('usernameDropdown');
  dropdown.innerHTML = `<li class="username-dropdown-msg${isError ? ' error' : ''}">${escapeHtml(msg)}</li>`;
  dropdown.hidden = false;
}

function renderUsernameDropdown(users) {
  const dropdown = $('usernameDropdown');
  if (!users.length) {
    showDropdownMessage('No matches');
    return;
  }
  dropdown.innerHTML = users.map(u =>
    `<li class="username-dropdown-item" data-id="${escapeHtml(u.id)}" data-name="${escapeHtml(u.username)}">
      <span class="ud-name">${escapeHtml(u.username)}</span>
      <span class="ud-lvl">lvl ${u.level}</span>
    </li>`
  ).join('');
  dropdown.hidden = false;
  dropdown.querySelectorAll('.username-dropdown-item').forEach(item => {
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      $('username').value = item.dataset.name;
      dropdown.hidden = true;
      analyze(item.dataset.id, item.dataset.name);
    });
  });
}

export function initUserSearch() {
  const input    = $('username');
  const dropdown = $('usernameDropdown');
  let debounce   = null;
  let searchId   = 0;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const query = input.value.trim();
    if (query.length < 2) { dropdown.hidden = true; return; }

    const id = ++searchId;
    showDropdownMessage('Searching…');

    debounce = setTimeout(async () => {
      let results;
      try {
        results = await searchUsernames(query);
      } catch (err) {
        if (id !== searchId) return;
        const msg = err?.kind === 'network'
          ? 'Search failed — WarEra API unreachable'
          : err?.status === 429
            ? 'Rate-limited — wait a few seconds and try again'
            : 'Search failed' + (err?.status ? ` (HTTP ${err.status})` : '');
        showDropdownMessage(msg, true);
        return;
      }
      if (id !== searchId) return;
      renderUsernameDropdown(results);
    }, 450);
  });

  input.addEventListener('blur',  () => setTimeout(() => { dropdown.hidden = true; }, 200));
  input.addEventListener('focus', () => { if (dropdown.children.length > 0) dropdown.hidden = false; });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') analyze(); });

  document.addEventListener('click', e => {
    if (!e.target.closest('.username-wrap')) dropdown.hidden = true;
  });
}
