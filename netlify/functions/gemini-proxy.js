// netlify/functions/gemini-proxy.js (UPDATED FOR IMAGE GENERATION)
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    // Consider returning a 500 here if you want to fail fast for missing key
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize both a text model and a vision (image) model
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // Use gemini-pro-vision for image input/multimodal

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const { prompt, type, imageData, mimeType } = JSON.parse(event.body); // <-- Capture imageData and mimeType

    if (!prompt && type !== 'image_generation') { // Prompt might be optional for some image types if just sending data
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Prompt is required for text generation types' }),
        headers: { "Content-Type": "application/json" }
      };
    }

    let responseText = '';

    if (type === 'chord_progression') {
      const fullPrompt = `Generate a chord progression in the style of ${prompt}. Provide only the chords, separated by commas.`;
      const result = await textModel.generateContent(fullPrompt);
      responseText = (await result.response).text();
    } else if (type === 'image_generation') {
      if (!imageData || !mimeType) {
          return {
              statusCode: 400,
              body: JSON.stringify({ message: 'Image data and mime type are required for image generation.' }),
              headers: { "Content-Type": "application/json" }
          };
      }
      // For image generation, Gemini Pro Vision takes image data as part of content
      // This assumes the prompt is describing *what to generate the image of*
      // If you mean "generate text based on an image input", that's different.
      // Let's assume for "generateStudioVibeImage" you want a *text response* describing an image vibe.
      const imageParts = [
          {
              inlineData: {
                  data: imageData, // Base64 string
                  mimeType: mimeType,
              },
          },
      ];

      // Use the prompt to describe what to do with the image
      const result = await visionModel.generateContent([prompt, ...imageParts]);
      responseText = (await result.response).text();

      // IMPORTANT: If "generateStudioVibeImage" means "generate a new image",
      // Gemini Pro Vision does NOT generate new images directly. It analyzes images.
      // If you need actual image generation (text-to-image), you'd need a different API (e.g., DALL-E, Stability AI).
      // For now, I'm assuming it means "analyze an image and describe its vibe".
      // If it means "generate an image based on text", please clarify.
    }
    else { // Default to general text generation
      const result = await textModel.generateContent(prompt);
      responseText = (await result.response).text();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: responseText }),
      headers: { "Content-Type": "application/json" }
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing your request', error: error.message }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
