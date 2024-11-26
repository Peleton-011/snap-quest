// db.ts
import Dexie from "dexie";

export interface Photo {
    id: number;
    image: string;
}

class SnapQuestDB extends Dexie {
    photos!: Dexie.Table<Photo, number>;

    constructor() {
        super("SnapQuestDB");
        this.version(1).stores({
            photos: "++id, image",
        });
    }
}

export const db = new SnapQuestDB();
