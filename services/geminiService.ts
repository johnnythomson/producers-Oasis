import { GoogleGenAI, Type } from "@google/genai";
import { Schedule } from "../types";

// Fix: Updated API key retrieval to use `process.env.API_KEY` to align with coding guidelines and resolve the TypeScript error with `import.meta.env`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChordProgression = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate 4 common but soulful lofi hip hop chord progressions. For each, provide the chords, the key, and a brief description of the mood. Format it clearly.'
        });
        return response.text;
    } catch (error) {
        console.error("Error generating chord progression:", error);
        return "Sorry, I couldn't generate a chord progression right now. Please try again later.";
    }
};

export const generateStudioVibeImage = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `A highly detailed, atmospheric, cinematic photo of a music production studio. The vibe is: ${prompt}. Focus on lighting and mood. No people.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating studio vibe image:", error);
        throw new Error("Failed to generate image. Please check your prompt and try again.");
    }
};

export const getCreativePrompt = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a single, short, and actionable creative prompt for a music producer experiencing creative block. The prompt should be unconventional and inspiring. Make it one sentence.'
        });
        return response.text;
    } catch (error) {
        console.error("Error getting creative prompt:", error);
        return "Sorry, I couldn't get a creative prompt right now. Try taking a 5-minute walk!";
    }
};

export const generateDailySchedule = async (goals: string): Promise<Schedule> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a balanced daily schedule for a music producer with these main goals: ${goals}. The schedule should start at 9:00 AM, include focused work blocks, creative time, and essential breaks for lunch and rest. The output must be a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A catchy title for the daily schedule." },
                        schedule: {
                            type: Type.ARRAY,
                            description: "The list of schedule items for the day.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "The start time of the task (e.g., '9:00 AM')." },
                                    task: { type: Type.STRING, description: "The description of the task or break." },
                                    duration: { type: Type.STRING, description: "How long the task will take (e.g., '45 mins')." },
                                    isBreak: { type: Type.BOOLEAN, description: "Whether this item is a break or a work task." }
                                },
                                required: ["time", "task", "duration", "isBreak"]
                            }
                        }
                    },
                    required: ["title", "schedule"]
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as Schedule;
    } catch (error) {
        console.error("Error generating daily schedule:", error);
        throw new Error("Failed to generate the schedule. Please ensure your goals are clear and try again.");
    }
};
