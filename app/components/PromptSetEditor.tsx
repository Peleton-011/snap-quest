import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";

import db from "@/app/services/db";

interface PromptSetEditorProps {
	editSetId?: number; // if provided, edit mode
	onClose: () => void;
	onSaved: () => void;
}

const PromptSetEditor: React.FC<PromptSetEditorProps> = ({
	editSetId,
	onClose,
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
						full: p.fullPrompt.en || Object.values(p.fullPrompt)[0] || "",
						short: p.shortPrompt.en || Object.values(p.shortPrompt)[0] || "",
					})),
				);
			}
			setLoaded(true);
		};
		load();
	}, [editSetId]);

	const updatePrompt = (index: number, field: "full" | "short", value: string) => {
		setPrompts((prev) =>
			prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
		);
	};

	const addPrompt = () => setPrompts((prev) => [...prev, { full: "", short: "" }]);

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
				promptRecords.map((p) => ({ ...p, promptSetId: setId as number })),
			);
		}

		onSaved();
		onClose();
	};

	if (!loaded) return null;

	return (
		<Dialog open onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>{editSetId ? "Edit" : "Create"} Prompt Set</DialogTitle>
			<DialogContent>
				<TextField
					label="Name"
					fullWidth
					value={name}
					onChange={(e) => setName(e.target.value)}
					sx={{ mb: 2, mt: 1 }}
				/>
				<TextField
					label="Description"
					fullWidth
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					sx={{ mb: 3 }}
				/>

				<Typography variant="h6" sx={{ mb: 1 }}>
					Prompts
				</Typography>

				{prompts.map((prompt, idx) => (
					<Box
						key={idx}
						sx={{
							mb: 2,
							p: 2,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 1,
						}}
					>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="subtitle2">Prompt {idx + 1}</Typography>
							{prompts.length > 1 && (
								<Button size="small" color="error" onClick={() => removePrompt(idx)}>
									Remove
								</Button>
							)}
						</Box>
						<TextField
							label="Prompt"
							fullWidth
							size="small"
							value={prompt.full}
							onChange={(e) => updatePrompt(idx, "full", e.target.value)}
							sx={{ mb: 1, mt: 1 }}
						/>
						<TextField
							label="Short label (optional — defaults to full prompt)"
							fullWidth
							size="small"
							value={prompt.short}
							onChange={(e) => updatePrompt(idx, "short", e.target.value)}
						/>
					</Box>
				))}

				<Button variant="outlined" onClick={addPrompt}>
					+ Add Prompt
				</Button>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={!name.trim() || !prompts.some((p) => p.full.trim())}
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PromptSetEditor;
