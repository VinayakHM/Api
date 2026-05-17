import { z } from "zod";

export const postSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const postListSchema = z.array(postSchema);

export const newPostSchema = postSchema.omit({ id: true });

export type Post = z.infer<typeof postSchema>;
export type NewPost = z.infer<typeof newPostSchema>;
