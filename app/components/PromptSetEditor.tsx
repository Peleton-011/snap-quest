import React, { useState, useEffect } from "react";
// import {
// 	Box,
// 	Button,
// 	Dialog,
// 	DialogActions,
// 	DialogContent,
// 	DialogTitle,
// 	TextField,
// 	Typography,
// } from "@mui/material";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import db from "@/app/services/db";

interface PromptSetEditorProps {
	editSetId?: number; // if provided, edit mode
	label: string;
	onSaved: () => void;
}

const PromptSetEditor: React.FC<PromptSetEditorProps> = ({
	editSetId,
	label,
	onSaved,
}) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [prompts, setPrompts] = useState<{ full: string; short: string }[]>([
		{ full: "", short: "" },
	]);
	const [loaded, setLoaded] = useState(!editSetId); // skip loading if create mode

	useEffect(() => {
		if (!editSetId) return;
		const load = async () => {
			const set = await db.promptSets.get(editSetId);
			if (set) {
				setName(set.name);
				setDescription(set.description || "");
			}
			const existing = await db.prompts
				.where("promptSetId")
				.equals(editSetId)
				.toArray();
			if (existing.length > 0) {
				setPrompts(
					existing.map((p) => ({
						full:
							p.fullPrompt.en ||
							Object.values(p.fullPrompt)[0] ||
							"",
						short:
							p.shortPrompt.en ||
							Object.values(p.shortPrompt)[0] ||
							"",
					})),
				);
			}
			setLoaded(true);
		};
		load();
	}, [editSetId]);

	const updatePrompt = (
		index: number,
		field: "full" | "short",
		value: string,
	) => {
		setPrompts((prev) =>
			prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
		);
	};

	const addPrompt = () =>
		setPrompts((prev) => [...prev, { full: "", short: "" }]);

	const removePrompt = (index: number) => {
		setPrompts((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		if (!name.trim()) return;
		const validPrompts = prompts.filter((p) => p.full.trim());
		if (validPrompts.length === 0) return;

		const promptRecords = validPrompts.map((p) => ({
			fullPrompt: { en: p.full.trim() },
			shortPrompt: { en: p.short.trim() || p.full.trim() },
		}));

		if (editSetId) {
			// Update existing set
			await db.promptSets.update(editSetId, {
				name: name.trim(),
				description: description.trim(),
			});
			// Replace all prompts
			await db.prompts.where("promptSetId").equals(editSetId).delete();
			await db.prompts.bulkAdd(
				promptRecords.map((p) => ({ ...p, promptSetId: editSetId })),
			);
		} else {
			// Create new set
			const setId = await db.promptSets.add({
				name: name.trim(),
				description: description.trim(),
				isDefault: false,
			});
			await db.prompts.bulkAdd(
				promptRecords.map((p) => ({
					...p,
					promptSetId: setId as number,
				})),
			);
		}

		onSaved();
	};

	if (!loaded) return null;

	return (
		<Dialog>
			<form method="dialog" onSubmit={handleSave}>
				<DialogTrigger asChild>
					<Button>{label}</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editSetId ? "Edit" : "Create"} Prompt Set
						</DialogTitle>
						{/* I could put a DIalogDescriptoion here */}
					</DialogHeader>
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<Label htmlFor="desc">Description</Label>
					<Input
						id="desc"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>

					<h6>Prompts</h6>

					{prompts.map((prompt, idx) => (
						<div key={idx}>
							<div>
								<h4>Prompt {idx + 1}</h4>
								{prompts.length > 1 && (
									<Button
										color="error"
										onClick={() => removePrompt(idx)}
									>
										Remove
									</Button>
								)}
							</div>
							<Label htmlFor="prompt">Prompt</Label>
							<Input
								id="prompt"
								value={prompt.full}
								onChange={(e) =>
									updatePrompt(idx, "full", e.target.value)
								}
							/>

							<Label htmlFor="short">
								Short Label (optional — defaults to full prompt)
							</Label>
							<Input
								id="short"
								value={prompt.short}
								onChange={(e) =>
									updatePrompt(idx, "short", e.target.value)
								}
							/>
						</div>
					))}

					<Button onClick={addPrompt}>+ Add Prompt</Button>
                    
					<DialogFooter>
						<DialogClose asChild>
							<Button>Cancel</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={
								!name.trim() ||
								!prompts.some((p) => p.full.trim())
							}
						>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
};

export default PromptSetEditor;
