import axios from 'axios';
import type {
  Property, PropertyForm,
  Income, IncomeForm,
  Expense, ExpenseForm,
  CalendarEvent, CalendarEventForm,
  Task, TaskForm,
  DashboardSummary
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export const propertyApi = {
  getAll: () => api.get<Property[]>('/properties').then(r => r.data),
  getById: (id: number) => api.get<Property>(`/properties/${id}`).then(r => r.data),
  create: (data: PropertyForm) => api.post<Property>('/properties', data).then(r => r.data),
  update: (id: number, data: PropertyForm) => api.put<Property>(`/properties/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/properties/${id}`),
};

export const incomeApi = {
  getAll: (params?: { propertyId?: number; from?: string; to?: string }) =>
    api.get<Income[]>('/incomes', { params }).then(r => r.data),
  getById: (id: number) => api.get<Income>(`/incomes/${id}`).then(r => r.data),
  create: (data: IncomeForm) => api.post<Income>('/incomes', data).then(r => r.data),
  update: (id: number, data: IncomeForm) => api.put<Income>(`/incomes/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/incomes/${id}`),
};

export const expenseApi = {
  getAll: (params?: { propertyId?: number; from?: string; to?: string }) =>
    api.get<Expense[]>('/expenses', { params }).then(r => r.data),
  getById: (id: number) => api.get<Expense>(`/expenses/${id}`).then(r => r.data),
  create: (data: ExpenseForm) => api.post<Expense>('/expenses', data).then(r => r.data),
  update: (id: number, data: ExpenseForm) => api.put<Expense>(`/expenses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

export const calendarEventApi = {
  getAll: (params?: { propertyId?: number; from?: string; to?: string }) =>
    api.get<CalendarEvent[]>('/calendar-events', { params }).then(r => r.data),
  getById: (id: number) => api.get<CalendarEvent>(`/calendar-events/${id}`).then(r => r.data),
  create: (data: CalendarEventForm) => api.post<CalendarEvent>('/calendar-events', data).then(r => r.data),
  update: (id: number, data: CalendarEventForm) => api.put<CalendarEvent>(`/calendar-events/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/calendar-events/${id}`),
};

export const taskApi = {
  getAll: (params?: { propertyId?: number; completed?: boolean }) =>
    api.get<Task[]>('/tasks', { params }).then(r => r.data),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  create: (data: TaskForm) => api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: number, data: TaskForm) => api.put<Task>(`/tasks/${id}`, data).then(r => r.data),
  toggle: (id: number) => api.patch<Task>(`/tasks/${id}/toggle`).then(r => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary').then(r => r.data),
};
