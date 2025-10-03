// services/geminiService.ts (UPDATED)

interface GeminiProxyResponse {
  text: string;
}

// Existing function for general text generation
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

// Existing function for Chord Progression generation
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

// Existing function for Studio Vibe Image (Image Analysis)
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

// NEW FUNCTION: getCreativePrompt
export async function getCreativePrompt(input: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Generate a creative prompt or idea related to music production, song writing, or sound design based on the following input: "${input}". Be concise and inspiring.`,
        type: 'creative_prompt' // Specify the type for the proxy function
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
