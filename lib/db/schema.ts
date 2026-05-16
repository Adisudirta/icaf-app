import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ── RAG: documents ─────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  chunkCount: integer("chunk_count").notNull().default(0),
  status: text("status", { enum: ["pending", "processing", "ready", "failed"] })
    .notNull()
    .default("pending"),
  uploadedAt: timestamp("uploaded_at").$defaultFn(() => new Date()).notNull(),
});

export const documentChunks = pgTable("document_chunks", {
  id: text("id").primaryKey(), // also used as Pinecone vector ID
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
});

// ── Cases ──────────────────────────────────────────────────────────────────────

export const cases = pgTable("cases", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Firebase UID — no FK to auth tables
  caseName: text("case_name").notNull(),
  incidentDate: text("incident_date").notNull(),
  investigatingOfficer: text("investigating_officer").notNull(),
  incidentLocation: text("incident_location").notNull(),
  incidentType: text("incident_type").notNull(),
  threatType: text("threat_type").notNull(),
  victimAction: text("victim_action").notNull(),
  outcome: text("outcome").notNull(),
  context: text("context").notNull(),
  analysisText: text("analysis_text"),
  documentText: text("document_text"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
