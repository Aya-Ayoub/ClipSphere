const { z } = require("zod");

exports.updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  avatarKey: z.string().optional(),
});

exports.preferencesSchema = z.object({
  inApp: z
    .object({
      followers: z.boolean().optional(),
      comments: z.boolean().optional(),
      likes: z.boolean().optional(),
      tips: z.boolean().optional(),
    })
    .optional(),

  email: z
    .object({
      followers: z.boolean().optional(),
      comments: z.boolean().optional(),
      likes: z.boolean().optional(),
      tips: z.boolean().optional(),
    })
    .optional(),
});