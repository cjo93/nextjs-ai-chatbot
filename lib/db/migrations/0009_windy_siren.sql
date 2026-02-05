CREATE TABLE IF NOT EXISTS "Blueprint" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"birthDate" timestamp NOT NULL,
	"birthLatitude" real NOT NULL,
	"birthLongitude" real NOT NULL,
	"birthTimezone" varchar(50) NOT NULL,
	"birthLocation" json NOT NULL,
	"humanDesign" json NOT NULL,
	"geneKeys" json,
	"numerology" json,
	"ephemeris" json NOT NULL,
	"fidelityScore" varchar(10) DEFAULT 'HIGH' NOT NULL,
	"missingData" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"severity" varchar(20) NOT NULL,
	"severityNumeric" integer NOT NULL,
	"context" text NOT NULL,
	"diagnosis" json,
	"script" text,
	"scriptSource" varchar(20) DEFAULT 'deterministic',
	"experiments" json,
	"sedaLocked" boolean DEFAULT false,
	"sedaKeywords" json,
	"vectorStateId" uuid,
	"aiModel" varchar(50),
	"aiTokensUsed" integer,
	"aiLatencyMs" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Experiment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintId" uuid NOT NULL,
	"sourceEventId" uuid,
	"hypothesis" text NOT NULL,
	"action" text NOT NULL,
	"successCriteria" json NOT NULL,
	"status" varchar(20) DEFAULT 'active',
	"outcome" text,
	"success" boolean,
	"insights" text,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"endedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InversionOutcome" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"wasHelpful" boolean,
	"clarityRating" integer,
	"feedbackText" text,
	"actionTaken" boolean DEFAULT false,
	"actionDescription" text,
	"followUpEventId" uuid,
	"severityDelta" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"blueprintAId" uuid NOT NULL,
	"blueprintBId" uuid NOT NULL,
	"name" varchar(100),
	"relationshipType" varchar(50),
	"synastryData" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SedaEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"blueprintId" uuid,
	"triggerSource" varchar(50) NOT NULL,
	"severityAtTrigger" integer NOT NULL,
	"keywordsMatched" json,
	"userContext" text,
	"protocolVersion" varchar(10) DEFAULT 'v2',
	"phasesCompleted" json,
	"completionStatus" varchar(20),
	"timeInProtocolSeconds" integer,
	"followUpRequired" boolean DEFAULT true,
	"followUpCompleted" boolean DEFAULT false,
	"followUpNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"tier" varchar(20) DEFAULT 'free' NOT NULL,
	"stripeCustomerId" varchar(255),
	"stripeSubscriptionId" varchar(255),
	"stripePriceId" varchar(255),
	"status" varchar(20) DEFAULT 'active',
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false,
	"eventsThisPeriod" integer DEFAULT 0,
	"blueprintsCreated" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VectorState" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprintId" uuid NOT NULL,
	"xResilience" real DEFAULT 5 NOT NULL,
	"yAutonomy" real DEFAULT 5 NOT NULL,
	"zConnectivity" real DEFAULT 5 NOT NULL,
	"mass" real NOT NULL,
	"permeability" real NOT NULL,
	"elasticity" real NOT NULL,
	"snapshotReason" varchar(50),
	"timestamp" timestamp DEFAULT now() NOT NULL
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
 ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_vectorStateId_VectorState_id_fk" FOREIGN KEY ("vectorStateId") REFERENCES "public"."VectorState"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_sourceEventId_Event_id_fk" FOREIGN KEY ("sourceEventId") REFERENCES "public"."Event"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "InversionOutcome" ADD CONSTRAINT "InversionOutcome_followUpEventId_Event_id_fk" FOREIGN KEY ("followUpEventId") REFERENCES "public"."Event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "SedaEvent" ADD CONSTRAINT "SedaEvent_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
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
