// services/geminiService.ts
import { Schedule } from '../types'; // Ensure this import path is correct for your project structure

interface GeminiProxyResponse {
  text: string;
}

// Function for general text generation (from App.tsx)
export async function generateTextWithGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type: 'general_text' }),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || 'Failed to generate text from proxy.');
    }
    const data: GeminiProxyResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw error;
  }
}

// Function for Chord Progression generation (from ChordGenerator.tsx)
export async function generateChordProgression(genre: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: genre, type: 'chord_progression' }),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || 'Failed to generate chord progression from proxy.');
    }
    const data: GeminiProxyResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating chord progression:', error);
    throw error;
  }
}

// Function for Studio Vibe Image Analysis (from VibeGenerator.tsx)
export async function generateStudioVibeImage(
  prompt: string,
  imageData: string,
  mimeType: string
): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        imageData: imageData,
        mimeType: mimeType,
        type: 'image_analysis'
      }),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || 'Failed to analyze image vibe from proxy.');
    }
    const data: GeminiProxyResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error analyzing studio vibe image:', error);
    throw error;
  }
}

// Function for getting a creative prompt (from BlockBreaker.tsx)
export async function getCreativePrompt(input: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Generate a creative prompt or idea related to music production, song writing, or sound design based on the following input: "${input}". Be concise and inspiring.`,
        type: 'creative_prompt'
      }),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || 'Failed to get creative prompt from proxy.');
    }
    const data: GeminiProxyResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error getting creative prompt:', error);
    throw error;
  }
}

// Function for generating a daily schedule (from SchedulePlanner.tsx)
export async function generateDailySchedule(
  focus: string,
  hours: number,
  includeBreaks: boolean
): Promise<Schedule[]> {
  try {
    const prompt = `
      Generate a daily schedule for a music producer with a focus on "${focus}" for a total of ${hours} hours.
      ${includeBreaks ? "Include breaks in the schedule." : "Do not include breaks."}
      Please return the schedule as a JSON array of objects, where each object has a "time" (string, e.g., "10:00 AM - 11:00 AM") and a "task" (string).
      Do not include any other text, just the raw JSON array.
      Example format: [{"time": "10:00 AM - 11:00 AM", "task": "Listen to reference tracks"}, {"time": "11:00 AM - 1:00 PM", "task": "Work on main melody"}]
    `;

    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        type: 'daily_schedule'
      }),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || 'Failed to generate schedule from proxy.');
    }
    const data: GeminiProxyResponse = await response.json();

    try {
        const cleanedText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const schedule = JSON.parse(cleanedText);
        return schedule as Schedule[];
    } catch (parseError) {
        console.error("Failed to parse schedule JSON from Gemini response:", data.text, parseError);
        throw new Error("The AI returned an invalid schedule format.");
    }
  } catch (error) {
    console.error('Error generating daily schedule:', error);
    throw error;
  }
}
