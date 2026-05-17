import { z } from "zod";

export const geoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

export const addressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: geoSchema,
});

export const companySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  address: addressSchema,
  phone: z.string(),
  website: z.string(),
  company: companySchema,
});

export const userListSchema = z.array(userSchema);

export const newUserSchema = userSchema.omit({id:true}).partial({
    address:true,
    phone:true,
    website:true,
    company:true,
});

export type User = z.infer<typeof userSchema>;
export type NewUser = z.infer<typeof newUserSchema>;
