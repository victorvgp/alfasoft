import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import contactsRouter from "./routes/contacts.routes.js";
import { errorHandler, notFound } from "./middleware/errors.js";

/** @returns {import("express").Express} */
export function createApp() {
  const app = express();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.post("/api/auth/login", (req, res) => {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "ServerError",
        message: "JWT_SECRET not configured",
      });
    }

    const { username, password } = req.body || {};

    if (username !== process.env.AUTH_USER || password !== process.env.AUTH_PASS) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token });
  });

  app.use("/api", contactsRouter);

  const vueDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(vueDist));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();

    return res.sendFile(path.join(vueDist, "index.html"), (err) => {
      if (err) {
        return res.status(200).send("Frontend not built yet. Run: cd frontend && npm run build");
      }
    });
  });
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
