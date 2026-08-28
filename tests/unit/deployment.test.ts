import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type StaticRoute = { route: string; rewrite?: string; headers?: Record<string, string> };

describe('static deployment policy', () => {
  const config = JSON.parse(readFileSync(resolve(process.cwd(), 'public/staticwebapp.config.json'), 'utf8')) as {
    navigationFallback?: unknown;
    routes: StaticRoute[];
    responseOverrides: Record<string, { rewrite?: string; statusCode?: number }>;
  };

  it('serves only known app routes through the SPA and keeps a real 404', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes.filter((route) => route.rewrite).map((route) => route.route)).toEqual(['/planner', '/demo', '/privacy', '/terms']);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  });

  it('marks content-addressed and static image assets immutable', () => {
    const immutable = 'public, max-age=31536000, immutable';
    for (const route of ['/assets/*', '/icons/*', '/favicon.svg']) {
      expect(config.routes.find((entry) => entry.route === route)?.headers?.['Cache-Control']).toBe(immutable);
    }
  });
});
