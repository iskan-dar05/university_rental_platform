CREATE TYPE "public"."borrow_status_enum" AS ENUM('pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('admin', 'user', 'guest', 'student', 'faculty');--> statement-breakpoint
CREATE TYPE "public"."status_enum" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"equipmentId" uuid NOT NULL,
	"startAt" timestamp with time zone NOT NULL,
	"returnAt" timestamp with time zone NOT NULL,
	"status" "borrow_status_enum" DEFAULT 'pending' NOT NULL,
	"projectNote" text,
	"estimatedTotalCents" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"dailyRateCents" integer NOT NULL,
	"availableCount" integer DEFAULT 0 NOT NULL,
	"condition" varchar(80) DEFAULT 'good' NOT NULL,
	"imageUrl" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"universityId" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"status" "status_enum" DEFAULT 'pending' NOT NULL,
	"role" "role_enum" DEFAULT 'student' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_equipmentId_equipment_id_fk" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_user_index" ON "bookings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "bookings_equipment_dates_index" ON "bookings" USING btree ("equipmentId","startAt","returnAt");--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_slug_unique" ON "equipment" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "equipment_category_index" ON "equipment" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_university_id_unique" ON "users" USING btree ("universityId");