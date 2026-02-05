import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
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
// DEFRAG Platform Schema
// ============================================================================

// 1. Subscription Table
export const subscription = pgTable(
  "Subscription",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    tier: varchar("tier", { length: 20, enum: ["free", "pro", "lineage"] })
      .notNull()
      .default("free"),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
    stripePriceId: varchar("stripePriceId", { length: 255 }),
    status: varchar("status", {
      length: 20,
      enum: ["active", "canceled", "past_due", "trialing", "incomplete"],
    }).default("active"),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
    eventsThisPeriod: integer("eventsThisPeriod").default(0),
    blueprintsCreated: integer("blueprintsCreated").default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_subscription_user_id").on(table.userId),
    createdIdx: index("idx_subscription_created_at").on(table.createdAt),
  })
);

export type Subscription = InferSelectModel<typeof subscription>;

// 2. Blueprint Table
export const blueprint = pgTable(
  "Blueprint",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    name: varchar("name", { length: 100 }).notNull(),
    birthDate: timestamp("birthDate").notNull(),
    birthLatitude: real("birthLatitude").notNull(),
    birthLongitude: real("birthLongitude").notNull(),
    birthTimezone: varchar("birthTimezone", { length: 50 }).notNull(),
    birthLocation: json("birthLocation").notNull(),
    humanDesign: json("humanDesign").notNull(),
    geneKeys: json("geneKeys"),
    numerology: json("numerology"),
    ephemeris: json("ephemeris").notNull(),
    fidelityScore: varchar("fidelityScore", {
      length: 10,
      enum: ["HIGH", "MEDIUM", "LOW"],
    })
      .notNull()
      .default("HIGH"),
    missingData: json("missingData"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_blueprint_user_id").on(table.userId),
    createdIdx: index("idx_blueprint_created_at").on(table.createdAt),
  })
);

export type Blueprint = InferSelectModel<typeof blueprint>;

// 3. VectorState Table
export const vectorState = pgTable(
  "VectorState",
  {
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
    snapshotReason: varchar("snapshotReason", { length: 50 }),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdx: index("idx_vectorstate_blueprint_id").on(table.blueprintId),
    timestampIdx: index("idx_vectorstate_timestamp").on(table.timestamp),
  })
);

export type VectorState = InferSelectModel<typeof vectorState>;

// 4. Event Table
export const event = pgTable(
  "Event",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    severity: varchar("severity", {
      length: 20,
      enum: ["signal", "friction", "breakpoint", "distortion", "anomaly"],
    }).notNull(),
    severityNumeric: integer("severityNumeric").notNull(),
    context: text("context").notNull(),
    diagnosis: json("diagnosis"),
    script: text("script"),
    scriptSource: varchar("scriptSource", { length: 20 }).default(
      "deterministic"
    ),
    experiments: json("experiments"),
    sedaLocked: boolean("sedaLocked").default(false),
    sedaKeywords: json("sedaKeywords"),
    vectorStateId: uuid("vectorStateId").references(() => vectorState.id),
    aiModel: varchar("aiModel", { length: 50 }),
    aiTokensUsed: integer("aiTokensUsed"),
    aiLatencyMs: integer("aiLatencyMs"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdx: index("idx_event_blueprint_id").on(table.blueprintId),
    userIdx: index("idx_event_user_id").on(table.userId),
    createdIdx: index("idx_event_created_at").on(table.createdAt),
    severityIdx: index("idx_event_severity").on(table.severity),
  })
);

export type Event = InferSelectModel<typeof event>;

// 5. Experiment Table
export const experiment = pgTable(
  "Experiment",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    sourceEventId: uuid("sourceEventId").references(() => event.id),
    hypothesis: text("hypothesis").notNull(),
    action: text("action").notNull(),
    successCriteria: json("successCriteria").notNull(),
    status: varchar("status", {
      length: 20,
      enum: ["active", "completed", "abandoned"],
    }).default("active"),
    outcome: text("outcome"),
    success: boolean("success"),
    insights: text("insights"),
    startedAt: timestamp("startedAt").notNull().defaultNow(),
    endedAt: timestamp("endedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdx: index("idx_experiment_blueprint_id").on(table.blueprintId),
    statusIdx: index("idx_experiment_status").on(table.status),
    createdIdx: index("idx_experiment_created_at").on(table.createdAt),
  })
);

export type Experiment = InferSelectModel<typeof experiment>;

// 6. Relationship Table
export const relationship = pgTable(
  "Relationship",
  {
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
    name: varchar("name", { length: 100 }),
    relationshipType: varchar("relationshipType", { length: 50 }),
    synastryData: json("synastryData"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_relationship_user_id").on(table.userId),
    blueprintAIdx: index("idx_relationship_blueprint_a_id").on(
      table.blueprintAId
    ),
    blueprintBIdx: index("idx_relationship_blueprint_b_id").on(
      table.blueprintBId
    ),
    createdIdx: index("idx_relationship_created_at").on(table.createdAt),
  })
);

export type Relationship = InferSelectModel<typeof relationship>;

// 7. InversionOutcome Table
export const inversionOutcome = pgTable(
  "InversionOutcome",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    eventId: uuid("eventId")
      .notNull()
      .references(() => event.id),
    wasHelpful: boolean("wasHelpful"),
    clarityRating: integer("clarityRating"),
    feedbackText: text("feedbackText"),
    actionTaken: boolean("actionTaken").default(false),
    actionDescription: text("actionDescription"),
    followUpEventId: uuid("followUpEventId").references(() => event.id),
    severityDelta: integer("severityDelta"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index("idx_inversionoutcome_event_id").on(table.eventId),
    createdIdx: index("idx_inversionoutcome_created_at").on(table.createdAt),
  })
);

export type InversionOutcome = InferSelectModel<typeof inversionOutcome>;

// 8. SedaEvent Table
export const sedaEvent = pgTable(
  "SedaEvent",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    blueprintId: uuid("blueprintId").references(() => blueprint.id),
    triggerSource: varchar("triggerSource", { length: 50 }).notNull(),
    severityAtTrigger: integer("severityAtTrigger").notNull(),
    keywordsMatched: json("keywordsMatched"),
    userContext: text("userContext"),
    protocolVersion: varchar("protocolVersion", { length: 10 }).default("v2"),
    phasesCompleted: json("phasesCompleted"),
    completionStatus: varchar("completionStatus", { length: 20 }),
    timeInProtocolSeconds: integer("timeInProtocolSeconds"),
    followUpRequired: boolean("followUpRequired").default(true),
    followUpCompleted: boolean("followUpCompleted").default(false),
    followUpNotes: text("followUpNotes"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_sedaevent_user_id").on(table.userId),
    blueprintIdx: index("idx_sedaevent_blueprint_id").on(table.blueprintId),
    createdIdx: index("idx_sedaevent_created_at").on(table.createdAt),
  })
);

export type SedaEvent = InferSelectModel<typeof sedaEvent>;
