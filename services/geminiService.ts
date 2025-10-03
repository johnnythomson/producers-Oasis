// services/geminiService.ts (UPDATED)
import { Schedule } from '../types'; // Make sure this import is correct

interface GeminiProxyResponse {
  text: string;
}

// ... (keep the other exported functions: generateTextWithGemini, generateChordProgression, generateStudioVibeImage, getCreativePrompt)

// NEW FUNCTION: generateDailySchedule
export async function generateDailySchedule(
  focus: string,
  hours: number,
  includeBreaks: boolean
): Promise<Schedule[]> {
  try {
    // Construct a detailed prompt to ensure Gemini returns a parsable JSON string
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

    // Attempt to parse the text response from Gemini into a Schedule array
    try {
        // Clean up the response from Gemini in case it includes markdown code fences
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
