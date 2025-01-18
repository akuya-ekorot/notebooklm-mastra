ALTER TABLE "sources" ALTER COLUMN "processing_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "validation_failure_reason" text;