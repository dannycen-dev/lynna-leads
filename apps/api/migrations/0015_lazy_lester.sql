ALTER TABLE `prospects` ADD `student_name` text;--> statement-breakpoint
ALTER TABLE `prospects` ADD `education_level` text;--> statement-breakpoint
ALTER TABLE `prospects` ADD `target_grade` text;--> statement-breakpoint
ALTER TABLE `prospects` ADD `lead_channel` text;--> statement-breakpoint
ALTER TABLE `prospects` ADD `next_followup_at` integer;--> statement-breakpoint
ALTER TABLE `tenants` ADD `vertical` text DEFAULT 'real_estate' NOT NULL;