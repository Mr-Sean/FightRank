import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fights = pgTable("fights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fighter1: text("fighter1").notNull(),
  fighter2: text("fighter2").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fightId: integer("fight_id").references(() => fights.id).notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userFightUnique: unique().on(table.userId, table.fightId),
}));

export const fightsRelations = relations(fights, ({ many }) => ({
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  fight: one(fights, {
    fields: [ratings.fightId],
    references: [fights.id],
  }),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;