// services/geminiService.ts (UPDATED)

// No need to import GoogleGenerativeAI here anymore for client-side
// as API calls are proxied through Netlify Functions.

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

// Restored function for Studio Vibe Image (Image Analysis)
export async function generateStudioVibeImage(
  prompt: string, // Text prompt to accompany the image, e.g., "What's the vibe of this studio?"
  imageData: string, // Base64 encoded image data
  mimeType: string // e.g., "image/jpeg", "image/png"
): Promise<string> {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        imageData: imageData,
        mimeType: mimeType,
        type: 'image_analysis' // Changed type to explicitly denote image analysis
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
