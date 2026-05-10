export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  propertyType: 'APARTMENT' | 'HOUSE' | 'LOCAL' | 'OFFICE' | 'GARAGE' | 'OTHER' | null;
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  condition: 'READY_TO_MOVE' | 'NEEDS_RENOVATION' | 'UNDER_RENOVATION' | null;
  hasElevator: boolean | null;
  hasParking: boolean | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyForm {
  name: string;
  address: string;
  city: string;
  propertyType: 'APARTMENT' | 'HOUSE' | 'LOCAL' | 'OFFICE' | 'GARAGE' | 'OTHER' | '';
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  condition: 'READY_TO_MOVE' | 'NEEDS_RENOVATION' | 'UNDER_RENOVATION' | '';
  hasElevator: boolean | null;
  hasParking: boolean | null;
  description: string;
}

export interface Income {
  id: number;
  propertyId: number | null;
  propertyName: string;
  amount: number;
  description: string;
  incomeDate: string;
  incomeType: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'OTHER';
  paymentMethod: 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';
  createdAt: string;
  updatedAt: string;
}

export interface IncomeForm {
  propertyId: number | null;
  amount: number;
  description: string;
  incomeDate: string;
  incomeType: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'OTHER';
  paymentMethod: 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';
}

export interface Expense {
  id: number;
  propertyId: number | null;
  propertyName: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: 'REPAIR' | 'MAINTENANCE' | 'TAXES' | 'UTILITIES' | 'INSURANCE' | 'CLEANING' | 'COMMISSION' | 'LEGAL' | 'ADMINISTRATION' | 'OTHER';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseForm {
  propertyId: number | null;
  amount: number;
  description: string;
  expenseDate: string;
  category: 'REPAIR' | 'MAINTENANCE' | 'TAXES' | 'UTILITIES' | 'INSURANCE' | 'CLEANING' | 'COMMISSION' | 'LEGAL' | 'ADMINISTRATION' | 'OTHER';
}

export interface CalendarEvent {
  id: number;
  propertyId: number | null;
  propertyName: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  eventType: 'VIEWING' | 'PAYMENT_DUE' | 'MAINTENANCE' | 'INSPECTION' | 'CONTRACT_END' | 'REMINDER' | 'OTHER';
  color: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventForm {
  propertyId: number | null;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  eventType: 'VIEWING' | 'PAYMENT_DUE' | 'MAINTENANCE' | 'INSPECTION' | 'CONTRACT_END' | 'REMINDER' | 'OTHER';
  color: string;
  allDay: boolean;
}

export interface Task {
  id: number;
  propertyId: number | null;
  propertyName: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export interface TaskForm {
  propertyId: number | null;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DashboardSummary {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  pendingTasks: number;
  totalProperties: number;
  upcomingEvents: CalendarEvent[];
}
