import { z } from "zod";

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "independent_house", label: "Independent House" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
] as const;

export const ROOM_TYPES = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "dining", label: "Dining" },
  { value: "bathroom", label: "Bathroom" },
  { value: "balcony", label: "Balcony" },
  { value: "home_office", label: "Home Office" },
  { value: "pooja_room", label: "Pooja Room" },
  { value: "kids_room", label: "Kids' Room" },
  { value: "wardrobe", label: "Wardrobe" },
  { value: "other", label: "Other" },
] as const;

export const BUDGET_LEVELS = [
  { value: "essential", label: "Essential", hint: "Smart, cost-effective finishes" },
  { value: "premium", label: "Premium", hint: "Elevated materials and detailing" },
  { value: "luxury", label: "Luxury", hint: "Top-tier materials and bespoke work" },
  { value: "custom", label: "Custom", hint: "Tell us your own range" },
] as const;

export const propertyTypeEnum = z.enum([
  "apartment",
  "villa",
  "independent_house",
  "office",
  "retail",
  "other",
]);

export const roomTypeEnum = z.enum([
  "living_room",
  "bedroom",
  "kitchen",
  "dining",
  "bathroom",
  "balcony",
  "home_office",
  "pooja_room",
  "kids_room",
  "wardrobe",
  "other",
]);

export const budgetLevelEnum = z.enum([
  "essential",
  "premium",
  "luxury",
  "custom",
]);

export const roomInputSchema = z.object({
  room_type: roomTypeEnum,
  room_name: z.string().max(80).optional(),
});

/** Full payload validated authoritatively in the server action. */
export const createProjectSchema = z.object({
  name: z.string().min(2, "Give your project a name.").max(120),
  property_type: propertyTypeEnum,
  city: z.string().min(1, "Select a city."),
  address_line: z.string().max(200).optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a 6-digit pincode.")
    .optional()
    .or(z.literal("")),
  bhk: z.string().max(20).optional(),
  total_area: z
    .string()
    .regex(/^\d*\.?\d*$/, "Numbers only.")
    .optional()
    .or(z.literal("")),
  area_unit: z.enum(["sqft", "sqm"]).default("sqft"),
  budget_level: budgetLevelEnum,
  rooms: z.array(roomInputSchema).min(1, "Add at least one room."),
});

export type CreateProjectValues = z.infer<typeof createProjectSchema>;

export type CreateProjectState = {
  ok?: boolean;
  code?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
