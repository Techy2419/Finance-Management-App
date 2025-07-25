'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/components/expense-form';
import { ExpenseViewControls } from '@/components/expense-view-controls';
import { useExpense } from '@/contexts/ExpenseContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { MonthYearSelector } from '@/components/month-year-selector';
import { PaymentMethodsChart } from '@/components/payment-methods-chart';
import { MonthlyExpenseSummary } from '@/components/monthly-expense-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpensesPage() {
  const { expenses, selectedYear, selectedMonth, setSelectedMonth, setSelectedYear, refreshExpenses } = useExpense();
  const { activeProfile } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (!activeProfile) {
      router.push('/profiles');
    }
  }, [user, activeProfile, router]);

  useEffect(() => {
    if (activeProfile) {
      refreshExpenses();
    }
  }, [activeProfile, selectedMonth, selectedYear, refreshExpenses]);

  if (!user || !activeProfile) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/profiles')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Expenses</h1>
        </div>
        <div className="flex items-center gap-4">
          <MonthYearSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>

          <PaymentMethodsChart expenses={expenses} />
          
          {activeProfile?.id && <MonthlyExpenseSummary profileId={activeProfile.id} />}
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseViewControls expenses={expenses} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
