import { PLAYER_API_SKILL_MAP, WAR_ECO_ADVANTAGES_HTML } from './config.js';

// Maps API skill keys → optimizer skill keys using the static mapping table.
export function extractPlayerSkills(user) {
  const skills = {};
  const rawSkills = user?.skills || {};
  for (const [apiKey, optKey] of PLAYER_API_SKILL_MAP) {
    skills[optKey] = Number(rawSkills[apiKey]?.level ?? 0);
  }
  return skills;
}

// SP consumed by skills that the optimizer doesn't model (e.g. loot, enter, companies).
export function unmodeledReservedSP(user) {
  const modeled = new Set(PLAYER_API_SKILL_MAP.map(([apiKey]) => apiKey));
  let used = 0;
  for (const [key, skill] of Object.entries(user?.skills || {})) {
    if (modeled.has(key)) continue;
    const lvl = Number(skill?.level ?? 0);
    used += (lvl * (lvl + 1)) / 2;
  }
  return used;
}

// Wraps HTML in the war-eco two-column layout when mode === 'warEco'.
export function wrapForWarEco(html, mode) {
  if (mode !== 'warEco') return html;
  return '<div class="we-layout">' + html + WAR_ECO_ADVANTAGES_HTML + '</div>';
}
