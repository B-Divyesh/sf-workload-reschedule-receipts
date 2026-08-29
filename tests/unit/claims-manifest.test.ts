import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Claim {
  id: string;
  claim: string;
  where: string;
  test: string;
  sandbox: string;
}

describe('claims contract', () => {
  const claims = JSON.parse(readFileSync(resolve(process.cwd(), '.factory/claims.json'), 'utf8')) as Claim[];
  const browserTests = readFileSync(resolve(process.cwd(), 'tests/e2e/claims.spec.ts'), 'utf8');

  it('lists unique, complete claims with their exact runnable command', () => {
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(claim.claim.trim()).not.toBe('');
      expect(claim.where.trim()).not.toBe('');
      expect(claim.sandbox.trim()).not.toBe('');
      expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    }
  });

  it('maps every manifest claim to exactly one tagged browser test and has no extra claim tags', () => {
    const tags = [...browserTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(tags.sort()).toEqual(claims.map((claim) => claim.id).sort());
    for (const claim of claims) expect(tags.filter((tag) => tag === claim.id)).toHaveLength(1);
  });
});
