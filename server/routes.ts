import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { setupAuth } from "./auth";
import { eq, and, desc, sql } from "drizzle-orm";
import { fights, ratings } from "@db/schema";

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
          date: fights.date,
          averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
          userRating: sql<number | null>`
            CASE 
              WHEN ${ratings.userId} = ${userId} THEN ${ratings.rating}
              ELSE NULL 
            END
          `,
        })
        .from(fights)
        .leftJoin(ratings, eq(fights.id, ratings.fightId))
        .groupBy(fights.id)
        .orderBy(desc(fights.date));

      res.json(fightsWithRatings);
    } catch (error) {
      console.error("Failed to fetch fights:", error);
      res.status(500).send("Failed to fetch fights");
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