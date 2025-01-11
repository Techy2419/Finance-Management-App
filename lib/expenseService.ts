import { firestore } from '@/lib/firebase';
import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  Query,
  DocumentData
} from 'firebase/firestore';

export type PaymentMethod = 'cash' | 'debit' | 'credit';

export interface Expense {
  id?: string;
  profileId: string;
  amount: number;
  memo?: string;
  date: Timestamp;
  paymentMethod: PaymentMethod;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

const PROFILES_COLLECTION = 'profiles';

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const expenseData = {
      ...expense,
      paymentMethod: expense.paymentMethod || 'cash', // Default to cash
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const profileDoc = doc(firestore, PROFILES_COLLECTION, expense.profileId);
    const expensesCollection = collection(profileDoc, 'expenses');
    const docRef = await addDoc(expensesCollection, expenseData);

    return {
      id: docRef.id,
      ...expense,
    } as Expense;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

export async function getExpenses(
  profileId: string,
  sortField: SortField = 'date',
  sortOrder: SortOrder = 'desc',
  startDate?: Date,
  endDate?: Date
) {
  try {
    const profileDoc = doc(firestore, PROFILES_COLLECTION, profileId);
    const expensesCollection = collection(profileDoc, 'expenses');
    
    let q: Query<DocumentData> = query(
      expensesCollection,
      orderBy(sortField, sortOrder)
    );

    // Add date range filter if provided
    if (startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[];
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
}

export async function updateExpense(
  profileId: string,
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'profileId'>>
) {
  try {
    const profileDoc = doc(firestore, PROFILES_COLLECTION, profileId);
    const expenseRef = doc(collection(profileDoc, 'expenses'), expenseId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(expenseRef, updateData);
    return {
      id: expenseId,
      ...updates,
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(profileId: string, expenseId: string) {
  try {
    const profileDoc = doc(firestore, PROFILES_COLLECTION, profileId);
    const expenseRef = doc(collection(profileDoc, 'expenses'), expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

export function getPaymentMethodStats(expenses: Expense[]) {
  const stats = {
    cash: 0,
    debit: 0,
    credit: 0
  };

  expenses.forEach(expense => {
    stats[expense.paymentMethod] += expense.amount;
  });

  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  
  return {
    amounts: stats,
    percentages: {
      cash: total > 0 ? (stats.cash / total) * 100 : 0,
      debit: total > 0 ? (stats.debit / total) * 100 : 0,
      credit: total > 0 ? (stats.credit / total) * 100 : 0
    },
    total
  };
}

const EXPENSES_COLLECTION = 'expenses';

export interface MonthlyComparison {
  currentMonthTotal: number;
  previousMonthTotal: number;
  difference: number;
  hasSaved: boolean;
}

export async function getMonthlyExpenses(profileId: string, year: number, month: number): Promise<number> {
  const profileRef = doc(firestore, PROFILES_COLLECTION, profileId);
  const expensesRef = collection(profileRef, EXPENSES_COLLECTION);
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const q = query(
    expensesRef,
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate))
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
}

export async function compareMonthlyExpenses(
  profileId: string,
  year: number,
  month: number
): Promise<MonthlyComparison | null> {
  try {
    const currentMonthTotal = await getMonthlyExpenses(profileId, year, month);
    const previousMonthTotal = await getMonthlyExpenses(profileId, year, month - 1);
    
    // Only compare if we have data for both months
    if (previousMonthTotal === 0) {
      return null;
    }

    const difference = previousMonthTotal - currentMonthTotal;
    const hasSaved = difference > 0;

    return {
      currentMonthTotal,
      previousMonthTotal,
      difference: Math.abs(difference),
      hasSaved
    };
  } catch (error) {
    console.error('Error comparing monthly expenses:', error);
    return null;
  }
}
