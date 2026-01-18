import { defineConfig } from "drizzle-kit";

// Note: This project now uses MongoDB with Mongoose instead of Drizzle ORM
// This config file is kept for reference but may not be used
// MongoDB migrations are handled through Mongoose models

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql", // Legacy - project now uses MongoDB
  dbCredentials: {
    url: connectionString,
  },
});
