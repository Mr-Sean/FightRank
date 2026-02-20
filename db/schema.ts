import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  promotion: text("promotion").notNull().default("UFC"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fights = pgTable("fights", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  fighter1: text("fighter1").notNull(),
  fighter2: text("fighter2").notNull(),
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

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fightId: integer("fight_id").references(() => fights.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventsRelations = relations(events, ({ many }) => ({
  fights: many(fights),
}));

export const fightsRelations = relations(fights, ({ one, many }) => ({
  event: one(events, {
    fields: [fights.eventId],
    references: [events.id],
  }),
  ratings: many(ratings),
  comments: many(comments),
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

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  fight: one(fights, {
    fields: [comments.fightId],
    references: [fights.id],
  }),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments);
export const selectCommentSchema = createSelectSchema(comments);
export type InsertComment = typeof comments.$inferInsert;
export type SelectComment = typeof comments.$inferSelect;