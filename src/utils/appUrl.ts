/**
 * Canonical Permanent App URLs & Multi-App Role Routing for MIX MART Coffee Bar
 *
 * 4 Standalone Applications:
 *  - Guest App   (`/?app=guest` or `/guest` or `/`): Direct entry, Menu, Extras, Timing, Cash/Visa
 *  - Owner App   (`/?app=owner` or `/owner`): Username login, Full Orders + Edit, Drinks/Photos/Prices/Desc, Sales
 *  - Manager App (`/?app=manager` or `/manager`): Username login, Orders Reception + Sales Analytics ONLY (No Menu)
 *  - Barista App (`/?app=barista` or `/barista`): Username login, Orders Reception, Accept/Reject, Upsell & Cross-sell
 */

export type AppRole = 'guest' | 'owner' | 'manager' | 'barista';

export const PERMANENT_SHARED_APP_URL =
  'https://ais-pre-lradg4cm6zcpqnx37zwffn-294994456642.europe-west2.run.app';

export function getPermanentAppUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    if (origin.includes('ais-pre-') || (!origin.includes('localhost') && !origin.includes('127.0.0.1'))) {
      return origin;
    }
  }
  return PERMANENT_SHARED_APP_URL;
}

export function detectAppRoleFromUrl(): AppRole {
  if (typeof window === 'undefined') return 'guest';

  const params = new URLSearchParams(window.location.search);
  const appParam = params.get('app')?.toLowerCase().trim();
  if (appParam === 'owner' || appParam === 'manager' || appParam === 'barista' || appParam === 'guest') {
    return appParam;
  }

  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  if (pathname === '/owner' || pathname.endsWith('/owner')) return 'owner';
  if (pathname === '/manager' || pathname.endsWith('/manager')) return 'manager';
  if (pathname === '/barista' || pathname.endsWith('/barista')) return 'barista';
  if (pathname === '/guest' || pathname.endsWith('/guest')) return 'guest';

  return 'guest';
}

export function getAppUrl(role: AppRole, baseOverride?: string): string {
  const base = (baseOverride || getPermanentAppUrl()).replace(/\/+$/, '');
  if (role === 'guest') return `${base}/?app=guest`;
  return `${base}/?app=${role}`;
}

export function getCurrentOriginAppUrl(role: AppRole): string {
  if (typeof window === 'undefined') return getAppUrl(role);
  const origin = window.location.origin.replace(/\/+$/, '');
  return `${origin}/?app=${role}`;
}
