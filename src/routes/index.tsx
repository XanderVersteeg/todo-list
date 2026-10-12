import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { TodoComposer } from "@/components/todo-composer";
import { Button } from "@/components/ui/button";
import { completeTodo, createTodo, listTodos } from "@/lib/todos";

export const Route = createFileRoute("/")({ component: Home });

const todosKey = ["todos"];

function Home() {
	const queryClient = useQueryClient();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const todosQuery = useQuery({
		queryKey: todosKey,
		queryFn: () => listTodos(),
	});

	const mutation = useMutation({
		mutationFn: (input: { title: string; description: string }) =>
			createTodo({ data: input }),
		onSuccess: () => {
			setTitle("");
			setDescription("");
			return queryClient.invalidateQueries({ queryKey: todosKey });
		},
	});

	const completeMutation = useMutation({
		mutationFn: (id: number) => completeTodo({ data: { id } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey }),
	});

	return (
		<div className="mx-auto max-w-md p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">New todo</h1>
				<ModeToggle />
			</div>
			<div className="mt-6">
				<TodoComposer
					isPending={mutation.isPending}
					title={title}
					description={description}
					onTitleChange={setTitle}
					onDescriptionChange={setDescription}
					onSubmit={() => mutation.mutate({ title, description })}
				/>
				{mutation.isSuccess && (
					<p className="mt-3 text-green-400">Saved "{mutation.data.title}".</p>
				)}
				{mutation.isError && (
					<p className="mt-3 text-red-400">
						Failed to save: {mutation.error.message}
					</p>
				)}
			</div>

			<h2 className="mt-10 text-2xl font-bold">Todos</h2>
			{todosQuery.isPending && <p className="mt-4">Loading…</p>}
			{todosQuery.isError && (
				<p className="mt-4 text-red-400">
					Failed to load todos: {todosQuery.error.message}
				</p>
			)}
			{todosQuery.data?.length === 0 && (
				<p className="mt-4 text-muted-foreground">No todos yet.</p>
			)}
			<ul className="mt-4 flex flex-col gap-3">
				{todosQuery.data?.map((todo) => (
					<li
						key={todo.id}
						className="flex items-start justify-between gap-3 rounded border p-3"
					>
						<div className={todo.isCompleted ? "text-muted-foreground" : ""}>
							<p
								className={`font-medium ${todo.isCompleted ? "line-through" : ""}`}
							>
								{todo.title}
							</p>
							{todo.description && (
								<p className="mt-1 whitespace-pre-wrap text-sm">
									{todo.description}
								</p>
							)}
						</div>
						{todo.isCompleted ? (
							<span className="text-sm text-green-400">Done</span>
						) : (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => completeMutation.mutate(todo.id)}
								disabled={
									completeMutation.isPending &&
									completeMutation.variables === todo.id
								}
								className="shrink-0"
							>
								Complete
							</Button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
