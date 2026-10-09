import { z } from "zod";

export const SignUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid university email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    role: z.enum(["student", "faculty"]).default("student"),
    confirmPassword: z.string(),
    universityId: z
      .string()
      .trim()
      .min(1, "University Student/Staff ID is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Sets the error directly on confirmPassword field
  });


export const SignInSchema = z.object({
  email: z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid university email address"),
  password: z
  .string()
  .min(8, "Password must be at least 8 characters"),
});

export type SignUpFormData = z.infer<typeof SignUpSchema>;
export type SignInFormData = z.infer<typeof SignInSchema>;