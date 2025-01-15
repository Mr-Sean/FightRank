import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { setupAuth } from "./auth";
import { eq, and, desc, sql } from "drizzle-orm";
import { fights, ratings, comments, users } from "@db/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Authentication required");
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes first
  setupAuth(app);

  // Basic health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Fights routes
  app.post("/api/fights", isAuthenticated, async (req, res) => {
    try {
      const { title, fighter1, fighter2, date, promotion } = req.body;
      const [newFight] = await db
        .insert(fights)
        .values({
          title,
          fighter1,
          fighter2,
          date: new Date(date),
          promotion,
        })
        .returning();
      res.json(newFight);
    } catch (error) {
      console.error("Failed to create fight:", error);
      res.status(500).send("Failed to create fight");
    }
  });

  app.get("/api/fights", async (req, res) => {
    try {
      const userId = req.user?.id;

      // Get all fights with their average rating
      const fightsWithRatings = await db
        .select({
          id: fights.id,
          title: fights.title,
          fighter1: fights.fighter1,
          fighter2: fights.fighter2,
          promotion: fights.promotion,
          date: fights.date,
          averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
          userRating: sql<number | null>`
            MAX(CASE 
              WHEN ${ratings.userId} = ${userId} THEN ${ratings.rating}
              ELSE NULL 
            END)
          `,
        })
        .from(fights)
        .leftJoin(ratings, eq(fights.id, ratings.fightId))
        .groupBy(fights.id, fights.title, fights.fighter1, fights.fighter2, fights.promotion, fights.date)
        .orderBy(desc(fights.date));

      res.json(fightsWithRatings);
    } catch (error) {
      console.error("Failed to fetch fights:", error);
      res.status(500).send("Failed to fetch fights");
    }
  });

  // Get comments for a specific fight
  app.get("/api/fights/:id/comments", async (req, res) => {
    try {
      const fightId = parseInt(req.params.id);
      const fightComments = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          userId: comments.userId,
          username: users.username,
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.fightId, fightId))
        .orderBy(desc(comments.createdAt));

      res.json(fightComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      res.status(500).send("Failed to fetch comments");
    }
  });

  // Create a new comment
  app.post("/api/comments", isAuthenticated, async (req, res) => {
    try {
      const { fightId, content } = req.body;
      const userId = req.user!.id;

      const [newComment] = await db
        .insert(comments)
        .values({
          userId,
          fightId,
          content,
        })
        .returning();

      res.json(newComment);
    } catch (error) {
      console.error("Failed to create comment:", error);
      res.status(500).send("Failed to create comment");
    }
  });

  // Ratings routes
  app.post("/api/ratings", isAuthenticated, async (req, res) => {
    try {
      const { fightId, rating } = req.body;
      const userId = req.user!.id;

      // Update or create rating
      const [result] = await db
        .insert(ratings)
        .values({ userId, fightId, rating })
        .onConflictDoUpdate({
          target: [ratings.userId, ratings.fightId],
          set: { rating },
        })
        .returning();

      res.json(result);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      res.status(500).send("Failed to submit rating");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}