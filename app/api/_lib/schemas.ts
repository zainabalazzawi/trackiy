import { z } from "zod";

const trimmedString = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const optionalTrimmedString = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"], {
  errorMap: () => ({ message: "Priority must be LOW, MEDIUM, or HIGH" }),
});
export const ProjectTypeSchema = z.enum(["TEAM_MANAGED", "COMPANY_MANAGED"], {
  errorMap: () => ({ message: "Type must be TEAM_MANAGED or COMPANY_MANAGED" }),
});
export const ProjectTemplateSchema = z.enum(["KANBAN", "CUSTOMER_SERVICE"], {
  errorMap: () => ({ message: "Template must be KANBAN or CUSTOMER_SERVICE" }),
});
export const ProjectCategorySchema = z.enum(["SERVICE", "SOFTWARE"], {
  errorMap: () => ({ message: "Category must be SERVICE or SOFTWARE" }),
});

export const CreateProjectSchema = z.object({
  name: trimmedString(80, "Project name"),
  key: trimmedString(10, "Project key").regex(
    /^[A-Za-z][A-Za-z0-9]*$/,
    "Project key must start with a letter and contain only letters and digits"
  ),
  type: ProjectTypeSchema,
  template: ProjectTemplateSchema,
  category: ProjectCategorySchema,
  memberIds: z.array(z.string().min(1, "Member id cannot be empty")).default([]),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const CreateTicketSchema = z.object({
  title: trimmedString(200, "Title"),
  description: optionalTrimmedString(10_000, "Description"),
  priority: PrioritySchema.optional(),
  assigneeId: z.string().min(1, "Assignee id cannot be empty").nullable().optional(),
  labels: z.array(z.string().min(1, "Label cannot be empty")).optional(),
});
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const UpdateTicketSchema = z
  .object({
    title: trimmedString(200, "Title").optional(),
    description: z
      .string()
      .max(10_000, "Description must be at most 10000 characters")
      .nullable()
      .optional(),
    priority: PrioritySchema.optional(),
    assigneeId: z.string().min(1, "Assignee id cannot be empty").nullable().optional(),
    labels: z.array(z.string().min(1, "Label cannot be empty")).optional(),
    statusId: z.string().min(1, "Status id cannot be empty").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

export const CreateColumnSchema = z.object({
  name: trimmedString(60, "Column name"),
});
export type CreateColumnInput = z.infer<typeof CreateColumnSchema>;

export const UpdateColumnSchema = z.object({
  name: trimmedString(60, "Column name"),
  order: z
    .number({ invalid_type_error: "Order must be a number" })
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .optional(),
});
export type UpdateColumnInput = z.infer<typeof UpdateColumnSchema>;

export const AddMembersSchema = z.object({
  memberIds: z
    .array(z.string().min(1, "Member id cannot be empty"))
    .min(1, "At least one member is required"),
});
export type AddMembersInput = z.infer<typeof AddMembersSchema>;

export const SendInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});
export type SendInviteInput = z.infer<typeof SendInviteSchema>;

export const CreateCommentSchema = z.object({
  content: trimmedString(5_000, "Comment"),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema = z.object({
  content: trimmedString(5_000, "Comment"),
});
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;

export const TypingBodySchema = z.object({
  ticketId: z.string().min(1, "ticketId is required"),
  fieldId: z.string().min(1, "fieldId is required"),
});
export type TypingBodyInput = z.infer<typeof TypingBodySchema>;

export const TypingQuerySchema = z.object({
  ticketId: z.string().min(1, "ticketId is required"),
  fieldId: z.string().min(1, "fieldId is required"),
});
export type TypingQueryInput = z.infer<typeof TypingQuerySchema>;

export const SearchTicketsQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(200, "Search query must be at most 200 characters"),
});
export type SearchTicketsQueryInput = z.infer<typeof SearchTicketsQuerySchema>;

export const SignupSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
});
export type SignupInput = z.infer<typeof SignupSchema>;
