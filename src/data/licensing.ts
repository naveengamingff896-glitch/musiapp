import type { LicensingRecord, ReportRecord } from './types';

/**
 * Licensing ledger shown in the admin dashboard. The prototype only ships
 * original synthetic demo recordings; every real catalogue is explicitly
 * pending until a signed agreement exists.
 */
export const LICENSING_RECORDS: LicensingRecord[] = [
  {
    id: 'lic-001',
    title: 'Mana Music demo loops (8 original instrumentals)',
    owner: 'Mana Music Studio — original synthesis',
    type: 'demo-original',
    territory: 'Worldwide (prototype use)',
    validUntil: '2027-12-31',
    status: 'active',
  },
  {
    id: 'lic-002',
    title: 'Telugu film catalogue — major labels',
    owner: 'Not connected (requires label agreement)',
    type: 'pending-licence',
    territory: 'India',
    validUntil: '—',
    status: 'pending',
  },
  {
    id: 'lic-003',
    title: 'Hindi film catalogue — major labels',
    owner: 'Not connected (requires label agreement)',
    type: 'pending-licence',
    territory: 'India',
    validUntil: '—',
    status: 'pending',
  },
  {
    id: 'lic-004',
    title: 'Tamil / Kannada / Malayalam film catalogues',
    owner: 'Not connected (requires label agreements)',
    type: 'pending-licence',
    territory: 'India',
    validUntil: '—',
    status: 'pending',
  },
  {
    id: 'lic-005',
    title: 'Independent artist direct uploads',
    owner: 'Not connected (requires artist agreements)',
    type: 'pending-licence',
    territory: 'Worldwide',
    validUntil: '—',
    status: 'pending',
  },
  {
    id: 'lic-006',
    title: 'Public performance licence (IPRS)',
    owner: 'Not connected (requires registration)',
    type: 'pending-licence',
    territory: 'India',
    validUntil: '—',
    status: 'pending',
  },
  {
    id: 'lic-007',
    title: 'Podcast distribution rights',
    owner: 'Mana Music Studio — demo episodes only',
    type: 'demo-original',
    territory: 'Worldwide (prototype use)',
    validUntil: '2027-12-31',
    status: 'active',
  },
];

export const REPORT_SEEDS: ReportRecord[] = [
  {
    id: 'rp-001',
    subject: 'Album artwork missing on low-end Android',
    type: 'Playback / UI',
    detail: 'Artwork gradients render slowly on a 4 GB Android 10 device. Reported during internal QA.',
    status: 'reviewing',
    createdAt: '2026-09-04',
  },
  {
    id: 'rp-002',
    subject: 'Duplicate track inside a Telugu era playlist',
    type: 'Catalogue metadata',
    detail: 'A track appeared twice after a playlist refresh. Demo catalogue regenerated.',
    status: 'resolved',
    createdAt: '2026-09-11',
  },
  {
    id: 'rp-003',
    subject: 'Request: add Bhojpuri and Tulu language shelves',
    type: 'Feature request',
    detail: 'Listener asked for the two additional regional languages to be surfaced on the Explore screen.',
    status: 'open',
    createdAt: '2026-09-19',
  },
];
