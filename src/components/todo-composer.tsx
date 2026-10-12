import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TodoComposerProps = {
	isPending: boolean;
	title: string;
	description: string;
	onTitleChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onSubmit: () => void;
};

export function TodoComposer({
	isPending,
	title,
	description,
	onTitleChange,
	onDescriptionChange,
	onSubmit,
}: TodoComposerProps) {
	const [expanded, setExpanded] = useState(false);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	// The lip stays open while focus is inside the composer (via the `group`
	// focus-within variant) or while there is a description to keep visible.
	const keepLip = expanded || description.length > 0;

	return (
		<form
			className="group"
			onSubmit={(e) => {
				e.preventDefault();
				if (title.trim()) onSubmit();
			}}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget) && !description) {
					setExpanded(false);
				}
			}}
		>
			<div className="relative z-10 rounded-2xl border bg-card shadow-sm focus-within:shadow-md">
				<Input
					type="text"
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					placeholder="What needs doing?"
					maxLength={255}
					aria-label="Title"
					className="h-auto rounded-2xl border-0 bg-transparent py-6 pr-20 pl-6 text-xl shadow-none focus-visible:ring-0 md:text-xl dark:bg-transparent"
				/>
				<Button
					type="submit"
					size="icon"
					aria-label="Add todo"
					disabled={isPending || !title.trim()}
					className="absolute top-1/2 right-4 size-11 -translate-y-1/2 rounded-full"
				>
					<ArrowRight className="size-5" />
				</Button>
			</div>

			<div
				className={`grid transition-[grid-template-rows] duration-200 ease-out ${
					keepLip
						? "grid-rows-[1fr]"
						: "grid-rows-[0fr] group-focus-within:grid-rows-[1fr]"
				}`}
			>
				<div className="mx-4 overflow-hidden">
					<div className="rounded-b-xl border border-t-0 bg-secondary">
						{expanded ? (
							<Textarea
								ref={descriptionRef}
								value={description}
								onChange={(e) => onDescriptionChange(e.target.value)}
								placeholder="Description"
								rows={4}
								aria-label="Description"
								className="resize-none rounded-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent"
							/>
						) : (
							<Button
								type="button"
								variant="ghost"
								// Keep focus in the composer so the lip doesn't collapse on click.
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									setExpanded(true);
									requestAnimationFrame(() => descriptionRef.current?.focus());
								}}
								className="h-auto w-full justify-start rounded-none px-4 py-2 font-normal text-muted-foreground"
							>
								Add description…
							</Button>
						)}
					</div>
				</div>
			</div>
		</form>
	);
}
