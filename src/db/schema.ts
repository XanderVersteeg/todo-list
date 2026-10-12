import {
	boolean,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
	id: serial().primaryKey(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	isCompleted: boolean("is_completed").notNull().default(false),
	completedAt: timestamp("completed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
