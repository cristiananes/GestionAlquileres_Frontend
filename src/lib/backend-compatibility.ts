export class BackendCompatibilityError extends Error {
  constructor() {
    super('La web y el servidor no están en la misma versión. El backend desplegado todavía no admite estas funciones. Actualiza el despliegue del backend y pulsa Reintentar.');
    this.name = 'BackendCompatibilityError';
  }
}

export function requiredBackendFeature(url: string, method = 'get', archived?: unknown): string | null {
  const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0].replace(/^\/api(?=\/)/, '');
  if (path === '/capabilities' || /^\/(auth(?:\/|$)|contact$|feedback$)/.test(path)) return null;
  if (/^\/utility-bills(?:\/|$)/.test(path)) return 'utility-bills';
  if (method.toLowerCase() === 'delete' || /\/(?:restore|archive)$/.test(path)) return 'soft-archive';
  if (!['get', 'head', 'options'].includes(method.toLowerCase())) return 'safe-writes';
  if (archived === true || archived === 'true') return 'soft-archive';
  if (/^\/properties\/\d+\/investment$/.test(path)) return 'investment';
  if (/^\/recurrences(?:\/|$)/.test(path)) return 'recurrences';
  if (/^\/(?:properties\/\d+\/)?leases(?:\/|$)/.test(path)) return 'leases';
  if (/^\/(?:properties\/\d+\/)?documents(?:\/|$)/.test(path)) return 'documents';
  if (/^\/reports(?:\/|$)/.test(path)) return 'filtered-reports';
  return null;
}

export function assertBackendFeature(value: unknown, feature: string): void {
  if (!value || typeof value !== 'object') throw new BackendCompatibilityError();
  const capabilities = value as { apiVersion?: unknown; features?: unknown };
  if (typeof capabilities.apiVersion !== 'number' || capabilities.apiVersion < 2 ||
      !Array.isArray(capabilities.features) || !capabilities.features.includes(feature)) throw new BackendCompatibilityError();
}

export async function requireBackendFeature(read: () => Promise<unknown>, feature: string): Promise<void> {
  let value: unknown;
  try { value = await read(); }
  catch (error) {
    const response = typeof error === 'object' && error !== null && 'response' in error
      ? (error as {response?: {status?: number; data?: {error?: string}}}).response : undefined;
    if (response?.status === 404 || response?.status === 405 || response?.status === 501 ||
        (typeof response?.data?.error === 'string' && response.data.error.includes('No static resource'))) throw new BackendCompatibilityError();
    throw error;
  }
  assertBackendFeature(value, feature);
}

export interface ArchiveEntry { id: number; archived: boolean; name?: string; title?: string; description?: string; propertyName?: string }
export function confirmedArchivedEntries(value: unknown): ArchiveEntry[] {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== 'object' || item.archived !== true || !Number.isSafeInteger(item.id) || item.id <= 0)) {
    throw new BackendCompatibilityError();
  }
  return value as ArchiveEntry[];
}
