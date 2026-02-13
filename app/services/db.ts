// db.ts
import Dexie from "dexie";

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
    fullPrompt: string;
    shortPrompt: string;
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

export default db;
