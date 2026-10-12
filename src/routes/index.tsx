import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
			<h1 className="text-3xl font-bold">New todo</h1>
			<form
				className="mt-6 flex flex-col gap-3"
				onSubmit={(e) => {
					e.preventDefault();
					mutation.mutate({ title, description });
				}}
			>
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Title"
					maxLength={255}
					required
					className="rounded border px-3 py-2"
				/>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Description"
					rows={3}
					className="rounded border px-3 py-2"
				/>
				<button
					type="submit"
					disabled={mutation.isPending || !title.trim()}
					className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
				>
					{mutation.isPending ? "Uploading…" : "Add todo"}
				</button>
				{mutation.isSuccess && (
					<p className="text-green-700">Saved "{mutation.data.title}".</p>
				)}
				{mutation.isError && (
					<p className="text-red-700">
						Failed to save: {mutation.error.message}
					</p>
				)}
			</form>

			<h2 className="mt-10 text-2xl font-bold">Todos</h2>
			{todosQuery.isPending && <p className="mt-4">Loading…</p>}
			{todosQuery.isError && (
				<p className="mt-4 text-red-700">
					Failed to load todos: {todosQuery.error.message}
				</p>
			)}
			{todosQuery.data?.length === 0 && (
				<p className="mt-4 text-gray-600">No todos yet.</p>
			)}
			<ul className="mt-4 flex flex-col gap-3">
				{todosQuery.data?.map((todo) => (
					<li
						key={todo.id}
						className="flex items-start justify-between gap-3 rounded border p-3"
					>
						<div className={todo.isCompleted ? "text-gray-500" : ""}>
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
							<span className="text-sm text-green-700">Done</span>
						) : (
							<button
								type="button"
								onClick={() => completeMutation.mutate(todo.id)}
								disabled={
									completeMutation.isPending &&
									completeMutation.variables === todo.id
								}
								className="shrink-0 rounded border px-3 py-1 text-sm disabled:opacity-50"
							>
								Complete
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
