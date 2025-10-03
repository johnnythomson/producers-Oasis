// netlify/functions/gemini-proxy.js (UPDATED - for generateDailySchedule)
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

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

    if (!prompt && type !== 'image_analysis') {
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
    } else if (type === 'image_analysis') {
        if (!imageData || !mimeType) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Image data and mime type are required for image analysis.' }), headers: { "Content-Type": "application/json" } };
        }
        const imageParts = [{ inlineData: { data: imageData, mimeType: mimeType } }];
        const content = [];
        if (prompt) { content.push(prompt); }
        content.push(...imageParts);
        const result = await visionModel.generateContent(content);
        responseText = (await result.response).text();
    } else if (type === 'creative_prompt') {
        const result = await textModel.generateContent(prompt);
        responseText = (await result.response).text();
    } else if (type === 'daily_schedule') { // <-- NEW TYPE HANDLING
        const result = await textModel.generateContent(prompt); // The prompt from the client should be specific enough
        responseText = (await result.response).text();
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
