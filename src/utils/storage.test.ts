import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassphrase,
  validatePassphrase,
  DEFAULT_CEO_PASSPHRASES,
  DEFAULT_TEAM_PASSPHRASES,
  generateOnboardingProtocol,
  Client,
} from './storage';
import { isSupabaseConfigured } from './supabase';
import {
  PROMPT_CATEGORIES,
  STARTER_AGENCY_PROMPTS,
  extractCustomVariables,
  filterPrompts,
  resolvePromptContent,
} from '../features/prompt-os/promptVault';

test('hashPassphrase produces deterministic hashes', () => {
  const h1 = hashPassphrase('NERO2024CEO');
  const h2 = hashPassphrase('NERO2024CEO');
  const h3 = hashPassphrase('NERO2024TEAM');
  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
});

test('validatePassphrase validates default and custom passphrases', () => {
  assert.equal(validatePassphrase(DEFAULT_CEO_PASSPHRASES[0]), 'ceo');
  assert.equal(validatePassphrase(DEFAULT_TEAM_PASSPHRASES[0]), 'team');
  assert.equal(validatePassphrase('invalid-pass'), null);

  const customSettings = {
    ceoPhraseHash: hashPassphrase('CUSTOMCEO'),
    teamPhraseHash: hashPassphrase('CUSTOMTEAM'),
    initialized: true,
    lastUpdated: null,
  };
  assert.equal(validatePassphrase('customceo', customSettings), 'ceo');
  assert.equal(validatePassphrase('customteam', customSettings), 'team');
});

test('generateOnboardingProtocol creates 10 steps initialized to incomplete', () => {
  const protocol = generateOnboardingProtocol(42);
  assert.equal(protocol.clientId, 42);
  assert.equal(protocol.progress, 0);
  assert.equal(protocol.steps.length, 10);
  assert.equal(protocol.steps.every(s => !s.completed), true);
});

test('isSupabaseConfigured rejects placeholder URLs and keys', () => {
  assert.equal(isSupabaseConfigured(undefined, undefined), false);
  assert.equal(
    isSupabaseConfigured('https://your-project.supabase.co', 'sb_publishable_your_key'),
    false
  );
  assert.equal(
    isSupabaseConfigured('https://placeholder-project.supabase.co', 'placeholder-anon-key'),
    false
  );
  assert.equal(
    isSupabaseConfigured(
      'https://xyzcompany.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    ),
    true
  );
});

test('STARTER_AGENCY_PROMPTS covers all 8 agency categories', () => {
  for (const category of PROMPT_CATEGORIES) {
    const count = STARTER_AGENCY_PROMPTS.filter(p => p.category === category).length;
    assert.equal(count > 0, true, `Expected at least 1 starter prompt for ${category}`);
  }
});

test('extractCustomVariables ignores client.* tokens and returns custom variables', () => {
  const vars = extractCustomVariables(
    'Write a {{format}} for {{client.name}} ({{client.niche}}) about {{topic}} with {{cta}} and {{topic}}.'
  );
  assert.deepEqual(vars, ['format', 'topic', 'cta']);
});

test('resolvePromptContent injects client fields, custom variables, and optional strategy block', () => {
  const mockClient: Client = {
    id: 1,
    name: 'Pareero Luxury',
    status: 'Active Sprint',
    revenueGate: '>5M PKR',
    tier: 'Tier 3: Market Dominance',
    ltv: 500000,
    contractValue: 250000,
    phone: '',
    email: '',
    contactName: 'Ali',
    niche: 'Luxury Menswear',
    startDate: '2026-01-01',
    shadowAvatar: 'Founders & Executives aged 28-45',
    bleedingNeck: 'Generic off-the-rack tailoring that lacks presence',
    contentPillars: ['Craftsmanship', 'Executive Presence'],
    relationshipHealth: 'healthy',
    onboardingStatus: 'in-progress',
    notes: '',
    timeline: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const resolved = resolvePromptContent(
    'Create a reel for {{client.name}} targeting {{client.audience}} about {{topic}}.',
    {
      client: mockClient,
      variables: { topic: 'Bespoke Wool Jackets' },
      includeClientContext: true,
    }
  );

  assert.equal(resolved.includes('CLIENT CONTEXT — Pareero Luxury'), true);
  assert.equal(resolved.includes('Founders & Executives aged 28-45'), true);
  assert.equal(resolved.includes('Bespoke Wool Jackets'), true);
});

test('filterPrompts filters by category, client scope, and search query', () => {
  const brandPrompts = filterPrompts(STARTER_AGENCY_PROMPTS, {
    category: 'Brand Story',
  });
  assert.equal(brandPrompts.length > 0, true);
  assert.equal(brandPrompts.every(p => p.category === 'Brand Story'), true);

  const reelPrompts = filterPrompts(STARTER_AGENCY_PROMPTS, {
    search: '45-second',
  });
  assert.equal(reelPrompts.length, 1);
  assert.equal(reelPrompts[0].category, 'Videos');
});
