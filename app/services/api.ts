import apiClient from "./apiClient";

interface Prompt {
    fullPrompt: string;
    shortPrompt: string;
  }

export const fetchPrompts = async (set: string): Promise<Prompt[]> => {
    const response = await apiClient.get(`/prompts`, { params: { set } });
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
