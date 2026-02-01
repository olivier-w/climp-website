import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  likes: defineTable({ count: v.number() }),
});
