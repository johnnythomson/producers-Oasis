import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: The API_KEY is accessed from Netlify's environment variables
// It should NOT be hardcoded here, and should NOT be in your .env.local for client-side use.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or your specific Gemini model

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Prompt is required' }),
      };
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing your request', error: error.message }),
    };
  }
};
