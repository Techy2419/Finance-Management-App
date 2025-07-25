'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isWithinInterval, startOfMonth, endOfMonth, set } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Timestamp } from 'firebase/firestore';
import { PaymentMethod } from '@/lib/expenseService';
import { useExpense } from '@/contexts/ExpenseContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform(Number),
  memo: z.string().optional(),
  date: z.date(),
  paymentMethod: z.enum(['cash', 'debit', 'credit'] as const).default('cash'),
});

export function ExpenseForm() {
  const { addExpense, selectedYear, selectedMonth } = useExpense();
  const { activeProfile } = useProfile();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate the default date as the first day of the selected month
  const defaultDate = new Date(selectedYear, selectedMonth, 1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      memo: '',
      date: defaultDate,
      paymentMethod: 'cash',
    },
  });

  // Reset the date when selected month/year changes
  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    form.setValue('date', newDate);
  }, [selectedYear, selectedMonth, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!activeProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No active profile selected",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addExpense({
        profileId: activeProfile.id,
        amount: values.amount,
        memo: values.memo,
        date: Timestamp.fromDate(values.date),
        paymentMethod: values.paymentMethod,
      });

      toast({
        title: "Success",
        description: "Expense added successfully",
      });

      // Reset form but keep the date within the selected month
      form.reset({
        amount: '',
        memo: '',
        date: new Date(selectedYear, selectedMonth, 1),
        paymentMethod: 'cash',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add expense",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate the valid date range for the selected month
  const selectedMonthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  const selectedMonthEnd = endOfMonth(selectedMonthStart);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  placeholder="0.00" 
                  type="number" 
                  step="0.01"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memo</FormLabel>
              <FormControl>
                <Input placeholder="Enter memo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      return !isWithinInterval(date, {
                        start: selectedMonthStart,
                        end: selectedMonthEnd,
                      });
                    }}
                    defaultMonth={selectedMonthStart}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select a date in {format(selectedMonthStart, 'MMMM yyyy')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Expense
        </Button>
      </form>
    </Form>
  );
}
