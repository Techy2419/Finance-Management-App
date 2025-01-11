'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

interface MonthYearSelectorProps {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

// Generate years from 2020 to current year + 1
const YEARS = Array.from(
  { length: new Date().getFullYear() - 2020 + 2 },
  (_, i) => 2020 + i
);

export function MonthYearSelector({
  selectedYear = new Date().getFullYear(),
  selectedMonth = new Date().getMonth(),
  onYearChange,
  onMonthChange,
}: MonthYearSelectorProps) {
  // Ensure selectedMonth and selectedYear are valid numbers
  const validMonth = typeof selectedMonth === 'number' ? selectedMonth : new Date().getMonth();
  const validYear = typeof selectedYear === 'number' ? selectedYear : new Date().getFullYear();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Select
          value={validMonth.toString()}
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue>
              {MONTHS[validMonth]?.label || 'Select month'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select
          value={validYear.toString()}
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue>
              {validYear.toString()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
