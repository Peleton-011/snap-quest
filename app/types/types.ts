export interface Prompt {
	fullPrompt: { [key: string]: string };
	shortPrompt: { [key: string]: string };
}

export interface PromptSet {
	_id?: string;
	name: string;
	prompts: Prompt[];
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
