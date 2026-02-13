// db.ts
import Dexie from "dexie";

class SnapQuestDB extends Dexie {
	photos!: 

	constructor() {
		super("SnapQuestDB");
		this.version(1).stores({
			photos: "++id, promptId, promptSetId",
			promptSets: "++id, name, isDefault",
			prompts: "++id, promptSetId",
		});
	}
}

const db = new Dexie("SnapQuestDB");
db.version(1).stores({
	photos: "++id, promptId, promptSetId",
	promptSets: "++id, name, isDefault",
	prompts: "++id, promptSetId",
});

export default db;
