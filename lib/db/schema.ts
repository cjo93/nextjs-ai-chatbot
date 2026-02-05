import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// =============================================================================
// DEFRAG SCHEMA - Human Design Personal Development Platform
// =============================================================================

/**
 * DEFRAG Subscriptions - Manages user subscription tiers
 * Tier 1: Free - Single blueprint, 5 events/month
 * Tier 2: Basic - $9.99/mo - 10 events/month, basic analytics
 * Tier 3: Pro - $29.99/mo - Unlimited events, relationships, experiments
 */
export const defragSubscription = pgTable("DefragSubscription", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tier: varchar("tier", { enum: ["free", "basic", "pro"] })
    .notNull()
    .default("free"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  status: varchar("status", {
    enum: ["active", "canceled", "past_due", "incomplete"],
  })
    .notNull()
    .default("active"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DefragSubscription = InferSelectModel<typeof defragSubscription>;

/**
 * DEFRAG Blueprints - User's Human Design birth charts
 * Contains calculated bodygraph data (gates, centers, type, authority, etc.)
 */
export const defragBlueprint = pgTable("DefragBlueprint", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: timestamp("birthDate").notNull(),
  birthTime: varchar("birthTime", { length: 10 }).notNull(), // HH:MM format
  birthLocation: varchar("birthLocation", { length: 255 }).notNull(),
  birthLatitude: numeric("birthLatitude", { precision: 10, scale: 7 }).notNull(),
  birthLongitude: numeric("birthLongitude", { precision: 10, scale: 7 }).notNull(),
  // Calculated Human Design data (JSON structure)
  chartData: json("chartData").notNull(), // { type, authority, profile, gates, centers, channels, etc. }
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DefragBlueprint = InferSelectModel<typeof defragBlueprint>;

/**
 * DEFRAG Events - User-logged life events for physics tracking
 * Events are stress incidents that affect the user's vector state
 */
export const defragEvent = pgTable("DefragEvent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  blueprintId: uuid("blueprintId")
    .notNull()
    .references(() => defragBlueprint.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: integer("severity").notNull(), // 1-10 scale
  category: varchar("category", { length: 100 }).notNull(), // work, relationships, health, etc.
  timestamp: timestamp("timestamp").notNull(), // When the event occurred
  // Calculated physics data
  vectorState: json("vectorState"), // { magnitude, direction, affectedGates: [...] }
  generatedScript: text("generatedScript"), // AI-generated interpretation
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DefragEvent = InferSelectModel<typeof defragEvent>;

/**
 * DEFRAG Feedback - User feedback on generated scripts
 * Helps improve the inversion engine over time
 */
export const defragFeedback = pgTable("DefragFeedback", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  eventId: uuid("eventId")
    .notNull()
    .references(() => defragEvent.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  helpful: boolean("helpful"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type DefragFeedback = InferSelectModel<typeof defragFeedback>;

/**
 * DEFRAG Experiments - Hypothesis testing for personal growth
 * Pro-tier feature for tracking behavioral experiments
 */
export const defragExperiment = pgTable("DefragExperiment", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  blueprintId: uuid("blueprintId")
    .notNull()
    .references(() => defragBlueprint.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  hypothesis: text("hypothesis").notNull(),
  method: text("method").notNull(),
  duration: integer("duration"), // days
  status: varchar("status", { enum: ["active", "completed", "abandoned"] })
    .notNull()
    .default("active"),
  startDate: timestamp("startDate").notNull().defaultNow(),
  endDate: timestamp("endDate"),
  results: text("results"),
  insights: text("insights"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DefragExperiment = InferSelectModel<typeof defragExperiment>;

/**
 * DEFRAG Relationships - Synastry analysis between blueprints
 * Pro-tier feature for relationship compatibility
 */
export const defragRelationship = pgTable("DefragRelationship", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  blueprint1Id: uuid("blueprint1Id")
    .notNull()
    .references(() => defragBlueprint.id, { onDelete: "cascade" }),
  blueprint2Id: uuid("blueprint2Id")
    .notNull()
    .references(() => defragBlueprint.id, { onDelete: "cascade" }),
  relationshipType: varchar("relationshipType", { length: 100 }).notNull(), // romantic, family, work, etc.
  synastryData: json("synastryData"), // { compatibility, electromagnetic, dominance, compromise }
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DefragRelationship = InferSelectModel<typeof defragRelationship>;

/**
 * DEFRAG Usage - Tracks feature usage for rate limiting
 * Enforces tier-based limits (events per month, blueprints, etc.)
 */
export const defragUsage = pgTable("DefragUsage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  eventsLogged: integer("eventsLogged").notNull().default(0),
  blueprintsCreated: integer("blueprintsCreated").notNull().default(0),
  experimentsStarted: integer("experimentsStarted").notNull().default(0),
  relationshipsCreated: integer("relationshipsCreated").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type DefragUsage = InferSelectModel<typeof defragUsage>;
