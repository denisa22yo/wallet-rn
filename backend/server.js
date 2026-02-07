import express from "express";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

// middleware
app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001;
app.use("/api/transactions", transactionsRoute);

// Funcția care creează tabelul dacă nu există
async function initDB() {
  try {
    await sql` CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing DB:", error);
    process.exit(1);
  }
}

// Pornim baza de date, apoi serverul
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is up and running on PORT: ${PORT}`);
  });
});
