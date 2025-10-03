// netlify/functions/gemini-proxy.js (UPDATED - refined for image analysis)
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    // Consider returning a 500 here if you want to fail fast for missing key
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize both a text model and a vision model
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const { prompt, type, imageData, mimeType } = JSON.parse(event.body);

    // Basic validation
    if (!prompt && type !== 'image_analysis') { // Prompt might be purely for analysis prompt
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
    } else if (type === 'image_analysis') { // Changed from image_generation to image_analysis
        if (!imageData || !mimeType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Image data and mime type are required for image analysis.' }),
                headers: { "Content-Type": "application/json" }
            };
        }

        const imageParts = [
            {
                inlineData: {
                    data: imageData, // Base64 string
                    mimeType: mimeType,
                },
            },
        ];

        const content = [];
        if (prompt) {
            content.push(prompt); // Add text prompt if provided
        }
        content.push(...imageParts); // Add image data

        const result = await visionModel.generateContent(content); // Use vision model
        responseText = (await result.response).text();
    } else { // Default to general text generation
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
