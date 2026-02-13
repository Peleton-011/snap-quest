// db.ts
import Dexie from "dexie";
import { promptsets as defaultPromptSets } from "../data/defaultPromptSets";

interface Photo {
	id: number;
	promptId: number;
	promptSetId: number;
	image: Blob;
}

interface PromptSet {
	id: number;
	name: string;
	description: string;
	isDefault: boolean;
}

interface Prompt {
	id: number;
	promptSetId: number;
	fullPrompt: { [key: string]: string };
	shortPrompt: { [key: string]: string };
}

class SnapQuestDB extends Dexie {
	photos!: Dexie.Table<Photo>;
	promptSets!: Dexie.Table<PromptSet>;
	prompts!: Dexie.Table<Prompt>;

	constructor() {
		super("SnapQuestDB");
		this.version(1).stores({
			photos: "++id, promptId, promptSetId",
			promptSets: "++id, name, isDefault",
			prompts: "++id, promptSetId",
		});
	}
}

const db = new SnapQuestDB();

db.on("populate", (tx) => {
	for (const set of defaultPromptSets) {
		tx.table("promptSets").add({
			name: set.name,
			description: set.description,
			isDefault: true,
		});

		for (const prompt of set.prompts) {
			tx.table("prompts").add({
				promptSetId: set._id, // or however you map the IDs
				fullPrompt: prompt.fullPrompt,
				shortPrompt: prompt.shortPrompt,
			});
		}
	}
});

export default db;
