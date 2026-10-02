import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, Subject, catchError, concatMap, of, switchMap, tap } from 'rxjs';
import { FinanceData } from '../models/finance.models';

const STORAGE_KEY = 'ninho-finance-data';
const API_URL = 'http://localhost:8080/api/finance';

const emptyFinanceData = (): FinanceData => ({
  family: { name: 'Minha família', memberName: 'Membro' },
  users: ['Membro'],
  transactions: [],
  budgets: [],
  goals: []
});

@Injectable({ providedIn: 'root' })
export class FinanceStoreService {
  private data = this.readCache();
  private readonly saveQueue = new Subject<FinanceData>();
  syncStatus: 'loading' | 'online' | 'offline' = 'loading';

  constructor(private readonly http: HttpClient) {
    this.saveQueue.pipe(
      concatMap((data) => this.http.put<FinanceData>(API_URL, data).pipe(
        tap(() => this.syncStatus = 'online'),
        catchError((error: unknown) => {
          this.syncStatus = 'offline';
          console.error('Não foi possível sincronizar os dados financeiros com a API.', error);
          return EMPTY;
        })
      ))
    ).subscribe();
  }

  get snapshot(): FinanceData {
    return this.data;
  }

  load(): Observable<FinanceData> {
    const cachedData = this.data;
    return this.http.get<FinanceData>(API_URL).pipe(
      switchMap((remoteData) => {
        if (this.isEmpty(remoteData) && !this.isEmpty(cachedData)) {
          return this.http.put<FinanceData>(API_URL, cachedData).pipe(
            tap(() => this.syncStatus = 'online'),
            catchError(() => {
              this.syncStatus = 'offline';
              return of(cachedData);
            })
          );
        }

        this.syncStatus = 'online';
        return of(remoteData);
      }),
      tap((data) => this.replace(data)),
      catchError(() => {
        this.syncStatus = 'offline';
        return of(this.data);
      })
    );
  }

  save(data: FinanceData): void {
    this.replace(data);
    this.saveQueue.next(this.data);
  }

  private replace(data: FinanceData): void {
    this.data = {
      ...data,
      users: [...new Set([...(data.users ?? []), data.family.memberName])].filter(Boolean)
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  private readCache(): FinanceData {
    if (typeof localStorage === 'undefined') return emptyFinanceData();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return emptyFinanceData();

      const parsed = JSON.parse(stored) as Partial<FinanceData>;
      if (!parsed.family || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.budgets) || !Array.isArray(parsed.goals)) {
        return emptyFinanceData();
      }

      const budgets = parsed.budgets.map((budget) => ({ ...budget, member: budget.member || parsed.family!.memberName }));
      const goals = parsed.goals.map((goal) => ({
        ...goal,
        deposits: goal.deposits ?? (goal.saved > 0 ? [{
          id: `${goal.id}-legacy`,
          member: parsed.family!.memberName,
          amount: goal.saved,
          date: goal.dueDate
        }] : [])
      }));
      const users = [...new Set([
        ...(Array.isArray(parsed.users) ? parsed.users : []),
        parsed.family.memberName,
        ...parsed.transactions.map(({ member }) => member),
        ...budgets.map(({ member }) => member),
        ...goals.flatMap(({ deposits }) => deposits?.map(({ member }) => member) ?? [])
      ])].filter(Boolean);

      return { ...parsed, family: parsed.family, users, transactions: parsed.transactions, budgets, goals };
    } catch {
      return emptyFinanceData();
    }
  }

  private isEmpty(data: FinanceData): boolean {
    return data.transactions.length === 0 && data.budgets.length === 0 && data.goals.length === 0 &&
      data.family.name === 'Minha família' && data.family.memberName === 'Membro' &&
      data.users.every((user) => user === 'Membro');
  }
}