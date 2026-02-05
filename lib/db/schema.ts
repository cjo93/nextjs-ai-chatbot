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

// ===== DEFRAG PLATFORM TABLES =====

/**
 * Subscription table for managing user payment tiers
 * Tracks Stripe subscription status and feature access
 */
export const subscription = pgTable(
  "Subscription",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    stripePriceId: varchar("stripePriceId", { length: 255 }),
    tier: varchar("tier", {
      enum: ["free", "starter", "professional", "enterprise"],
    })
      .notNull()
      .default("free"),
    status: varchar("status", {
      enum: [
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "trialing",
        "unpaid",
      ],
    })
      .notNull()
      .default("active"),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("subscription_user_id_idx").on(table.userId),
    stripeCustomerIdIdx: index("subscription_stripe_customer_id_idx").on(
      table.stripeCustomerId
    ),
  })
);

export type Subscription = InferSelectModel<typeof subscription>;

/**
 * Blueprint table for storing birth chart data
 * Contains Human Design chart calculations
 */
export const blueprint = pgTable(
  "Blueprint",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    name: varchar("name", { length: 100 }).notNull(),
    birthDate: timestamp("birthDate").notNull(),
    birthTime: varchar("birthTime", { length: 10 }).notNull(),
    birthPlace: varchar("birthPlace", { length: 255 }).notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    timezone: varchar("timezone", { length: 100 }).notNull(),
    // Human Design properties
    type: varchar("type", {
      enum: ["Generator", "Projector", "Manifestor", "Reflector", "MG"],
    }).notNull(),
    profile: varchar("profile", { length: 10 }).notNull(), // e.g., "1/3", "2/4"
    authority: varchar("authority", { length: 50 }).notNull(),
    definition: varchar("definition", { length: 50 }).notNull(),
    centers: json("centers").notNull(), // {head: true, ajna: false, ...}
    gates: json("gates").notNull(), // Array of activated gates
    channels: json("channels").notNull(), // Array of activated channels
    variables: json("variables"), // Additional HD variables
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("blueprint_user_id_idx").on(table.userId),
    typeIdx: index("blueprint_type_idx").on(table.type),
  })
);

export type Blueprint = InferSelectModel<typeof blueprint>;

/**
 * VectorState table for tracking physics/energy states
 * Captures momentum, velocity, and force vectors over time
 */
export const vectorState = pgTable(
  "VectorState",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    // Vector components
    momentum: real("momentum").notNull().default(0),
    velocity: real("velocity").notNull().default(0),
    acceleration: real("acceleration").notNull().default(0),
    frictionCoefficient: real("frictionCoefficient").notNull().default(1.0),
    // Calculated metrics
    kineticEnergy: real("kineticEnergy").notNull().default(0),
    potentialEnergy: real("potentialEnergy").notNull().default(0),
    totalEnergy: real("totalEnergy").notNull().default(0),
    // Contextual data
    context: json("context"), // Additional metadata
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdIdx: index("vector_state_blueprint_id_idx").on(
      table.blueprintId
    ),
    timestampIdx: index("vector_state_timestamp_idx").on(table.timestamp),
  })
);

export type VectorState = InferSelectModel<typeof vectorState>;

/**
 * Event table for logging friction/stress events
 * Captures life events that create resistance or momentum
 */
export const event = pgTable(
  "Event",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    severity: integer("severity").notNull(), // 1-10 scale
    category: varchar("category", {
      enum: [
        "work",
        "relationship",
        "health",
        "finance",
        "personal",
        "family",
        "other",
      ],
    }).notNull(),
    // Physics mapping
    forceMagnitude: real("forceMagnitude").notNull(),
    forceDirection: varchar("forceDirection", { length: 50 }).notNull(), // "resistance" or "momentum"
    impactVector: json("impactVector"), // Detailed force components
    // Processing data
    script: json("script"), // Generated behavioral script from inversion
    protocol: json("protocol"), // God Engine protocol response
    sedaLevel: integer("sedaLevel"), // 0-4 crisis severity
    sedaProtocol: json("sedaProtocol"), // SEDA emergency protocol if triggered
    // Status tracking
    isProcessed: boolean("isProcessed").notNull().default(false),
    processedAt: timestamp("processedAt"),
    occurredAt: timestamp("occurredAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdIdx: index("event_blueprint_id_idx").on(table.blueprintId),
    occurredAtIdx: index("event_occurred_at_idx").on(table.occurredAt),
    severityIdx: index("event_severity_idx").on(table.severity),
    categoryIdx: index("event_category_idx").on(table.category),
  })
);

export type Event = InferSelectModel<typeof event>;

/**
 * Experiment table for tracking hypothesis testing
 * Users test behavioral changes to optimize their life
 */
export const experiment = pgTable(
  "Experiment",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    eventId: uuid("eventId").references(() => event.id), // Optional: related to specific event
    title: varchar("title", { length: 255 }).notNull(),
    hypothesis: text("hypothesis").notNull(),
    method: text("method").notNull(), // What behavior to change
    expectedOutcome: text("expectedOutcome").notNull(),
    actualOutcome: text("actualOutcome"),
    // Tracking
    status: varchar("status", {
      enum: ["planned", "active", "completed", "abandoned"],
    })
      .notNull()
      .default("planned"),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    duration: integer("duration"), // Duration in days
    // Results
    successRating: integer("successRating"), // 1-10 scale
    insights: text("insights"),
    nextSteps: text("nextSteps"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    blueprintIdIdx: index("experiment_blueprint_id_idx").on(table.blueprintId),
    statusIdx: index("experiment_status_idx").on(table.status),
  })
);

export type Experiment = InferSelectModel<typeof experiment>;

/**
 * Relationship table for synastry analysis
 * Tracks relationships between blueprints for compatibility analysis
 */
export const relationship = pgTable(
  "Relationship",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    blueprintAId: uuid("blueprintAId")
      .notNull()
      .references(() => blueprint.id),
    blueprintBId: uuid("blueprintBId")
      .notNull()
      .references(() => blueprint.id),
    relationshipType: varchar("relationshipType", {
      enum: ["romantic", "family", "friend", "colleague", "other"],
    }).notNull(),
    label: varchar("label", { length: 255 }), // Optional custom label
    // Synastry analysis
    compositeData: json("compositeData"), // Combined chart analysis
    compatibilityScore: real("compatibilityScore"), // 0-100 score
    strengths: json("strengths"), // Array of compatibility strengths
    challenges: json("challenges"), // Array of potential challenges
    insights: text("insights"),
    // Status
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    blueprintAIdIdx: index("relationship_blueprint_a_id_idx").on(
      table.blueprintAId
    ),
    blueprintBIdIdx: index("relationship_blueprint_b_id_idx").on(
      table.blueprintBId
    ),
  })
);

export type Relationship = InferSelectModel<typeof relationship>;

/**
 * InversionOutcome table for feedback on script effectiveness
 * Tracks how well generated behavioral scripts work in practice
 */
export const inversionOutcome = pgTable(
  "InversionOutcome",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    eventId: uuid("eventId")
      .notNull()
      .references(() => event.id),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    // Feedback data
    wasFollowed: boolean("wasFollowed").notNull(),
    followedPercentage: integer("followedPercentage"), // 0-100
    effectivenessRating: integer("effectivenessRating").notNull(), // 1-10
    outcome: text("outcome").notNull(), // What actually happened
    insights: text("insights"),
    // Improvement suggestions
    wouldModify: boolean("wouldModify"),
    modificationSuggestions: text("modificationSuggestions"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("inversion_outcome_event_id_idx").on(table.eventId),
    blueprintIdIdx: index("inversion_outcome_blueprint_id_idx").on(
      table.blueprintId
    ),
  })
);

export type InversionOutcome = InferSelectModel<typeof inversionOutcome>;

/**
 * SedaEvent table for crisis tracking
 * Logs high-severity events that trigger emergency protocols
 */
export const sedaEvent = pgTable(
  "SedaEvent",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    eventId: uuid("eventId")
      .notNull()
      .references(() => event.id),
    blueprintId: uuid("blueprintId")
      .notNull()
      .references(() => blueprint.id),
    level: integer("level").notNull(), // 0-4 crisis level
    triggerConditions: json("triggerConditions").notNull(), // What triggered SEDA
    protocol: json("protocol").notNull(), // Emergency protocol activated
    // Response tracking
    immediateActions: json("immediateActions"), // Emergency steps taken
    stabilizationPlan: text("stabilizationPlan"),
    followUpRequired: boolean("followUpRequired").notNull().default(true),
    // Resolution
    status: varchar("status", {
      enum: ["active", "stabilized", "resolved", "escalated"],
    })
      .notNull()
      .default("active"),
    resolvedAt: timestamp("resolvedAt"),
    resolution: text("resolution"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("seda_event_event_id_idx").on(table.eventId),
    blueprintIdIdx: index("seda_event_blueprint_id_idx").on(table.blueprintId),
    levelIdx: index("seda_event_level_idx").on(table.level),
    statusIdx: index("seda_event_status_idx").on(table.status),
  })
);

export type SedaEvent = InferSelectModel<typeof sedaEvent>;
