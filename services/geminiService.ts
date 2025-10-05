import { ChordProgressionResponse, Progression, Schedule } from "../types";

// A helper function to call our secure Netlify Function backend.
// This acts as a proxy to the Gemini API.
async function callApi(action: string, payload?: any) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Forward the specific error message from the backend
    throw new Error(data.error || 'An error occurred while communicating with the server.');
  }

  return data.result;
}

export const generateChordProgression = async (): Promise<ChordProgressionResponse> => {
  try {
    return await callApi('generateChordProgression');
  } catch (error) {
    console.error("Error generating chord progression:", error);
    throw new Error("Sorry, I couldn't generate chord progressions right now. Please try again later.");
  }
};

export const generateMidiFile = async (progression: Progression): Promise<string> => {
    try {
        return await callApi('generateMidi', { progression });
    } catch (error) {
        console.error("Error generating MIDI file:", error);
        throw new Error("Failed to generate MIDI file. Please try again.");
    }
};

export const generateStudioVibeImage = async (prompt: string): Promise<string> => {
  try {
    return await callApi('generateStudioVibeImage', { prompt });
  } catch (error) {
    console.error("Error generating studio vibe image:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to generate image. Please check your prompt and try again.");
  }
};

export const getCreativePrompt = async (): Promise<string> => {
  try {
    return await callApi('getCreativePrompt');
  } catch (error) {
    console.error("Error getting creative prompt:", error);
    return "Sorry, I couldn't get a creative prompt right now. Try taking a 5-minute walk!";
  }
};

export const generateDailySchedule = async (goals: string): Promise<Schedule> => {
  try {
    return await callApi('generateDailySchedule', { goals });
  } catch (error) {
    console.error("Error generating daily schedule:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to generate the schedule. Please ensure your goals are clear and try again.");
  }
};
