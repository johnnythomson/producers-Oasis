import type { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import type { Schedule } from "../../types";

// Initialize the AI client securely on the server-side using environment variables.
// The API_KEY is never exposed to the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, payload } = JSON.parse(event.body || '{}');
    let result: any;

    switch (action) {
      case 'generateChordProgression':
        const chordResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate 4 common but soulful lofi hip hop chord progressions. For each, provide the chords, the key, and a brief description of the mood. Format it clearly.'
        });
        result = chordResponse.text;
        break;

      case 'generateStudioVibeImage':
        const { prompt } = payload;
        if (!prompt) throw new Error("Prompt is required for image generation.");
        const fullPrompt = `A highly detailed, atmospheric, cinematic photo of a music production studio. The vibe is: ${prompt}. Focus on lighting and mood. No people.`;
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
            result = `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
        break;

      case 'getCreativePrompt':
        const creativeResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a single, short, and actionable creative prompt for a music producer experiencing creative block. The prompt should be unconventional and inspiring. Make it one sentence.'
        });
        result = creativeResponse.text;
        break;
      
      case 'generateDailySchedule':
        const { goals } = payload;
        if (!goals) throw new Error("Goals are required for schedule generation.");
        const scheduleResponse = await ai.models.generateContent({
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
        result = JSON.parse(scheduleResponse.text.trim());
        break;

      default:
        throw new Error('Invalid action provided.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

export { handler };
