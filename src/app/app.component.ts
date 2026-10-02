import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService } from './services/finance-store.service';
import { Budget, FamilyProfile, GoalDeposit, SavingGoal, Transaction } from './models/finance.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly store = inject(FinanceStoreService);
  data = this.store.snapshot;
  readonly categories = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Renda', 'Renda extra', 'Outros'];
  readonly today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  readonly monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date()).toLocaleUpperCase('pt-BR');
  isTransactionModalOpen = false;
  isBudgetModalOpen = false;
  isGoalModalOpen = false;
  isGoalContributionModalOpen = false;
  isProfileModalOpen = false;
  isUserPickerOpen = false;
  modalBackdropPressed = false;
  activeView: 'overview' | 'transactions' | 'budgets' | 'goals' = 'overview';
  selectedTransactionMember = 'all';
  selectedTransactionMonth = 'all';
  selectedBudgetMonth = 'all';
  selectedBudgetMember = 'all';
  selectedBudgetCategory = 'all';
  selectedGoalMonth = 'all';
  selectedGoalMember = 'all';
  selectedGoalStatus: 'all' | 'active' | 'completed' = 'all';
  draftTransaction = this.emptyTransaction();
  draftBudget = { category: 'Alimentação', limit: 0 };
  draftGoal = { name: '', target: 0, saved: 0, dueDate: '' };
  selectedGoal: SavingGoal | null = null;
  draftContribution = 0;
  draftFamily: FamilyProfile = { ...this.data.family };

  ngOnInit(): void {
    this.store.load().subscribe((data) => {
      this.data = data;
      this.draftFamily = { ...data.family };
    });
  }

  get transactions(): Transaction[] {
    return [...this.data.transactions].sort((left, right) => right.date.localeCompare(left.date));
  }

  get syncStatusLabel(): string {
    if (this.store.syncStatus === 'online') return 'Sincronizado com servidor';
    if (this.store.syncStatus === 'offline') return 'Somente cache local';
    return 'Conectando ao servidor';
  }

  get isSynced(): boolean {
    return this.store.syncStatus === 'online';
  }

  get transactionMembers(): string[] {
    return [...new Set(this.data.transactions.map(({ member }) => member))].sort((left, right) => left.localeCompare(right, 'pt-BR'));
  }

  get transactionMonths(): string[] {
    return [...new Set(this.data.transactions.map(({ date }) => date.slice(0, 7)))].sort((left, right) => right.localeCompare(left));
  }

  get filteredTransactions(): Transaction[] {
    return this.transactions.filter((transaction) =>
      transaction.type === 'expense' &&
      (this.selectedTransactionMember === 'all' || transaction.member === this.selectedTransactionMember) &&
      (this.selectedTransactionMonth === 'all' || transaction.date.startsWith(this.selectedTransactionMonth))
    );
  }

  get filteredTransactionTotal(): number {
    return this.filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  get budgetMonths(): string[] {
    return [...new Set(this.data.budgets.map(({ month }) => month))].sort((left, right) => right.localeCompare(left));
  }

  get budgetCategories(): string[] {
    return [...new Set(this.data.budgets.map(({ category }) => category))].sort((left, right) => left.localeCompare(right, 'pt-BR'));
  }

  get budgetMembers(): string[] {
    return [...new Set(this.data.budgets.map(({ member }) => member))].sort((left, right) => left.localeCompare(right, 'pt-BR'));
  }

  get filteredBudgetRows(): (Budget & { spent: number })[] {
    return this.data.budgets
      .filter((budget) =>
        (this.selectedBudgetMonth === 'all' || budget.month === this.selectedBudgetMonth) &&
        (this.selectedBudgetCategory === 'all' || budget.category === this.selectedBudgetCategory) &&
        (this.selectedBudgetMonth !== 'all' || this.selectedBudgetMember === 'all' || budget.member === this.selectedBudgetMember)
      )
      .map((budget) => ({
        ...budget,
        spent: this.data.transactions
          .filter((transaction) => transaction.type === 'expense' && transaction.member === budget.member && transaction.category === budget.category && transaction.date.startsWith(budget.month))
          .reduce((total, transaction) => total + transaction.amount, 0)
      }));
  }

  get filteredBudgetLimitTotal(): number {
    return this.filteredBudgetRows.reduce((total, budget) => total + budget.limit, 0);
  }

  get goalMonths(): string[] {
    return [...new Set(this.data.goals.map(({ dueDate }) => dueDate.slice(0, 7)))].sort((left, right) => right.localeCompare(left));
  }

  get filteredGoals(): (SavingGoal & { depositedAmount: number })[] {
    return this.goals.filter((goal) =>
      (this.selectedGoalMonth === 'all' || goal.dueDate.startsWith(this.selectedGoalMonth)) &&
      (this.selectedGoalStatus === 'all' || (this.selectedGoalStatus === 'active' ? goal.saved < goal.target : goal.saved >= goal.target))
    ).map((goal) => ({ ...goal, depositedAmount: this.selectedGoalMember === 'all' ? goal.saved : this.goalDepositedBy(goal, this.selectedGoalMember) }))
      .filter((goal) => this.selectedGoalMember === 'all' || goal.depositedAmount > 0);
  }

  get filteredGoalTotal(): number {
    return this.filteredGoals.reduce((total, goal) => total + goal.depositedAmount, 0);
  }

  get goalDepositMembers(): string[] {
    return [...new Set(this.goals.flatMap((goal) => this.goalDeposits(goal).map(({ member }) => member)))].sort((left, right) => left.localeCompare(right, 'pt-BR'));
  }

  goalDepositedBy(goal: SavingGoal, member: string): number {
    return this.goalDeposits(goal).filter((deposit) => deposit.member === member).reduce((total, deposit) => total + deposit.amount, 0);
  }

  get registeredUsers(): string[] {
    return [...new Set([...(this.data.users ?? []), this.data.family.memberName])]
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right, 'pt-BR'));
  }

  get budgets(): (Budget & { spent: number; color: string; share: string })[] {
    const colors = ['sage', 'coral', 'gold'];
    return this.data.budgets
      .filter((budget) => budget.month === this.currentMonth)
      .map((budget, index) => ({
        ...budget,
        spent: this.data.transactions
          .filter((transaction) => transaction.type === 'expense' && transaction.member === budget.member && transaction.category === budget.category && transaction.date.startsWith(budget.month))
          .reduce((total, transaction) => total + transaction.amount, 0),
        color: colors[index % colors.length],
        share: `${this.monthlyBudget ? Math.round((budget.limit / this.monthlyBudget) * 100) : 0}%`
      }));
  }

  get goals(): SavingGoal[] {
    return this.data.goals;
  }

  get monthlyBudget(): number {
    return this.data.budgets
      .filter((budget) => budget.month === this.currentMonth)
      .reduce((total, budget) => total + budget.limit, 0);
  }

  get income(): number {
    return this.currentMonthTransactions.filter(({ type }) => type === 'income').reduce((total, item) => total + item.amount, 0);
  }

  get expenses(): number {
    return this.currentMonthTransactions.filter(({ type }) => type === 'expense').reduce((total, item) => total + item.amount, 0);
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  get budgetUsagePercent(): number {
    return this.monthlyBudget ? Math.round((this.expenses / this.monthlyBudget) * 100) : 0;
  }

  get budgetUsageBarWidth(): number {
    return Math.min(100, this.budgetUsagePercent);
  }

  budgetProgress(budget: Budget & { spent: number }): number {
    return budget.limit ? Math.min(100, Math.round((budget.spent / budget.limit) * 100)) : 0;
  }

  budgetUsage(budget: Budget & { spent: number }): number {
    return budget.limit ? Math.round((budget.spent / budget.limit) * 100) : 0;
  }

  get budgetRemaining(): number {
    return Math.max(0, this.monthlyBudget - this.expenses);
  }

  openTransactionModal(): void {
    this.draftTransaction = this.emptyTransaction();
    this.isTransactionModalOpen = true;
  }

  showOverview(): void {
    this.activeView = 'overview';
    this.isUserPickerOpen = false;
  }

  showTransactions(): void {
    this.activeView = 'transactions';
    this.isUserPickerOpen = false;
  }

  showBudgets(): void {
    this.activeView = 'budgets';
    this.isUserPickerOpen = false;
  }

  showGoals(): void {
    this.activeView = 'goals';
    this.isUserPickerOpen = false;
  }

  onBudgetMonthChange(month: string): void {
    this.selectedBudgetMonth = month;
    if (month !== 'all') this.selectedBudgetMember = 'all';
  }

  switchUser(member: string): void {
    if (!this.registeredUsers.includes(member)) return;
    this.data = { ...this.data, family: { ...this.data.family, memberName: member } };
    this.isUserPickerOpen = false;
    this.persist();
  }

  startModalBackdropClick(event: MouseEvent): void {
    this.modalBackdropPressed = event.target === event.currentTarget;
  }

  closeModalFromBackdrop(event: MouseEvent, modal: 'transaction' | 'budget' | 'goal' | 'contribution' | 'profile'): void {
    const shouldClose = this.modalBackdropPressed && event.target === event.currentTarget;
    this.modalBackdropPressed = false;
    if (!shouldClose) return;

    if (modal === 'transaction') this.closeTransactionModal();
    if (modal === 'budget') this.isBudgetModalOpen = false;
    if (modal === 'goal') this.isGoalModalOpen = false;
    if (modal === 'contribution') this.closeGoalContributionModal();
    if (modal === 'profile') this.isProfileModalOpen = false;
  }

  formatMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, monthNumber - 1, 1));
  }

  openIncomeModal(): void {
    this.draftTransaction = { ...this.emptyTransaction(), type: 'income', category: 'Renda' };
    this.isTransactionModalOpen = true;
  }

  closeTransactionModal(): void {
    this.isTransactionModalOpen = false;
  }

  addTransaction(): void {
    if (!this.draftTransaction.description.trim() || this.draftTransaction.amount <= 0 || !this.draftTransaction.date) return;

    const transaction: Transaction = {
      ...this.draftTransaction,
      id: crypto.randomUUID(),
      description: this.draftTransaction.description.trim(),
      category: this.draftTransaction.category.trim(),
      member: this.data.family.memberName
    };
    this.data = { ...this.data, transactions: [transaction, ...this.data.transactions] };
    this.persist();
    this.closeTransactionModal();
  }

  openBudgetModal(): void {
    this.draftBudget = { category: 'Alimentação', limit: 0 };
    this.isBudgetModalOpen = true;
  }

  addBudget(): void {
    const category = this.draftBudget.category.trim();
    if (!category || this.draftBudget.limit <= 0) return;

    const existingBudget = this.data.budgets.find((budget) =>
      budget.member === this.data.family.memberName && budget.month === this.currentMonth && budget.category.toLocaleLowerCase('pt-BR') === category.toLocaleLowerCase('pt-BR')
    );
    const budgets = existingBudget
      ? this.data.budgets.map((budget) => budget.id === existingBudget.id ? { ...budget, limit: this.draftBudget.limit } : budget)
      : [...this.data.budgets, { id: crypto.randomUUID(), category, limit: this.draftBudget.limit, month: this.currentMonth, member: this.data.family.memberName }];
    this.data = { ...this.data, budgets };
    this.persist();
    this.isBudgetModalOpen = false;
  }

  removeBudget(id: string): void {
    this.data = { ...this.data, budgets: this.data.budgets.filter((budget) => budget.id !== id) };
    this.persist();
  }

  openGoalModal(): void {
    this.draftGoal = { name: '', target: 0, saved: 0, dueDate: '' };
    this.isGoalModalOpen = true;
  }

  addGoal(): void {
    if (!this.draftGoal.name.trim() || this.draftGoal.target <= 0 || !this.draftGoal.dueDate) return;

    const deposits: GoalDeposit[] = this.draftGoal.saved > 0
      ? [{ id: crypto.randomUUID(), member: this.data.family.memberName, amount: this.draftGoal.saved, date: this.currentDate() }]
      : [];
    const goal: SavingGoal = { ...this.draftGoal, id: crypto.randomUUID(), name: this.draftGoal.name.trim(), deposits };
    this.data = { ...this.data, goals: [...this.data.goals, goal] };
    this.persist();
    this.isGoalModalOpen = false;
  }

  removeGoal(id: string): void {
    this.data = { ...this.data, goals: this.data.goals.filter((goal) => goal.id !== id) };
    this.persist();
  }

  openGoalContributionModal(goal: SavingGoal): void {
    this.selectedGoal = goal;
    this.draftContribution = 0;
    this.isGoalContributionModalOpen = true;
  }

  closeGoalContributionModal(): void {
    this.isGoalContributionModalOpen = false;
    this.selectedGoal = null;
  }

  addGoalContribution(): void {
    if (!this.selectedGoal || this.draftContribution <= 0 || this.draftContribution > this.goalRemaining(this.selectedGoal)) return;

    const goalId = this.selectedGoal.id;
    this.data = {
      ...this.data,
      goals: this.data.goals.map((goal) => goal.id === goalId ? {
        ...goal,
        saved: goal.saved + this.draftContribution,
        deposits: [...this.goalDeposits(goal), {
          id: crypto.randomUUID(),
          member: this.data.family.memberName,
          amount: this.draftContribution,
          date: this.currentDate()
        }]
      } : goal)
    };
    this.persist();
    this.closeGoalContributionModal();
  }

  openProfileModal(): void {
    this.draftFamily = { ...this.data.family };
    this.isProfileModalOpen = true;
  }

  saveProfile(): void {
    const name = this.draftFamily.name.trim();
    const memberName = this.draftFamily.memberName.trim();
    if (!name || !memberName) return;

    this.data = { ...this.data, family: { name, memberName } };
    this.persist();
    this.isProfileModalOpen = false;
  }

  removeTransaction(id: string): void {
    this.data = { ...this.data, transactions: this.data.transactions.filter((transaction) => transaction.id !== id) };
    this.persist();
  }

  goalProgress(goal: SavingGoal): number {
    return goal.target ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
  }

  goalRemaining(goal: SavingGoal): number {
    return Math.max(0, goal.target - goal.saved);
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR') || 'MF';
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day));
  }

  formatFullDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private get currentMonthTransactions(): Transaction[] {
    return this.data.transactions.filter((transaction) => transaction.date.startsWith(this.currentMonth));
  }

  private get currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private persist(): void {
    this.store.save(this.data);
    this.data = this.store.snapshot;
  }

  private emptyTransaction(): Omit<Transaction, 'id' | 'member'> {
    const now = new Date();
    return {
      description: '',
      category: 'Alimentação',
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      amount: 0,
      type: 'expense'
    };
  }

  private goalDeposits(goal: SavingGoal): GoalDeposit[] {
    if (goal.deposits?.length) return goal.deposits;
    if (goal.saved <= 0) return [];
    return [{ id: `${goal.id}-initial`, member: this.data.family.memberName, amount: goal.saved, date: goal.dueDate }];
  }

  private currentDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
