// services/geminiService.ts (UPDATED)

// You likely don't need GoogleGenerativeAI imported here anymore for client-side
// as it's handled by the Netlify Function.

interface GeminiProxyResponse {
  text: string;
}

// Existing function for general text generation
export async function generateTextWithGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type: 'general_text' }), // Add a type for clarity
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

// NEW FUNCTION: For Chord Progression generation
export async function generateChordProgression(genre: string): Promise<string> {
  try {
    // Call the same Netlify Function, but specify the type and use the genre as prompt
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: genre, type: 'chord_progression' }), // Send genre and type
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || 'Failed to generate chord progression from proxy.');
    }

    const data: GeminiProxyResponse = await response.json();
    // You might want to process the data.text here if Gemini gives you more than just chords
    return data.text;
  } catch (error) {
    console.error('Error generating chord progression:', error);
    throw error;
  }
}
