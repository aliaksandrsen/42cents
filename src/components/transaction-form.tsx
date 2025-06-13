'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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

type Inputs = z.input<typeof transactionFormSchema>; // сырые из инпутов
type Outputs = z.output<typeof transactionFormSchema>;

export const TransactionForm = () => {
  const form = useForm<Inputs>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionType: 'income',
      categoryId: 0,
      transactionDate: new Date(),
      amount: 0,
      description: '',
    },
  });

  const handleSubmit: SubmitHandler<Inputs> = (raw) => {
    const data: Outputs = transactionFormSchema.parse(raw);
    console.log('parsed', data);
    // data.categoryId - number
    // data.transactionDate - Date
    // data.amount - number
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset className="grid grid-cols-2 gap-y-5 gap-x-2">
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(newValue) => {
                        field.onChange(newValue);
                        form.setValue('categoryId', 0);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent></SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </fieldset>
      </form>
    </Form>
  );
};
