import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

// Only self-serve roles — never admin/staff-privileged (enforced again in the
// DB trigger, which ignores anything outside this set).
export const SIGNUP_ROLES = [
  { value: "customer", label: "Homeowner", hint: "I want my home designed" },
  { value: "designer", label: "Interior designer", hint: "I design for clients" },
  { value: "vendor", label: "Vendor / supplier", hint: "I sell products or materials" },
  { value: "contractor", label: "Contractor", hint: "I execute projects on site" },
] as const;

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  role: z.enum(["customer", "designer", "vendor", "contractor"]).default("customer"),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(80).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

export type AuthState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
