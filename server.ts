import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("emotions.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS emotion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_number TEXT NOT NULL,
    emotion TEXT NOT NULL,
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS date_expirations (
    date_str TEXT PRIMARY KEY,
    expires_at DATETIME NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to cleanup expired logs
  const cleanupExpiredLogs = () => {
    try {
      const now = new Date().toISOString();
      const expiredDates = db.prepare("SELECT date_str FROM date_expirations WHERE expires_at <= ?").all() as { date_str: string }[];
      
      for (const { date_str } of expiredDates) {
        // Delete logs for that specific day
        // We need to match the date part of the timestamp
        db.prepare("DELETE FROM emotion_logs WHERE date(timestamp) = date(?)").run(date_str);
        db.prepare("DELETE FROM date_expirations WHERE date_str = ?").run(date_str);
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  // API Routes
  app.post("/api/submit-emotion", (req, res) => {
    const { employeeNumber, emotion, comment } = req.body;
    
    if (!employeeNumber || !emotion || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const stmt = db.prepare("INSERT INTO emotion_logs (employee_number, emotion, comment) VALUES (?, ?, ?)");
      stmt.run(employeeNumber, emotion, comment);
      res.json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save emotion status" });
    }
  });

  app.get("/api/admin/logs", (req, res) => {
    cleanupExpiredLogs();
    try {
      const logs = db.prepare("SELECT * FROM emotion_logs ORDER BY timestamp DESC").all();
      res.json(logs);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.get("/api/admin/expirations", (req, res) => {
    try {
      const expirations = db.prepare("SELECT * FROM date_expirations").all();
      res.json(expirations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expirations" });
    }
  });

  app.post("/api/admin/set-expiration", (req, res) => {
    const { dateStr, expiresAt } = req.body;
    try {
      const stmt = db.prepare("INSERT OR REPLACE INTO date_expirations (date_str, expires_at) VALUES (?, ?)");
      stmt.run(dateStr, expiresAt);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to set expiration" });
    }
  });

  app.delete("/api/admin/logs/:id", (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare("DELETE FROM emotion_logs WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Log not found" });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to delete log" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
