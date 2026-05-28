import { ALLOWED_COUNTRY_CODES } from './config.js';
import { setGearSnapshotListener, loadGearSnapshot } from './api.js';
import { $ } from './utils.js';
import { analyze } from './analyze.js';
import { initUserSearch } from './ui/userSearch.js';
import { refreshMinMaxButtonState, initBuildButtons } from './ui/buildPanel.js';

setGearSnapshotListener(refreshMinMaxButtonState);
loadGearSnapshot().catch(() => {});
$('goBtn').addEventListener('click', () => analyze());
initUserSearch();
initBuildButtons();

(async function geoGate() {
  const el = document.getElementById('geoGate');
  if (!el) return;
  const titleEl = document.getElementById('geoGateTitle');
  const msgEl   = document.getElementById('geoGateMsg');

  async function detectCountry() {
    try {
      const res  = await fetch('https://ipwho.is/', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false && data.country_code)
          return { code: String(data.country_code).toLowerCase(), src: 'ipwho.is' };
      }
    } catch (e) { console.warn('ipwho.is failed:', e); }
    try {
      const res  = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.country_code)
          return { code: String(data.country_code).toLowerCase(), src: 'ipapi.co' };
      }
    } catch (e) { console.warn('ipapi.co failed:', e); }
    return null;
  }

  const geo = await detectCountry();
  if (!geo) {
    console.warn('Geo-lookup unavailable; failing open. Account whitelist still applies.');
    el.remove();
    return;
  }
  if (ALLOWED_COUNTRY_CODES.has(geo.code)) { el.remove(); return; }
  el.classList.add('blocked');
  titleEl.textContent = 'Not available in your region';
  msgEl.textContent   = `This tool is restricted to allied countries. Your IP (${geo.code.toUpperCase()}) isn't on the list.`;
})();
