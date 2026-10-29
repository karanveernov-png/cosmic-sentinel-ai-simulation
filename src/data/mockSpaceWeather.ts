import type { SpaceWeatherSummary } from '../types/source';

export const mockSpaceWeather: SpaceWeatherSummary = {
  status: 'demo',
  explanation:
    'Space-weather conditions can affect certain technological services — HF radio, GNSS accuracy, and some satellite operations — under particular circumstances. The presence of a space-weather event does not, by itself, establish that a specific communication outage occurred; that relationship must be evaluated using the Compound Threat Intelligence Engine with its own supporting evidence.',
  indicators: [
    {
      id: 'kp-index',
      name: 'Geomagnetic Storm (Kp Index)',
      classification: 'G2',
      level: 'moderate',
      detail: 'Kp 4.2 — moderate geomagnetic storm watch in effect.',
      observedAt: 'T-172m',
      status: 'demo',
    },
    {
      id: 'radio-blackout',
      name: 'Radio Blackout',
      classification: 'R1',
      level: 'minor',
      detail: 'Minor HF radio degradation possible on sunlit side.',
      observedAt: 'T-180m',
      status: 'demo',
    },
    {
      id: 'solar-radiation',
      name: 'Solar Radiation Storm',
      classification: 'S1',
      level: 'minor',
      detail: 'Below the threshold expected to affect satellite operations.',
      observedAt: 'T-200m',
      status: 'demo',
    },
  ],
  trend: [
    { timestamp: 'T-360m', kpIndex: 2.1 },
    { timestamp: 'T-300m', kpIndex: 2.4 },
    { timestamp: 'T-240m', kpIndex: 3.0 },
    { timestamp: 'T-180m', kpIndex: 3.8 },
    { timestamp: 'T-120m', kpIndex: 4.0 },
    { timestamp: 'T-60m', kpIndex: 4.2 },
    { timestamp: 'T-5m', kpIndex: 4.2 },
  ],
};
