'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, getPaymentMethodStats } from '@/lib/expenseService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

interface PaymentMethodsChartProps {
  expenses: Expense[];
}

// Light theme colors
const LIGHT_COLORS = {
  cash: 'rgba(52, 211, 153, 0.8)',  // Green
  debit: 'rgba(59, 130, 246, 0.8)', // Blue
  credit: 'rgba(239, 68, 68, 0.8)', // Red
};

// Dark theme colors - slightly brighter for better visibility
const DARK_COLORS = {
  cash: 'rgba(74, 222, 128, 0.8)',  // Brighter Green
  debit: 'rgba(96, 165, 250, 0.8)', // Brighter Blue
  credit: 'rgba(248, 113, 113, 0.8)', // Brighter Red
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent,
  fill
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill={fill === 'white' ? 'black' : 'white'}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export function PaymentMethodsChart({ expenses }: PaymentMethodsChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getPaymentMethodStats> | null>(null);
  const { theme } = useTheme();
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    const currentStats = getPaymentMethodStats(expenses);
    const data = [
      { name: 'Cash', value: currentStats.amounts.cash },
      { name: 'Debit', value: currentStats.amounts.debit },
      { name: 'Credit', value: currentStats.amounts.credit },
    ].filter(item => item.value > 0);
    
    setChartData(data);
    setStats(currentStats);
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No expenses recorded yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[entry.name.toLowerCase() as keyof typeof colors]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                itemStyle={{
                  color: theme === 'dark' ? 'white' : 'black'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors.cash }}
                />
                <span className="text-sm font-medium">Cash</span>
              </div>
              <p className="text-lg font-semibold">${stats.amounts.cash.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {stats.percentages.cash.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors.debit }}
                />
                <span className="text-sm font-medium">Debit</span>
              </div>
              <p className="text-lg font-semibold">${stats.amounts.debit.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {stats.percentages.debit.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors.credit }}
                />
                <span className="text-sm font-medium">Credit</span>
              </div>
              <p className="text-lg font-semibold">${stats.amounts.credit.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {stats.percentages.credit.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
