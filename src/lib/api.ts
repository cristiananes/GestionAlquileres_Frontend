import axios from 'axios';
import { requiredBackendFeature, requireBackendFeature, confirmedArchivedEntries } from '@/lib/backend-compatibility';
import type {
  Property, PropertyForm,
  Income, IncomeForm,
  Expense, ExpenseForm,
  CalendarEvent, CalendarEventForm,
  Task, TaskForm,
  DashboardSummary,
  InvestmentSummary, RecurringRule, RecurringRuleForm, Occurrence, Lease, LeaseForm, PropertyDocument,
  ContactMessageForm
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

// Coalesce only simultaneous probes; never cache a failed deployment check or reuse
// an earlier positive check for a later destructive request after a server rollback.
let capabilitiesInFlight: Promise<unknown> | null = null;
function readCapabilities(): Promise<unknown> {
  if (!capabilitiesInFlight) capabilitiesInFlight = api.get('/capabilities').then(r => r.data).finally(() => { capabilitiesInFlight = null; });
  return capabilitiesInFlight;
}

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const feature = requiredBackendFeature(config.url || '', config.method, config.params?.archived);
  if (feature) await requireBackendFeature(readCapabilities, feature);
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (typeof window !== 'undefined' && error.response?.status === 401 && localStorage.getItem('token')) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('gestion-alquiler-session'));
  }
  return Promise.reject(error);
});

export const propertyApi = {
  getAll: (archived = false) => api.get<Property[]>('/properties', { params: { archived } }).then(r => r.data),
  updateInvestment: (id: number, values: { purchasePrice?: number | null; purchaseCosts?: number | null; renovationCosts?: number | null; furnitureCosts?: number | null; cashInvested?: number | null }) => api.put<Property>(`/properties/${id}/investment`, values).then(r => r.data),
  investment: (id: number, params?: { from?: string; to?: string }) => api.get<InvestmentSummary>(`/properties/${id}/investment`, { params }).then(r => r.data),
  getById: (id: number) => api.get<Property>(`/properties/${id}`).then(r => r.data),
  create: (data: PropertyForm) => api.post<Property>('/properties', data).then(r => r.data),
  update: (id: number, data: PropertyForm) => api.put<Property>(`/properties/${id}`, data).then(r => r.data),
  delete: (id: number) => api.post(`/properties/${id}/archive`),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Property>(`/properties/${id}/image`, formData).then(r => r.data);
  },
  deleteImage: (id: number, imageUrl: string) =>
    api.post<Property>(`/properties/${id}/images/delete`, { imageUrl }).then(r => r.data),
};

export const incomeApi = {
  getAll: (params?: { propertyId?: number; from?: string; to?: string; archived?: boolean }) =>
    api.get<Income[]>('/incomes', { params }).then(r => r.data),
  getById: (id: number) => api.get<Income>(`/incomes/${id}`).then(r => r.data),
  create: (data: IncomeForm) => api.post<Income>('/incomes', data).then(r => r.data),
  update: (id: number, data: IncomeForm) => api.put<Income>(`/incomes/${id}`, data).then(r => r.data),
  delete: (id: number) => api.post(`/incomes/${id}/archive`),
};

export const expenseApi = {
  getAll: (params?: { propertyId?: number; from?: string; to?: string; archived?: boolean }) =>
    api.get<Expense[]>('/expenses', { params }).then(r => r.data),
  getById: (id: number) => api.get<Expense>(`/expenses/${id}`).then(r => r.data),
  create: (data: ExpenseForm) => api.post<Expense>('/expenses', data).then(r => r.data),
  update: (id: number, data: ExpenseForm) => api.put<Expense>(`/expenses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.post(`/expenses/${id}/archive`),
};

export const calendarEventApi = {
  getAll: (params?: { propertyId?: number; from?: string; to?: string; archived?: boolean }) =>
    api.get<CalendarEvent[]>('/calendar-events', { params }).then(r => r.data),
  getById: (id: number) => api.get<CalendarEvent>(`/calendar-events/${id}`).then(r => r.data),
  create: (data: CalendarEventForm) => api.post<CalendarEvent>('/calendar-events', data).then(r => r.data),
  update: (id: number, data: CalendarEventForm) => api.put<CalendarEvent>(`/calendar-events/${id}`, data).then(r => r.data),
  delete: (id: number) => api.post(`/calendar-events/${id}/archive`),
};

export const taskApi = {
  getAll: (params?: { propertyId?: number; completed?: boolean; archived?: boolean }) =>
    api.get<Task[]>('/tasks', { params }).then(r => r.data),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  create: (data: TaskForm) => api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: number, data: TaskForm) => api.put<Task>(`/tasks/${id}`, data).then(r => r.data),
  toggle: (id: number) => api.patch<Task>(`/tasks/${id}/toggle`).then(r => r.data),
  delete: (id: number) => api.post(`/tasks/${id}/archive`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; userId: number; name: string; email: string; role: string }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<{ token: string; userId: number; name: string; email: string; role: string }>('/auth/register', { name, email, password }),
};

export const contactApi = {
  send: (data: ContactMessageForm) => api.post('/contact', data),
};

export const feedbackApi = {
  send: (data: ContactMessageForm) => api.post('/feedback', data),
};

export const reportApi = {
  downloadIncomes: (from?: string, to?: string, propertyId?: number) =>
    api.get('/reports/incomes', { params: { from, to, propertyId }, responseType: 'blob' }).then(r => r.data),
  downloadExpenses: (from?: string, to?: string, propertyId?: number) =>
    api.get('/reports/expenses', { params: { from, to, propertyId }, responseType: 'blob' }).then(r => r.data),
};

export const dashboardApi = {
  getSummary: (params?: { from?: string; to?: string; archived?: boolean }) => api.get<DashboardSummary>('/dashboard/summary', { params }).then(r => r.data),
};

export const recurrenceApi = {
  rules: (propertyId?: number, archived = false) => api.get<RecurringRule[]>('/recurrences', { params: { propertyId, archived } }).then(r => r.data),
  create: (data: RecurringRuleForm) => api.post<RecurringRule>('/recurrences', data).then(r => r.data),
  occurrences: (from: string, to: string, propertyId?: number) => api.get<Occurrence[]>('/recurrences/occurrences', { params: { from, to, propertyId } }).then(r => r.data),
  pay: (id: number, data: { dueDate: string; paymentDate: string; amount: number; clientRequestId: string }) => api.post<Occurrence>(`/recurrences/${id}/payments`, data).then(r => r.data),
  finish: (id: number) => api.post(`/recurrences/${id}/finish`),
};
export const leaseApi = {
  list: (propertyId: number, archived = false) => api.get<Lease[]>(`/properties/${propertyId}/leases`, { params: { archived } }).then(r => r.data),
  create: (propertyId: number, data: LeaseForm) => api.post<Lease>(`/properties/${propertyId}/leases`, data).then(r => r.data),
};
export const documentApi = {
  list: (id: number, archived = false) => api.get<PropertyDocument[]>(`/properties/${id}/documents`, { params: { archived } }).then(r => r.data),
  upload: (id: number, file: File, incomeId?: number, expenseId?: number) => {
    const data = new FormData(); data.append('file', file);
    return api.post<PropertyDocument>(`/properties/${id}/documents`, data, { params: { incomeId, expenseId } }).then(r => r.data);
  },
  download: (id: number) => api.get<Blob>(`/documents/${id}/download`, { responseType: 'blob' }).then(r => r.data),
};
export type ArchiveKind = 'properties' | 'incomes' | 'expenses' | 'tasks' | 'calendar-events' | 'recurrences' | 'leases' | 'documents';
export const archiveApi = {
  list: (kind: ArchiveKind) => api.get<unknown>(`/${kind}`, { params: { archived: true } }).then(r => confirmedArchivedEntries(r.data)),
  archive: (kind: ArchiveKind, id: number) => api.post(`/${kind}/${id}/archive`),
  restore: (kind: ArchiveKind, id: number) => api.post(`/${kind}/${id}/restore`),
};
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
