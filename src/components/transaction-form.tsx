'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import z from 'zod';

const transactionFormSchema = z.object({
  transactionType: z.enum(['income', 'expense']),
  categoryId: z.coerce.number().positive('Please select a category'),
  transactionDate: z.coerce
    .date()
    .max(addDays(new Date(), 1), 'Transaction date cannot be in the future'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(300, 'Description must be at most 300 characters'),
});

type FormFields = z.input<typeof transactionFormSchema>;
type FormValues = z.output<typeof transactionFormSchema>;

export const TransactionForm = () => {
  const form = useForm<FormFields>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionType: 'income',
      categoryId: 0,
      transactionDate: new Date(),
      amount: 0,
      description: '',
    },
  });

  return (
    <form>
      <label>
        Amount:
        <input type="number" name="amount" />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};
