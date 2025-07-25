'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Expense } from '@/lib/expenseService';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { useExpense } from '@/contexts/ExpenseContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Timestamp } from 'firebase/firestore';

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses = [] }: ExpenseListProps) {
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const { removeExpense } = useExpense();

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => {
    if (!expense) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const description = expense.memo?.toLowerCase() || '';
    const paymentMethod = expense.paymentMethod?.toLowerCase() || '';
    const amount = expense.amount?.toString() || '';

    return description.includes(searchLower) ||
           amount.includes(searchTerm) ||
           paymentMethod.includes(searchLower);
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (!a || !b) return 0;
    
    const aValue = a[sortField as keyof Expense];
    const bValue = b[sortField as keyof Expense];
    
    if (!aValue || !bValue) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (aValue instanceof Timestamp && bValue instanceof Timestamp) {
      return sortOrder === 'asc' 
        ? aValue.toMillis() - bValue.toMillis()
        : bValue.toMillis() - aValue.toMillis();
    }
    
    return 0;
  });

  const formatDate = (date: Timestamp) => {
    if (!date || !(date instanceof Timestamp)) {
      return 'Invalid date';
    }
    return format(date.toDate(), 'MMM d, yyyy');
  };

  const handleDelete = (expenseId: string) => {
    if (expenseId) {
      removeExpense(expenseId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={sortField}
          onValueChange={setSortField}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="paymentMethod">Payment Method</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.memo || '-'}</TableCell>
                  <TableCell>{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          // Handle edit functionality
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => expense.id && handleDelete(expense.id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this expense? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => expense.id && handleDelete(expense.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}