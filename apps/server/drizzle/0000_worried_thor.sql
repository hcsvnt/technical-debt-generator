CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`dueDate` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`completedAt` text,
	`deletedAt` text
);
--> statement-breakpoint
CREATE INDEX `idx_todos_deletedAt` ON `todos` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `idx_todos_completedAt` ON `todos` (`completedAt`);--> statement-breakpoint
CREATE INDEX `idx_todos_dueDate` ON `todos` (`dueDate`);