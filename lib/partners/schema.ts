import { z } from "zod";

export const programEnum = z.enum([
  "execution",
  "design_studio",
  "affiliate",
  "education",
]);

/**
 * Partner application. Validated on the client for UX and again in the server
 * action (authoritative) before it reaches `public.partner_applications`.
 */
export const partnerApplicationSchema = z.object({
  program: programEnum,
  full_name: z.string().min(2, "Please enter your name.").max(120),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .min(10, "Enter a valid phone number.")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number."),
  city: z.string().min(1, "Please select your city."),
  company: z.string().max(160).optional().or(z.literal("")),
  website: z.string().max(200).optional().or(z.literal("")),
  experience_years: z
    .string()
    .regex(/^\d{0,2}$/, "Years only.")
    .optional()
    .or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export type PartnerApplicationValues = z.infer<typeof partnerApplicationSchema>;

export type PartnerFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
