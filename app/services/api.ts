import apiClient from "./apiClient";
import { Prompt, PromptSet } from "@/app/types/types";

export const fetchPromptSets = async (): Promise<PromptSet[]> => {
	const response = await apiClient.get(`/promptSets`);
	return response.data;
};
export const fetchPrompts = async (id: string): Promise<{prompts: Prompt[]}> => {
	const response = await apiClient.get(`/promptSets/${id}`);
	return response.data;
};

export const uploadPhoto = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append("photo", file);

	const response = await apiClient.post(`/uploads`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});

	return response.data.url; // Return uploaded image URL
};
