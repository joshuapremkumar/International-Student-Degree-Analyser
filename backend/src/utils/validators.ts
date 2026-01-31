import { z } from 'zod';

export const searchSchema = z.object({
  degree: z
    .string()
    .min(2, 'Degree name must be at least 2 characters')
    .max(100, 'Degree name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-().,]+$/,
      'Degree name contains invalid characters'
    )
    .trim(),
});

export type SearchInput = z.infer<typeof searchSchema>;
