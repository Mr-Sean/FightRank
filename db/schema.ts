import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  promotionId: integer("promotion_id").references(() => promotions.id).notNull(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fights = pgTable("fights", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  fighter1: text("fighter1").notNull(),
  fighter2: text("fighter2").notNull(),
  weightClass: text("weight_class"),
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

export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
}));

export const promotionsRelations = relations(promotions, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  promotion: one(promotions, {
    fields: [events.promotionId],
    references: [promotions.id],
  }),
  fights: many(fights),
}));

export const fightsRelations = relations(fights, ({ one, many }) => ({
  event: one(events, {
    fields: [fights.eventId],
    references: [events.id],
  }),
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

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
