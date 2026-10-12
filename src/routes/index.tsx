import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
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
	const [showCompleted, setShowCompleted] = useState(false);

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

	const todos = todosQuery.data ?? [];
	const activeTodos = todos.filter((todo) => !todo.isCompleted);
	const completedTodos = todos.filter((todo) => todo.isCompleted);

	const renderTodo = (todo: (typeof todos)[number]) => (
		<li key={todo.id}>
			<button
				type="button"
				onClick={() => completeMutation.mutate(todo.id)}
				disabled={todo.isCompleted || completeMutation.isPending}
				className="group w-full cursor-pointer py-4 text-left text-lg font-medium outline-none disabled:cursor-default"
			>
				<span
					className={`relative inline-block transition-colors after:absolute after:top-1/2 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-current after:transition-transform after:duration-200 ${
						todo.isCompleted
							? "text-muted-foreground after:scale-x-100"
							: "after:scale-x-0 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100"
					}`}
				>
					{todo.title}
				</span>
			</button>
		</li>
	);

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
			<ul className="mt-4 divide-y divide-border">
				{activeTodos.map(renderTodo)}
			</ul>
			{completedTodos.length > 0 && (
				<>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						aria-expanded={showCompleted}
						onClick={() => setShowCompleted((open) => !open)}
						className="mt-3 text-muted-foreground"
					>
						<ChevronDown
							className={`transition-transform ${showCompleted ? "rotate-180" : ""}`}
						/>
						{showCompleted ? "Hide" : "Show"} completed (
						{completedTodos.length})
					</Button>
					{showCompleted && (
						<ul className="mt-2 divide-y divide-border">
							{completedTodos.map(renderTodo)}
						</ul>
					)}
				</>
			)}
		</div>
	);
}
