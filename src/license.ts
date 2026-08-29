const SLUG = 'workload-reschedule-receipts';
const KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${KEY}:verdict`;
const API = 'https://api.sociobot.in/api/v1';

export interface LicenseState {
  active: boolean;
  notice?: string;
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;

export function acceptLicenseFromUrl(): void {
  const url = new URL(window.location.href);
  const license = url.searchParams.get('license');
  if (!license) return;
  localStorage.setItem(KEY, license);
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(KEY);
  if (!token) return { active: false };
  const raw = localStorage.getItem(VERDICT_KEY);
  if (!raw) return { active: false };
  try {
    const verdict = JSON.parse(raw) as { valid?: boolean };
    return verdict.valid === true
      ? { active: true }
      : { active: false, notice: 'This license is no longer active.' };
  } catch {
    return { active: false };
  }
}

export async function verifyLicense(): Promise<LicenseState> {
  const token = localStorage.getItem(KEY);
  if (!token) return { active: false };
  const cached = localStorage.getItem(VERDICT_KEY);
  if (cached) {
    try {
      const value = JSON.parse(cached) as { checkedAt: number; valid: boolean };
      if (Date.now() - value.checkedAt < 86_400_000) return cachedLicenseState();
    } catch { /* verify below */ }
  }
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return result.valid ? { active: true } : { active: false, notice: 'This license is no longer active.' };
  } catch {
    return cachedLicenseState();
  }
}
