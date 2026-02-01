import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const row = await ctx.db.query("likes").first();
    return row?.count ?? 0;
  },
});

export const increment = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const row = await ctx.db.query("likes").first();
    if (row) {
      await ctx.db.patch(row._id, { count: row.count + 1 });
    } else {
      await ctx.db.insert("likes", { count: 1 });
    }
    return null;
  },
});
