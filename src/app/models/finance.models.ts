export interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  member: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
  member: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  dueDate: string;
  deposits?: GoalDeposit[];
}

export interface GoalDeposit {
  id: string;
  member: string;
  amount: number;
  date: string;
}

export interface FamilyProfile {
  name: string;
  memberName: string;
}

export interface FinanceData {
  family: FamilyProfile;
  users: string[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingGoal[];
}