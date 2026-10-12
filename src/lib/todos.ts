import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { todos } from "@/db/schema";

const createTodoSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255),
	description: z.string().trim().max(10_000).optional(),
});

export const createTodo = createServerFn({ method: "POST" })
	.validator(createTodoSchema)
	.handler(async ({ data }) => {
		const [todo] = await db
			.insert(todos)
			.values({
				title: data.title,
				description: data.description || null,
			})
			.returning();
		return todo;
	});

export const listTodos = createServerFn({ method: "GET" }).handler(() =>
	db.select().from(todos).orderBy(desc(todos.createdAt), desc(todos.id)),
);

export const completeTodo = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.number().int() }))
	.handler(async ({ data }) => {
		const [todo] = await db
			.update(todos)
			.set({ isCompleted: true, completedAt: new Date() })
			.where(eq(todos.id, data.id))
			.returning();
		return todo;
	});
