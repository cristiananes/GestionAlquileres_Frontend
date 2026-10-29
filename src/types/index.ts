export interface Property {
  purchasePrice?: number | null;
  purchaseCosts?: number | null;
  renovationCosts?: number | null;
  furnitureCosts?: number | null;
  cashInvested?: number | null;
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
  imageUrl: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyForm {
  purchasePrice?: number | null;
  purchaseCosts?: number | null;
  renovationCosts?: number | null;
  furnitureCosts?: number | null;
  cashInvested?: number | null;
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
  imageUrl: string;
}

export interface Income {
  occurrenceId?: number | null;
  archived?: boolean;
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
  clientRequestId?: string;
  propertyId: number | null;
  amount: number | null;
  description: string;
  incomeDate: string;
  incomeType: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'OTHER';
  paymentMethod: 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';
}

export interface Expense {
  occurrenceId?: number | null;
  archived?: boolean;
  id: number;
  propertyId: number | null;
  propertyName: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: 'REPAIR' | 'MAINTENANCE' | 'TAXES' | 'UTILITIES' | 'INSURANCE' | 'CLEANING' | 'COMMISSION' | 'LEGAL' | 'ADMINISTRATION' | 'INVESTMENT' | 'FINANCING' | 'OTHER';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseForm {
  clientRequestId?: string;
  propertyId: number | null;
  amount: number | null;
  description: string;
  expenseDate: string;
  category: 'REPAIR' | 'MAINTENANCE' | 'TAXES' | 'UTILITIES' | 'INSURANCE' | 'CLEANING' | 'COMMISSION' | 'LEGAL' | 'ADMINISTRATION' | 'INVESTMENT' | 'FINANCING' | 'OTHER';
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
  clientRequestId?: string;
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

export interface ContactMessageForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface DashboardSummary {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  pendingTasks: number;
  totalProperties: number;
  upcomingEvents: CalendarEvent[];
}

export type MovementKind = 'INCOME' | 'EXPENSE';
export type Frequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export interface RecurringRuleForm {
  propertyId: number | null; kind: MovementKind; frequency: Frequency; amount: number;
  description: string; startDate: string; endDate: string | null;
  incomeType: Income['incomeType']; paymentMethod: Income['paymentMethod']; category: Expense['category'];
  clientRequestId?: string;
}
export interface RecurringRule extends RecurringRuleForm { id: number; propertyName: string; archived: boolean }
export interface Occurrence {
  ruleId: number; propertyId: number | null; propertyName: string; kind: MovementKind;
  description: string; dueDate: string; amount: number; paidAmount: number; remaining: number;
  status: 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'PAID';
}
export interface ActualReturn {
  from: string | null; to: string | null; grossIncome: number; deposits: number;
  operatingExpenses: number; netIncome: number; cashFlow: number;
  grossReturn: number | null; netReturn: number | null; cashReturn: number | null;
}
export interface InvestmentSummary {
  totalInvestment: number | null; cashInvested: number | null;
  period: ActualReturn; month: ActualReturn; year: ActualReturn;
  forecast: { from: string; to: string; annualGross: number; annualNet: number; annualCashFlow: number;
    monthlyGross: number; monthlyNet: number; grossAnnualReturn: number | null; netAnnualReturn: number | null;
    grossMonthlyReturn: number | null; netMonthlyReturn: number | null; };
}
export interface LeaseForm {
  tenantName: string; tenantEmail: string; tenantPhone: string; startDate: string; endDate: string | null;
  monthlyRent: number; depositAmount: number | null; paymentDay: number; generateRecurrence: boolean; clientRequestId?: string;
}
export interface Lease extends LeaseForm { id: number; propertyId: number; recurringRuleId: number | null; archived: boolean }
export interface PropertyDocument {
  id: number; propertyId: number; incomeId: number | null; expenseId: number | null;
  filename: string; contentType: string; size: number; archived: boolean; createdAt: string;
}
