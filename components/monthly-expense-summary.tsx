'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { compareMonthlyExpenses, MonthlyComparison } from '@/lib/expenseService';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface MonthlyExpenseSummaryProps {
  profileId: string;
}

export function MonthlyExpenseSummary({ profileId }: MonthlyExpenseSummaryProps) {
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkEndOfMonth = () => {
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return now.getDate() === lastDayOfMonth.getDate();
    };

    const fetchComparison = async () => {
      const today = new Date();
      const comparison = await compareMonthlyExpenses(
        profileId,
        today.getFullYear(),
        today.getMonth()
      );

      if (comparison) {
        setComparison(comparison);
        // Show notification only at the end of the month
        if (checkEndOfMonth()) {
          setShowNotification(true);
        }
      }
    };

    fetchComparison();
  }, [profileId]);

  if (!comparison) {
    return null;
  }

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const previousMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'MMMM yyyy');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {comparison.hasSaved ? (
              <TrendingDown className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-red-500" />
            )}
            Monthly Expense Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Month ({currentMonth})</p>
                <p className="text-2xl font-bold">${comparison.currentMonthTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Previous Month ({previousMonth})</p>
                <p className="text-2xl font-bold">${comparison.previousMonthTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              comparison.hasSaved ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {comparison.hasSaved ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className={`font-medium ${
                  comparison.hasSaved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {comparison.hasSaved
                    ? `You saved $${comparison.difference.toFixed(2)} this month!`
                    : `You spent $${comparison.difference.toFixed(2)} more this month`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {comparison.hasSaved
                    ? 'Great job on reducing your expenses!'
                    : 'Try to reduce your expenses next month'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showNotification} onOpenChange={setShowNotification}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {comparison.hasSaved ? '💰 Monthly Savings Achievement!' : '📊 Monthly Expense Alert'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                {comparison.hasSaved
                  ? `Congratulations! You saved $${comparison.difference.toFixed(2)} compared to last month.`
                  : `You spent $${comparison.difference.toFixed(2)} more than last month. Try to save more next month!`}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium">Current Month</p>
                  <p className="text-lg">${comparison.currentMonthTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Previous Month</p>
                  <p className="text-lg">${comparison.previousMonthTotal.toFixed(2)}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
