// netlify/functions/gemini-proxy.js (UPDATED)
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const { prompt, type } = JSON.parse(event.body); // <-- Capture 'type'

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Prompt is required' }),
        headers: { "Content-Type": "application/json" }
      };
    }

    let fullPrompt = prompt;

    // Customize prompt based on type
    if (type === 'chord_progression') {
      fullPrompt = `Generate a chord progression in the style of ${prompt}. Provide only the chords, separated by commas.`;
    }
    // You can add more 'type' specific logic here if needed for other Gemini uses

    const result = await model.generateContent(fullPrompt); // Use fullPrompt
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
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
