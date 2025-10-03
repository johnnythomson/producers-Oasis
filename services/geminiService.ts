// services/geminiService.ts

// --- REMOVE THESE LINES ---
// import { GoogleGenerativeAI } from '@google/generative-ai';
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// --- END REMOVAL ---

export async function generateTextWithGemini(prompt: string): Promise<string> {
  try {
    // --- NEW CODE: Call the Netlify Function as a proxy ---
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate text from proxy.');
    }

    const data = await response.json();
    return data.text; // The function sends back the generated text
    // --- END NEW CODE ---

  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw error;
  }
}
