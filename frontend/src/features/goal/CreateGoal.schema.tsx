import { z } from 'zod'

export const CreateGoalInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).trim(),
  description: z.string().max(1000).trim().optional(),
  startDate: z.date().transform(d => d.getTime()), 
  endDate: z.date().transform(d => d.getTime()),
  categoryId: z.number(),
})