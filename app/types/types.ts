export interface Prompt {
	fullPrompt: { [key: string]: string };
	shortPrompt: { [key: string]: string };
}

export interface PromptSet {
	name: string;
	prompts: Prompt[];
	description?: string;
}