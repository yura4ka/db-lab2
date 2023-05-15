import { z } from "zod";

export const validId = z.number().positive().int().min(1);
export const validString = z.string().trim().min(1);
export const validEmail = validString.email();
export const validUrl = validString.url();
export const validScore = z.number().positive().int().min(1).max(5);
