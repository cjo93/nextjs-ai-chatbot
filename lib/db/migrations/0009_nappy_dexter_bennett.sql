CREATE TABLE IF NOT EXISTS "Blueprint" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"birthDate" timestamp NOT NULL,
	"birthTime" varchar(10) NOT NULL,
	"birthPlace" varchar(255) NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"type" varchar NOT NULL,
	"profile" varchar(10) NOT NULL,
	"authority" varchar(50) NOT NULL,
	"definition" varchar(50) NOT NULL,
	"centers" json NOT NULL,
	"gates" json NOT NULL,
	"channels" json NOT NULL,
	"variables" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"severity" integer NOT NULL,
	"category" varchar NOT NULL,
	"forceMagnitude" real NOT NULL,
	"forceDirection" varchar(50) NOT NULL,
	"impactVector" json,
	"script" json,
	"protocol" json,
	"sedaLevel" integer,
	"sedaProtocol" json,
	"isProcessed" boolean DEFAULT false NOT NULL,
	"processedAt" timestamp,
	"occurredAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Experiment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintId" uuid NOT NULL,
	"eventId" uuid,
	"title" varchar(255) NOT NULL,
	"hypothesis" text NOT NULL,
	"method" text NOT NULL,
	"expectedOutcome" text NOT NULL,
	"actualOutcome" text,
	"status" varchar DEFAULT 'planned' NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"duration" integer,
	"successRating" integer,
	"insights" text,
	"nextSteps" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InversionOutcome" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"blueprintId" uuid NOT NULL,
	"wasFollowed" boolean NOT NULL,
	"followedPercentage" integer,
	"effectivenessRating" integer NOT NULL,
	"outcome" text NOT NULL,
	"insights" text,
	"wouldModify" boolean,
	"modificationSuggestions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintAId" uuid NOT NULL,
	"blueprintBId" uuid NOT NULL,
	"relationshipType" varchar NOT NULL,
	"label" varchar(255),
	"compositeData" json,
	"compatibilityScore" real,
	"strengths" json,
	"challenges" json,
	"insights" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SedaEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"blueprintId" uuid NOT NULL,
	"level" integer NOT NULL,
	"triggerConditions" json NOT NULL,
	"protocol" json NOT NULL,
	"immediateActions" json,
	"stabilizationPlan" text,
	"followUpRequired" boolean DEFAULT true NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"resolvedAt" timestamp,
	"resolution" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"stripeSubscriptionId" varchar(255),
	"stripeCustomerId" varchar(255),
	"stripePriceId" varchar(255),
	"tier" varchar DEFAULT 'free' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VectorState" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintId" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"momentum" real DEFAULT 0 NOT NULL,
	"velocity" real DEFAULT 0 NOT NULL,
	"acceleration" real DEFAULT 0 NOT NULL,
	"frictionCoefficient" real DEFAULT 1 NOT NULL,
	"kineticEnergy" real DEFAULT 0 NOT NULL,
	"potentialEnergy" real DEFAULT 0 NOT NULL,
	"totalEnergy" real DEFAULT 0 NOT NULL,
	"context" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Blueprint" ADD CONSTRAINT "Blueprint_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_blueprintId_Blueprint_id_fk" FOREIGN KEY ("blueprintId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_blueprintId_Blueprint_id_fk" FOREIGN KEY ("blueprintId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InversionOutcome" ADD CONSTRAINT "InversionOutcome_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InversionOutcome" ADD CONSTRAINT "InversionOutcome_blueprintId_Blueprint_id_fk" FOREIGN KEY ("blueprintId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_blueprintAId_Blueprint_id_fk" FOREIGN KEY ("blueprintAId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_blueprintBId_Blueprint_id_fk" FOREIGN KEY ("blueprintBId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SedaEvent" ADD CONSTRAINT "SedaEvent_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SedaEvent" ADD CONSTRAINT "SedaEvent_blueprintId_Blueprint_id_fk" FOREIGN KEY ("blueprintId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VectorState" ADD CONSTRAINT "VectorState_blueprintId_Blueprint_id_fk" FOREIGN KEY ("blueprintId") REFERENCES "public"."Blueprint"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blueprint_user_id_idx" ON "Blueprint" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blueprint_type_idx" ON "Blueprint" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_blueprint_id_idx" ON "Event" USING btree ("blueprintId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_occurred_at_idx" ON "Event" USING btree ("occurredAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_severity_idx" ON "Event" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_category_idx" ON "Event" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "experiment_blueprint_id_idx" ON "Experiment" USING btree ("blueprintId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "experiment_status_idx" ON "Experiment" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inversion_outcome_event_id_idx" ON "InversionOutcome" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inversion_outcome_blueprint_id_idx" ON "InversionOutcome" USING btree ("blueprintId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "relationship_blueprint_a_id_idx" ON "Relationship" USING btree ("blueprintAId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "relationship_blueprint_b_id_idx" ON "Relationship" USING btree ("blueprintBId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "seda_event_event_id_idx" ON "SedaEvent" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "seda_event_blueprint_id_idx" ON "SedaEvent" USING btree ("blueprintId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "seda_event_level_idx" ON "SedaEvent" USING btree ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "seda_event_status_idx" ON "SedaEvent" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_user_id_idx" ON "Subscription" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_stripe_customer_id_idx" ON "Subscription" USING btree ("stripeCustomerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vector_state_blueprint_id_idx" ON "VectorState" USING btree ("blueprintId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vector_state_timestamp_idx" ON "VectorState" USING btree ("timestamp");