import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  real,
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

// ============================================================================
// DEFRAG Tables
// ============================================================================

/**
 * Subscription table for DEFRAG tiers and billing
 */
export const subscription = pgTable("Subscription", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  tier: varchar("tier", { enum: ["free", "pro", "lineage"] })
    .notNull()
    .default("free"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  status: varchar("status", {
    enum: ["active", "canceled", "past_due", "trialing", "incomplete"],
  })
    .notNull()
    .default("active"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  eventsThisPeriod: integer("eventsThisPeriod").notNull().default(0),
  blueprintsCreated: integer("blueprintsCreated").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Subscription = InferSelectModel<typeof subscription>;

/**
 * Blueprint table for storing Human Design charts
 */
export const blueprint = pgTable("Blueprint", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 100 }).notNull(),
  birthDate: timestamp("birthDate").notNull(),
  birthLatitude: real("birthLatitude").notNull(),
  birthLongitude: real("birthLongitude").notNull(),
  birthTimezone: varchar("birthTimezone", { length: 50 }).notNull(),
  birthLocation: json("birthLocation").notNull(), // { city, country }
  humanDesign: json("humanDesign").notNull(), // type, strategy, authority, profile, gates, centers
  geneKeys: json("geneKeys"), // optional
  numerology: json("numerology"), // optional
  ephemeris: json("ephemeris").notNull(), // raw planetary data
  fidelityScore: varchar("fidelityScore", { enum: ["HIGH", "MEDIUM", "LOW"] })
    .notNull()
    .default("MEDIUM"),
  missingData: json("missingData").notNull().default([]), // array of strings
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Blueprint = InferSelectModel<typeof blueprint>;

/**
 * VectorState table for tracking emotional/stress states
 */
export const vectorState = pgTable("VectorState", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  blueprintId: uuid("blueprintId")
    .notNull()
    .references(() => blueprint.id),
  xResilience: real("xResilience").notNull().default(5.0),
  yAutonomy: real("yAutonomy").notNull().default(5.0),
  zConnectivity: real("zConnectivity").notNull().default(5.0),
  mass: real("mass").notNull(),
  permeability: real("permeability").notNull(),
  elasticity: real("elasticity").notNull(),
  snapshotReason: varchar("snapshotReason", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type VectorState = InferSelectModel<typeof vectorState>;

/**
 * Event table for logging emotional/friction events
 */
export const event = pgTable("Event", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  blueprintId: uuid("blueprintId")
    .notNull()
    .references(() => blueprint.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  severity: varchar("severity", {
    enum: ["signal", "friction", "breakpoint", "distortion", "anomaly"],
  }).notNull(),
  severityNumeric: integer("severityNumeric").notNull(), // 1-5
  context: text("context").notNull(),
  diagnosis: json("diagnosis").notNull(),
  script: text("script").notNull(),
  scriptSource: varchar("scriptSource", { length: 20 }).notNull(),
  experiments: json("experiments").notNull().default([]),
  sedaLocked: boolean("sedaLocked").notNull().default(false),
  sedaKeywords: json("sedaKeywords").default([]),
  vectorStateId: uuid("vectorStateId").references(() => vectorState.id),
  aiModel: varchar("aiModel", { length: 50 }),
  aiTokensUsed: integer("aiTokensUsed"),
  aiLatencyMs: integer("aiLatencyMs"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Event = InferSelectModel<typeof event>;

/**
 * Experiment table for tracking user experiments
 */
export const experiment = pgTable("Experiment", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  blueprintId: uuid("blueprintId")
    .notNull()
    .references(() => blueprint.id),
  sourceEventId: uuid("sourceEventId").references(() => event.id),
  hypothesis: text("hypothesis").notNull(),
  action: text("action").notNull(),
  successCriteria: json("successCriteria").notNull(),
  status: varchar("status", { enum: ["active", "completed", "abandoned"] })
    .notNull()
    .default("active"),
  outcome: text("outcome"),
  success: boolean("success"),
  insights: text("insights"),
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Experiment = InferSelectModel<typeof experiment>;

/**
 * Relationship table for synastry analysis (Pro+ feature)
 */
export const relationship = pgTable("Relationship", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  blueprintAId: uuid("blueprintAId")
    .notNull()
    .references(() => blueprint.id),
  blueprintBId: uuid("blueprintBId")
    .notNull()
    .references(() => blueprint.id),
  name: varchar("name", { length: 100 }).notNull(),
  relationshipType: varchar("relationshipType", { length: 50 }),
  synastryData: json("synastryData").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Relationship = InferSelectModel<typeof relationship>;

/**
 * InversionOutcome table for tracking feedback on inversion scripts
 */
export const inversionOutcome = pgTable("InversionOutcome", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => event.id),
  wasHelpful: boolean("wasHelpful"),
  clarityRating: integer("clarityRating"), // 1-5
  feedbackText: text("feedbackText"),
  actionTaken: boolean("actionTaken").notNull().default(false),
  actionDescription: text("actionDescription"),
  followUpEventId: uuid("followUpEventId").references(() => event.id),
  severityDelta: integer("severityDelta"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type InversionOutcome = InferSelectModel<typeof inversionOutcome>;

/**
 * SedaEvent table for tracking SEDA protocol activations
 */
export const sedaEvent = pgTable("SedaEvent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  blueprintId: uuid("blueprintId").references(() => blueprint.id),
  triggerSource: varchar("triggerSource", { length: 50 }).notNull(),
  severityAtTrigger: integer("severityAtTrigger").notNull(),
  keywordsMatched: json("keywordsMatched").notNull(),
  userContext: text("userContext"),
  protocolVersion: varchar("protocolVersion", { length: 10 }).notNull(),
  phasesCompleted: json("phasesCompleted").notNull().default([]),
  completionStatus: varchar("completionStatus", { length: 20 }).notNull(),
  timeInProtocolSeconds: integer("timeInProtocolSeconds"),
  followUpRequired: boolean("followUpRequired").notNull().default(false),
  followUpCompleted: boolean("followUpCompleted").notNull().default(false),
  followUpNotes: text("followUpNotes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type SedaEvent = InferSelectModel<typeof sedaEvent>;
