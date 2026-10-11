/**
 * Serves the committed fixtures (data/fixtures/, real snapshots of the live API) through a
 * stubbed fetch, so the UI is tested against the real contract without a running backend.
 *
 * The stub records every URL it is asked for, which is how the site-name encoding is tested:
 * one ghat name contains a slash and must travel as an encoded query parameter.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', '..', 'data', 'fixtures');

const load = (name) => JSON.parse(readFileSync(join(fixtures, name), 'utf-8'));

export const rankingDurga = load('ranking_durga.json');
export const ghatBairagarh = load('ghat_bairagarh_durga.json');

export const SUMMARY = {
  rows: 1524,
  do_readings: 116,
  do_below_5: 42,
  bod_readings: 112,
  bod_above_3: 100,
  status_counts: { measured: 1400, missing: 100, below_detection: 24 },
};

export const BRIEF = {
  festival: 'Durga',
  en: 'Visarjan Ghat Watch: Durga brief\n1. Bairagarh (Sant Hirdaram) kund: High risk. Add a test during immersion.',
  hi: 'विसर्जन घाट वॉच: दुर्गा ब्रीफ\n1. बैरागढ़ (संत हिरदाराम) कुंड: जोखिम उच्च। विसर्जन के दौरान एक और जाँच।',
  source: 'template',
  numbers_validated: true,
};

export function installApiMock() {
  const calls = [];
  const stub = vi.fn((url) => {
    calls.push(String(url));
    const u = String(url);
    let body;
    if (u.includes('/api/summary')) body = SUMMARY;
    else if (u.includes('/api/ranking')) body = rankingDurga;
    else if (u.includes('/api/ghat?')) body = ghatBairagarh;
    else if (u.includes('/api/brief')) body = BRIEF;
    else return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
  });
  global.fetch = stub;
  return calls;
}
