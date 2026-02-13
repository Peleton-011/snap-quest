export interface Prompt {
	fullPrompt: { [key: string]: string };
	shortPrompt: { [key: string]: string };
	promptSetId: number;
    id?: number;
}

export interface PromptSet {
	id?: number;
	name: string;
	description?: string;
}

export interface Tile {
	id: number;
	prompt: Prompt;
	completed: boolean;
	image: string | null;
	width: number;
	height: number;
}
