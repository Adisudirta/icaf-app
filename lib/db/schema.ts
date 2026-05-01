import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ── Auth tables (better-auth) ──────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").$defaultFn(() => false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ── RAG: documents ─────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  chunkCount: integer("chunk_count").notNull().default(0),
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
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  caseNumber: text("case_number").notNull(),
  incidentDate: text("incident_date").notNull(),
  investigatingOfficer: text("investigating_officer").notNull(),
  incidentLocation: text("incident_location").notNull(),
  incidentType: text("incident_type").notNull(),
  threatLevel: text("threat_level").notNull(),
  victimAction: text("victim_action").notNull(),
  suspectCondition: text("suspect_condition").notNull(),
  victimCondition: text("victim_condition").notNull(),
  context: text("context").notNull(),
  analysisText: text("analysis_text"),
  documentText: text("document_text"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
