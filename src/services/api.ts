export const fetchPrompts = async (set: string) => {
    const response = await fetch(`/api/prompts/${set}`);
    return response.json();
};

export const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`/api/upload`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    return data.url; // Return uploaded image URL
};
