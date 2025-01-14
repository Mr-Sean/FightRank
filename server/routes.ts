import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { setupAuth } from "./auth";
import { eq, and, desc, sql } from "drizzle-orm";
import { promotions, events, fights, ratings } from "@db/schema";

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

  // Promotions routes
  app.get("/api/promotions", async (_req, res) => {
    try {
      const allPromotions = await db.select().from(promotions);
      res.json(allPromotions);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      res.status(500).send("Failed to fetch promotions");
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}