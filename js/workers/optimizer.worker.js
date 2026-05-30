import { optimize } from '../optimizer/presets.js';

self.onmessage = (e) => {
  const { runId, presetName, userData } = e.data;
  const t0 = Date.now();
  try {
    const result = optimize(presetName, userData, (g, total, dmg, comboInfo) => {
      self.postMessage({ runId, type: 'progress', g, total, dmg, elapsed: Date.now() - t0, ...comboInfo });
    });
    self.postMessage({ runId, type: 'result', result });
  } catch (err) {
    self.postMessage({ runId, type: 'error', message: err.message });
  }
};
