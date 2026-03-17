const { z } = require("zod");

// Auth

exports.registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

exports.loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

//Videos 
// Imported by videoRoutes.js

exports.createVideoSchema = z.object({
  title:       z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  duration:    z.number({ required_error: "Duration is required" })
                 .min(1, "Duration must be at least 1 second")
                 .max(300, "Video must not exceed 300 seconds (5 minutes)"),
  videoURL:    z.string().optional(),
  status:      z.enum(["public", "private"]).optional(),
});

//Reviews
// Imported by reviewRoutes.js

exports.reviewSchema = z.object({
  rating:  z.number({ required_error: "Rating is required" })
             .int("Rating must be a whole number")
             .min(1, "Rating must be at least 1")
             .max(5, "Rating cannot exceed 5"),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional(),
});